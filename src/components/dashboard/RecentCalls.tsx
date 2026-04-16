import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  MoreVertical,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onCallBack?: (number: string, countryCode: string) => void;
}

export function RecentCalls({ calls, loading, onCallBack }: RecentCallsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
      case "failed":
      case "no_answer":
      case "busy":
        return <PhoneMissed className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30";
      case "failed":
      case "no_answer":
      case "busy":
        return "bg-red-400/20 text-red-300 border border-red-400/30";
      default:
        return "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30";
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border border-yellow-500/15 bg-[#101722] shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/20">
              <PhoneIncoming className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-zinc-100 font-bold">Recent Calls</span>
          </div>
          <span className="text-sm text-zinc-500 font-normal">
            {calls.length} calls
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-[#182131]"
              >
                <div className="w-12 h-12 bg-[#232f44] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#232f44] rounded w-1/3" />
                  <div className="h-3 bg-[#232f44] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#182131] border border-yellow-500/15 flex items-center justify-center">
              <Phone className="w-10 h-10 text-zinc-600" />
            </div>
            <p className="font-medium text-lg text-zinc-300 mb-1">
              No calls yet
            </p>
            <p className="text-sm text-zinc-500">
              Make your first call to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {calls.map((call, index) => (
              <div
                key={call.id}
                className="group flex items-center gap-4 p-4 rounded-xl bg-[#182131] hover:bg-[#1d2a3f] border border-transparent hover:border-cyan-400/20 transition-all duration-200 cursor-pointer"
              >
                {/* Avatar with Status */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a3550] to-[#1f2b42] flex items-center justify-center text-zinc-100 font-bold text-lg border border-yellow-500/20">
                    {call.to_country_code.replace("+", "").slice(0, 2)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#101722] border border-yellow-500/20 flex items-center justify-center shadow-sm">
                    {getStatusIcon(call.status)}
                  </div>
                </div>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors">
                      {call.to_country_code} {call.to_number}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(call.status)}`}
                    >
                      {call.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(call.started_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>

                {/* Duration & Cost */}
                <div className="text-right">
                  <div className="text-lg font-bold text-zinc-100">
                    {formatDuration(call.duration_seconds)}
                  </div>
                  {call.billed_amount !== null && (
                    <div className="text-sm text-cyan-300 font-medium">
                      ${call.billed_amount?.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#2a3550] transition-all">
                      <MoreVertical className="w-4 h-4 text-zinc-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#141a24] border-yellow-500/20 text-zinc-100"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        onCallBack?.(call.to_number, call.to_country_code)
                      }
                      className="cursor-pointer"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Back
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Play className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
