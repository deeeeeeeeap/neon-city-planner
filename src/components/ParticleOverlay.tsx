import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Particle } from '../types';

export interface ParticleHandle {
  spawn: (x: number, y: number, type: Particle['type']) => void;
  spawnIncome: (x: number, y: number, amount: number) => void;
}

const ParticleOverlay = forwardRef<ParticleHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    spawn: (x, y, type) => {
      const count = type === 'dust' ? 8 : type === 'smoke' ? 3 : 5;
      for (let index = 0; index < count; index += 1) {
        particlesRef.current.push({
          id: Math.random(),
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - (type === 'smoke' ? 2 : 0),
          life: 1,
          maxLife: 1,
          color: type === 'dust' ? '#cbd5e1' : type === 'smoke' ? '#475569' : '#fbbf24',
          size: Math.random() * 4 + 2,
          type,
        });
      }
    },
    spawnIncome: (x, y, amount) => {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y: y - 20,
        vx: 0,
        vy: -1.5,
        life: 1,
        maxLife: 1.5,
        color: amount > 0 ? '#4ade80' : '#f87171',
        size: 14,
        type: 'text',
        text: amount > 0 ? `+$${amount}` : `-$${Math.abs(amount)}`,
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;

        if (particle.type === 'smoke') {
          particle.size += 0.1;
        }

        context.globalAlpha = Math.max(0, particle.life);

        if (particle.type === 'text' && particle.text) {
          context.font = `bold ${particle.size}px "JetBrains Mono", monospace`;
          context.fillStyle = particle.color;
          context.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          context.lineWidth = 2;
          context.strokeText(particle.text, particle.x, particle.y);
          context.fillText(particle.text, particle.x, particle.y);
        } else {
          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context.fill();
        }
      });

      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);
      context.globalAlpha = 1;
      frameIdRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[80]" />;
});

ParticleOverlay.displayName = 'ParticleOverlay';

export default ParticleOverlay;
