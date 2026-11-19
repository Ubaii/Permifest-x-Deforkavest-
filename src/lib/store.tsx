'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  logout: () => void;
  isLoggedIn: boolean;
  availableUsers: User[];
  competitions: Competition[];
  registrations: Registration[];
  submissions: Submission[];
  judgeAssignments: JudgeAssignment[];
  rubricCriteria: RubricCriteria[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  matchResults: MatchResult[];
  
  // Actions
  registerCompetition: (competitionId: string, formData: Record<string, any>) => Promise<Registration>;
  uploadPaymentProof: (registrationId: string, proofUrl: string, proofName: string) => Promise<void>;
  verifyPayment: (registrationId: string, status: 'verified' | 'rejected', reason?: string) => Promise<void>;
  submitWork: (registrationId: string, stageId: string, data: { fileUrl?: string; fileName?: string; linkUrl?: string; notes?: string }) => Promise<void>;
  assignJudge: (submissionId: string, judgeId: string) => Promise<void>;
  submitJudgeScore: (assignmentId: string, scores: { criteriaId: string; score: number; comment?: string }[]) => Promise<void>;
  addMatchResult: (result: Omit<MatchResult, 'id' | 'created_at'>) => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'published_at'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [registrations, setRegistrations] = useState<Registration[]>(MOCK_REGISTRATIONS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [judgeAssignments, setJudgeAssignments] = useState<JudgeAssignment[]>(MOCK_JUDGE_ASSIGNMENTS);
  const [rubricCriteria] = useState<RubricCriteria[]>(MOCK_RUBRIC_CRITERIA);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [matchResults, setMatchResults] = useState<MatchResult[]>(MOCK_MATCH_RESULTS);

  // Restore user session from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('permifest_user');
      const logged = localStorage.getItem('permifest_logged_in');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
      if (logged === 'true') {
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('permifest_user', JSON.stringify(user));
      localStorage.setItem('permifest_logged_in', 'true');
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('permifest_logged_in');
      localStorage.removeItem('permifest_user');
    } catch {
      // ignore
    }
  };

  // Switch role helper
  const switchRole = (role: UserRole) => {
    const userForRole = MOCK_USERS.find(u => u.role === role) || {
      id: `mock-${role}`,
      email: `${role}@permifest.id`,
      full_name: `Demo ${role.toUpperCase()}`,
      role: role,
      email_verified: true,
    };
    handleSetCurrentUser(userForRole);
  };

  const logAudit = (action: string, entity_type: string, entity_id: string, details: Record<string, any>) => {
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

  const registerCompetition = async (competitionId: string, formData: Record<string, any>): Promise<Registration> => {
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
    // increment registered count
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
    const judge = MOCK_USERS.find(u => u.id === judgeId);
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

  const submitJudgeScore = async (
    assignmentId: string, 
    scoresInput: { criteriaId: string; score: number; comment?: string }[]
  ) => {
    // calculate weighted score
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

    // update submission final score
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

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'published_at'>) => {
    const newAnn: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      published_at: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logAudit('CREATE_ANNOUNCEMENT', 'announcement', newAnn.id, { title: announcement.title });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      switchRole,
      logout,
      isLoggedIn,
      availableUsers: MOCK_USERS,
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
      submitWork,
      assignJudge,
      submitJudgeScore,
      addMatchResult,
      createAnnouncement,
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
