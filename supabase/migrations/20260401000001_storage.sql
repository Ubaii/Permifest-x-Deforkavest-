-- ==============================================================================
-- PERMIFEST x DEFORKAFEST 2026 - STORAGE BUCKETS & RLS POLICIES
-- ==============================================================================
-- 4 Buckets:
-- 1. payment-proofs (Privat, Maks 5 MB, JPG/PNG/PDF)
-- 2. submissions    (Privat, Maks 25 MB, PDF/DOCX/ZIP)
-- 3. identity-docs  (Privat, Maks 5 MB, JPG/PNG/PDF)
-- 4. public-assets  (Publik, Maks 10 MB, PDF/JPG/PNG/SVG)
-- ==============================================================================

-- 1. Buat Buckets di tabel storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'payment-proofs', 
    'payment-proofs', 
    false, 
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'submissions', 
    'submissions', 
    false, 
    26214400, -- 25 MB
    ARRAY[
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/zip', 
      'application/x-zip-compressed'
    ]
  ),
  (
    'identity-docs', 
    'identity-docs', 
    false, 
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'public-assets', 
    'public-assets', 
    true, 
    10485760, -- 10 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Aktifkan Row Level Security pada storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Helper function: cek apakah user adalah staf (panitia atau super_admin)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('panitia', 'super_admin')
  );
$$;

-- Helper function: cek apakah user adalah juri yang ditugaskan untuk submission ini
CREATE OR REPLACE FUNCTION public.is_assigned_judge_for_submission(p_submission_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.submission_id = s.id
    WHERE s.storage_path = p_submission_path
      AND ja.judge_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------------------------
-- BUCKET 1: payment-proofs
-- Path: {user_id}/{registration_id}/{uuid}.{ext}
-- ------------------------------------------------------------------------------

-- DROP policies jika sudah ada sebelumnya
DROP POLICY IF EXISTS "payment_proofs_insert_owner" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_select_owner_or_staff" ON storage.objects;

-- INSERT: Hanya pemilik (user_id di awal path) yang bisa upload bukti bayarnya
CREATE POLICY "payment_proofs_insert_owner"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: Pemilik atau panitia/super_admin bisa melihat bukti bayar
CREATE POLICY "payment_proofs_select_owner_or_staff"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_staff()
  )
);

-- ------------------------------------------------------------------------------
-- BUCKET 2: submissions
-- Path: {competition_id}/{registration_id}/{stage_id}/{uuid}.{ext}
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "submissions_insert_registered" ON storage.objects;
DROP POLICY IF EXISTS "submissions_select_owner_judge_staff" ON storage.objects;

-- INSERT: Peserta terdaftar pada pendaftaran terkait bisa mengunggah berkas karya
CREATE POLICY "submissions_insert_registered"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id::text = (storage.foldername(name))[2]
        AND (r.user_id = auth.uid() OR public.is_staff())
    )
  )
);

-- SELECT: Pemilik karya, dewan juri yang ditugaskan, atau panitia/super_admin
CREATE POLICY "submissions_select_owner_judge_staff"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    -- Pemilik pendaftaran
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id::text = (storage.foldername(name))[2]
        AND r.user_id = auth.uid()
    )
    -- Atau Dewan Juri yang ditugaskan
    OR public.is_assigned_judge_for_submission(name)
    -- Atau Panitia / Admin
    OR public.is_staff()
  )
);

-- ------------------------------------------------------------------------------
-- BUCKET 3: identity-docs
-- Path: {user_id}/{uuid}.{ext}
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "identity_docs_insert_owner" ON storage.objects;
DROP POLICY IF EXISTS "identity_docs_select_owner_or_staff" ON storage.objects;

CREATE POLICY "identity_docs_insert_owner"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'identity-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "identity_docs_select_owner_or_staff"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_staff()
  )
);

-- ------------------------------------------------------------------------------
-- BUCKET 4: public-assets
-- Path: assets/... atau guidebooks/...
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_assets_select_all" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_insert_staff" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_update_staff" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_delete_staff" ON storage.objects;

-- Siapa saja (termasuk anonim / publik) bisa membaca file di public-assets
CREATE POLICY "public_assets_select_all"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-assets');

-- Hanya panitia & super admin yang bisa menambah, mengubah, atau menghapus aset publik
CREATE POLICY "public_assets_insert_staff"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND public.is_staff()
);

CREATE POLICY "public_assets_update_staff"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND public.is_staff()
);

CREATE POLICY "public_assets_delete_staff"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND public.is_staff()
);
