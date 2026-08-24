import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { SignedImage } from "@/components/SignedImage";
import { useAuth } from "@/hooks/useAuth";
import { useClothingItems, useCreateOutfit, useOutfits } from "@/lib/closet";
export const Route = createFileRoute("/_authenticated/looks")({ component: Looks });
function Looks() {
  const { user } = useAuth();
  const { data: items = [] } = useClothingItems(user?.id);
  const { data: looks = [] } = useOutfits(user?.id);
  const create = useCreateOutfit(user?.id);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const save = async () => {
    try {
      await create.mutateAsync({ name: name || "Meu look", itemIds: selected });
      setSelected([]);
      setName("");
      toast.success("Look salvo.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">COMBINAÇÕES</p>
          <h1>Criar look</h1>
          <p className="muted">Escolha até 6 peças do seu closet.</p>
        </div>
      </section>
      {items.length ? (
        <>
          <div className="look-builder">
            <input
              placeholder="Nome do look"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="selector-grid">
              {items.map((i) => (
                <button
                  key={i.id}
                  className={selected.includes(i.id) ? "selected" : ""}
                  onClick={() =>
                    setSelected((s) =>
                      s.includes(i.id)
                        ? s.filter((x) => x !== i.id)
                        : s.length < 6
                          ? [...s, i.id]
                          : s,
                    )
                  }
                >
                  <SignedImage bucket="clothing" path={i.image_url} alt={i.name} />
                  <span>{i.name}</span>
                </button>
              ))}
            </div>
            <button
              className="primary"
              disabled={!selected.length || create.isPending}
              onClick={save}
            >
              <Plus size={16} />
              Salvar look ({selected.length}/6)
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          title="Adicione peças primeiro"
          description="Você precisa de roupas no closet para montar um look."
        />
      )}
      <section className="section-head">
        <div>
          <p className="eyebrow">SALVOS</p>
          <h2>Seus looks</h2>
        </div>
      </section>
      {looks.length ? (
        <div className="outfit-grid">
          {looks.map((l) => (
            <article className="outfit-card" key={l.id}>
              <div className="outfit-images">
                {l.items.slice(0, 4).map((i) => (
                  <SignedImage key={i.id} bucket="clothing" path={i.image_url} alt={i.name} />
                ))}
              </div>
              <h3>{l.name}</h3>
              <p>
                {l.items.length} peças · {l.usage_count} usos
              </p>
              <Heart size={17} fill={l.is_favorite ? "currentColor" : "none"} />
            </article>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
