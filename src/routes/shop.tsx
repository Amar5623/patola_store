import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: `Patola Collection — ${PRODUCTS.length} Pieces | Pragati Patola Art` },
      {
        name: "description",
        content: `Browse ${PRODUCTS.length} Patola sarees and dupattas in double ikat, single ikat and semi ikat. Filter by technique, motif, colour and price, with concierge guidance on every piece.`,
      },
      { property: "og:title", content: "Patola Collection — Pragati Patola Art" },
      {
        property: "og:description",
        content: `${PRODUCTS.length} Patola sarees and dupattas in double ikat, single ikat and semi ikat.`,
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
        description="Double ikat, single ikat and semi ikat Patola sarees and dupattas in Malbari silk. Most compositions exist only once, so availability is limited."
      />
      <ProductGrid products={PRODUCTS} />
    </>
  );
}
