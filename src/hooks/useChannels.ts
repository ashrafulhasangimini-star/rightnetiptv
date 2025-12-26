import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Channel {
  id: string;
  name: string;
  category_id: string | null;
  stream_url: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  is_live: boolean;
  viewer_count: number;
  quality: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
}

export const useChannels = () => {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Channel[];
    },
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: Omit<Channel, "id" | "created_at" | "updated_at" | "category">) => {
      const { data, error } = await supabase
        .from("channels")
        .insert(channel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("চ্যানেল সফলভাবে যোগ করা হয়েছে");
    },
    onError: (error) => {
      toast.error("চ্যানেল যোগ করতে সমস্যা: " + error.message);
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...channel }: Partial<Channel> & { id: string }) => {
      const { data, error } = await supabase
        .from("channels")
        .update(channel)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("চ্যানেল সফলভাবে আপডেট করা হয়েছে");
    },
    onError: (error) => {
      toast.error("চ্যানেল আপডেট করতে সমস্যা: " + error.message);
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("channels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("চ্যানেল সফলভাবে মুছে ফেলা হয়েছে");
    },
    onError: (error) => {
      toast.error("চ্যানেল মুছতে সমস্যা: " + error.message);
    },
  });
};
