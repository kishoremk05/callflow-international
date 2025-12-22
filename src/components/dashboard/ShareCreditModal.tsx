import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DollarSign, Loader2, ArrowRightLeft } from "lucide-react";

interface ShareCreditModalProps {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  recipientEmail: string;
  recipientUserId: string;
  currentBalance: number;
  onSuccess: () => void;
}

export function ShareCreditModal({
  open,
  onClose,
  recipientName,
  recipientEmail,
  recipientUserId,
  currentBalance,
  onSuccess,
}: ShareCreditModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    const shareAmount = parseFloat(amount);

    if (!amount || isNaN(shareAmount) || shareAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!currentBalance || currentBalance <= 0) {
      toast.error("Your wallet balance is empty. Please add funds first.");
      return;
    }

    if (shareAmount > currentBalance) {
      toast.error(
        `Insufficient balance. You have $${currentBalance.toFixed(2)}`
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/wallet/share-credit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            recipient_user_id: recipientUserId,
            amount: shareAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to share credit");
      }

      toast.success(
        `Successfully shared $${shareAmount.toFixed(2)} with ${recipientName}`
      );
      setAmount("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error sharing credit:", error);
      toast.error(error.message || "Failed to share credit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#0891b2]" />
            Share Credit
          </DialogTitle>
          <DialogDescription>
            Transfer wallet balance to {recipientName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleShare}>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-[#0891b2]/10 to-[#06b6d4]/10 border border-[#0891b2]/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Recipient</span>
                <span className="text-sm font-semibold text-[#1a365d]">
                  {recipientName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-xs text-gray-500">{recipientEmail}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Available Balance: ${currentBalance?.toFixed(2) || "0.00"}
                </span>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance?.toString() || "0")}
                  className="text-[#0891b2] hover:underline font-medium"
                  disabled={!currentBalance || currentBalance <= 0}
                >
                  Use Max
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:from-[#0e7490] hover:to-[#0891b2]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Share ${amount || "0.00"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
