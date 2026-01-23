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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

interface CompanyAdmin {
  id: string;
  company_name: string;
  email: string;
  wallet_balance: number;
  organizations_count: number;
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
}

interface Stats {
  total_company_admins: number;
  total_organizations: number;
  total_normal_users: number;
  twilio_balance: string;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [normalUsers, setNormalUsers] = useState<NormalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<
    Array<{ email: string; name: string }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
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
      const [statsRes, adminsRes, orgsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/api/super-admin/stats`, { headers }),
        fetch(`${apiUrl}/api/super-admin/company-admins`, { headers }),
        fetch(`${apiUrl}/api/super-admin/organizations`, { headers }),
        fetch(`${apiUrl}/api/super-admin/users`, { headers }),
      ]);

      const [statsData, adminsData, orgsData, usersData] = await Promise.all([
        statsRes.json(),
        adminsRes.json(),
        orgsRes.json(),
        usersRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (adminsData.success) setCompanyAdmins(adminsData.companyAdmins);
      if (orgsData.success) setOrganizations(orgsData.organizations);
      if (usersData.success) setNormalUsers(usersData.users);

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

        {/* Company Admins Table */}
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle>Company Admins</CardTitle>
            </div>
            <CardDescription>
              All registered company administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">
                      Company Name
                    </TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">
                      Wallet Balance
                    </TableHead>
                    <TableHead className="font-semibold">
                      Organizations
                    </TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyAdmins.map((admin, index) => (
                    <TableRow
                      key={admin.id}
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {admin.company_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          ${admin.wallet_balance.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {admin.organizations_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(admin.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {companyAdmins.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-8"
                      >
                        No company admins found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              <CardTitle>Organizations</CardTitle>
            </div>
            <CardDescription>
              All organizations across all company admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">
                      Organization Name
                    </TableHead>
                    <TableHead className="font-semibold">
                      Company Admin
                    </TableHead>
                    <TableHead className="font-semibold">
                      Shared Balance
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
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Full Name</TableHead>
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
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.full_name || "N/A"}
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
                        colSpan={4}
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
    </div>
  );
};

export default SuperAdminDashboard;
