import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Permifest × Devorkafest 2026 — Platform Kompetisi Terpadu',
  description: 'Platform manajemen lomba terpadu untuk Permifest & Devorkafest. Lima cabang lomba akademik & e-sport bertema Cybersecurity.',
  keywords: ['permifest', 'devorkafest', 'cybersecurity', 'lomba', 'esai', 'ui ux', 'it system architecture', 'pes', 'mobile legends'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-slate-950">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
