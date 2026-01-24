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
import { OrganizationManagement } from "@/components/dashboard/OrganizationManagement";
import { InviteNotifications } from "@/components/dashboard/InviteNotifications";
import { JoinedOrganizations } from "@/components/dashboard/JoinedOrganizations";
import { CallQueueUpload } from "@/components/dashboard/CallQueueUpload";
import { CallQueueManager } from "@/components/dashboard/CallQueueManager";
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
  Upload,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    callState,
    hangupCall,
    markCallAnswered,
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
    "dialer",
  );

  // Organization state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showOrgManagement, setShowOrgManagement] = useState(false);
  const [showInviteNotifications, setShowInviteNotifications] = useState(false);
  const [showJoinedOrgs, setShowJoinedOrgs] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [joinedOrganizations, setJoinedOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [showCompanyNotification, setShowCompanyNotification] = useState(false);
  const [companyAdminInfo, setCompanyAdminInfo] = useState<any>(null);

  // Call Queue state (Company users only)
  const [showCallQueueUpload, setShowCallQueueUpload] = useState(false);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(() => {
    // Restore active queue from localStorage on mount
    if (typeof window !== "undefined") {
      const savedQueueId = localStorage.getItem("activeQueueId");
      return savedQueueId || null;
    }
    return null;
  });

  // Admin Access Request state (Company users only)
  const [showAdminRequestModal, setShowAdminRequestModal] = useState(false);
  const [adminRequestStatus, setAdminRequestStatus] = useState<any>(null);
  const [requestFormData, setRequestFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_id: "",
    request_type: "create_new", // 'create_new' or 'join_existing'
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [searchedCompanies, setSearchedCompanies] = useState<any[]>([]);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Company search effect
  useEffect(() => {
    const searchCompanies = async () => {
      if (!companySearchQuery || companySearchQuery.trim().length < 2) {
        setSearchedCompanies([]);
        setShowCompanyDropdown(false);
        return;
      }

      setSearchingCompanies(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}/api/companies/search?query=${encodeURIComponent(companySearchQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setSearchedCompanies(data.companies || []);
          setShowCompanyDropdown(data.companies && data.companies.length > 0);
        }
      } catch (error) {
        console.error("Error searching companies:", error);
      } finally {
        setSearchingCompanies(false);
      }
    };

    const timeoutId = setTimeout(searchCompanies, 300);
    return () => clearTimeout(timeoutId);
  }, [companySearchQuery]);

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
    if (callState === "answered") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (callState === "idle") {
        setCallDuration(0);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callState]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (userType === "company") {
        fetchOrganizations();
        checkCompanyLinking();
        fetchAdminRequestStatus(); // Check admin request status
      }
      if (userType === "company_admin") {
        fetchOrganizations();
        checkCompanyLinking();
      }
      if (userType === "normal") {
        fetchPendingInvites();
        fetchJoinedOrganizations();
      }
    }
  }, [user, userType]);

  // Persist activeQueueId to localStorage
  useEffect(() => {
    if (activeQueueId) {
      localStorage.setItem("activeQueueId", activeQueueId);
    } else {
      localStorage.removeItem("activeQueueId");
    }
  }, [activeQueueId]);

  const checkCompanyLinking = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user has already dismissed the notification
      const dismissed = localStorage.getItem(
        `company-notification-dismissed-${user?.id}`,
      );
      if (dismissed === "true") {
        return; // Don't show notification if already dismissed
      }

      // Use backend API to avoid RLS issues
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/company-admin-info`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.linked && data.companyAdmin) {
        setCompanyAdminInfo(data.companyAdmin);
        setShowCompanyNotification(true);
      }
    } catch (error) {
      console.error("Error checking company linking:", error);
    }
  };

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
        },
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
        },
      );

      const data = await response.json();
      if (response.ok) {
        setPendingInvitesCount(data.invites?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    }
  };

  const fetchJoinedOrganizations = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/my-memberships`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        setJoinedOrganizations(data.organizations || []);
        console.log("Joined organizations:", data.organizations);
      }
    } catch (error) {
      console.error("Error fetching joined organizations:", error);
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
          "id, to_number, to_country_code, status, duration_seconds, started_at, billed_amount",
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
          0,
        );
        const totalSpent = callsData.reduce(
          (sum, call) => sum + (call.billed_amount || 0),
          0,
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
  const fetchAdminRequestStatus = async () => {
    if (!user || userType !== "company") return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/api/admin-access-request/status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setAdminRequestStatus(data.request);
      }
    } catch (error) {
      console.error("Error fetching admin request status:", error);
    }
  };

  const handleManageClick = async () => {
    // If user is already a company admin, go directly to dashboard
    if (userType === "company_admin") {
      navigate("/company-admin/dashboard");
      return;
    }

    // For company users, check their request status
    if (!adminRequestStatus) {
      // No request exists, show modal to create one
      setShowAdminRequestModal(true);
    } else if (adminRequestStatus.status === "pending") {
      toast.info("Your admin access request is pending approval", {
        description: "The super admin will review your request soon.",
      });
    } else if (adminRequestStatus.status === "approved") {
      // Navigate to company admin dashboard
      navigate("/company-admin/dashboard");
    } else if (adminRequestStatus.status === "rejected") {
      toast.error("Your previous request was rejected", {
        description:
          adminRequestStatus.rejection_reason ||
          "You can submit a new request.",
      });
      setShowAdminRequestModal(true);
    }
  };

  const handleSubmitAdminRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on request type
    if (requestFormData.request_type === "join_existing") {
      if (!requestFormData.company_id) {
        toast.error("Please select a company to join");
        return;
      }
    } else {
      if (!requestFormData.company_name || !requestFormData.company_email) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setSubmittingRequest(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in again");
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/admin-access-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestFormData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Admin access request submitted successfully!", {
          description: "The super admin will review your request.",
        });
        setShowAdminRequestModal(false);
        setRequestFormData({
          company_name: "",
          company_email: "",
          company_phone: "",
          company_id: "",
          request_type: "create_new",
        });
        setSelectedCompany(null);
        setCompanySearchQuery("");
        fetchAdminRequestStatus(); // Refresh status
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting admin request:", error);
      toast.error("Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };
  const handleCall = async (number: string, countryCode: string) => {
    if (currentCall) {
      toast.error("Already on a call");
      return;
    }

    if (!isConnected && !isInitializing) {
      toast.error(
        "Calling device not ready. Backend server may not be running.",
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
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      <Header
        user={user}
        onSignOut={signOut}
        userType={userType}
        onManageClick={
          userType === "company" || userType === "company_admin"
            ? handleManageClick
            : undefined
        }
      />

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

              {/* Call Queue Upload for Company Users */}
              {userType === "company" && (
                <Button
                  onClick={() => setShowCallQueueUpload(true)}
                  variant="outline"
                  className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Upload className="w-4 h-4" />
                  Upload Call Data
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

        {/* Company Linking Notification - Organization Owners */}
        {userType === "company" &&
          showCompanyNotification &&
          companyAdminInfo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-800">
                    🎉 Your organization has been linked to a company!
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>{companyAdminInfo.company_name}</strong> has invited
                    your organization to join their company.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Contact: {companyAdminInfo.company_email}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    // Save dismissal to localStorage
                    if (companyAdminInfo && user?.id) {
                      localStorage.setItem(
                        `company-notification-dismissed-${user.id}`,
                        "true",
                      );
                    }
                    setShowCompanyNotification(false);
                  }}
                >
                  Got it
                </Button>
              </div>
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
              onMarkAnswered={markCallAnswered}
              disabled={isInitializing || (!isConnected && !currentCall)}
              isInCall={callState === "answered"}
              callState={callState}
              callDuration={callDuration}
              callerName={
                currentNumber
                  ? `${currentCountryCode} ${currentNumber}`
                  : "Unknown"
              }
              onUploadCSV={
                userType === "company" || joinedOrganizations.length > 0
                  ? () => setShowCallQueueUpload(true)
                  : undefined
              }
            />
          </div>

          {/* Right Column - Wallet & Quick Stats */}
          <div className="lg:col-span-3 space-y-6" data-animate="sidebar">
            <WalletCard balance={wallet.balance} currency={wallet.currency} />

            {/* Call Queue Manager */}
            {activeQueueId && (
              <CallQueueManager
                queueId={activeQueueId}
                onCall={(number, countryCode) => {
                  // CallQueueManager now extracts country code properly
                  console.log(
                    `📞 Dashboard received: ${countryCode} ${number}`,
                  );
                  handleCall(number, countryCode);
                }}
                onComplete={() => {
                  setActiveQueueId(null);
                  toast.success("Call queue completed!");
                }}
                currentCallStatus={
                  callState === "connecting"
                    ? "ringing"
                    : (callState as "ringing" | "idle" | "answered")
                }
              />
            )}

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
          </div>
        </div>
      </main>

      {/* Modals */}
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
            onInviteAccepted={() => {
              fetchPendingInvites();
              fetchJoinedOrganizations();
            }}
          />

          <JoinedOrganizations
            open={showJoinedOrgs}
            onClose={() => setShowJoinedOrgs(false)}
            userId={user.id}
          />
        </>
      )}

      <CallQueueUpload
        open={showCallQueueUpload}
        onClose={() => setShowCallQueueUpload(false)}
        onSuccess={(queueId) => {
          setActiveQueueId(queueId);
          setShowCallQueueUpload(false);
        }}
      />

      {/* Admin Access Request Modal */}
      <Dialog
        open={showAdminRequestModal}
        onOpenChange={setShowAdminRequestModal}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Request Company Admin Access
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose to create a new company or join an existing one as co-admin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdminRequest} className="space-y-6 mt-4">
            {/* Request Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setRequestFormData({
                    ...requestFormData,
                    request_type: "create_new",
                    company_id: "",
                  });
                  setSelectedCompany(null);
                  setCompanySearchQuery("");
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  requestFormData.request_type === "create_new"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Create New Company
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestFormData({
                    ...requestFormData,
                    request_type: "join_existing",
                    company_name: "",
                    company_email: "",
                    company_phone: "",
                  });
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  requestFormData.request_type === "join_existing"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Join Existing Company
              </button>
            </div>

            {/* Join Existing Company */}
            {requestFormData.request_type === "join_existing" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="company_search"
                    className="text-sm font-medium text-gray-700"
                  >
                    Search Company <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="company_search"
                      placeholder="Type company name..."
                      value={
                        selectedCompany
                          ? selectedCompany.company_name
                          : companySearchQuery
                      }
                      onChange={(e) => {
                        setCompanySearchQuery(e.target.value);
                        if (selectedCompany) {
                          setSelectedCompany(null);
                          setRequestFormData({
                            ...requestFormData,
                            company_id: "",
                          });
                        }
                      }}
                      onFocus={() => {
                        if (searchedCompanies.length > 0)
                          setShowCompanyDropdown(true);
                      }}
                      className="w-full"
                      autoComplete="off"
                    />
                    {searchingCompanies && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {showCompanyDropdown &&
                      searchedCompanies.length > 0 &&
                      !selectedCompany && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {searchedCompanies.map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => {
                                setSelectedCompany(company);
                                setRequestFormData({
                                  ...requestFormData,
                                  company_id: company.id,
                                });
                                setShowCompanyDropdown(false);
                                setCompanySearchQuery("");
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                  {company.company_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {company.company_name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {company.company_email}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  {selectedCompany && (
                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {selectedCompany.company_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-900">
                              {selectedCompany.company_name}
                            </p>
                            <p className="text-xs text-indigo-600">
                              {selectedCompany.company_email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(null);
                            setRequestFormData({
                              ...requestFormData,
                              company_id: "",
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You'll become a co-admin of the
                    selected company after super admin approval.
                  </p>
                </div>
              </div>
            )}

            {/* Create New Company */}
            {requestFormData.request_type === "create_new" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="company_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    placeholder="Enter your company name"
                    value={requestFormData.company_name}
                    onChange={(e) =>
                      setRequestFormData({
                        ...requestFormData,
                        company_name: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="company_email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_email"
                    type="email"
                    placeholder="company@example.com"
                    value={requestFormData.company_email}
                    onChange={(e) =>
                      setRequestFormData({
                        ...requestFormData,
                        company_email: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="company_phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company Phone (Optional)
                  </Label>
                  <Input
                    id="company_phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={requestFormData.company_phone}
                    onChange={(e) =>
                      setRequestFormData({
                        ...requestFormData,
                        company_phone: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Once approved, you'll be able to
                    access the Company Admin Dashboard to manage teams and share
                    wallet balance.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdminRequestModal(false)}
                disabled={submittingRequest}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingRequest}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
