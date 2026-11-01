'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  color: string;
  isWine: boolean;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  glow: boolean;
}

interface PlatinumWineParticlesProps {
  className?: string;
  particleCount?: number;
}

export const PlatinumWineParticles: React.FC<PlatinumWineParticlesProps> = ({
  className = '',
  particleCount = 95,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
    };

    // Color definitions
    // 70% Platinum / Silver, 30% Deep Wine / Velvet Ruby
    const platinumColors = [
      '#FFFFFF',
      '#F8FAFC',
      '#E2E8F0',
      '#CBD5E1',
      '#94A3B8',
    ];

    const wineColors = [
      '#881337', // Deep rose/wine
      '#9F1239', // Ruby crimson
      '#BE123C', // Vivid ruby glow
      '#4C0519', // Black cherry / dark velvet
      '#E11D48', // Electric crimson ember
    ];

    // Determine count based on screen width
    const targetCount =
      width < 640 ? Math.floor(particleCount * 0.5) : particleCount;

    const particles: Particle[] = [];

    for (let i = 0; i < targetCount; i++) {
      const isWine = Math.random() < 0.32; // ~32% Wine red, ~68% Platinum
      const color = isWine
        ? wineColors[Math.floor(Math.random() * wineColors.length)]
        : platinumColors[Math.floor(Math.random() * platinumColors.length)];

      const baseRadius = isWine
        ? Math.random() * 1.8 + 1.2 // 1.2px - 3.0px for glowing wine embers
        : Math.random() * 1.4 + 0.8; // 0.8px - 2.2px for platinum motes

      const baseAlpha = isWine
        ? Math.random() * 0.45 + 0.25 // More visible for deep color
        : Math.random() * 0.4 + 0.15; // Shimmering platinum

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseRadius,
        baseRadius,
        color,
        isWine,
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.25, // Gentle lateral wander
        vy: -(Math.random() * 0.45 + 0.15), // Slow organic upward drift
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        glow: isWine || Math.random() < 0.25,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Organic swaying and upward drift
        p.x += p.vx + Math.sin(time * 0.5 + p.phase) * 0.25;
        p.y += p.vy;

        // 2. Breathing / Twinkling opacity
        const twinkle = Math.sin(time * 2 * p.speed + p.phase) * 0.15;
        p.alpha = Math.max(0.08, Math.min(0.85, p.baseAlpha + twinkle));

        // 3. Interactive Mouse Deflection (Gentle push away)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
        }

        // 4. Wrap around boundaries smoothly
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // 5. Draw particle with optional glowing aura
        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.glow) {
          // Soft ambient glow halo
          ctx.shadowBlur = p.isWine ? 10 : 6;
          ctx.shadowColor = p.color;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-[1] w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
