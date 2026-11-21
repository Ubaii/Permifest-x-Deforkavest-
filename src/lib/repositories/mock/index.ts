import {
  Competition,
  Registration,
  Submission,
  JudgeAssignment,
  User,
  UserRole,
} from '@/lib/types';
import { INITIAL_COMPETITIONS } from '@/lib/constants';
import {
  MOCK_REGISTRATIONS,
  MOCK_SUBMISSIONS,
  MOCK_JUDGE_ASSIGNMENTS,
  MOCK_USERS,
} from '@/lib/mock-data';
import {
  ICompetitionRepository,
  IRegistrationRepository,
  ISubmissionRepository,
  IScoreRepository,
  IUserRepository,
} from '../types';

let mockCompetitions: Competition[] = [...INITIAL_COMPETITIONS];
let mockRegistrations: Registration[] = [...MOCK_REGISTRATIONS];
let mockSubmissions: Submission[] = [...MOCK_SUBMISSIONS];
let mockAssignments: JudgeAssignment[] = [...MOCK_JUDGE_ASSIGNMENTS];
let mockUsers: User[] = [...MOCK_USERS];

export class MockCompetitionRepository implements ICompetitionRepository {
  async getAll(): Promise<Competition[]> {
    return [...mockCompetitions];
  }

  async getBySlug(slug: string): Promise<Competition | null> {
    const found = mockCompetitions.find((c) => c.slug === slug);
    return found ? { ...found } : null;
  }

  async getById(id: string): Promise<Competition | null> {
    const found = mockCompetitions.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async create(data: Omit<Competition, 'id' | 'created_at' | 'updated_at'>): Promise<Competition> {
    const newComp: Competition = {
      ...data,
      id: `comp-${Date.now()}`,
    };
    mockCompetitions.unshift(newComp);
    return { ...newComp };
  }

  async update(id: string, data: Partial<Competition>): Promise<Competition> {
    const idx = mockCompetitions.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Kompetisi tidak ditemukan');
    mockCompetitions[idx] = {
      ...mockCompetitions[idx],
      ...data,
    };
    return { ...mockCompetitions[idx] };
  }

  async delete(id: string): Promise<void> {
    mockCompetitions = mockCompetitions.filter((c) => c.id !== id);
  }
}

export class MockRegistrationRepository implements IRegistrationRepository {
  async getAll(filters?: { competitionId?: string; status?: string }): Promise<Registration[]> {
    return mockRegistrations.filter((r) => {
      if (filters?.competitionId && r.competition_id !== filters.competitionId) return false;
      if (filters?.status && r.status !== filters.status) return false;
      return true;
    });
  }

  async getByUserId(userId: string): Promise<Registration[]> {
    return mockRegistrations.filter((r) => r.user_id === userId);
  }

  async getById(id: string): Promise<Registration | null> {
    const found = mockRegistrations.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  async create(data: {
    competition_id: string;
    user_id: string;
    form_data?: Record<string, unknown>;
  }): Promise<Registration> {
    const comp = mockCompetitions.find((c) => c.id === data.competition_id);
    const user = mockUsers.find((u) => u.id === data.user_id);

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      competition_id: data.competition_id,
      competition: comp,
      user_id: data.user_id,
      user: user,
      status: 'payment_pending',
      form_data: data.form_data || {},
      payment: {
        id: `pay-${Date.now()}`,
        registration_id: `reg-${Date.now()}`,
        amount: comp?.registration_fee || 0,
        status: 'pending',
      },
      registered_at: new Date().toISOString(),
    };

    mockRegistrations.unshift(newReg);
    return { ...newReg };
  }

  async updatePayment(
    registrationId: string,
    payload: {
      status: 'pending' | 'uploaded' | 'verified' | 'rejected';
      proof_url?: string;
      proof_name?: string;
      rejection_reason?: string;
    }
  ): Promise<Registration> {
    const idx = mockRegistrations.findIndex((r) => r.id === registrationId);
    if (idx === -1) throw new Error('Registrasi tidak ditemukan');

    const reg = mockRegistrations[idx];
    const updatedPayment = {
      ...reg.payment!,
      status: payload.status,
      proof_url: payload.proof_url ?? reg.payment?.proof_url,
      proof_name: payload.proof_name ?? reg.payment?.proof_name,
      rejection_reason: payload.rejection_reason ?? reg.payment?.rejection_reason,
      uploaded_at: payload.status === 'uploaded' ? new Date().toISOString() : reg.payment?.uploaded_at,
      verified_at: payload.status === 'verified' ? new Date().toISOString() : reg.payment?.verified_at,
    };

    mockRegistrations[idx] = {
      ...reg,
      status: payload.status === 'verified' ? 'verified' : reg.status,
      payment: updatedPayment,
    };

    return { ...mockRegistrations[idx] };
  }

  async delete(id: string): Promise<void> {
    mockRegistrations = mockRegistrations.filter((r) => r.id !== id);
  }
}

export class MockSubmissionRepository implements ISubmissionRepository {
  async getAll(filters?: { competitionId?: string; stageId?: string }): Promise<Submission[]> {
    return mockSubmissions.filter((s) => {
      if (filters?.competitionId && s.registration?.competition_id !== filters.competitionId) return false;
      if (filters?.stageId && s.stage_id !== filters.stageId) return false;
      return true;
    });
  }

  async getByRegistrationId(registrationId: string): Promise<Submission[]> {
    return mockSubmissions.filter((s) => s.registration_id === registrationId);
  }

  async getById(id: string): Promise<Submission | null> {
    const found = mockSubmissions.find((s) => s.id === id);
    return found ? { ...found } : null;
  }

  async create(data: {
    registration_id: string;
    stage_id: string;
    file_name?: string;
    file_url?: string;
    link_url?: string;
    notes?: string;
  }): Promise<Submission> {
    const reg = mockRegistrations.find((r) => r.id === data.registration_id);
    const existing = mockSubmissions.filter(
      (s) => s.registration_id === data.registration_id && s.stage_id === data.stage_id
    );

    existing.forEach((s) => {
      s.is_latest = false;
    });

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      registration_id: data.registration_id,
      registration: reg,
      stage_id: data.stage_id,
      version: existing.length + 1,
      file_name: data.file_name,
      file_url: data.file_url,
      link_url: data.link_url,
      notes: data.notes,
      submitted_at: new Date().toISOString(),
      is_latest: true,
    };

    mockSubmissions.unshift(newSub);
    return { ...newSub };
  }

  async delete(id: string): Promise<void> {
    mockSubmissions = mockSubmissions.filter((s) => s.id !== id);
  }
}

export class MockScoreRepository implements IScoreRepository {
  async getAssignmentsByJudge(judgeId: string): Promise<JudgeAssignment[]> {
    return mockAssignments.filter((a) => a.judge_id === judgeId);
  }

  async submitScore(
    assignmentId: string,
    scores: Array<{ criteriaId: string; score: number; comment?: string }>
  ): Promise<void> {
    const idx = mockAssignments.findIndex((a) => a.id === assignmentId);
    if (idx === -1) throw new Error('Penugasan juri tidak ditemukan');

    const formattedScores = scores.map((s, i) => ({
      id: `score-${Date.now()}-${i}`,
      judge_assignment_id: assignmentId,
      rubric_criteria_id: s.criteriaId,
      score: s.score,
      comment: s.comment,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    mockAssignments[idx] = {
      ...mockAssignments[idx],
      scores: formattedScores,
    };
  }

  async lockScores(competitionId: string): Promise<void> {
    mockAssignments.forEach((a) => {
      if (a.submission?.registration?.competition_id === competitionId && a.scores) {
        a.scores.forEach((s) => {
          s.is_locked = true;
        });
      }
    });
  }
}

export class MockUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const found = mockUsers.find((u) => u.id === id);
    return found ? { ...found } : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return found ? { ...found } : null;
  }

  async getAll(filters?: { role?: UserRole }): Promise<User[]> {
    if (filters?.role) {
      return mockUsers.filter((u) => u.role === filters.role);
    }
    return [...mockUsers];
  }

  async updateRole(userId: string, newRole: UserRole): Promise<User> {
    const idx = mockUsers.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan');
    mockUsers[idx] = {
      ...mockUsers[idx],
      role: newRole,
    };
    return { ...mockUsers[idx] };
  }
}
