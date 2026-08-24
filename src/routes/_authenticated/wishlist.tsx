import { createFileRoute } from "@tanstack/react-router";
import { OrganizerModule } from "@/components/OrganizerModule";
export const Route = createFileRoute("/_authenticated/wishlist")({ component: Page });
function Page() {
  return (
    <OrganizerModule
      table="wishlist"
      eyebrow="PRÓXIMAS ESCOLHAS"
      title="Lista de desejos"
      description="Organize compras que realmente combinam com o seu closet."
      emptyTitle="Nenhum desejo salvo"
      fields={[
        { name: "name", label: "Nome", required: true },
        { name: "category", label: "Categoria" },
        { name: "brand", label: "Marca" },
        { name: "price", label: "Preço", type: "number" },
        { name: "store_url", label: "Link da loja", type: "url" },
      ]}
      describe={(row) =>
        [row.category, row.brand, row.price ? `R$ ${row.price}` : null].filter(Boolean).join(" · ")
      }
    />
  );
}
