import type { ClothingItem } from "@/lib/closet";

export type ClosetAdvancedFilters = {
  search: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  season: string;
  occasion: string;
  favoritesOnly: boolean;
  sort: "newest" | "name" | "most-used" | "least-used";
};

export const DEFAULT_CLOSET_FILTERS: ClosetAdvancedFilters = {
  search: "",
  category: "Todas",
  brand: "Todas",
  color: "Todas",
  size: "Todos",
  season: "Todas",
  occasion: "Todas",
  favoritesOnly: false,
  sort: "newest",
};

const matches = (value: string | null, selected: string, allLabel = "Todas") =>
  selected === allLabel ||
  (value ?? "").localeCompare(selected, "pt-BR", { sensitivity: "accent" }) === 0;

export function filterAndSortClothing(
  items: ClothingItem[],
  filters: ClosetAdvancedFilters,
): ClothingItem[] {
  const term = filters.search.trim().toLocaleLowerCase("pt-BR");
  return items
    .filter((item) => {
      const searchable = [item.name, item.brand, item.color, item.category, item.subcategory]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");
      return (
        (!term || searchable.includes(term)) &&
        matches(item.category, filters.category) &&
        matches(item.brand, filters.brand) &&
        matches(item.color, filters.color) &&
        matches(item.size, filters.size, "Todos") &&
        matches(item.season, filters.season) &&
        matches(item.occasion, filters.occasion) &&
        (!filters.favoritesOnly || item.is_favorite)
      );
    })
    .sort((a, b) => {
      if (filters.sort === "name") return a.name.localeCompare(b.name, "pt-BR");
      if (filters.sort === "most-used") return b.usage_count - a.usage_count;
      if (filters.sort === "least-used") return a.usage_count - b.usage_count;
      return b.created_at.localeCompare(a.created_at);
    });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    totalPages,
  };
}

export function uniqueValues(items: ClothingItem[], field: keyof ClothingItem): string[] {
  return [
    ...new Set(
      items
        .map((item) => item[field])
        .filter((value): value is string => typeof value === "string" && Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
