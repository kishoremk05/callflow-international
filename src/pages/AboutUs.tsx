import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Globe,
  Heart,
  Award,
  Target,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import BrandLogo from "@/components/branding/BrandLogo";
import "./about-us.css";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "Analysis" },
    { href: "/pricing", label: "Pricing" },
  ];

  const values = [
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "We connect people across 200+ countries, removing communication barriers for global teams.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description:
        "Every product decision starts with user outcomes, service trust, and long-term reliability.",
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description:
        "We maintain strict quality standards for call clarity, routing stability, and uptime.",
    },
    {
      icon: Target,
      title: "Focused Innovation",
      description:
        "We ship practical innovations that directly improve communication speed and team efficiency.",
    },
  ];

  const teamStats = [
    {
      role: "Engineering",
      count: "50+",
      description: "World-class developers",
    },
    { role: "Support", count: "24/7", description: "Always here to help" },
    { role: "Countries", count: "200+", description: "Global coverage" },
    { role: "Customers", count: "100K+", description: "Happy users worldwide" },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description:
        "Palodial launched with a mission to make international calling accessible, clear, and affordable.",
    },
    {
      year: "2021",
      title: "Global Expansion",
      description:
        "Coverage grew to 100+ countries with improved voice quality and lower latency routing.",
    },
    {
      year: "2022",
      title: "100K Users",
      description:
        "We reached 100,000 active users across startups, distributed teams, and enterprises.",
    },
    {
      year: "2023",
      title: "Enterprise Launch",
      description:
        "Organization tools, permissions, wallet controls, and admin workflows were introduced.",
    },
    {
      year: "2024",
      title: "API Platform",
      description:
        "Developers gained public API access to embed calling workflows in their own products.",
    },
  ];

  const currentPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const isNavItemActive = (href: string) => {
    const normalizedHref =
      href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
    return currentPath === normalizedHref;
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!titleRef.current) return;

    const lines = titleRef.current.querySelectorAll(".about-title-line");
    if (!lines.length) return;

    const tl = gsap.timeline();
    tl.fromTo(
      lines,
      {
        x: -110,
        opacity: 0,
        filter: "blur(12px)",
      },
      {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.88,
        stagger: 0.14,
        ease: "power3.out",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-about-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-about-card]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 52, opacity: 0, rotateX: -6 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.82,
            delay: i * 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
            },
          },
        );
      });
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="about-page min-h-screen bg-dark text-on-dark">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 mix-blend-difference">
        <a
          href="/"
          className="text-on-dark font-display text-xl md:text-2xl tracking-widest"
          onClick={closeMenu}
        >
          <BrandLogo
            iconClassName="text-lime"
            textClassName="font-display text-xl md:text-2xl tracking-widest text-on-dark uppercase"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-display text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/signup"
            className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-5 py-2 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
          >
            Get Started
          </a>
        </nav>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] z-50 relative"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--lime)_/_0.18),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--dark-card))_0%,hsl(var(--dark))_100%)] opacity-95" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`relative z-10 font-display text-4xl tracking-widest uppercase transition-colors ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}

          <p className="absolute bottom-8 text-lime/50 text-xs font-body tracking-widest uppercase">
            Global Communication, Zero Boundaries
          </p>
        </div>
      ) : null}

      <section
        className="features-hero-shell relative z-20 pt-[118px] md:pt-[132px] pb-16 md:pb-20 px-6 md:px-12"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 5%) 0%, hsl(220 8% 7%) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <p className="font-body text-xs tracking-[0.28em] uppercase text-lime/70 mb-5">
              About
            </p>
            <h1
              ref={titleRef}
              className="font-display text-[4.1rem] md:text-[8.6rem] lg:text-[9.3rem] leading-[0.86] text-on-dark uppercase tracking-[-0.02em]"
            >
              <span className="about-title-line block">About</span>
              <span className="about-title-line block">Palodial</span>
            </h1>
            <p className="font-body text-[1.05rem] text-muted-dark mt-6 leading-relaxed max-w-3xl">
              We build communication software that makes global conversations
              feel local, stable, and effortless.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 bg-dark-lighter">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {teamStats.map((stat, index) => (
            <div
              key={stat.role}
              className={`text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 ${index === 0 ? "border-l-0" : ""}`}
            >
              <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
                {stat.count}
              </p>
              <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark mb-1">
                {stat.role}
              </p>
              <p className="font-body text-xs text-muted-dark">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div
            data-about-reveal
            className="about-panel rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="w-5 h-5 text-lime" />
              <p className="font-display text-sm tracking-[0.2em] uppercase text-lime/80">
                Mission
              </p>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.9] text-on-dark uppercase mb-6">
              Connecting The World,
              <br />
              One Call At A Time
            </h2>
            <p className="font-body text-[1.06rem] leading-relaxed text-muted-dark max-w-4xl">
              Distance should never block meaningful connection. We are
              committed to crystal-clear and affordable international calling
              that brings people together across borders, cultures, and time
              zones. Through reliable infrastructure and thoughtful product
              design, we make the world feel closer.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div data-about-reveal className="mb-12 md:mb-14">
            <p className="font-display text-sm tracking-[0.2em] uppercase text-lime/80 mb-4">
              Core Values
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark leading-[0.9] uppercase">
              Principles That Guide Us
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {values.map((value) => (
              <article
                key={value.title}
                data-about-card
                className="about-panel rounded-2xl p-6 md:p-7 group"
              >
                <div className="w-12 h-12 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                  <value.icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="font-display text-2xl uppercase text-on-dark mb-3 leading-[1.05]">
                  {value.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-dark mb-5">
                  {value.description}
                </p>
                <div className="flex items-center gap-2 text-lime/85 font-display text-xs tracking-[0.15em] uppercase">
                  Learn More
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div data-about-reveal className="mb-12 md:mb-14">
            <p className="font-display text-sm tracking-[0.2em] uppercase text-lime/80 mb-4">
              Company Journey
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark leading-[0.9] uppercase">
              Milestones
            </h2>
          </div>

          <div className="space-y-5 md:space-y-6">
            {milestones.map((milestone) => (
              <article
                key={milestone.year}
                data-about-card
                className="about-panel rounded-2xl p-6 md:p-8"
              >
                <div className="grid md:grid-cols-[120px_1fr] gap-5 md:gap-8 items-start">
                  <p className="font-display text-4xl md:text-5xl leading-none text-lime">
                    {milestone.year}
                  </p>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl uppercase text-on-dark mb-2">
                      {milestone.title}
                    </h3>
                    <p className="font-body text-sm md:text-[0.96rem] text-muted-dark leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div
            data-about-reveal
            className="about-panel rounded-2xl p-8 md:p-12 text-center"
          >
            <p className="font-display text-sm tracking-[0.2em] uppercase text-lime/80 mb-4">
              Careers
            </p>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.9] text-on-dark uppercase mb-5">
              Build The Future Of Global Calling
            </h2>
            <p className="font-body text-muted-dark text-[1.03rem] max-w-3xl mx-auto leading-relaxed mb-8">
              We are looking for ambitious people who care about quality,
              ownership, and real-world communication impact.
            </p>
            <a
              href="/careers"
              className="inline-flex items-center gap-2 font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-6 py-3 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
            >
              View Open Positions
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AboutUs;
