import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  Mail,
  Users,
  Loader2,
  UserCheck,
  ArrowRightLeft,
  UserMinus,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareCreditModal } from "./ShareCreditModal";

interface OrganizationManagementProps {
  open: boolean;
  onClose: () => void;
  organizationId: string | null;
  organizationName: string | null;
  currentBalance?: number;
  onBalanceUpdate?: () => void;
  hideInviteSection?: boolean;
  hideShareButton?: boolean;
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
  wallet_balance: number;
}

interface CompanyAdmin {
  company_name: string;
  company_email: string;
  company_phone: string | null;
}

interface SearchUser {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
}

interface PendingInvite {
  id: string;
  invited_email: string;
  invited_at: string;
  status: string;
}

export function OrganizationManagement({
  open,
  onClose,
  organizationId,
  organizationName,
  currentBalance = 0,
  onBalanceUpdate,
  hideInviteSection = false,
  hideShareButton = false,
}: OrganizationManagementProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showShareCredit, setShowShareCredit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [leavingOrg, setLeavingOrg] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);
  const [loadingCompanyInfo, setLoadingCompanyInfo] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (open && organizationId) {
      fetchMembers();
      fetchCompanyAdmin();
      fetchPendingInvites();
    }
  }, [open, organizationId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!email || email.trim().length < 2) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      setSearching(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/users/search?email=${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setSearchResults(data.users || []);
          setShowSuggestions(data.users && data.users.length > 0);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const fetchCompanyAdmin = async () => {
    if (!organizationId) return;

    setLoadingCompanyInfo(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Use backend API to get company admin info
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/${organizationId}/company-admin`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.companyAdmin) {
        setCompanyAdmin(data.companyAdmin);
      } else {
        setCompanyAdmin(null);
      }
    } catch (error) {
      console.error("Error fetching company admin:", error);
      setCompanyAdmin(null);
    } finally {
      setLoadingCompanyInfo(false);
    }
  };

  const fetchPendingInvites = async () => {
    if (!organizationId) return;

    setLoadingInvites(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/${organizationId}/pending-invites`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setPendingInvites(data.invites || []);
      }
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    } finally {
      setLoadingInvites(false);
    }
  };

  const fetchMembers = async () => {
    if (!organizationId) return;

    setLoadingMembers(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/${organizationId}/members`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/${organizationId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success(data.message || "Invitation sent successfully!");
      setEmail("");
      // Refresh pending invites and members list
      fetchPendingInvites();
      setTimeout(fetchMembers, 1000);
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName });
    setShowRemoveDialog(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setShowRemoveDialog(false);
    setRemovingMemberId(memberToRemove.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8080"
        }/api/organizations/${organizationId}/members/${memberToRemove.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      toast.success(data.message || "Member removed successfully");
      fetchMembers();
      if (onBalanceUpdate) {
        onBalanceUpdate();
      }
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleLeaveOrganization = async () => {
    setShowLeaveDialog(true);
  };

  const handleConfirmLeaveOrganization = async () => {
    setShowLeaveDialog(false);
    setLeavingOrg(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/organizations/${organizationId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to leave organization");
      }

      toast.success(data.message || "Left organization successfully");
      onClose();
      // Refresh the page or parent component
      window.location.reload();
    } catch (error: any) {
      console.error("Error leaving organization:", error);
      toast.error(error.message || "Failed to leave organization");
    } finally {
      setLeavingOrg(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a365d]">
            <Building2 className="w-5 h-5 text-[#0891b2]" />
            {organizationName || "Organization"}
          </DialogTitle>
          <DialogDescription>
            Invite team members by email and manage your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Admin Info */}
          {companyAdmin && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-blue-900">
                      Managed by Company
                    </h4>
                    <Badge className="bg-blue-500">Company</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-800 font-medium">
                      {companyAdmin.company_name}
                    </p>
                    <p className="text-blue-700 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {companyAdmin.company_email}
                    </p>
                    {companyAdmin.company_phone && (
                      <p className="text-blue-700">
                        📞 {companyAdmin.company_phone}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Your organization is under this company's management
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invite Section */}
          {!hideInviteSection && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0891b2]" />
                <h3 className="font-semibold text-sm text-[#1a365d]">
                  Invite Member
                </h3>
              </div>
              <form onSubmit={handleInvite} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSuggestions(true);
                    }}
                    disabled={loading}
                    className="w-full border-gray-200 focus:border-[#0891b2] focus:ring-[#0891b2]"
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {showSuggestions && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setEmail(user.email);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {user.full_name?.charAt(0)?.toUpperCase() ||
                                user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.full_name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:from-[#0e7490] hover:to-[#0891b2]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                The user must be registered as a Normal User or Company User to
                accept the invite.
              </p>
            </div>
          )}

          {/* Pending Invitations Section */}
          {!hideInviteSection && pendingInvites.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-[#1a365d]">
                  Pending Invitations
                </h3>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-amber-100 text-amber-700"
                >
                  {pendingInvites.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <Card
                    key={invite.id}
                    className="border-amber-200 bg-amber-50/30 hover:shadow-sm transition-all"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {invite.invited_email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {invite.invited_email}
                            </p>
                            <p className="text-xs text-amber-700">
                              Invited {formatDate(invite.invited_at)} • Waiting
                              for response
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-300"
                        >
                          Pending
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t pt-4" />

          {/* Members List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0891b2]" />
                <h3 className="font-semibold text-sm text-[#1a365d]">
                  Members
                </h3>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-[#0891b2]/10 text-[#0891b2]"
                >
                  {members.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fetchMembers();
                  fetchPendingInvites();
                }}
                disabled={loadingMembers || loadingInvites}
                className="text-[#0891b2] hover:text-[#0e7490] hover:bg-[#0891b2]/10"
              >
                {loadingMembers || loadingInvites ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0891b2]" />
              </div>
            ) : members.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No members yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invite team members using the form above
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className={`hover:shadow-md transition-all ${
                      member.role === "owner"
                        ? "bg-gradient-to-r from-[#0891b2]/5 to-[#06b6d4]/5 border-[#0891b2]/30"
                        : "border-gray-100 hover:border-[#0891b2]/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] flex items-center justify-center text-white font-semibold shadow-sm">
                            {member.full_name?.charAt(0)?.toUpperCase() ||
                              member.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-[#1a365d]">
                                {member.full_name || "Unknown User"}
                              </p>
                              {member.role === "owner" && (
                                <Badge
                                  variant="default"
                                  className="bg-[#0891b2] text-xs"
                                >
                                  Owner
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-gray-500">
                                Joined {formatDate(member.joined_at)}
                              </p>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500">Balance:</span>
                                <span className="font-semibold text-green-600">
                                  ${(member.wallet_balance || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role !== "owner" && (
                            <>
                              {!hideShareButton && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setShowShareCredit(true);
                                  }}
                                  className="text-[#0891b2] border-[#0891b2]/30 hover:bg-[#0891b2]/10 hover:text-[#0e7490]"
                                >
                                  <ArrowRightLeft className="w-3 h-3 mr-1" />
                                  Share Credit
                                </Button>
                              )}
                              {member.user_id === currentUserId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleLeaveOrganization}
                                  disabled={leavingOrg}
                                  className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  {leavingOrg ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <LogOut className="w-3 h-3 mr-1" />
                                  )}
                                  Leave
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemoveMember(
                                      member.id,
                                      member.full_name || member.email,
                                    )
                                  }
                                  disabled={removingMemberId === member.id}
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                >
                                  {removingMemberId === member.id ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <UserMinus className="w-3 h-3 mr-1" />
                                  )}
                                  Remove
                                </Button>
                              )}
                            </>
                          )}
                          {member.role === "owner" && (
                            <UserCheck className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {selectedMember && (
        <ShareCreditModal
          open={showShareCredit}
          onClose={() => {
            setShowShareCredit(false);
            setSelectedMember(null);
          }}
          recipientName={selectedMember.full_name || "User"}
          recipientEmail={selectedMember.email}
          recipientUserId={selectedMember.user_id}
          currentBalance={currentBalance}
          onSuccess={() => {
            if (onBalanceUpdate) {
              onBalanceUpdate();
            }
          }}
        />
      )}

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <UserMinus className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-[#1a365d]">
                  Remove Team Member
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    Are you sure you want to remove {memberToRemove?.name}?
                  </p>
                  <p className="text-amber-700">
                    Their wallet credits will be transferred to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveMember}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Organization Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-[#1a365d]">
                  Leave Organization
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  You can be re-invited later
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    Leave {organizationName}?
                  </p>
                  <p className="text-amber-700">
                    Your wallet credits will be transferred to the organization
                    owner.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeaveOrganization}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Leave Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
