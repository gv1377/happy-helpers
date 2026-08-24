import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/lib/closet";
const styles = [
  "Casual",
  "Social",
  "Minimalista",
  "Esportivo",
  "Clássico",
  "Elegante",
  "Moderno",
  "Romântico",
];
export const Route = createFileRoute("/_authenticated/onboarding")({ component: Page });
function Page() {
  const { user } = useAuth();
  const update = useUpdateProfile(user?.id);
  const nav = useNavigate();
  const [style, setStyle] = useState("");
  const finish = async () => {
    try {
      await update.mutateAsync({ preferred_style: style, onboarding_completed: true });
      nav({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Não foi possível salvar seu perfil.");
    }
  };
  return (
    <main className="onboarding-page">
      <div className="brand">
        <span className="brand-mark">F</span>fiorella
      </div>
      <section>
        <p className="eyebrow">BEM-VINDA À FIORELLA</p>
        <h1>Qual estilo combina mais com você?</h1>
        <p className="muted">Isso ajudará a personalizar sua experiência no futuro.</p>
        <div className="style-options">
          {styles.map((s) => (
            <button key={s} className={style === s ? "selected" : ""} onClick={() => setStyle(s)}>
              {s}
            </button>
          ))}
        </div>
        <button className="primary full" disabled={!style || update.isPending} onClick={finish}>
          Criar meu closet
        </button>
      </section>
    </main>
  );
}
