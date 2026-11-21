import {
  Competition,
  Registration,
  Submission,
  JudgeAssignment,
  User,
  UserRole,
} from '@/lib/types';

export interface ICompetitionRepository {
  getAll(): Promise<Competition[]>;
  getBySlug(slug: string): Promise<Competition | null>;
  getById(id: string): Promise<Competition | null>;
  create(data: Omit<Competition, 'id' | 'created_at' | 'updated_at'>): Promise<Competition>;
  update(id: string, data: Partial<Competition>): Promise<Competition>;
  delete(id: string): Promise<void>;
}

export interface IRegistrationRepository {
  getAll(filters?: { competitionId?: string; status?: string }): Promise<Registration[]>;
  getByUserId(userId: string): Promise<Registration[]>;
  getById(id: string): Promise<Registration | null>;
  create(data: {
    competition_id: string;
    user_id: string;
    form_data?: Record<string, unknown>;
  }): Promise<Registration>;
  updatePayment(
    registrationId: string,
    payload: {
      status: 'pending' | 'uploaded' | 'verified' | 'rejected';
      proof_url?: string;
      proof_name?: string;
      rejection_reason?: string;
    }
  ): Promise<Registration>;
  delete(id: string): Promise<void>;
}

export interface ISubmissionRepository {
  getAll(filters?: { competitionId?: string; stageId?: string }): Promise<Submission[]>;
  getByRegistrationId(registrationId: string): Promise<Submission[]>;
  getById(id: string): Promise<Submission | null>;
  create(data: {
    registration_id: string;
    stage_id: string;
    file_name?: string;
    file_url?: string;
    link_url?: string;
    notes?: string;
  }): Promise<Submission>;
  delete(id: string): Promise<void>;
}

export interface IScoreRepository {
  getAssignmentsByJudge(judgeId: string): Promise<JudgeAssignment[]>;
  submitScore(
    assignmentId: string,
    scores: Array<{ criteriaId: string; score: number; comment?: string }>
  ): Promise<void>;
  lockScores(competitionId: string): Promise<void>;
}

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getAll(filters?: { role?: UserRole }): Promise<User[]>;
  updateRole(userId: string, newRole: UserRole): Promise<User>;
}
