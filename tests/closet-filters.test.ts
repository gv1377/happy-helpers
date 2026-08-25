import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CLOSET_FILTERS,
  filterAndSortClothing,
  paginate,
} from "../src/lib/closet-filters.ts";

const item = (overrides: Record<string, unknown>) => ({
  id: crypto.randomUUID(),
  name: "Peça",
  brand: null,
  category: "Vestidos",
  color: null,
  created_at: "2026-01-01",
  image_url: null,
  is_archived: false,
  is_favorite: false,
  last_used_at: null,
  material: null,
  notes: null,
  occasion: null,
  original_image_url: null,
  price: null,
  purchase_date: null,
  season: null,
  secondary_color: null,
  size: null,
  subcategory: null,
  tags: [],
  updated_at: "2026-01-01",
  usage_count: 0,
  user_id: "user",
  ...overrides,
});

test("combina pesquisa, categoria e favoritos", () => {
  const items = [
    item({ name: "Vestido Floral", color: "Azul", is_favorite: true }),
    item({ name: "Camisa", category: "Parte de cima", color: "Branco" }),
  ];
  const result = filterAndSortClothing(items as never[], {
    ...DEFAULT_CLOSET_FILTERS,
    search: "floral",
    category: "Vestidos",
    favoritesOnly: true,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0]?.name, "Vestido Floral");
});

test("ordena por uso e pagina sem sair dos limites", () => {
  const items = [
    item({ name: "A", usage_count: 1 }),
    item({ name: "B", usage_count: 8 }),
    item({ name: "C", usage_count: 3 }),
  ];
  const sorted = filterAndSortClothing(items as never[], {
    ...DEFAULT_CLOSET_FILTERS,
    sort: "most-used",
  });
  assert.deepEqual(
    sorted.map((value) => value.name),
    ["B", "C", "A"],
  );
  const page = paginate(sorted, 9, 2);
  assert.equal(page.page, 2);
  assert.deepEqual(
    page.items.map((value) => value.name),
    ["A"],
  );
});
