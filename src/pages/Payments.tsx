import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
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
import { CreditCard, DollarSign, History, Wallet, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Payments() {
  const { user, signOut } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, currency: "USD" });
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  const containerRef = useRef<HTMLDivElement>(null);

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
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance, currency")
        .eq("user_id", user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);
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
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      <div data-animate="header">
        <Header user={user} onSignOut={signOut} />
      </div>

      <main className="container py-8 px-4 md:px-6">
        <div className="mb-8" data-animate="title">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d]">
            Wallet & Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your credits and payment history
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6" data-animate="content">
            <Tabs defaultValue="add-credits">
              <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1 rounded-xl">
                <TabsTrigger
                  value="add-credits"
                  className="rounded-lg data-[state=active]:bg-[#0891b2] data-[state=active]:text-white"
                >
                  Add Credits
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-lg data-[state=active]:bg-[#0891b2] data-[state=active]:text-white"
                >
                  Payment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add-credits" className="space-y-4 mt-6">
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                      <CreditCard className="w-5 h-5 text-[#0891b2]" />
                      Add Credits
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Amount Buttons */}
                    <div className="space-y-2">
                      <Label className="text-gray-600">Quick Select</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {quickAmounts.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className={`py-3 rounded-xl font-semibold text-sm transition-all ${amount === amt.toString()
                                ? "bg-[#0891b2] text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-gray-600">
                        Or enter custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          $
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="1"
                          className="pl-8 py-6 text-lg border-gray-200 rounded-xl focus:border-[#0891b2] focus:ring-[#0891b2]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Button
                        onClick={() => handleAddCredits("stripe")}
                        disabled={loading || !amount}
                        className="w-full py-6 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-xl font-semibold transition-all"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay with Stripe
                      </Button>
                      <Button
                        onClick={() => handleAddCredits("razorpay")}
                        disabled={loading || !amount}
                        variant="outline"
                        className="w-full py-6 border-2 border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white rounded-xl font-semibold transition-all"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Razorpay / UPI
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      Stripe for international payments • Razorpay for Indian users
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                      <History className="w-5 h-5 text-[#0891b2]" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No payment history yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Your transactions will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((payment: any) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#0891b2]/10 rounded-full flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-[#0891b2]" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a365d]">
                                  {payment.currency} {payment.amount}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(payment.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${payment.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : payment.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {payment.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
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
            <Card className="border-gray-100 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                  <DollarSign className="w-5 h-5 text-[#0891b2]" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-[#1a365d] mb-2">
                    {wallet.currency === "USD" ? "$" : wallet.currency}
                    {wallet.balance.toFixed(2)}
                  </div>
                  <p className="text-gray-500">
                    Available for calls
                  </p>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Estimated calls</span>
                    <span className="font-semibold text-[#1a365d]">
                      ~{Math.floor(wallet.balance / 0.02)} min (USA)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rate to USA</span>
                    <span className="font-semibold text-[#0891b2]">$0.02/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
