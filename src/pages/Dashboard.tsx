import {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallContext } from "@/contexts/CallContext";
import { Header } from "@/components/layout/Header";
import { Sidebar, type SidebarView } from "@/components/layout/Sidebar";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { Dialer } from "@/components/dashboard/Dialer";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { OrganizationManagement } from "@/components/dashboard/OrganizationManagement";
import { InviteNotifications } from "@/components/dashboard/InviteNotifications";
import { JoinedOrganizations } from "@/components/dashboard/JoinedOrganizations";
import { CallQueueUpload } from "@/components/dashboard/CallQueueUpload";
import { CallQueueManager } from "@/components/dashboard/CallQueueManager";
import { MeetingCalendar } from "@/components/dashboard/MeetingCalendar";
import { toast } from "sonner";
import { gsap } from "gsap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  ArrowDownRight,
  Phone,
  Video,
  MessageSquare,
  Settings,
  Building2,
  Bell,
  Upload,
  Loader2,
  PhoneMissed,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Plus,
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
  const location = useLocation();
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
    currentNumber,
    setCurrentNumber,
    currentCountryCode,
    setCurrentCountryCode,
    callDuration,
  } = useCallContext();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: "USD" });
  const [totalShared, setTotalShared] = useState(0);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    totalSpent: 0,
    thisMonth: 0,
  });
  const [activeView, setActiveView] = useState<"dialer" | "team" | "analytics">(
    "dialer",
  );
  const [sidebarView, setSidebarView] = useState<SidebarView>(
    (location.state as any)?.view || "overview",
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

  useEffect(() => {
    if (user) {
      fetchData();
      if (userType === "company_admin") {
        fetchTotalShared(); // Fetch total shared for company admins
      }
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

  // Real-time wallet synchronization - ensures all dashboards show same balance
  useEffect(() => {
    if (!user) return;

    // Subscribe to wallet changes for this user
    const channel = supabase
      .channel(`wallet-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Wallet updated in real-time:", payload);
          if (payload.new && "balance" in payload.new) {
            setWallet({
              balance: payload.new.balance,
              currency: payload.new.currency || "USD",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const fetchTotalShared = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/company-admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success && data.stats) {
        setTotalShared(data.stats.totalShared || 0);
      }
    } catch (error) {
      console.error("Error fetching total shared:", error);
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
      if (data.request) {
        setAdminRequestStatus(data.request);
      } else {
        setAdminRequestStatus(null);
      }
    } catch (error) {
      console.error("Error fetching admin request status:", error);
    }
  };

  const handleManageClick = async () => {
    // Always do a fresh check from database to ensure we have current user_type
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user?.id)
      .single();

    const currentUserType = profile?.user_type;

    // If user is actually a company admin in the database, go to dashboard
    if (currentUserType === "company_admin") {
      navigate("/company-admin/dashboard");
      return;
    }

    // For company users, fetch fresh admin request status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please log in again");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/admin-access-request/status`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();
    const currentRequestStatus = data.request;

    // Update the state with fresh data
    setAdminRequestStatus(currentRequestStatus || null);

    // Check their request status
    if (!currentRequestStatus) {
      // No request exists, show modal to create one
      setShowAdminRequestModal(true);
    } else if (currentRequestStatus.status === "pending") {
      toast.info("Your admin access request is pending approval", {
        description: "The super admin will review your request soon.",
      });
    } else if (currentRequestStatus.status === "approved") {
      // This shouldn't happen since we already checked user_type above
      // But if it does, something is out of sync - show modal
      setShowAdminRequestModal(true);
    } else if (currentRequestStatus.status === "rejected") {
      toast.error("Your previous request was rejected", {
        description:
          currentRequestStatus.rejection_reason ||
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
      action: () => setSidebarView("voice-call"),
      showFor: ["normal", "company"], // Show for all users
    },
  ];

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden flex bg-slate-50"
    >
      <Sidebar
        activeView={sidebarView}
        onViewChange={(view) => {
          if (view === "admin") {
            handleManageClick();
          } else if (view === "numbers") {
            navigate("/numbers");
          } else if (view === "voice-call") {
            navigate("/voice-call");
          } else {
            setSidebarView(view);
          }
        }}
        onLogout={signOut}
        showAdmin={userType === "company" || userType === "company_admin"}
        user={user}
      />

      <main className="flex-1 overflow-y-auto py-6 px-6 bg-slate-50">
        {/* ── OVERVIEW ── */}
        {sidebarView === "overview" && (
          <>
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1a365d]">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Welcome back, {user?.user_metadata?.full_name || "there"} —
                  here's what's happening today.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {userType === "normal" && pendingInvitesCount > 0 && (
                  <button
                    onClick={() => setShowInviteNotifications(true)}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all animate-pulse"
                  >
                    <Bell className="w-4 h-4" />
                    {pendingInvitesCount} Invite
                    {pendingInvitesCount > 1 ? "s" : ""}
                  </button>
                )}
                {userType === "company" && (
                  <button
                    onClick={() => setShowCallQueueUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-300 text-purple-600 bg-white text-sm font-medium hover:bg-purple-50 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Call Data
                  </button>
                )}
              </div>
            </div>

            {/* ── Connection Banner ── */}
            {!isConnected && !isInitializing && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Backend server not connected
                  </p>
                  <p className="text-xs text-amber-600">
                    Start the backend server to enable calling
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

            {/* ── Company notification ── */}
            {userType === "company" &&
              showCompanyNotification &&
              companyAdminInfo && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800">
                      🎉 Your organization has been linked!
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      {companyAdminInfo.company_name} ·{" "}
                      {companyAdminInfo.company_email}
                    </p>
                  </div>
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => {
                      localStorage.setItem(
                        `company-notification-dismissed-${user?.id}`,
                        "true",
                      );
                      setShowCompanyNotification(false);
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

            {/* ── 4 Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {/* Total Calls - dark teal (hero card) */}
              <div className="bg-[#0891b2] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-white/80 mb-2">
                  Total Calls
                </p>
                <p className="text-4xl font-bold">{stats.totalCalls}</p>
                <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Increased from last month
                </p>
              </div>
              {/* Total Minutes */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#0891b2]/10 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-[#0891b2]" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Minutes
                  </p>
                </div>
                <p className="text-4xl font-bold text-[#1a365d]">
                  {stats.totalMinutes}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Increased from last month
                </p>
              </div>
              {/* Total Spent */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Wallet className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Spent
                  </p>
                </div>
                <p className="text-4xl font-bold text-[#1a365d]">
                  ${stats.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-2">vs last month</p>
              </div>
              {/* This Month */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    This Month
                  </p>
                </div>
                <p className="text-4xl font-bold text-[#1a365d]">
                  ${stats.thisMonth.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Increased +15% vs last month
                </p>
              </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid gap-6 xl:grid-cols-12">
              {/* ── Left Column (analytics + recent calls) ── */}
              <div className="xl:col-span-7 space-y-6">
                {/* Call Analytics Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-[#1a365d]">
                      Call Analytics
                    </h2>
                    <span className="text-xs text-gray-400">Last 7 days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={(() => {
                        const days = [
                          "Sun",
                          "Mon",
                          "Tue",
                          "Wed",
                          "Thu",
                          "Fri",
                          "Sat",
                        ];
                        const counts: Record<string, number> = {};
                        days.forEach((d) => (counts[d] = 0));
                        calls.forEach((c) => {
                          const d = new Date(c.started_at);
                          const diff = Math.floor(
                            (Date.now() - d.getTime()) / 86400000,
                          );
                          if (diff < 7)
                            counts[days[d.getDay()]] =
                              (counts[days[d.getDay()]] || 0) + 1;
                        });
                        return days.map((d) => ({
                          day: d,
                          calls: counts[d],
                        }));
                      })()}
                      barSize={28}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          fontSize: 12,
                        }}
                        cursor={{ fill: "#f0f9ff" }}
                      />
                      <Bar
                        dataKey="calls"
                        fill="#0891b2"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Call Queue Manager – shown left, aligned with Dialer */}
                {activeQueueId && (
                  <CallQueueManager
                    queueId={activeQueueId}
                    onCall={(number, countryCode) => {
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

                {/* Recent Calls */}
                <RecentCalls
                  calls={calls}
                  loading={loading}
                  onCallBack={handleCallBack}
                />
              </div>

              {/* ── Right Column (wallet + dialer) ── */}
              <div className="xl:col-span-5 space-y-6">
                {/* Wallet Card - dark style like Donezo hero card */}
                <div className="bg-gradient-to-br from-[#0891b2] to-[#1a365d] rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white/80">
                      Wallet Balance
                    </p>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold mt-1">
                    $
                    {(userType === "company_admin"
                      ? wallet.balance - totalShared
                      : wallet.balance
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {wallet.currency}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      {isConnected
                        ? "🟢 Calling device ready"
                        : "🔴 Device not connected"}
                    </span>
                    {!isConnected && (
                      <button
                        onClick={retryConnection}
                        className="text-xs text-white/80 hover:text-white underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Dialer */}
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

                {/* Invite Notifications for normal users */}
                {userType === "normal" && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                    <h3 className="text-sm font-semibold text-[#1a365d]">
                      Organizations
                    </h3>
                    <button
                      onClick={() => setShowInviteNotifications(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          Invitations
                        </p>
                        <p className="text-xs text-gray-400">
                          {pendingInvitesCount > 0
                            ? `${pendingInvitesCount} pending`
                            : "No pending invites"}
                        </p>
                      </div>
                      {pendingInvitesCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                          {pendingInvitesCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowJoinedOrgs(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-[#0891b2]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          My Organizations
                        </p>
                        <p className="text-xs text-gray-400">
                          View joined orgs
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Team Activity - Company users */}
                {userType === "company" && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#1a365d]">
                      Team Activity
                    </h3>
                    {[
                      {
                        icon: (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ),
                        bg: "bg-green-100",
                        label: "12 Online",
                        sub: "Team members",
                      },
                      {
                        icon: <PhoneCall className="w-4 h-4 text-[#0891b2]" />,
                        bg: "bg-[#0891b2]/10",
                        label: "3 Active Calls",
                        sub: "Right now",
                      },
                      {
                        icon: <Globe className="w-4 h-4 text-purple-600" />,
                        bg: "bg-purple-100",
                        label: "15 Countries",
                        sub: "Connected today",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}{" "}
        {/* end overview */}
        {/* ── VOICE CALL ── */}
        {sidebarView === "voice-call" && (
          <div className="max-w-md mx-auto pt-4">
            <h1 className="text-2xl font-bold text-[#1a365d] mb-6">
              Voice Call
            </h1>
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
        )}
        {/* ── RECENT CALLS ── */}
        {sidebarView === "recent-calls" && (
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d] mb-6">
              Recent Calls
            </h1>
            <RecentCalls
              calls={calls}
              loading={loading}
              onCallBack={handleCallBack}
            />
          </div>
        )}
        {/* ── MEETING CALENDAR ── */}
        {sidebarView === "calendar" && (
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d] mb-6">
              Meeting Calendar
            </h1>
            <MeetingCalendar />
          </div>
        )}
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
