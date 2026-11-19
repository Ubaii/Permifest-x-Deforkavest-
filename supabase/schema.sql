-- ============================================================================
-- Permifest × Devorkafest Platform - Database Schema
-- ============================================================================
-- PostgreSQL / Supabase schema for competition management platform
-- Based on PRD Draft v2
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & ACCESS
-- ============================================================================

-- Custom user profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  institution VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'peserta', 'juri', 'panitia', 'super_admin'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-role mapping (many-to-many, scoped by competition)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL, -- NULL = global role
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id, competition_id)
);

-- Identity verifications (optional per competition)
CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'ktm', 'kartu_pelajar'
  document_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. EVENTS & COMPETITIONS
-- ============================================================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'academic', 'non_academic'
  category VARCHAR(50) NOT NULL, -- 'esai', 'uiux', 'it_system_arch', 'pes', 'ml'
  participation_type VARCHAR(20) NOT NULL, -- 'individual', 'team'
  min_team_size INT DEFAULT 1,
  max_team_size INT DEFAULT 1,
  registration_fee DECIMAL(12, 2) DEFAULT 0,
  quota INT, -- NULL = unlimited
  form_fields JSONB DEFAULT '[]'::jsonb, -- Dynamic form fields config
  submission_config JSONB DEFAULT '{}'::jsonb, -- File types, max size, etc.
  requires_identity_verification BOOLEAN DEFAULT FALSE,
  allow_multiple_competitions BOOLEAN DEFAULT TRUE,
  registration_open_at TIMESTAMPTZ,
  registration_close_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  payment_qr_url TEXT, -- QR code image for payment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition stages (penyisihan, final)
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  stage_order INT NOT NULL DEFAULT 1,
  submission_open_at TIMESTAMPTZ,
  submission_close_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, slug)
);

-- ============================================================================
-- 3. REGISTRATIONS & PAYMENTS
-- ============================================================================

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  form_data JSONB DEFAULT '{}'::jsonb, -- Answers to dynamic form fields
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'payment_pending', 'verified', 'rejected', 'cancelled'
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  captain_id UUID NOT NULL REFERENCES users(id),
  invite_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'captain', 'member', 'substitute'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  proof_url TEXT, -- Uploaded payment proof
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'uploaded', 'verified', 'rejected'
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. SUBMISSIONS & JUDGING
-- ============================================================================

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  file_url TEXT, -- For file uploads (DOCX, PDF)
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size BIGINT,
  link_url TEXT, -- For Figma links etc
  additional_files JSONB DEFAULT '[]'::jsonb, -- For multiple files (diagrams etc)
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rubric criteria
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_score DECIMAL(5, 2) NOT NULL DEFAULT 100,
  weight DECIMAL(5, 4) NOT NULL DEFAULT 1.0, -- 0.0 to 1.0
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Judge assignments
CREATE TABLE IF NOT EXISTS judge_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(judge_id, submission_id)
);

-- Scores
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_assignment_id UUID NOT NULL REFERENCES judge_assignments(id) ON DELETE CASCADE,
  rubric_criteria_id UUID NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL,
  comment TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES users(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(judge_assignment_id, rubric_criteria_id)
);

-- Score changes (audit trail for emergency changes)
CREATE TABLE IF NOT EXISTS score_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score_id UUID NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  old_score DECIMAL(5, 2) NOT NULL,
  new_score DECIMAL(5, 2) NOT NULL,
  old_comment TEXT,
  new_comment TEXT,
  reason TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match results (for PES and ML)
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES stages(id),
  registration_id UUID REFERENCES registrations(id),
  team_id UUID REFERENCES teams(id),
  position INT, -- Final ranking position
  result_data JSONB DEFAULT '{}'::jsonb, -- Flexible result data
  notes TEXT,
  input_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ANNOUNCEMENTS & LOGS
-- ============================================================================

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL, -- NULL = global
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'payment', 'score', 'announcement', etc.
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_competition ON user_roles(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_submissions_registration ON submissions(registration_id);
CREATE INDEX IF NOT EXISTS idx_submissions_stage ON submissions(stage_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge ON judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_submission ON judge_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_scores_assignment ON scores(judge_assignment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_competitions_event ON competitions(event_id);
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON competitions(slug);
CREATE INDEX IF NOT EXISTS idx_stages_competition ON stages(competition_id);
CREATE INDEX IF NOT EXISTS idx_announcements_competition ON announcements(competition_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);

-- ============================================================================
-- SEED DATA: Default roles
-- ============================================================================

INSERT INTO roles (name, description) VALUES
  ('peserta', 'Peserta lomba - pelajar SMA sampai mahasiswa'),
  ('juri', 'Juri penilai karya lomba akademik'),
  ('panitia', 'Panitia pengelola lomba'),
  ('super_admin', 'Administrator platform dengan akses penuh')
ON CONFLICT (name) DO NOTHING;
