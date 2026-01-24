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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Building2,
  Users,
  Mail,
  DollarSign,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Wallet,
  Globe,
  Phone,
  Bell,
} from "lucide-react";

interface CompanyAdmin {
  company_name: string;
  company_email: string;
  wallet_balance: number;
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
  const [orgMembers, setOrgMembers] = useState<
    Array<{ email: string; name: string }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
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

  const fetchOrgMembers = async (org: Organization) => {
    try {
      setLoadingMembers(true);
      setSelectedOrg(org);

      const token = localStorage.getItem("super_admin_token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/super-admin/organizations/${org.id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setOrgMembers(data.members);
      }
    } catch (error) {
      console.error("Error fetching organization members:", error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">System Overview & Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={populateCountries} variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Detect Countries
            </Button>
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
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
                  Organizations
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
              All registered companies - click to view admins
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
                    onClick={async () => {
                      setSelectedCompany(admin);
                      setShowCompanyAdminsDialog(true);
                      setLoadingCompanyAdmins(true);
                      try {
                        const token = localStorage.getItem("super_admin_token");
                        const apiUrl = import.meta.env.VITE_API_URL;
                        const response = await fetch(
                          `${apiUrl}/api/super-admin/company/${admin.company_name}/admins`,
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
                    }}
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
                        <span className="text-gray-600">Wallet:</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          ${admin.wallet_balance.toFixed(2)}
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

        {/* Teams Table */}
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              <CardTitle>Teams</CardTitle>
            </div>
            <CardDescription>
              All teams across all company admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Team Name</TableHead>
                    <TableHead className="font-semibold">
                      Company Admin
                    </TableHead>
                    <TableHead className="font-semibold">
                      Wallet Balance
                    </TableHead>
                    <TableHead className="font-semibold">Members</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org, index) => (
                    <TableRow
                      key={org.id}
                      className={`hover:bg-green-50 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      onClick={() => fetchOrgMembers(org)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-600" />
                          {org.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {org.company_admin_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          ${org.shared_balance.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {org.members_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(org.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {organizations.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-8"
                      >
                        No organizations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                          className="w-10"
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

      {/* Organization Members Dialog */}
      <Dialog
        open={!!selectedOrg}
        onOpenChange={(open) => !open && setSelectedOrg(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              {selectedOrg?.name} - Members
            </DialogTitle>
            <DialogDescription>
              Email addresses of all members in this organization
            </DialogDescription>
          </DialogHeader>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="mt-4">
              {orgMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No members found in this organization</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {orgMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Member
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Total Members: <strong>{orgMembers.length}</strong>
                  </span>
                  <span>
                    Organization: <strong>{selectedOrg?.name}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    <Badge
                      variant={admin.role === "Admin" ? "default" : "secondary"}
                      className={
                        admin.role === "Admin"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }
                    >
                      {admin.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCompanyAdminsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
