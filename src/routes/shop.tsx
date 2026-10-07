import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Patola Collection — 25 Handwoven Pieces | Pragati Patola Art" },
      {
        name: "description",
        content:
          "Browse 25 handwoven Patola sarees from Patan. Filter by technique, collection, motif, colour and price, with concierge guidance on every piece.",
      },
      { property: "og:title", content: "Patola Collection — Pragati Patola Art" },
      {
        property: "og:description",
        content:
          "25 handwoven Patola sarees from Patan, Gujarat. Filter by technique, motif, colour and price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${PRODUCTS.length} pieces`}
        title="Patola Collection"
        description="Each piece is woven by hand in Patan, Gujarat. Availability is limited to what is on the loom — most compositions exist only once."
      />
      <ProductGrid products={PRODUCTS} />
    </>
  );
}
