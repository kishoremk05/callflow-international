import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTeamModal } from "@/components/dashboard/CreateTeamModal";
import { OrganizationManagement } from "@/components/dashboard/OrganizationManagement";
import {
  Building2,
  Users,
  Wallet,
  Plus,
  LogOut,
  DollarSign,
  TrendingUp,
  Share2,
  Trash2,
  RefreshCw,
  Home,
  UserMinus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CompanyAdmin {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string | null;
  is_active: boolean;
}

interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  joined_at: string;
}

interface Organization {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  shared_balance: number;
  owner_wallet_balance?: number;
  created_at: string;
  organization_members: Array<{
    profiles: {
      full_name: string;
      email: string;
    };
  }>;
  wallet_shares: Array<{
    shared_amount: number;
    shared_at: string;
  }>;
}

interface WalletData {
  balance: number;
  currency: string;
  total_shared: number;
  available: number;
}

interface Stats {
  totalOrganizations: number;
  totalShared: number;
  totalMembers: number;
}

interface WalletShare {
  id: string;
  shared_amount: number;
  shared_at: string;
  recipient: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface WalletHistory {
  shares: WalletShare[];
  totalShared: number;
  totalUsage: number;
}

export default function CompanyAdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalOrganizations: 0,
    totalShared: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showOrgManagement, setShowOrgManagement] = useState(false);
  const [showInviteOrgDialog, setShowInviteOrgDialog] = useState(false);
  const [showShareWalletDialog, setShowShareWalletDialog] = useState(false);
  const [showAdminsDialog, setShowAdminsDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const hasRedirected = useRef(false);
  const [showWalletDetailsDialog, setShowWalletDetailsDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [walletHistory, setWalletHistory] = useState<WalletHistory | null>(
    null,
  );
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [totalSharedToTeammates, setTotalSharedToTeammates] = useState(0);

  // Invite organization form
  const [ownerEmail, setOwnerEmail] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ email: string; full_name: string; organization_name: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Share wallet form
  const [shareAmount, setShareAmount] = useState("");
  const [shareNotes, setShareNotes] = useState<string>("");

  // Delete organization confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchCompanyAdminData();
    fetchTotalSharedToTeammates();
  }, []);

  // Real-time subscription to user type changes - redirect if no longer company admin
  useEffect(() => {
    if (!user?.id || hasRedirected.current) return;

    const setupUserTypeMonitor = async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      // Initial check
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (
        profile &&
        profile.user_type !== "company_admin" &&
        !hasRedirected.current
      ) {
        hasRedirected.current = true;
        toast.error("You no longer have company admin access");
        navigate("/dashboard");
        return;
      }

      // Real-time monitoring
      const channel = supabase
        .channel(`user-type-monitor-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (
              payload.new.user_type !== "company_admin" &&
              !hasRedirected.current
            ) {
              hasRedirected.current = true;
              toast.error("You no longer have company admin access");
              navigate("/dashboard");
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupUserTypeMonitor();
  }, [user?.id, navigate]);

  // Real-time wallet synchronization - ensures wallet stays in sync across all dashboards
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSync = async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      const channel = supabase
        .channel(`wallet-company-admin-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "wallets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log(
              "Wallet updated in real-time (Company Admin):",
              payload,
            );
            if (payload.new && "balance" in payload.new && wallet) {
              const newBalance = parseFloat(payload.new.balance);
              setWallet({
                ...wallet,
                balance: newBalance,
                available: wallet.total_shared
                  ? newBalance - wallet.total_shared
                  : newBalance,
              });
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSync();
  }, [user]);

  const fetchCompanyAdminData = async () => {
    try {
      setLoading(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const apiUrl = import.meta.env.VITE_API_URL;
      const authHeader = { Authorization: `Bearer ${await token}` };

      // Fetch all data in parallel for faster loading
      const [profileRes, walletRes, orgsRes, statsRes, adminsRes] =
        await Promise.all([
          fetch(`${apiUrl}/api/company-admin/profile`, { headers: authHeader }),
          fetch(`${apiUrl}/api/company-admin/wallet`, { headers: authHeader }),
          fetch(`${apiUrl}/api/company-admin/organizations`, {
            headers: authHeader,
          }),
          fetch(`${apiUrl}/api/company-admin/stats`, { headers: authHeader }),
          fetch(`${apiUrl}/api/company-admin/all-admins`, {
            headers: authHeader,
          }),
        ]);

      // Parse all responses in parallel
      const [profileData, walletData, orgsData, statsData, adminsData] =
        await Promise.all([
          profileRes.json(),
          walletRes.json(),
          orgsRes.json(),
          statsRes.json(),
          adminsRes.json(),
        ]);

      // Check profile first for authorization
      if (!profileData.success && profileRes.status === 403) {
        toast.error("Please register as a company admin first");
        navigate("/company-admin/register");
        return;
      }

      // Update state with all fetched data
      if (profileData.success) {
        setCompanyAdmin(profileData.companyAdmin);
      }
      if (walletData.success) {
        setWallet(walletData.wallet);
      }
      if (orgsData.success) {
        setOrganizations(orgsData.organizations);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (adminsData.success) {
        setAdmins(adminsData.admins);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const searchOrganizationOwners = async (email: string) => {
    if (!email || email.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/search-owners?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${await token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.owners || []);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching owners:", error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteOrganization = async () => {
    if (!ownerEmail) {
      toast.error("Please enter owner email");
      return;
    }

    try {
      setActionLoading(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/invite-organization`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await token}`,
          },
          body: JSON.stringify({
            ownerEmail,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Invitation sent successfully!");
        setShowInviteOrgDialog(false);
        setOwnerEmail("");
        setSearchResults([]);

        // Only fetch organizations, not full data reload
        const orgsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/company-admin/organizations`,
          {
            headers: { Authorization: `Bearer ${await token}` },
          },
        );
        const orgsData = await orgsRes.json();
        if (orgsData.success) {
          setOrganizations(orgsData.organizations);

          // Update stats
          const totalShared = orgsData.organizations.reduce(
            (sum: number, org: Organization) => sum + (org.shared_balance || 0),
            0,
          );
          const totalMembers = orgsData.organizations.reduce(
            (sum: number, org: Organization) =>
              sum + (org.organization_members?.length || 0),
            0,
          );
          setStats({
            totalOrganizations: orgsData.organizations.length,
            totalShared,
            totalMembers,
          });
        }
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShareWallet = async () => {
    if (!selectedOrg) return;

    try {
      setActionLoading(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/wallet/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await token}`,
          },
          body: JSON.stringify({
            organization_id: selectedOrg.id,
            amount: parseFloat(shareAmount),
            notes: shareNotes,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Wallet balance shared successfully!");
        setShowShareWalletDialog(false);
        setShareAmount("");
        setShareNotes("");
        setSelectedOrg(null);

        // Only fetch wallet and organizations, not full reload
        const [walletRes, orgsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/company-admin/wallet`, {
            headers: { Authorization: `Bearer ${await token}` },
          }),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/company-admin/organizations`,
            {
              headers: { Authorization: `Bearer ${await token}` },
            },
          ),
        ]);

        const [walletData, orgsData] = await Promise.all([
          walletRes.json(),
          orgsRes.json(),
        ]);

        if (walletData.success) {
          setWallet(walletData.wallet);
        }

        if (orgsData.success) {
          setOrganizations(orgsData.organizations);

          // Update stats
          const totalShared = orgsData.organizations.reduce(
            (sum: number, org: Organization) => sum + (org.shared_balance || 0),
            0,
          );
          const totalMembers = orgsData.organizations.reduce(
            (sum: number, org: Organization) =>
              sum + (org.organization_members?.length || 0),
            0,
          );
          setStats({
            totalOrganizations: orgsData.organizations.length,
            totalShared,
            totalMembers,
          });
        }
      } else {
        toast.error(data.error || "Failed to share wallet balance");
      }
    } catch (error) {
      console.error("Error sharing wallet:", error);
      toast.error("Failed to share wallet balance");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrganization = (orgId: string, orgName: string) => {
    setOrgToDelete({ id: orgId, name: orgName });
    setShowDeleteDialog(true);
  };

  const confirmDeleteOrganization = async () => {
    if (!orgToDelete) return;

    setShowDeleteDialog(false);
    try {
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/company-admin/organizations/${orgToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Organization deleted successfully!");
        fetchCompanyAdminData();
      } else {
        toast.error(data.error || "Failed to delete organization");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
    }
  };

  const openShareDialog = (org: Organization) => {
    setSelectedOrg(org);
    setShowShareWalletDialog(true);
  };

  const handleLeaveCompany = async () => {
    if (
      !confirm(
        "Are you sure you want to leave this company? If you are the admin, the oldest co-admin will be promoted to admin.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/leave-company`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "You have left the company");
        setShowAdminsDialog(false);
        // Reload user session to update user_type
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.refreshSession();
        // Redirect to dashboard after leaving
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload(); // Force reload to update authentication state
        }, 1500);
      } else {
        toast.error(data.error || "Failed to leave company");
      }
    } catch (error) {
      console.error("Error leaving company:", error);
      toast.error("Failed to leave company");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTotalSharedToTeammates = async () => {
    try {
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/wallet/history`,
        {
          headers: {
            Authorization: `Bearer ${await token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success && data.history) {
        setTotalSharedToTeammates(data.history.totalShared || 0);
      }
    } catch (error) {
      console.error("Error fetching total shared:", error);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const apiUrl = import.meta.env.VITE_API_URL;
      console.log(
        "Fetching wallet history from:",
        `${apiUrl}/api/company-admin/wallet/history`,
      );

      const response = await fetch(
        `${apiUrl}/api/company-admin/wallet/history`,
        {
          headers: {
            Authorization: `Bearer ${await token}`,
          },
        },
      );

      console.log("Wallet history response status:", response.status);
      const data = await response.json();
      console.log("Wallet history response:", data);
      if (data.success) {
        setWalletHistory(data.history);
        setTotalSharedToTeammates(data.history?.totalShared || 0);
        console.log("Wallet history set:", data.history);
      } else {
        console.error("Wallet history error:", data.error);
        toast.error(data.error || "Failed to load wallet history");
      }
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      toast.error("Failed to load wallet history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWalletClick = () => {
    setShowWalletDetailsDialog(true);
    fetchWalletHistory();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090c12]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Building2 className="w-16 h-16 text-cyan-300" />
          <div className="h-4 w-24 bg-[#1b2434] rounded" />
        </div>
      </div>
    );
  }

  const availableBalance =
    (wallet?.balance || 0) - (stats.totalShared || 0);
  const teamsWithMembers = organizations.filter(
    (org) => org.organization_members?.length > 0,
  ).length;
  const averageMembersPerTeam = stats.totalOrganizations
    ? (stats.totalMembers / stats.totalOrganizations).toFixed(1)
    : "0.0";
  const shareRate = wallet?.balance
    ? ((stats.totalShared / wallet.balance) * 100).toFixed(0)
    : "0";
  const improvementItems = [
    stats.totalOrganizations === 0
      ? "Create your first team to start organizing members."
      : null,
    stats.totalMembers === 0
      ? "Invite members to activate your teams."
      : null,
    teamsWithMembers < stats.totalOrganizations
      ? "Assign members to empty teams to balance distribution."
      : null,
    walletHistory?.shares?.length
      ? "Review sharing history and adjust limits if needed."
      : "Start sharing wallet balance to empower teams.",
    availableBalance < 10
      ? "Add funds to avoid low-balance interruptions."
      : "Keep a buffer for upcoming usage spikes.",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090c12] via-[#0d121a] to-[#0a0f16] text-zinc-100">
      {/* Header */}
      <div className="bg-[#101722]/95 border-b border-yellow-500/15 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-[0_8px_24px_rgba(232,178,74,0.35)]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">
                  {companyAdmin?.company_name || "Company Admin"}
                </h1>
                <p className="text-sm text-zinc-400">
                  {companyAdmin?.company_email || "Company Admin Portal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="gap-2 border-cyan-400/30 text-cyan-300 bg-[#182131] hover:bg-[#223049] hover:text-cyan-200"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/payments")}
                className="gap-2 border-emerald-400/30 text-emerald-300 bg-[#182131] hover:bg-[#223049] hover:text-emerald-200"
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysisDialog(true)}
                className="gap-2 border-yellow-500/25 text-yellow-200 bg-[#182131] hover:bg-[#223049]"
              >
                <Activity className="w-4 h-4" />
                Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2 border-red-400/30 text-red-300 bg-[#182131] hover:bg-red-500/15"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                Teams
              </CardTitle>
              <Building2 className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-100">
                {stats.totalOrganizations}
              </div>
              <p className="text-xs text-zinc-500">Active teams</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 hover:shadow-lg transition-shadow shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
            onClick={handleWalletClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                Available Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-emerald-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-300">
                $
                {((wallet?.balance || 0) - (stats.totalShared || 0)).toFixed(2)}
              </div>
              <p className="text-xs text-zinc-500">Click for details</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 hover:shadow-lg transition-shadow shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
            onClick={() => setShowAdminsDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                Company Admins
              </CardTitle>
              <Users className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-100">
                {admins.length}
              </div>
              <p className="text-xs text-zinc-500">Click to view all</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-100">
                {stats.totalMembers}
              </div>
              <p className="text-xs text-zinc-500">Across all teams</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Activity Chart */}
          <Card className="bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Activity className="w-5 h-5 text-cyan-300" />
                Wallet Activity
              </CardTitle>
              <p className="text-sm text-zinc-500">Monthly balance trend</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={[
                    {
                      month: "Jan",
                      balance: wallet?.balance ? wallet.balance * 0.6 : 0,
                    },
                    {
                      month: "Feb",
                      balance: wallet?.balance ? wallet.balance * 0.7 : 0,
                    },
                    {
                      month: "Mar",
                      balance: wallet?.balance ? wallet.balance * 0.8 : 0,
                    },
                    {
                      month: "Apr",
                      balance: wallet?.balance ? wallet.balance * 0.9 : 0,
                    },
                    {
                      month: "May",
                      balance: wallet?.balance ? wallet.balance * 0.95 : 0,
                    },
                    { month: "Jun", balance: wallet?.balance || 0 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis dataKey="month" tick={{ fill: "#a1a1aa" }} />
                  <YAxis tick={{ fill: "#a1a1aa" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#141b28",
                      border: "1px solid rgba(232,178,74,0.25)",
                      borderRadius: "12px",
                      color: "#e4e4e7",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#a1a1aa" }} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    name="Balance ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Distribution */}
          <Card className="bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                Team Distribution
              </CardTitle>
              <p className="text-sm text-zinc-500">Members across teams</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={organizations.slice(0, 5).map((org) => ({
                      name: org.name,
                      value: org.organization_members?.length || 0,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {organizations.slice(0, 5).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#141b28",
                      border: "1px solid rgba(232,178,74,0.25)",
                      borderRadius: "12px",
                      color: "#e4e4e7",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Teams Section */}
        <Card className="bg-gradient-to-br from-[#101722] to-[#0e1624] border-yellow-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-300" />
                  Teams
                </CardTitle>
                <p className="text-sm text-zinc-500 mt-1">
                  Manage teams under your company
                </p>
              </div>
              <Button
                onClick={() => setShowCreateOrgModal(true)}
                className="gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#101722] shadow-[0_8px_24px_rgba(232,178,74,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No teams yet</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Create a team or invite an existing team to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className="relative overflow-hidden border-yellow-500/15 bg-gradient-to-br from-[#182131] via-[#162236] to-[#141d2d] hover:border-cyan-400/30 hover:shadow-[0_14px_32px_rgba(10,18,32,0.45)] transition-all duration-300"
                  >
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-zinc-100 tracking-wide">
                            {org.name}
                          </CardTitle>
                          {org.description && (
                            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                              {org.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className="border-yellow-500/25 bg-yellow-500/10 text-zinc-100 rounded-full px-3"
                          >
                            {org.organization_members?.length || 0} members
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {org.organization_members &&
                        org.organization_members.length > 0 && (
                          <div className="text-sm rounded-xl p-3.5 bg-[#101722]/75 border border-yellow-500/12">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-2">
                              Team Owner
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-[0_8px_20px_rgba(34,211,238,0.25)]">
                                {(
                                  org.organization_members[0]?.profiles
                                    ?.full_name ||
                                  org.organization_members[0]?.profiles
                                    ?.email ||
                                  "O"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-100 truncate">
                                  {org.organization_members[0]?.profiles
                                    ?.full_name || "Team owner"}
                                </p>
                                <p className="text-zinc-500 text-xs truncate">
                                  {org.organization_members[0]?.profiles?.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-[44px_1fr_1fr] gap-2.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-11 p-0 border-yellow-500/30 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/20"
                          onClick={() => openShareDialog(org)}
                          title="Share wallet"
                        >
                          <Wallet className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowOrgManagement(true);
                          }}
                        >
                          <Users className="w-4 h-4" />
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-300 border-red-400/30 bg-red-500/10 hover:bg-red-500/20 w-full gap-2"
                          onClick={() =>
                            handleDeleteOrganization(org.id, org.name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Organization Dialog */}
      <Dialog
        open={showInviteOrgDialog}
        onOpenChange={(open) => {
          setShowInviteOrgDialog(open);
          if (!open) {
            setOwnerEmail("");
            setSearchResults([]);
            setShowResults(false);
          }
        }}
      >
        <DialogContent className="bg-[#141a24] border-yellow-500/20 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Invite Team</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Search and invite a team owner to join your company
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 relative">
              <Label htmlFor="ownerEmail" className="text-zinc-300">
                Team Owner Email
              </Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="Type to search owner email..."
                value={ownerEmail}
                onChange={(e) => {
                  setOwnerEmail(e.target.value);
                  searchOrganizationOwners(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="bg-[#182131] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
              />

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[#182131] border border-yellow-500/20 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((owner, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-[#223049] cursor-pointer border-b border-yellow-500/10 last:border-b-0"
                      onClick={() => {
                        setOwnerEmail(owner.email);
                        setShowResults(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-100">
                            {owner.full_name}
                          </p>
                          <p className="text-xs text-zinc-500">{owner.email}</p>
                        </div>
                        <div className="ml-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-cyan-400/20 text-cyan-200"
                          >
                            {owner.organization_name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showResults &&
                searchResults.length === 0 &&
                !isSearching &&
                ownerEmail.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#182131] border border-yellow-500/20 rounded-md shadow-lg p-4">
                    <p className="text-sm text-zinc-500 text-center">
                      No organization owners found
                    </p>
                  </div>
                )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-[#182131] border border-yellow-500/20 rounded-md shadow-lg p-4">
                  <p className="text-sm text-zinc-500 text-center">
                    Searching...
                  </p>
                </div>
              )}

              <p className="text-xs text-zinc-500">
                Start typing to search for organization owners. Once invited,
                their organization and members will appear here.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]"
              onClick={() => {
                setShowInviteOrgDialog(false);
                setOwnerEmail("");
                setSearchResults([]);
                setShowResults(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteOrganization}
              disabled={!ownerEmail || actionLoading}
              className="bg-cyan-500 hover:bg-cyan-400 text-[#0b1220]"
            >
              {actionLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Wallet Dialog */}
      <Dialog
        open={showShareWalletDialog}
        onOpenChange={setShowShareWalletDialog}
      >
        <DialogContent className="bg-[#141a24] border-yellow-500/20 text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-300" />
              Share Wallet Balance
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Share balance with {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-[#182131] border border-cyan-400/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Available Balance:</span>
                <span className="font-semibold text-cyan-300">
                  ${wallet?.available.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Current Shared:</span>
                <span className="font-semibold text-zinc-200">
                  ${selectedOrg?.shared_balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareAmount" className="text-zinc-300">
                Amount to Share
              </Label>
              <Input
                id="shareAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                className="bg-[#182131] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareNotes" className="text-zinc-300">
                Notes (Optional)
              </Label>
              <Textarea
                id="shareNotes"
                placeholder="Add notes about this transaction..."
                value={shareNotes}
                onChange={(e) => setShareNotes(e.target.value)}
                className="bg-[#182131] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]"
              onClick={() => {
                setShowShareWalletDialog(false);
                setSelectedOrg(null);
                setShareAmount("");
                setShareNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareWallet}
              disabled={
                !shareAmount || parseFloat(shareAmount) <= 0 || actionLoading
              }
              className="bg-yellow-500 hover:bg-yellow-400 text-[#101722]"
            >
              {actionLoading ? "Sharing..." : "Share Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Admins Dialog */}
      <Dialog open={showAdminsDialog} onOpenChange={setShowAdminsDialog}>
        <DialogContent className="sm:max-w-[500px] bg-[#141a24] border-yellow-500/20 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-300" />
              Company Admins
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              All administrators who can manage this company
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-[#182131] rounded-lg border border-yellow-500/15"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {admin.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">
                      {admin.full_name}
                    </p>
                    <p className="text-sm text-zinc-400">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={admin.role === "Admin" ? "default" : "secondary"}
                    className={
                      admin.role === "Admin"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                        : "bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    }
                  >
                    {admin.role}
                  </Badge>
                  {admin.email === user?.email && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLeaveCompany}
                      disabled={actionLoading}
                      className="gap-1"
                    >
                      <UserMinus className="w-3 h-3" />
                      Leave
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAdminsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Team Modal */}
      <CreateTeamModal
        open={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
        onSuccess={() => {
          fetchCompanyAdminData();
          setShowCreateOrgModal(false);
        }}
      />

      {/* Team Management Modal */}
      {selectedOrg && (
        <OrganizationManagement
          open={showOrgManagement}
          onClose={() => {
            setShowOrgManagement(false);
            setSelectedOrg(null);
          }}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          currentBalance={wallet?.balance || 0}
          onBalanceUpdate={fetchCompanyAdminData}
        />
      )}

      {/* Delete Organization Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-[#141a24] border-yellow-500/20 text-zinc-100">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <AlertDialogTitle className="text-zinc-100">
                  Delete Team
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-zinc-400 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="bg-red-500/10 border border-red-400/25 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-sm">
                  <p className="font-medium text-red-200 mb-1">
                    Are you sure you want to delete "{orgToDelete?.name}"?
                  </p>
                  <p className="text-red-300">
                    All team data and member associations will be permanently
                    removed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrganization}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wallet Details Dialog */}
      <Dialog
        open={showWalletDetailsDialog}
        onOpenChange={setShowWalletDetailsDialog}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-[#141a24] border-yellow-500/20 text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <Wallet className="w-5 h-5 text-emerald-300" />
              Wallet Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              View your wallet shared amounts and usage history
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Shared to Teammates */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-300" />
                Shared to Teammates
              </h3>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Loading history...</p>
                </div>
              ) : walletHistory?.shares && walletHistory.shares.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {walletHistory.shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-4 bg-[#182131] rounded-lg border border-yellow-500/15"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {share.recipient?.full_name?.charAt(0) ||
                            share.recipient?.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100">
                            {share.recipient?.full_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {share.recipient?.email || "No email"}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(share.shared_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-300">
                          ${share.shared_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#182131] rounded-lg border border-yellow-500/15">
                  <Share2 className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500">No sharing history yet</p>
                </div>
              )}
            </div>

            {/* Usage Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                Usage Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#182131] rounded-lg border border-fuchsia-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Teams Created</p>
                      <p className="text-2xl font-bold text-fuchsia-300 mt-1">
                        {stats.totalOrganizations}
                      </p>
                    </div>
                    <Building2 className="w-10 h-10 text-fuchsia-300" />
                  </div>
                </div>

                <div className="p-4 bg-[#182131] rounded-lg border border-emerald-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Total Members</p>
                      <p className="text-2xl font-bold text-emerald-300 mt-1">
                        {stats.totalMembers}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-emerald-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowWalletDetailsDialog(false)}
              variant="outline"
              className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="sm:max-w-[760px] max-h-[80vh] overflow-y-auto bg-[#141a24] border-yellow-500/20 text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <Activity className="w-5 h-5 text-yellow-300" />
              Analysis
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Purpose: summarize company health, wallet usage, and team activity
              so you can make clear improvements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Company overview</p>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Health snapshot
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-200 border border-yellow-500/20">
                Live summary
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-yellow-500/15 bg-gradient-to-br from-[#182131] to-[#151c2a]">
                <p className="text-sm text-zinc-400">Teams</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">
                  {stats.totalOrganizations}
                </p>
                <p className="text-xs text-zinc-500">
                  {teamsWithMembers} with members
                </p>
              </div>
              <div className="p-4 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-[#182131] to-[#141d2a]">
                <p className="text-sm text-zinc-400">Members</p>
                <p className="text-2xl font-bold text-cyan-300 mt-1">
                  {stats.totalMembers}
                </p>
                <p className="text-xs text-zinc-500">
                  Avg {averageMembersPerTeam} per team
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-400/20 bg-gradient-to-br from-[#182131] to-[#121c28]">
                <p className="text-sm text-zinc-400">Admins</p>
                <p className="text-2xl font-bold text-emerald-300 mt-1">
                  {admins.length}
                </p>
                <p className="text-xs text-zinc-500">Active company admins</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-400/20 bg-gradient-to-br from-[#182131] to-[#121a26]">
                <p className="text-sm text-zinc-400">Share Rate</p>
                <p className="text-2xl font-bold text-blue-300 mt-1">
                  {shareRate}%
                </p>
                <p className="text-xs text-zinc-500">Of wallet shared</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-gradient-to-br from-[#182131] to-[#171f2c]">
                <p className="text-sm text-zinc-400">Available</p>
                <p className="text-2xl font-bold text-yellow-300 mt-1">
                  ${availableBalance.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">Balance after sharing</p>
              </div>
              <div className="p-4 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-[#182131] to-[#13202c]">
                <p className="text-sm text-zinc-400">Shared Total</p>
                <p className="text-2xl font-bold text-cyan-300 mt-1">
                  ${stats.totalShared.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">Total allocated</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-400/20 bg-gradient-to-br from-[#182131] to-[#121a26]">
                <p className="text-sm text-zinc-400">Usage Total</p>
                <p className="text-2xl font-bold text-blue-300 mt-1">
                  ${walletHistory?.totalUsage?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-zinc-500">Overall wallet usage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-fuchsia-400/20 bg-gradient-to-br from-[#182131] to-[#181a2a]">
                <p className="text-sm text-zinc-400">Shared to Teammates</p>
                <p className="text-2xl font-bold text-fuchsia-300 mt-1">
                  ${totalSharedToTeammates.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">From wallet history</p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-400/20 bg-gradient-to-br from-[#182131] to-[#121c28]">
                <p className="text-sm text-zinc-400">Company Signal</p>
                <p className="text-2xl font-bold text-emerald-300 mt-1">
                  {stats.totalMembers > 0 ? "Active" : "Starting"}
                </p>
                <p className="text-xs text-zinc-500">
                  {stats.totalMembers > 0
                    ? "Teams are ready for growth"
                    : "Invite members to unlock momentum"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">
                  Improvements
                </h3>
                <span className="text-xs text-zinc-500">
                  {improvementItems.length} suggestions
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {improvementItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="p-3 bg-[#182131] rounded-lg border border-yellow-500/15 text-sm text-zinc-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAnalysisDialog(false)}
              variant="outline"
              className="border-yellow-500/20 bg-[#182131] text-zinc-200 hover:bg-[#223049]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
