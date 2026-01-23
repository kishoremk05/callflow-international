import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyAdminLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user is company admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", data.user.id)
          .single();

        if (profile?.user_type !== "company_admin") {
          await supabase.auth.signOut();
          toast.error("This account is not a company admin account");
          return;
        }

        toast.success("Welcome back!");
        navigate("/company-admin/dashboard");
      } else {
        // Sign up
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                user_type: "company_admin",
              },
            },
          });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Update profile to company_admin type
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ user_type: "company_admin" })
            .eq("id", authData.user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }

          // Get session token
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          // Register company admin via API
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/company-admin/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                company_name: companyName,
                company_email: companyEmail,
                company_phone: companyPhone,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to register company admin");
          }

          toast.success("Company admin account created! You can now login.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="absolute top-6 left-6"
      >
        ← Back to Homepage
      </Button>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Company Admin Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your organizations and teams
          </p>
        </div>

        <Card className="border-2 border-blue-100 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? "Sign in" : "Create Company Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access the admin portal"
                : "Register your company to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Your Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Acme Corporation"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder="contact@company.com"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">
                      Company Phone (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyPhone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  {isLogin ? "Email" : "Your Email (for login)"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-semibold"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : isLogin
                    ? "Sign In"
                    : "Create Company Account"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {isLogin
                    ? "Don't have a company account? Register"
                    : "Already have an account? Sign in"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to main login
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
