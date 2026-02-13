import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    title: "Top 10 digital agency software",
    tag: "Tools",
    image:
      "https://framerusercontent.com/images/WkcfohGmGxdaZXOQkB8urlpwXg.png?width=1200&height=750",
  },
  {
    title: "A complete guide to project success in 2026",
    tag: "Insight",
    image:
      "https://framerusercontent.com/images/gxb6A1j9Y0wXrhIBrMQD21JI.png?width=1200&height=1200",
  },
  {
    title: "What Are Billable Hours",
    tag: "Management",
    image:
      "https://framerusercontent.com/images/6MWnqkgs4vXAeKOFbYmLtdJtL8.png?width=904&height=1200",
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
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Make International Calls
            <br />
            From Your Browser
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto mb-10 leading-relaxed">
            Crystal-clear HD calls to 70+ countries. No apps, no SIM cards, no
            restrictions. Just open your browser and connect with anyone,
            anywhere.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
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
          </div>

          {/* Dashboard mockup */}
          <div
            className="relative max-w-[1100px] mx-auto mt-16"
            style={{
              perspective: "1200px",
            }}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-transform duration-100 ease-out max-h-[700px]"
              style={{
                transform: `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${scrollY * 0.05}px)`,
                transformOrigin: "center bottom",
              }}
            >
              <img
                style={{backgroundImage: `url(${cardImage})`}}
                alt="GlobalConnect dashboard - Call analytics, wallet balance, and communication tools"
                className="w-full h-auto object-cover object-top"
                loading="eager"
              />
            </div>
          </div>
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
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Browser-Based Communication
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Call from anywhere,
              <br />
              stay connected
            </h2>
            <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
              Experience seamless global communication directly from your
              browser — no downloads needed
            </p>
          </div>

          {/* Single unified platform card */}
          <div className="max-w-5xl mx-auto">
            <div
              className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-black border border-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-500 ${
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
                        Live Platform
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      One Platform,
                      <br />
                      <span className="text-[#0891b2]">
                        Endless Possibilities
                      </span>
                    </h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
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
                          <p className="text-sm font-semibold text-white">
                            Instant Access
                          </p>
                          <p className="text-xs text-slate-400">
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
                          <p className="text-sm font-semibold text-white">
                            Real-Time Dashboard
                          </p>
                          <p className="text-xs text-slate-400">
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
                          <p className="text-sm font-semibold text-white">
                            Enterprise Security
                          </p>
                          <p className="text-xs text-slate-400">
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
                          <p className="text-sm font-semibold text-white">
                            70+ Countries
                          </p>
                          <p className="text-xs text-slate-400">
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
                      Start Calling Free
                    </a>
                  </div>

                  {/* Right - Browser Window Mockup */}
                  <div className="relative">
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                      {/* Browser Chrome */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-slate-700 rounded-md px-3 py-1.5 flex items-center gap-2">
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
                            <span className="text-slate-400 text-xs">
                              app.globalconnect.com
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dashboard Content */}
                      <div className="p-5 bg-slate-900 space-y-4">
                        {/* Top Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-slate-400 text-xs mb-1">
                              Active
                            </p>
                            <p className="text-white font-bold text-lg">24</p>
                            <div className="w-full h-1 bg-slate-700 rounded mt-2">
                              <div className="w-3/4 h-full bg-[#0891b2] rounded"></div>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-slate-400 text-xs mb-1">
                              Minutes
                            </p>
                            <p className="text-white font-bold text-lg">1.2k</p>
                            <div className="w-full h-1 bg-slate-700 rounded mt-2">
                              <div className="w-2/3 h-full bg-green-400 rounded"></div>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-slate-400 text-xs mb-1">Saved</p>
                            <p className="text-white font-bold text-lg">$842</p>
                            <div className="w-full h-1 bg-slate-700 rounded mt-2">
                              <div className="w-4/5 h-full bg-purple-400 rounded"></div>
                            </div>
                          </div>
                        </div>

                        {/* Active Call Indicator */}
                        <div className="bg-[#0891b2]/10 border border-[#0891b2]/30 rounded-xl p-4 flex items-center justify-between">
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
                          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                US
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  +1 (555) 0123
                                </p>
                                <p className="text-slate-500 text-xs">
                                  12 min • HD Quality
                                </p>
                              </div>
                            </div>
                            <span className="text-green-400 text-xs">
                              $0.24
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                                IN
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  +91 98765 4321
                                </p>
                                <p className="text-slate-500 text-xs">
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
            <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl shadow-2xl border border-slate-800 overflow-hidden p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Call Dashboard</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">
                    Online
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                    <span className="text-slate-400 text-xs">Countries</span>
                  </div>
                  <p className="text-2xl font-bold text-white">70+</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                    <span className="text-slate-400 text-xs">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                </div>
              </div>

              {/* Dial Pad Preview */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-semibold text-sm">Quick Dial</p>
                  <span className="text-[#0891b2] text-xs font-medium">
                    HD Voice
                  </span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3 mb-4">
                  <span className="text-slate-400 text-lg">🇺🇸</span>
                  <span className="text-white font-mono text-lg">
                    +1 (555) 012-3456
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
                    <div
                      key={num}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 text-center text-white font-medium text-sm transition-colors cursor-pointer"
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
                <p className="text-white font-semibold text-sm">Recent Calls</p>
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
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
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
                        <p className="text-white text-sm font-medium">
                          {c.name}
                        </p>
                        <p className="text-slate-500 text-xs">{c.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-xs font-mono">
                        {c.duration}
                      </p>
                      <p className="text-slate-500 text-xs">{c.time}</p>
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
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Team Collaboration
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
              Internal calling & conferencing made easy
            </h2>
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
            <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10 border border-slate-800">
              {/* Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Call Analytics
                </h3>
                <p className="text-white/70 text-sm">
                  Real-time insights for your team
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
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
                    <span className="text-white/60 text-xs font-medium">
                      Total Calls
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">2,547</p>
                  <p className="text-white/60 text-xs mt-1">This month</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs font-medium">
                      Avg Duration
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">18:42</p>
                  <p className="text-white/60 text-xs mt-1">Minutes</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
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
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs font-medium">
                      Cost Saved
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">$1,245</p>
                  <p className="text-white/60 text-xs mt-1">vs traditional</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs font-medium">
                      Call Quality
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">98.5%</p>
                  <p className="text-white/60 text-xs mt-1">HD quality</p>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold text-sm">
                    Weekly Usage
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-white/60 text-xs">Active calls</span>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-32">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg hover:opacity-80 transition-opacity"
                      style={{ height: "60%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Mon</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg hover:opacity-80 transition-opacity"
                      style={{ height: "75%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Tue</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg hover:opacity-80 transition-opacity"
                      style={{ height: "85%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Wed</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg hover:opacity-80 transition-opacity"
                      style={{ height: "70%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Thu</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg hover:opacity-80 transition-opacity"
                      style={{ height: "95%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Fri</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-white/40 to-white/30 rounded-t-lg"
                      style={{ height: "45%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Sat</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-white/40 to-white/30 rounded-t-lg"
                      style={{ height: "35%" }}
                    ></div>
                    <span className="text-white/50 text-xs">Sun</span>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+12</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      15 team members
                    </p>
                    <p className="text-white/60 text-xs">Active this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-white/80 text-xs font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================================ */}
      <section ref={featuresRef.ref} id="features" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Built for teams,
              <br />
              powered by simplicity
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Everything you need for seamless global communication
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personalize */}
            <div
              className={`rounded-2xl border border-border bg-card p-8 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <img
                src="https://framerusercontent.com/images/o5PFg7LTymdZ6P4tuEGy4oFUFzw.svg?width=466&height=178"
                alt="Customization"
                className="w-full max-w-[350px] mb-6"
                loading="lazy"
              />
              <p className="text-foreground leading-relaxed">
                <strong>Customize your experience</strong>. Set your preferred
                language, time zone, and interface preferences for a seamless
                communication experience that works for you.
              </p>
            </div>

            {/* Integrations */}
            <div
              className={`rounded-2xl border border-border bg-card p-8 overflow-hidden transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                featuresRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0891b2] to-[#0e7490] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                <h3 className="text-lg font-semibold text-foreground">
                  Powerful Integrations
                </h3>
              </div>

              <p className="text-muted-foreground text-sm mb-6">
                Connect with the tools you already use. Sync your CRM, chat
                tools, and business apps seamlessly.
              </p>

              {/* Integration grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { name: "Twilio", color: "bg-red-500", letter: "T" },
                  { name: "Stripe", color: "bg-indigo-500", letter: "S" },
                  { name: "Google", color: "bg-blue-500", letter: "G" },
                  { name: "Slack", color: "bg-emerald-600", letter: "S" },
                  { name: "Razorpay", color: "bg-blue-600", letter: "R" },
                  { name: "Supabase", color: "bg-green-500", letter: "S" },
                  { name: "Zapier", color: "bg-orange-500", letter: "Z" },
                  { name: "WebRTC", color: "bg-cyan-600", letter: "W" },
                ].map((tool) => (
                  <div
                    key={tool.name}
                    className="group/tool flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200 cursor-default"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center shadow-md group-hover/tool:scale-110 transition-transform duration-200`}
                    >
                      <span className="text-white font-bold text-sm">
                        {tool.letter}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover/tool:text-foreground transition-colors">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Plus 50+ more via API & webhooks</span>
              </div>
            </div>

            {/* Small feature cards */}
            {smallFeatures.map((feat, i) => (
              <div
                key={feat.title}
                className={`rounded-2xl border border-border bg-card p-8 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                  featuresRef.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                } ${i === 2 ? "md:col-span-2" : ""}`}
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
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
        className="py-20 md:py-28 overflow-hidden"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Featured testimonial */}
          <div
            className={`flex flex-col md:flex-row items-center gap-12 mb-20 transition-all duration-700 ${
              testimonialsRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex-1 text-center md:text-left">
              <p className="text-3xl md:text-4xl font-bold text-foreground leading-snug mb-8">
                "GlobalConnect transformed how our team communicates globally"
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <img
                  src="https://framerusercontent.com/images/Et6DumDmh2RQ0iDyCSQ6tfsZ8.jpg?width=6000&height=4000"
                  alt="Sarah Chen"
                  className="w-14 h-14 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-foreground">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">
                    VP of Operations, TechFlow
                  </p>
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
                animation: scroll-infinite 40s linear infinite;
              }
              .animate-scroll-infinite:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="overflow-hidden">
              <div className="flex gap-6 animate-scroll-infinite">
                {/* Duplicate testimonials for seamless infinite scroll */}
                {[...testimonials, ...testimonials].map((t, index) => (
                  <div
                    key={`${t.name}-${index}`}
                    className="flex-shrink-0 w-[320px] md:w-[360px] rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
              Resources
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Learn more about
              <br />
              global communication
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
                  src="https://framerusercontent.com/images/vp3FQ8cQAX82fBniYARy66SgROY.png?width=1200&height=673"
                  alt="Featured article"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-xs font-medium text-muted-foreground mb-3">
                  Featured • Must Read
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                  How to start a 100k creative agency in 2025
                </h3>
                <p className="text-muted-foreground mb-6">
                  Learn how to kickstart your journey into agency ownership with
                  our comprehensive guide.
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src="https://framerusercontent.com/images/dOXROHKlycOnbn8lmjcAsLs.jpg?width=4000&height=6000"
                    alt="Dhyna Phils"
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Dhyna Phils
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Head of Marketing
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
