-- ============================================================================
-- Migration 004: Storage Buckets & Policies
-- Permifest x Deforkafest Platform
-- Matches docs/SCHEMA.md Section 5
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create Buckets
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('payment-proofs', 'payment-proofs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('submissions', 'submissions', false, 26214400, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/zip']),
  ('identity-docs', 'identity-docs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('public-assets', 'public-assets', true, 10485760, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. Storage Policies for 'payment-proofs'
-- Path convention: {user_id}/{registration_id}/{uuid}.{ext}
-- ----------------------------------------------------------------------------

CREATE POLICY "payment_proofs_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text OR
      EXISTS (
        SELECT 1 FROM public.registrations r
        WHERE r.id::text = (storage.foldername(name))[2]
          AND public.has_role('panitia', r.competition_id)
      ) OR
      public.has_role('super_admin')
    )
  );

CREATE POLICY "payment_proofs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ----------------------------------------------------------------------------
-- 3. Storage Policies for 'submissions'
-- Path convention: {competition_id}/{registration_id}/{stage_id}/{uuid}.{ext}
-- ----------------------------------------------------------------------------

CREATE POLICY "submissions_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions' AND (
      -- Peserta pemilik (registrasi milik user)
      EXISTS (
        SELECT 1 FROM public.registrations r
        WHERE r.id::text = (storage.foldername(name))[2]
          AND (
            r.user_id = (SELECT auth.uid()) OR
            EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = r.team_id AND tm.user_id = (SELECT auth.uid()))
          )
      ) OR
      -- Juri yang ditugaskan ke submission dengan path ini
      EXISTS (
        SELECT 1 FROM public.submissions sub
        JOIN public.judge_assignments ja ON ja.submission_id = sub.id
        WHERE sub.storage_path = name AND ja.judge_id = (SELECT auth.uid())
      ) OR
      -- Panitia lomba terkait
      public.has_role('panitia', ((storage.foldername(name))[1])::uuid) OR
      -- Super admin
      public.has_role('super_admin')
    )
  );

CREATE POLICY "submissions_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions' AND
    EXISTS (
      SELECT 1 FROM public.registrations r
      JOIN public.stages st ON st.id::text = (storage.foldername(name))[3]
      WHERE r.id::text = (storage.foldername(name))[2]
        AND r.user_id = (SELECT auth.uid())
        AND (st.submission_deadline IS NULL OR st.submission_deadline >= NOW())
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Storage Policies for 'identity-docs'
-- Path convention: {user_id}/{uuid}.{ext}
-- ----------------------------------------------------------------------------

CREATE POLICY "identity_docs_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-docs' AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text OR
      public.has_role('panitia') OR
      public.has_role('super_admin')
    )
  );

CREATE POLICY "identity_docs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-docs' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ----------------------------------------------------------------------------
-- 5. Storage Policies for 'public-assets'
-- ----------------------------------------------------------------------------

CREATE POLICY "public_assets_read" ON storage.objects
  FOR SELECT TO public, authenticated, anon
  USING (bucket_id = 'public-assets');

CREATE POLICY "public_assets_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'public-assets' AND public.has_role('super_admin'))
  WITH CHECK (bucket_id = 'public-assets' AND public.has_role('super_admin'));
