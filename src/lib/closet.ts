import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ClothingItem = Database["public"]["Tables"]["clothing_items"]["Row"];
export type Outfit = Database["public"]["Tables"]["outfits"]["Row"];
export type WearHistory = Database["public"]["Tables"]["wear_history"]["Row"];

export const CATEGORIES = [
  "Parte de cima",
  "Parte de baixo",
  "Vestidos",
  "Casacos",
  "Calçados",
  "Acessórios",
] as const;

export const SEASONS = ["Verão", "Outono", "Inverno", "Primavera", "Todas"] as const;
export const OCCASIONS = ["Casual", "Trabalho", "Festa", "Esporte", "Praia", "Formal"] as const;

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

/* ----------------------------- profile ----------------------------- */

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase.from("profiles").select("*").eq("id", userId as string).maybeSingle(),
      ) as Profile | null,
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Database["public"]["Tables"]["profiles"]["Update"]) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId as string, ...patch })
        .eq("id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/* -------------------------- clothing items -------------------------- */

export type ClothingFilters = {
  search?: string;
  category?: string;
  favoritesOnly?: boolean;
};

export function useClothingItems(userId: string | undefined, filters: ClothingFilters = {}) {
  return useQuery({
    queryKey: ["clothing_items", userId, filters],
    enabled: Boolean(userId),
    queryFn: async () => {
      let query = supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", userId as string)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (filters.category && filters.category !== "Todas") {
        query = query.eq("category", filters.category);
      }
      if (filters.favoritesOnly) query = query.eq("is_favorite", true);
      if (filters.search?.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(
          `name.ilike.${term},brand.ilike.${term},color.ilike.${term},category.ilike.${term}`,
        );
      }
      return unwrap(await query) as ClothingItem[];
    },
  });
}

export function useRecentlyWornItems(userId: string | undefined, limit = 4) {
  return useQuery({
    queryKey: ["clothing_items", "recent", userId, limit],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("clothing_items")
          .select("*")
          .eq("user_id", userId as string)
          .eq("is_archived", false)
          .not("last_used_at", "is", null)
          .order("last_used_at", { ascending: false })
          .limit(limit),
      ) as ClothingItem[],
  });
}

export function useClosetStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["closet_stats", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const items = unwrap(
        await supabase
          .from("clothing_items")
          .select("category,is_favorite,usage_count")
          .eq("user_id", userId as string)
          .eq("is_archived", false),
      ) as { category: string; is_favorite: boolean; usage_count: number }[];

      const outfits = unwrap(
        await supabase
          .from("outfits")
          .select("id", { count: "exact", head: false })
          .eq("user_id", userId as string),
      ) as { id: string }[];

      const wears = unwrap(
        await supabase
          .from("wear_history")
          .select("id,worn_on")
          .eq("user_id", userId as string),
      ) as { id: string; worn_on: string }[];

      const byCategory = new Map<string, number>();
      for (const item of items) byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      return {
        totalItems: items.length,
        favorites: items.filter((i) => i.is_favorite).length,
        neverWorn: items.filter((i) => i.usage_count === 0).length,
        totalOutfits: outfits.length,
        totalWears: wears.length,
        wearsThisMonth: wears.filter((w) => w.worn_on.startsWith(monthKey)).length,
        byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      };
    },
  });
}

export function useSaveClothingItem(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Omit<Database["public"]["Tables"]["clothing_items"]["Insert"], "user_id">;
    }) => {
      if (id) {
        const { error } = await supabase
          .from("clothing_items")
          .update(values)
          .eq("id", id)
          .eq("user_id", userId as string);
        if (error) throw error;
        return id;
      }
      const inserted = unwrap(
        await supabase
          .from("clothing_items")
          .insert({ ...values, user_id: userId as string })
          .select("id")
          .single(),
      ) as { id: string };
      return inserted.id;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export function useDeleteClothingItem(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clothing_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export function useToggleItemFavorite(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("clothing_items")
        .update({ is_favorite: isFavorite })
        .eq("id", id)
        .eq("user_id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

/* ------------------------------ outfits ------------------------------ */

export type OutfitWithItems = Outfit & { items: ClothingItem[] };

export function useOutfits(userId: string | undefined) {
  return useQuery({
    queryKey: ["outfits", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from("outfits")
          .select("*, outfit_items(position, clothing_items(*))")
          .eq("user_id", userId as string)
          .order("created_at", { ascending: false }),
      ) as (Outfit & {
        outfit_items: { position: number; clothing_items: ClothingItem | null }[];
      })[];

      return rows.map<OutfitWithItems>((row) => {
        const { outfit_items, ...outfit } = row;
        return {
          ...outfit,
          items: [...outfit_items]
            .sort((a, b) => a.position - b.position)
            .map((link) => link.clothing_items)
            .filter((item): item is ClothingItem => Boolean(item)),
        };
      });
    },
  });
}

export function useCreateOutfit(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string | null;
      occasion?: string | null;
      season?: string | null;
      itemIds: string[];
    }) => {
      if (input.itemIds.length === 0) throw new Error("Selecione ao menos uma peça.");
      if (input.itemIds.length > 6) throw new Error("Um look pode ter no máximo 6 peças.");

      const outfit = unwrap(
        await supabase
          .from("outfits")
          .insert({
            user_id: userId as string,
            name: input.name,
            description: input.description ?? null,
            occasion: input.occasion ?? null,
            season: input.season ?? null,
            source: "manual",
          })
          .select("id")
          .single(),
      ) as { id: string };

      const { error } = await supabase.from("outfit_items").insert(
        input.itemIds.map((clothingItemId, index) => ({
          outfit_id: outfit.id,
          clothing_item_id: clothingItemId,
          position: index,
        })),
      );
      if (error) {
        await supabase.from("outfits").delete().eq("id", outfit.id);
        throw error;
      }
      return outfit.id;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export function useDeleteOutfit(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("outfits")
        .delete()
        .eq("id", id)
        .eq("user_id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export function useToggleOutfitFavorite(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("outfits")
        .update({ is_favorite: isFavorite })
        .eq("id", id)
        .eq("user_id", userId as string);
      if (error) throw error;
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

/* --------------------------- wear tracking --------------------------- */

/** Records a wear for an outfit (and each of its pieces), bumping counters. */
export function useRegisterOutfitWear(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      outfit,
      wornOn,
      occasion,
    }: {
      outfit: OutfitWithItems;
      wornOn?: string;
      occasion?: string | null;
    }) => {
      const day = wornOn ?? new Date().toISOString().slice(0, 10);
      const timestamp = new Date(`${day}T12:00:00Z`).toISOString();

      const rows = [
        {
          user_id: userId as string,
          outfit_id: outfit.id,
          worn_on: day,
          occasion: occasion ?? outfit.occasion,
        },
        ...outfit.items.map((item) => ({
          user_id: userId as string,
          outfit_id: outfit.id,
          clothing_item_id: item.id,
          worn_on: day,
          occasion: occasion ?? outfit.occasion,
        })),
      ];
      const { error } = await supabase.from("wear_history").insert(rows);
      if (error) throw error;

      await supabase
        .from("outfits")
        .update({ usage_count: outfit.usage_count + 1, last_used_at: timestamp })
        .eq("id", outfit.id)
        .eq("user_id", userId as string);

      await Promise.all(
        outfit.items.map((item) =>
          supabase
            .from("clothing_items")
            .update({ usage_count: item.usage_count + 1, last_used_at: timestamp })
            .eq("id", item.id)
            .eq("user_id", userId as string),
        ),
      );
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export function useRegisterItemWear(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ item, wornOn }: { item: ClothingItem; wornOn?: string }) => {
      const day = wornOn ?? new Date().toISOString().slice(0, 10);
      const timestamp = new Date(`${day}T12:00:00Z`).toISOString();
      const { error } = await supabase.from("wear_history").insert({
        user_id: userId as string,
        clothing_item_id: item.id,
        worn_on: day,
      });
      if (error) throw error;
      await supabase
        .from("clothing_items")
        .update({ usage_count: item.usage_count + 1, last_used_at: timestamp })
        .eq("id", item.id)
        .eq("user_id", userId as string);
    },
    onSuccess: () => invalidateCloset(qc),
  });
}

export type WearHistoryEntry = WearHistory & {
  clothing_items: Pick<ClothingItem, "id" | "name" | "image_url"> | null;
  outfits: Pick<Outfit, "id" | "name"> | null;
};

export function useWearHistory(userId: string | undefined, limit = 60) {
  return useQuery({
    queryKey: ["wear_history", userId, limit],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("wear_history")
          .select("*, clothing_items(id,name,image_url), outfits(id,name)")
          .eq("user_id", userId as string)
          .order("worn_on", { ascending: false })
          .limit(limit),
      ) as WearHistoryEntry[],
  });
}

function invalidateCloset(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["clothing_items"] });
  qc.invalidateQueries({ queryKey: ["outfits"] });
  qc.invalidateQueries({ queryKey: ["closet_stats"] });
  qc.invalidateQueries({ queryKey: ["wear_history"] });
}
