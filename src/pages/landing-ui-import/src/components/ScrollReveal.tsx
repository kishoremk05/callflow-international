import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  start?: string;
}

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  y = 40,
  duration = 0.8,
  start = "top 85%",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.set(ref.current, { y, opacity: 0 });

    const anim = gsap.to(ref.current, {
      y: 0,
      opacity: 1,
      duration,
      ease: "power3.out",
      delay,
      scrollTrigger: {
        trigger: ref.current,
        start,
      },
    });

    return () => {
      anim.kill();
    };
  }, [delay, y, duration, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
