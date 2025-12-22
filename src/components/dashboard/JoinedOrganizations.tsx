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
import { Building2, Users, Loader2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
                              Owner: {org.owner_name || org.owner_email}
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
    </Dialog>
  );
}
