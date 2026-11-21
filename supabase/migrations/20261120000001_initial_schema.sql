-- ============================================================================
-- Migration 001: Initial Schema (20 Tables, Enums, Constraints, Indexes)
-- Permifest x Deforkafest Platform
-- Matches docs/SCHEMA.md
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('peserta', 'juri', 'panitia', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.competition_kind AS ENUM ('academic', 'esport');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.participation AS ENUM ('individual', 'team');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('awaiting_proof', 'pending_review', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.assignment_status AS ENUM ('assigned', 'in_progress', 'submitted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.team_role AS ENUM ('captain', 'member', 'reserve');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_kind AS ENUM ('file', 'link');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 1. Pengguna dan Akses
-- ----------------------------------------------------------------------------

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  institution VARCHAR(255),
  phone VARCHAR(20),
  education_level VARCHAR(50), -- 'sma_smk', 'mahasiswa', 'umum'
  avatar_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key public.app_role NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Event dan Lomba
-- ----------------------------------------------------------------------------

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  settings JSONB NOT NULL DEFAULT '{
    "leaderboard_mode": "after_release",
    "allow_multiple_competitions": true,
    "panitia_scope": "per_competition",
    "email_announcements": false,
    "role_conflict_policy": "block_assignment"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Themes
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subtheme TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitions
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  kind public.competition_kind NOT NULL,
  participation public.participation NOT NULL,
  description TEXT,
  fee_idr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quota INT,
  team_min INT NOT NULL DEFAULT 1,
  team_max INT NOT NULL DEFAULT 1,
  reserve_max INT NOT NULL DEFAULT 0,
  requires_identity BOOLEAN NOT NULL DEFAULT FALSE,
  registration_opens_at TIMESTAMPTZ,
  registration_closes_at TIMESTAMPTZ,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  submission_config JSONB NOT NULL DEFAULT '{"accepts": ["pdf", "docx"], "max_mb": 15}'::jsonb,
  scoring_config JSONB NOT NULL DEFAULT '{"judges_per_submission": 2, "blind": false, "aggregation": "mean"}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  payment_qr_path TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_registration_window CHECK (
    registration_opens_at IS NULL OR
    registration_closes_at IS NULL OR
    registration_opens_at < registration_closes_at
  )
);

-- User Roles (scoped by competition, NULL = global)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id, competition_id)
);

-- Identity Verifications
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'ktm', 'kartu_pelajar', etc.
  storage_path TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stages (penyisihan, final)
CREATE TABLE IF NOT EXISTS public.stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL, -- 'penyisihan', 'final'
  name VARCHAR(255) NOT NULL,
  position INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ,
  submission_deadline TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  scores_locked_at TIMESTAMPTZ,
  scores_locked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  results_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(competition_id, position)
);

-- ----------------------------------------------------------------------------
-- 3. Pendaftaran dan Pembayaran
-- ----------------------------------------------------------------------------

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  captain_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  invite_code VARCHAR(32) NOT NULL UNIQUE,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(competition_id, name)
);

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role public.team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'registered', 'cancelled', 'disqualified'
  current_stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
  advanced BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE UNIQUE,
  amount_idr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status public.payment_status NOT NULL DEFAULT 'awaiting_proof',
  proof_path TEXT,
  proof_uploaded_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  attempt INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Karya dan Penilaian
-- ----------------------------------------------------------------------------

-- Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT TRUE,
  kind public.submission_kind NOT NULL DEFAULT 'file',
  storage_path TEXT,
  original_filename VARCHAR(255),
  mime VARCHAR(100),
  size_bytes BIGINT,
  link_url TEXT,
  additional_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(registration_id, stage_id, version)
);

-- Rubric Criteria
CREATE TABLE IF NOT EXISTS public.rubric_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
  weight NUMERIC(5, 2) NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Judge Assignments
CREATE TABLE IF NOT EXISTS public.judge_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status public.assignment_status NOT NULL DEFAULT 'assigned',
  general_comment TEXT,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(submission_id, judge_id)
);

-- Scores
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.judge_assignments(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, criterion_id),
  CONSTRAINT chk_score_non_negative CHECK (score >= 0)
);

-- Score Changes (Audit trail - Append-only)
CREATE TABLE IF NOT EXISTS public.score_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  old_score NUMERIC(5, 2) NOT NULL,
  new_score NUMERIC(5, 2) NOT NULL,
  old_comment TEXT,
  new_comment TEXT,
  reason TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_reason_length CHECK (char_length(trim(reason)) >= 10)
);

-- Match Results (PES & ML e-sports)
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  placement INT NOT NULL,
  note TEXT,
  entered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(competition_id, stage_id, placement)
);

-- ----------------------------------------------------------------------------
-- 5. Publikasi dan Audit
-- ----------------------------------------------------------------------------

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs (Append-only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revoke update and delete on append-only tables
REVOKE UPDATE, DELETE ON public.audit_logs FROM PUBLIC, authenticated, anon;
REVOKE UPDATE, DELETE ON public.score_changes FROM PUBLIC, authenticated, anon;

-- ----------------------------------------------------------------------------
-- 6. Indexes
-- ----------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_latest
  ON public.submissions(registration_id, stage_id) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_comp ON public.user_roles(competition_id);

CREATE INDEX IF NOT EXISTS idx_competitions_event ON public.competitions(event_id);
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON public.competitions(slug);
CREATE INDEX IF NOT EXISTS idx_stages_competition ON public.stages(competition_id);

CREATE INDEX IF NOT EXISTS idx_teams_competition ON public.teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_comp_status ON public.registrations(competition_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_registration ON public.payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_submissions_reg_stage ON public.submissions(registration_id, stage_id);

CREATE INDEX IF NOT EXISTS idx_rubric_comp_stage ON public.rubric_criteria(competition_id, stage_id);

CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge_status ON public.judge_assignments(judge_id, status);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_sub ON public.judge_assignments(submission_id);

CREATE INDEX IF NOT EXISTS idx_scores_assignment ON public.scores(assignment_id);
CREATE INDEX IF NOT EXISTS idx_scores_criterion ON public.scores(criterion_id);

CREATE INDEX IF NOT EXISTS idx_match_results_comp ON public.match_results(competition_id);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_comp ON public.announcements(competition_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
