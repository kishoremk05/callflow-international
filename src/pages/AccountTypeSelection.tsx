import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCircle, Building2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AccountTypeSelection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"normal" | "company" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Please select an account type");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("No user found. Please login again.");
        navigate("/signup");
        return;
      }

      // Update user profile with selected type
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: selectedType })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Mark account type selection as complete in user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { account_type_selected: true },
      });

      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
      }

      toast.success(
        `Account setup complete! Welcome as a ${selectedType === "normal" ? "Normal" : "Company"} user.`,
      );

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating user type:", error);
      toast.error("Failed to setup account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Welcome to GlobalConnect Pro!
          </CardTitle>
          <CardDescription className="text-base">
            Choose your account type to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Normal User Card */}
            <button
              type="button"
              onClick={() => setSelectedType("normal")}
              className={`relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                selectedType === "normal"
                  ? "border-orange-500 bg-orange-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {selectedType === "normal" && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedType === "normal" ? "bg-orange-100" : "bg-gray-100"
                }`}
              >
                <UserCircle
                  className={`w-10 h-10 ${
                    selectedType === "normal"
                      ? "text-orange-500"
                      : "text-gray-400"
                  }`}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className={`text-xl font-semibold ${
                    selectedType === "normal"
                      ? "text-orange-700"
                      : "text-gray-700"
                  }`}
                >
                  Normal User
                </h3>
                <p className="text-sm text-gray-600">
                  Perfect for personal calling
                </p>
              </div>

              <div className="text-left text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Voice calling worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Conference calling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Contact management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Call history</span>
                </div>
              </div>
            </button>

            {/* Company User Card */}
            <button
              type="button"
              onClick={() => setSelectedType("company")}
              className={`relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                selectedType === "company"
                  ? "border-orange-500 bg-orange-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {selectedType === "company" && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedType === "company" ? "bg-orange-100" : "bg-gray-100"
                }`}
              >
                <Building2
                  className={`w-10 h-10 ${
                    selectedType === "company"
                      ? "text-orange-500"
                      : "text-gray-400"
                  }`}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className={`text-xl font-semibold ${
                    selectedType === "company"
                      ? "text-orange-700"
                      : "text-gray-700"
                  }`}
                >
                  Company User
                </h3>
                <p className="text-sm text-gray-600">For team collaboration</p>
              </div>

              <div className="text-left text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>All Normal User features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Team management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Team activity tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedType || loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-6 text-lg font-semibold"
          >
            {loading ? "Setting up your account..." : "Continue"}
          </Button>

          <p className="text-xs text-center text-gray-500">
            You can always upgrade or change your account type later in settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
