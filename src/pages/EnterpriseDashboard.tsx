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
import { Switch } from "@/components/ui/switch";
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
import {
  Building2,
  UserPlus,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EnterpriseDashboard() {
  const { user, signOut } = useAuth();
  const [enterprise, setEnterprise] = useState<any>(null);
  const [members, setMembers] = useState([]);
  const [usage, setUsage] = useState<any>({});
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEnterpriseData();
    }
  }, [user]);

  const fetchEnterpriseData = async () => {
    try {
      // Check if user has enterprise
      const { data: enterpriseData } = await supabase
        .from("enterprise_accounts")
        .select("*")
        .or(`admin_id.eq.${user?.id}`)
        .single();

      if (enterpriseData) {
        setEnterprise(enterpriseData);
        setIsAdmin(enterpriseData.admin_id === user?.id);
        fetchMembers(enterpriseData.id);
        fetchUsage(enterpriseData.id);
      }
    } catch (error) {
      console.error("Error fetching enterprise:", error);
    }
  };

  const fetchMembers = async (enterpriseId: string) => {
    try {
      const { data } = await supabase
        .from("enterprise_members")
        .select(
          `
          *,
          profiles:user_id (full_name, email)
        `
        )
        .eq("enterprise_id", enterpriseId);

      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchUsage = async (enterpriseId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/enterprise/${enterpriseId}/usage`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  };

  const createEnterprise = async (name: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/api/enterprise/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Enterprise created successfully!");
        fetchEnterpriseData();
      }
    } catch (error) {
      toast.error("Failed to create enterprise");
    }
  };

  const addMember = async () => {
    if (!newMemberEmail) {
      toast.error("Please enter an email");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/enterprise/${enterprise.id}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newMemberEmail,
            creditLimit: 0,
            canMakeCalls: true,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Member added successfully!");
        setNewMemberEmail("");
        fetchMembers(enterprise.id);
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const shareCredits = async () => {
    const amount = parseFloat(creditAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/enterprise/${enterprise.id}/share-credits`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`$${amount} transferred to shared balance`);
        setCreditAmount("");
        fetchEnterpriseData();
      }
    } catch (error) {
      toast.error("Failed to share credits");
    }
  };

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onSignOut={signOut} />
        <main className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Enterprise Account</CardTitle>
              <CardDescription>
                Set up an enterprise account to manage team calling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enterprise Name</Label>
                  <Input
                    placeholder="Enter company name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        createEnterprise((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => {
                    const input = document.querySelector(
                      "input"
                    ) as HTMLInputElement;
                    createEnterprise(input?.value);
                  }}
                >
                  Create Enterprise
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            {enterprise.name}
          </h1>
          <p className="text-muted-foreground">Enterprise Dashboard</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shared Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${enterprise.shared_balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Max Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enterprise.max_members}</div>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Member Email</Label>
                  <Input
                    type="email"
                    placeholder="member@company.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addMember} className="w-full">
                  Add Member
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Share Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                  />
                </div>
                <Button onClick={shareCredits} className="w-full">
                  Transfer to Shared Balance
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Used Credits</TableHead>
                  <TableHead>Can Call</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.profiles?.full_name}</TableCell>
                    <TableCell>{member.profiles?.email}</TableCell>
                    <TableCell>${member.credit_limit}</TableCell>
                    <TableCell>${member.used_credits}</TableCell>
                    <TableCell>
                      {member.can_make_calls ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
