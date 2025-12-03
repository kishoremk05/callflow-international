import { Wallet, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletCardProps {
  balance: number;
  currency: string;
  onAddFunds?: () => void;
}

export function WalletCard({ balance, currency, onAddFunds }: WalletCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 text-white shadow-2xl shadow-primary/20">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-white/80">
          Wallet Balance
        </CardTitle>
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
          <Wallet className="w-5 h-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-5xl font-bold mb-6 drop-shadow-lg">
          {currency === "USD" ? "$" : currency} {balance.toFixed(2)}
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-lg font-medium"
          onClick={onAddFunds}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </CardContent>
    </Card>
  );
}