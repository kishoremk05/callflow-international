import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  SkipForward,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  List,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CallQueueManagerProps {
  queueId: string;
  onCall: (number: string, contactName: string) => void;
  onComplete: () => void;
  currentCallStatus?: "ringing" | "answered" | "busy" | "no-answer" | "idle";
}

export function CallQueueManager({
  queueId,
  onCall,
  onComplete,
  currentCallStatus = "idle",
}: CallQueueManagerProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    answered: 0,
    skipped: 0,
  });

  useEffect(() => {
    fetchQueue();
  }, [queueId]);

  useEffect(() => {
    // Auto-skip if call not answered
    if (currentCallStatus === "busy" || currentCallStatus === "no-answer") {
      setTimeout(() => {
        handleSkip("auto");
      }, 2000);
    } else if (currentCallStatus === "answered") {
      // Mark as answered when call ends
      updateCallStatus("answered");
    }
  }, [currentCallStatus]);

  const fetchQueue = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/call-queue/${queueId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        setQueue(data.queue || []);
        setStats({
          total: data.queue?.length || 0,
          completed:
            data.queue?.filter((c: any) => c.status !== "pending").length || 0,
          answered:
            data.queue?.filter((c: any) => c.status === "answered").length || 0,
          skipped:
            data.queue?.filter((c: any) => c.status === "skipped").length || 0,
        });

        // Find first pending contact
        const firstPending = data.queue?.findIndex(
          (c: any) => c.status === "pending",
        );
        if (firstPending >= 0) {
          setCurrentIndex(firstPending);
        }
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCallStatus = async (status: string) => {
    if (!queue[currentIndex]) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/call-queue/${queueId}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            contactId: queue[currentIndex].id,
            status,
          }),
        },
      );

      fetchQueue();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCall = () => {
    const contact = queue[currentIndex];
    if (!contact) return;

    // Extract country code and clean number separately
    let countryCode = "+91"; // Default
    let cleanNumber = contact.number;

    // Remove spaces and dashes
    const rawNumber = contact.number.replace(/[\s-]/g, "");

    // If number has + symbol
    if (rawNumber.startsWith("+")) {
      // Extract country code
      if (rawNumber.startsWith("+91")) {
        countryCode = "+91";
        cleanNumber = rawNumber.substring(3);
      } else if (rawNumber.startsWith("+1")) {
        countryCode = "+1";
        cleanNumber = rawNumber.substring(2);
      } else if (rawNumber.startsWith("+44")) {
        countryCode = "+44";
        cleanNumber = rawNumber.substring(3);
      } else if (rawNumber.startsWith("+971")) {
        countryCode = "+971";
        cleanNumber = rawNumber.substring(4);
      } else {
        // Generic extraction
        const match = rawNumber.match(/^\+(\d{1,3})(\d+)$/);
        if (match) {
          countryCode = "+" + match[1];
          cleanNumber = match[2];
        }
      }
    } else if (rawNumber.startsWith("91") && rawNumber.length === 12) {
      countryCode = "+91";
      cleanNumber = rawNumber.substring(2);
    } else if (rawNumber.startsWith("1") && rawNumber.length === 11) {
      countryCode = "+1";
      cleanNumber = rawNumber.substring(1);
    } else if (rawNumber.length === 10) {
      countryCode = "+91";
      cleanNumber = rawNumber;
    }

    console.log(
      `📞 Queue calling: ${countryCode} ${cleanNumber} (${contact.name})`,
    );
    onCall(cleanNumber, countryCode);
    updateCallStatus("calling");
  };

  const handleCallSpecific = (index: number) => {
    const contact = queue[index];
    if (!contact || contact.status !== "pending") return;

    setCurrentIndex(index);

    // Extract country code and clean number separately
    let countryCode = "+91"; // Default
    let cleanNumber = contact.number;

    // Remove spaces and dashes
    const rawNumber = contact.number.replace(/[\s-]/g, "");

    // If number has + symbol
    if (rawNumber.startsWith("+")) {
      // Extract country code
      if (rawNumber.startsWith("+91")) {
        countryCode = "+91";
        cleanNumber = rawNumber.substring(3);
      } else if (rawNumber.startsWith("+1")) {
        countryCode = "+1";
        cleanNumber = rawNumber.substring(2);
      } else if (rawNumber.startsWith("+44")) {
        countryCode = "+44";
        cleanNumber = rawNumber.substring(3);
      } else if (rawNumber.startsWith("+971")) {
        countryCode = "+971";
        cleanNumber = rawNumber.substring(4);
      } else {
        // Generic extraction
        const match = rawNumber.match(/^\+(\d{1,3})(\d+)$/);
        if (match) {
          countryCode = "+" + match[1];
          cleanNumber = match[2];
        }
      }
    } else if (rawNumber.startsWith("91") && rawNumber.length === 12) {
      countryCode = "+91";
      cleanNumber = rawNumber.substring(2);
    } else if (rawNumber.startsWith("1") && rawNumber.length === 11) {
      countryCode = "+1";
      cleanNumber = rawNumber.substring(1);
    } else if (rawNumber.length === 10) {
      countryCode = "+91";
      cleanNumber = rawNumber;
    }

    console.log(
      `📞 Queue calling specific: ${countryCode} ${cleanNumber} (${contact.name})`,
    );
    onCall(cleanNumber, countryCode);
    updateCallStatus("calling");
    setShowAllContacts(false);
  };

  const handleSkip = async (type: "manual" | "auto" = "manual") => {
    await updateCallStatus("skipped");

    if (type === "manual") {
      toast.info("Contact skipped");
    }

    // Move to next
    const nextPending = queue.findIndex(
      (c, idx) => idx > currentIndex && c.status === "pending",
    );

    if (nextPending >= 0) {
      setCurrentIndex(nextPending);
    } else {
      // All done
      toast.success("Call queue completed!");
      onComplete();
    }
  };

  const handleClearQueue = () => {
    toast.success("Call queue cleared");
    onComplete(); // This will trigger clearing localStorage in Dashboard
  };

  const currentContact = queue[currentIndex];

  // Format number to show country code separately
  const formatNumber = (num: string) => {
    if (!num) return "";
    const raw = num.replace(/[\s+]/g, "");

    // India: 91 + 10 digits = 12 total
    if (raw.startsWith("91") && raw.length === 12) {
      return "+91 " + raw.substring(2);
    }
    // US/Canada: 1 + 10 digits = 11 total
    else if (raw.startsWith("1") && raw.length === 11) {
      return "+1 " + raw.substring(1);
    }
    // UK: 44 + 10 digits = 12 total
    else if (raw.startsWith("44") && raw.length === 12) {
      return "+44 " + raw.substring(2);
    }
    // UAE: 971 + 9 digits = 12 total
    else if (raw.startsWith("971") && raw.length === 12) {
      return "+971 " + raw.substring(3);
    }
    // Already has +
    else if (num.includes("+")) {
      return num;
    }
    // 10 digits only - assume India
    else if (raw.length === 10) {
      return "+91 " + raw;
    }
    // Default: first 2 digits as country code
    else if (raw.length > 10) {
      return "+" + raw.substring(0, 2) + " " + raw.substring(2);
    }
    return num;
  };

  if (loading) {
    return (
      <Card className="border-[#0891b2]/20">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0891b2]" />
        </CardContent>
      </Card>
    );
  }

  if (!currentContact) {
    return (
      <Card className="border-[#0891b2]/20">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-[#1a365d]">Queue Completed!</p>
          <p className="text-sm text-gray-600 mt-1">
            All contacts have been processed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-[#1a365d] text-base">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0891b2]" />
            <span>Call Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#0891b2] text-xs">
              {currentIndex + 1} of {stats.total}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllContacts(!showAllContacts)}
              className="h-7 px-2"
              title="Toggle list view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearQueue}
              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Stats - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{stats.answered}</p>
            <p className="text-xs text-gray-500">Answered</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-600">{stats.skipped}</p>
            <p className="text-xs text-gray-500">Skipped</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">
              {stats.total - stats.completed}
            </p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>

        {/* All Contacts List - Expandable */}
        {showAllContacts ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#0891b2]">ALL CONTACTS</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllContacts(false)}
                className="h-6 text-xs"
              >
                Show Current Only
              </Button>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {queue.map((contact, index) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer",
                      index === currentIndex && contact.status === "pending"
                        ? "bg-[#0891b2]/10 border-[#0891b2] shadow-sm"
                        : contact.status === "answered"
                          ? "bg-green-50 border-green-200"
                          : contact.status === "skipped"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-white border-gray-200 hover:border-[#0891b2]/50 hover:shadow-sm",
                    )}
                    onClick={() => handleCallSpecific(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-[#1a365d]">
                            {contact.name}
                          </p>
                          {index === currentIndex &&
                            contact.status === "pending" && (
                              <Badge className="bg-[#0891b2] text-xs h-4">
                                Current
                              </Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-mono">
                          {formatNumber(contact.number)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.status === "answered" && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {contact.status === "skipped" && (
                          <XCircle className="w-4 h-4 text-orange-600" />
                        )}
                        {contact.status === "pending" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallSpecific(index);
                            }}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            {/* Current Contact - Compact */}
            <div className="p-3 bg-[#0891b2]/5 rounded-xl border border-[#0891b2]/20">
              <p className="text-xs text-[#0891b2] font-medium mb-1">
                CURRENT CONTACT
              </p>
              <p className="font-semibold text-[#1a365d] text-sm mb-0.5">
                {currentContact.name}
              </p>
              <p className="text-xs text-gray-600 font-mono">
                {formatNumber(currentContact.number)}
              </p>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex gap-2">
              <Button
                onClick={handleCall}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-9 text-sm"
              >
                <Phone className="w-3 h-3 mr-1.5" />
                Call Now
              </Button>
              <Button
                onClick={() => handleSkip("manual")}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 h-9 px-3"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>

            {/* Next Up Preview - Compact */}
            {queue[currentIndex + 1] && (
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Next Up:</p>
                <p className="text-xs font-medium text-[#1a365d]">
                  {queue[currentIndex + 1].name}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
