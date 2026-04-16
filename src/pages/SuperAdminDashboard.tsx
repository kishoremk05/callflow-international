import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { OrganizationManagement } from "@/components/dashboard/OrganizationManagement";
import BrandLogo from "@/components/branding/BrandLogo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  Mail,
  DollarSign,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Wallet,
  Globe,
  Phone,
  Bell,
  Trash2,
} from "lucide-react";
import "./super-admin-dashboard.css";

interface CompanyAdmin {
  company_name: string;
  company_email: string;
  wallet_balance: number;
  available_balance: number;
  organizations_count: number;
  admins_count: number;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  company_admin_name: string;
  shared_balance: number;
  members_count: number;
  created_at: string;
}

interface NormalUser {
  id: string;
  email: string;
  full_name: string;
  wallet_balance: number;
  created_at: string;
  country?: string;
}

interface Stats {
  total_company_admins: number;
  total_organizations: number;
  total_normal_users: number;
  twilio_balance: string;
}

interface AdminAccessRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_id: string | null;
  request_type: "create_new" | "join_existing";
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  // For join_existing requests
  existing_company_name?: string;
  existing_company_email?: string;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [normalUsers, setNormalUsers] = useState<NormalUser[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AdminAccessRequest | null>(null);
  const [showCompanyAdminsDialog, setShowCompanyAdminsDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyAdmin | null>(
    null,
  );
  const [companyAdminsList, setCompanyAdminsList] = useState<
    Array<{
      id: string;
      email: string;
      full_name: string;
      role: string;
      joined_at: string;
    }>
  >([]);
  const [loadingCompanyAdmins, setLoadingCompanyAdmins] = useState(false);
  const [showDeleteCompanyDialog, setShowDeleteCompanyDialog] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [removingAdminId, setRemovingAdminId] = useState<string | null>(null);
  const [showCompanyTeamsDialog, setShowCompanyTeamsDialog] = useState(false);
  const [selectedCompanyForTeams, setSelectedCompanyForTeams] =
    useState<CompanyAdmin | null>(null);
  const [companyTeams, setCompanyTeams] = useState<Organization[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const usersPerPage = 5;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("super_admin_token");

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [statsRes, adminsRes, orgsRes, usersRes, requestsRes] =
        await Promise.all([
          fetch(`${apiUrl}/api/super-admin/stats`, { headers }),
          fetch(`${apiUrl}/api/super-admin/company-admins`, { headers }),
          fetch(`${apiUrl}/api/super-admin/organizations`, { headers }),
          fetch(`${apiUrl}/api/super-admin/users`, { headers }),
          fetch(`${apiUrl}/api/super-admin/admin-access-requests`, { headers }),
        ]);

      const [statsData, adminsData, orgsData, usersData, requestsData] =
        await Promise.all([
          statsRes.json(),
          adminsRes.json(),
          orgsRes.json(),
          usersRes.json(),
          requestsRes.json(),
        ]);

      if (statsData.success) setStats(statsData.stats);
      if (adminsData.success) setCompanyAdmins(adminsData.companyAdmins);
      if (orgsData.success) setOrganizations(orgsData.organizations);
      if (usersData.success) setNormalUsers(usersData.users);
      if (requestsData.success) setAdminRequests(requestsData.requests);

      // Check for auth errors
      if (!statsData.success && statsRes.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/super-admin/login");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("super_admin_token");
    navigate("/super-admin/login");
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/approve-admin-request/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Approved",
          description: "The user has been granted company admin access",
        });
        fetchDashboardData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setProcessingRequest(selectedRequest.id);
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/reject-admin-request/${selectedRequest.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Rejected",
          description: "The admin access request has been rejected",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedRequest(null);
        fetchDashboardData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const populateCountries = async () => {
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      // First detect country from browser using ipapi.co (works with HTTPS)
      let detectedCountry = "India"; // Default fallback
      try {
        const geoResponse = await fetch("https://ipapi.co/json/");
        const geoData = await geoResponse.json();
        detectedCountry = geoData.country_name || "India";
        console.log("Detected country from browser:", detectedCountry);
      } catch (err) {
        console.log(
          "Could not detect country from browser, using default:",
          err,
        );
      }

      const response = await fetch(
        `${apiUrl}/api/super-admin/populate-countries`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country: detectedCountry }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Countries updated to: ${detectedCountry}`,
        });
        // Refresh dashboard to show updated countries
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update countries",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error populating countries:", error);
      toast({
        title: "Error",
        description: "Failed to populate countries",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    setDeletingCompany(true);
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/company/${encodeURIComponent(selectedCompany.company_name)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Company "${selectedCompany.company_name}" has been deleted`,
        });
        setShowDeleteCompanyDialog(false);
        setShowCompanyAdminsDialog(false);
        setSelectedCompany(null);
        fetchDashboardData();
      } else {
        throw new Error(data.error || "Failed to delete company");
      }
    } catch (error: any) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    } finally {
      setDeletingCompany(false);
    }
  };

  const fetchCompanyTeams = async (companyName: string) => {
    try {
      setLoadingTeams(true);
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/company/${encodeURIComponent(companyName)}/teams`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setCompanyTeams(data.teams || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load teams",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching company teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchCompanyAdmins = async (companyName: string) => {
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/api/super-admin/company/${companyName}/admins`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setCompanyAdminsList(data.admins);
      }
    } catch (error) {
      console.error("Error fetching company admins:", error);
    } finally {
      setLoadingCompanyAdmins(false);
    }
  };

  const handleRemoveAdmin = async (
    adminId: string,
    adminName: string,
    adminRole: string,
  ) => {
    if (companyAdminsList.length === 1) {
      toast({
        title: "Cannot Remove",
        description:
          "Cannot remove the only admin. Delete the company instead.",
        variant: "destructive",
      });
      return;
    }

    const confirmMessage =
      adminRole === "Admin"
        ? `Remove ${adminName} as admin? A co-admin will be promoted to admin.`
        : `Remove ${adminName} as co-admin?`;

    if (!confirm(confirmMessage)) return;

    setRemovingAdminId(adminId);
    try {
      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/company/${encodeURIComponent(selectedCompany?.company_name || "")}/admin/${adminId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Refresh the admins list
        if (selectedCompany) {
          setLoadingCompanyAdmins(true);
          await fetchCompanyAdmins(selectedCompany.company_name);
        }
        // Refresh dashboard to update counts
        fetchDashboardData();
      } else {
        throw new Error(data.error || "Failed to remove admin");
      }
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    } finally {
      setRemovingAdminId(null);
    }
  };

  const openCompanyTeamsDialog = async (company: CompanyAdmin) => {
    setSelectedCompanyForTeams(company);
    setShowCompanyTeamsDialog(true);
    await fetchCompanyTeams(company.company_name);
  };

  // Filter users based on search query
  const filteredUsers = normalUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="super-admin-dashboard flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BrandLogo
              iconClassName="text-yellow-400 h-9 w-9"
              showText={false}
            />
            <div>
              <h1 className="font-display text-4xl tracking-tight text-zinc-100 uppercase leading-none">
                Super Admin Dashboard
              </h1>
              <p className="text-zinc-400">System Overview & Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={populateCountries}
              variant="outline"
              size="sm"
              className="border-yellow-500/25 bg-[#121826] text-zinc-100 hover:bg-[#1a2235]"
            >
              <Globe className="w-4 h-4 mr-2" />
              Detect Countries
            </Button>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="sm"
              className="border-yellow-500/25 bg-[#121826] text-zinc-100 hover:bg-[#1a2235]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-yellow-500/25 bg-[#121826] text-zinc-100 hover:bg-[#1a2235]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Company Admins
                </CardDescription>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-5xl font-extrabold text-gray-900">
                {stats?.total_company_admins || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Teams
                </CardDescription>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-5xl font-extrabold text-gray-900">
                {stats?.total_organizations || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Normal Users
                </CardDescription>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-5xl font-extrabold text-gray-900">
                {stats?.total_normal_users || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Twilio Balance
                </CardDescription>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-5xl font-extrabold text-gray-900">
                $
                {stats?.twilio_balance
                  ? parseFloat(stats.twilio_balance).toFixed(2)
                  : "0.00"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Admin Access Requests */}
        {adminRequests.filter((r) => r.status === "pending").length > 0 && (
          <Card className="mb-8 shadow-md border-orange-200 bg-orange-50/50">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-orange-900">
                  Pending Admin Access Requests
                  <Badge className="ml-2 bg-orange-500">
                    {adminRequests.filter((r) => r.status === "pending").length}
                  </Badge>
                </CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                Review and approve/reject company admin access requests
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {adminRequests
                  .filter((r) => r.status === "pending")
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-white border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {request.request_type === "join_existing"
                                  ? request.existing_company_name ||
                                    "Unknown Company"
                                  : request.company_name}
                              </h3>
                              <Badge
                                className={
                                  request.request_type === "join_existing"
                                    ? "bg-blue-500"
                                    : "bg-purple-500"
                                }
                              >
                                {request.request_type === "join_existing"
                                  ? "Join Request"
                                  : "New Company"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {request.full_name || request.email}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {request.request_type === "join_existing"
                              ? request.existing_company_email || request.email
                              : request.company_email}
                          </div>
                          {request.company_phone &&
                            request.request_type === "create_new" && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {request.company_phone}
                              </div>
                            )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Requested:{" "}
                            {new Date(
                              request.requested_at,
                            ).toLocaleDateString()}
                          </div>
                          {request.request_type === "join_existing" && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                              <strong>Request Type:</strong> User wants to
                              become co-admin of this existing company
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingRequest === request.id
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                          disabled={processingRequest === request.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Admins Cards */}
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle>Company Admins</CardTitle>
            </div>
            <CardDescription>
              All registered companies - click card to view details and teams
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {companyAdmins.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No company admins found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyAdmins.map((admin, index) => (
                  <Card
                    key={`${admin.company_name}-${index}`}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => openCompanyTeamsDialog(admin)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {admin.company_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {admin.company_name}
                            </CardTitle>
                            <p className="text-xs text-gray-500">
                              {admin.company_email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompany(admin);
                            setShowCompanyAdminsDialog(true);
                            setLoadingCompanyAdmins(true);
                            fetchCompanyAdmins(admin.company_name);
                          }}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Admins:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {admin.admins_count}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Available Balance:
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          ${(admin.available_balance || 0).toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Teams:</span>
                        <Badge variant="secondary">
                          {admin.organizations_count}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Normal Users Table */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <CardTitle>Normal Users</CardTitle>
            </div>
            <CardDescription>
              All registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-10 h-11 border-2 focus:border-orange-300 transition-colors"
                />
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Full Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">
                      Wallet Balance
                    </TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <TableCell className="font-medium">
                        {user.full_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {user.country || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Wallet className="w-3 h-3 mr-1" />$
                          {user.wallet_balance.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-8"
                      >
                        {searchQuery
                          ? "No users found matching your search"
                          : "No normal users found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
                  {searchQuery &&
                    ` (filtered from ${normalUsers.length} total)`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="super-pagination-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-10 super-pagination-btn"
                          data-active={
                            currentPage === pageNum ? "true" : "false"
                          }
                        >
                          {pageNum}
                        </Button>
                      ),
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="super-pagination-btn"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Members Modal */}
      {selectedOrg && (
        <OrganizationManagement
          open={!!selectedOrg}
          onClose={() => setSelectedOrg(null)}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          hideInviteSection={true}
          hideShareButton={true}
          superAdminToken={
            localStorage.getItem("super_admin_token") || undefined
          }
        />
      )}

      {/* Reject Request Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-700">
              Reject Admin Access Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request from{" "}
              <strong>{selectedRequest?.company_name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Company:</strong> {selectedRequest?.company_name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedRequest?.company_email}
                </div>
                <div>
                  <strong>User:</strong>{" "}
                  {selectedRequest?.full_name || selectedRequest?.email}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection_reason" className="text-sm font-medium">
                Rejection Reason (Optional)
              </Label>
              <Textarea
                id="rejection_reason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This reason will be visible to the user
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedRequest(null);
              }}
              disabled={processingRequest !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={processingRequest !== null}
            >
              {processingRequest ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Admins Dialog */}
      <Dialog
        open={showCompanyAdminsDialog}
        onOpenChange={setShowCompanyAdminsDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {selectedCompany?.company_name} - Admins
            </DialogTitle>
            <DialogDescription>
              All administrators who can manage this company
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingCompanyAdmins ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading admins...</p>
              </div>
            ) : companyAdminsList.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No admins found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyAdminsList.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {admin.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {admin.full_name}
                        </p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          admin.role === "Admin" ? "default" : "secondary"
                        }
                        className={
                          admin.role === "Admin"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }
                      >
                        {admin.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveAdmin(
                            admin.id,
                            admin.full_name,
                            admin.role,
                          )
                        }
                        disabled={removingAdminId === admin.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {removingAdminId === admin.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteCompanyDialog(true)}
            >
              Delete Company
            </Button>
            <Button onClick={() => setShowCompanyAdminsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Confirmation Dialog */}
      <Dialog
        open={showDeleteCompanyDialog}
        onOpenChange={setShowDeleteCompanyDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Delete Company
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Company:</strong> {selectedCompany?.company_name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedCompany?.company_email}
                </div>
                <div>
                  <strong>Teams:</strong> {selectedCompany?.organizations_count}
                </div>
                <div>
                  <strong>Admins:</strong> {selectedCompany?.admins_count}
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Warning:</strong> Deleting this company will also
                delete all associated teams, admin accounts, and data.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteCompanyDialog(false)}
              disabled={deletingCompany}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deletingCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingCompany ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Teams Dialog */}
      <Dialog
        open={showCompanyTeamsDialog}
        onOpenChange={setShowCompanyTeamsDialog}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {selectedCompanyForTeams?.company_name} - Company Details
            </DialogTitle>
            <DialogDescription>
              View company information and all associated teams
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  if (selectedCompanyForTeams) {
                    setSelectedCompany(selectedCompanyForTeams);
                    setShowCompanyAdminsDialog(true);
                    setLoadingCompanyAdmins(true);
                    fetchCompanyAdmins(selectedCompanyForTeams.company_name);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    Admins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCompanyForTeams?.admins_count || 0}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Click to view</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    $
                    {selectedCompanyForTeams?.available_balance?.toFixed(2) ||
                      "0.00"}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    Total Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedCompanyForTeams?.organizations_count || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-amber-700 break-all">
                    {selectedCompanyForTeams?.company_email || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teams List */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Teams
              </h3>
              {loadingTeams ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading teams...</p>
                </div>
              ) : companyTeams.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {companyTeams.map((team) => (
                    <Card
                      key={team.id}
                      className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedOrg(team)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {team.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {team.members_count} members
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(team.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No teams found</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowCompanyTeamsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
