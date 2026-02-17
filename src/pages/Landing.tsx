import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useGsapAnimations";
import bgImage from "@/assets/images/bg.png";
import cardImage from "@/assets/images/dashboard-screenshot.png";

// ============================================================================
// DATA CONSTANTS
// ============================================================================

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "How It Works", href: "#how-it-works" },
];

const integrationLogos = [
  { name: "Twilio" },
  { name: "Stripe" },
  { name: "Razorpay" },
  { name: "Supabase" },
  { name: "Google" },
  { name: "Slack" },
  { name: "Zapier" },
  { name: "WebRTC" },
];

const smallFeatures = [
  {
    title: "Browser Calling",
    desc: "Make HD calls directly from your browser. No apps or downloads required.",
  },
  {
    title: "Secure Wallet",
    desc: "Manage your credits securely. Add funds instantly with multiple payment options.",
  },
  {
    title: "Team Collaboration",
    desc: "Host internal voice meetings and collaborate with your team seamlessly.",
  },
  {
    title: "Virtual Numbers",
    desc: "Get local phone numbers from 50+ countries for your business.",
  },
  {
    title: "Internal Calling",
    desc: "Free voice calls between team members with conference support.",
  },
  {
    title: "Call Analytics",
    desc: "Track usage, monitor costs, and optimize your communication spending.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "VP of Operations, TechFlow",
    quote:
      "GlobalConnect replaced our entire PBX system. The call quality is incredible and our team loves the browser-based interface.",
    image:
      "https://framerusercontent.com/images/Et6DumDmh2RQ0iDyCSQ6tfsZ8.jpg?width=6000&height=4000",
  },
  {
    name: "Marcus Thompson",
    role: "CEO, Globex Trading",
    quote:
      "We cut our international call costs by 70%. The wallet system is transparent and there are zero hidden fees.",
    image:
      "https://framerusercontent.com/images/3lt1gABWpzXcHQByY6oEYaqhkkA.jpg?width=3024&height=4032",
  },
  {
    name: "Priya Sharma",
    role: "Head of HR, Soylent Corp",
    quote:
      "The team collaboration features and internal calling have transformed how our remote team communicates across 12 countries.",
    image:
      "https://framerusercontent.com/images/UQ3VAeUsm7aRhKUqekI3Sx8YmY.jpg?width=3872&height=2592",
  },
  {
    name: "James O'Brien",
    role: "Founder, ConnectHub",
    quote:
      "Setting up virtual numbers in 5 different countries took minutes. Our clients love having local numbers to reach us.",
    image:
      "https://framerusercontent.com/images/r6zjSUgLQkP33zYAqzN6hO1MW6g.jpg?width=2403&height=3600",
  },
];

const plans = [
  {
    name: "Starter",
    priceAnnual: "$5",
    priceMonthly: "$20",
    desc: "For solo use with light needs.",
    features: [
      "Call 50+ countries",
      "HD browser calling",
      "Basic support",
      "Call history",
      "Wallet system",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Business",
    priceAnnual: "$50",
    priceMonthly: "$170",
    desc: "Best value for teams",
    features: [
      "All Starter features",
      "190+ countries",
      "Call recording",
      "Priority support",
      "Team features",
      "Organization management",
    ],
    cta: "Get Started",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    priceAnnual: "$200",
    priceMonthly: "$680",
    desc: "For team use with custom needs.",
    features: [
      "All Business features",
      "Dedicated manager",
      "Custom numbers",
      "API access",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const articles = [
  {
    title: "How to reduce international calling costs by 70%",
    tag: "Cost Savings",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=750&fit=crop",
  },
  {
    title: "Setting up virtual numbers for your business",
    tag: "Guide",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=1200&fit=crop",
  },
  {
    title: "Best practices for remote team communication",
    tag: "Teams",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=1200&fit=crop",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Landing() {
  const navigate = useNavigate();
  // Navbar state
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hero state
  const [scrollY, setScrollY] = useState(0);

  // Pricing state
  const [annual, setAnnual] = useState(true);

  // Scroll animations
  const trustBarRef = useScrollAnimation();
  const devicesRef = useScrollAnimation();
  const projectMgmtRef = useScrollAnimation();
  const financialMgmtRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();
  const pricingRef = useScrollAnimation();
  const trustBar2Ref = useScrollAnimation();
  const blogRef = useScrollAnimation();
  const communityRef = useScrollAnimation();

  const testimonialScrollRef = useRef<HTMLDivElement>(null);

  // Navbar scroll effect
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 10);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Hero 3D tilt effect
  const tiltProgress = Math.min(scrollY / 600, 1);
  const rotateX = 8 * (1 - tiltProgress);
  const scale = 0.97 + 0.03 * tiltProgress;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fixed watercolor background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      />

      {/* ============================================================================ */}
      {/* NAVBAR */}
      {/* ============================================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-gray-200 shadow-md"
            : "bg-white/30 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 text-foreground font-bold text-xl"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            GlobalConnect
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <button
            onClick={() => navigate("/signup")}
            className="hidden md:inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Get Started
          </button>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-background border-b border-border px-6 pb-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  const element = document.querySelector(link.href);
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/signup");
              }}
              className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium w-full"
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* ============================================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================================ */}
      <section
        className="relative pt-32 pb-12 overflow-hidden"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        {/* Subtle Animated Decorative Elements */}

        {/* Floating gradient ring - top left */}
        <motion.div
          className="absolute top-32 left-20 w-40 h-40 rounded-full border-2 border-cyan-300/20 z-0"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating gradient ring - top right */}
        <motion.div
          className="absolute top-20 right-32 w-32 h-32 rounded-full border-2 border-purple-300/20 z-0"
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Small accent blob - left side */}
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full filter blur-2xl z-0"
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Small accent blob - right side */}
        <motion.div
          className="absolute top-1/3 right-16 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full filter blur-2xl z-0"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating dots for depth */}
        <motion.div
          className="absolute top-40 left-1/3 w-3 h-3 bg-cyan-400/40 rounded-full z-0"
          animate={{
            y: [0, -50, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-400/40 rounded-full z-0"
          animate={{
            y: [0, 40, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              willChange: "transform, opacity, filter",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Make International Calls
              <br />
              From Your Browser
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              willChange: "transform, opacity, filter",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto mb-10 leading-relaxed">
              Crystal-clear HD calls to 70+ countries. No apps, no SIM cards, no
              restrictions. Just open your browser and connect with anyone,
              anywhere.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              willChange: "transform, opacity, filter",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-foreground text-background text-sm font-medium hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Start Calling Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border text-foreground hover:text-white text-sm font-medium hover:bg-secondary hover:scale-105 transition-all duration-200"
            >
              See features
            </a>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            className="relative max-w-[1100px] mx-auto mt-16"
            style={{
              perspective: "1200px",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-transform duration-100 ease-out max-h-[700px]"
              style={{
                transform: `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${scrollY * 0.05}px) translateZ(0)`,
                transformOrigin: "center bottom",
                willChange: "transform",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <img
                src={cardImage}
                alt="GlobalConnect dashboard - Call analytics, wallet balance, and communication tools"
                className="w-full h-auto object-cover object-top"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* TRUST BAR */}
      {/* ============================================================================ */}
      <section
        ref={trustBarRef.ref}
        className={`py-12 text-center transition-all duration-700 ${
          trustBarRef.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-sm md:text-base text-muted-foreground font-medium tracking-wide">
          Trusted by businesses in 70+ countries worldwide
        </p>
      </section>

      {/* ============================================================================ */}
      {/* PLATFORM SECTION */}
      {/* ============================================================================ */}
      <section ref={devicesRef.ref} id="benefits" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              devicesRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-xs font-semibold text-[#0891b2] uppercase tracking-wider mb-2 block">
              🌐 Browser-Based Communication
            </span>
            <div className="flex items-start justify-center gap-3 mt-4">
              <svg
                className="w-10 h-10 text-foreground flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Call from anywhere,
                <br />
                stay connected
              </h2>
            </div>
            <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
              Experience seamless global communication directly from your
              browser — no downloads needed
            </p>
          </div>

          {/* Single unified platform card */}
          <div className="max-w-5xl mx-auto">
            <div
              className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 ${
                devicesRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  {/* Left - Text Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium uppercase tracking-wider">
                        💻 Live Platform
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <svg
                        className="w-8 h-8 text-slate-900 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                        One Platform,
                        <br />
                        <span className="text-[#0891b2]">
                          Endless Possibilities
                        </span>
                      </h3>
                    </div>
                    <p className="text-slate-700 mb-8 leading-relaxed font-medium">
                      Access all features directly from your browser. Make HD
                      calls, manage teams, track analytics, and handle billing —
                      all in one powerful web platform.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0891b2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-[#0891b2]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Instant Access
                          </p>
                          <p className="text-xs text-slate-700">
                            No installation. Open your browser and start
                            calling.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0891b2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-[#0891b2]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Real-Time Dashboard
                          </p>
                          <p className="text-xs text-slate-700">
                            Full analytics, call history, and team management.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0891b2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-[#0891b2]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Enterprise Security
                          </p>
                          <p className="text-xs text-slate-700">
                            End-to-end encryption on every single call.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0891b2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-[#0891b2]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            70+ Countries
                          </p>
                          <p className="text-xs text-slate-700">
                            Crystal-clear calls to destinations worldwide.
                          </p>
                        </div>
                      </div>
                    </div>

                    <a
                      href="#"
                      className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#0891b2] text-white text-sm font-medium hover:bg-[#0e7490] hover:scale-105 hover:shadow-xl transition-all duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/signup");
                      }}
                    >
                      Start Calling
                    </a>
                  </div>

                  {/* Right - Browser Window Mockup */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-slate-800/40 via-slate-800/30 to-slate-900/40 rounded-xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl">
                      {/* Browser Chrome */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10 backdrop-blur-sm">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-slate-700/60 rounded-md px-3 py-1.5 flex items-center gap-2 border border-slate-600/50">
                            <svg
                              className="w-3 h-3 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-slate-300 text-xs font-medium">
                              app.globalconnect.com
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dashboard Content */}
                      <div className="p-5 bg-gradient-to-b from-slate-900/50 to-slate-900/30 space-y-4">
                        {/* Top Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/[0.12] transition-colors">
                            <p className="text-slate-300 text-xs mb-1 font-medium">
                              Active
                            </p>
                            <p className="text-white font-bold text-lg">24</p>
                            <div className="w-full h-1 bg-slate-700/50 rounded mt-2">
                              <div className="w-3/4 h-full bg-[#0891b2] rounded shadow-sm"></div>
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/[0.12] transition-colors">
                            <p className="text-slate-300 text-xs mb-1 font-medium">
                              Minutes
                            </p>
                            <p className="text-white font-bold text-lg">1.2k</p>
                            <div className="w-full h-1 bg-slate-700/50 rounded mt-2">
                              <div className="w-2/3 h-full bg-green-400 rounded shadow-sm"></div>
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/[0.12] transition-colors">
                            <p className="text-slate-300 text-xs mb-1 font-medium">
                              Saved
                            </p>
                            <p className="text-white font-bold text-lg">$842</p>
                            <div className="w-full h-1 bg-slate-700/50 rounded mt-2">
                              <div className="w-4/5 h-full bg-purple-400 rounded shadow-sm"></div>
                            </div>
                          </div>
                        </div>

                        {/* Active Call Indicator */}
                        <div className="bg-[#0891b2]/20 border border-[#0891b2]/40 rounded-xl p-4 flex items-center justify-between backdrop-blur-md shadow-lg hover:bg-[#0891b2]/25 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0891b2] flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                Active Call
                              </p>
                              <p className="text-[#0891b2] text-xs">
                                +44 20 7946 • London, UK
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-green-400 text-xs font-mono">
                              04:32
                            </span>
                          </div>
                        </div>

                        {/* Recent Calls */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-md shadow-md hover:bg-white/[0.12] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                US
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  +1 (555) 0123
                                </p>
                                <p className="text-slate-300 text-xs">
                                  12 min • HD Quality
                                </p>
                              </div>
                            </div>
                            <span className="text-green-400 text-xs">
                              $0.24
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-md shadow-md hover:bg-white/[0.12] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                IN
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  +91 98765 4321
                                </p>
                                <p className="text-slate-300 text-xs">
                                  8 min • HD Quality
                                </p>
                              </div>
                            </div>
                            <span className="text-green-400 text-xs">
                              $0.12
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* PROJECT MANAGEMENT SECTION */}
      {/* ============================================================================ */}
      <section
        ref={projectMgmtRef.ref}
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <img
            src="https://framerusercontent.com/images/g690a9Fxc6Y5G69sPCSKq4vjw.png?width=2352&height=2800"
            alt=""
            className="w-[600px] h-[600px] object-contain opacity-30"
            loading="lazy"
          />
        </div>

        <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text */}
          <div
            className={`transition-all duration-700 ${
              projectMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Global Calling
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
              Crystal-clear calls to 70+ countries
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              <strong>Make HD voice calls</strong> — directly from your browser.
              No apps, no downloads. Just reliable, high-quality connections to
              anywhere in the world.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-foreground text-background text-sm font-medium hover:scale-105 hover:shadow-xl transition-all duration-200 mb-8"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Start Calling Free
            </a>
            <div className="flex flex-wrap gap-2">
              {[
                "Browser Calling",
                "Virtual Numbers",
                "Call Recording",
                "Analytics",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 text-xs font-medium rounded-full border border-border bg-card text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Call Interface Mockup */}
          <div
            className={`transition-all duration-700 delay-200 ${
              projectMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div className="bg-gradient-to-b from-blue-100 via-blue-50 to-orange-50 rounded-3xl shadow-2xl border border-blue-200 overflow-hidden p-6 md:p-8">
              {/* Header Section with Badge */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    Call Dashboard
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-[#0891b2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-slate-600 text-xs font-medium">
                      Countries
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">70+</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-slate-600 text-xs font-medium">
                      Uptime
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">99.9%</p>
                </div>
              </div>

              {/* Dial Pad Preview */}
              <div className="bg-white rounded-xl p-5 border border-blue-100 mb-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-800 font-semibold text-sm">
                    Quick Dial
                  </p>
                  <span className="text-[#0891b2] text-xs font-medium">
                    HD Voice
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 mb-4 border border-slate-200">
                  <span className="text-slate-600 text-lg">🇺🇸</span>
                  <span className="text-slate-800 font-mono text-lg">
                    +1 (555) 012-3456
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
                    <div
                      key={num}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 text-center text-slate-800 font-medium text-sm transition-colors cursor-pointer shadow-sm"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer shadow-lg shadow-green-500/30">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Recent Contacts */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-800 font-semibold text-sm">
                  Recent Calls
                </p>
                <span className="text-[#0891b2] text-xs cursor-pointer hover:underline">
                  View all
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: "Sarah M.",
                    location: "London, UK",
                    time: "2 min ago",
                    duration: "12:34",
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    name: "Raj K.",
                    location: "Mumbai, IN",
                    time: "15 min ago",
                    duration: "08:21",
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    name: "Hans W.",
                    location: "Berlin, DE",
                    time: "1 hr ago",
                    duration: "05:47",
                    color: "from-yellow-500 to-amber-600",
                  },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100 hover:shadow-md transition-shadow shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                      >
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-slate-800 text-sm font-medium">
                          {c.name}
                        </p>
                        <p className="text-slate-600 text-xs">{c.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-800 text-xs font-mono">
                        {c.duration}
                      </p>
                      <p className="text-slate-600 text-xs">{c.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* FINANCIAL MANAGEMENT SECTION (REVERSED) */}
      {/* ============================================================================ */}
      <section
        ref={financialMgmtRef.ref}
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <img
            src="https://framerusercontent.com/images/g690a9Fxc6Y5G69sPCSKq4vjw.png?width=2352&height=2800"
            alt=""
            className="w-[600px] h-[600px] object-contain opacity-30"
            loading="lazy"
          />
        </div>

        <div
          className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center"
          style={{ direction: "rtl" }}
        >
          {/* Text */}
          <div
            className={`transition-all duration-700 ${
              financialMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ direction: "ltr" }}
          >
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2 block">
              👥 Team Collaboration
            </span>
            <div className="flex items-start gap-3 mt-4 mb-6">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                Internal calling & conferencing made easy
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              <strong>Free calls between team members</strong>, host conference
              calls, and manage your organization. Everything you need to keep
              your team connected.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-foreground text-background text-sm font-medium hover:scale-105 hover:shadow-xl transition-all duration-200 mb-8"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Start Calling Free
            </a>
            <div className="flex flex-wrap gap-2">
              {[
                "Internal Calls",
                "Conferences",
                "Organizations",
                "Wallet Sharing",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 text-xs font-medium rounded-full border border-border bg-card text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Call Analytics Dashboard Card */}
          <div
            className={`transition-all duration-700 delay-200 ${
              financialMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{ direction: "ltr" }}
          >
            <div className="bg-gradient-to-b from-blue-100 via-blue-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10 border border-blue-200">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-7 h-7 text-slate-700 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Call Analytics
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Real-time insights for your team
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#0891b2]/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#0891b2]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Total Calls
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">2,547</p>
                  <p className="text-slate-600 text-xs mt-1">This month</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Avg Duration
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">18:42</p>
                  <p className="text-slate-600 text-xs mt-1">Minutes</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Cost Saved
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">$1,245</p>
                  <p className="text-slate-600 text-xs mt-1">vs traditional</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Call Quality
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">98.5%</p>
                  <p className="text-slate-600 text-xs mt-1">HD quality</p>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-slate-800 font-semibold text-sm">
                    Weekly Usage
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-slate-600 text-xs">Active calls</span>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-3 h-40 px-2">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      145
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md hover:from-cyan-600 hover:to-cyan-500 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "60%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        145 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Mon
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      178
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md hover:from-cyan-600 hover:to-cyan-500 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "75%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        178 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Tue
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      203
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md hover:from-cyan-600 hover:to-cyan-500 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "85%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        203 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Wed
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      167
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md hover:from-cyan-600 hover:to-cyan-500 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "70%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        167 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Thu
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      227
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md hover:from-cyan-600 hover:to-cyan-500 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "95%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        227 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Fri
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">
                      108
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-slate-400 to-slate-300 rounded-t-md hover:from-slate-500 hover:to-slate-400 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "45%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        108 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Sat
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">84</span>
                    <div
                      className="w-full bg-gradient-to-t from-slate-400 to-slate-300 rounded-t-md hover:from-slate-500 hover:to-slate-400 transition-all duration-200 relative group shadow-sm"
                      style={{ height: "35%", minHeight: "40px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        84 mins
                      </div>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      Sun
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Savings Card */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-xl  flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-lg">
                        70% Cost Reduction
                      </p>
                      <p className="text-slate-600 text-xs">
                        vs traditional providers
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500 rounded-full">
                    <span className="text-white text-xs font-bold">↓ 70%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-slate-500 text-xs mb-1">Total Saved</p>
                    <p className="text-green-600 font-bold text-xl">$12,450</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-slate-500 text-xs mb-1">This Month</p>
                    <p className="text-green-600 font-bold text-xl">$1,245</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================================ */}
      <section
        ref={featuresRef.ref}
        id="features"
        className="py-20 md:py-28 relative overflow-hidden"
      >
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0891b2]/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0891b2]/10 to-orange-400/10 backdrop-blur-sm border border-white/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#0891b2] animate-pulse"></div>
              <span className="text-sm font-medium text-foreground uppercase tracking-wider">
                Premium Features
              </span>
            </div>

            {/* Animated gradient for moving color effect */}
            <style>{`
              @keyframes gradient-shift {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
              .animate-gradient {
                background-size: 200% 200%;
                animation: gradient-shift 3s ease infinite;
              }
            `}</style>

            <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 leading-tight">
              <div className="flex items-center justify-center gap-3">
                {/* Small logo */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <span>Built for teams,</span>
              </div>
              <span className="animate-gradient bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 bg-clip-text text-transparent">
                powered by simplicity
              </span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need for seamless global communication, wrapped in
              a beautiful interface
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* HD Voice Quality - Premium Card */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,116,139,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-transparent to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-slate-700 group-hover:text-[#0891b2] transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0891b2] transition-colors">
                    HD Voice Quality
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Crystal-clear audio on every call with adaptive bitrate and
                  automatic network optimization.
                </p>

                {/* Quality metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Uptime
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      99.9%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Audio Quality
                    </span>
                    <span className="text-sm font-bold text-[#0891b2]">
                      HD+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser Calling */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,116,139,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 via-transparent to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                    Browser Calling
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Make HD calls directly from your browser. No apps or downloads
                  required, just instant connectivity.
                </p>

                {/* Browser metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Load Time
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {"< 2s"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Compatibility
                    </span>
                    <span className="text-sm font-bold text-[#0891b2]">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Wallet */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,116,139,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-transparent to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                    Secure Wallet
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Manage your credits securely with multiple payment options and
                  instant fund transfers.
                </p>

                {/* Wallet metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Encryption
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      AES-256
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Payment Methods
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      10+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations - Spanning 2 columns */}
            <div
              className={`group relative md:col-span-2 rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(8,145,178,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0891b2]/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0891b2] to-blue-600 flex items-center justify-center shadow-xl shadow-[#0891b2]/30">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#0891b2] transition-colors">
                      Powerful Integrations
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Connect seamlessly with your favorite tools
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
                  {[
                    {
                      name: "Twilio",
                      color: "from-red-500 to-red-600",
                      letter: "T",
                    },
                    {
                      name: "Stripe",
                      color: "from-indigo-500 to-indigo-600",
                      letter: "S",
                    },
                    {
                      name: "Google",
                      color: "from-blue-500 to-blue-600",
                      letter: "G",
                    },
                    {
                      name: "Slack",
                      color: "from-emerald-500 to-emerald-600",
                      letter: "S",
                    },
                    {
                      name: "Razorpay",
                      color: "from-blue-600 to-blue-700",
                      letter: "R",
                    },
                    {
                      name: "Supabase",
                      color: "from-green-500 to-green-600",
                      letter: "S",
                    },
                    {
                      name: "Zapier",
                      color: "from-orange-500 to-orange-600",
                      letter: "Z",
                    },
                    {
                      name: "WebRTC",
                      color: "from-cyan-500 to-cyan-600",
                      letter: "W",
                    },
                  ].map((tool, idx) => (
                    <div
                      key={tool.name}
                      className="group/tool relative"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/30 backdrop-blur-sm hover:bg-white/50 border border-white/40 hover:border-white/60 transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}
                        >
                          <span className="text-white font-bold text-sm">
                            {tool.letter}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {tool.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-slate-800">
                    Plus 50+ more via API & webhooks
                  </span>
                </div>
              </div>
            </div>

            {/* Team Collaboration */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(249,115,22,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.5s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-orange-600 group-hover:text-orange-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    Team Collaboration
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Host internal voice meetings and collaborate with your team
                  seamlessly across the globe.
                </p>

                {/* Team metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Team Size
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      Unlimited
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Internal Calls
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      Free
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Virtual Numbers */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.6s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 group-hover:text-blue-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Virtual Numbers
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Get local phone numbers from 70+ countries for your business
                  presence worldwide.
                </p>

                {/* Virtual numbers metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Countries
                    </span>
                    <span className="text-sm font-bold text-blue-600">70+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Setup Time
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      Instant
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Analytics */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,100,100,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.7s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-transparent to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                    Call Analytics
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Track usage, monitor costs, and optimize your communication
                  spending with detailed insights.
                </p>

                {/* Analytics metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Total Calls
                    </span>
                    <span className="text-sm font-bold text-[#0891b2]">
                      2,547
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Avg Duration
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      18:42
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Cost Saved
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      $1,245
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conference Calling - New Card */}
            <div
              className={`group relative rounded-3xl bg-gradient-to-br from-white/[0.15] via-white/[0.10] to-white/[0.05] backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.8s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-violet-600 group-hover:text-violet-600 transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    Conference Calling
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                  Host multi-party conference calls with crystal-clear audio for
                  seamless group discussions.
                </p>

                {/* Conference metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Participants
                    </span>
                    <span className="text-sm font-bold text-violet-600">
                      50+
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Audio Quality
                    </span>
                    <span className="text-sm font-bold text-green-600">HD</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30">
                    <span className="text-xs font-semibold text-slate-800">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-[#0891b2]">
                      Unlimited
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================================================ */}
      <section
        ref={communityRef.ref}
        id="how-it-works"
        className="py-20 md:py-28"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              communityRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Start making international calls in just 3 simple steps. No
              downloads, no setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div
              className={`p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                communityRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Open Your Browser
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  No downloads needed. Simply visit our website from any modern
                  browser on desktop or mobile.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                communityRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Create Free Account
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quick signup with email or Google. Add credits to your wallet
                  and you're ready to call anywhere.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                communityRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Start Calling Worldwide
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dial any number worldwide with crystal-clear HD quality. Track
                  usage and manage contacts easily.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div
            className={`text-center mt-16 transition-all duration-700 ${
              communityRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white text-sm font-medium hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Get Started Free
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <p className="text-sm text-muted-foreground mt-3">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================================================ */}
      <section
        ref={testimonialsRef.ref}
        id="testimonials"
        className="py-20 md:py-32 overflow-hidden relative"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-950/10" />

        <div className="max-w-[1280px] mx-auto px-6 relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4 leading-tight">
              Loved by teams worldwide
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how businesses like yours are transforming their global
              communications
            </p>
          </div>

          {/* Featured testimonial */}
          <div
            className={`mb-20 transition-all duration-700 ${
              testimonialsRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Quote Icon */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-12 h-12 text-primary/20"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed mb-8">
                    GlobalConnect transformed how our team communicates
                    globally. The call quality is incredible and our team loves
                    the browser-based interface.
                  </p>

                  <div className="flex items-center gap-5">
                    <img
                      src="https://framerusercontent.com/images/Et6DumDmh2RQ0iDyCSQ6tfsZ8.jpg?width=6000&height=4000"
                      alt="Sarah Chen"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/10"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold text-lg text-foreground">
                        Sarah Chen
                      </p>
                      <p className="text-muted-foreground">
                        VP of Operations, TechFlow
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infinite Scrolling Testimonial carousel */}
          <div className="relative">
            <style>{`
              @keyframes scroll-infinite {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .animate-scroll-infinite {
                animation: scroll-infinite 45s linear infinite;
              }
              .animate-scroll-infinite:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="overflow-hidden py-4">
              <div className="flex gap-6 animate-scroll-infinite">
                {/* Duplicate testimonials for seamless infinite scroll */}
                {[...testimonials, ...testimonials].map((t, index) => (
                  <div
                    key={`${t.name}-${index}`}
                    className="flex-shrink-0 w-[340px] md:w-[380px] rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 hover:shadow-xl hover:scale-105 hover:border-primary/20 transition-all duration-300 group"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-500 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/10"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* PRICING SECTION */}
      {/* ============================================================================ */}
      <section ref={pricingRef.ref} id="pricing" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              pricingRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Simple plans
              <br />
              for serious calling
            </h2>
          </div>

          {/* Toggle */}
          <div
            className={`flex items-center justify-center gap-3 mb-12 transition-all duration-700 ${
              pricingRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                annual
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
            </button>
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !annual
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
                  plan.highlight
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border"
                } ${pricingRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium opacity-70">
                      {plan.name}
                    </span>
                    {plan.badge && annual && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-medium">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold">
                    {annual ? plan.priceAnnual : plan.priceMonthly}
                  </p>
                  <p
                    className={`text-sm mt-1 ${plan.highlight ? "text-background/70" : "text-muted-foreground"}`}
                  >
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() =>
                    navigate(
                      plan.cta === "Contact Sales" ? "/contact" : "/signup",
                    )
                  }
                  className={`w-full inline-flex items-center justify-center h-12 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    plan.highlight
                      ? "bg-background text-foreground hover:shadow-xl"
                      : "bg-foreground text-background hover:shadow-xl"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* TRUST BAR (REPEATED) */}
      {/* ============================================================================ */}
      <section
        ref={trustBar2Ref.ref}
        className={`py-12 text-center transition-all duration-700 ${
          trustBar2Ref.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-sm md:text-base text-muted-foreground font-medium tracking-wide">
          Powering communication for teams around the globe
        </p>
      </section>

      {/* ============================================================================ */}
      {/* BLOG SECTION */}
      {/* ============================================================================ */}
      <section ref={blogRef.ref} id="blog" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              blogRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Resources & Guides
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Master global calling
              <br />
              for your business
            </h2>
          </div>

          {/* Featured article */}
          <div
            className={`rounded-2xl overflow-hidden border border-border bg-card mb-6 group hover:shadow-xl transition-all duration-500 cursor-pointer ${
              blogRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid md:grid-cols-2">
              <div className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560439513-74b037a25d84?w=1200&h=673&fit=crop"
                  alt="Global business communication"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-xs font-medium text-muted-foreground mb-3">
                  Featured • Essential Reading
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                  The Complete Guide to VoIP for Growing Businesses
                </h3>
                <p className="text-muted-foreground mb-6">
                  Discover how modern businesses are cutting communication costs
                  while improving call quality with browser-based VoIP
                  solutions.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0891b2] to-[#0e7490] flex items-center justify-center text-white font-bold text-sm">
                    GC
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      GlobalConnect Team
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Communications Experts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smaller articles */}
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <div
                key={article.title}
                className={`rounded-2xl overflow-hidden border border-border bg-card group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                  blogRef.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground mb-3">
                    {article.tag}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground leading-snug">
                    {article.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* FOOTER */}
      {/* ============================================================================ */}
      <footer className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/40">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
              {/* Brand Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0891b2] flex items-center justify-center shadow-lg shadow-[#0891b2]/20">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
                        stroke="#0891b2"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-[#1a365d]">
                    GlobalConnect
                  </span>
                </div>
                <p className="text-gray-600 mb-6 max-w-sm leading-relaxed">
                  Your favorite global communication platform. Make HD calls to
                  70+ countries directly from your browser.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-gray-900 hover:bg-[#0891b2] flex items-center justify-center transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-gray-900 hover:bg-[#0891b2] flex items-center justify-center transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Pages Column */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                  PAGES
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/features")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Pricing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/blog")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Blog
                    </button>
                  </li>
                </ul>
              </div>

              {/* Information Column */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                  INFORMATION
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/contact")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Contact
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/privacy")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Privacy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/terms")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      Terms of use
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/about")}
                      className="text-gray-600 hover:text-[#0891b2] transition-colors text-base"
                    >
                      About
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200">
              <span className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2025 GlobalConnect. All rights reserved.
              </span>
              <span className="text-gray-500 text-sm">
                Built with React & Vite
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
