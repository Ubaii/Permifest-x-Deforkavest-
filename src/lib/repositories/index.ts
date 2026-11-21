import {
  ICompetitionRepository,
  IRegistrationRepository,
  ISubmissionRepository,
  IScoreRepository,
  IUserRepository,
} from './types';
import {
  MockCompetitionRepository,
  MockRegistrationRepository,
  MockSubmissionRepository,
  MockScoreRepository,
  MockUserRepository,
} from './mock';
import {
  SupabaseCompetitionRepository,
  SupabaseRegistrationRepository,
  SupabaseSubmissionRepository,
  SupabaseScoreRepository,
  SupabaseUserRepository,
} from './supabase';

/**
 * Memeriksa apakah Supabase URL dan Anon Key sudah terisi konfigurasi asli
 */
export function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  if (url.includes('placeholder.supabase.co') || anonKey.includes('placeholder-anon-key')) {
    return false;
  }
  return true;
}

// Singletons Repository Provider
const mockCompRepo = new MockCompetitionRepository();
const mockRegRepo = new MockRegistrationRepository();
const mockSubRepo = new MockSubmissionRepository();
const mockScoreRepo = new MockScoreRepository();
const mockUserRepo = new MockUserRepository();

const supaCompRepo = new SupabaseCompetitionRepository();
const supaRegRepo = new SupabaseRegistrationRepository();
const supaSubRepo = new SupabaseSubmissionRepository();
const supaScoreRepo = new SupabaseScoreRepository();
const supaUserRepo = new SupabaseUserRepository();

export const competitionRepository: ICompetitionRepository = isSupabaseLive()
  ? supaCompRepo
  : mockCompRepo;

export const registrationRepository: IRegistrationRepository = isSupabaseLive()
  ? supaRegRepo
  : mockRegRepo;

export const submissionRepository: ISubmissionRepository = isSupabaseLive()
  ? supaSubRepo
  : mockSubRepo;

export const scoreRepository: IScoreRepository = isSupabaseLive()
  ? supaScoreRepo
  : mockScoreRepo;

export const userRepository: IUserRepository = isSupabaseLive()
  ? supaUserRepo
  : mockUserRepo;

export * from './types';
