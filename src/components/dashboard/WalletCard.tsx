import { Wallet, Plus, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WalletCardProps {
  balance: number;
  currency: string;
  onAddFunds?: () => void;
}

export function WalletCard({ balance, currency, onAddFunds }: WalletCardProps) {
  const navigate = useNavigate();

  // Calculate estimated minutes based on average rate
  const estimatedMinutes = Math.floor(balance / 0.02);

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0891b2] via-[#0e7490] to-[#155e75] text-white shadow-2xl shadow-[#0891b2]/20 rounded-2xl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl" />

      <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-white/80">
          Wallet Balance
        </CardTitle>
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
          <Wallet className="w-5 h-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div>
          <div className="text-5xl font-bold drop-shadow-lg">
            {currency === "USD" ? "$" : currency}{balance.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-white/70 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>~{estimatedMinutes} min to USA</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-xs text-white/60">Rate to USA</div>
            <div className="text-lg font-bold">$0.02/min</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-xs text-white/60">Rate to India</div>
            <div className="text-lg font-bold">$0.01/min</div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-lg font-semibold rounded-full"
          onClick={() => navigate("/payments")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
