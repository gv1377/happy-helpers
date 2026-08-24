import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { AppShell, EmptyState } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useWearHistory } from "@/lib/closet";
export const Route = createFileRoute("/_authenticated/calendario")({ component: Page });
function Page() {
  const { user } = useAuth();
  const { data: history = [] } = useWearHistory(user?.id);
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">ACOMPANHE SEU ESTILO</p>
          <h1>Histórico</h1>
          <p className="muted">Tudo o que você vestiu, em um só lugar.</p>
        </div>
      </section>
      {history.length ? (
        <div className="history-list">
          {history.map((h) => (
            <article key={h.id}>
              <CalendarDays />
              <div>
                <b>{h.outfits?.name || h.clothing_items?.name || "Registro de uso"}</b>
                <span>
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
                    new Date(`${h.worn_on}T12:00:00`),
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum uso registrado"
          description="Quando você marcar uma peça ou look como usado, ele aparecerá aqui."
        />
      )}
    </AppShell>
  );
}
