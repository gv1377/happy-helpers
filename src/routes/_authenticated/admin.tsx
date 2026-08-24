import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw redirect({ to: "/auth" });
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single();
    if (profile?.role !== "superadmin") throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

const managedTables = [
  "clothing_items",
  "outfits",
  "wear_history",
  "wishlist",
  "events",
  "trips",
] as const;

function AdminPage() {
  const queryClient = useQueryClient();
  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,display_name,full_name,role,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const counts = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () =>
      Object.fromEntries(
        await Promise.all(
          managedTables.map(async (table) => {
            const { count, error } = await supabase
              .from(table)
              .select("id", { count: "exact", head: true });
            if (error) throw error;
            return [table, count ?? 0] as const;
          }),
        ),
      ) as Record<(typeof managedTables)[number], number>,
  });
  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
      toast.success("Permissão atualizada.");
    },
  });

  return (
    <AppShell>
      <section className="intro">
        <div>
          <p className="eyebrow">ACESSO RESTRITO</p>
          <h1>Administração</h1>
          <p className="muted">Visão geral e permissões do Fiorella.</p>
        </div>
        <div className="round-button">
          <ShieldCheck size={21} />
        </div>
      </section>
      <div className="stats-grid">
        <article>
          <b>{profiles.data?.length ?? 0}</b>
          <span>usuários</span>
        </article>
        <article>
          <b>{counts.data?.clothing_items ?? 0}</b>
          <span>peças</span>
        </article>
        <article>
          <b>{counts.data?.outfits ?? 0}</b>
          <span>looks</span>
        </article>
        <article>
          <b>{counts.data?.wear_history ?? 0}</b>
          <span>registros de uso</span>
        </article>
      </div>
      <section className="section-head">
        <div>
          <p className="eyebrow">CONTROLE DE ACESSO</p>
          <h2>Usuários</h2>
        </div>
      </section>
      <div className="admin-users">
        {profiles.data?.map((profile) => (
          <article key={profile.id}>
            <div>
              <b>{profile.display_name || profile.full_name || "Usuário"}</b>
              <span>{profile.id}</span>
            </div>
            <select
              value={profile.role}
              onChange={(event) => changeRole.mutate({ id: profile.id, role: event.target.value })}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
