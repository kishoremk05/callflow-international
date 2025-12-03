import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Search, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PurchaseNumbers() {
  const { user, signOut } = useAuth();
  const [myNumbers, setMyNumbers] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Phone Numbers</h1>
          <p className="text-muted-foreground">
            Purchase and manage your phone numbers
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Purchase New Number
              </CardTitle>
              <CardDescription>
                Search and buy phone numbers ($5/month per number)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Country Code</Label>
                  <Input
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="US"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area Code (Optional)</Label>
                  <Input
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    placeholder="415"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={searchNumbers}
                    disabled={searching}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Numbers
                  </Button>
                </div>
              </div>

              {availableNumbers.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Available Numbers</h3>
                  <div className="space-y-2">
                    {availableNumbers.map((num: any) => (
                      <div
                        key={num.phoneNumber}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{num.phoneNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {num.locality}, {num.region}
                          </p>
                        </div>
                        <Button
                          onClick={() => purchaseNumber(num.phoneNumber)}
                          size="sm"
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                My Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myNumbers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No purchased numbers yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Monthly Cost</TableHead>
                      <TableHead>Purchased</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myNumbers.map((num: any) => (
                      <TableRow key={num.id}>
                        <TableCell className="font-medium">
                          {num.phone_number}
                        </TableCell>
                        <TableCell>{num.country_code}</TableCell>
                        <TableCell>${num.monthly_cost}</TableCell>
                        <TableCell>
                          {new Date(num.purchased_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => releaseNumber(num.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
