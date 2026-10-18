import { Link } from "@tanstack/react-router";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { AVAILABILITY_LABEL, collectionName, type Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappProductLink } from "@/lib/whatsapp";

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
}) {
  const addToCart = useCart((s) => s.addToCart);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const soldOut = product.availability === "sold_out";

  return (
    <article className="group relative">
      <div className="hover-zoom-media bg-cream relative aspect-[4/5]">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={1200}
            height={1500}
            className="h-full w-full object-cover"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          aria-pressed={wishlisted}
          className="bg-ivory/90 absolute top-3 right-3 flex size-9 items-center justify-center rounded-full transition-colors"
        >
          <Heart className={cn("size-4", wishlisted && "fill-crimson text-crimson")} aria-hidden />
        </button>

        {product.availability !== "in_stock" && (
          <span className="bg-ivory/90 label-micro absolute top-3 left-3 px-3 py-1.5">
            {AVAILABILITY_LABEL[product.availability]}
          </span>
        )}

        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition-opacity duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100">
          {onQuickView && (
            <Button
              type="button"
              variant="onImage"
              size="auto"
              className="bg-ivory/90 text-charcoal border-transparent flex-1 px-3 py-3"
              onClick={() => onQuickView(product)}
            >
              <Eye className="size-4" aria-hidden /> Quick view
            </Button>
          )}
          <Button
            type="button"
            variant="atelier"
            size="auto"
            className="flex-1 px-3 py-3"
            disabled={soldOut}
            onClick={() => addToCart(product)}
          >
            {soldOut ? "Reserved" : "Add to bag"}
          </Button>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg leading-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm tabular-nums">{formatINR(product.price)}</p>
        </div>
        <p className="label-micro text-muted-foreground mt-2">
          {collectionName(product.collection)} · {product.technique}
        </p>
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-[1.7]">
          {product.motif} — {product.description}
        </p>
        <a
          href={whatsappProductLink(product)}
          target="_blank"
          rel="noreferrer"
          className="label-micro text-emerald-deep mt-4 inline-flex items-center gap-2"
        >
          <MessageCircle className="size-4" aria-hidden /> Buy via WhatsApp
        </a>
      </div>
    </article>
  );
}
