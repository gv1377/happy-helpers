import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useClosetStats, useProfile, useUpdateProfile } from "@/lib/closet";
export const Route = createFileRoute("/_authenticated/perfil")({ component: Page });
function Page() {
  const { user } = useAuth();
  const { data: p } = useProfile(user?.id);
  const { data: s } = useClosetStats(user?.id);
  const update = useUpdateProfile(user?.id);
  const [name, setName] = useState<string>();
  const save = async () => {
    await update.mutateAsync({ display_name: name ?? p?.display_name });
    toast.success("Perfil atualizado.");
  };
  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">SOBRE VOCÊ</p>
          <h1>Meu estilo</h1>
          <p className="muted">Preferências e números do seu closet.</p>
        </div>
      </section>
      <div className="stats-grid">
        <article>
          <b>{s?.totalItems ?? 0}</b>
          <span>peças</span>
        </article>
        <article>
          <b>{s?.totalOutfits ?? 0}</b>
          <span>looks</span>
        </article>
        <article>
          <b>{s?.neverWorn ?? 0}</b>
          <span>nunca usadas</span>
        </article>
        <article>
          <b>{s?.favorites ?? 0}</b>
          <span>favoritas</span>
        </article>
      </div>
      <section className="profile-card">
        <label className="field">
          <span>Como quer ser chamada?</span>
          <input value={name ?? p?.display_name ?? ""} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>E-mail</span>
          <input value={user?.email ?? ""} disabled />
        </label>
        <button className="primary" onClick={save}>
          Salvar alterações
        </button>
      </section>
      <section className="section-head">
        <div>
          <p className="eyebrow">ORGANIZAR</p>
          <h2>Planejamento</h2>
        </div>
      </section>
      <div className="module-grid">
        <Link className="module-card" to="/wishlist">
          <div>
            <h3>Lista de desejos</h3>
            <p>Planeje suas próximas compras.</p>
          </div>
        </Link>
        <Link className="module-card" to="/colecoes">
          <div>
            <h3>Coleções</h3>
            <p>Agrupe peças por ocasião.</p>
          </div>
        </Link>
        <Link className="module-card" to="/eventos">
          <div>
            <h3>Eventos</h3>
            <p>Planeje o que vestir.</p>
          </div>
        </Link>
        <Link className="module-card" to="/viagens">
          <div>
            <h3>Viagens</h3>
            <p>Organize sua mala.</p>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
