import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Check, X, Loader2, Clock } from "lucide-react";

interface OrganizationInvite {
  id: string;
  organization_id: string;
  invited_email: string;
  invited_at: string;
  organizations: {
    id: string;
    name: string;
    description: string | null;
  };
  invited_by_profile: {
    full_name: string | null;
    email: string;
  };
}

interface InviteNotificationsProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function InviteNotifications({
  open,
  onClose,
  userId,
}: InviteNotificationsProps) {
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchInvites();
    }
  }, [open]);

  const fetchInvites = async () => {
    setLoading(true);
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
        }
      );

      const data = await response.json();

      if (response.ok) {
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
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
        }/api/organizations/invites/${inviteId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invite");
      }

      toast.success("Successfully joined organization!");
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      toast.error(error.message || "Failed to accept invite");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    setProcessingId(inviteId);
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
        }/api/organizations/invites/${inviteId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject invite");
      }

      toast.success("Invite rejected");
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (error: any) {
      console.error("Error rejecting invite:", error);
      toast.error(error.message || "Failed to reject invite");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Organization Invitations
          </DialogTitle>
          <DialogDescription>
            You have been invited to join the following organizations.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <Card key={invite.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-orange-500" />
                          <h4 className="font-semibold text-gray-900">
                            {invite.organizations.name}
                          </h4>
                        </div>
                        {invite.organizations.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {invite.organizations.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Invited by{" "}
                          {invite.invited_by_profile.full_name ||
                            invite.invited_by_profile.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(invite.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(invite.id)}
                          disabled={processingId === invite.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {processingId === invite.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(invite.id)}
                          disabled={processingId === invite.id}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {processingId === invite.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
