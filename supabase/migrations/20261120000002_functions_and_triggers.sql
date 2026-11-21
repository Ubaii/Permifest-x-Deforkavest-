-- ============================================================================
-- Migration 002: Functions, Triggers, and Views
-- Permifest x Deforkafest Platform
-- Matches docs/SCHEMA.md Section 3
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Function: Check User Role with Scope
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _competition uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND r.key = _role
      AND (
        ur.competition_id IS NULL OR
        _competition IS NULL OR
        ur.competition_id = _competition
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Trigger: Auto Create User & Assign 'peserta' Role on Signup
-- Registrasi publik SELALU menghasilkan peserta; abaikan metadata klien
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users(id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  -- Default role: peserta
  INSERT INTO public.user_roles(user_id, role_id)
  SELECT new.id, r.id
  FROM public.roles r
  WHERE r.key = 'peserta'
  ON CONFLICT (user_id, role_id, competition_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. Trigger: Guard Locked Scores
-- Blokir perubahan nilai setelah tahap dikunci, kecuali mode darurat aktif
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.guard_locked_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.judge_assignments ja
    JOIN public.submissions s ON s.id = ja.submission_id
    JOIN public.stages st ON st.id = s.stage_id
    WHERE ja.id = COALESCE(new.assignment_id, old.assignment_id)
      AND st.scores_locked_at IS NOT NULL
  )
  AND COALESCE(current_setting('app.break_glass', true), 'off') <> 'on' THEN
    RAISE EXCEPTION 'scores_locked: Nilai pada tahap ini telah dikunci dan tidak dapat diubah lagi';
  END IF;

  RETURN COALESCE(new, old);
END;
$$;

DROP TRIGGER IF EXISTS scores_guard ON public.scores;
CREATE TRIGGER scores_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.guard_locked_scores();

-- ----------------------------------------------------------------------------
-- 4. Function: Admin Emergency Score Override
-- Koreksi darurat oleh super admin: alasan wajib (min 10 karakter), catat ke score_changes & audit_logs
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_override_score(
  _score uuid,
  _new numeric,
  _comment text,
  _reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  s public.scores;
  c_id uuid;
BEGIN
  -- Pastikan hanya super_admin
  IF NOT public.has_role('super_admin') THEN
    RAISE EXCEPTION 'forbidden: Hanya super admin yang diizinkan melakukan koreksi darurat';
  END IF;

  -- Alasan wajib minimal 10 karakter
  IF length(trim(COALESCE(_reason, ''))) < 10 THEN
    RAISE EXCEPTION 'reason_required: Alasan perubahan nilai wajib diisi minimal 10 karakter';
  END IF;

  -- Kunci baris skor untuk update
  SELECT sc.*, ja.submission_id INTO s
  FROM public.scores sc
  JOIN public.judge_assignments ja ON ja.id = sc.assignment_id
  WHERE sc.id = _score
  FOR UPDATE;

  IF s.id IS NULL THEN
    RAISE EXCEPTION 'not_found: Data nilai tidak ditemukan';
  END IF;

  -- Ambil competition_id terkait untuk audit
  SELECT r.competition_id INTO c_id
  FROM public.submissions sub
  JOIN public.registrations r ON r.id = sub.registration_id
  WHERE sub.id = s.submission_id;

  -- Catat riwayat perubahan ke score_changes
  INSERT INTO public.score_changes(score_id, old_score, new_score, old_comment, new_comment, reason, changed_by)
  VALUES (s.id, s.score, _new, s.comment, _comment, _reason, (SELECT auth.uid()));

  -- Nyalakan break glass sementara dalam transaksi ini
  PERFORM set_config('app.break_glass', 'on', true);

  -- Perbarui nilai
  UPDATE public.scores
  SET score = _new,
      comment = _comment,
      updated_at = NOW()
  WHERE id = _score;

  -- Catat ke audit_logs
  INSERT INTO public.audit_logs(actor_id, actor_role, action, entity_type, entity_id, competition_id, payload)
  VALUES (
    (SELECT auth.uid()),
    'super_admin',
    'scores.override',
    'score',
    _score,
    c_id,
    jsonb_build_object('reason', _reason, 'old_score', s.score, 'new_score', _new, 'old_comment', s.comment, 'new_comment', _comment)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Helper Functions: Registration Window & Quota Check
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.registration_window_open(_competition_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.competitions c
    WHERE c.id = _competition_id
      AND c.is_published = TRUE
      AND (c.registration_opens_at IS NULL OR c.registration_opens_at <= NOW())
      AND (c.registration_closes_at IS NULL OR c.registration_closes_at >= NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.competition_has_quota(_competition_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    c.quota IS NULL OR
    (SELECT count(*) FROM public.registrations r WHERE r.competition_id = _competition_id AND r.status <> 'cancelled') < c.quota
  )
  FROM public.competitions c
  WHERE c.id = _competition_id;
$$;

-- ----------------------------------------------------------------------------
-- 6. View: Final Scores (v_final_scores)
-- Hanya menampilkan agregasi skor jika tahap telah dikunci (scores_locked_at IS NOT NULL)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_final_scores AS
SELECT
  s.registration_id,
  s.stage_id,
  r.competition_id,
  st.name AS stage_name,
  st.scores_locked_at,
  COUNT(DISTINCT ja.id) AS judges_count,
  ROUND(
    AVG(
      subquery.total_weighted_score
    )::numeric, 2
  ) AS final_score
FROM public.submissions s
JOIN public.stages st ON st.id = s.stage_id
JOIN public.registrations r ON r.id = s.registration_id
JOIN public.judge_assignments ja ON ja.submission_id = s.id AND ja.status = 'submitted'
JOIN (
  SELECT
    sc.assignment_id,
    SUM((sc.score / NULLIF(rc.max_score, 0)) * rc.weight) AS total_weighted_score
  FROM public.scores sc
  JOIN public.rubric_criteria rc ON rc.id = sc.criterion_id
  GROUP BY sc.assignment_id
) subquery ON subquery.assignment_id = ja.id
WHERE s.is_latest = TRUE
  AND st.scores_locked_at IS NOT NULL
GROUP BY s.registration_id, s.stage_id, r.competition_id, st.name, st.scores_locked_at;
