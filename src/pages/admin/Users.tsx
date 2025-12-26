import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, Clock, Loader2, Trash2 } from "lucide-react";
import { useUsers, useUpdateUserRole, useDeleteUser, UserProfile } from "@/hooks/useUsers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

const roleLabels: Record<string, string> = {
  admin: "অ্যাডমিন",
  moderator: "মডারেটর",
  user: "ইউজার",
};

const Users = () => {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleRoleChange = (userId: string, role: "admin" | "moderator" | "user") => {
    updateRole.mutate({ userId, role });
    setEditingUserId(null);
  };

  const handleDelete = (userId: string) => {
    if (confirm("আপনি কি নিশ্চিত এই ব্যবহারকারী সরাতে চান?")) {
      deleteUser.mutate(userId);
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
    </div>
  );
};

export default Users;
