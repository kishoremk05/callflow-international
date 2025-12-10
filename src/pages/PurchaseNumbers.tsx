import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
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
  const { user, signOut } = useAuth();
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
        }
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
        }
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
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      <div data-animate="header">
        <Header user={user} onSignOut={signOut} />
      </div>

      <main className="container py-8 px-4 md:px-6">
        <div className="mb-8" data-animate="title">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d]">
            Phone Numbers
          </h1>
          <p className="text-gray-600 mt-1">
            Purchase and manage your virtual phone numbers
          </p>
        </div>

        <div className="grid gap-6">
          {/* Purchase New Number Card */}
          <Card data-animate="card" className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                <ShoppingCart className="w-5 h-5 text-[#0891b2]" />
                Purchase New Number
              </CardTitle>
              <CardDescription>
                Search and buy phone numbers ($5/month per number)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Popular Countries */}
              <div className="space-y-2">
                <Label className="text-gray-600">Quick Select Country</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setCountryCode(country.code)}
                      className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${countryCode === country.code
                          ? "bg-[#0891b2] text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  <Label className="text-gray-600">Country Code</Label>
                  <Input
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    placeholder="US"
                    className="border-gray-200 focus:border-[#0891b2] focus:ring-[#0891b2]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Area Code (Optional)</Label>
                  <Input
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    placeholder="415"
                    className="border-gray-200 focus:border-[#0891b2] focus:ring-[#0891b2]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={searchNumbers}
                    disabled={searching}
                    className="w-full bg-[#0891b2] hover:bg-[#0e7490] text-white py-6 rounded-xl font-semibold"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {searching ? "Searching..." : "Search Numbers"}
                  </Button>
                </div>
              </div>

              {availableNumbers.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-slate-50">
                  <h3 className="font-semibold text-[#1a365d] mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#0891b2]" />
                    Available Numbers
                  </h3>
                  <div className="space-y-3">
                    {availableNumbers.map((num: any) => (
                      <div
                        key={num.phoneNumber}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div>
                          <p className="font-semibold text-[#1a365d] text-lg">
                            {num.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {num.locality}, {num.region}
                          </p>
                        </div>
                        <Button
                          onClick={() => purchaseNumber(num.phoneNumber)}
                          className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-semibold"
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
          <Card data-animate="card" className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                <Phone className="w-5 h-5 text-[#0891b2]" />
                My Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No purchased numbers yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Search and purchase a number above
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="text-gray-600">Phone Number</TableHead>
                        <TableHead className="text-gray-600">Country</TableHead>
                        <TableHead className="text-gray-600">Monthly Cost</TableHead>
                        <TableHead className="text-gray-600">Purchased</TableHead>
                        <TableHead className="text-gray-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myNumbers.map((num: any) => (
                        <TableRow key={num.id} className="border-gray-100">
                          <TableCell className="font-semibold text-[#1a365d]">
                            {num.phone_number}
                          </TableCell>
                          <TableCell className="text-gray-600">{num.country_code}</TableCell>
                          <TableCell className="text-gray-600">${num.monthly_cost}</TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(num.purchased_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => releaseNumber(num.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
