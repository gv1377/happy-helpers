import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, Search } from "lucide-react";
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
export const Route = createFileRoute("/_authenticated/closet")({ component: Closet });
function Closet() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ClothingItem>();
  const { data: items = [], isLoading } = useClothingItems(user?.id, { search: q, category: cat });
  const fav = useToggleItemFavorite(user?.id);
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">MEU GUARDA-ROUPA</p>
          <h1>Meu closet</h1>
          <p className="muted">{items.length} peças encontradas.</p>
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
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="filter-row">
        {["Todas", ...CATEGORIES].map((c) => (
          <button key={c} className={cat === c ? "selected" : ""} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : items.length ? (
        <div className="closet-grid">
          {items.map((i) => (
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
