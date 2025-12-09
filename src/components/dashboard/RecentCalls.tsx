import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CallLog {
  id: string;
  to_number: string;
  to_country_code: string;
  status: string;
  duration_seconds: number | null;
  started_at: string;
  billed_amount: number | null;
}

interface RecentCallsProps {
  calls: CallLog[];
  loading?: boolean;
}

export function RecentCalls({ calls, loading }: RecentCallsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <PhoneOutgoing className="w-4 h-4 text-success" />;
      case "failed":
      case "no_answer":
      case "busy":
        return <PhoneMissed className="w-4 h-4 text-destructive" />;
      default:
        return <Phone className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-white/80 to-white/50 dark:from-slate-900/80 dark:to-slate-900/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
            <PhoneIncoming className="w-5 h-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Recent Calls
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30"
              >
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
              <Phone className="w-10 h-10 text-primary/50" />
            </div>
            <p className="font-medium text-lg mb-1">No calls yet</p>
            <p className="text-sm">Make your first call to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {calls.map((call) => (
              <div
                key={call.id}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-secondary hover:to-secondary/80 border border-transparent hover:border-primary/10 transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getStatusIcon(call.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-lg group-hover:text-primary transition-colors">
                    {call.to_country_code} {call.to_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(call.started_at), "MMM d, h:mm a")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold">
                    {formatDuration(call.duration_seconds)}
                  </div>
                  {call.billed_amount !== null && (
                    <div className="text-sm text-primary font-medium">
                      ${call.billed_amount?.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
