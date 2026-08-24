import { createFileRoute } from "@tanstack/react-router";
import { OrganizerModule } from "@/components/OrganizerModule";
export const Route = createFileRoute("/_authenticated/colecoes")({ component: Page });
function Page() {
  return (
    <OrganizerModule
      table="collections"
      eyebrow="PAINÉIS"
      title="Coleções"
      description="Agrupe peças por estilo, ocasião ou estação."
      emptyTitle="Nenhuma coleção criada"
      fields={[
        { name: "name", label: "Nome", required: true },
        { name: "description", label: "Descrição" },
      ]}
      describe={(row) => String(row.description || "Coleção pessoal")}
    />
  );
}
