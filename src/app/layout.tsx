import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Permifest x Deforkafest 2026',
  description: 'Platform lomba terpadu Permikomnas Yogyakarta x IMPSI UST Yogyakarta. Lima cabang: Esai, UI/UX, IT System Architecture, PES, Mobile Legends.',
  keywords: ['permifest', 'deforkafest', 'cybersecurity', 'lomba', 'kompetisi', 'yogyakarta'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`dark ${bricolage.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script src="/button.js" defer></script>
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen">
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
