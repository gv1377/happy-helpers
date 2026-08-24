import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrganizerRow, useDeleteOrganizerRow, useOrganizerRows } from "@/lib/organizer";

type TableName = "wishlist" | "collections" | "events" | "trips";
type Field = { name: string; label: string; type?: string; required?: boolean };

export function OrganizerModule({
  table,
  eyebrow,
  title,
  description,
  emptyTitle,
  fields,
  describe,
}: {
  table: TableName;
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  fields: Field[];
  describe: (row: Record<string, unknown>) => string;
}) {
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useOrganizerRows<Record<string, unknown>>(table, user?.id);
  const create = useCreateOrganizerRow(table, user?.id);
  const remove = useDeleteOrganizerRow(table, user?.id);
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      fields.map(({ name, type }) => {
        const value = String(form.get(name) ?? "").trim();
        return [name, type === "number" && value ? Number(value) : value || null];
      }),
    );
    try {
      await create.mutateAsync(values);
      toast.success(`${title}: item adicionado.`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  }

  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        <button className="round-button" onClick={() => setOpen(true)} aria-label="Adicionar">
          <Plus size={21} />
        </button>
      </section>
      {isLoading ? (
        <p>Carregando...</p>
      ) : rows.length ? (
        <div className="module-grid">
          {rows.map((row) => (
            <article className="module-card" key={String(row.id)}>
              <div>
                <h3>{String(row.name ?? row.destination ?? "Item")}</h3>
                <p>{describe(row)}</p>
              </div>
              <button
                aria-label="Excluir"
                onClick={() =>
                  remove.mutate(String(row.id), {
                    onSuccess: () => toast.success("Item removido."),
                    onError: () => toast.error("Não foi possível remover."),
                  })
                }
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={description}
          action={
            <button className="primary" onClick={() => setOpen(true)}>
              <Plus size={16} /> Adicionar
            </button>
          }
        />
      )}
      {open && (
        <div className="overlay" onMouseDown={() => setOpen(false)}>
          <section className="add-sheet" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="close" onClick={() => setOpen(false)} aria-label="Fechar">
              ×
            </button>
            <p className="eyebrow">NOVO ITEM</p>
            <h2>{title}</h2>
            <form className="sheet-form" onSubmit={submit}>
              {fields.map((field) => (
                <label className="field" key={field.name}>
                  <span>{field.label}</span>
                  <input name={field.name} type={field.type ?? "text"} required={field.required} />
                </label>
              ))}
              <button className="primary full" disabled={create.isPending}>
                Salvar
              </button>
            </form>
          </section>
        </div>
      )}
    </AppShell>
  );
}
