import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Wallet,
  Globe,
  Users,
  Phone,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Wallet,
      title: "Wallet",
      description: "Manage your credits securely with instant payments.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Globe,
      title: "Browser Calling",
      description: "Make calls directly from your browser—with HD clarity.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Users,
      title: "Team Meetings",
      description: "Host internal voice/video meetings without apps.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Phone,
      title: "Purchase Numbers",
      description: "Get international phone numbers for your business.",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        
        @keyframes floatPhone {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-30px) rotate(-3deg);
          }
        }
        
        @keyframes phoneGlow {
          0%, 100% {
            box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
          }
          50% {
            box-shadow: 0 20px 80px rgba(251, 146, 60, 0.5);
          }
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
      <div
        className="min-h-screen overflow-x-hidden smooth-scroll"
        style={{
          background:
            "linear-gradient(135deg, rgba(250, 245, 235, 0.7) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 100%)",
          backgroundColor: "#fdfcfa",
        }}
      >
        {/* Fixed World Map Background for entire page */}
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          {/* Map image as background */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url("/bg for browser based calling.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Connection points with lighter styling */}
          <div
            className="absolute top-[20%] left-[15%] w-2.5 h-2.5 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{ boxShadow: "0 0 10px rgba(249, 115, 22, 0.3)" }}
          ></div>
          <div
            className="absolute top-[35%] left-[28%] w-2 h-2 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{
              animationDelay: "0.5s",
              boxShadow: "0 0 8px rgba(249, 115, 22, 0.3)",
            }}
          ></div>
          <div
            className="absolute top-[25%] left-[45%] w-2.5 h-2.5 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{
              animationDelay: "1s",
              boxShadow: "0 0 10px rgba(249, 115, 22, 0.3)",
            }}
          ></div>
          <div
            className="absolute top-[30%] right-[30%] w-2 h-2 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{
              animationDelay: "1.5s",
              boxShadow: "0 0 8px rgba(249, 115, 22, 0.3)",
            }}
          ></div>
          <div
            className="absolute top-[40%] right-[20%] w-2.5 h-2.5 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{
              animationDelay: "2s",
              boxShadow: "0 0 10px rgba(249, 115, 22, 0.3)",
            }}
          ></div>
          <div
            className="absolute bottom-[35%] left-[20%] w-2 h-2 bg-orange-500 rounded-full shadow-md animate-pulse"
            style={{
              animationDelay: "2.5s",
              boxShadow: "0 0 8px rgba(249, 115, 22, 0.3)",
            }}
          ></div>

          {/* Animated Blobs */}
          <div
            className="absolute top-[10%] left-[5%] w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl"
            style={{
              animation: "blob 7s infinite",
            }}
          />
          <div
            className="absolute top-[50%] right-[10%] w-80 h-80 bg-gradient-to-br from-amber-400/15 to-orange-300/15 rounded-full blur-3xl"
            style={{
              animation: "blob 9s infinite 2s",
            }}
          />
          <div
            className="absolute bottom-[20%] left-[15%] w-72 h-72 bg-gradient-to-br from-orange-300/20 to-amber-500/15 rounded-full blur-3xl"
            style={{
              animation: "blob 11s infinite 4s",
            }}
          />
        </div>

        {/* Complete Border Frame */}
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            border: "6px solid #d4a574",
            borderStyle: "solid",
            margin: "0",
          }}
        />
        {/* Navigation - Transparent with shadow for readability */}
        <nav className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 to-transparent">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  GlobalConnect
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-10">
                <a
                  href="#home"
                  className="text-white hover:text-amber-300 transition-colors font-semibold text-sm drop-shadow-lg"
                >
                  Home
                </a>
                <a
                  href="#pricing"
                  className="text-white hover:text-amber-300 transition-colors font-semibold text-sm drop-shadow-lg"
                >
                  Pricings
                </a>
                <a
                  href="#resources"
                  className="text-white hover:text-amber-300 transition-colors font-semibold text-sm drop-shadow-lg"
                >
                  Resources
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-amber-300 transition-colors font-semibold text-sm drop-shadow-lg"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - New Centered Layout */}
        <section className="relative min-h-screen overflow-hidden pt-20 md:pt-28 pb-8 md:pb-16">
          {/* Hero Content - Centered at Top */}
          <div className="container mx-auto px-4 md:px-6 relative z-20">
            <div className="text-center max-w-4xl mx-auto mb-6 md:mb-12">
              <div 
                className="inline-block mb-6 px-4 py-2 bg-orange-100 rounded-full"
                style={{ animation: "fadeInUp 0.6s ease-out" }}
              >
                <span className="text-orange-600 font-medium text-sm">🌍 Trusted by 50,000+ users worldwide</span>
              </div>
              
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2"
                style={{
                  color: "#4a3a2a",
                  textShadow: "2px 2px 8px rgba(255, 255, 255, 0.5)",
                  animation: "fadeInUp 0.8s ease-out",
                }}
              >
                Make International Calls
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Directly From Your Browser
                </span>
              </h1>

              <p
                className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ animation: "fadeInUp 1s ease-out 0.2s backwards" }}
              >
                Crystal-clear calls to 190+ countries. No apps, no SIM cards, no restrictions. 
                Just open your browser and start calling.
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12 px-4"
                style={{ animation: "fadeInUp 1s ease-out 0.4s backwards" }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-full font-semibold shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => navigate("/signup")}
                >
                  Start Calling Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-orange-500 text-orange-600 bg-white/70 backdrop-blur-sm hover:bg-orange-500 hover:text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  onClick={() => navigate("/demo")}
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="mt-8 md:mt-32"></div>

            {/* Phone Mockup - Centered */}
            <div 
              className="flex justify-center items-center relative mt-8 md:mt-12"
              style={{ animation: "fadeInUp 1.2s ease-out 0.5s backwards" }}
            >
              {/* Left Stats Card */}
              <div className="hidden lg:block absolute left-[10%] top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-orange-100 z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">2M+</div>
                    <div className="text-sm text-gray-500">Calls Made</div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {['S', 'M', 'P', 'A'].map((letter, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {letter}
                    </div>
                  ))}
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                    +5k
                  </div>
                </div>
              </div>

              {/* Right Stats Card */}
              <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-orange-100 z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">190+</div>
                    <div className="text-sm text-gray-500">Countries</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {['🇺🇸', '🇬🇧', '🇮🇳', '🇩🇪', '🇯🇵'].map((flag, i) => (
                    <span key={i} className="text-xl">{flag}</span>
                  ))}
                </div>
              </div>

              {/* Phone Mockup - Premium Design */}
              <div
                className="relative w-[200px] h-[400px] sm:w-[240px] sm:h-[480px] md:w-[300px] md:h-[620px] bg-gradient-to-br from-gray-800 via-gray-900 to-black p-[2px] md:p-[3px] rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl z-20"
                style={{
                  boxShadow: "0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* Phone Frame Inner */}
                <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0c0a1d] rounded-[1.9rem] sm:rounded-[2.3rem] md:rounded-[2.8rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 md:w-28 h-4 sm:h-5 md:h-6 bg-black rounded-b-xl sm:rounded-b-2xl z-30 flex items-center justify-center gap-1 sm:gap-2">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gray-700"></div>
                    <div className="w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 rounded-full bg-gray-800"></div>
                  </div>

                  {/* Status Bar */}
                  <div className="h-7 sm:h-8 md:h-10 flex items-end justify-between px-3 sm:px-4 md:px-6 pb-0.5 sm:pb-1 relative z-20">
                    <div className="text-white/90 text-[10px] sm:text-xs font-semibold">9:41</div>
                    <div className="flex gap-0.5 sm:gap-1 items-center">
                      <div className="flex gap-0.5">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-0.5 bg-white/80 rounded-full" style={{height: `${3 + i*1.5}px`}}></div>
                        ))}
                      </div>
                      <span className="text-white/80 text-[8px] sm:text-[10px] font-medium ml-0.5 sm:ml-1">5G</span>
                      <div className="w-4 sm:w-5 md:w-6 h-2 sm:h-2.5 md:h-3 border border-white/60 rounded-sm ml-0.5 sm:ml-1 relative">
                        <div className="absolute inset-0.5 bg-green-400 rounded-[1px]" style={{width: '80%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Ambient Glow Effects - Hidden on mobile for performance */}
                  <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                  <div className="hidden sm:block absolute bottom-32 right-0 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl"></div>

                  {/* Dialer Content */}
                  <div className="px-2 sm:px-3 md:px-5 py-1 md:py-2 flex flex-col h-[calc(100%-1.75rem)] sm:h-[calc(100%-2rem)] md:h-[calc(100%-2.5rem)] relative z-10">
                    {/* App Header */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <span className="text-white/90 font-medium text-[10px] sm:text-xs md:text-sm">Dialer</span>
                      </div>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white/70 text-[10px] sm:text-xs md:text-sm">⋮</span>
                      </div>
                    </div>

                    {/* Phone Number Display */}
                    <div className="text-center mb-2 sm:mb-4 md:mb-6 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl md:rounded-2xl">
                      <div className="text-white text-lg sm:text-xl md:text-3xl font-light tracking-wider md:tracking-widest mb-1 sm:mb-2" style={{fontFamily: 'system-ui'}}>
                        +1 212 555 0188
                      </div>
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                          <Globe className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                        </div>
                        <span className="text-blue-400 text-[8px] sm:text-[10px] md:text-xs font-medium">Virtual Number • USA</span>
                      </div>
                    </div>

                    {/* Number Pad - Responsive */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 flex-1 max-h-[160px] sm:max-h-[200px] md:max-h-[260px]">
                      {[
                        {num: '1', sub: ''},
                        {num: '2', sub: 'ABC'},
                        {num: '3', sub: 'DEF'},
                        {num: '4', sub: 'GHI'},
                        {num: '5', sub: 'JKL'},
                        {num: '6', sub: 'MNO'},
                        {num: '7', sub: 'PQRS'},
                        {num: '8', sub: 'TUV'},
                        {num: '9', sub: 'WXYZ'},
                        {num: '*', sub: ''},
                        {num: '0', sub: '+'},
                        {num: '#', sub: ''},
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="w-10 h-8 sm:w-12 sm:h-10 md:w-16 md:h-14 mx-auto flex flex-col items-center justify-center bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-white/20"
                        >
                          <span className="text-white text-sm sm:text-base md:text-lg font-normal">{item.num}</span>
                          {item.sub && <span className="text-white/40 text-[5px] sm:text-[6px] md:text-[7px] tracking-wider">{item.sub}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 py-2 sm:py-3 md:py-4 mt-1 md:mt-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                        <span className="text-white text-xs sm:text-sm md:text-lg">✕</span>
                      </div>
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-white" />
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                        <span className="text-white text-xs sm:text-sm md:text-lg">⌫</span>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div 
              className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 mt-6 md:mt-12 flex-wrap px-4"
              style={{ animation: "fadeInUp 1.2s ease-out 0.7s backwards" }}
            >
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-orange-500">★★★★★</span>
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-sm">🔒 256-bit Encryption</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-sm">💳 No Credit Card Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Everything You Need for 
                <span className="text-orange-500"> Global Calling</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Powerful features designed to make international communication seamless
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border-2 border-orange-200 shadow-sm hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-gradient-to-b from-white to-orange-50/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm mb-4">
                Simple Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Start Calling in <span className="text-orange-500">3 Easy Steps</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                No complicated setup. Get started in under 2 minutes.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>
                
                {[
                  { step: 1, title: "Create Account", desc: "Sign up in seconds with just your email. No credit card required.", icon: "👤" },
                  { step: 2, title: "Add Credits", desc: "Top up instantly with Stripe, Razorpay, or UPI payments.", icon: "💳" },
                  { step: 3, title: "Start Calling", desc: "Dial any number worldwide directly from your browser.", icon: "📞" }
                ].map((item) => (
                  <div key={item.step} className="text-center relative z-10">
                    <div className="w-20 h-20 bg-white border-4 border-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm mb-4">
                Transparent Pricing
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Pay Only for <span className="text-orange-500">What You Use</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                No monthly subscriptions. No hidden fees. Just simple credit-based pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {/* Starter */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-gray-800 mb-1">$5</div>
                  <p className="text-gray-500 text-sm">One-time credit purchase</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Call 50+ countries", "HD browser calling", "Basic support", "Call history"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-600">
                      <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gray-100 text-gray-800 hover:bg-orange-500 hover:text-white rounded-full py-6"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </div>

              {/* Business - Popular */}
              <div className="bg-gradient-to-b from-orange-500 to-amber-500 rounded-2xl p-8 text-white relative transform md:scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  Most Popular
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Business</h3>
                  <div className="text-4xl font-bold mb-1">$50</div>
                  <p className="text-white/80 text-sm">+10% bonus credits</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["All Starter features", "190+ countries", "Call recording", "Priority support", "Team features"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 rounded-full py-6 font-bold"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </div>

              {/* Enterprise */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-gray-800 mb-1">$200+</div>
                  <p className="text-gray-500 text-sm">Volume discounts available</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["All Business features", "Dedicated manager", "Custom numbers", "API access", "SLA guarantee"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-600">
                      <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gray-100 text-gray-800 hover:bg-orange-500 hover:text-white rounded-full py-6"
                  onClick={() => navigate("/enterprise")}
                >
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* Call Rates Preview */}
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Sample Call Rates</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { flag: "🇺🇸", country: "USA", rate: "$0.02" },
                  { flag: "🇬🇧", country: "UK", rate: "$0.03" },
                  { flag: "🇮🇳", country: "India", rate: "$0.01" },
                  { flag: "🇩🇪", country: "Germany", rate: "$0.03" },
                  { flag: "🇯🇵", country: "Japan", rate: "$0.04" }
                ].map((item) => (
                  <div key={item.country} className="text-center p-4 bg-white rounded-xl">
                    <span className="text-3xl mb-2 block">{item.flag}</span>
                    <div className="text-sm font-medium text-gray-600">{item.country}</div>
                    <div className="text-lg font-bold text-orange-600">{item.rate}/min</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full">
                  View All 190+ Countries
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-orange-50/50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Loved by <span className="text-orange-500">50,000+ Users</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                See what our customers are saying about GlobalConnect
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { name: "Sarah Johnson", role: "Business Owner", avatar: "S", quote: "Amazing call quality with unbeatable rates. I save over $200 every month on international calls!" },
                { name: "Michael Chen", role: "Team Lead", avatar: "M", quote: "Great for managing my remote team. No apps needed, works right in the browser. Highly recommend!" },
                { name: "Priya Patel", role: "Consultant", avatar: "P", quote: "Reliable and affordable. I stay connected with global clients easily. The best VoIP service I've used." }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="text-orange-400 mb-4">★★★★★</div>
                  <p className="text-gray-600 leading-relaxed">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "190+", label: "Countries" },
                { value: "2M+", label: "Calls Monthly" },
                { value: "99.9%", label: "Uptime" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Calling?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join 50,000+ users making crystal-clear international calls. Start your free account today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-full font-semibold"
                    onClick={() => navigate("/signup")}
                  >
                    Create Free Account
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                    onClick={() => navigate("/demo")}
                  >
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">GlobalConnect</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Making international calls simple, affordable, and accessible from anywhere.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 GlobalConnect. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
