'use client';

import React, { createContext, useContext, useState } from 'react';
import { 
  User, 
  UserRole, 
  Competition, 
  Registration, 
  Submission, 
  JudgeAssignment, 
  Announcement, 
  AuditLog, 
  MatchResult,
  RubricCriteria
} from './types';
import { 
  MOCK_USERS, 
  MOCK_REGISTRATIONS, 
  MOCK_SUBMISSIONS, 
  MOCK_JUDGE_ASSIGNMENTS, 
  MOCK_ANNOUNCEMENTS, 
  MOCK_AUDIT_LOGS, 
  MOCK_MATCH_RESULTS,
  MOCK_RUBRIC_CRITERIA
} from './mock-data';
import { INITIAL_COMPETITIONS } from './constants';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  availableUsers: User[];
  competitions: Competition[];
  registrations: Registration[];
  submissions: Submission[];
  judgeAssignments: JudgeAssignment[];
  rubricCriteria: RubricCriteria[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  matchResults: MatchResult[];
  
  // Actions - Pendaftaran & Pembayaran
  registerCompetition: (competitionId: string, formData: Record<string, unknown>) => Promise<Registration>;
  uploadPaymentProof: (registrationId: string, proofUrl: string, proofName: string) => Promise<void>;
  verifyPayment: (registrationId: string, status: 'verified' | 'rejected', reason?: string) => Promise<void>;
  updatePaymentAmount: (registrationId: string, amount: number) => Promise<void>;
  deleteRegistration: (registrationId: string) => Promise<void>;

  // Actions - Karya & Penilaian
  submitWork: (registrationId: string, stageId: string, data: { fileUrl?: string; fileName?: string; linkUrl?: string; notes?: string }) => Promise<void>;
  assignJudge: (submissionId: string, judgeId: string) => Promise<void>;
  removeJudgeAssignment: (assignmentId: string) => Promise<void>;
  submitJudgeScore: (assignmentId: string, scores: { criteriaId: string; score: number; comment?: string }[]) => Promise<void>;

  // Actions - Kompetisi CRUD
  addCompetition: (comp: Omit<Competition, 'id' | 'registered_count'>) => Promise<Competition>;
  updateCompetition: (id: string, updates: Partial<Competition>) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;

  // Actions - Pengguna CRUD (Peserta, Juri, Panitia, Admin)
  addUser: (user: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Actions - Pengumuman CRUD
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'published_at'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Actions - Hasil E-Sport CRUD
  addMatchResult: (result: Omit<MatchResult, 'id' | 'created_at'>) => Promise<void>;
  updateMatchResult: (id: string, updates: Partial<MatchResult>) => Promise<void>;
  deleteMatchResult: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // default to peserta
  const [availableUsers, setAvailableUsers] = useState<User[]>(MOCK_USERS);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [registrations, setRegistrations] = useState<Registration[]>(MOCK_REGISTRATIONS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [judgeAssignments, setJudgeAssignments] = useState<JudgeAssignment[]>(MOCK_JUDGE_ASSIGNMENTS);
  const [rubricCriteria] = useState<RubricCriteria[]>(MOCK_RUBRIC_CRITERIA);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [matchResults, setMatchResults] = useState<MatchResult[]>(MOCK_MATCH_RESULTS);

  // Switch role easily for demo & testing
  const switchRole = (role: UserRole) => {
    const userForRole = availableUsers.find(u => u.role === role) || {
      id: `mock-${role}`,
      email: `${role}@permifest.id`,
      full_name: `Demo ${role.toUpperCase()}`,
      role: role,
      email_verified: true,
    };
    setCurrentUser(userForRole);
  };

  const logAudit = (action: string, entity_type: string, entity_id: string, details: Record<string, unknown>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user_email: currentUser.email,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- CRUD Pendaftaran & Pembayaran ---
  const registerCompetition = async (competitionId: string, formData: Record<string, unknown>): Promise<Registration> => {
    const comp = competitions.find(c => c.id === competitionId);
    if (!comp) throw new Error('Kompetisi tidak ditemukan');

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      user_id: currentUser.id,
      competition_id: competitionId,
      competition: comp,
      user: currentUser,
      form_data: formData,
      status: comp.registration_fee > 0 ? 'payment_pending' : 'verified',
      registered_at: new Date().toISOString(),
      payment: comp.registration_fee > 0 ? {
        id: `pay-${Date.now()}`,
        registration_id: `reg-${Date.now()}`,
        amount: comp.registration_fee,
        status: 'pending',
      } : undefined,
    };

    setRegistrations(prev => [newReg, ...prev]);
    setCompetitions(prev => prev.map(c => c.id === competitionId ? { ...c, registered_count: c.registered_count + 1 } : c));
    logAudit('REGISTER_COMPETITION', 'registration', newReg.id, { competition: comp.name });
    return newReg;
  };

  const uploadPaymentProof = async (registrationId: string, proofUrl: string, proofName: string) => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === registrationId) {
        return {
          ...reg,
          payment: {
            id: reg.payment?.id || `pay-${Date.now()}`,
            registration_id: registrationId,
            amount: reg.payment?.amount || reg.competition?.registration_fee || 0,
            proof_url: proofUrl,
            proof_name: proofName,
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
          }
        };
      }
      return reg;
    }));
    logAudit('UPLOAD_PAYMENT_PROOF', 'payment', registrationId, { proofName });
  };

  const verifyPayment = async (registrationId: string, status: 'verified' | 'rejected', reason?: string) => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === registrationId && reg.payment) {
        return {
          ...reg,
          status: status === 'verified' ? 'verified' : 'rejected',
          payment: {
            ...reg.payment,
            status: status,
            verified_by: currentUser.id,
            verified_at: new Date().toISOString(),
            rejection_reason: reason,
          }
        };
      }
      return reg;
    }));
    logAudit('VERIFY_PAYMENT', 'payment', registrationId, { status, reason });
  };

  const updatePaymentAmount = async (registrationId: string, amount: number) => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === registrationId && reg.payment) {
        return {
          ...reg,
          payment: {
            ...reg.payment,
            amount,
          }
        };
      }
      return reg;
    }));
    logAudit('UPDATE_PAYMENT_AMOUNT', 'payment', registrationId, { amount });
  };

  const deleteRegistration = async (registrationId: string) => {
    setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    logAudit('DELETE_REGISTRATION', 'registration', registrationId, {});
  };

  // --- Submission & Juri ---
  const submitWork = async (
    registrationId: string, 
    stageId: string, 
    data: { fileUrl?: string; fileName?: string; linkUrl?: string; notes?: string }
  ) => {
    const reg = registrations.find(r => r.id === registrationId);
    const existingIndex = submissions.findIndex(s => s.registration_id === registrationId && s.stage_id === stageId);
    const version = existingIndex >= 0 ? submissions[existingIndex].version + 1 : 1;

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      registration_id: registrationId,
      stage_id: stageId,
      registration: reg,
      file_url: data.fileUrl,
      file_name: data.fileName,
      link_url: data.linkUrl,
      notes: data.notes,
      version: version,
      is_latest: true,
      submitted_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      setSubmissions(prev => {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], is_latest: false };
        return [newSub, ...copy];
      });
    } else {
      setSubmissions(prev => [newSub, ...prev]);
    }

    logAudit('SUBMIT_WORK', 'submission', newSub.id, { version, fileName: data.fileName || data.linkUrl });
  };

  const assignJudge = async (submissionId: string, judgeId: string) => {
    const judge = availableUsers.find(u => u.id === judgeId);
    const sub = submissions.find(s => s.id === submissionId);
    const newAssignment: JudgeAssignment = {
      id: `assign-${Date.now()}`,
      judge_id: judgeId,
      submission_id: submissionId,
      judge,
      submission: sub,
      status: 'assigned',
      assigned_at: new Date().toISOString(),
    };
    setJudgeAssignments(prev => [newAssignment, ...prev]);
    logAudit('ASSIGN_JUDGE', 'judge_assignment', newAssignment.id, { judgeName: judge?.full_name });
  };

  const removeJudgeAssignment = async (assignmentId: string) => {
    setJudgeAssignments(prev => prev.filter(a => a.id !== assignmentId));
    logAudit('REMOVE_JUDGE_ASSIGNMENT', 'judge_assignment', assignmentId, {});
  };

  const submitJudgeScore = async (
    assignmentId: string, 
    scoresInput: { criteriaId: string; score: number; comment?: string }[]
  ) => {
    let totalWeighted = 0;
    scoresInput.forEach(s => {
      const crit = rubricCriteria.find(c => c.id === s.criteriaId);
      const weight = crit?.weight || 0.25;
      totalWeighted += s.score * weight;
    });

    setJudgeAssignments(prev => prev.map(a => {
      if (a.id === assignmentId) {
        return {
          ...a,
          status: 'completed',
          completed_at: new Date().toISOString(),
          scores: scoresInput.map((s, idx) => ({
            id: `score-${Date.now()}-${idx}`,
            judge_assignment_id: assignmentId,
            rubric_criteria_id: s.criteriaId,
            rubric_criteria: rubricCriteria.find(c => c.id === s.criteriaId),
            score: s.score,
            comment: s.comment,
            is_locked: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        };
      }
      return a;
    }));

    const targetAssign = judgeAssignments.find(a => a.id === assignmentId);
    if (targetAssign) {
      setSubmissions(prev => prev.map(s => {
        if (s.id === targetAssign.submission_id) {
          return { ...s, final_score: Math.round(totalWeighted * 10) / 10 };
        }
        return s;
      }));
    }

    logAudit('SUBMIT_JUDGE_SCORE', 'score', assignmentId, { totalWeighted });
  };

  // --- CRUD Kompetisi ---
  const addCompetition = async (compData: Omit<Competition, 'id' | 'registered_count'>): Promise<Competition> => {
    const newComp: Competition = {
      ...compData,
      id: `comp-${Date.now()}`,
      registered_count: 0,
    };
    setCompetitions(prev => [...prev, newComp]);
    logAudit('CREATE_COMPETITION', 'competition', newComp.id, { name: newComp.name });
    return newComp;
  };

  const updateCompetition = async (id: string, updates: Partial<Competition>) => {
    setCompetitions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAudit('UPDATE_COMPETITION', 'competition', id, updates as Record<string, unknown>);
  };

  const deleteCompetition = async (id: string) => {
    const comp = competitions.find(c => c.id === id);
    setCompetitions(prev => prev.filter(c => c.id !== id));
    logAudit('DELETE_COMPETITION', 'competition', id, { name: comp?.name });
  };

  // --- CRUD Pengguna (Peserta, Juri, Panitia, Admin) ---
  const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setAvailableUsers(prev => [newUser, ...prev]);
    logAudit('CREATE_USER', 'user', newUser.id, { email: newUser.email, role: newUser.role });
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setAvailableUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    logAudit('UPDATE_USER', 'user', id, updates as Record<string, unknown>);
  };

  const deleteUser = async (id: string) => {
    const user = availableUsers.find(u => u.id === id);
    setAvailableUsers(prev => prev.filter(u => u.id !== id));
    logAudit('DELETE_USER', 'user', id, { email: user?.email, name: user?.full_name });
  };

  // --- CRUD Pengumuman ---
  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'published_at'>) => {
    const newAnn: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      published_at: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logAudit('CREATE_ANNOUNCEMENT', 'announcement', newAnn.id, { title: announcement.title });
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    logAudit('UPDATE_ANNOUNCEMENT', 'announcement', id, updates as Record<string, unknown>);
  };

  const deleteAnnouncement = async (id: string) => {
    const ann = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    logAudit('DELETE_ANNOUNCEMENT', 'announcement', id, { title: ann?.title });
  };

  // --- CRUD Hasil E-Sport ---
  const addMatchResult = async (result: Omit<MatchResult, 'id' | 'created_at'>) => {
    const newResult: MatchResult = {
      ...result,
      id: `match-${Date.now()}`,
      created_at: new Date().toISOString(),
      input_by: currentUser.id,
    };
    setMatchResults(prev => [newResult, ...prev]);
    logAudit('INPUT_MATCH_RESULT', 'match_result', newResult.id, { participant: result.participant_name, position: result.position });
  };

  const updateMatchResult = async (id: string, updates: Partial<MatchResult>) => {
    setMatchResults(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    logAudit('UPDATE_MATCH_RESULT', 'match_result', id, updates as Record<string, unknown>);
  };

  const deleteMatchResult = async (id: string) => {
    const match = matchResults.find(m => m.id === id);
    setMatchResults(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE_MATCH_RESULT', 'match_result', id, { participant: match?.participant_name });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      availableUsers,
      competitions,
      registrations,
      submissions,
      judgeAssignments,
      rubricCriteria,
      announcements,
      auditLogs,
      matchResults,
      registerCompetition,
      uploadPaymentProof,
      verifyPayment,
      updatePaymentAmount,
      deleteRegistration,
      submitWork,
      assignJudge,
      removeJudgeAssignment,
      submitJudgeScore,
      addCompetition,
      updateCompetition,
      deleteCompetition,
      addUser,
      updateUser,
      deleteUser,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      addMatchResult,
      updateMatchResult,
      deleteMatchResult,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
