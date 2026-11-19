import { 
  User, 
  Registration, 
  Submission, 
  RubricCriteria, 
  JudgeAssignment, 
  Announcement, 
  AuditLog, 
  MatchResult,
  LeaderboardEntry
} from './types';
import { INITIAL_COMPETITIONS } from './constants';

export const MOCK_USERS: User[] = [
  {
    id: 'user-peserta-1',
    email: 'peserta@permifest.id',
    full_name: 'Ahmad Fauzi',
    institution: 'Universitas Indonesia',
    phone: '081234567891',
    role: 'peserta',
    email_verified: true,
  },
  {
    id: 'user-peserta-2',
    email: 'sarah.ux@gmail.com',
    full_name: 'Sarah Wijaya',
    institution: 'Institut Teknologi Bandung',
    phone: '081298765432',
    role: 'peserta',
    email_verified: true,
  },
  {
    id: 'user-juri-1',
    email: 'juri.cyber@permifest.id',
    full_name: 'Dr. Pratama, M.Kom (CISSP)',
    institution: 'Badan Siber dan Sandi Negara (BSSN)',
    phone: '081122334455',
    role: 'juri',
    email_verified: true,
  },
  {
    id: 'user-panitia-1',
    email: 'panitia@permifest.id',
    full_name: 'Rian Pratama',
    institution: 'Himpunan Mahasiswa Informatika',
    phone: '087788990011',
    role: 'panitia',
    email_verified: true,
  },
  {
    id: 'user-admin-1',
    email: 'admin@permifest.id',
    full_name: 'Administrator Utama',
    institution: 'Devorkafest Committee',
    phone: '089988776655',
    role: 'super_admin',
    email_verified: true,
  },
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    user_id: 'user-peserta-1',
    competition_id: 'comp-1',
    competition: INITIAL_COMPETITIONS[0],
    user: MOCK_USERS[0],
    form_data: {
      asal_sekolah: 'Universitas Indonesia',
      nim_nisn: '2206081234',
      subtema: 'Zero Trust Architecture',
    },
    status: 'verified',
    registered_at: '2026-11-05T10:00:00Z',
    payment: {
      id: 'pay-1',
      registration_id: 'reg-1',
      amount: 50000,
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      proof_name: 'transfer_bca_ahmad.jpg',
      status: 'verified',
      verified_by: 'user-panitia-1',
      uploaded_at: '2026-11-05T10:15:00Z',
      verified_at: '2026-11-05T11:00:00Z',
    },
  },
  {
    id: 'reg-2',
    user_id: 'user-peserta-2',
    competition_id: 'comp-2',
    competition: INITIAL_COMPETITIONS[1],
    user: MOCK_USERS[1],
    form_data: {
      asal_sekolah: 'Institut Teknologi Bandung',
      portofolio_url: 'https://dribbble.com/sarahw',
      figma_account: 'sarah.ux@gmail.com',
    },
    status: 'verified',
    registered_at: '2026-11-06T14:30:00Z',
    payment: {
      id: 'pay-2',
      registration_id: 'reg-2',
      amount: 75000,
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      proof_name: 'bukti_qris_sarah.png',
      status: 'verified',
      verified_by: 'user-panitia-1',
      uploaded_at: '2026-11-06T14:40:00Z',
      verified_at: '2026-11-06T15:00:00Z',
    },
  },
  {
    id: 'reg-3',
    user_id: 'user-peserta-1',
    competition_id: 'comp-4',
    competition: INITIAL_COMPETITIONS[3],
    user: MOCK_USERS[0],
    form_data: {
      player_nickname: 'Fauzi_PES_ID',
      preferred_platform: 'PlayStation 5 (DualSense)',
    },
    status: 'payment_pending',
    registered_at: '2026-11-10T09:00:00Z',
    payment: {
      id: 'pay-3',
      registration_id: 'reg-3',
      amount: 35000,
      status: 'pending',
    },
  },
];

export const MOCK_RUBRIC_CRITERIA: RubricCriteria[] = [
  // Esai Criteria
  { id: 'rubric-1', competition_id: 'comp-1', name: 'Orisinalitas & Kesesuaian Tema', description: 'Keaslian gagasan dan keterkaitan kuat dengan cybersecurity', max_score: 100, weight: 0.25, sort_order: 1 },
  { id: 'rubric-2', competition_id: 'comp-1', name: 'Ketajaman Analisis & Argumen', description: 'Logika berpikir, kedalaman pembahasan teknis/kebijakan', max_score: 100, weight: 0.35, sort_order: 2 },
  { id: 'rubric-3', competition_id: 'comp-1', name: 'Solusi & Kelayakan Implementasi', description: 'Solusi yang ditawarkan realistis dan berdampak', max_score: 100, weight: 0.25, sort_order: 3 },
  { id: 'rubric-4', competition_id: 'comp-1', name: 'Format & Tata Bahasa', description: 'Struktur esai, sitasi akademik, dan kebakuan PUEBI', max_score: 100, weight: 0.15, sort_order: 4 },

  // UI/UX Criteria
  { id: 'rubric-5', competition_id: 'comp-2', name: 'User Research & Problem Definition', description: 'Kejelasan persona dan problem statement keamanan siber', max_score: 100, weight: 0.25, sort_order: 1 },
  { id: 'rubric-6', competition_id: 'comp-2', name: 'Visual Design & Accessibility', description: 'Estetika, tipografi, kontras warna, WCAG compliance', max_score: 100, weight: 0.35, sort_order: 2 },
  { id: 'rubric-7', competition_id: 'comp-2', name: 'Interaktivitas & Prototype Flow', description: 'Prototipe fungsional dan seamless user journey', max_score: 100, weight: 0.25, sort_order: 3 },
  { id: 'rubric-8', competition_id: 'comp-2', name: 'Security Design Awareness', description: 'Fitur keamanan yang ramah pengguna (2FA, alert, dll)', max_score: 100, weight: 0.15, sort_order: 4 },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    registration_id: 'reg-1',
    stage_id: 'stage-1-1',
    file_name: 'Esai_AhmadFauzi_ZeroTrust.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'application/pdf',
    file_size: 2450000,
    notes: 'Karya esai babak penyisihan dengan topik implementasi Zero Trust di perbankan nasional.',
    submitted_at: '2026-11-12T16:20:00Z',
    version: 1,
    is_latest: true,
    registration: MOCK_REGISTRATIONS[0],
    final_score: 88.5,
  },
  {
    id: 'sub-2',
    registration_id: 'reg-2',
    stage_id: 'stage-2-1',
    link_url: 'https://www.figma.com/design/sample-cyber-aware-app',
    notes: 'Desain aplikasi mobile SecAware untuk mendeteksi pesan phishing dan verifikasi URL mencurigakan.',
    submitted_at: '2026-11-14T20:10:00Z',
    version: 1,
    is_latest: true,
    registration: MOCK_REGISTRATIONS[1],
    final_score: 92.0,
  },
];

export const MOCK_JUDGE_ASSIGNMENTS: JudgeAssignment[] = [
  {
    id: 'assign-1',
    judge_id: 'user-juri-1',
    submission_id: 'sub-1',
    judge: MOCK_USERS[2],
    submission: MOCK_SUBMISSIONS[0],
    status: 'completed',
    assigned_at: '2026-11-15T08:00:00Z',
    completed_at: '2026-11-16T14:30:00Z',
    scores: [
      { id: 'score-1', judge_assignment_id: 'assign-1', rubric_criteria_id: 'rubric-1', score: 90, comment: 'Gagasan sangat kontekstual dengan kondisi perbankan kita saat ini.', is_locked: true, created_at: '2026-11-16T14:10:00Z', updated_at: '2026-11-16T14:10:00Z' },
      { id: 'score-2', judge_assignment_id: 'assign-1', rubric_criteria_id: 'rubric-2', score: 88, comment: 'Analisis mendalam, referensi CVE relevan.', is_locked: true, created_at: '2026-11-16T14:15:00Z', updated_at: '2026-11-16T14:15:00Z' },
      { id: 'score-3', judge_assignment_id: 'assign-1', rubric_criteria_id: 'rubric-3', score: 85, comment: 'Peta jalan adopsi logis dan bertahap.', is_locked: true, created_at: '2026-11-16T14:20:00Z', updated_at: '2026-11-16T14:20:00Z' },
      { id: 'score-4', judge_assignment_id: 'assign-1', rubric_criteria_id: 'rubric-4', score: 92, comment: 'Sistematika penulisan rapi sesuai standar IEEE.', is_locked: true, created_at: '2026-11-16T14:25:00Z', updated_at: '2026-11-16T14:25:00Z' },
    ],
  },
];

export const MOCK_MATCH_RESULTS: MatchResult[] = [
  { id: 'match-1', competition_id: 'comp-4', participant_name: 'Rafi "CyberStrike" Kurnia', position: 1, notes: 'Menang agregat 4 - 2 di babak final', created_at: '2026-11-18T16:00:00Z' },
  { id: 'match-2', competition_id: 'comp-4', participant_name: 'Bima Satria (PES Indo)', position: 2, notes: 'Runner Up turnamen PES', created_at: '2026-11-18T16:00:00Z' },
  { id: 'match-3', competition_id: 'comp-4', participant_name: 'Fauzi_PES_ID', position: 3, notes: 'Juara 3 turnamen PES', created_at: '2026-11-18T16:00:00Z' },
  { id: 'match-4', competition_id: 'comp-5', participant_name: 'Tim Shadow Phoenix (SMK 1)', position: 1, notes: 'Score 3-1 di Grand Final MLBB', created_at: '2026-11-18T18:00:00Z' },
  { id: 'match-5', competition_id: 'comp-5', participant_name: 'Tim CyberVanguard (Telkom)', position: 2, notes: 'Runner Up MLBB', created_at: '2026-11-18T18:00:00Z' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    competition_id: null,
    title: 'Pendaftaran Permifest × Devorkafest 2026 Resmi Dibuka!',
    excerpt: 'Pendaftaran untuk seluruh 5 cabang perlombaan telah resmi dibuka hingga 10 Desember 2026.',
    content: `Selamat datang para talenta masa depan!

Panitia Permifest × Devorkafest 2026 mengumumkan bahwa pendaftaran seluruh cabang kompetisi telah dibuka:
1. Esai Ilmiah Cybersecurity
2. UI/UX Design Challenge
3. IT System Architecture
4. eFootball / PES Championship
5. Mobile Legends: Bang Bang

Silakan pilih lomba yang sesuai dengan minat dan kemampuan Anda, selesaikan pembayaran dan verifikasi, serta persiapkan karya terbaik Anda.

Salam Cyber,
Panitia Pelaksana Permifest × Devorkafest`,
    is_published: true,
    published_at: '2026-11-01T08:00:00Z',
    author_name: 'Panitia Pusat',
  },
  {
    id: 'ann-2',
    competition_id: 'comp-1',
    competition_name: 'Esai Ilmiah Cybersecurity',
    title: 'Panduan Template Penulisan Esai Babak Penyisihan',
    excerpt: 'Pastikan file esai Anda berformat DOCX atau PDF dengan format sitasi APA/IEEE.',
    content: `Halo peserta Esai Ilmiah!

Mengingatkan kembali format penyerahan karya:
- Format file: DOCX atau PDF
- Ukuran maksimal: 15 MB
- Font: Times New Roman 12pt / Arial 11pt, spasi 1.5
- Wajib menyertakan abstrak dan daftar pustaka terverifikasi

Deadline babak penyisihan: 15 Desember 2026 pukul 23:59 WIB.`,
    is_published: true,
    published_at: '2026-11-08T10:00:00Z',
    author_name: 'Divisi Acara Esai',
  },
  {
    id: 'ann-3',
    competition_id: 'comp-2',
    competition_name: 'UI/UX Design Challenge',
    title: 'Aturan Akses File Figma untuk Juri',
    excerpt: 'Pastikan link Figma Anda disetel ke "Anyone with the link can view".',
    content: `Peserta UI/UX Design Challenge diwajibkan memastikan tautan Figma yang dikumpulkan memiliki izin akses "Can View" publik, agar juri dapat membuka dan melakukan penilaian dengan lancar.`,
    is_published: true,
    published_at: '2026-11-10T11:00:00Z',
    author_name: 'Divisi Juri UI/UX',
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_email: 'panitia@permifest.id',
    action: 'VERIFY_PAYMENT',
    entity_type: 'payment',
    entity_id: 'pay-1',
    details: { registration_id: 'reg-1', participant: 'Ahmad Fauzi', amount: 50000 },
    ip_address: '103.111.20.1',
    created_at: '2026-11-05T11:00:00Z',
  },
  {
    id: 'log-2',
    user_email: 'juri.cyber@permifest.id',
    action: 'SUBMIT_SCORE',
    entity_type: 'score',
    entity_id: 'sub-1',
    details: { submission_id: 'sub-1', weighted_score: 88.5, locked: true },
    ip_address: '182.253.11.8',
    created_at: '2026-11-16T14:30:00Z',
  },
  {
    id: 'log-3',
    user_email: 'admin@permifest.id',
    action: 'CREATE_ANNOUNCEMENT',
    entity_type: 'announcement',
    entity_id: 'ann-1',
    details: { title: 'Pendaftaran Permifest × Devorkafest 2026 Resmi Dibuka!' },
    ip_address: '114.124.2.14',
    created_at: '2026-11-01T08:00:00Z',
  },
];

export const MOCK_LEADERBOARDS: LeaderboardEntry[] = [
  { rank: 1, participant_name: 'Sarah Wijaya', institution: 'Institut Teknologi Bandung', competition_name: 'UI/UX Design Challenge', category: 'uiux', score: 92.0, notes: 'Juara 1' },
  { rank: 1, participant_name: 'Ahmad Fauzi', institution: 'Universitas Indonesia', competition_name: 'Esai Ilmiah Cybersecurity', category: 'esai', score: 88.5, notes: 'Juara 1' },
  { rank: 1, participant_name: 'Rafi "CyberStrike" Kurnia', institution: 'Universitas Brawijaya', competition_name: 'eFootball / PES Championship', category: 'pes', notes: 'Champion' },
  { rank: 2, participant_name: 'Bima Satria (PES Indo)', institution: 'SMA Negeri 3 Yogyakarta', competition_name: 'eFootball / PES Championship', category: 'pes', notes: 'Runner Up' },
  { rank: 1, participant_name: 'Tim Shadow Phoenix', institution: 'SMK Telkom Malang', competition_name: 'Mobile Legends: Bang Bang', category: 'ml', notes: 'Champion 5v5' },
];
