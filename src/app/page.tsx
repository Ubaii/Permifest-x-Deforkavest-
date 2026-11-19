import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { OrganizerStrip } from '@/components/landing/OrganizerStrip';
import { CompetitionsSection } from '@/components/landing/CompetitionsSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { LeaderboardTeaser } from '@/components/landing/LeaderboardTeaser';
import { HowToRegisterSection } from '@/components/landing/HowToRegisterSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaClosingSection } from '@/components/landing/CtaClosingSection';
import { StickyBottomBar } from '@/components/landing/StickyBottomBar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0720] text-[#F5F2FF]">
      {/* ── Header / Navbar ── */}
      <Navbar />

      {/* ── Main Landing Content (Sesuai docs/Permifest x Deforkafest - Landing Page.html) ── */}
      <main id="main-content" className="flex-1">
        <HeroSection />
        <OrganizerStrip />
        <CompetitionsSection id="lomba" />
        <TimelineSection id="jadwal" />
        <LeaderboardTeaser />
        <HowToRegisterSection id="daftar" />
        <FaqSection id="faq" />
        <CtaClosingSection />
      </main>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Mobile Sticky Bottom Bar ── */}
      <StickyBottomBar />
    </div>
  );
}
