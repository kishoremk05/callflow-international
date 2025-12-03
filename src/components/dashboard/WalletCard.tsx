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
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Wallet Balance
        </CardTitle>
        <Wallet className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {currency === "USD" ? "$" : currency} {balance.toFixed(2)}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAddFunds}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </CardContent>
    </Card>
  );
}