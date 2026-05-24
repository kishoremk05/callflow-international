import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CreditCard,
  DollarSign,
  History,
  Wallet,
  ArrowUpRight,
  Phone,
  LogOut,
} from "lucide-react";
import { gsap } from "gsap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Payments() {
  const { user, signOut } = useAuth();
  const [wallet, setWallet] = useState({
    balance: 0,
    currency: "USD",
    availableBalance: 0,
  });
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [totalShared, setTotalShared] = useState(0);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U";

  // Entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-animate="header"]', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from('[data-animate="title"]', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from('[data-animate="content"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from('[data-animate="sidebar"]', {
        opacity: 0,
        x: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWalletAndPayments();
    }
  }, [user]);

  const fetchWalletAndPayments = async () => {
    try {
      // Check if user is company admin
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user?.id)
        .single();

      const userIsCompanyAdmin = profileData?.user_type === "company_admin";
      setIsCompanyAdmin(userIsCompanyAdmin);

      // Fetch wallet data
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance, currency")
        .eq("user_id", user?.id)
        .single();

      if (walletData) {
        let availableBalance = walletData.balance;
        let shared = 0;

        // If user is company admin, fetch shared amounts to calculate available balance
        if (userIsCompanyAdmin) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/company-admin/stats`, {
              headers: {
                Authorization: `Bearer ${session?.access_token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                shared = data.stats.totalShared || 0;
                setTotalShared(shared);
                availableBalance = walletData.balance - shared;
              }
            }
          } catch (error) {
            console.error("Error fetching shared amounts:", error);
          }
        }

        setWallet({
          ...walletData,
          availableBalance: availableBalance,
        });
      }

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (paymentsData) {
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddCredits = async (provider: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: provider === "razorpay" ? "INR" : "USD",
          provider,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Payment initiated via ${provider}`);
        // In production, integrate Stripe/Razorpay checkout here
      } else {
        toast.error("Failed to create payment intent");
      }
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-[#090c12] via-[#0d121a] to-[#0a0f16] text-zinc-100"
    >
      <div
        data-animate="header"
        className="sticky top-0 z-20 border-b border-yellow-500/15 bg-[#101722]/90 backdrop-blur"
      >
        <div className="container h-16 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_8px_24px_rgba(34,211,238,0.35)]">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-100 tracking-tight">
              Palodial
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-200 font-semibold">
              {initials}
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <main className="container py-8 px-4 md:px-6">
        <div className="mb-8" data-animate="title">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
            Wallet & Payments
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your credits and payment history
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6" data-animate="content">
            <Tabs defaultValue="add-credits">
              <TabsList className="grid w-full grid-cols-2 bg-[#141a24] border border-yellow-500/20 p-1 rounded-xl">
                <TabsTrigger
                  value="add-credits"
                  className="rounded-lg text-zinc-400 data-[state=active]:bg-cyan-500 data-[state=active]:text-[#101722]"
                >
                  Add Credits
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-lg text-zinc-400 data-[state=active]:bg-cyan-500 data-[state=active]:text-[#101722]"
                >
                  Payment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add-credits" className="space-y-4 mt-6">
                <Card className="border-yellow-500/15 bg-gradient-to-br from-[#182131] to-[#141d2d] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-zinc-100">
                      <CreditCard className="w-5 h-5 text-cyan-300" />
                      Add Credits
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Choose your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Amount Buttons */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Quick Select</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {quickAmounts.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                              amount === amt.toString()
                                ? "bg-cyan-500 text-[#101722] shadow-[0_10px_20px_rgba(34,211,238,0.35)]"
                                : "bg-[#101722] text-zinc-300 hover:bg-[#223049] border border-yellow-500/15"
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-zinc-300">
                        Or enter custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                          $
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="1"
                          className="pl-8 py-6 text-lg rounded-xl bg-[#101722] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:ring-cyan-400/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Button
                        onClick={() => handleAddCredits("stripe")}
                        disabled={loading || !amount}
                        className="w-full py-6 bg-cyan-500 hover:bg-cyan-400 text-[#101722] rounded-xl font-semibold transition-all"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay with Stripe
                      </Button>
                      <Button
                        onClick={() => handleAddCredits("razorpay")}
                        disabled={loading || !amount}
                        variant="outline"
                        className="w-full py-6 border-2 border-yellow-500/35 text-yellow-200 bg-yellow-500/10 hover:bg-yellow-500/20 hover:text-yellow-100 rounded-xl font-semibold transition-all"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Razorpay / UPI
                      </Button>
                    </div>

                    <p className="text-sm text-zinc-500 text-center">
                      Stripe for international payments â€¢ Razorpay for Indian
                      users
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-yellow-500/15 bg-gradient-to-br from-[#182131] to-[#141d2d] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-zinc-100">
                      <History className="w-5 h-5 text-cyan-300" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#101722] border border-yellow-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 font-medium">
                          No payment history yet
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">
                          Your transactions will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((payment: any) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-[#101722] border border-yellow-500/10 hover:border-cyan-400/30 hover:bg-[#182131] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-cyan-500/15 rounded-full flex items-center justify-center border border-cyan-400/25">
                                <ArrowUpRight className="w-5 h-5 text-cyan-300" />
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-100">
                                  {payment.currency} {payment.amount}
                                </p>
                                <p className="text-sm text-zinc-500">
                                  {new Date(
                                    payment.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  payment.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                                    : payment.status === "pending"
                                      ? "bg-yellow-500/15 text-yellow-200 border border-yellow-500/25"
                                      : "bg-red-500/15 text-red-300 border border-red-500/25"
                                }`}
                              >
                                {payment.status}
                              </span>
                              <p className="text-xs text-zinc-500 mt-1">
                                via {payment.provider}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div data-animate="sidebar">
            <Card className="border-yellow-500/15 bg-gradient-to-br from-[#182131] to-[#141d2d] shadow-[0_10px_30px_rgba(0,0,0,0.28)] sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                  <DollarSign className="w-5 h-5 text-cyan-300" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-zinc-100 mb-2">
                    {wallet.currency === "USD" ? "$" : wallet.currency}
                    {wallet.availableBalance.toFixed(2)}
                  </div>
                  <p className="text-zinc-400">Available for calls</p>
                </div>

                <div className="mt-4 p-4 bg-[#101722] border border-yellow-500/10 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-zinc-500">Estimated calls</span>
                    <span className="font-semibold text-zinc-200">
                      ~{Math.floor(wallet.availableBalance / 0.02)} min (USA)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Rate to USA</span>
                    <span className="font-semibold text-cyan-300">
                      $0.02/min
                    </span>
                  </div>
                  {isCompanyAdmin && (
                    <div className="mt-3 pt-3 border-t border-yellow-500/10 flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Shared to teams</span>
                      <span className="font-semibold text-yellow-200">
                        ${totalShared.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
