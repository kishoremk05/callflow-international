import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Split by "chars", "words", or "lines" */
  splitBy?: "chars" | "words" | "lines";
  /** Stagger delay between each animated unit */
  stagger?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Y offset for the entrance */
  y?: number;
  /** Scroll trigger start position */
  start?: string;
  /** Extra delay before animation starts */
  delay?: number;
  /** Whether to use scroll trigger or animate on mount */
  onScroll?: boolean;
}

const SplitText = ({
  children,
  className = "",
  as: Tag = "h2",
  splitBy = "chars",
  stagger = 0.02,
  duration = 0.8,
  y = 80,
  start = "top 80%",
  delay = 0,
  onScroll = true,
}: SplitTextProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const split = new SplitType(ref.current, {
      types: splitBy === "lines" ? "lines" : splitBy === "words" ? "words" : "chars,words",
      charClass: "split-char",
      wordClass: "split-word",
    });

    const targets =
      splitBy === "chars"
        ? split.chars
        : splitBy === "words"
        ? split.words
        : split.lines;

    if (!targets || targets.length === 0) return;

    // Set initial state
    gsap.set(targets, { y, opacity: 0 });

    const animOptions: gsap.TweenVars = {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      ease: "power3.out",
      delay,
    };

    if (onScroll) {
      animOptions.scrollTrigger = {
        trigger: ref.current,
        start,
      };
    }

    const anim = gsap.to(targets, animOptions);

    return () => {
      anim.kill();
      split.revert();
    };
  }, [children, splitBy, stagger, duration, y, start, delay, onScroll]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
};

export default SplitText;
