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
import { Phone, Mail, Lock, User, Building2, UserCircle } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"normal" | "company">("normal");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            CallFlow
          </h1>
          <p className="text-gray-600 mt-2">Global VoIP calling made simple</p>
        </div>

        <Card className="border-2 border-orange-100 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? "Sign in" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
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
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("normal")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          userType === "normal"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <UserCircle
                          className={`w-8 h-8 ${
                            userType === "normal"
                              ? "text-orange-500"
                              : "text-gray-400"
                          }`}
                        />
                        <div className="text-center">
                          <p
                            className={`text-sm font-semibold ${
                              userType === "normal"
                                ? "text-orange-700"
                                : "text-gray-700"
                            }`}
                          >
                            Normal User
                          </p>
                          <p className="text-xs text-gray-500">
                            Personal calling
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserType("company")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          userType === "company"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Building2
                          className={`w-8 h-8 ${
                            userType === "company"
                              ? "text-orange-500"
                              : "text-gray-400"
                          }`}
                        />
                        <div className="text-center">
                          <p
                            className={`text-sm font-semibold ${
                              userType === "company"
                                ? "text-orange-700"
                                : "text-gray-700"
                            }`}
                          >
                            Company User
                          </p>
                          <p className="text-xs text-gray-500">Team features</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-semibold"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
