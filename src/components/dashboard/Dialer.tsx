import { useState, useEffect, useRef } from "react";
import {
  Phone,
  Delete,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bluetooth,
  Speaker,
  PhoneOff,
  Users,
  UserPlus,
  Settings,
  Save,
  Trash,
  Edit,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const dialPad = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

const countryCodes = [
  // North America
  { code: "+1", country: "US/CA", flag: "🇺🇸" },

  // Europe
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+420", country: "Czech Rep", flag: "🇨🇿" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦" },
  { code: "+40", country: "Romania", flag: "🇷🇴" },

  // Asia Pacific
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },

  // Middle East & Africa
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },

  // Latin America
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+507", country: "Panama", flag: "🇵🇦" },

  // Caribbean
  { code: "+1876", country: "Jamaica", flag: "🇯🇲" },
  { code: "+1868", country: "Trinidad", flag: "🇹🇹" },
  { code: "+1809", country: "Dom. Rep.", flag: "🇩🇴" },
];

interface DialerProps {
  onCall?: (number: string, countryCode: string) => void;
  onEndCall?: () => void;
  onMarkAnswered?: () => void;
  disabled?: boolean;
  isInCall?: boolean;
  callDuration?: number;
  callerName?: string;
  callState?: "idle" | "connecting" | "ringing" | "answered";
  onUploadCSV?: () => void;
}

export function Dialer({
  onCall,
  onEndCall,
  onMarkAnswered,
  disabled,
  isInCall = false,
  callDuration = 0,
  callerName = "Unknown",
  callState = "idle",
  onUploadCSV,
}: DialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"keypad" | "contacts" | "recents">(
    "keypad",
  );

  // Country code search state
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const countrySearchRef = useRef<HTMLInputElement>(null);

  // Handle country search dropdown focus
  useEffect(() => {
    if (countrySearchOpen && countrySearchRef.current) {
      // Immediate focus without delay
      countrySearchRef.current.focus();
      // Also set a backup with minimal delay
      setTimeout(() => {
        countrySearchRef.current?.focus();
      }, 10);
    }
  }, [countrySearchOpen]);

  // Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");

  // Simulate voice level animation when in call
  useEffect(() => {
    if (isInCall && !isMuted) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isInCall, isMuted]);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contacts`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const saveContact = async () => {
    if (!contactName.trim()) {
      toast.error("Please enter a contact name");
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please log in to save contacts");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: contactName.trim(),
            phone_number: phoneNumber,
            country_code: countryCode,
            email: contactEmail?.trim() || null,
            company: contactCompany?.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Contact saved successfully!");
        setShowAddContact(false);
        setContactName("");
        setContactEmail("");
        setContactCompany("");
        fetchContacts();
      } else {
        const errorMsg = data.error || "Failed to save contact";
        console.error("Save contact error:", errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Network error. Please check your connection.");
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contacts/${contactId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Contact deleted");
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const loadContact = (contact: any) => {
    setPhoneNumber(contact.phone_number);
    setCountryCode(contact.country_code);
    setActiveTab("keypad");
  };

  const handleDigitPress = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber((prev) => prev + digit);
      // Play DTMF tone sound effect
      playDTMFTone(digit);
    }
  };

  const playDTMFTone = (digit: string) => {
    // Create audio context for DTMF tones
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // DTMF frequencies
      const frequencies: Record<string, [number, number]> = {
        "1": [697, 1209],
        "2": [697, 1336],
        "3": [697, 1477],
        "4": [770, 1209],
        "5": [770, 1336],
        "6": [770, 1477],
        "7": [852, 1209],
        "8": [852, 1336],
        "9": [852, 1477],
        "*": [941, 1209],
        "0": [941, 1336],
        "#": [941, 1477],
      };

      const [low, high] = frequencies[digit] || [697, 1209];
      oscillator.frequency.value = (low + high) / 2;
      oscillator.type = "sine";

      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio context not available
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length >= 7 && onCall) {
      onCall(phoneNumber, countryCode);
    }
  };

  const handleKeyboardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digit characters
    const cleaned = input.replace(/[^\d]/g, "");
    // Limit length to 15 digits
    const limited = cleaned.slice(0, 15);
    setPhoneNumber(limited);
  };

  const formatPhoneNumber = (num: string) => {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleBluetooth = async () => {
    try {
      if (!isBluetoothConnected) {
        // Request Bluetooth device
        if ("bluetooth" in navigator) {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["battery_service"],
          });
          if (device) {
            setIsBluetoothConnected(true);
          }
        }
      } else {
        setIsBluetoothConnected(false);
      }
    } catch (e) {
      console.log("Bluetooth not available or cancelled");
    }
  };

  // Voice level visualization bars
  const VoiceVisualizer = () => (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-cyan-300 rounded-full transition-all duration-75"
          style={{
            height: `${Math.max(4, audioLevel * (0.5 + Math.sin(i) * 0.5))}%`,
            opacity: audioLevel > 10 ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );

  // Active Call View
  if (isInCall) {
    return (
      <Card className="border-yellow-500/20 bg-[#101722] rounded-2xl shadow-xl overflow-hidden">
        {/* Call Header */}
        <div className="bg-gradient-to-r from-[#1b2435] to-[#121a29] p-6 text-zinc-100 border-b border-yellow-500/20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/15 flex items-center justify-center backdrop-blur-sm border-4 border-yellow-500/30">
              <span className="text-3xl font-bold">
                {callerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold">{callerName}</h3>
            <p className="text-zinc-400 text-sm">
              {countryCode} {formatPhoneNumber(phoneNumber)}
            </p>

            {/* Call Status */}
            <div className="mt-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-yellow-500/20">
              <p className="text-zinc-200 text-xs font-medium">
                {callState === "connecting" && "🔵 Connecting..."}
                {callState === "ringing" && "📞 Ringing..."}
                {callState === "answered" && "✅ Connected"}
              </p>
            </div>

            {/* Voice Level Indicator */}
            <div className="mt-4 bg-white/5 rounded-full p-3 backdrop-blur-sm border border-yellow-500/20">
              <VoiceVisualizer />
            </div>

            {callState === "answered" && (
              <div className="mt-3 text-2xl font-mono font-bold">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Audio Controls */}
          <div className="grid grid-cols-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      isMuted
                        ? "bg-red-500/20 text-red-300"
                        : "bg-[#182131] text-zinc-400 hover:bg-[#223049]"
                    }`}
                  >
                    {isMuted ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                    <span className="text-xs font-medium">Mute</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      isSpeakerOn
                        ? "bg-cyan-400/20 text-cyan-300"
                        : "bg-[#182131] text-zinc-400 hover:bg-[#223049]"
                    }`}
                  >
                    {isSpeakerOn ? (
                      <Volume2 className="w-6 h-6" />
                    ) : (
                      <VolumeX className="w-6 h-6" />
                    )}
                    <span className="text-xs font-medium">Speaker</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSpeakerOn ? "Speaker Off" : "Speaker On"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleBluetooth}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      isBluetoothConnected
                        ? "bg-blue-400/20 text-blue-300"
                        : "bg-[#182131] text-zinc-400 hover:bg-[#223049]"
                    }`}
                  >
                    <Bluetooth className="w-6 h-6" />
                    <span className="text-xs font-medium">Bluetooth</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isBluetoothConnected
                    ? "Disconnect Bluetooth"
                    : "Connect Bluetooth"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#182131] text-zinc-400 hover:bg-[#223049] transition-all">
                    <UserPlus className="w-6 h-6" />
                    <span className="text-xs font-medium">Add</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add participant</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Keypad Toggle (for DTMF during call) */}
          <div className="grid grid-cols-3 gap-2">
            {dialPad.map(({ digit, letters }) => (
              <button
                key={digit}
                onClick={() => playDTMFTone(digit)}
                className="group flex flex-col items-center justify-center h-12 rounded-xl bg-[#182131] hover:bg-[#223049] border border-yellow-500/15 active:scale-95 transition-all duration-150"
              >
                <span className="text-lg font-bold text-zinc-300 group-hover:text-cyan-300">
                  {digit}
                </span>
              </button>
            ))}
          </div>

          {/* Call Answered Button - shown when ringing */}
          {callState === "ringing" && onMarkAnswered && (
            <Button
              onClick={onMarkAnswered}
              className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all duration-300 rounded-full font-semibold mb-4"
              size="lg"
            >
              ✅ Person Answered
            </Button>
          )}

          {/* End Call Button */}
          <Button
            onClick={onEndCall}
            className="w-full h-14 text-lg bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all duration-300 rounded-full font-semibold"
            size="lg"
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            End Call
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default Dialer View
  return (
    <Card className="border-yellow-500/20 bg-[#101722] rounded-2xl shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-500/20">
              <Phone className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="text-zinc-100 font-bold">Make a Call</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-[#182131] rounded-xl border border-yellow-500/15">
          {[
            { id: "keypad", label: "Keypad", icon: Phone },
            { id: "contacts", label: "Contacts", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#223049] text-cyan-300 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload XLSX Button - For organization members */}
        {onUploadCSV && (
          <button
            onClick={onUploadCSV}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-[#202a3e] border border-fuchsia-400/25 text-fuchsia-200 hover:bg-[#27344e] shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Call Data (XLSX)
          </button>
        )}

        {/* Country Code & Number Input */}
        <div className="flex gap-2">
          <Select
            value={countryCode}
            onValueChange={(value) => {
              setCountryCode(value);
              setCountrySearchOpen(false);
            }}
            open={countrySearchOpen}
            onOpenChange={(open) => {
              setCountrySearchOpen(open);
              if (!open) {
                setCountrySearchQuery("");
              }
            }}
          >
            <SelectTrigger className="w-32 border-yellow-500/20 bg-[#182131] hover:bg-[#223049] text-zinc-200">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>
                    {countryCodes.find((c) => c.code === countryCode)?.flag}
                  </span>
                  <span>{countryCode}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72 bg-[#141a24] border-yellow-500/20 text-zinc-100">
              <div className="sticky top-0 z-10 bg-[#141a24] p-2 border-b border-yellow-500/20">
                <input
                  ref={countrySearchRef}
                  type="text"
                  placeholder="Search country..."
                  value={countrySearchQuery}
                  onChange={(e) => {
                    setCountrySearchQuery(e.target.value);
                    // Ensure focus remains after state update
                    setTimeout(() => {
                      if (countrySearchRef.current && countrySearchOpen) {
                        countrySearchRef.current.focus();
                      }
                    }, 0);
                  }}
                  className="w-full px-3 py-2 text-sm border border-yellow-500/20 rounded-lg bg-[#182131] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    // Allow normal typing and navigation
                    if (e.key === "Escape") {
                      setCountrySearchOpen(false);
                    }
                  }}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyPress={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    // Prevent blur from closing dropdown unless clicking outside
                    e.stopPropagation();
                  }}
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {countryCodes
                  .filter(
                    (c) =>
                      countrySearchQuery === "" ||
                      c.country
                        .toLowerCase()
                        .includes(countrySearchQuery.toLowerCase()) ||
                      c.code
                        .toLowerCase()
                        .includes(countrySearchQuery.toLowerCase()),
                  )
                  .map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{c.flag}</span>
                        <span className="font-mono">{c.code}</span>
                        <span className="text-zinc-500">-</span>
                        <span className="text-sm">{c.country}</span>
                      </span>
                    </SelectItem>
                  ))}
                {countryCodes.filter(
                  (c) =>
                    countrySearchQuery === "" ||
                    c.country
                      .toLowerCase()
                      .includes(countrySearchQuery.toLowerCase()) ||
                    c.code
                      .toLowerCase()
                      .includes(countrySearchQuery.toLowerCase()),
                ).length === 0 && (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    No countries found
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/70" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={handleKeyboardInput}
              placeholder="Enter number"
              className="w-full h-10 pl-10 pr-10 text-lg font-mono bg-[#182131] text-zinc-100 rounded-xl border border-yellow-500/20 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all"
              autoComplete="tel"
            />
            {phoneNumber && (
              <button
                onClick={handleDelete}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Keypad Tab Content */}
        {activeTab === "keypad" && (
          <>
            {/* Dial Pad */}
            <div className="grid grid-cols-3 gap-3">
              {dialPad.map(({ digit, letters }) => (
                <button
                  key={digit}
                  onClick={() => handleDigitPress(digit)}
                  className="group flex flex-col items-center justify-center h-16 rounded-2xl bg-[#182131] hover:bg-[#223049] border border-yellow-500/20 hover:border-cyan-400/30 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  <span className="text-2xl font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                    {digit}
                  </span>
                  {letters && (
                    <span className="text-[10px] text-zinc-500 tracking-widest">
                      {letters}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Save Contact Button */}
            {phoneNumber.length >= 7 && (
              <Button
                onClick={() => setShowAddContact(true)}
                variant="outline"
                className="w-full border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Contact
              </Button>
            )}

            {/* Call Button */}
            <Button
              onClick={handleCall}
              disabled={phoneNumber.length < 7 || disabled}
              className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call {countryCode} {formatPhoneNumber(phoneNumber) || "..."}
            </Button>
          </>
        )}

        {/* Contacts Tab Content */}
        {activeTab === "contacts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-zinc-200">My Contacts</h4>
              <span className="text-sm text-zinc-500">
                {contacts.length} contacts
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-400 mb-2">No contacts yet</p>
                <p className="text-sm text-zinc-500">
                  Enter a number and save it as a contact
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-[#182131] hover:bg-[#223049] rounded-xl border border-yellow-500/15 transition-all group"
                  >
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => loadContact(contact)}
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-300 font-bold">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-zinc-200 truncate">
                            {contact.name}
                          </h5>
                          <p className="text-sm text-zinc-500 font-mono">
                            {contact.country_code} {contact.phone_number}
                          </p>
                          {contact.company && (
                            <p className="text-xs text-zinc-500 truncate">
                              {contact.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadContact(contact)}
                        className="p-2 rounded-lg bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-2 rounded-lg bg-red-400/20 text-red-300 hover:bg-red-400/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audio Device Status */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            <span>Microphone Ready</span>
          </div>
          <div className="w-px h-3 bg-zinc-700" />
          <div className="flex items-center gap-1">
            <Speaker className="w-3 h-3" />
            <span>Audio Output Ready</span>
          </div>
        </div>
      </CardContent>

      {/* Save Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-md bg-[#141a24] border-yellow-500/20 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-cyan-300" />
              Save Contact
            </DialogTitle>
            <DialogDescription>
              Save {countryCode} {phoneNumber} to your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter contact name"
                className="w-full px-3 py-2 border border-yellow-500/20 rounded-lg bg-[#182131] text-zinc-100 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Email <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-yellow-500/20 rounded-lg bg-[#182131] text-zinc-100 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Company <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                type="text"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-yellow-500/20 rounded-lg bg-[#182131] text-zinc-100 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowAddContact(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveContact}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#0b1220]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
