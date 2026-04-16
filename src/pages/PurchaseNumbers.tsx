import { useState, useEffect, useLayoutEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Phone, Search, ShoppingCart, Globe, Trash2 } from "lucide-react";
import { gsap } from "gsap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PurchaseNumbers() {
  const { user, signOut, userType } = useAuth();
  const navigate = useNavigate();
  const [myNumbers, setMyNumbers] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");

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

  const searchNumbers = async () => {
    setSearching(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const params = new URLSearchParams({
        countryCode,
        ...(areaCode && { areaCode }),
      });

      const response = await fetch(
        `${API_URL}/api/numbers/available?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setAvailableNumbers(data.numbers);
        toast.success(`Found ${data.numbers.length} available numbers`);
      }
    } catch (error) {
      toast.error("Failed to search numbers");
    } finally {
      setSearching(false);
    }
  };

  const purchaseNumber = async (phoneNumber: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/api/numbers/purchase`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          countryCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Number purchased successfully!");
        fetchMyNumbers();
        setAvailableNumbers([]);
      } else {
        toast.error(data.error || "Failed to purchase number");
      }
    } catch (error) {
      toast.error("Purchase failed");
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

  const popularCountries = [
    { code: "US", flag: "🇺🇸", name: "United States" },
    { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
    { code: "CA", flag: "🇨🇦", name: "Canada" },
    { code: "AU", flag: "🇦🇺", name: "Australia" },
  ];

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
          {/* Purchase New Number Card */}
          <Card
            data-animate="card"
            className="border-yellow-500/15 bg-[#101722] shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <ShoppingCart className="w-5 h-5 text-cyan-300" />
                Purchase New Number
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Search and buy phone numbers ($5/month per number)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Popular Countries */}
              <div className="space-y-2">
                <Label className="text-zinc-400">Quick Select Country</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setCountryCode(country.code)}
                      className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${
                        countryCode === country.code
                          ? "bg-[#1f2a3d] border border-cyan-400/30 text-cyan-300 shadow-lg"
                          : "bg-[#182131] border border-yellow-500/10 text-zinc-400 hover:bg-[#223049]"
                      }`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      {country.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Country Code</Label>
                  <Input
                    value={countryCode}
                    onChange={(e) =>
                      setCountryCode(e.target.value.toUpperCase())
                    }
                    placeholder="US"
                    className="bg-[#182131] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Area Code (Optional)</Label>
                  <Input
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    placeholder="415"
                    className="bg-[#182131] border-yellow-500/20 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={searchNumbers}
                    disabled={searching}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0b1220] py-6 rounded-xl font-semibold"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {searching ? "Searching..." : "Search Numbers"}
                  </Button>
                </div>
              </div>

              {availableNumbers.length > 0 && (
                <div className="border border-yellow-500/15 rounded-xl p-4 bg-[#0e1624]">
                  <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-300" />
                    Available Numbers
                  </h3>
                  <div className="space-y-3">
                    {availableNumbers.map((num: any) => (
                      <div
                        key={num.phoneNumber}
                        className="flex items-center justify-between p-4 bg-[#182131] rounded-xl border border-yellow-500/10 hover:border-cyan-400/25 transition-all"
                      >
                        <div>
                          <p className="font-semibold text-zinc-100 text-lg">
                            {num.phoneNumber}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {num.locality}, {num.region}
                          </p>
                        </div>
                        <Button
                          onClick={() => purchaseNumber(num.phoneNumber)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-[#101722] rounded-lg font-semibold"
                        >
                          Purchase $5/mo
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
