import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LiveKitRoom,
  AudioTrack,
  useParticipants,
  useTracks,
  RoomAudioRenderer,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Clock,
  Loader2,
  Phone,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WaitingRoom, WaitingList } from "./WaitingRoom";

interface InternalCallProps {
  roomName: string;
  userName: string;
  onLeave: () => void;
}

function ParticipantsList() {
  const participants = useParticipants();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-[#0891b2]" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.identity}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 flex items-center justify-center">
                <span className="text-[#0891b2] font-bold text-sm">
                  {(participant.name || participant.identity)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {participant.name || participant.identity}
                </p>
                <p className="text-xs text-gray-500">
                  {participant.isSpeaking ? "🎤 Speaking..." : "Connected"}
                </p>
              </div>
              {!participant.isMicrophoneEnabled && (
                <MicOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CallControls({
  onLeave,
  roomCode,
}: {
  onLeave: () => void;
  roomCode: string;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // LiveKit handles muting through the local participant
    localParticipant.setMicrophoneEnabled(isMuted);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">Internal Call Active</p>
              <p className="text-sm text-white/80 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={toggleMute}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isMuted ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Mute
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeave}
              className="bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Leave Call
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CallRoom({ roomName, userName, onLeave }: InternalCallProps) {
  const [token, setToken] = useState<string>("");
  const [wsUrl, setWsUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [callId, setCallId] = useState<string>("");
  const [callStatus, setCallStatus] = useState<string>("connecting");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (!accessToken) {
          toast.error("Please log in to join the call");
          onLeave();
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/internal-call/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              roomName,
              participantName: userName,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.status === "waiting") {
            setCallStatus("waiting");
            setCallId(data.callId);
          } else {
            setToken(data.token);
            setWsUrl(data.wsUrl);
            setCallId(data.callId);
            setIsHost(data.isHost || false);
            setCallStatus("approved");
            toast.success(`Joined ${roomName}`);
          }
        } else {
          toast.error(data.error || "Failed to join call");
          onLeave();
        }
      } catch (error) {
        console.error("Failed to get call token:", error);
        toast.error("Failed to join call");
        onLeave();
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [roomName, userName, onLeave]);

  const handleDisconnect = async () => {
    try {
      if (callId) {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (accessToken) {
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/internal-call/leave/${callId}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to leave call:", error);
    } finally {
      onLeave();
    }
  };

  const handleApproved = (
    approvedToken: string,
    roomId: string,
    serverUrl: string
  ) => {
    setToken(approvedToken);
    setWsUrl(serverUrl);
    setCallStatus("approved");
  };

  const handleRejected = () => {
    toast.error("Access denied");
    onLeave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0891b2]" />
        <span className="ml-3 text-lg text-gray-600">
          Connecting to call...
        </span>
      </div>
    );
  }

  if (callStatus === "waiting") {
    return (
      <WaitingRoom
        callId={callId}
        participantName={userName}
        onApproved={handleApproved}
        onRejected={handleRejected}
      />
    );
  }

  if (!token || !wsUrl) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to join call</p>
        <Button onClick={onLeave} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={handleDisconnect}
      className="space-y-6"
    >
      <CallControls onLeave={handleDisconnect} roomCode={roomName} />

      {/* Room Code Display */}
      <Card className="border-2 border-[#0891b2]/30 bg-gradient-to-r from-[#0891b2]/5 to-blue-50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Room Code - Share with teammates
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white px-6 py-3 rounded-lg border-2 border-[#0891b2]/20">
                <span className="text-3xl font-bold text-[#0891b2] tracking-widest">
                  {roomName}
                </span>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(roomName);
                  toast.success("Room code copied!");
                }}
                variant="outline"
                size="sm"
                className="border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white"
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiting Room Panel for Host */}
      {isHost && <WaitingList callId={callId} />}

      <ParticipantsList />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export default function InternalCall({
  roomName,
  userName,
  onLeave,
}: InternalCallProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1a365d]">
            Internal Call: {roomName}
          </h1>
          <p className="text-gray-600">
            Free voice call with your team members
          </p>
        </div>

        <CallRoom roomName={roomName} userName={userName} onLeave={onLeave} />
      </div>
    </div>
  );
}
