import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/SplitText";
import ScrollReveal from "@/components/ScrollReveal";
import {
  companyInfo,
  features,
  integrations,
  pricingTiers,
  stats,
  testimonials,
} from "@/lib/data";
import ParticleNetwork from "@/components/ParticleNetwork";

gsap.registerPlugin(ScrollTrigger);

/* Showcase stats for the zoom-out reveal */
const showcaseStats = [
  { number: "10M+", label: "Calls Made" },
  { number: "50+", label: "Countries" },
  { number: "99.9%", label: "Uptime SLA" },
];

const partnerLogos = [
  "Twilio",
  "LiveKit",
  "Stripe",
  "Slack",
  "Salesforce",
  "HubSpot",
  "Zapier",
];

/* Premium features for horizontal scroll section */
const premiumFeatures = [
  {
    icon: "🎧",
    title: "HD Voice Quality",
    desc: "Crystal-clear audio on every call with adaptive bitrate and automatic network optimization.",
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Audio Quality", value: "HD+" },
    ],
  },
  {
    icon: "🌐",
    title: "Browser Calling",
    desc: "Make HD calls directly from your browser. No apps or downloads required, just instant connectivity.",
    stats: [
      { label: "Load Time", value: "<2s" },
      { label: "Compatibility", value: "100%" },
    ],
  },
  {
    icon: "🔒",
    title: "Secure Wallet",
    desc: "Manage your credits securely with multiple payment options and instant fund transfers.",
    stats: [
      { label: "Encryption", value: "AES-256" },
      { label: "Payment Methods", value: "10+" },
    ],
  },
  {
    icon: "🔗",
    title: "Powerful Integrations",
    desc: "Connect seamlessly with your favorite tools — Twilio, Stripe, Slack, and 50+ more.",
    stats: [
      { label: "Integrations", value: "50+" },
      { label: "API & Webhooks", value: "✓" },
    ],
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    desc: "Host internal voice meetings and collaborate with your team seamlessly across the globe.",
    stats: [
      { label: "Team Size", value: "Unlimited" },
      { label: "Internal Calls", value: "Free" },
    ],
  },
  {
    icon: "📱",
    title: "Virtual Numbers",
    desc: "Get local phone numbers from 70+ countries for your business presence worldwide.",
    stats: [
      { label: "Countries", value: "70+" },
      { label: "Setup Time", value: "Instant" },
    ],
  },
  {
    icon: "📊",
    title: "Call Analytics",
    desc: "Track usage, monitor costs, and optimize your communication spending with detailed insights.",
    stats: [
      { label: "Total Calls", value: "2,547" },
      { label: "Avg Duration", value: "18:42" },
      { label: "Cost Saved", value: "$1,345" },
    ],
  },
  {
    icon: "🎙️",
    title: "Conference Calling",
    desc: "Host multi-party conference calls with crystal-clear audio for seamless group discussions.",
    stats: [
      { label: "Participants", value: "50+" },
      { label: "Audio Quality", value: "HD" },
      { label: "Duration", value: "Unlimited" },
    ],
  },
];

const Index = () => {
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const featuresScrollRef = useRef<HTMLElement>(null);
  const featuresTrackRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero pinned zoom-out with showcase reveal
    if (heroWrapperRef.current && heroRef.current && showcaseRef.current) {
      const tagline = showcaseRef.current.querySelector(".sc-tagline");
      const statItems = showcaseRef.current.querySelectorAll(".sc-stat");
      const desc = showcaseRef.current.querySelector(".sc-desc");
      const logoDivider = showcaseRef.current.querySelector(".sc-logo-divider");
      const logos = showcaseRef.current.querySelectorAll(".sc-logo");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapperRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Zoom out the hero section
      tl.to(
        heroRef.current,
        {
          scale: 0.65,
          borderRadius: "24px",
          opacity: 0,
          ease: "none",
        },
        0,
      );

      // Fade out hero content slightly faster
      if (heroContentRef.current) {
        tl.to(
          heroContentRef.current,
          { opacity: 0, scale: 0.9, ease: "none" },
          0,
        );
      }

      // Reveal tagline
      if (tagline) {
        tl.fromTo(
          tagline,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, ease: "power3.out" },
          0.1,
        );
      }

      // Reveal stat items with stagger
      if (statItems.length) {
        tl.fromTo(
          statItems,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06, ease: "power3.out" },
          0.15,
        );
      }

      // Reveal description
      if (desc) {
        tl.fromTo(
          desc,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: "power3.out" },
          0.3,
        );
      }

      // Reveal logo divider + logos
      if (logoDivider) {
        tl.fromTo(
          logoDivider,
          { scaleX: 0 },
          { scaleX: 1, ease: "power2.out" },
          0.35,
        );
      }
      if (logos.length) {
        tl.fromTo(
          logos,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.03, ease: "power2.out" },
          0.4,
        );
      }
    }

    // Stats counter animation
    if (statsRef.current) {
      const counters = statsRef.current.querySelectorAll("[data-counter]");
      counters.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-counter") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        const prefix = el.getAttribute("data-prefix") || "";
        const decimals = el.getAttribute("data-decimals");
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2.5,
          ease: "power2.out",
          onUpdate: () => {
            const formatted =
              decimals != null
                ? obj.val.toFixed(parseInt(decimals))
                : Math.floor(obj.val).toString();
            (el as HTMLElement).textContent = `${prefix}${formatted}${suffix}`;
          },
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    }

    // Quote blur-to-normal word reveal
    if (quoteRef.current) {
      const words = quoteRef.current.querySelectorAll(".quote-word");
      if (words.length) {
        gsap.fromTo(
          words,
          {
            opacity: 0,
            filter: "blur(8px)",
            x: -30,
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            x: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: quoteRef.current,
              start: "top 80%",
              end: "top 30%",
              scrub: 1,
            },
          },
        );
      }
    }

    // Horizontal scroll for premium features
    if (featuresScrollRef.current && featuresTrackRef.current) {
      const track = featuresTrackRef.current;
      const scrollDistance = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: featuresScrollRef.current,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }

    // How It Works - blur-to-clear step reveal (uses onEnter for reliability after pin)
    if (howItWorksRef.current) {
      const steps = howItWorksRef.current.querySelectorAll(".hiw-step");
      if (steps.length) {
        gsap.set(steps, { opacity: 0, filter: "blur(12px)", y: 50 });

        const hiwAnim = gsap.to(steps, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power3.out",
          paused: true,
        });

        ScrollTrigger.create({
          trigger: howItWorksRef.current,
          start: "top 85%",
          onEnter: () => hiwAnim.play(),
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="bg-dark min-h-screen">
      {/* ===== HERO WITH ZOOM-OUT ===== */}
      <div ref={heroWrapperRef} className="hero-zoom-wrapper">
        {/* Showcase - clean stats reveal behind hero */}
        <div ref={showcaseRef} className="hero-showcase-bg">
          {/* Tagline */}
          <p className="sc-tagline">TRUSTED BY TEAMS WORLDWIDE</p>

          {/* Large stats row */}
          <div className="sc-stats-row">
            {showcaseStats.map((stat) => (
              <div key={stat.label} className="sc-stat">
                <span className="sc-stat-number">{stat.number}</span>
                <span className="sc-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="sc-desc">
            One platform for calls, meetings, and enterprise voice — from any
            browser, anywhere.
          </p>

          {/* Divider + partner logos */}
          <div className="sc-logo-divider" />
          <div className="sc-logos-row">
            {partnerLogos.map((name) => (
              <span key={name} className="sc-logo">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Hero section (on top, zooms out) */}
        <section
          ref={heroRef}
          className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center"
          style={{ transformOrigin: "center center" }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, hsl(var(--lime) / 0.08) 0%, hsl(220 8% 6%) 70%)",
            }}
          >
            {/* Animated particle network */}
            <ParticleNetwork />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-dark" />
          </div>

          {/* Hero content */}
          <div
            ref={heroContentRef}
            className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
          >
            <SplitText
              as="p"
              className="text-lime font-body text-sm tracking-[0.3em] uppercase mb-6"
              splitBy="words"
              stagger={0.05}
              duration={0.6}
              y={30}
              onScroll={false}
              delay={0.3}
            >
              {companyInfo.product}
            </SplitText>

            <SplitText
              as="h1"
              className="font-display text-[clamp(3.75rem,18vw,5.5rem)] sm:text-[7rem] md:text-[11rem] lg:text-[13rem] xl:text-[15rem] leading-[0.82] text-on-dark tracking-tighter"
              splitBy="chars"
              stagger={0.03}
              duration={0.9}
              y={100}
              onScroll={false}
              delay={0.5}
            >
              CALLFLOW
            </SplitText>

            <SplitText
              as="p"
              className="text-muted-dark font-body text-base md:text-lg max-w-2xl mx-auto mt-8"
              splitBy="words"
              stagger={0.03}
              duration={0.6}
              y={20}
              onScroll={false}
              delay={1.2}
            >
              {companyInfo.description}
            </SplitText>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ScrollReveal delay={1.5} y={20}>
                <Link
                  to="/pricing"
                  className="inline-block font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-8 py-4 hover:bg-lime/90 transition-all duration-300 glow-lime"
                >
                  Start Free Trial
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={1.7} y={20}>
                <Link
                  to="/features"
                  className="inline-block font-display text-sm tracking-[0.2em] uppercase text-on-dark border border-lime/30 px-8 py-4 hover:border-lime hover:text-lime transition-all duration-300"
                >
                  Explore Features
                </Link>
              </ScrollReveal>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-[1px] h-12 bg-gradient-to-b from-lime/0 to-lime animate-pulse" />
          </div>
        </section>
      </div>

      {/* ===== MARQUEE BANNER ===== */}
      <div className="bg-dark-lighter border-y border-lime/10 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 font-display text-sm text-lime tracking-[0.3em] uppercase"
            >
              {companyInfo.tagline}
            </span>
          ))}
        </div>
      </div>

      {/* ===== QUOTE / VALUE PROPOSITION ===== */}
      <section
        className="relative py-28 md:py-44 px-6 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(var(--lime) / 0.04) 0%, hsl(220 8% 6%) 60%)",
        }}
      >
        {/* Subtle decorative lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--lime)) 1px, transparent 1px)",
            backgroundSize: "100% 60px",
          }}
        />

        <div
          ref={quoteRef}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <p
            className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-10 quote-word"
            style={{ display: "inline-block" }}
          >
            Why CallFlow
          </p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-on-dark leading-[1.1] tracking-tight uppercase">
            <span className="quote-word font-serif-accent">Redefining</span>{" "}
            <span className="quote-word">global</span>{" "}
            <span className="quote-word">communication.</span>{" "}
            <span className="quote-word">One</span>{" "}
            <span className="quote-word">platform</span>{" "}
            <span className="quote-word">for</span>{" "}
            <span className="quote-word font-serif-accent">calls,</span>{" "}
            <span className="quote-word font-serif-accent">meetings,</span>{" "}
            <span className="quote-word">and</span>{" "}
            <span className="quote-word">enterprise</span>{" "}
            <span className="quote-word font-serif-accent">voice</span>{" "}
            <span className="quote-word">—</span>{" "}
            <span className="quote-word">from</span>{" "}
            <span className="quote-word">any</span>{" "}
            <span className="quote-word">browser,</span>{" "}
            <span className="quote-word">anywhere</span>{" "}
            <span className="quote-word">in</span>{" "}
            <span className="quote-word">the</span>{" "}
            <span className="quote-word">world.</span>
          </h2>
        </div>
      </section>

      {/* ===== PREMIUM FEATURES - HORIZONTAL SCROLL ===== */}
      <section
        ref={featuresScrollRef}
        className="relative h-screen overflow-hidden"
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--lime-dark)) 2px, transparent 2px), linear-gradient(90deg, hsl(var(--lime-dark)) 2px, transparent 2px)",
              backgroundSize: "120px 120px",
            }}
          />
          {/* Radial glow behind the grid */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(var(--lime) / 0.04) 0%, transparent 60%)",
            }}
          />
          {/* Edge fade so grid blends into dark */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-dark" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark opacity-60" />
        </div>

        {/* Single horizontal track - header + zig-zag cards all scroll together */}
        <div
          ref={featuresTrackRef}
          className="absolute top-0 left-0 flex items-center gap-8 h-full"
          style={{ paddingLeft: "4vw", paddingRight: "20vw" }}
        >
          {/* Header card */}
          <div className="flex-shrink-0 w-[320px] md:w-[380px] flex flex-col justify-center pr-4">
            <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-4">
              ⊕ Premium Features
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-on-dark leading-[1.05] uppercase mb-2">
              Built for teams,
            </h2>
            <h3 className="font-display text-2xl md:text-4xl leading-tight uppercase mb-4">
              <span className="font-serif-accent">powered by simplicity</span>
            </h3>
            <p className="text-muted-dark font-body text-xs leading-relaxed max-w-[280px]">
              Everything you need for seamless global communication, wrapped in
              a beautiful interface
            </p>
          </div>

          {/* Feature cards - zig-zag */}
          {premiumFeatures.map((feat, i) => (
            <div
              key={feat.title}
              className="pf-card flex-shrink-0 w-[280px] md:w-[300px] bg-dark-lighter border border-lime/10 p-6 hover:border-lime/30 transition-all duration-500 group rounded-sm"
              style={{ marginTop: i % 2 === 0 ? "-60px" : "60px" }}
            >
              <span className="text-2xl mb-3 block">{feat.icon}</span>
              <h4 className="font-display text-lg text-on-dark tracking-wider mb-1.5 group-hover:text-lime transition-colors">
                {feat.title}
              </h4>
              <p className="font-body text-[11px] text-muted-dark leading-relaxed mb-5">
                {feat.desc}
              </p>
              {/* Stats */}
              <div className="space-y-2">
                {feat.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between border-t border-lime/5 pt-1.5"
                  >
                    <span className="font-body text-[10px] text-muted-dark">
                      {stat.label}
                    </span>
                    <span className="font-display text-xs text-lime tracking-wider">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECOND QUOTE ===== */}
      <section className="relative z-20 bg-dark py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SplitText
            as="p"
            className="font-display text-2xl md:text-4xl text-on-dark leading-snug"
            splitBy="words"
            stagger={0.04}
            duration={0.7}
          >
            {companyInfo.secondQuote}
          </SplitText>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        ref={howItWorksRef}
        className="relative z-20 py-28 md:py-40 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 9%) 100%)",
        }}
      >
        {/* Decorative organic curves */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute w-full h-full opacity-[0.06]"
            viewBox="0 0 1200 600"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 C300,100 600,350 1200,150"
              stroke="hsl(var(--lime-dark))"
              strokeWidth="1.5"
            />
            <path
              d="M0,400 C400,300 800,500 1200,350"
              stroke="hsl(var(--lime-dark))"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section label */}
          <ScrollReveal>
            <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-6 text-center">
              Simple Process
            </p>
          </ScrollReveal>

          {/* 3-column steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
            {/* Step 1 */}
            <ScrollReveal delay={0}>
              <div className="text-center px-8 py-12 md:border-r border-lime/10 hiw-step">
                <div className="mb-6">
                  <span
                    className="font-serif-accent text-8xl md:text-[10rem] leading-none"
                    style={{
                      WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                      color: "transparent",
                    }}
                  >
                    01
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                  Open
                </h3>
                <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                  <span className="font-serif-accent">Your Browser</span>
                </h4>
                <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                  No downloads needed. Simply visit our website from any modern
                  browser on desktop or mobile.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={0.1}>
              <div className="text-center px-8 py-12 md:border-r border-lime/10 hiw-step">
                <div className="mb-6">
                  <span
                    className="font-serif-accent text-8xl md:text-[10rem] leading-none"
                    style={{
                      WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                      color: "transparent",
                    }}
                  >
                    02
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                  Create Free
                </h3>
                <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                  <span className="font-serif-accent">Account</span>
                </h4>
                <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                  Quick signup with email or Google. Add credits to your wallet
                  and you're ready to call anywhere.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={0.2}>
              <div className="text-center px-8 py-12 hiw-step">
                <div className="mb-6">
                  <span
                    className="font-serif-accent text-8xl md:text-[10rem] leading-none"
                    style={{
                      WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                      color: "transparent",
                    }}
                  >
                    03
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                  Start Calling
                </h3>
                <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                  <span className="font-serif-accent">Worldwide</span>
                </h4>
                <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                  Dial any number worldwide with crystal-clear HD quality. Track
                  usage and manage contacts easily.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* CTA */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 font-display text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
                style={{
                  background: "hsl(var(--lime-dark))",
                  color: "hsl(220 8% 10%)",
                }}
              >
                Get Started Free →
              </a>
              <p className="font-body text-xs mt-4 text-muted-dark">
                No credit card required
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== VOIP / MEETINGS SPLIT ===== */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        {/* VoIP Calls */}
        <Link
          to="/features"
          className="relative group overflow-hidden flex items-end p-8 md:p-12 min-h-[50vh]"
          style={{
            background:
              "linear-gradient(135deg, hsl(220 8% 10%) 0%, hsl(220 8% 14%) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, hsl(var(--lime)) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
          <div className="relative z-10">
            <ScrollReveal>
              <h2 className="font-display text-6xl md:text-8xl text-on-dark leading-none">
                VOIP
                <br />
                <span className="text-lime">CALLS</span>
              </h2>
              <p className="mt-4 text-on-dark/70 font-body text-sm max-w-xs">
                Crystal-clear{" "}
                <strong className="text-lime">international calling</strong>{" "}
                powered by Twilio. 50+ countries, HD voice.
              </p>
            </ScrollReveal>
          </div>
        </Link>

        {/* Video Meetings */}
        <Link
          to="/platform"
          className="relative group overflow-hidden flex items-end p-8 md:p-12 min-h-[50vh]"
          style={{
            background:
              "linear-gradient(225deg, hsl(220 8% 10%) 0%, hsl(220 8% 8%) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 60%, hsl(var(--lime)) 1px, transparent 1px)",
              backgroundSize: "25px 25px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
          <div className="relative z-10">
            <ScrollReveal>
              <h2 className="font-display text-6xl md:text-8xl text-on-dark leading-none">
                TEAM
                <br />
                <span className="text-lime">MEETINGS</span>
              </h2>
              <p className="mt-4 text-on-dark/70 font-body text-sm max-w-xs">
                Free unlimited{" "}
                <strong className="text-lime">HD meetings</strong> with screen
                sharing, powered by LiveKit.
              </p>
            </ScrollReveal>
          </div>
        </Link>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section
        ref={statsRef}
        className="py-16 md:py-24 sticky top-0 z-10 border-y border-lime/10"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--dark-card)) 0%, hsl(var(--dark-lighter)) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <ScrollReveal key={stat.label}>
                <div
                  className="relative overflow-hidden px-6 py-10 md:px-8 md:py-12 border border-lime/10 bg-dark-card"
                  style={{ borderRadius: "8px" }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.16] pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(hsl(var(--lime-dark) / 0.18) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--lime-dark) / 0.18) 1px, transparent 1px)",
                      backgroundSize: "44px 44px",
                    }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at top center, hsl(var(--lime) / 0.08), transparent 55%)",
                    }}
                  />
                  <div className="relative z-10">
                    <p
                      className="font-display text-6xl md:text-8xl text-lime"
                      data-counter={stat.numericValue}
                      data-suffix={stat.value.replace(/[\d.]/g, "")}
                      data-decimals={stat.value.includes(".") ? "1" : undefined}
                    >
                      0
                    </p>
                    <p className="font-body text-sm text-lime/60 tracking-widest uppercase mt-2">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        className="relative z-20 py-24 md:py-36 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 6%) 0%, hsl(220 8% 9%) 50%, hsl(220 8% 6%) 100%)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--lime-dark) / 0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-5">
                Testimonials
              </p>
              <h2 className="font-display text-4xl md:text-6xl text-on-dark leading-tight uppercase">
                Loved by teams{" "}
                <span className="font-serif-accent">worldwide</span>
              </h2>
              <p className="text-muted-dark font-body text-sm max-w-md mx-auto mt-5">
                See how businesses like yours are transforming their global
                communications
              </p>
            </div>
          </ScrollReveal>

          {/* Featured testimonial */}
          <ScrollReveal delay={0.1}>
            <div
              className="relative p-10 md:p-14 mb-14 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(220 8% 12%) 0%, hsl(220 8% 10%) 100%)",
                border: "1px solid hsl(var(--lime-dark) / 0.15)",
                borderRadius: "8px",
              }}
            >
              {/* Decorative gradient corner */}
              <div
                className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top right, hsl(var(--lime-dark) / 0.08), transparent 70%)",
                }}
              />
              {/* Star rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-lime text-6xl font-serif-accent absolute top-8 right-12 opacity-10">
                "
              </span>
              <p className="font-body text-xl md:text-2xl text-on-dark leading-relaxed max-w-3xl">
                {testimonials[0].quote}
              </p>
              <div className="w-12 h-[2px] bg-lime/30 my-8" />
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--lime-dark) / 0.3), hsl(var(--lime-dark) / 0.1))",
                    border: "1px solid hsl(var(--lime-dark) / 0.3)",
                  }}
                >
                  <span className="font-display text-base text-lime">
                    {testimonials[0].author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-display text-sm text-on-dark tracking-wider">
                    {testimonials[0].author}
                  </p>
                  <p className="font-body text-xs text-muted-dark mt-0.5">
                    {testimonials[0].role}, {testimonials[0].company}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Testimonial cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.slice(1).map((t, i) => (
              <ScrollReveal key={t.id} delay={0.15 + i * 0.1}>
                <div
                  className="relative p-7 h-full transition-all duration-500 hover:-translate-y-1 group"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(220 8% 13%) 0%, hsl(220 8% 10%) 100%)",
                    border: "1px solid hsl(var(--lime-dark) / 0.08)",
                    borderRadius: "6px",
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-6 right-6 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(var(--lime-dark) / 0.5), transparent)",
                    }}
                  />
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="text-yellow-400 text-base">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="font-body text-sm text-on-dark leading-relaxed mb-7">
                    "{t.quote}"
                  </p>
                  <div className="w-8 h-[1px] bg-lime/20 mb-5" />
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(var(--lime-dark) / 0.25), hsl(var(--lime-dark) / 0.08))",
                        border: "1px solid hsl(var(--lime-dark) / 0.2)",
                      }}
                    >
                      <span className="font-display text-xs text-lime">
                        {t.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-xs text-on-dark tracking-wider">
                        {t.author}
                      </p>
                      <p className="font-body text-[10px] text-muted-dark mt-0.5">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section
        className="relative z-20 py-24 md:py-36 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 10%) 50%, hsl(220 8% 7%) 100%)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--lime-dark) / 0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-5">
                Pricing
              </p>
              <h2 className="font-display text-4xl md:text-6xl text-on-dark leading-tight uppercase">
                Simple plans
              </h2>
              <h3 className="font-display text-3xl md:text-5xl leading-tight uppercase">
                <span className="font-serif-accent">for serious calling</span>
              </h3>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="font-body text-sm text-muted-dark leading-relaxed">
                The homepage now gives a quick pricing snapshot only. Click any
                plan to jump into the full pricing breakdown, feature
                comparison, and FAQ.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier, index) => {
              const isHighlighted = tier.highlighted;

              return (
                <ScrollReveal key={tier.id} delay={index * 0.08}>
                  <Link
                    to="/pricing#pricing-details"
                    className={`relative block p-8 h-full transition-all duration-500 hover:-translate-y-1 ${
                      isHighlighted ? "md:scale-[1.02]" : ""
                    }`}
                    style={{
                      background: isHighlighted
                        ? "linear-gradient(180deg, hsl(220 8% 14%) 0%, hsl(220 8% 10%) 100%)"
                        : "linear-gradient(180deg, hsl(220 8% 13%) 0%, hsl(220 8% 10%) 100%)",
                      border: isHighlighted
                        ? "1px solid hsl(var(--lime-dark) / 0.25)"
                        : "1px solid hsl(var(--lime-dark) / 0.08)",
                      borderRadius: "8px",
                      boxShadow: isHighlighted
                        ? "0 0 40px hsl(var(--lime-dark) / 0.06)"
                        : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="font-display text-sm text-muted-dark tracking-widest uppercase mb-2">
                          {tier.name}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-5xl text-on-dark">
                            {tier.price}
                          </span>
                          <span className="font-body text-sm text-muted-dark">
                            {tier.period}
                          </span>
                        </div>
                      </div>

                      {isHighlighted ? (
                        <span
                          className="font-display text-[10px] uppercase tracking-wider px-3 py-1"
                          style={{
                            background: "hsl(var(--lime-dark))",
                            color: "hsl(220 8% 10%)",
                            borderRadius: "3px",
                          }}
                        >
                          Popular
                        </span>
                      ) : null}
                    </div>

                    <p className="font-body text-sm text-muted-dark mb-6">
                      {tier.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      {tier.features.slice(0, 2).map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <span className="text-lime text-xs">✓</span>
                          <span className="font-body text-sm text-on-dark">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-lime/10 pt-5">
                      <span className="font-display text-xs tracking-[0.25em] uppercase text-lime">
                        View Full Plan
                      </span>
                      <span className="font-display text-lg text-lime">→</span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
