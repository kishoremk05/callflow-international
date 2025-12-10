import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Header } from "@/components/layout/Header";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { Dialer } from "@/components/dashboard/Dialer";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { toast } from "sonner";
import { gsap } from "gsap";
import { Users, PhoneCall, Clock, Globe } from "lucide-react";

interface CallLog {
  id: string;
  to_number: string;
  to_country_code: string;
  status: string;
  duration_seconds: number | null;
  started_at: string;
  billed_amount: number | null;
}

interface Wallet {
  balance: number;
  currency: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { makeCall, isConnected, isInitializing, currentCall, hangupCall } =
    useTwilioDevice();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: "USD" });
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    totalSpent: 0,
    thisMonth: 0,
  });
  const [callDuration, setCallDuration] = useState(0);
  const [currentNumber, setCurrentNumber] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.from('[data-animate="header"]', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power3.out",
      });

      // Animate hero section
      gsap.from('[data-animate="hero"]', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
      });

      // Animate stats cards
      gsap.from('[data-animate="stats"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
      });

      // Animate main content
      gsap.from('[data-animate="content"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.3,
      });

      // Animate sidebar
      gsap.from('[data-animate="sidebar"]', {
        opacity: 0,
        x: 30,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Call duration timer
  useEffect(() => {
    if (currentCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [currentCall]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance, currency")
        .eq("user_id", user.id)
        .single();

      if (walletError) {
        console.error("Wallet fetch error:", walletError);
        // Create wallet if it doesn't exist
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0, currency: "USD" })
          .select()
          .single();

        if (newWallet) {
          setWallet(newWallet);
        }
      } else if (walletData) {
        setWallet(walletData);
      }

      // Fetch recent calls
      const { data: callsData } = await supabase
        .from("call_logs")
        .select(
          "id, to_number, to_country_code, status, duration_seconds, started_at, billed_amount"
        )
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(10);

      if (callsData) {
        setCalls(callsData);

        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalCalls = callsData.length;
        const totalMinutes = callsData.reduce(
          (sum, call) => sum + (call.duration_seconds || 0) / 60,
          0
        );
        const totalSpent = callsData.reduce(
          (sum, call) => sum + (call.billed_amount || 0),
          0
        );
        const thisMonth = callsData
          .filter((call) => new Date(call.started_at) >= startOfMonth)
          .reduce((sum, call) => sum + (call.billed_amount || 0), 0);

        setStats({ totalCalls, totalMinutes, totalSpent, thisMonth });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (number: string, countryCode: string) => {
    if (currentCall) {
      toast.error("Already on a call");
      return;
    }

    if (!isConnected && !isInitializing) {
      toast.error("Calling device not ready. Please refresh the page.");
      return;
    }

    setCurrentNumber(number);
    setCurrentCountryCode(countryCode);

    try {
      toast.info(`Calling ${countryCode} ${number}...`);
      await makeCall(number, countryCode, "public");

      // Refresh call history after call
      setTimeout(() => {
        fetchData();
      }, 2000);
    } catch (error: any) {
      console.error("Call failed:", error);
      toast.error(error.message || "Call failed");
    }
  };

  const handleEndCall = () => {
    hangupCall();
    setCurrentNumber("");
    setCurrentCountryCode("");
    toast.success("Call ended");
    // Refresh data
    setTimeout(() => {
      fetchData();
    }, 1000);
  };

  const handleCallBack = (number: string, countryCode: string) => {
    handleCall(number, countryCode);
  };

  // Quick stats for the header
  const quickStats = [
    { icon: Users, label: "Team Members", value: "12" },
    { icon: PhoneCall, label: "Active Calls", value: currentCall ? "1" : "0" },
    { icon: Clock, label: "Total Hours", value: Math.floor(stats.totalMinutes / 60).toString() },
    { icon: Globe, label: "Countries", value: "15" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      <div data-animate="header">
        <Header user={user} onSignOut={signOut} />
      </div>

      <main className="container py-8 px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8" data-animate="hero">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-2">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || "there"}! 👋
              </p>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex gap-4 flex-wrap">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <stat.icon className="w-4 h-4 text-[#0891b2]" />
                  <span className="text-sm text-gray-500">{stat.label}:</span>
                  <span className="font-bold text-[#1a365d]">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div data-animate="stats" className="mb-8">
          <StatsCards stats={stats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div data-animate="content">
              <RecentCalls
                calls={calls}
                loading={loading}
                onCallBack={handleCallBack}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div data-animate="sidebar">
              <WalletCard
                balance={wallet.balance}
                currency={wallet.currency}
              />
            </div>

            <div data-animate="sidebar">
              <Dialer
                onCall={handleCall}
                onEndCall={handleEndCall}
                disabled={isInitializing}
                isInCall={!!currentCall}
                callDuration={callDuration}
                callerName={currentNumber ? `${currentCountryCode} ${currentNumber}` : "Unknown"}
              />
            </div>

            {/* Connection Status */}
            {isInitializing && (
              <div data-animate="sidebar" className="p-4 bg-[#0891b2]/10 border border-[#0891b2]/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#0891b2] rounded-full animate-ping" />
                  <p className="text-sm font-medium text-[#0891b2]">
                    Initializing calling device...
                  </p>
                </div>
              </div>
            )}

            {!isConnected && !isInitializing && !currentCall && (
              <div data-animate="sidebar" className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      Device not connected
                    </p>
                    <p className="text-xs text-amber-600">
                      Attempting to reconnect...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isConnected && !currentCall && (
              <div data-animate="sidebar" className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <p className="text-sm font-medium text-green-700">
                    Ready to make calls
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
