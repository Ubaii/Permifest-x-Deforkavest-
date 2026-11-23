// ============================================================================
// Permifest x Deforkafest: Calendar Integration Utilities
// Standar Google Calendar URL & RFC 5545 iCalendar (.ics) generator
// ============================================================================

export interface CalendarEventPayload {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string, e.g. "2026-12-14T08:30:00+07:00"
  endTime?: string;   // ISO string, e.g. "2026-12-14T12:30:00+07:00"
  url?: string;
}

/**
 * Format tanggal ke format YYYYMMDDTHHmmSSZ (UTC) untuk kalender standar
 */
function formatUtcForCalendar(isoDateStr: string): string {
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) {
      // Fallback: hapus karakter pemisah jika string polos
      return isoDateStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return isoDateStr;
  }
}

/**
 * Menghasilkan link Google Calendar langsung (Web URL)
 */
export function createGoogleCalendarUrl(event: CalendarEventPayload): string {
  const startUtc = formatUtcForCalendar(event.startTime);
  
  // Jika endTime tidak ada, default durasi 2 jam dari startTime
  let endUtc = startUtc;
  if (event.endTime) {
    endUtc = formatUtcForCalendar(event.endTime);
  } else {
    try {
      const d = new Date(event.startTime);
      d.setHours(d.getHours() + 2);
      endUtc = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch {
      endUtc = startUtc;
    }
  }

  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nLokasi / Tautan: ${event.location}${event.url ? `\nInformasi Lengkap: ${event.url}` : ''}\n\nPlatform Resmi Permifest x Deforkafest 2026`
  );
  const location = encodeURIComponent(event.location);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startUtc}/${endUtc}`;
}

/**
 * Menghasilkan string konten format RFC 5545 iCalendar (.ics)
 */
export function generateIcsContent(event: CalendarEventPayload): string {
  const startUtc = formatUtcForCalendar(event.startTime);
  
  let endUtc = startUtc;
  if (event.endTime) {
    endUtc = formatUtcForCalendar(event.endTime);
  } else {
    try {
      const d = new Date(event.startTime);
      d.setHours(d.getHours() + 2);
      endUtc = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch {
      endUtc = startUtc;
    }
  }

  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `event-${Date.now()}@permifest.id`;
  
  // Bersihkan karakter baris baru untuk format ICS
  const cleanSummary = event.title.replace(/\r?\n/g, ' ');
  const cleanDescription = (event.description || '').replace(/\r?\n/g, '\\n');
  const cleanLocation = (event.location || '').replace(/\r?\n/g, ' ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Permifest x Deforkafest//Jadwal Resmi Event 2026//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Memicu pengunduhan file .ics secara otomatis di peramban pengguna
 */
export function downloadIcsFile(filename: string, event: CalendarEventPayload): void {
  if (typeof window === 'undefined') return;

  const icsData = generateIcsContent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const safeFilename = filename.endsWith('.ics') ? filename : `${filename}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
