import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  driftSeed: number;
}

const DESKTOP_PARTICLE_COUNT = 80;
const MOBILE_PARTICLE_COUNT = 52;
const DESKTOP_CONNECTION_DISTANCE = 150;
const MOBILE_CONNECTION_DISTANCE = 120;
const POINTER_RADIUS = 200;
const POINTER_FORCE = 0.02;
const AMBIENT_DRIFT = 0.015;

const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animationRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });
  const settingsRef = useRef({
    particleCount: DESKTOP_PARTICLE_COUNT,
    connectionDistance: DESKTOP_CONNECTION_DISTANCE,
  });

  const createParticles = useCallback((w: number, h: number, count: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.35 + 0.15,
        driftSeed: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Resize handler
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      const isMobile = window.innerWidth < 768;

      settingsRef.current = {
        particleCount: isMobile
          ? MOBILE_PARTICLE_COUNT
          : DESKTOP_PARTICLE_COUNT,
        connectionDistance: isMobile
          ? MOBILE_CONNECTION_DISTANCE
          : DESKTOP_CONNECTION_DISTANCE,
      };

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      dimensionsRef.current = { w, h };

      // Reinit particles when resized
      particlesRef.current = createParticles(
        w,
        h,
        settingsRef.current.particleCount,
      );
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Mouse tracking (relative to canvas)
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Attach to the parent so it captures events even though canvas is pointer-events: none
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("touchmove", handleTouchMove, { passive: true });
    parent.addEventListener("touchend", handleMouseLeave);
    parent.addEventListener("touchcancel", handleMouseLeave);

    // Gold accent tuned to the warm yellow palette
    const LIME_R = 232;
    const LIME_G = 178;
    const LIME_B = 74;

    // Animation loop
    const animate = () => {
      const { w, h } = dimensionsRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const { connectionDistance } = settingsRef.current;
      const time = performance.now() * 0.001;

      ctx.clearRect(0, 0, w, h);

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction — gentle repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < POINTER_RADIUS && dist > 0) {
          const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Ambient drift keeps the network visibly alive on touch devices.
        p.vx += Math.sin(time * 0.9 + p.driftSeed) * AMBIENT_DRIFT;
        p.vy += Math.cos(time * 0.75 + p.driftSeed) * AMBIENT_DRIFT;

        // Damping
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${LIME_R}, ${LIME_G}, ${LIME_B}, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${LIME_R}, ${LIME_G}, ${LIME_B}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw brighter connections near mouse
      if (mouse.x > -999) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < POINTER_RADIUS) {
            const alpha = (1 - dist / POINTER_RADIUS) * 0.25;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${LIME_R}, ${LIME_G}, ${LIME_B}, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      ro.disconnect();
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("touchmove", handleTouchMove);
      parent.removeEventListener("touchend", handleMouseLeave);
      parent.removeEventListener("touchcancel", handleMouseLeave);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1]"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default ParticleNetwork;
