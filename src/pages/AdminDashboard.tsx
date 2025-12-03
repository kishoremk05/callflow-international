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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Shield,
  Users,
  Building2,
  Phone,
  DollarSign,
  TrendingUp,
  Settings,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [rates, setRates] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .eq("role", "admin")
        .single();

      if (userRole) {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        toast.error("Access denied: Admin privileges required");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const statsData = await statsResponse.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch users
      const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const usersData = await usersResponse.json();
      if (usersData.success) setUsers(usersData.users);

      // Fetch enterprises
      const enterprisesResponse = await fetch(
        `${API_URL}/api/admin/enterprises`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      const enterprisesData = await enterprisesResponse.json();
      if (enterprisesData.success) setEnterprises(enterprisesData.enterprises);

      // Fetch rates
      const ratesResponse = await fetch(`${API_URL}/api/admin/rates`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const ratesData = await ratesResponse.json();
      if (ratesData.success) setRates(ratesData.rates);

      // Fetch call logs
      const callsResponse = await fetch(
        `${API_URL}/api/admin/call-logs?limit=50`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      const callsData = await callsResponse.json();
      if (callsData.success) setCallLogs(callsData.calls);

      // Fetch payments
      const paymentsResponse = await fetch(
        `${API_URL}/api/admin/payments?limit=50`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      const paymentsData = await paymentsResponse.json();
      if (paymentsData.success) setPayments(paymentsData.payments);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setLoading(false);
    }
  };

  const updateRate = async (
    countryCode: string,
    costPerMinute: number,
    sellRate: number
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/api/admin/rates`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode,
          costPerMinute,
          sellRatePerMinute: sellRate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Rate updated successfully");
        fetchAdminData();
      }
    } catch (error) {
      toast.error("Failed to update rate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System management and analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalls || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profit
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalProfit || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="enterprises">Enterprises</TabsTrigger>
            <TabsTrigger value="rates">Rate Settings</TabsTrigger>
            <TabsTrigger value="calls">Call Logs</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          ${user.wallets?.[0]?.balance || 0}
                        </TableCell>
                        <TableCell>
                          {user.user_roles?.[0]?.role || "user"}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enterprises">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Shared Balance</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enterprises.map((ent: any) => (
                      <TableRow key={ent.id}>
                        <TableCell>{ent.name}</TableCell>
                        <TableCell>{ent.profiles?.email}</TableCell>
                        <TableCell>${ent.shared_balance}</TableCell>
                        <TableCell>
                          {ent.enterprise_members?.length || 0}
                        </TableCell>
                        <TableCell>
                          {new Date(ent.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Rate Configuration</CardTitle>
                <CardDescription>
                  Manage per-minute calling rates for different countries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Cost/Min</TableHead>
                      <TableHead>Sell Rate/Min</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate: any) => (
                      <TableRow key={rate.id}>
                        <TableCell>{rate.country_name}</TableCell>
                        <TableCell>{rate.country_code}</TableCell>
                        <TableCell>${rate.cost_per_minute}</TableCell>
                        <TableCell>${rate.sell_rate_per_minute}</TableCell>
                        <TableCell>
                          $
                          {(
                            rate.sell_rate_per_minute - rate.cost_per_minute
                          ).toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Recent Call Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>To Number</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callLogs.map((call: any) => (
                      <TableRow key={call.id}>
                        <TableCell>{call.profiles?.email}</TableCell>
                        <TableCell>
                          {call.to_country_code} {call.to_number}
                        </TableCell>
                        <TableCell>
                          {Math.floor((call.duration_seconds || 0) / 60)}m
                        </TableCell>
                        <TableCell>
                          ${call.billed_amount?.toFixed(2) || 0}
                        </TableCell>
                        <TableCell>
                          ${call.profit_margin?.toFixed(2) || 0}
                        </TableCell>
                        <TableCell>{call.status}</TableCell>
                        <TableCell>
                          {new Date(call.started_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credits Added</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.profiles?.email}</TableCell>
                        <TableCell>
                          {payment.currency} {payment.amount}
                        </TableCell>
                        <TableCell>{payment.provider}</TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              payment.status === "completed"
                                ? "text-green-600"
                                : payment.status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>${payment.credits_added || 0}</TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
