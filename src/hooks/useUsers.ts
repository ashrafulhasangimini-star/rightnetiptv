import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role?: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // Get roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "user",
        };
      });

      return usersWithRoles as UserProfile[];
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "moderator" | "user" }) => {
      // First, delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Then insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ব্যবহারকারীর ভূমিকা আপডেট করা হয়েছে");
    },
    onError: (error) => {
      toast.error("ভূমিকা আপডেট করতে সমস্যা: " + error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Note: This only removes the profile, not the auth user
      // Full user deletion would require admin API
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ব্যবহারকারী সরানো হয়েছে");
    },
    onError: (error) => {
      toast.error("ব্যবহারকারী সরাতে সমস্যা: " + error.message);
    },
  });
};
