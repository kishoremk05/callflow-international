import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Building2,
  Users,
  Loader2,
  Calendar,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface JoinedOrganizationsProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface Organization {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  member_count: number;
  joined_at: string;
  role: string;
}

export function JoinedOrganizations({
  open,
  onClose,
  userId,
}: JoinedOrganizationsProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [leavingOrgId, setLeavingOrgId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchOrganizations();
    }
  }, [open, userId]);

  const fetchOrganizations = async () => {
    setLoading(true);
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
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
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

  const handleLeaveClick = (orgId: string, orgName: string) => {
    setSelectedOrg({ id: orgId, name: orgName });
    setShowLeaveDialog(true);
  };

  const handleConfirmLeave = async () => {
    if (!selectedOrg) return;

    setLeavingOrgId(selectedOrg.id);
    setShowLeaveDialog(false);

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
        }/api/organizations/${selectedOrg.id}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to leave organization");
      }

      toast.success(data.message || "Left organization successfully");
      // Refresh the organizations list
      await fetchOrganizations();
      // If no organizations left, close the modal
      if (organizations.length <= 1) {
        onClose();
      }
    } catch (error: any) {
      console.error("Error leaving organization:", error);
      toast.error(error.message || "Failed to leave organization");
    } finally {
      setLeavingOrgId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a365d]">
            <Building2 className="w-5 h-5 text-[#0891b2]" />
            My Organizations
          </DialogTitle>
          <DialogDescription>
            Organizations you are a member of
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0891b2]" />
            </div>
          ) : organizations.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  No organizations yet
                </p>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                  You haven't joined any organizations. Accept an invitation to
                  get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="border-gray-100 hover:shadow-md transition-all hover:border-[#0891b2]/30"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0891b2] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#1a365d]">
                              {org.name}
                            </h3>
                            {org.role === "owner" && (
                              <Badge className="bg-[#0891b2] text-xs">
                                Owner
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600">
                              Owner: {org.owner_name || "Unknown"}
                              {org.owner_email && (
                                <span className="text-[#0891b2] ml-1">
                                  ({org.owner_email})
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{org.member_count} members</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {formatDate(org.joined_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {org.role !== "owner" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveClick(org.id, org.name)}
                          disabled={leavingOrgId === org.id}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          {leavingOrgId === org.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 mr-1" />
                          )}
                          Leave
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Badge variant="secondary" className="text-xs">
            {organizations.length} organization
            {organizations.length !== 1 ? "s" : ""}
          </Badge>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Leave Organization Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg text-left">
                  Leave Organization?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-3 pt-2">
              <p className="text-base">
                Are you sure you want to leave{" "}
                <span className="font-semibold text-gray-900">
                  "{selectedOrg?.name}"
                </span>
                ?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Important:</strong> Your wallet credits will be
                  automatically transferred back to the organization owner.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. You'll need to be re-invited to
                join again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Yes, Leave Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
