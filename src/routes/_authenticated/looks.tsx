import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Heart, Plus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { SignedImage } from "@/components/SignedImage";
import { useAuth } from "@/hooks/useAuth";
import { useClothingItems, useCreateOutfit, useOutfits } from "@/lib/closet";
import { createOutfitCard, downloadBlob, safeLookFilename } from "@/lib/outfit-sharing";
import { getOutfitSlot } from "@/lib/outfit-layout";
export const Route = createFileRoute("/_authenticated/looks")({ component: Looks });
function Looks() {
  const { user } = useAuth();
  const { data: items = [] } = useClothingItems(user?.id);
  const { data: looks = [] } = useOutfits(user?.id);
  const create = useCreateOutfit(user?.id);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [sharingId, setSharingId] = useState<string>();
  const exportLook = async (look: (typeof looks)[number], share: boolean) => {
    setSharingId(look.id);
    try {
      const blob = await createOutfitCard(look);
      const filename = safeLookFilename(look.name);
      const file = new File([blob], filename, { type: "image/png" });
      if (share && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: look.name,
          text: "Meu look no Fiorella Closet AI",
          files: [file],
        });
      } else {
        downloadBlob(blob, filename);
        toast.success(share ? "Compartilhamento indisponível: imagem salva." : "Imagem salva.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Erro ao criar imagem");
    } finally {
      setSharingId(undefined);
    }
  };
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
                {l.items.slice(0, 6).map((i, index) => (
                  <div
                    className={`outfit-piece slot-${getOutfitSlot(i.category)} slot-index-${index}`}
                    key={i.id}
                  >
                    <SignedImage bucket="clothing" path={i.image_url} alt={i.name} />
                  </div>
                ))}
              </div>
              <h3>{l.name}</h3>
              <p>
                {l.items.length} peças · {l.usage_count} usos
              </p>
              <div className="outfit-actions">
                <Heart size={17} fill={l.is_favorite ? "currentColor" : "none"} />
                <button
                  disabled={sharingId === l.id}
                  onClick={() => exportLook(l, false)}
                  aria-label="Salvar look como imagem"
                >
                  <Download size={16} />
                </button>
                <button
                  disabled={sharingId === l.id}
                  onClick={() => exportLook(l, true)}
                  aria-label="Compartilhar look"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
