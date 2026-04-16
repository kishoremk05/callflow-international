import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/branding/BrandLogo";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/super-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store super admin token
        localStorage.setItem("super_admin_token", data.token);
        toast({
          title: "Login successful",
          description: "Welcome back, Super Admin!",
        });
        navigate("/super-admin/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
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
        onClick={() => navigate("/")}
        variant="ghost"
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
          <p className="text-zinc-400 mt-1.5">Access administrative controls</p>
        </div>

        <Card className="w-full border border-yellow-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.55)] rounded-2xl bg-[#141821] backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl text-zinc-100">
              Super Admin
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to access administrative controls
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#0f131b] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#0f131b] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
