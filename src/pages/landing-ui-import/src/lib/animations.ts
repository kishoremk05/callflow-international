import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ─── Animation Config ───
export const animConfig = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    slower: 0.8,
    page: 0.5,
  },
  ease: {
    smooth: [0.25, 0.1, 0.25, 1] as const,
    out: [0, 0, 0.2, 1] as const,
    in: [0.4, 0, 1, 1] as const,
    bounce: [0.34, 1.56, 0.64, 1] as const,
    spring: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
};

// ─── GSAP ScrollTrigger Helpers ───

/**
 * Split text into characters and animate them with staggered reveal
 */
export function splitTextReveal(
  element: HTMLElement | string,
  options: {
    trigger?: HTMLElement | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    duration?: number;
    stagger?: number;
    y?: number;
    delay?: number;
  } = {}
) {
  const el =
    typeof element === "string" ? document.querySelector(element) : element;
  if (!el) return null;

  const split = new SplitType(el as HTMLElement, {
    types: "chars,words",
    charClass: "split-char",
    wordClass: "split-word",
  });

  const tl = gsap.timeline({
    scrollTrigger: options.trigger
      ? {
        trigger: options.trigger,
        start: options.start || "top 80%",
        end: options.end || "bottom 20%",
        scrub: options.scrub ?? false,
      }
      : undefined,
  });

  tl.from(split.chars, {
    y: options.y ?? 80,
    opacity: 0,
    duration: options.duration ?? 0.8,
    stagger: options.stagger ?? 0.02,
    ease: "power3.out",
    delay: options.delay ?? 0,
  });

  return { timeline: tl, split };
}

/**
 * Fade-in-up animation triggered by scroll
 */
export function scrollFadeInUp(
  elements: HTMLElement | string | NodeListOf<Element>,
  options: {
    trigger?: HTMLElement | string;
    start?: string;
    stagger?: number;
    duration?: number;
    y?: number;
    delay?: number;
  } = {}
) {
  return gsap.from(elements, {
    y: options.y ?? 60,
    opacity: 0,
    duration: options.duration ?? 0.8,
    stagger: options.stagger ?? 0.1,
    ease: "power3.out",
    delay: options.delay ?? 0,
    scrollTrigger: {
      trigger: options.trigger || elements,
      start: options.start || "top 85%",
    },
  });
}

/**
 * Create a pinned section with scrub-linked animation
 */
export function createPinnedSection(
  triggerEl: HTMLElement | string,
  animation: (tl: gsap.core.Timeline) => void,
  options: {
    start?: string;
    end?: string;
    pin?: boolean | string;
    scrub?: boolean | number;
  } = {}
) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerEl,
      start: options.start || "top top",
      end: options.end || "+=100%",
      pin: options.pin ?? true,
      scrub: options.scrub ?? 1,
      anticipatePin: 1,
    },
  });

  animation(tl);
  return tl;
}

/**
 * Parallax effect for background images
 */
export function parallaxImage(
  imageEl: HTMLElement | string,
  options: {
    trigger?: HTMLElement | string;
    speed?: number;
    start?: string;
    end?: string;
  } = {}
) {
  const speed = options.speed ?? 0.3;

  return gsap.to(imageEl, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: {
      trigger: options.trigger || imageEl,
      start: options.start || "top bottom",
      end: options.end || "bottom top",
      scrub: true,
    },
  });
}

/**
 * Counter animation for stats
 */
export function animateCounter(
  element: HTMLElement,
  endValue: number,
  options: {
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
  } = {}
) {
  const obj = { val: 0 };

  return gsap.to(obj, {
    val: endValue,
    duration: options.duration ?? 2,
    ease: "power2.out",
    onUpdate: () => {
      const formatted =
        options.decimals != null
          ? obj.val.toFixed(options.decimals)
          : Math.floor(obj.val).toString();
      element.textContent = `${options.prefix ?? ""}${formatted}${options.suffix ?? ""}`;
    },
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
    },
  });
}

/**
 * Stagger reveal for grid items
 */
export function staggerReveal(
  container: HTMLElement | string,
  itemSelector: string,
  options: {
    start?: string;
    stagger?: number;
    y?: number;
    duration?: number;
  } = {}
) {
  const containerEl =
    typeof container === "string"
      ? document.querySelector(container)
      : container;
  if (!containerEl) return null;

  const items = containerEl.querySelectorAll(itemSelector);

  return gsap.from(items, {
    y: options.y ?? 40,
    opacity: 0,
    duration: options.duration ?? 0.6,
    stagger: options.stagger ?? 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: containerEl,
      start: options.start || "top 80%",
    },
  });
}

// ─── Framer Motion Variants (kept for page transitions) ───

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: animConfig.duration.slow,
      ease: animConfig.ease.smooth,
      delay,
    },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: {
      duration: animConfig.duration.normal,
      delay,
    },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: animConfig.stagger.normal,
    },
  },
};

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animConfig.duration.page,
      ease: animConfig.ease.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: animConfig.duration.fast,
    },
  },
};
