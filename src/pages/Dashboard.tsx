import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Header } from "@/components/layout/Header";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { Dialer } from "@/components/dashboard/Dialer";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { toast } from "sonner";

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

  const handleAddFunds = () => {
    toast.info("Payment integration coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/50">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8 px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-400/20 blur-3xl opacity-30 -z-10" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.user_metadata?.full_name || "there"}! 👋
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <StatsCards stats={stats} />
            <RecentCalls calls={calls} loading={loading} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WalletCard
              balance={wallet.balance}
              currency={wallet.currency}
              onAddFunds={handleAddFunds}
            />

            <Dialer
              onCall={handleCall}
              disabled={!!currentCall || isInitializing}
            />

            {/* Status Messages */}
            {isInitializing && (
              <div className="animate-pulse p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Initializing calling device...
                  </p>
                </div>
              </div>
            )}

            {!isConnected && !isInitializing && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      Device not connected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Attempting to reconnect...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentCall && (
              <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                        Call In Progress
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected and active
                    </p>
                  </div>
                  <button
                    onClick={hangupCall}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all duration-200 shadow-lg font-semibold"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
