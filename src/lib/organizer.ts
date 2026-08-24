import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Trip = Database["public"]["Tables"]["trips"]["Row"];

type TableName = "wishlist" | "collections" | "events" | "trips";

export function useOrganizerRows<T>(table: TableName, userId?: string) {
  return useQuery({
    queryKey: [table, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useCreateOrganizerRow(table: TableName, userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert({ ...values, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table, userId] }),
  });
}

export function useDeleteOrganizerRow(table: TableName, userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)
        .eq("user_id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table, userId] }),
  });
}
