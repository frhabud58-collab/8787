import React, { useRef, useEffect } from 'react';

export default function InfiniteTunnel() {
  const tunnelRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const tunnel = tunnelRef.current;
    if (!tunnel) return;

    const frameCount = 40;
    const depthStep = 50;
    const frames: HTMLDivElement[] = [];

    for (let i = 0; i < frameCount; i++) {
      const frame = document.createElement('div');
      frame.style.position = 'absolute';
      frame.style.inset = '0';
      frame.style.borderRadius = '20px';
      frame.style.pointerEvents = 'none';

      const opacity = 1 - i / frameCount;

      if (i % 3 === 0) {
        frame.style.border = '2px solid rgba(212, 166, 61, 0.5)';
        frame.style.boxShadow = '0 0 15px rgba(212,166,61,0.4), inset 0 0 15px rgba(212,166,61,0.2)';
        frame.style.background = 'linear-gradient(45deg, transparent 49%, rgba(212,166,61,0.15) 50%, transparent 51%)';
      } else {
        frame.style.border = '1.5px solid rgba(255,255,255,0.12)';
        frame.style.boxShadow = '0 0 8px rgba(255,255,255,0.05), inset 0 0 8px rgba(255,255,255,0.03)';
        frame.style.background = 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.03) 50%, transparent 51%)';
      }

      frame.style.transform = `translateZ(${i * -depthStep}px)`;
      frame.style.opacity = String(opacity);
      tunnel.appendChild(frame);
      frames.push(frame);
    }

    let offset = 0;
    const animate = () => {
      offset += 0.5;
      if (offset >= depthStep) offset = 0;

      for (let i = 0; i < frames.length; i++) {
        const z = i * -depthStep + offset;
        frames[i].style.transform = `translateZ(${z}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 16;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -16;
    };
    window.addEventListener('mousemove', onMouseMove);

    const smoothFollow = () => {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;
      tunnel.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
      requestAnimationFrame(smoothFollow);
    };
    const followId = requestAnimationFrame(smoothFollow);

    return () => {
      cancelAnimationFrame(animRef.current);
      cancelAnimationFrame(followId);
      window.removeEventListener('mousemove', onMouseMove);
      frames.forEach((f) => f.remove());
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#050510',
        perspective: '800px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        ref={tunnelRef}
        style={{
          position: 'relative',
          width: 'min(60vw, 350px)',
          height: 'min(60vw, 350px)',
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
}
