import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { COLLECTIONS, productsByCollection } from "@/data/products";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Royal Heritage, Bridal, Festive, Contemporary | Pragati Patola Art" },
      {
        name: "description",
        content:
          "Four houses of Patola: Royal Heritage, Bridal, Festive and Contemporary. Explore handwoven pieces grouped by intent and composition.",
      },
      { property: "og:title", content: "Patola Collections — Pragati Patola Art" },
      {
        property: "og:description",
        content: "Royal Heritage, Bridal, Festive and Contemporary Patola, woven in Patan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Collections"
        title="Four houses of Patola"
        description="Pieces are grouped by the occasion they were woven for, and by the density of their motif fields."
      />
      <div className="shell py-12 md:py-20">
        <div className="grid gap-px md:grid-cols-2">
          {COLLECTIONS.map((collection) => {
            const pieces = productsByCollection(collection.slug);
            const cover = pieces[0]?.images[0];
            return (
              <Link
                key={collection.slug}
                to="/collections/$slug"
                params={{ slug: collection.slug }}
                className="group bg-cream/50 hover-zoom-media relative block"
              >
                <div className="aspect-[4/3]">
                  {cover && (
                    <img
                      src={cover}
                      alt={`${collection.name} Patola`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="bg-ivory p-8">
                  <p className="label-micro text-muted-foreground">{pieces.length} pieces</p>
                  <h2 className="font-display mt-3 text-2xl md:text-3xl">{collection.name}</h2>
                  <p className="text-muted-foreground mt-4 max-w-md text-sm leading-[1.8]">
                    {collection.description}
                  </p>
                  <span className="label-micro text-primary mt-6 inline-flex items-center gap-2">
                    View collection
                    <ArrowRight
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
