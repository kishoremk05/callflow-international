import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useGsapAnimations";

// ============================================================================
// DATA CONSTANTS
// ============================================================================

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
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

export default function LandingPage() {
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
      {/* Fixed background image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Optional overlay for better text readability */}
      <div className="fixed inset-0 -z-10 bg-white/30 backdrop-blur-[2px]" />

      {/* Global animated cloud background */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[5%] left-[2%] w-[400px] h-[100px] rounded-full bg-white/40 blur-3xl animate-cloud-drift-1" />
        <div className="absolute top-[12%] right-[5%] w-[350px] h-[80px] rounded-full bg-white/30 blur-3xl animate-cloud-drift-2" />
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[70px] rounded-full bg-white/25 blur-3xl animate-cloud-drift-3" />
        <div
          className="absolute top-[40%] right-[15%] w-[450px] h-[90px] rounded-full bg-white/30 blur-3xl animate-cloud-drift-1"
          style={{ animationDelay: "-15s" }}
        />
        <div
          className="absolute top-[55%] left-[10%] w-[320px] h-[75px] rounded-full bg-white/35 blur-3xl animate-cloud-drift-2"
          style={{ animationDelay: "-8s" }}
        />
        <div
          className="absolute top-[70%] right-[20%] w-[380px] h-[85px] rounded-full bg-white/25 blur-3xl animate-cloud-drift-3"
          style={{ animationDelay: "-20s" }}
        />
        <div
          className="absolute top-[85%] left-[25%] w-[350px] h-[80px] rounded-full bg-white/30 blur-3xl animate-cloud-drift-1"
          style={{ animationDelay: "-10s" }}
        />
      </div>

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
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#pricing"
            className="hidden md:inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Try GlobalConnect free
          </a>

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
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-full bg-foreground text-background text-sm font-medium"
            >
              Try GlobalConnect free
            </a>
          </div>
        )}
      </header>

      {/* ============================================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================================ */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        {/* Sky gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, hsl(200 60% 92%) 0%, hsl(30 20% 96%) 70%)",
          }}
        />

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
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border text-foreground text-sm font-medium hover:bg-secondary hover:scale-105 transition-all duration-200"
            >
              See features
            </a>
          </div>

          {/* Dashboard mockup */}
          <div
            className="relative max-w-[1000px] mx-auto"
            style={{
              perspective: "1200px",
            }}
          >
            <img
              src="https://framerusercontent.com/images/JeI7uULY0av9DxD7q7NVLTuoNc.png?width=2880&height=2000"
              alt="GlobalConnect dashboard"
              className="w-full rounded-t-2xl shadow-2xl transition-transform duration-100 ease-out"
              loading="eager"
              style={{
                transform: `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${scrollY * 0.05}px)`,
                transformOrigin: "center bottom",
              }}
            />
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
      {/* DEVICES SECTION */}
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
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* Mobile App Card */}
            <div
              className={`group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                devicesRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground mb-4">
                  Mobile App
                </span>
              </div>
              <img
                src="https://framerusercontent.com/images/W508S15xkXJdvalNWW9jYJSIKg.png?width=2102&height=1707"
                alt="GlobalConnect mobile app"
                className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Web App Card */}
            <div
              className={`group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 md:mt-12 ${
                devicesRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "0.25s" }}
            >
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground mb-4">
                  Web App
                </span>
              </div>
              <img
                src="https://framerusercontent.com/images/pfcMvn2yqXD2Cl6VWthMkHlhaKQ.png?width=3604&height=2710"
                alt="GlobalConnect web app"
                className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
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

          {/* Image */}
          <div
            className={`transition-all duration-700 delay-200 ${
              projectMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <img
              src="https://framerusercontent.com/images/gUEFVWinvZ7dMZa0mUhNZWHNj3U.png?width=1016&height=1230"
              alt="GlobalConnect calling interface"
              className="w-full rounded-2xl shadow-lg"
              loading="lazy"
            />
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

          {/* Image */}
          <div
            className={`transition-all duration-700 delay-200 ${
              financialMgmtRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{ direction: "ltr" }}
          >
            <img
              src="https://framerusercontent.com/images/thBhwyY3D4d8TRQEbrMU6zSvz8.png?width=1016&height=1228"
              alt="GlobalConnect collaboration UI"
              className="w-full rounded-2xl shadow-lg"
              loading="lazy"
            />
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
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Integrates seamlessly with the tools you already use
              </h3>

              {/* Marquee */}
              <div className="relative overflow-hidden my-6">
                <div className="flex animate-marquee w-max">
                  {[...integrationLogos, ...integrationLogos].map((logo, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 mx-4 px-4 py-2 rounded-xl bg-secondary flex items-center justify-center"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {logo.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  Seamless integrations
                </strong>
                . Plug GlobalConnect into the tools you love. Sync with your
                CRM, chat tools, and business apps to streamline communication.
              </p>
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
      {/* TESTIMONIALS SECTION */}
      {/* ============================================================================ */}
      <section ref={testimonialsRef.ref} className="py-20 md:py-28">
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

          {/* Testimonial carousel */}
          <div
            ref={testimonialScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[320px] md:w-[360px] snap-start rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
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
      {/* COMMUNITY SECTION */}
      {/* ============================================================================ */}
      <section ref={communityRef.ref} id="community" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              communityRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Community
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Stay in the loop
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* X/Twitter */}
            <div
              className={`rounded-2xl border border-border bg-card p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                communityRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <img
                src="https://framerusercontent.com/images/YJ3wO9vQ3HS4wmE05zXN33kEM4.png?width=128&height=129"
                alt="X/Twitter"
                className="w-10 h-10 mb-4"
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground mb-1">
                15.2K followers
              </p>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                X/Twitter
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Stay updated on new features and discover how teams are using
                GlobalConnect.
              </p>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary hover:scale-105 transition-all duration-200"
              >
                Follow us
              </a>
            </div>

            {/* YouTube */}
            <div
              className={`rounded-2xl border border-border bg-card p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                communityRef.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <img
                src="https://framerusercontent.com/images/lTRuCxkmxeIKqNbj2JiXUFWgdw.png?width=128&height=128"
                alt="YouTube"
                className="w-10 h-10 mb-4"
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground mb-1">
                32k subscribers
              </p>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                YouTube
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Tips, tutorials, and guides to help you get the most out of
                GlobalConnect.
              </p>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary hover:scale-105 transition-all duration-200"
              >
                Subscribe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* FOOTER */}
      {/* ============================================================================ */}
      <footer className="relative overflow-hidden">
        {/* Footer image */}
        <div className="w-full">
          <img
            src="https://framerusercontent.com/images/iR8Ma0AjH7EaIAPThF3xcp9l3bM.png?width=2048&height=1117"
            alt=""
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="bg-foreground py-6 px-6">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <span className="text-background/60 text-sm">
              © 2025 GlobalConnect. All rights reserved.
            </span>
            <a
              href="#"
              className="flex items-center gap-2 text-background font-bold text-lg"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
                  stroke="hsl(0 0% 9%)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              GlobalConnect
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
