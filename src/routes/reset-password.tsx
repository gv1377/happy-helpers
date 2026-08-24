import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Fiorella" },
      { name: "description", content: "Defina uma nova senha para sua conta Fiorella." },
      { property: "og:title", content: "Redefinir senha — Fiorella" },
      { property: "og:description", content: "Defina uma nova senha para sua conta Fiorella." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada.");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar a senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark">F</span>fiorella
        </div>
        <h1>Nova senha</h1>
        <p className="muted">Escolha uma senha com pelo menos 6 caracteres.</p>
        <form onSubmit={onSubmit} className="sheet-form">
          <label className="field">
            <span>Nova senha</span>
            <input name="password" type="password" minLength={6} required autoComplete="new-password" />
          </label>
          <label className="field">
            <span>Confirmar senha</span>
            <input name="confirm" type="password" minLength={6} required autoComplete="new-password" />
          </label>
          <button className="primary full" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
