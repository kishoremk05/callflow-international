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
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
];

interface DialerProps {
  onCall?: (number: string, countryCode: string) => void;
  onEndCall?: () => void;
  disabled?: boolean;
  isInCall?: boolean;
  callDuration?: number;
  callerName?: string;
  onUploadCSV?: () => void;
}

export function Dialer({
  onCall,
  onEndCall,
  disabled,
  isInCall = false,
  callDuration = 0,
  callerName = "Unknown",
  onUploadCSV,
}: DialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"keypad" | "contacts" | "recents">(
    "keypad"
  );

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
        }
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
        }
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
        }
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
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
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
          className="w-1 bg-[#0891b2] rounded-full transition-all duration-75"
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
      <Card className="border-gray-100 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Call Header */}
        <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] p-6 text-white">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <span className="text-3xl font-bold">
                {callerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold">{callerName}</h3>
            <p className="text-white/80 text-sm">
              {countryCode} {formatPhoneNumber(phoneNumber)}
            </p>

            {/* Voice Level Indicator */}
            <div className="mt-4 bg-white/10 rounded-full p-3 backdrop-blur-sm">
              <VoiceVisualizer />
            </div>

            <div className="mt-3 text-2xl font-mono font-bold">
              {formatDuration(callDuration)}
            </div>
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
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        ? "bg-[#0891b2]/10 text-[#0891b2]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
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
                className="group flex flex-col items-center justify-center h-12 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95 transition-all duration-150"
              >
                <span className="text-lg font-bold text-gray-700 group-hover:text-[#0891b2]">
                  {digit}
                </span>
              </button>
            ))}
          </div>

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
    <Card className="border-gray-100 bg-white rounded-2xl shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0891b2]">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#1a365d] font-bold">Make a Call</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {[
            { id: "keypad", label: "Keypad", icon: Phone },
            { id: "contacts", label: "Contacts", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#0891b2] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-sm hover:shadow-md"
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
            Upload Call Queue (XLSX)
          </button>
        )}

        {/* Country Code & Number Input */}
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-28 border-gray-200 bg-gray-50 hover:bg-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0891b2]/60" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={handleKeyboardInput}
              placeholder="Enter number"
              className="w-full h-10 pl-10 pr-10 text-lg font-mono bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] transition-all"
              autoComplete="tel"
            />
            {phoneNumber && (
              <button
                onClick={handleDelete}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
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
                  className="group flex flex-col items-center justify-center h-16 rounded-2xl bg-gray-50 hover:bg-[#0891b2]/5 border border-gray-200 hover:border-[#0891b2]/30 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  <span className="text-2xl font-bold text-gray-800 group-hover:text-[#0891b2] transition-colors">
                    {digit}
                  </span>
                  {letters && (
                    <span className="text-[10px] text-gray-400 tracking-widest">
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
                className="w-full border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2]/5"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Contact
              </Button>
            )}

            {/* Call Button */}
            <Button
              onClick={handleCall}
              disabled={phoneNumber.length < 7 || disabled}
              className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold"
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
              <h4 className="font-semibold text-gray-700">My Contacts</h4>
              <span className="text-sm text-gray-500">
                {contacts.length} contacts
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No contacts yet</p>
                <p className="text-sm text-gray-400">
                  Enter a number and save it as a contact
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all group"
                  >
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => loadContact(contact)}
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#0891b2] font-bold">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-800 truncate">
                            {contact.name}
                          </h5>
                          <p className="text-sm text-gray-500 font-mono">
                            {contact.country_code} {contact.phone_number}
                          </p>
                          {contact.company && (
                            <p className="text-xs text-gray-400 truncate">
                              {contact.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadContact(contact)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            <span>Microphone Ready</span>
          </div>
          <div className="w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-1">
            <Speaker className="w-3 h-3" />
            <span>Audio Output Ready</span>
          </div>
        </div>
      </CardContent>

      {/* Save Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-[#0891b2]" />
              Save Contact
            </DialogTitle>
            <DialogDescription>
              Save {countryCode} {phoneNumber} to your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter contact name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] transition-all"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Company <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] transition-all"
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
                className="flex-1 bg-[#0891b2] hover:bg-[#0e7490]"
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
