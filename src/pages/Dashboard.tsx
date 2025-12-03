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
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.full_name || "there"}!
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <StatsCards stats={stats} />
            <RecentCalls calls={calls} loading={loading} />
          </div>

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

            {isInitializing && (
              <div className="text-center text-sm text-muted-foreground">
                Initializing calling device...
              </div>
            )}

            {!isConnected && !isInitializing && (
              <div className="text-center text-sm text-yellow-600">
                ⚠️ Calling device not connected. Attempting to reconnect...
              </div>
            )}

            {currentCall && (
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-600">
                      Call In Progress
                    </p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                  <button
                    onClick={hangupCall}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Hang Up
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
