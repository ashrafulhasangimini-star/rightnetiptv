import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, User, Clock, Loader2, Trash2, Plus, X, Save } from "lucide-react";
import { useUsers, useUpdateUserRole, useDeleteUser, UserProfile } from "@/hooks/useUsers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "অ্যাডমিন",
  moderator: "মডারেটর",
  user: "ইউজার",
};

const Users = () => {
  const { data: users, isLoading, refetch } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user" as "admin" | "moderator" | "user",
  });

  const handleRoleChange = (userId: string, role: "admin" | "moderator" | "user") => {
    updateRole.mutate({ userId, role });
    setEditingUserId(null);
  };

  const handleDelete = (userId: string) => {
    if (confirm("আপনি কি নিশ্চিত এই ব্যবহারকারী সরাতে চান?")) {
      deleteUser.mutate(userId);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড আবশ্যক");
      return;
    }

    if (newUser.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }

    setCreating(true);

    try {
      // Create user using Supabase Auth Admin API through edge function
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // If role is not 'user', update the role
        if (newUser.role !== "user") {
          // Wait a moment for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await supabase.from("user_roles").upsert({
            user_id: data.user.id,
            role: newUser.role,
          });
        }

        toast.success("ব্যবহারকারী সফলভাবে তৈরি হয়েছে");
        setShowCreateForm(false);
        setNewUser({ email: "", password: "", fullName: "", role: "user" });
        refetch();
      }
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে");
      } else {
        toast.error("ব্যবহারকারী তৈরি করতে সমস্যা: " + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">ব্যবহারকারী ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">মোট {users?.length || 0} জন ব্যবহারকারী</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4" />
          নতুন ব্যবহারকারী
        </Button>
      </div>

      {users && users.length > 0 ? (
        <div className="glass-card divide-y divide-border/30">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || ""} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{user.full_name || "নাম নেই"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {editingUserId === user.user_id ? (
                    <Select
                      defaultValue={user.role || "user"}
                      onValueChange={(value) => handleRoleChange(user.user_id, value as "admin" | "moderator" | "user")}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">অ্যাডমিন</SelectItem>
                        <SelectItem value="moderator">মডারেটর</SelectItem>
                        <SelectItem value="user">ইউজার</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm">{roleLabels[user.role || "user"]}</span>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: bn })}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingUserId(editingUserId === user.user_id ? null : user.user_id)}
                >
                  {editingUserId === user.user_id ? "বাতিল" : "সম্পাদনা"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(user.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">কোনো ব্যবহারকারী নেই।</p>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">নতুন ব্যবহারকারী</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">পূর্ণ নাম</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="ব্যবহারকারীর নাম"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">ভূমিকা</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "moderator" | "user" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">অ্যাডমিন</SelectItem>
                    <SelectItem value="moderator">মডারেটর</SelectItem>
                    <SelectItem value="user">ইউজার</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  বাতিল
                </Button>
                <Button type="submit" variant="gradient" className="flex-1 gap-2" disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  তৈরি করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
