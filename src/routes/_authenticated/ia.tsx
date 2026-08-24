import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
export const Route = createFileRoute("/_authenticated/ia")({ component: Page });
function Page() {
  return (
    <AppShell>
      <section className="ai-page">
        <div className="ai-page-title">
          <div className="ai-orb">
            <Sparkles />
          </div>
          <div>
            <p className="eyebrow">SEU ASSISTENTE DE ESTILO</p>
            <h1>Fiorella AI</h1>
          </div>
        </div>
        <div className="chat">
          <div className="chat-bubble">
            <span className="bubble-icon">
              <Sparkles size={15} />
            </span>
            <div>
              <b>Integração ainda não configurada</b>
              <p>
                Para proteger seus dados, a Fiorella não gera sugestões falsas. Quando uma API de IA
                segura estiver conectada, ela usará somente as peças reais do seu closet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
