import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Heart, Plus, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { ClothingItemDialog } from "@/components/ClothingItemDialog";
import { SignedImage } from "@/components/SignedImage";
import { useAuth } from "@/hooks/useAuth";
import {
  CATEGORIES,
  useClothingItems,
  useToggleItemFavorite,
  type ClothingItem,
} from "@/lib/closet";
import {
  DEFAULT_CLOSET_FILTERS,
  filterAndSortClothing,
  paginate,
  uniqueValues,
} from "@/lib/closet-filters";
export const Route = createFileRoute("/_authenticated/closet")({ component: Closet });
function Closet() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_CLOSET_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ClothingItem>();
  const { data: items = [], isLoading } = useClothingItems(user?.id);
  const filtered = useMemo(() => filterAndSortClothing(items, filters), [items, filters]);
  const result = paginate(filtered, page, 12);
  useEffect(() => setPage(1), [filters]);
  const setFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const fav = useToggleItemFavorite(user?.id);
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">MEU GUARDA-ROUPA</p>
          <h1>Meu closet</h1>
          <p className="muted">
            {filtered.length} de {items.length} peças.
          </p>
        </div>
        <button className="round-button" onClick={() => setOpen(true)}>
          <Plus />
        </button>
      </section>
      <div className="search-box">
        <Search size={18} />
        <input
          aria-label="Pesquisar"
          placeholder="Pesquisar no closet"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
        <button className="filter-toggle" onClick={() => setShowFilters((value) => !value)}>
          <Filter size={17} /> Filtros
        </button>
      </div>
      <div className="filter-row">
        {["Todas", ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={filters.category === c ? "selected" : ""}
            onClick={() => setFilter("category", c)}
          >
            {c}
          </button>
        ))}
      </div>
      {showFilters && (
        <div className="advanced-filters">
          <label>
            Marca
            <select value={filters.brand} onChange={(e) => setFilter("brand", e.target.value)}>
              <option>Todas</option>
              {uniqueValues(items, "brand").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Cor
            <select value={filters.color} onChange={(e) => setFilter("color", e.target.value)}>
              <option>Todas</option>
              {uniqueValues(items, "color").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Tamanho
            <select value={filters.size} onChange={(e) => setFilter("size", e.target.value)}>
              <option>Todos</option>
              {uniqueValues(items, "size").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Estação
            <select value={filters.season} onChange={(e) => setFilter("season", e.target.value)}>
              <option>Todas</option>
              {uniqueValues(items, "season").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Ocasião
            <select
              value={filters.occasion}
              onChange={(e) => setFilter("occasion", e.target.value)}
            >
              <option>Todas</option>
              {uniqueValues(items, "occasion").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Ordenar
            <select
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value as typeof filters.sort)}
            >
              <option value="newest">Mais recentes</option>
              <option value="name">Nome A–Z</option>
              <option value="most-used">Mais usadas</option>
              <option value="least-used">Menos usadas</option>
            </select>
          </label>
          <label className="check-filter">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(e) => setFilter("favoritesOnly", e.target.checked)}
            />{" "}
            Apenas favoritas
          </label>
          <button className="secondary" onClick={() => setFilters(DEFAULT_CLOSET_FILTERS)}>
            <RotateCcw size={15} /> Limpar
          </button>
        </div>
      )}
      {isLoading ? (
        <p>Carregando...</p>
      ) : filtered.length ? (
        <div className="closet-grid">
          {result.items.map((i) => (
            <article className="closet-piece" key={i.id}>
              <button
                className="piece-main"
                onClick={() => {
                  setEdit(i);
                  setOpen(true);
                }}
              >
                <SignedImage bucket="clothing" path={i.image_url} alt={i.name} />
                <div>
                  <h3>{i.name}</h3>
                  <p>{i.color || i.category}</p>
                </div>
              </button>
              <button
                className="favorite-button"
                aria-label="Favoritar"
                onClick={() =>
                  fav.mutate(
                    { id: i.id, isFavorite: !i.is_favorite },
                    { onError: () => toast.error("Não foi possível favoritar") },
                  )
                }
              >
                <Heart size={17} fill={i.is_favorite ? "currentColor" : "none"} />
              </button>
            </article>
          ))}
        </div>
      ) : items.length ? (
        <EmptyState
          title="Nenhuma peça encontrada"
          description="Ajuste ou limpe os filtros para ver outras peças."
          action={
            <button className="primary" onClick={() => setFilters(DEFAULT_CLOSET_FILTERS)}>
              <RotateCcw size={16} /> Limpar filtros
            </button>
          }
        />
      ) : (
        <EmptyState
          title="Seu closet está vazio"
          description="Adicione uma peça para começar."
          action={
            <button className="primary" onClick={() => setOpen(true)}>
              <Plus size={16} />
              Adicionar peça
            </button>
          }
        />
      )}
      {filtered.length > 12 && (
        <nav className="pagination" aria-label="Paginação">
          <button disabled={result.page === 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeft size={17} /> Anterior
          </button>
          <span>
            Página {result.page} de {result.totalPages}
          </span>
          <button
            disabled={result.page === result.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Próxima <ChevronRight size={17} />
          </button>
        </nav>
      )}{" "}
      {open && (
        <ClothingItemDialog
          item={edit}
          close={() => {
            setOpen(false);
            setEdit(undefined);
          }}
        />
      )}
    </AppShell>
  );
}
