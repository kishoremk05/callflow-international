import { useLayoutEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Animation configurations
export const animationConfig = {
  duration: 0.8,
  ease: 'power3.out',
  staggerDelay: 0.15,
};

// Hook for fade in up animation on scroll
export const useFadeInUp = (options?: { delay?: number; duration?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, y: 60 });

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: options?.duration || animationConfig.duration,
      delay: options?.delay || 0,
      ease: animationConfig.ease,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [options?.delay, options?.duration]);

  return elementRef;
};

// Hook for staggered children animation
export const useStaggerChildren = (options?: { delay?: number; stagger?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y: 40 });

    const animation = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: animationConfig.duration,
      delay: options?.delay || 0,
      stagger: options?.stagger || animationConfig.staggerDelay,
      ease: animationConfig.ease,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
    };
  }, [options?.delay, options?.stagger]);

  return containerRef;
};

// Hook for slide in from left
export const useSlideInLeft = (options?: { delay?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, x: -80 });

    const animation = gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: animationConfig.duration,
      delay: options?.delay || 0,
      ease: animationConfig.ease,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
    };
  }, [options?.delay]);

  return elementRef;
};

// Hook for slide in from right
export const useSlideInRight = (options?: { delay?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, x: 80 });

    const animation = gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: animationConfig.duration,
      delay: options?.delay || 0,
      ease: animationConfig.ease,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
    };
  }, [options?.delay]);

  return elementRef;
};

// Hook for scale animation
export const useScaleIn = (options?: { delay?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, scale: 0.8 });

    const animation = gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: animationConfig.duration,
      delay: options?.delay || 0,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
    };
  }, [options?.delay]);

  return elementRef;
};

// Hook for counter animation
export const useCounterAnimation = (
  targetValue: number,
  options?: { duration?: number; suffix?: string; prefix?: string }
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef({ value: 0 });

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animation = gsap.to(counterRef.current, {
      value: targetValue,
      duration: options?.duration || 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        const prefix = options?.prefix || '';
        const suffix = options?.suffix || '';
        element.textContent = `${prefix}${Math.round(counterRef.current.value).toLocaleString()}${suffix}`;
      },
    });

    return () => {
      animation.kill();
    };
  }, [targetValue, options?.duration, options?.suffix, options?.prefix]);

  return elementRef;
};

// Hook for hero entrance animation
export const useHeroAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Get elements
    const badge = container.querySelector('[data-hero="badge"]');
    const title = container.querySelector('[data-hero="title"]');
    const subtitle = container.querySelector('[data-hero="subtitle"]');
    const ctas = container.querySelector('[data-hero="ctas"]');
    const illustration = container.querySelector('[data-hero="illustration"]');
    const trustBadges = container.querySelector('[data-hero="trust"]');

    // Set initial states
    gsap.set([badge, title, subtitle, ctas, trustBadges], { opacity: 0, y: 40 });
    if (illustration) gsap.set(illustration, { opacity: 0, scale: 0.9, x: 50 });

    // Animate sequence
    tl.to(badge, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(title, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .to(subtitle, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to(ctas, { opacity: 1, y: 0, duration: 0.6 }, 0.8)
      .to(illustration, { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: 'back.out(1.4)' }, 0.5)
      .to(trustBadges, { opacity: 1, y: 0, duration: 0.6 }, 1);

    return () => {
      tl.kill();
    };
  }, []);

  return containerRef;
};

// Hook for parallax effect
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animation = gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
    };
  }, [speed]);

  return elementRef;
};

// Utility function for creating scroll triggers
export const createScrollTrigger = (
  element: Element,
  animation: gsap.core.Tween,
  options?: ScrollTrigger.Vars
) => {
  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    toggleActions: 'play none none reverse',
    animation,
    ...options,
  });
};

// Cleanup function for scroll triggers
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
