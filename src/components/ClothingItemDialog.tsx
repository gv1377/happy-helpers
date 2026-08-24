import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BUCKETS, uploadUserFile } from "@/lib/storage";
import {
  CATEGORIES,
  OCCASIONS,
  SEASONS,
  useSaveClothingItem,
  type ClothingItem,
} from "@/lib/closet";
import { useSignedUrl } from "@/components/SignedImage";

export function ClothingItemDialog({
  item,
  close,
}: {
  item?: ClothingItem | undefined;
  close: () => void;
}) {
  const { user } = useAuth();
  const save = useSaveClothingItem(user?.id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { data: existingUrl } = useSignedUrl(BUCKETS.clothing, item?.image_url);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      toast.error("Dê um nome à peça.");
      return;
    }
    setSaving(true);
    try {
      let imagePath = item?.image_url ?? null;
      if (file) imagePath = await uploadUserFile(BUCKETS.clothing, user.id, file);

      const priceRaw = String(form.get("price") ?? "").trim();
      await save.mutateAsync({
        ...(item ? { id: item.id } : {}),
        values: {
          name,
          category: String(form.get("category") ?? CATEGORIES[0]),
          color: emptyToNull(form.get("color")),
          brand: emptyToNull(form.get("brand")),
          size: emptyToNull(form.get("size")),
          material: emptyToNull(form.get("material")),
          season: emptyToNull(form.get("season")),
          occasion: emptyToNull(form.get("occasion")),
          notes: emptyToNull(form.get("notes")),
          price: priceRaw ? Number(priceRaw.replace(",", ".")) : null,
          image_url: imagePath,
        },
      });
      toast.success(item ? "Peça atualizada." : "Peça adicionada ao closet.");
      close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a peça.");
    } finally {
      setSaving(false);
    }
  }

  const shownImage = preview ?? existingUrl ?? null;

  return (
    <div className="overlay" onMouseDown={close}>
      <section className="add-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="close" onClick={close} type="button" aria-label="Fechar">
          ×
        </button>
        <p className="eyebrow">{item ? "EDITAR" : "NOVO NO SEU CLOSET"}</p>
        <h2>{item ? "Editar peça" : "Adicionar peça"}</h2>

        <form onSubmit={onSubmit} className="sheet-form">
          <label className="upload-area">
            {shownImage ? (
              <img src={shownImage} alt="Pré-visualização da peça" className="upload-preview" />
            ) : (
              <>
                <Plus size={26} />
                <b>Escolher uma foto</b>
                <span>JPG ou PNG, até 20MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setPreview(selected ? URL.createObjectURL(selected) : null);
              }}
            />
          </label>

          <div className="field-grid">
            <Field label="Nome">
              <input name="name" defaultValue={item?.name ?? ""} required />
            </Field>
            <Field label="Categoria">
              <select name="category" defaultValue={item?.category ?? CATEGORIES[0]}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Cor">
              <input name="color" defaultValue={item?.color ?? ""} />
            </Field>
            <Field label="Marca">
              <input name="brand" defaultValue={item?.brand ?? ""} />
            </Field>
            <Field label="Tamanho">
              <input name="size" defaultValue={item?.size ?? ""} />
            </Field>
            <Field label="Material">
              <input name="material" defaultValue={item?.material ?? ""} />
            </Field>
            <Field label="Estação">
              <select name="season" defaultValue={item?.season ?? ""}>
                <option value="">—</option>
                {SEASONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Ocasião">
              <select name="occasion" defaultValue={item?.occasion ?? ""}>
                <option value="">—</option>
                {OCCASIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Preço (R$)">
              <input name="price" inputMode="decimal" defaultValue={item?.price ?? ""} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea name="notes" rows={2} defaultValue={item?.notes ?? ""} />
          </Field>

          <button className="primary full" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar peça"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}
