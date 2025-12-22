import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
}

export function OrganizationManagement({
  open,
  onClose,
  organizationId,
  organizationName,
  currentBalance = 0,
  onBalanceUpdate,
}: OrganizationManagementProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showShareCredit, setShowShareCredit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (open && organizationId) {
      fetchMembers();
    }
  }, [open, organizationId]);

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
        }
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success(data.message || "Invitation sent successfully!");
      setEmail("");
      // Refresh members list after a short delay to allow the invite to be accepted
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
          {/* Invite Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0891b2]" />
              <h3 className="font-semibold text-sm text-[#1a365d]">
                Invite Member
              </h3>
            </div>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border-gray-200 focus:border-[#0891b2] focus:ring-[#0891b2]"
                />
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
              The user must be registered as a Normal User to accept the invite.
            </p>
          </div>

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
                onClick={fetchMembers}
                disabled={loadingMembers}
                className="text-[#0891b2] hover:text-[#0e7490] hover:bg-[#0891b2]/10"
              >
                {loadingMembers ? (
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
                            <p className="text-xs text-gray-500 mt-1">
                              Joined {formatDate(member.joined_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role !== "owner" && (
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
                          <UserCheck className="w-5 h-5 text-green-500" />
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
    </Dialog>
  );
}
