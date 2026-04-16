import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  UserCircle,
  ArrowLeft,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import BrandLogo from "@/components/branding/BrandLogo";

export function AuthForm() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"normal" | "company">("normal");

  const handleSocialLogin = async (provider: "google") => {
    setLoading(true);
    try {
      // Use current origin for redirect (localhost in dev, production in prod)
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        // Sign up the user
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                user_type: userType,
              },
            },
          });

        if (signUpError) throw signUpError;

        // Update the profile with user_type
        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ user_type: userType })
            .eq("id", authData.user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }
        }

        toast.success("Account created! Check your email to verify.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d12] p-3 sm:p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,178,74,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(232,178,74,0.25) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute -top-20 left-[20%] w-[380px] h-[380px] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[10%] w-[420px] h-[420px] rounded-full bg-yellow-500/10 blur-[140px] pointer-events-none" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 text-zinc-300 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/25"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homepage
      </Button>

      <div className="w-full max-w-md space-y-5 relative z-10">
        <div className="text-center">
          <BrandLogo
            className="justify-center mb-3"
            iconClassName="text-yellow-400 h-10 w-10"
            textClassName="text-4xl font-bold tracking-tight text-yellow-400"
          />
          <p className="text-zinc-400 mt-1.5">
            Global VoIP calling made simple
          </p>
        </div>

        <Card className="border border-yellow-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.55)] rounded-2xl bg-[#141821] backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl text-zinc-100">
              {isLogin ? "Sign in" : "Create account"}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-zinc-200">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-[#0f131b] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-200">Account Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("normal")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          userType === "normal"
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <UserCircle
                          className={`w-8 h-8 ${
                            userType === "normal"
                              ? "text-yellow-400"
                              : "text-zinc-500"
                          }`}
                        />
                        <div className="text-center">
                          <p
                            className={`text-sm font-semibold ${
                              userType === "normal"
                                ? "text-yellow-300"
                                : "text-zinc-300"
                            }`}
                          >
                            Normal User
                          </p>
                          <p className="text-xs text-zinc-500">
                            Personal calling
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserType("company")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          userType === "company"
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <Building2
                          className={`w-8 h-8 ${
                            userType === "company"
                              ? "text-yellow-400"
                              : "text-zinc-500"
                          }`}
                        />
                        <div className="text-center">
                          <p
                            className={`text-sm font-semibold ${
                              userType === "company"
                                ? "text-yellow-300"
                                : "text-zinc-300"
                            }`}
                          >
                            Company User
                          </p>
                          <p className="text-xs text-zinc-500">Team features</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#0f131b] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#0f131b] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-400 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#0b0d12] rounded-full font-semibold"
                size="default"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-yellow-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#141821] px-2 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                className="w-full border-yellow-500/25 bg-[#0f131b] hover:bg-[#171c27] text-zinc-200 transition-all"
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
