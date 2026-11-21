'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  color: string;
  char?: string;
}

export function SakugaHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Cek preferensi aksesibilitas pengguna
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const handleScroll = () => {
      // Dibatasi sampai 800px scroll untuk efisiensi
      if (window.scrollY < 1200) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Palet partikel anime motes
    const colors = ['#9B6BF2', '#D56BD9', '#6CC4FF', '#FFE359', '#FFFFFF'];
    const particleCount = 28;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 2.5,
        speedY: -(0.3 + Math.random() * 0.6), // melayang ke atas seperti energi anime
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: 0.2 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render anime ambient floating motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around canvas
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        // Bentuk diamond shard kecil khas anime
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(p.x, p.y - s * 1.5);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x, p.y + s * 1.5);
        ctx.lineTo(p.x - s, p.y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion]);

  // Efek parallax transform halus berdasarkan scroll
  const parallaxOrbs = reducedMotion ? 0 : scrollY * 0.25;
  const parallaxGrid = reducedMotion ? 0 : scrollY * 0.08;
  const parallaxSpeedLines = reducedMotion ? 0 : scrollY * 0.4;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* ── Layer 1: Ambient Manga Cyber Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.07] transition-transform duration-75 ease-out"
        style={{
          transform: `translateY(${parallaxGrid}px)`,
          backgroundImage: `
            linear-gradient(to right, #9B6BF2 1px, transparent 1px),
            linear-gradient(to bottom, #9B6BF2 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      {/* ── Layer 2: Deep Color Atmosphere Orbs (Parallax) ── */}
      <div
        className="absolute -top-40 -left-48 w-[640px] h-[640px] rounded-full transition-transform duration-100 ease-out"
        style={{
          transform: `translateY(${parallaxOrbs * -1.2}px) scale(1.05)`,
          background: 'radial-gradient(circle, rgba(155, 107, 242, 0.4) 0%, rgba(124, 77, 219, 0.15) 50%, transparent 75%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute top-80 -right-40 w-[600px] h-[600px] rounded-full transition-transform duration-100 ease-out"
        style={{
          transform: `translateY(${parallaxOrbs * 0.9}px) scale(1.02)`,
          background: 'radial-gradient(circle, rgba(213, 107, 217, 0.28) 0%, rgba(108, 196, 255, 0.12) 55%, transparent 75%)',
          filter: 'blur(110px)',
        }}
      />

      {/* ── Layer 3: Manga Diagonal Speed Slash Bars (Anime Sakuga Accent) ── */}
      <div
        className="absolute inset-0 opacity-20 transition-transform duration-100 ease-out"
        style={{
          transform: `translateY(${parallaxSpeedLines * -0.6}px)`,
        }}
      >
        <div
          className="absolute top-1/4 -left-12 w-[180%] h-px bg-gradient-to-r from-transparent via-[#9B6BF2]/60 to-transparent transform -rotate-12"
        />
        <div
          className="absolute top-1/2 -left-12 w-[180%] h-[1.5px] bg-gradient-to-r from-transparent via-[#D56BD9]/40 to-transparent transform -rotate-12"
        />
        <div
          className="absolute top-3/4 -left-12 w-[180%] h-px bg-gradient-to-r from-transparent via-[#6CC4FF]/50 to-transparent transform -rotate-12"
        />
      </div>

      {/* ── Layer 4: Interactive Floating Sakuga Motes Canvas ── */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
