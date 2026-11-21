-- ============================================================================
-- Migration 003: Row Level Security (RLS) on all 20 tables
-- Permifest x Deforkafest Platform
-- Matches docs/SCHEMA.md Section 4
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on ALL tables
-- ----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------------------------------

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users_panitia_read" ON public.users
  FOR SELECT TO authenticated
  USING (
    public.has_role('panitia') AND
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.user_id = public.users.id
        AND public.has_role('panitia', r.competition_id)
    )
  );

CREATE POLICY "users_super_admin_all" ON public.users
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 3. ROLES & USER_ROLES
-- ----------------------------------------------------------------------------

CREATE POLICY "roles_read_all" ON public.roles
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "roles_super_admin_all" ON public.roles
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

CREATE POLICY "user_roles_read_own" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "user_roles_panitia_read" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role('panitia'));

CREATE POLICY "user_roles_super_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 4. IDENTITY VERIFICATIONS
-- ----------------------------------------------------------------------------

CREATE POLICY "identity_read_own" ON public.identity_verifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "identity_insert_own" ON public.identity_verifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "identity_panitia_read" ON public.identity_verifications
  FOR SELECT TO authenticated
  USING (public.has_role('panitia'));

CREATE POLICY "identity_panitia_update" ON public.identity_verifications
  FOR UPDATE TO authenticated
  USING (public.has_role('panitia'))
  WITH CHECK (public.has_role('panitia'));

CREATE POLICY "identity_super_admin_all" ON public.identity_verifications
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 5. EVENTS, THEMES, COMPETITIONS, STAGES
-- ----------------------------------------------------------------------------

-- Events
CREATE POLICY "events_read_all" ON public.events
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "events_super_admin_all" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Themes
CREATE POLICY "themes_read_all" ON public.themes
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "themes_super_admin_all" ON public.themes
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Competitions
CREATE POLICY "competitions_read_published" ON public.competitions
  FOR SELECT TO authenticated, anon
  USING (is_published = TRUE);

CREATE POLICY "competitions_panitia_read" ON public.competitions
  FOR SELECT TO authenticated
  USING (public.has_role('panitia', id));

CREATE POLICY "competitions_panitia_update" ON public.competitions
  FOR UPDATE TO authenticated
  USING (public.has_role('panitia', id))
  WITH CHECK (public.has_role('panitia', id));

CREATE POLICY "competitions_super_admin_all" ON public.competitions
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Stages
CREATE POLICY "stages_read_all" ON public.stages
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id AND (c.is_published = TRUE OR public.has_role('panitia', c.id) OR public.has_role('super_admin'))
    )
  );

CREATE POLICY "stages_panitia_update" ON public.stages
  FOR UPDATE TO authenticated
  USING (public.has_role('panitia', competition_id))
  WITH CHECK (public.has_role('panitia', competition_id));

CREATE POLICY "stages_super_admin_all" ON public.stages
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 6. TEAMS & TEAM MEMBERS
-- ----------------------------------------------------------------------------

CREATE POLICY "teams_read_own" ON public.teams
  FOR SELECT TO authenticated
  USING (
    captain_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = id AND tm.user_id = (SELECT auth.uid())) OR
    public.has_role('panitia', competition_id) OR
    public.has_role('super_admin')
  );

CREATE POLICY "teams_insert_captain" ON public.teams
  FOR INSERT TO authenticated
  WITH CHECK (captain_id = (SELECT auth.uid()));

CREATE POLICY "teams_update_captain" ON public.teams
  FOR UPDATE TO authenticated
  USING (captain_id = (SELECT auth.uid()) AND locked_at IS NULL)
  WITH CHECK (captain_id = (SELECT auth.uid()));

CREATE POLICY "teams_super_admin_all" ON public.teams
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Team Members
CREATE POLICY "team_members_read_own" ON public.team_members
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND (
      t.captain_id = (SELECT auth.uid()) OR
      EXISTS (SELECT 1 FROM public.team_members tm2 WHERE tm2.team_id = t.id AND tm2.user_id = (SELECT auth.uid())) OR
      public.has_role('panitia', t.competition_id) OR
      public.has_role('super_admin')
    ))
  );

CREATE POLICY "team_members_captain_insert" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.captain_id = (SELECT auth.uid()) AND t.locked_at IS NULL
    )
  );

CREATE POLICY "team_members_captain_delete" ON public.team_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.captain_id = (SELECT auth.uid()) AND t.locked_at IS NULL
    )
  );

CREATE POLICY "team_members_super_admin_all" ON public.team_members
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 7. REGISTRATIONS & PAYMENTS
-- ----------------------------------------------------------------------------

-- Registrations
CREATE POLICY "registrations_read_own" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = public.registrations.team_id AND tm.user_id = (SELECT auth.uid())
    ) OR
    public.has_role('panitia', competition_id) OR
    public.has_role('super_admin')
  );

CREATE POLICY "registrations_insert_own" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    public.registration_window_open(competition_id)
  );

CREATE POLICY "registrations_update_own" ON public.registrations
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid()) AND
    status = 'draft' AND
    public.registration_window_open(competition_id)
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    public.registration_window_open(competition_id)
  );

CREATE POLICY "registrations_panitia_update" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.has_role('panitia', competition_id))
  WITH CHECK (public.has_role('panitia', competition_id));

CREATE POLICY "registrations_super_admin_all" ON public.registrations
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Payments
CREATE POLICY "payments_owner_read" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND (
        r.user_id = (SELECT auth.uid()) OR
        EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = r.team_id AND tm.user_id = (SELECT auth.uid()))
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND public.has_role('panitia', r.competition_id)
    ) OR
    public.has_role('super_admin')
  );

CREATE POLICY "payments_owner_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "payments_owner_update" ON public.payments
  FOR UPDATE TO authenticated
  USING (
    status IN ('awaiting_proof', 'rejected') AND
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND r.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "payments_panitia_update" ON public.payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND public.has_role('panitia', r.competition_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND public.has_role('panitia', r.competition_id)
    )
  );

CREATE POLICY "payments_super_admin_all" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 8. SUBMISSIONS
-- ----------------------------------------------------------------------------

CREATE POLICY "submissions_read_access" ON public.submissions
  FOR SELECT TO authenticated
  USING (
    -- Peserta pemilik
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND (
        r.user_id = (SELECT auth.uid()) OR
        EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = r.team_id AND tm.user_id = (SELECT auth.uid()))
      )
    ) OR
    -- Juri yang ditugaskan
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      WHERE ja.submission_id = public.submissions.id AND ja.judge_id = (SELECT auth.uid())
    ) OR
    -- Panitia lomba terkait
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND public.has_role('panitia', r.competition_id)
    ) OR
    -- Super admin
    public.has_role('super_admin')
  );

CREATE POLICY "submissions_insert_owner" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r
      JOIN public.stages st ON st.id = stage_id
      WHERE r.id = registration_id
        AND r.user_id = (SELECT auth.uid())
        AND (st.submission_deadline IS NULL OR st.submission_deadline >= NOW())
    )
  );

CREATE POLICY "submissions_super_admin_all" ON public.submissions
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 9. RUBRIC CRITERIA
-- ----------------------------------------------------------------------------

CREATE POLICY "rubric_read_access" ON public.rubric_criteria
  FOR SELECT TO authenticated
  USING (
    public.has_role('juri', competition_id) OR
    public.has_role('panitia', competition_id) OR
    public.has_role('super_admin')
  );

CREATE POLICY "rubric_panitia_all" ON public.rubric_criteria
  FOR ALL TO authenticated
  USING (public.has_role('panitia', competition_id))
  WITH CHECK (public.has_role('panitia', competition_id));

CREATE POLICY "rubric_super_admin_all" ON public.rubric_criteria
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 10. JUDGE ASSIGNMENTS & SCORES
-- Peserta TIDAK PERNAH memiliki akses baca/tulis ke scores
-- ----------------------------------------------------------------------------

-- Judge Assignments
CREATE POLICY "judge_assignments_juri_read" ON public.judge_assignments
  FOR SELECT TO authenticated
  USING (judge_id = (SELECT auth.uid()));

CREATE POLICY "judge_assignments_juri_update" ON public.judge_assignments
  FOR UPDATE TO authenticated
  USING (judge_id = (SELECT auth.uid()))
  WITH CHECK (judge_id = (SELECT auth.uid()));

CREATE POLICY "judge_assignments_panitia_all" ON public.judge_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions sub
      JOIN public.registrations r ON r.id = sub.registration_id
      WHERE sub.id = submission_id AND public.has_role('panitia', r.competition_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions sub
      JOIN public.registrations r ON r.id = sub.registration_id
      WHERE sub.id = submission_id AND public.has_role('panitia', r.competition_id)
    )
  );

CREATE POLICY "judge_assignments_super_admin_all" ON public.judge_assignments
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Scores
CREATE POLICY "scores_juri_read" ON public.scores
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      WHERE ja.id = assignment_id AND ja.judge_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "scores_juri_insert" ON public.scores
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      JOIN public.submissions s ON s.id = ja.submission_id
      JOIN public.stages st ON st.id = s.stage_id
      WHERE ja.id = assignment_id
        AND ja.judge_id = (SELECT auth.uid())
        AND st.scores_locked_at IS NULL
    )
  );

CREATE POLICY "scores_juri_update" ON public.scores
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      JOIN public.submissions s ON s.id = ja.submission_id
      JOIN public.stages st ON st.id = s.stage_id
      WHERE ja.id = assignment_id
        AND ja.judge_id = (SELECT auth.uid())
        AND st.scores_locked_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      JOIN public.submissions s ON s.id = ja.submission_id
      JOIN public.stages st ON st.id = s.stage_id
      WHERE ja.id = assignment_id
        AND ja.judge_id = (SELECT auth.uid())
        AND st.scores_locked_at IS NULL
    )
  );

CREATE POLICY "scores_panitia_read" ON public.scores
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      JOIN public.submissions s ON s.id = ja.submission_id
      JOIN public.registrations r ON r.id = s.registration_id
      WHERE ja.id = assignment_id AND public.has_role('panitia', r.competition_id)
    )
  );

CREATE POLICY "scores_super_admin_all" ON public.scores
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- Score Changes (Read only for panitia and super_admin; insert via security definer function)
CREATE POLICY "score_changes_panitia_read" ON public.score_changes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scores sc
      JOIN public.judge_assignments ja ON ja.id = sc.assignment_id
      JOIN public.submissions s ON s.id = ja.submission_id
      JOIN public.registrations r ON r.id = s.registration_id
      WHERE sc.id = score_id AND public.has_role('panitia', r.competition_id)
    ) OR public.has_role('super_admin')
  );

-- ----------------------------------------------------------------------------
-- 11. MATCH RESULTS (Esports)
-- ----------------------------------------------------------------------------

CREATE POLICY "match_results_public_read" ON public.match_results
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.stages st
      WHERE st.id = stage_id AND st.results_published_at IS NOT NULL AND st.results_published_at <= NOW()
    ) OR public.has_role('panitia', competition_id) OR public.has_role('super_admin')
  );

CREATE POLICY "match_results_panitia_all" ON public.match_results
  FOR ALL TO authenticated
  USING (public.has_role('panitia', competition_id))
  WITH CHECK (public.has_role('panitia', competition_id));

CREATE POLICY "match_results_super_admin_all" ON public.match_results
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 12. ANNOUNCEMENTS
-- ----------------------------------------------------------------------------

CREATE POLICY "announcements_read_published" ON public.announcements
  FOR SELECT TO authenticated, anon
  USING (
    (published_at IS NOT NULL AND published_at <= NOW()) OR
    (competition_id IS NOT NULL AND public.has_role('panitia', competition_id)) OR
    public.has_role('super_admin')
  );

CREATE POLICY "announcements_panitia_all" ON public.announcements
  FOR ALL TO authenticated
  USING (competition_id IS NOT NULL AND public.has_role('panitia', competition_id))
  WITH CHECK (competition_id IS NOT NULL AND public.has_role('panitia', competition_id));

CREATE POLICY "announcements_super_admin_all" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGS
-- ----------------------------------------------------------------------------

CREATE POLICY "audit_logs_panitia_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    competition_id IS NOT NULL AND public.has_role('panitia', competition_id)
  );

CREATE POLICY "audit_logs_super_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role('super_admin'));

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = (SELECT auth.uid()) OR public.has_role('super_admin'));
