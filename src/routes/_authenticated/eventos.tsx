import { createFileRoute } from "@tanstack/react-router";
import { OrganizerModule } from "@/components/OrganizerModule";
export const Route = createFileRoute("/_authenticated/eventos")({ component: Page });
function Page() {
  return (
    <OrganizerModule
      table="events"
      eyebrow="AGENDA"
      title="Eventos"
      description="Planeje o look certo para cada compromisso."
      emptyTitle="Nenhum evento planejado"
      fields={[
        { name: "name", label: "Evento", required: true },
        { name: "event_date", label: "Data", type: "date", required: true },
        { name: "location", label: "Local" },
        { name: "dress_code", label: "Dress code" },
      ]}
      describe={(row) => [row.event_date, row.location, row.dress_code].filter(Boolean).join(" · ")}
    />
  );
}
