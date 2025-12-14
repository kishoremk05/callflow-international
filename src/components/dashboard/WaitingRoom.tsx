import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WaitingRoomProps {
  callId: string;
  participantName: string;
  onApproved: (token: string, roomId: string, wsUrl: string) => void;
  onRejected: () => void;
}

export function WaitingRoom({
  callId,
  participantName,
  onApproved,
  onRejected,
}: WaitingRoomProps) {
  const [status, setStatus] = useState<string>("waiting");
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Poll for status updates every 2 seconds
    const statusInterval = setInterval(async () => {
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (!accessToken) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/internal-call/status/${callId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus(data.status);

          if (data.status === "approved" && data.token) {
            toast.success("You've been approved! Joining call...");
            onApproved(data.token, data.roomId, data.wsUrl);
          } else if (data.status === "rejected") {
            toast.error("Your request was declined");
            onRejected();
          }
        }
      } catch (error) {
        console.error("Failed to check status:", error);
      }
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(statusInterval);
    };
  }, [callId, onApproved, onRejected]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-orange-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-[#1a365d]">
            Waiting for Approval{dots}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">You're in the waiting room</p>
            <p className="text-sm text-gray-500">
              The host will let you in shortly
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Your Name</p>
                <p className="text-sm text-blue-700">{participantName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span>Waiting for host response...</span>
            </div>
            <p className="text-xs text-gray-500">
              This usually takes just a few seconds
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-gray-500">
              💡 Tip: The host can see your name and approve or decline your
              request
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface WaitingParticipant {
  id: string;
  participant_name: string;
  created_at: string;
  user_id: string;
}

interface WaitingListProps {
  callId: string;
  onUpdate?: () => void;
}

export function WaitingList({ callId, onUpdate }: WaitingListProps) {
  const [waitingUsers, setWaitingUsers] = useState<WaitingParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWaiting = async () => {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/internal-call/waiting/${callId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWaitingUsers(data.waiting || []);
      }
    } catch (error) {
      console.error("Failed to fetch waiting users:", error);
    }
  };

  useEffect(() => {
    fetchWaiting();
    const interval = setInterval(fetchWaiting, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [callId]);

  const handleApprove = async (participantId: string) => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/internal-call/approve/${participantId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Participant approved!");
        fetchWaiting();
        onUpdate?.();
      } else {
        toast.error("Failed to approve participant");
      }
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve participant");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (participantId: string) => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/internal-call/reject/${participantId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Participant declined");
        fetchWaiting();
        onUpdate?.();
      } else {
        toast.error("Failed to reject participant");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject participant");
    } finally {
      setLoading(false);
    }
  };

  if (waitingUsers.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Clock className="w-5 h-5" />
          Waiting to Join ({waitingUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {waitingUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-bold">
                    {user.participant_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.participant_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(user.id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(user.id)}
                  disabled={loading}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
