import React, { useEffect, useRef } from 'react';

const ParticleAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 30 : 80;
    const CONNECT_DIST = 150;
    const MOUSE_RADIUS = 200;
    const REPEL_FORCE = 3;
    const CELL_SIZE = CONNECT_DIST;

    let mouse = { x: -9999, y: -9999 };
    let grid: Record<string, Particle[]> = {};

    class Particle {
      x: number; y: number; vx: number; vy: number;
      baseSize: number; hue: number; hueSpeed: number;
      phase: number; phaseSpeed: number; index: number;

      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.9;
        this.vy = (Math.random() - 0.5) * 0.9;
        this.baseSize = Math.random() * 2 + 1;
        this.hue = Math.random() * 120 + 180;
        this.hueSpeed = (Math.random() - 0.5) * 0.3;
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) ** 2 * REPEL_FORCE;
          this.vx += (dx / dist) * force * 0.12;
          this.vy += (dy / dist) * force * 0.12;
        }
        this.vx *= 0.98;
        this.vy *= 0.98;
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > 2.5) { this.vx = (this.vx / spd) * 2.5; this.vy = (this.vy / spd) * 2.5; }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20) this.x = W + 20;
        if (this.x > W + 20) this.x = -20;
        if (this.y < -20) this.y = H + 20;
        if (this.y > H + 20) this.y = -20;
        this.hue = (this.hue + this.hueSpeed + 360) % 360;
        this.phase += this.phaseSpeed;
      }

      get size() { return this.baseSize + Math.sin(this.phase) * 0.6; }
      get color() { return `hsl(${this.hue}, 100%, 65%)`; }

      draw() {
        const s = this.size;
        ctx.shadowBlur = 8 + Math.sin(this.phase) * 4;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function cellKey(x: number, y: number) {
      return `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`;
    }

    function buildGrid(particles: Particle[]) {
      grid = {};
      for (const p of particles) {
        const k = cellKey(p.x, p.y);
        if (!grid[k]) grid[k] = [];
        grid[k].push(p);
      }
    }

    function getNeighbors(p: Particle) {
      const cx = Math.floor(p.x / CELL_SIZE);
      const cy = Math.floor(p.y / CELL_SIZE);
      const result: Particle[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const k = `${cx + dx},${cy + dy}`;
          if (grid[k]) result.push(...grid[k]);
        }
      }
      return result;
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const p = new Particle();
      p.index = i;
      return p;
    });

    function animate() {
      ctx.fillStyle = 'rgba(3, 3, 14, 0.18)';
      ctx.fillRect(0, 0, W, H);
      buildGrid(particles);
      for (const p of particles) p.update();
      const drawn = new Set<string>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const neighbors = getNeighbors(p);
        for (const q of neighbors) {
          if (q === p) continue;
          const id = i < q.index ? `${i}-${q.index}` : `${q.index}-${i}`;
          if (drawn.has(id)) continue;
          drawn.add(id);
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.6;
            const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`);
            grad.addColorStop(1, `hsla(${q.hue}, 100%, 70%, ${alpha})`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = alpha * 2;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        p.draw();
      }
      requestAnimationFrame(animate);
    }

    const handleResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
  );
};

export default ParticleAnimation;
