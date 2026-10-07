import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { COLLECTIONS, productsByCollection } from "@/data/products";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = COLLECTIONS.find((c) => c.slug === params.slug);
    if (!collection) throw notFound();
    return { collection, products: productsByCollection(collection.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collection unavailable — Pragati Patola Art" }, { name: "robots", content: "noindex" }],
      };
    }
    const { collection, products } = loaderData;
    const title = `${collection.name} Patola — ${products.length} Pieces | Pragati Patola Art`;
    return {
      meta: [
        { title },
        { name: "description", content: collection.description },
        { property: "og:title", content: `${collection.name} Patola — Pragati Patola Art` },
        { property: "og:description", content: collection.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection, products } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow={`Collection · ${products.length} pieces`}
        title={collection.name}
        description={collection.description}
      />
      <ProductGrid products={products} showCollectionFilter={false} />
    </>
  );
}
