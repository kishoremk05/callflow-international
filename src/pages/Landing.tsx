import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Wallet,
  Globe,
  Users,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Shield,
  Zap,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  Lock,
  Award,
} from "lucide-react";
import heroIllustration from "@/assets/images/hero-illustration.png";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Hero Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const hero = heroRef.current;
      if (!hero) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Initial states
      gsap.set('[data-hero="badge"]', { opacity: 0, y: 30 });
      gsap.set('[data-hero="title"]', { opacity: 0, y: 40 });
      gsap.set('[data-hero="subtitle"]', { opacity: 0, y: 30 });
      gsap.set('[data-hero="ctas"]', { opacity: 0, y: 30 });
      gsap.set('[data-hero="illustration"]', { opacity: 0, scale: 0.9, x: 60 });
      gsap.set('[data-hero="trust"]', { opacity: 0, y: 20 });

      // Animate sequence
      tl.to('[data-hero="badge"]', { opacity: 1, y: 0, duration: 0.6 }, 0.2)
        .to('[data-hero="title"]', { opacity: 1, y: 0, duration: 0.7 }, 0.35)
        .to('[data-hero="subtitle"]', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
        .to('[data-hero="ctas"]', { opacity: 1, y: 0, duration: 0.6 }, 0.65)
        .to(
          '[data-hero="illustration"]',
          { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: "back.out(1.3)" },
          0.4
        )
        .to('[data-hero="trust"]', { opacity: 1, y: 0, duration: 0.5 }, 0.9);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Features Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-feature]") as Element[];

      gsap.set(cards, { opacity: 0, y: 60 });

      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          });
        },
        start: "top 85%",
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  // How It Works Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray("[data-step]") as Element[];

      gsap.set(steps, { opacity: 0, y: 50 });

      ScrollTrigger.batch(steps, {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.2,
            ease: "power3.out",
          });
        },
        start: "top 80%",
      });
    }, howItWorksRef);

    return () => ctx.revert();
  }, []);

  // Pricing Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-pricing]") as Element[];

      gsap.set(cards, { opacity: 0, y: 60, scale: 0.95 });

      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          });
        },
        start: "top 85%",
      });
    }, pricingRef);

    return () => ctx.revert();
  }, []);

  // Stats Counter Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const counters = gsap.utils.toArray("[data-counter]") as HTMLElement[];

      counters.forEach((counter) => {
        const target = parseInt(counter.dataset.target || "0");
        const suffix = counter.dataset.suffix || "";
        const prefix = counter.dataset.prefix || "";

        gsap.fromTo(
          counter,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: counter,
              start: "top 85%",
            },
            onUpdate: function () {
              counter.innerText =
                prefix +
                Math.round(parseFloat(counter.innerText)).toLocaleString() +
                suffix;
            },
          }
        );
      });
    }, statsRef);

    return () => ctx.revert();
  }, []);

  // CTA Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("[data-cta]", { opacity: 0, y: 40, scale: 0.98 });

      gsap.to("[data-cta]", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-cta]",
          start: "top 85%",
        },
      });
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Wallet,
      title: "Secure Wallet",
      description:
        "Manage your credits securely. Add funds instantly with multiple payment options.",
      color: "#0891b2",
    },
    {
      icon: Globe,
      title: "Browser Calling",
      description:
        "Make HD calls directly from your browser. No apps or downloads required.",
      color: "#0891b2",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Host internal voice meetings and collaborate with your team seamlessly.",
      color: "#0891b2",
    },
    {
      icon: Phone,
      title: "Virtual Numbers",
      description:
        "Get local phone numbers from 50+ countries for your business.",
      color: "#0891b2",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up in under 2 minutes with just your email address.",
      icon: "👤",
    },
    {
      step: 2,
      title: "Add Credits",
      description: "Top up your wallet with Stripe, Razorpay, or UPI payments.",
      icon: "💳",
    },
    {
      step: 3,
      title: "Start Calling",
      description: "Dial any number worldwide directly from your browser.",
      icon: "📞",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0891b2] rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1a365d]">
                GlobalConnect
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-[#0891b2] transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-[#0891b2] transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-[#0891b2] transition-colors font-medium"
              >
                How It Works
              </a>
              <Button
                className="bg-[#0891b2] hover:bg-[#0e7490] text-white px-6 py-2 rounded-lg font-semibold"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </div>

            <Button
              className="md:hidden bg-[#0891b2] hover:bg-[#0e7490] text-white px-4 py-2 rounded-lg"
              onClick={() => navigate("/signup")}
            >
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-28 md:pt-36 pb-16 md:pb-24 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div
                data-hero="badge"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0891b2]/10 rounded-full mb-6"
              >
                <Zap className="w-4 h-4 text-[#0891b2]" />
                <span className="text-[#0891b2] font-semibold text-sm">
                  Browser-Based Calling Platform
                </span>
              </div>

              <h1
                data-hero="title"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a365d] mb-6 leading-tight"
              >
                Make International Calls
                <span className="block text-[#0891b2]">From Your Browser</span>
              </h1>

              <p
                data-hero="subtitle"
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Crystal-clear HD calls to 190+ countries. No apps, no SIM cards,
                no restrictions. Just open your browser and connect.
              </p>

              <div
                data-hero="ctas"
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-6 text-lg rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                  onClick={() => navigate("/signup")}
                >
                  Start Calling Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white px-8 py-6 text-lg rounded-xl font-semibold transition-all"
                  onClick={() => navigate("/demo")}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              <div
                data-hero="trust"
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0891b2]" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div
              data-hero="illustration"
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Background accent */}
                <div className="absolute -inset-4 bg-[#0891b2]/5 rounded-full blur-3xl"></div>

                {/* Main illustration */}
                <img
                  src={heroIllustration}
                  alt="Person making a call"
                  className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto drop-shadow-2xl"
                />

                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        HD Quality
                      </div>
                      <div className="text-sm text-gray-500">
                        Crystal Clear Audio
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0891b2]/10 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#0891b2]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        190+
                      </div>
                      <div className="text-sm text-gray-500">Countries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 md:py-28 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#0891b2]/10 rounded-full text-[#0891b2] font-semibold text-sm mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Everything You Need for Global Calling
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful features designed to make international communication
              seamless and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                data-feature
                className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#0891b2]/20 transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1a365d] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="py-20 md:py-28 bg-slate-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#0891b2]/10 rounded-full text-[#0891b2] font-semibold text-sm mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Start Calling in 3 Easy Steps
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              No complicated setup. Get started in under 2 minutes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-[#0891b2]/20"></div>

              {steps.map((item) => (
                <div
                  key={item.step}
                  data-step
                  className="text-center relative z-10"
                >
                  <div className="w-20 h-20 bg-white border-4 border-[#0891b2] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-[#0891b2] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-20 md:py-28 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#0891b2]/10 rounded-full text-[#0891b2] font-semibold text-sm mb-4">
              Simple Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Pay Only for What You Use
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              No monthly subscriptions. No hidden fees. Just simple credit-based
              pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {/* Starter */}
            <div
              data-pricing
              className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-[#1a365d] mb-2">
                  Starter
                </h3>
                <div className="text-4xl font-bold text-[#1a365d] mb-1">$5</div>
                <p className="text-gray-500 text-sm">One-time purchase</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Call 50+ countries",
                  "HD browser calling",
                  "Basic support",
                  "Call history",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gray-100 text-[#1a365d] hover:bg-[#0891b2] hover:text-white rounded-xl py-6 font-semibold transition-all"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </div>

            {/* Business - Popular */}
            <div
              data-pricing
              className="bg-[#0891b2] rounded-2xl p-8 text-white relative transform md:scale-105 shadow-2xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f97316] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <div className="text-4xl font-bold mb-1">$50</div>
                <p className="text-white/80 text-sm">+10% bonus credits</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "All Starter features",
                  "190+ countries",
                  "Call recording",
                  "Priority support",
                  "Team features",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/90 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-white text-[#0891b2] hover:bg-gray-100 rounded-xl py-6 font-bold transition-all"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </div>

            {/* Enterprise */}
            <div
              data-pricing
              className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-[#1a365d] mb-2">
                  Enterprise
                </h3>
                <div className="text-4xl font-bold text-[#1a365d] mb-1">
                  $200+
                </div>
                <p className="text-gray-500 text-sm">Volume discounts</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "All Business features",
                  "Dedicated manager",
                  "Custom numbers",
                  "API access",
                  "SLA guarantee",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gray-100 text-[#1a365d] hover:bg-[#0891b2] hover:text-white rounded-xl py-6 font-semibold transition-all"
                onClick={() => navigate("/enterprise")}
              >
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Call Rates Preview */}
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-[#1a365d] mb-6 text-center">
              Sample Call Rates
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { flag: "🇺🇸", country: "USA", rate: "$0.02" },
                { flag: "🇬🇧", country: "UK", rate: "$0.03" },
                { flag: "🇮🇳", country: "India", rate: "$0.01" },
                { flag: "🇩🇪", country: "Germany", rate: "$0.03" },
                { flag: "🇯🇵", country: "Japan", rate: "$0.04" },
              ].map((item) => (
                <div
                  key={item.country}
                  className="text-center p-4 bg-white rounded-xl shadow-sm"
                >
                  <span className="text-3xl mb-2 block">{item.flag}</span>
                  <div className="text-sm font-medium text-gray-600">
                    {item.country}
                  </div>
                  <div className="text-lg font-bold text-[#0891b2]">
                    {item.rate}/min
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button
                variant="outline"
                className="border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white rounded-xl"
              >
                View All 190+ Countries
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section ref={trustRef} className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#0891b2]/10 rounded-full text-[#0891b2] font-semibold text-sm mb-4">
              Trust & Security
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your calls and data are protected with industry-leading security
              measures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#0891b2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-[#0891b2]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">
                256-bit Encryption
              </h3>
              <p className="text-gray-600 text-sm">
                All calls and data encrypted with bank-level security
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#0891b2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#0891b2]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">
                SOC 2 Compliant
              </h3>
              <p className="text-gray-600 text-sm">
                Audited security controls and data protection
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#0891b2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-[#0891b2]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600 text-sm">
                Expert assistance whenever you need it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-[#0891b2] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div
                data-counter
                data-target="50000"
                data-suffix="+"
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                0
              </div>
              <div className="text-white/80 font-medium">Active Users</div>
            </div>
            <div>
              <div
                data-counter
                data-target="190"
                data-suffix="+"
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                0
              </div>
              <div className="text-white/80 font-medium">Countries</div>
            </div>
            <div>
              <div
                data-counter
                data-target="2"
                data-suffix="M+"
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                0
              </div>
              <div className="text-white/80 font-medium">Calls Monthly</div>
            </div>
            <div>
              <div
                data-counter
                data-target="99"
                data-suffix=".9%"
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                0
              </div>
              <div className="text-white/80 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div
            data-cta
            className="max-w-4xl mx-auto text-center bg-[#1a365d] rounded-3xl p-12 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0891b2]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f97316]/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Calling?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users making crystal-clear international
                calls. Start your free account today.
              </p>
              <Button
                size="lg"
                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-10 py-6 text-lg rounded-xl font-semibold shadow-lg shadow-orange-500/30"
                onClick={() => navigate("/signup")}
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#0891b2] rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">GlobalConnect</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making international calls simple, affordable, and accessible
                from anywhere.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 GlobalConnect. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0891b2] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0891b2] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0891b2] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
