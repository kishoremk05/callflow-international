import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useGsapAnimations";
import {
  Phone,
  Globe,
  Users,
  Wallet,
  Shield,
  Zap,
  Headphones,
  Lock,
  Award,
  CheckCircle2,
} from "lucide-react";

const Features = () => {
  const navigate = useNavigate();
  const heroRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const showcaseRef = useScrollAnimation();
  const advancedRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  const features = [
    {
      icon: Globe,
      title: "Global Coverage",
      description:
        "Make calls to over 200 countries with crystal-clear quality and competitive rates.",
      benefits: [
        "Coverage in 200+ countries",
        "HD voice quality",
        "Reliable connections",
        "24/7 availability",
      ],
    },
    {
      icon: Wallet,
      title: "Pay-As-You-Go",
      description:
        "No monthly fees, no contracts. Only pay for what you use with transparent pricing.",
      benefits: [
        "No hidden fees",
        "Transparent pricing",
        "Flexible top-ups",
        "No subscription required",
      ],
    },
    {
      icon: Users,
      title: "Conference Calling",
      description:
        "Connect multiple people on one call for seamless team collaboration.",
      benefits: [
        "Up to 10 participants",
        "Easy setup",
        "No downloads needed",
        "Record calls",
      ],
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "End-to-end encryption ensures your conversations remain completely private.",
      benefits: [
        "End-to-end encryption",
        "GDPR compliant",
        "No data selling",
        "Secure payments",
      ],
    },
    {
      icon: Zap,
      title: "Instant Connection",
      description:
        "Connect instantly without any delays or complicated setup processes.",
      benefits: [
        "Instant setup",
        "No waiting time",
        "Quick dial",
        "Fast connections",
      ],
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Our dedicated support team is always here to help you whenever you need it.",
      benefits: [
        "Round-the-clock support",
        "Live chat available",
        "Email support",
        "Help documentation",
      ],
    },
  ];

  const advancedFeatures = [
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "Advanced security features for business users including SSO and role-based access.",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description:
        "99.9% uptime guarantee with automatic failover and redundancy.",
    },
    {
      icon: Phone,
      title: "Virtual Numbers",
      description:
        "Get local numbers in multiple countries to receive calls from anywhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-[#0891b2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                CallFlow
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="hover:scale-105 transition-transform"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-[#0891b2] hover:bg-[#0e7490] hover:scale-105 transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef.ref}
        className="py-20 md:py-24 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6bTIwIDBjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHpNMTYgMzZjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHptMjAgMGMwIDIuMi0xLjggNC00IDRzLTQtMS44LTQtNCAxLjgtNCA0LTQgNCAxLjggNCA0em0yMCAwYzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6TTE2IDE2YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6bTAgMjBjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHptMjAgMGMwIDIuMi0xLjggNC00IDRzLTQtMS44LTQtNCAxLjgtNCA0LTQgNCAxLjggNCA0em0yMCAwYzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
              heroRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text">
              Powerful Features for Modern Communication
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Everything you need to stay connected globally with crystal-clear
              quality and unbeatable reliability.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-white text-[#0891b2] hover:bg-gray-100 hover:scale-105 transition-all shadow-xl"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section ref={featuresRef.ref} className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 block">
              Core Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover all the features that make CallFlow the perfect
              choice for your international calling needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-card p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-border group hover:-translate-y-2 ${
                  featuresRef.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: featuresRef.isVisible
                    ? `${index * 100}ms`
                    : "0ms",
                }}
              >
                <div className="w-14 h-14 bg-[#0891b2]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0891b2] group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-[#0891b2] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-[#0891b2] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Showcase Section */}
      <section
        ref={showcaseRef.ref}
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`max-w-7xl mx-auto transition-all duration-700 ${
              showcaseRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-6">
                <span className="text-sm font-medium text-[#0891b2] uppercase tracking-wider">
                  Professional Platform
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                  Enterprise-Grade Communication Dashboard
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Manage your global communication with our intuitive, powerful
                  dashboard. Track calls, monitor teams, analyze costs, and
                  optimize your international calling strategyâ€”all from one
                  beautiful interface.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Real-time Analytics
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Monitor call quality, costs, and usage patterns in
                        real-time
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Team Management
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Organize projects, assign tasks, and collaborate
                        seamlessly
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Smart Insights
                      </p>
                      <p className="text-sm text-muted-foreground">
                        AI-powered recommendations to reduce costs and improve
                        efficiency
                      </p>
                    </div>
                  </li>
                </ul>
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-[#0891b2] hover:bg-[#0e7490] hover:scale-105 transition-all"
                >
                  Explore Dashboard
                </Button>
              </div>

              {/* Premium Dashboard Mockup - Call Management Interface */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0891b2]/20 to-[#0e7490]/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-3xl shadow-2xl border border-slate-800 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                  {/* Custom Call Dashboard Design */}
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Global Calling
                        </h3>
                        <p className="text-slate-400 text-sm">
                          70+ countries connected
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-green-400 text-xs font-medium">
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-slate-400 text-xs">Total</span>
                        </div>
                        <p className="text-white text-lg font-bold">8.2k</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
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
                          <span className="text-slate-400 text-xs">Active</span>
                        </div>
                        <p className="text-white text-lg font-bold">142</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            className="w-4 h-4 text-purple-400"
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
                          <span className="text-slate-400 text-xs">Mins</span>
                        </div>
                        <p className="text-white text-lg font-bold">24.5k</p>
                      </div>
                    </div>

                    {/* Recent Calls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">
                          Recent Calls
                        </h4>
                        <button className="text-[#0891b2] text-xs font-medium hover:underline">
                          View all
                        </button>
                      </div>

                      {/* Call Item 1 */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group/call">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0891b2] to-[#0e7490] flex items-center justify-center text-white font-semibold text-sm">
                              US
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                +1 (555) 0123
                              </p>
                              <p className="text-slate-400 text-xs">
                                United States
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-slate-400 text-xs">
                              12:34
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#0891b2] text-xs px-2 py-1 bg-[#0891b2]/10 rounded-full">
                            Completed
                          </span>
                          <span className="text-slate-400 text-xs">
                            2 mins ago
                          </span>
                        </div>
                      </div>

                      {/* Call Item 2 */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group/call">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                              UK
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                +44 20 7946
                              </p>
                              <p className="text-slate-400 text-xs">
                                United Kingdom
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-slate-400 text-xs">
                              08:21
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#0891b2] text-xs px-2 py-1 bg-[#0891b2]/10 rounded-full">
                            Completed
                          </span>
                          <span className="text-slate-400 text-xs">
                            8 mins ago
                          </span>
                        </div>
                      </div>

                      {/* Call Item 3 */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group/call">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                              IN
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                +91 98765 4321
                              </p>
                              <p className="text-slate-400 text-xs">India</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-slate-400 text-xs">
                              15:47
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#0891b2] text-xs px-2 py-1 bg-[#0891b2]/10 rounded-full">
                            Completed
                          </span>
                          <span className="text-slate-400 text-xs">
                            15 mins ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white px-6 py-3 rounded-2xl shadow-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                  <p className="font-bold text-sm">âœ¨ Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section ref={advancedRef.ref} className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              advancedRef.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 block">
              Advanced Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Built for Power Users
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for businesses and power users who need more from their
              communication platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className={`bg-card p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 border border-border ${
                  advancedRef.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: advancedRef.isVisible
                    ? `${index * 100}ms`
                    : "0ms",
                }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-[#0891b2] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef.ref} className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden transition-all duration-700 ${
              ctaRef.isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6bTIwIDBjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHpNMTYgMzZjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHptMjAgMGMwIDIuMi0xLjggNC00IDRzLTQtMS44LTQtNCAxLjgtNCA0LTQgNCAxLjggNCA0em0yMCAwYzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6TTE2IDE2YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6bTAgMjBjMCAyLjItMS44IDQtNCA0cy00LTEuOC00LTQgMS44LTQgNC00IDQgMS44IDQgNHptMjAgMGMwIDIuMi0xLjggNC00IDRzLTQtMS44LTQtNCAxLjgtNCA0LTQgNCAxLjggNCA0em0yMCAwYzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Join thousands of users who trust CallFlow for their
                international calling needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#0891b2] hover:bg-gray-100 hover:scale-105 transition-all shadow-xl"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/contact")}
                  className="border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;

