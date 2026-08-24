import { createFileRoute } from "@tanstack/react-router";
import { OrganizerModule } from "@/components/OrganizerModule";
export const Route = createFileRoute("/_authenticated/viagens")({ component: Page });
function Page() {
  return (
    <OrganizerModule
      table="trips"
      eyebrow="MALA DIGITAL"
      title="Viagens"
      description="Planeje sua mala com as peças que você já possui."
      emptyTitle="Nenhuma viagem planejada"
      fields={[
        { name: "destination", label: "Destino", required: true },
        { name: "start_date", label: "Data de ida", type: "date", required: true },
        { name: "end_date", label: "Data de volta", type: "date", required: true },
        { name: "trip_type", label: "Tipo de viagem" },
      ]}
      describe={(row) => [row.start_date, row.end_date, row.trip_type].filter(Boolean).join(" → ")}
    />
  );
}
