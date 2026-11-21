/**
 * SAKUGA VFX ENGINE - Permifest x Deforkafest
 * Dynamic Anime-Style Kinetic Particles & Impact Effects
 * Inspired by Sakuga anime action sequences & finktheartist/sakuga-vfx
 */

export interface SakugaConfig {
  /** Array warna partikel (hex / rgb) */
  colors?: string[];
  /** Teks onomatopoeia manga (contoh: "GASSS!!", "BOOM!!", "IKUZO!!") */
  sfxText?: string;
  /** Intensitas partikel (default: 1) */
  intensity?: number;
  /** Apakah menyertakan comic impact text */
  showSfxText?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  type: 'shard' | 'sparkle' | 'line' | 'donut';
  length?: number;
  width?: number;
}

interface SfxImpact {
  x: number;
  y: number;
  text: string;
  scale: number;
  targetScale: number;
  alpha: number;
  color: string;
  strokeColor: string;
  rotation: number;
  life: number;
  maxLife: number;
}

class SakugaVfxManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private sfxImpacts: SfxImpact[] = [];
  private animId: number | null = null;
  private isCalm = false;
  private defaultColors = [
    '#9B6BF2', // Violet Permifest
    '#D56BD9', // Brand Pink
    '#6CC4FF', // Cyan Electric
    '#FFE359', // Anime Impact Gold
    '#FFFFFF', // White Flash
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isCalm = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.isCalm = e.matches;
      });
    }
  }

  private ensureCanvas(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.canvas && document.body.contains(this.canvas)) {
      return true;
    }

    let existingCanvas = document.querySelector('canvas.sakuga-vfx-canvas') as HTMLCanvasElement;
    if (!existingCanvas) {
      existingCanvas = document.createElement('canvas');
      existingCanvas.className = 'sakuga-vfx-canvas';
      existingCanvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999;
      `;
      document.body.appendChild(existingCanvas);
    }

    this.canvas = existingCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', this.handleResize);
    return !!this.ctx;
  }

  private handleResize = () => {
    if (!this.canvas) return;
    this.resize();
  };

  private resize() {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Pemicu ledakan efek Sakuga VFX di sekitar koordinat elemen DOM
   */
  public trigger(target: HTMLElement | { x: number; y: number; width?: number; height?: number }, config?: SakugaConfig) {
    if (this.isCalm) return; // Hormati prefers-reduced-motion
    if (!this.ensureCanvas() || !this.ctx) return;

    let cx = 0;
    let cy = 0;
    let w = 80;
    let h = 40;

    if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
      w = rect.width;
      h = rect.height;
    } else {
      cx = target.x;
      cy = target.y;
      w = target.width || 80;
      h = target.height || 40;
    }

    const colors = config?.colors || this.defaultColors;
    const intensity = config?.intensity || 1;
    const count = Math.floor(24 * intensity);

    // 1. Shards & Sparks (Anime Geometry Burst)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9 * intensity;
      const spreadDist = Math.random() * (w / 3);

      this.particles.push({
        x: cx + Math.cos(angle) * spreadDist,
        y: cy + Math.sin(angle) * spreadDist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slight upward float
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 26 + Math.random() * 18,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
        type: 'shard',
      });
    }

    // 2. Kira Sparkles (Anime 4-point stars)
    const starCount = Math.floor(6 * intensity);
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = (w / 2) + Math.random() * 30;
      this.particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        size: 14 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 32 + Math.random() * 14,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.15,
        type: 'sparkle',
      });
    }

    // 3. Shockwave Donut
    this.particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: Math.max(w, h) * 0.4,
      color: colors[0],
      alpha: 0.9,
      life: 0,
      maxLife: 22,
      rotation: 0,
      vRot: 0,
      type: 'donut',
      width: Math.max(w, h) * 1.8,
    });

    // 4. Speed Slash Lines (garis kinetik radial)
    const lineCount = Math.floor(8 * intensity);
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = (w / 2) * 0.8;
      const speed = 7 + Math.random() * 6;
      this.particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 16 + Math.random() * 8,
        rotation: angle,
        vRot: 0,
        type: 'line',
        length: 22 + Math.random() * 28,
      });
    }

    // 5. Manga SFX Comic Text (Impact Onomatopoeia)
    if (config?.showSfxText !== false) {
      const sfxWords = ['GASSS!!', 'BOOM!!', 'IKUZO!!', 'PERMI!!', 'KICK!!', 'GO!!'];
      const chosenText = config?.sfxText || sfxWords[Math.floor(Math.random() * sfxWords.length)];

      this.sfxImpacts.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy - h * 0.8 - Math.random() * 15,
        text: chosenText,
        scale: 0.2,
        targetScale: 1.1 + Math.random() * 0.2,
        alpha: 1,
        color: colors[3] || '#FFE359', // Kuning emas manga
        strokeColor: '#0B0720', // Ink border pekat
        rotation: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 38,
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) {
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Update & render particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94; // friction
      p.vy *= 0.94;
      p.rotation += p.vRot;

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.type === 'shard') {
        // Anime diamond / triangle shard
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        const s = p.size * (1 - progress * 0.4);
        this.ctx.moveTo(0, -s);
        this.ctx.lineTo(s * 0.7, 0);
        this.ctx.lineTo(0, s);
        this.ctx.lineTo(-s * 0.7, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'sparkle') {
        // 4-pointed anime star (Kira)
        this.ctx.fillStyle = p.color;
        const outer = p.size * (1 - Math.pow(progress, 2) * 0.5);
        const inner = outer * 0.25;
        this.ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const a = (j * Math.PI) / 2;
          this.ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
          const aIn = a + Math.PI / 4;
          this.ctx.lineTo(Math.cos(aIn) * inner, Math.sin(aIn) * inner);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'donut') {
        // Expanding shockwave ring
        const currentRadius = p.size + ((p.width || 100) - p.size) * Math.sin((progress * Math.PI) / 2);
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = Math.max(1, 4 * (1 - progress));
        this.ctx.beginPath();
        this.ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (p.type === 'line') {
        // Radial speed line
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.size * (1 - progress);
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(p.length || 20, 0);
        this.ctx.stroke();
      }

      this.ctx.restore();

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update & render Manga SFX Text
    for (let i = this.sfxImpacts.length - 1; i >= 0; i--) {
      const sfx = this.sfxImpacts[i];
      sfx.life++;

      // Overshoot scale spring animation
      if (sfx.scale < sfx.targetScale) {
        sfx.scale += (sfx.targetScale - sfx.scale) * 0.45;
      }
      sfx.y -= 0.6; // subtle float up

      const progress = sfx.life / sfx.maxLife;
      if (progress > 0.65) {
        sfx.alpha = Math.max(0, 1 - (progress - 0.65) / 0.35);
      }

      this.ctx.save();
      this.ctx.globalAlpha = sfx.alpha;
      this.ctx.translate(sfx.x, sfx.y);
      this.ctx.rotate(sfx.rotation);
      this.ctx.scale(sfx.scale, sfx.scale);

      this.ctx.font = '900 24px "Bricolage Grotesque", "Impact", "Arial Black", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Manga Thick Dark Stroke
      this.ctx.strokeStyle = sfx.strokeColor;
      this.ctx.lineWidth = 6;
      this.ctx.lineJoin = 'miter';
      this.ctx.miterLimit = 3;
      this.ctx.strokeText(sfx.text, 0, 0);

      // Pop Color Fill
      this.ctx.fillStyle = sfx.color;
      this.ctx.fillText(sfx.text, 0, 0);

      this.ctx.restore();

      if (sfx.life >= sfx.maxLife) {
        this.sfxImpacts.splice(i, 1);
      }
    }

    // Hentikan requestAnimationFrame jika partikel habis untuk hemat baterai/GPU
    if (this.particles.length > 0 || this.sfxImpacts.length > 0) {
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.animId = null;
    }
  };
}

let instance: SakugaVfxManager | null = null;

export function getSakugaVfx(): SakugaVfxManager {
  if (!instance) {
    instance = new SakugaVfxManager();
  }
  return instance;
}
