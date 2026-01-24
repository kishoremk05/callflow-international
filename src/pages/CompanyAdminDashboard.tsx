import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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

  // Invite organization form
  const [ownerEmail, setOwnerEmail] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ email: string; full_name: string; organization_name: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Share wallet form
  const [shareAmount, setShareAmount] = useState("");
  const [shareNotes, setShareNotes] = useState("");

  useEffect(() => {
    fetchCompanyAdminData();
  }, []);

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

  const handleDeleteOrganization = async (orgId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/company-admin/organizations/${orgId}`,
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
        // Redirect to dashboard after leaving
        setTimeout(() => {
          navigate("/dashboard");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Building2 className="w-16 h-16 text-blue-500" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {companyAdmin?.company_name || "Company Admin"}
                </h1>
                <p className="text-sm text-gray-500">
                  {companyAdmin?.company_email || "Company Admin Portal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/payments")}
                className="gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700"
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCompanyAdminData}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${wallet?.available.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrganizations}
              </div>
              <p className="text-xs text-muted-foreground">Active teams</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowAdminsDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Company Admins
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
              <p className="text-xs text-muted-foreground">Click to view all</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Across all teams</p>
            </CardContent>
          </Card>
        </div>

        {/* Teams Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Teams</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage teams under your company
                </p>
              </div>
              <Button
                onClick={() => setShowCreateOrgModal(true)}
                className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No teams yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create a team or invite an existing team to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map((org) => (
                  <Card key={org.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          {org.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {org.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {org.organization_members?.length || 0} members
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                              setSelectedOrg(org);
                              setShowOrgManagement(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Owner Wallet:</span>
                        <span className="font-semibold text-blue-600">
                          ${org.owner_wallet_balance?.toFixed(2) || "0.00"}
                        </span>
                      </div>

                      {org.organization_members &&
                        org.organization_members.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Owner:</span>
                            <p className="font-medium">
                              {org.organization_members[0]?.profiles?.full_name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {org.organization_members[0]?.profiles?.email}
                            </p>
                          </div>
                        )}

                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 w-full gap-2"
                          onClick={() => handleDeleteOrganization(org.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team</DialogTitle>
            <DialogDescription>
              Search and invite a team owner to join your company
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 relative">
              <Label htmlFor="ownerEmail">Team Owner Email</Label>
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
              />

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((owner, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setOwnerEmail(owner.email);
                        setShowResults(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {owner.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{owner.email}</p>
                        </div>
                        <div className="ml-2">
                          <Badge variant="secondary" className="text-xs">
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
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                    <p className="text-sm text-gray-500 text-center">
                      No organization owners found
                    </p>
                  </div>
                )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">
                    Searching...
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Start typing to search for organization owners. Once invited,
                their organization and members will appear here.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Wallet Balance</DialogTitle>
            <DialogDescription>
              Share balance with {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Balance:</span>
                <span className="font-semibold">
                  ${wallet?.available.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Shared:</span>
                <span className="font-semibold">
                  ${selectedOrg?.shared_balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareAmount">Amount to Share</Label>
              <Input
                id="shareAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareNotes">Notes (Optional)</Label>
              <Textarea
                id="shareNotes"
                placeholder="Add notes about this transaction..."
                value={shareNotes}
                onChange={(e) => setShareNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
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
            >
              {actionLoading ? "Sharing..." : "Share Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Admins Dialog */}
      <Dialog open={showAdminsDialog} onOpenChange={setShowAdminsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Company Admins
            </DialogTitle>
            <DialogDescription>
              All administrators who can manage this company
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {admins.map((admin) => (
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
                    variant={admin.role === "Admin" ? "default" : "secondary"}
                    className={
                      admin.role === "Admin"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-gradient-to-r from-purple-500 to-pink-500"
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
    </div>
  );
}
