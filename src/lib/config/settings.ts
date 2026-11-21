/**
 * Konfigurasi Terbuka Sistem Permifest x Deforkafest
 * Mengacu pada docs/DECISIONS.md Bagian C (C-01 s/d C-17) & Golden Rule #2
 */

export interface EventPolicyConfig {
  eventName: string;
  allowMultipleCompetitions: boolean; // C-06: Peserta boleh ikut lebih dari satu lomba
  roleConflictPolicy: 'block_assignment' | 'allow_with_warning'; // C-15: Satu orang dua peran
  blockSameInstitutionJudge: boolean; // C-16: Juri tak boleh menilai karya instansi yang sama
  panitiaScope: 'per_competition' | 'all'; // C-17: Panitia per cabang lomba atau akses menyeluruh
  leaderboardMode: 'after_release' | 'live_published'; // C-09: Mode rilis leaderboard
  emailAnnouncements: boolean; // C-08: Pengiriman notifikasi email
}

export const DEFAULT_EVENT_CONFIG: EventPolicyConfig = {
  eventName: 'Permifest x Deforkafest',
  allowMultipleCompetitions: true, // Default: Peserta boleh mendaftar lebih dari 1 lomba
  roleConflictPolicy: 'block_assignment', // Blokir penugasan juri yang memiliki benturan peran
  blockSameInstitutionJudge: true, // Juri tidak diperkenankan menilai peserta dari almamater/instansi yang sama
  panitiaScope: 'per_competition',
  leaderboardMode: 'after_release', // Hanya tampil setelah panitia menekan tombol rilis resmi
  emailAnnouncements: false,
};

/**
 * Helper untuk membaca konfigurasi event
 */
export function getEventPolicy(): EventPolicyConfig {
  // Dalam fase berikutnya, fungsi ini membaca tabel `event_settings` dari Supabase
  return { ...DEFAULT_EVENT_CONFIG };
}

/**
 * Validasi benturan kepentingan juri (C-16)
 */
export function isJudgeInstitutionConflicted(
  judgeInstitution?: string,
  participantInstitution?: string
): boolean {
  if (!judgeInstitution || !participantInstitution) return false;
  const cleanJudge = judgeInstitution.trim().toLowerCase();
  const cleanPart = participantInstitution.trim().toLowerCase();
  if (cleanJudge.length < 3 || cleanPart.length < 3) return false;
  return cleanJudge === cleanPart || cleanJudge.includes(cleanPart) || cleanPart.includes(cleanJudge);
}
