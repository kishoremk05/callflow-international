import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_enterprise: boolean;
  enterprise_info: {
    id: string;
    name: string;
    business_type: string;
  } | null;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [businessType, setBusinessType] = useState("technology");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/temp/users`
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMakeEnterprise = (user: User) => {
    setSelectedUser(user);
    setEnterpriseName(`${user.full_name || user.email}'s Enterprise`);
    setShowDialog(true);
  };

  const confirmMakeEnterprise = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/temp/make-enterprise/${selectedUser.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enterpriseName,
            businessType,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${selectedUser.email} is now an enterprise account!`);
        setShowDialog(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to convert user");
      }
    } catch (error) {
      console.error("Failed to convert user:", error);
      toast.error("Failed to convert user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveEnterprise = async (user: User) => {
    if (!confirm(`Remove ${user.email} from enterprise account?`)) return;

    try {
      setActionLoading(user.id);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/temp/remove-enterprise/${user.id}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${user.email} removed from enterprise`);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to remove user");
      }
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1a365d]">
                Admin Panel
              </h1>
              <p className="text-gray-600">Manage users and enterprise accounts</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 mt-4">
            <span className="text-yellow-800 text-sm">
              ⚠️ <strong>Temporary Admin Panel</strong> - No authentication required (for testing only)
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-[#0891b2]">
                    {users.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-[#0891b2]/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enterprise Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter((u) => u.is_enterprise).length}
                  </p>
                </div>
                <Building2 className="w-10 h-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Regular Users</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {users.filter((u) => !u.is_enterprise).length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-orange-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0891b2]" />
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Enterprise
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0891b2] to-blue-600 flex items-center justify-center text-white font-bold">
                              {(user.full_name || user.email)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.full_name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-4">
                          {user.is_enterprise ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Enterprise
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Regular
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {user.enterprise_info ? (
                            <div>
                              <p className="font-medium">
                                {user.enterprise_info.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.enterprise_info.business_type}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {user.is_enterprise ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveEnterprise(user)}
                              disabled={actionLoading === user.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Remove
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMakeEnterprise(user)}
                              disabled={actionLoading === user.id}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Building2 className="w-4 h-4 mr-1" />
                                  Make Enterprise
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Enterprise Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Enterprise Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  value={selectedUser?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="name">Enterprise Name</Label>
                <Input
                  id="name"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  placeholder="Enter enterprise name"
                />
              </div>
              <div>
                <Label htmlFor="type">Business Type</Label>
                <select
                  id="type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmMakeEnterprise}
                disabled={actionLoading !== null || !enterpriseName}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Create Enterprise
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
