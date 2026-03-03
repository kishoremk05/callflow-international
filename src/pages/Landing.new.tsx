import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Globe, Users, Shield, Zap, TrendingDown, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-text"),
        { opacity: 0, y: 100, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.2,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        heroRef.current.querySelector(".hero-image"),
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.5,
          delay: 0.5,
          ease: "power3.out",
        }
      );
    }

    // Feature sections with parallax
    [feature1Ref, feature2Ref, feature3Ref].forEach((ref, index) => {
      if (ref.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });

        tl.fromTo(
          ref.current.querySelectorAll(".feature-content"),
          { opacity: 0, x: index % 2 === 0 ? -80 : 80, filter: "blur(8px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
          }
        );

        // Parallax effect for feature images
        const image = ref.current.querySelector(".feature-visual");
        if (image) {
          gsap.to(image, {
            y: -50,
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      }
    });

    // Stats animation
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-item"),
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Pricing cards
    if (pricingRef.current) {
      gsap.fromTo(
        pricingRef.current.querySelectorAll(".pricing-card"),
        { opacity: 0, y: 60, rotateX: 20 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const plans = [
    {
      name: "Starter",
      price: "$5",
      period: "/month",
      features: ["50+ countries", "HD calls", "Basic support", "Call history"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Business",
      price: "$50",
      period: "/month",
      features: [
        "190+ countries",
        "Priority support",
        "Team features",
        "Call recording",
        "Analytics",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$200",
      period: "/month",
      features: [
        "Custom numbers",
        "API access",
        "Dedicated manager",
        "SLA guarantee",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-900/95 backdrop-blur-lg border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">GlobalConnect</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "About"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <button
            onClick={() => navigate("/signup")}
            className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
          >
            Get Started
          </button>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4">
            {["Features", "Pricing", "About"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="block py-2 text-gray-300 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => {
                navigate("/signup");
                setMobileOpen(false);
              }}
              className="mt-4 w-full px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="hero-text text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 leading-tight">
            Connect
            <br />
            The World
          </h1>
          <p className="hero-text text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Make crystal-clear international calls directly from your browser.
            No apps, no downloads, no limits.
          </p>
          <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            >
              Start Calling Free
            </button>
            <button
              onClick={() =>
                document
                  .querySelector("#features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 border-2 border-gray-600 hover:border-cyan-400 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-cyan-400/10"
            >
              Explore Features
            </button>
          </div>

          {/* Hero visual - animated globe/phone mockup */}
          <div className="hero-image mt-16 relative">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                {/* Mock dashboard UI */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full"></div>
                      <div>
                        <div className="h-3 w-24 bg-gray-700 rounded"></div>
                        <div className="h-2 w-16 bg-gray-800 rounded mt-2"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-600"
                      ></div>
                    ))}
                  </div>
                  <div className="h-40 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "70+", label: "Countries" },
              { value: "99.9%", label: "Uptime" },
              { value: "50K+", label: "Active Users" },
              { value: "70%", label: "Cost Savings" },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-item text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-48">
          {/* Feature 1 */}
          <div ref={feature1Ref} className="grid md:grid-cols-2 gap-16 items-center">
            <div className="feature-content space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">
                  Global Reach
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black">
                Call Anywhere,
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                  Instantly
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect with anyone across 70+ countries with crystal-clear HD
                voice quality. No apps, no downloads—just open your browser and
                start calling.
              </p>
              <ul className="space-y-4">
                {[
                  "Browser-based calling",
                  "HD voice quality",
                  "No installation required",
                  "Works on any device",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-visual relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <Globe className="w-full h-64 text-cyan-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            ref={feature2Ref}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div className="feature-visual relative md:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <TrendingDown className="w-full h-64 text-purple-400 opacity-50" />
              </div>
            </div>
            <div className="feature-content space-y-6 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">
                  Cost Effective
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black">
                Save Up To
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  70% Costs
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Transparent pricing with no hidden fees. Pay only for what you
                use with our simple wallet system and competitive international
                rates.
              </p>
              <ul className="space-y-4">
                {[
                  "Pay-as-you-go pricing",
                  "No monthly commitments",
                  "Transparent rates",
                  "Instant refunds",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div ref={feature3Ref} className="grid md:grid-cols-2 gap-16 items-center">
            <div className="feature-content space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">
                  Team Collaboration
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black">
                Built For
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">
                  Teams
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Free internal calls, conference calling, and organization
                management. Everything your team needs to stay connected,
                wherever they are.
              </p>
              <ul className="space-y-4">
                {[
                  "Free internal calls",
                  "Conference calling",
                  "Team management",
                  "Call analytics",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-visual relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <Users className="w-full h-64 text-blue-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Simple,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                Transparent
              </span>{" "}
              Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card relative p-8 rounded-3xl border ${
                  plan.popular
                    ? "bg-gradient-to-b from-cyan-500/10 to-blue-600/10 border-cyan-500/50 scale-105"
                    : "bg-gray-800/50 border-gray-700"
                } backdrop-blur-sm hover:scale-105 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check
                        className={`w-5 h-5 ${
                          plan.popular ? "text-cyan-400" : "text-gray-400"
                        }`}
                      />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Ready to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              Connect
            </span>
            ?
          </h2>
          <p className="text-2xl text-gray-300 mb-12">
            Join thousands of users making crystal-clear calls worldwide
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full text-xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-110"
          >
            Start Free Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">GlobalConnect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making international calling simple, affordable, and accessible for
                everyone.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/api")}
                    className="hover:text-white transition-colors"
                  >
                    API
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/about")}
                    className="hover:text-white transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/blog")}
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/contact")}
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-white transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-white transition-colors"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/cookies")}
                    className="hover:text-white transition-colors"
                  >
                    Cookies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 GlobalConnect. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
