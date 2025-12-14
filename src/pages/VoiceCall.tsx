import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import InternalCall from "@/components/dashboard/InternalCall";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  Phone,
  Plus,
  Trash2,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  UserPlus,
  Globe,
  Clock,
  ArrowLeft,
  Headphones,
} from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  country_code?: string;
  is_contact?: boolean;
}

interface ConferenceRoom {
  id: string;
  name: string;
  participants: string[];
  created_at: string;
  is_active: boolean;
}

interface ExternalParticipant {
  id: string;
  phoneNumber: string;
  countryCode: string;
  name?: string;
}

export default function VoiceCall() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "browser-call" | "internal" | "external"
  >("browser-call");

  // Internal Browser Call State
  const [showInternalCall, setShowInternalCall] = useState(false);
  const [internalCallRoom, setInternalCallRoom] = useState("");
  const [internalCallName, setInternalCallName] = useState("");

  // Internal Team Conference State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [roomName, setRoomName] = useState("");
  const [activeRooms, setActiveRooms] = useState<ConferenceRoom[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // External Conference State
  const [externalParticipants, setExternalParticipants] = useState<
    ExternalParticipant[]
  >([]);
  const [currentNumber, setCurrentNumber] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("+1");
  const [currentName, setCurrentName] = useState("");
  const [conferenceTitle, setConferenceTitle] = useState("");
  const [activeConferences, setActiveConferences] = useState<any[]>([]);

  // Active Call State
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
      fetchActiveRooms();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);

      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) {
        setLoadingTeam(false);
        return;
      }

      // Fetch contacts from API
      const contactsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contacts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allMembers: TeamMember[] = [];

      // Add contacts as team members
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        const contactMembers = contactsData.contacts.map((contact: any) => ({
          id: contact.id,
          user_id: contact.id,
          full_name: contact.name,
          email:
            contact.email || `${contact.country_code}${contact.phone_number}`,
          avatar_url: null,
          phone_number: contact.phone_number,
          country_code: contact.country_code,
          is_contact: true,
        }));
        allMembers.push(...contactMembers);
      }

      // Check if user has enterprise account and fetch enterprise members
      const { data: enterpriseData } = await supabase
        .from("enterprise_members")
        .select("enterprise_id")
        .eq("user_id", user?.id)
        .single();

      if (enterpriseData) {
        // Fetch all team members
        const { data: members, error: membersError } = await supabase
          .from("enterprise_members")
          .select("id, user_id")
          .eq("enterprise_id", enterpriseData.enterprise_id)
          .neq("user_id", user?.id);

        if (membersError) {
          console.error("Error fetching enterprise members:", membersError);
        } else if (members && members.length > 0) {
          // Fetch profiles separately for each member
          const userIds = members.map((m) => m.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds);

          const enterpriseMembers = members.map((m: any) => {
            const profile = profiles?.find((p) => p.id === m.user_id);
            return {
              id: m.id,
              user_id: m.user_id,
              full_name: profile?.full_name || "Team Member",
              email: profile?.email || "",
              avatar_url: profile?.avatar_url,
              is_contact: false,
            };
          });
          allMembers.push(...enterpriseMembers);
        }
      }

      setTeamMembers(allMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conference/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActiveConferences(data.conferences || []);
      }
    } catch (error) {
      console.error("Error fetching active conferences:", error);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const createTeamRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    if (selectedMembers.size === 0) {
      toast.error("Please select at least one team member");
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      // Get enterprise ID
      const { data: enterpriseData } = await supabase
        .from("enterprise_members")
        .select("enterprise_id")
        .eq("user_id", user?.id)
        .single();

      const participantNames = Array.from(selectedMembers)
        .map((id) => {
          const member = teamMembers.find((m) => m.id === id);
          return member?.full_name || "Unknown";
        })
        .join(", ");

      toast.loading("Creating conference room...");

      // Separate contacts from enterprise members
      const selectedMembersList = Array.from(selectedMembers)
        .map((id) => teamMembers.find((m) => m.id === id))
        .filter(Boolean);

      const enterpriseMembers = selectedMembersList
        .filter((m) => !m.is_contact)
        .map((m) => m.user_id);
      const contactMembers = selectedMembersList
        .filter((m) => m.is_contact)
        .map((m) => ({
          name: m.full_name,
          phone_number: m.phone_number,
          country_code: m.country_code,
        }));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conference/create-internal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomName,
            memberIds: enterpriseMembers,
            contacts: contactMembers,
            enterpriseId: enterpriseData?.enterprise_id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Conference room created: ${roomName}`);
        toast.info(`Inviting: ${participantNames}`);

        setIsInCall(true);
        setCallDuration(0);
        setRoomName("");
        setSelectedMembers(new Set());

        // Refresh active rooms
        fetchActiveRooms();
      } else {
        toast.error(data.error || "Failed to create conference room");
      }

      // Reset form
      setRoomName("");
      setSelectedMembers(new Set());
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create conference room");
    }
  };

  const addExternalParticipant = () => {
    if (!currentNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    const newParticipant: ExternalParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      phoneNumber: currentNumber,
      countryCode: currentCountryCode,
      name: currentName || undefined,
    };

    setExternalParticipants([...externalParticipants, newParticipant]);
    setCurrentNumber("");
    setCurrentName("");
    toast.success("Participant added");
  };

  const removeExternalParticipant = (id: string) => {
    setExternalParticipants(externalParticipants.filter((p) => p.id !== id));
    toast.info("Participant removed");
  };

  const startExternalConference = async () => {
    if (!conferenceTitle.trim()) {
      toast.error("Please enter a conference title");
      return;
    }

    if (externalParticipants.length === 0) {
      toast.error("Please add at least one participant");
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const participantList = externalParticipants
        .map((p) => `${p.countryCode} ${p.phoneNumber}`)
        .join(", ");

      toast.loading("Starting external conference...");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conference/create-external`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: conferenceTitle,
            participants: externalParticipants.map((p) => ({
              phone: p.phoneNumber,
              countryCode: p.countryCode,
              name: p.name || "Unknown",
            })),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`External conference started: ${conferenceTitle}`);
        toast.info(`Calling: ${participantList}`);

        setIsInCall(true);
        setCallDuration(0);
        setConferenceTitle("");
        setExternalParticipants([]);

        // Refresh active conferences
        fetchActiveRooms();
      } else {
        toast.error(data.error || "Failed to start conference");
      }
    } catch (error) {
      console.error("Error starting conference:", error);
      toast.error("Failed to start conference call");
    }
  };

  const endCall = async () => {
    try {
      // Get the current active conference
      if (activeConferences.length > 0) {
        const currentConference = activeConferences[0];
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;

        if (token) {
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/conference/end/${
              currentConference.id
            }`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error ending conference:", error);
    } finally {
      setIsInCall(false);
      setCallDuration(0);
      setIsMuted(false);
      toast.success("Call ended");
      fetchActiveRooms();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone on" : "Microphone muted");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-6 px-4 md:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d]">
              Voice Calls
            </h1>
            <p className="text-gray-600">
              Conference calling for teams and clients
            </p>
          </div>
        </div>

        {/* Active Call Banner */}
        {isInCall && (
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Call in Progress</p>
                    <p className="text-sm text-white/80 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDuration(callDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    {isMuted ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Internal vs External */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-[48rem] grid-cols-3 h-12">
            <TabsTrigger
              value="browser-call"
              className="flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              Browser Call (Free)
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Phone Conference
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              External
            </TabsTrigger>
          </TabsList>

          {/* Browser-Based Internal Call Tab (Free for Enterprise) */}
          <TabsContent value="browser-call" className="space-y-6">
            {showInternalCall ? (
              <InternalCall
                roomName={internalCallRoom}
                userName={internalCallName}
                onLeave={() => {
                  setShowInternalCall(false);
                  setInternalCallRoom("");
                }}
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Join/Create Internal Call */}
                <Card className="border-2 border-[#0891b2]/20 bg-gradient-to-br from-[#0891b2]/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                      <Headphones className="w-6 h-6 text-[#0891b2]" />
                      Internal Team Call
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      ✨ Free browser-based calling with your team • No phone
                      numbers needed
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <Users className="w-5 h-5" />
                        <span className="font-semibold">Unlimited & Free</span>
                      </div>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>✓ No billing or wallet deduction</li>
                        <li>✓ WebRTC audio (browser-based)</li>
                        <li>✓ Enterprise users only</li>
                        <li>✓ One-to-one or group calls</li>
                      </ul>
                    </div>

                    <div>
                      <Label htmlFor="callRoomName">Room Name</Label>
                      <Input
                        id="callRoomName"
                        placeholder="e.g., Team Standup, Project Discussion"
                        value={internalCallRoom}
                        onChange={(e) => setInternalCallRoom(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="displayName">Your Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Enter your display name"
                        value={internalCallName}
                        onChange={(e) => setInternalCallName(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (
                          !internalCallRoom.trim() ||
                          !internalCallName.trim()
                        ) {
                          toast.error("Please enter room name and your name");
                          return;
                        }
                        setShowInternalCall(true);
                      }}
                      className="w-full bg-[#0891b2] hover:bg-[#0e7490] text-white h-12 text-lg"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Join / Create Room
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Share the room name with teammates to join the same call
                    </p>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#1a365d]">
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0891b2]/10 flex items-center justify-center text-[#0891b2] font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Create or Join Room</p>
                          <p className="text-sm text-gray-600">
                            Enter a room name and your display name
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0891b2]/10 flex items-center justify-center text-[#0891b2] font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Share Room Name</p>
                          <p className="text-sm text-gray-600">
                            Tell your teammates the room name to join
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0891b2]/10 flex items-center justify-center text-[#0891b2] font-bold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Talk Freely</p>
                          <p className="text-sm text-gray-600">
                            Use mute/unmute controls • Leave anytime
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Best For:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Quick team discussions</li>
                        <li>• Daily standups & meetings</li>
                        <li>• Project collaboration</li>
                        <li>• Internal support calls</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Only team members from your
                        enterprise can join. External participants should use
                        the "External" tab.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Internal Team Conference Tab */}
          <TabsContent value="internal" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create Conference Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                    <Users className="w-5 h-5 text-[#0891b2]" />
                    Create Team Conference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      placeholder="e.g., Daily Standup, Project Review"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      disabled={isInCall}
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">Select Team Members</Label>
                    {loadingTeam ? (
                      <p className="text-sm text-gray-500">
                        Loading team members...
                      </p>
                    ) : teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No team members found</p>
                        <p className="text-xs mt-1">
                          You need to be part of an enterprise account
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={selectedMembers.has(member.id)}
                              onCheckedChange={() =>
                                toggleMemberSelection(member.id)
                              }
                              disabled={isInCall}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#0891b2] font-bold text-sm">
                                  {member.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`member-${member.id}`}
                                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                >
                                  {member.full_name}
                                  {member.is_contact && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                      Contact
                                    </span>
                                  )}
                                </label>
                                <p className="text-xs text-gray-500 truncate">
                                  {member.is_contact && member.phone_number
                                    ? `${member.country_code} ${member.phone_number}`
                                    : member.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={createTeamRoom}
                    disabled={
                      isInCall || selectedMembers.size === 0 || !roomName
                    }
                    className="w-full bg-[#0891b2] hover:bg-[#0e7490]"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create & Start Conference
                  </Button>
                </CardContent>
              </Card>

              {/* Active Rooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                    <Video className="w-5 h-5 text-[#0891b2]" />
                    Active Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeRooms.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active conference rooms</p>
                      <p className="text-xs mt-1">
                        Create a room to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeRooms.map((room) => (
                        <div
                          key={room.id}
                          className="p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#1a365d]">
                              {room.name}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {room.participants.length} participants
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* External Conference Tab */}
          <TabsContent value="external" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create External Conference */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                    <Globe className="w-5 h-5 text-[#0891b2]" />
                    Create External Conference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="conferenceTitle">Conference Title</Label>
                    <Input
                      id="conferenceTitle"
                      placeholder="e.g., Client Review Call"
                      value={conferenceTitle}
                      onChange={(e) => setConferenceTitle(e.target.value)}
                      disabled={isInCall}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Add Participants</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Country Code"
                        value={currentCountryCode}
                        onChange={(e) => setCurrentCountryCode(e.target.value)}
                        className="w-24"
                        disabled={isInCall}
                      />
                      <Input
                        placeholder="Phone Number"
                        value={currentNumber}
                        onChange={(e) => setCurrentNumber(e.target.value)}
                        className="flex-1"
                        disabled={isInCall}
                      />
                    </div>
                    <Input
                      placeholder="Name (optional)"
                      value={currentName}
                      onChange={(e) => setCurrentName(e.target.value)}
                      disabled={isInCall}
                    />
                    <Button
                      onClick={addExternalParticipant}
                      variant="outline"
                      className="w-full"
                      disabled={isInCall}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Participant
                    </Button>
                  </div>

                  {externalParticipants.length > 0 && (
                    <div>
                      <Label className="mb-2 block">
                        Participants ({externalParticipants.length})
                      </Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {externalParticipants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {participant.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {participant.countryCode}{" "}
                                {participant.phoneNumber}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeExternalParticipant(participant.id)
                              }
                              disabled={isInCall}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={startExternalConference}
                    disabled={
                      isInCall ||
                      externalParticipants.length === 0 ||
                      !conferenceTitle
                    }
                    className="w-full bg-[#f97316] hover:bg-[#ea580c]"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Start Conference Call
                  </Button>
                </CardContent>
              </Card>

              {/* Active External Conferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                    <Phone className="w-5 h-5 text-[#0891b2]" />
                    Active Conferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeConferences.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active external conferences</p>
                      <p className="text-xs mt-1">
                        Start a conference to see it here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeConferences.map((conf) => (
                        <div
                          key={conf.id}
                          className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#1a365d]">
                              {conf.title}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {conf.participants} participants
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
