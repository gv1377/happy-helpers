import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar na Fiorella — seu closet inteligente" },
      {
        name: "description",
        content:
          "Acesse sua conta Fiorella para organizar seu guarda-roupa, montar looks e acompanhar o que você usa.",
      },
      { property: "og:title", content: "Entrar na Fiorella" },
      {
        property: "og:description",
        content: "Acesse seu closet digital e monte looks com o que você já tem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, authLoading, navigate]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        const fullName = String(form.get("full_name") ?? "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, display_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(email);
          return;
        }
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand">
            <span className="brand-mark">F</span>fiorella
          </div>
          <h1>Confirme seu e-mail</h1>
          <p className="muted">
            Enviamos um link de confirmação para <b>{emailSent}</b>. Clique nele para ativar sua
            conta e começar a montar seu closet.
          </p>
          <button className="primary full" onClick={() => setEmailSent(null)} type="button">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark">F</span>fiorella
        </div>
        <p className="brand-caption auth-caption">YOUR INTELLIGENT CLOSET</p>
        <h1>
          {mode === "signin" ? "Bem-vinda de volta" : mode === "signup" ? "Criar conta" : "Recuperar acesso"}
        </h1>
        <p className="muted">
          {mode === "forgot"
            ? "Informe seu e-mail e enviaremos um link para redefinir a senha."
            : "Seu guarda-roupa, organizado do seu jeito."}
        </p>

        <form onSubmit={onSubmit} className="sheet-form">
          {mode === "signup" && (
            <label className="field">
              <span>Nome</span>
              <input name="full_name" autoComplete="name" required />
            </label>
          )}
          <label className="field">
            <span>E-mail</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          {mode !== "forgot" && (
            <label className="field">
              <span>Senha</span>
              <input
                name="password"
                type="password"
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
              />
            </label>
          )}
          <button className="primary full" type="submit" disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "signin"
                ? "Entrar"
                : mode === "signup"
                  ? "Criar conta"
                  : "Enviar link"}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "signin" && (
            <button type="button" onClick={() => setMode("signin")}>
              Já tenho conta
            </button>
          )}
          {mode !== "signup" && (
            <button type="button" onClick={() => setMode("signup")}>
              Criar uma conta
            </button>
          )}
          {mode === "signin" && (
            <button type="button" onClick={() => setMode("forgot")}>
              Esqueci minha senha
            </button>
          )}
        </div>
        <Link to="/" className="auth-back">
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
