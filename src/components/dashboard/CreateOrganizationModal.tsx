import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

interface CreateOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrganizationModal({
  open,
  onClose,
  onSuccess,
}: CreateOrganizationModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to continue");
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("Creating organization with API URL:", apiUrl);

      const response = await fetch(`${apiUrl}/api/organizations/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name }),
      });

      console.log("Response status:", response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        console.error("Create organization failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
        });
        throw new Error(data.error || "Failed to create organization");
      }

      toast.success(
        "Organization created! Now you can invite members by email."
      );
      setName("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      if (error.message.includes("fetch")) {
        toast.error(
          "Cannot connect to server. Please ensure the backend server is running on port 5000."
        );
      } else {
        toast.error(error.message || "Failed to create organization");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Create Organization
          </DialogTitle>
          <DialogDescription>
            Enter your organization name. You can invite team members by email
            after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                This name will be shown to members you invite
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
