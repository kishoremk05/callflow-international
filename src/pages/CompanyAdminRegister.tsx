import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CompanyAdminRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.company_email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = (
        await import("@/integrations/supabase/client")
      ).supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/company-admin/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Company admin registration successful!");
        navigate("/company-admin/dashboard");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register as company admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="absolute top-6 left-6"
      >
        ← Back to Homepage
      </Button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Company Admin</h1>
          <p className="text-gray-600 mt-2">Register your company</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Registration</CardTitle>
            <CardDescription>
              Create a company admin account to manage organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email">
                  Company Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.company_email}
                  onChange={(e) =>
                    setFormData({ ...formData, company_email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone">
                  Company Phone{" "}
                  <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="company_phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.company_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, company_phone: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Company"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Already registered? Navigate to your dashboard</p>
        </div>
      </div>
    </div>
  );
}
