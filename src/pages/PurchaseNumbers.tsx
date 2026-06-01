import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Clock3, Trash2 } from "lucide-react";
import { gsap } from "gsap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PurchaseNumbers() {
  const { user, signOut, userType } = useAuth();
  const navigate = useNavigate();
  const [myNumbers, setMyNumbers] = useState([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-animate="header"]', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from('[data-animate="title"]', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from('[data-animate="card"]', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyNumbers();
    }
  }, [user]);

  const fetchMyNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from("purchased_numbers")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true);

      if (error) throw error;
      setMyNumbers(data || []);
    } catch (error) {
      console.error("Error fetching numbers:", error);
    }
  };

  const releaseNumber = async (numberId: string) => {
    if (!confirm("Are you sure you want to release this number?")) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/numbers/release/${numberId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Number released successfully");
        fetchMyNumbers();
      }
    } catch (error) {
      toast.error("Failed to release number");
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden flex bg-[#090c12] text-zinc-100"
    >
      <Sidebar
        activeView="numbers"
        onViewChange={(view) => {
          if (view === "numbers") navigate("/numbers");
          else if (view === "voice-call") navigate("/voice-call");
          else if (view === "admin") navigate("/company-admin/dashboard");
          else navigate("/dashboard", { state: { view } });
        }}
        onLogout={signOut}
        showAdmin={userType === "company" || userType === "company_admin"}
        user={user}
      />

      <main className="flex-1 overflow-y-auto py-8 px-6 bg-gradient-to-b from-[#090c12] via-[#0d121a] to-[#0a0f16]">
        <div className="mb-8" data-animate="title">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">
            Phone Numbers
          </h1>
          <p className="text-zinc-400 mt-1">
            Purchase and manage your virtual phone numbers
          </p>
        </div>

        <div className="grid gap-6">
          <Card
            data-animate="card"
            className="border-yellow-500/15 bg-[#101722] shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Clock3 className="w-5 h-5 text-cyan-300" />
                Coming Soon
              </CardTitle>
              <CardDescription className="text-zinc-400">
                The phone number marketplace is temporarily unavailable while
                this section is being rebuilt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-cyan-400/25 bg-[#0e1624] p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                  <Clock3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">
                  Coming soon
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
                  This section is temporarily disabled while we finish the next
                  version of virtual number purchasing.
                </p>
                <div className="mt-6 inline-flex items-center rounded-full border border-yellow-500/15 bg-[#182131] px-4 py-2 text-sm text-zinc-300">
                  Purchase tools will return here once the new flow is ready.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Numbers Card */}
          <Card
            data-animate="card"
            className="border-yellow-500/15 bg-[#101722] shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Phone className="w-5 h-5 text-cyan-300" />
                My Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#182131] border border-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 font-medium">
                    No purchased numbers yet
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Search and purchase a number above
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-zinc-200">
                    <TableHeader>
                      <TableRow className="border-yellow-500/15 hover:bg-transparent">
                        <TableHead className="text-zinc-400">
                          Phone Number
                        </TableHead>
                        <TableHead className="text-zinc-400">Country</TableHead>
                        <TableHead className="text-zinc-400">
                          Monthly Cost
                        </TableHead>
                        <TableHead className="text-zinc-400">
                          Purchased
                        </TableHead>
                        <TableHead className="text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myNumbers.map((num: any) => (
                        <TableRow
                          key={num.id}
                          className="border-yellow-500/10 hover:bg-[#182131]"
                        >
                          <TableCell className="font-semibold text-zinc-100">
                            {num.phone_number}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {num.country_code}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            ${num.monthly_cost}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {new Date(num.purchased_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => releaseNumber(num.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Release
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
