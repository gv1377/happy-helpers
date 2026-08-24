import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Shirt, Sparkles } from "lucide-react";
import { AppShell, EmptyState } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useClosetStats, useProfile, useRecentlyWornItems } from "@/lib/closet";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });
function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: stats } = useClosetStats(user?.id);
  const { data: recent = [] } = useRecentlyWornItems(user?.id);
  const name = (profile?.display_name || profile?.full_name || "você").split(" ")[0];
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">BOM DIA, {name.toUpperCase()}</p>
          <h1>Vista-se do seu jeito.</h1>
          <p className="muted">Seu closet, organizado com intenção.</p>
        </div>
        <Link className="round-button" to="/closet">
          <Plus size={21} />
        </Link>
      </section>
      <section className="ai-hero">
        <div>
          <div className="ai-orb">
            <Sparkles />
          </div>
          <div className="ai-copy">
            <p className="eyebrow">FIORELLA AI</p>
            <h2>Seu assistente está a caminho</h2>
            <p>As sugestões serão liberadas quando uma integração de IA real for configurada.</p>
          </div>
        </div>
      </section>
      <div className="stats-grid">
        <article>
          <b>{stats?.totalItems ?? 0}</b>
          <span>peças</span>
        </article>
        <article>
          <b>{stats?.totalOutfits ?? 0}</b>
          <span>looks</span>
        </article>
        <article>
          <b>{stats?.wearsThisMonth ?? 0}</b>
          <span>usos este mês</span>
        </article>
        <article>
          <b>{stats?.favorites ?? 0}</b>
          <span>favoritos</span>
        </article>
      </div>
      <section className="section-head">
        <div>
          <p className="eyebrow">SEU CLOSET</p>
          <h2>Usadas recentemente</h2>
        </div>
        <Link to="/closet">Ver todas</Link>
      </section>
      {recent.length ? (
        <div className="recent-grid">
          {recent.map((i) => (
            <article className="piece-card" key={i.id}>
              <div className="piece-image">
                <SignedImage bucket="clothing" path={i.image_url} alt={i.name} />
              </div>
              <h3>{i.name}</h3>
              <p>{i.usage_count} usos</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Seu closet está vazio"
          description="Sua primeira combinação começa com a primeira peça."
          action={
            <Link className="primary" to="/closet">
              <Shirt size={16} />
              Adicionar peça
            </Link>
          }
        />
      )}
    </AppShell>
  );
}
