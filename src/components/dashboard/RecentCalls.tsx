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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <PhoneIncoming className="w-5 h-5 text-primary" />
          Recent Calls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No calls yet</p>
            <p className="text-sm">Make your first call to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  {getStatusIcon(call.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {call.to_country_code} {call.to_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(call.started_at), "MMM d, h:mm a")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatDuration(call.duration_seconds)}
                  </div>
                  {call.billed_amount !== null && (
                    <div className="text-xs text-muted-foreground">
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