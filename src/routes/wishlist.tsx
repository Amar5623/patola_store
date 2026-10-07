import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";
import { useWishlist } from "@/store/wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist | Pragati Patola Art" },
      {
        name: "description",
        content: "Pieces you have saved from the Pragati Patola Art collection of handwoven Patola sarees.",
      },
      { property: "og:title", content: "Your Wishlist — Pragati Patola Art" },
      { property: "og:description", content: "Saved Patola pieces from the Patan atelier." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const saved = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <>
      <PageHeader
        eyebrow={`${saved.length} saved`}
        title="Your Wishlist"
        description="Saved pieces remain here on this device. Our concierge can hold a piece for a short period on request."
      />
      <div className="shell py-12 md:py-20">
        {saved.length === 0 ? (
          <div className="py-16 text-center">
            <div className="ikat-pattern mx-auto h-12 w-28" role="presentation" />
            <p className="font-display mt-8 text-2xl">Nothing saved yet</p>
            <p className="text-muted-foreground mt-3 text-sm">
              Tap the heart on any piece to keep it here while you decide.
            </p>
            <Button variant="atelier" size="auto" className="mt-8" asChild>
              <Link to="/shop">Explore the collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
