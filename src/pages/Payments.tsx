import { useState, useEffect } from "react";
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
import { CreditCard, DollarSign, History } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Payments() {
  const { user, signOut } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, currency: "USD" });
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Wallet & Payments</h1>
          <p className="text-muted-foreground">
            Manage your credits and payment history
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="add-credits">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add-credits">Add Credits</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>

              <TabsContent value="add-credits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Add Credits
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleAddCredits("stripe")}
                        disabled={loading}
                        className="w-full"
                      >
                        Pay with Stripe (International)
                      </Button>
                      <Button
                        onClick={() => handleAddCredits("razorpay")}
                        disabled={loading}
                        variant="outline"
                        className="w-full"
                      >
                        Pay with Razorpay (India)
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Note: Stripe for international payments, Razorpay for
                      Indian users
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No payment history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((payment: any) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                          >
                            <div>
                              <p className="font-medium">
                                {payment.currency} {payment.amount}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-sm font-medium ${
                                  payment.status === "completed"
                                    ? "text-green-600"
                                    : payment.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {payment.status}
                              </span>
                              <p className="text-xs text-muted-foreground">
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

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {wallet.currency === "USD" ? "$" : wallet.currency}{" "}
                  {wallet.balance.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Available for calls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
