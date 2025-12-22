import {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Header } from "@/components/layout/Header";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { Dialer } from "@/components/dashboard/Dialer";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CreateOrganizationModal } from "@/components/dashboard/CreateOrganizationModal";
import { OrganizationManagement } from "@/components/dashboard/OrganizationManagement";
import { InviteNotifications } from "@/components/dashboard/InviteNotifications";
import { JoinedOrganizations } from "@/components/dashboard/JoinedOrganizations";
import { toast } from "sonner";
import { gsap } from "gsap";
import {
  Users,
  PhoneCall,
  Clock,
  Globe,
  Wifi,
  WifiOff,
  Calendar,
  BarChart3,
  ArrowUpRight,
  Phone,
  Video,
  MessageSquare,
  Settings,
  Building2,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CallLog {
  id: string;
  to_number: string;
  to_country_code: string;
  status: string;
  duration_seconds: number | null;
  started_at: string;
  billed_amount: number | null;
}

interface Wallet {
  balance: number;
  currency: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, userType } = useAuth();
  const {
    makeCall,
    isConnected,
    isInitializing,
    currentCall,
    hangupCall,
    error: twilioError,
    retryConnection,
  } = useTwilioDevice();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: "USD" });
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    totalSpent: 0,
    thisMonth: 0,
  });
  const [callDuration, setCallDuration] = useState(0);
  const [currentNumber, setCurrentNumber] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("");
  const [activeView, setActiveView] = useState<"dialer" | "team" | "analytics">(
    "dialer"
  );

  // Organization state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showOrgManagement, setShowOrgManagement] = useState(false);
  const [showInviteNotifications, setShowInviteNotifications] = useState(false);
  const [showJoinedOrgs, setShowJoinedOrgs] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-animate="hero"]', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.from('[data-animate="stats"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from('[data-animate="content"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from('[data-animate="sidebar"]', {
        opacity: 0,
        x: 30,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Call duration timer
  useEffect(() => {
    if (currentCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [currentCall]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (userType === "company") {
        fetchOrganizations();
      }
      if (userType === "normal") {
        fetchPendingInvites();
      }
    }
  }, [user, userType]);

  const fetchOrganizations = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/my-organizations`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/invites/pending`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPendingInvitesCount(data.invites?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance, currency")
        .eq("user_id", user.id)
        .single();

      if (walletError) {
        console.error("Wallet fetch error:", walletError);
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0, currency: "USD" })
          .select()
          .single();

        if (newWallet) {
          setWallet(newWallet);
        }
      } else if (walletData) {
        setWallet(walletData);
      }

      // Fetch recent calls
      const { data: callsData } = await supabase
        .from("call_logs")
        .select(
          "id, to_number, to_country_code, status, duration_seconds, started_at, billed_amount"
        )
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(10);

      if (callsData) {
        setCalls(callsData);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalCalls = callsData.length;
        const totalMinutes = callsData.reduce(
          (sum, call) => sum + (call.duration_seconds || 0) / 60,
          0
        );
        const totalSpent = callsData.reduce(
          (sum, call) => sum + (call.billed_amount || 0),
          0
        );
        const thisMonth = callsData
          .filter((call) => new Date(call.started_at) >= startOfMonth)
          .reduce((sum, call) => sum + (call.billed_amount || 0), 0);

        setStats({ totalCalls, totalMinutes, totalSpent, thisMonth });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (number: string, countryCode: string) => {
    if (currentCall) {
      toast.error("Already on a call");
      return;
    }

    if (!isConnected && !isInitializing) {
      toast.error(
        "Calling device not ready. Backend server may not be running."
      );
      return;
    }

    setCurrentNumber(number);
    setCurrentCountryCode(countryCode);

    try {
      toast.info(`Calling ${countryCode} ${number}...`);
      await makeCall(number, countryCode, "public");

      setTimeout(() => {
        fetchData();
      }, 2000);
    } catch (error: any) {
      console.error("Call failed:", error);
      toast.error(error.message || "Call failed");
    }
  };

  const handleEndCall = () => {
    hangupCall();
    setCurrentNumber("");
    setCurrentCountryCode("");
    toast.success("Call ended");
    setTimeout(() => {
      fetchData();
    }, 1000);
  };

  const handleCallBack = (number: string, countryCode: string) => {
    handleCall(number, countryCode);
  };

  // Quick actions for team communication
  const quickActions = [
    {
      icon: Phone,
      label: "Voice Call",
      color: "#0891b2",
      action: () => navigate("/voice-call"),
      showFor: ["normal", "company"], // Show for all users
    },
    ...(userType === "company"
      ? [
          {
            icon: Video,
            label: "Video Call",
            color: "#8b5cf6",
            action: () => toast.info("Video calls coming soon!"),
            showFor: ["company"], // Only for company users
          },
          {
            icon: MessageSquare,
            label: "Message",
            color: "#10b981",
            action: () => toast.info("Messaging coming soon!"),
            showFor: ["company"], // Only for company users
          },
          {
            icon: Users,
            label: "Team",
            color: "#f97316",
            action: () => setActiveView("team"),
            showFor: ["company"], // Only for company users
          },
        ]
      : []),
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-6 px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-6" data-animate="hero">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-1">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || "there"}! 👋
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap items-center">
              {/* Invite Notifications and Organizations for Normal Users */}
              {userType === "normal" && (
                <>
                  <Button
                    onClick={() => setShowInviteNotifications(true)}
                    variant={pendingInvitesCount > 0 ? "default" : "outline"}
                    className={`flex items-center gap-2 relative ${
                      pendingInvitesCount > 0
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white animate-pulse"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {pendingInvitesCount > 0
                      ? "Organization Invites"
                      : "Invitations"}
                    {pendingInvitesCount > 0 && (
                      <Badge className="ml-1 bg-white text-orange-600 hover:bg-white">
                        {pendingInvitesCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowJoinedOrgs(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-[#0891b2]/30 text-[#0891b2] hover:bg-[#0891b2]/10 hover:text-[#0e7490]"
                  >
                    <Building2 className="w-4 h-4" />
                    My Organizations
                  </Button>
                </>
              )}

              {/* Organization Button for Company Users */}
              {userType === "company" && (
                <Button
                  onClick={() => {
                    if (organizations.length === 0) {
                      setShowCreateOrgModal(true);
                    } else {
                      setSelectedOrg(organizations[0]);
                      setShowOrgManagement(true);
                    }
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:from-[#0e7490] hover:to-[#0891b2] text-white"
                >
                  <Building2 className="w-4 h-4" />
                  {organizations.length === 0
                    ? "Create Organization"
                    : "Manage Organization"}
                </Button>
              )}

              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <action.icon
                    className="w-4 h-4"
                    style={{ color: action.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Status Banner */}
        {!isConnected && !isInitializing && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Backend server not connected
              </p>
              <p className="text-xs text-amber-600">
                Start the backend server to enable calling features
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={retryConnection}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Organization Invitation Alert - Normal Users */}
        {userType === "normal" && pendingInvitesCount > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800">
                You have {pendingInvitesCount} organization invitation
                {pendingInvitesCount > 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-orange-600">
                Click the button to view and respond to your invitations
              </p>
            </div>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowInviteNotifications(true)}
            >
              View Invites
            </Button>
          </div>
        )}

        {isConnected && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <Wifi className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              Calling device ready
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div data-animate="stats" className="mb-6">
          <StatsCards stats={stats} />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Recent Calls */}
          <div className="lg:col-span-5 space-y-6">
            <div data-animate="content">
              <RecentCalls
                calls={calls}
                loading={loading}
                onCallBack={handleCallBack}
              />
            </div>
          </div>

          {/* Middle Column - Dialer */}
          <div className="lg:col-span-4 space-y-6" data-animate="sidebar">
            <Dialer
              onCall={handleCall}
              onEndCall={handleEndCall}
              disabled={isInitializing || (!isConnected && !currentCall)}
              isInCall={!!currentCall}
              callDuration={callDuration}
              callerName={
                currentNumber
                  ? `${currentCountryCode} ${currentNumber}`
                  : "Unknown"
              }
            />
          </div>

          {/* Right Column - Wallet & Quick Stats */}
          <div className="lg:col-span-3 space-y-6" data-animate="sidebar">
            <WalletCard balance={wallet.balance} currency={wallet.currency} />

            {/* Team Activity Card - Only for company users */}
            {userType === "company" && (
              <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1a365d] text-base">
                    <Users className="w-4 h-4 text-[#0891b2]" />
                    Team Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        12 Online
                      </p>
                      <p className="text-xs text-gray-500">Team members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#0891b2]/10 flex items-center justify-center">
                      <PhoneCall className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        3 Active Calls
                      </p>
                      <p className="text-xs text-gray-500">Right now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        15 Countries
                      </p>
                      <p className="text-xs text-gray-500">Connected today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Meetings - Only for company users */}
            {userType === "company" && (
              <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-[#1a365d] text-base">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0891b2]" />
                      Upcoming
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      Today
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-[#0891b2]/5 border border-[#0891b2]/10 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1a365d]">
                        Team Standup
                      </span>
                      <span className="text-xs text-[#0891b2] font-medium">
                        2:30 PM
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">5 participants</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1a365d]">
                        Client Call
                      </span>
                      <span className="text-xs text-gray-500">4:00 PM</span>
                    </div>
                    <p className="text-xs text-gray-500">External - USA</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Preview - Only for company users */}
            {userType === "company" && (
              <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-[#1a365d] text-base">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#0891b2]" />
                      This Week
                    </div>
                    <button className="text-xs text-[#0891b2] font-medium flex items-center gap-1 hover:underline">
                      View All <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-20 gap-1">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#0891b2]/20 rounded-t-sm hover:bg-[#0891b2]/40 transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateOrganizationModal
        open={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
        onSuccess={() => {
          fetchOrganizations();
          // Open organization management modal automatically after org creation
          setTimeout(() => {
            fetchOrganizations().then(() => {
              if (organizations.length > 0) {
                setSelectedOrg(organizations[0]);
                setShowOrgManagement(true);
              }
            });
          }, 500);
        }}
      />

      {selectedOrg && (
        <OrganizationManagement
          open={showOrgManagement}
          onClose={() => {
            setShowOrgManagement(false);
            setSelectedOrg(null);
          }}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          currentBalance={wallet.balance}
          onBalanceUpdate={fetchData}
        />
      )}

      {user && (
        <>
          <InviteNotifications
            open={showInviteNotifications}
            onClose={() => {
              setShowInviteNotifications(false);
              fetchPendingInvites();
            }}
            userId={user.id}
          />

          <JoinedOrganizations
            open={showJoinedOrgs}
            onClose={() => setShowJoinedOrgs(false)}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
}
