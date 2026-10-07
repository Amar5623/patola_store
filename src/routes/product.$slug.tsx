import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, MessageCircle, Minus, Plus, ShieldCheck, Truck, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  AVAILABILITY_LABEL,
  PRODUCTS,
  collectionName,
  getProductBySlug,
} from "@/data/products";
import { formatINR } from "@/lib/format";
import { SHIPPING_COPY } from "@/lib/config";
import { whatsappProductLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { trackEvent } from "@/services/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Piece unavailable — Pragati Patola Art" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.technique} Patola Saree | Pragati Patola Art`;
    const description = product.description.slice(0, 180);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${product.name} — Pragati Patola Art` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCart((s) => s.addToCart);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const soldOut = product.availability === "sold_out";

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    trackEvent("product_view", { sku: product.sku, price: product.price });
  }, [product.sku, product.price]);

  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.collection === product.collection || p.motif === product.motif),
  ).slice(0, 4);

  const badges = [
    product.certifications?.silkMark && "Silk Mark certified",
    product.certifications?.handloomCertification && "Handloom certified",
    product.certifications?.giRelatedClaim && "GI related",
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="shell pt-28 pb-6 md:pt-36">
        <nav aria-label="Breadcrumb" className="label-micro text-muted-foreground">
          <Link to="/shop" className="link-underline">
            Collection
          </Link>
          <span className="mx-2">/</span>
          <Link
            to="/collections/$slug"
            params={{ slug: product.collection }}
            className="link-underline"
          >
            {collectionName(product.collection)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="shell grid gap-12 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        {/* Gallery */}
        <div>
          <div
            className={cn(
              "bg-cream relative aspect-[4/5] overflow-hidden",
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
            onClick={() => setZoomed((v) => !v)}
            role="button"
            tabIndex={0}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setZoomed((v) => !v);
              }
            }}
          >
            <img
              src={product.images[activeImage]}
              alt={`${product.name} — view ${activeImage + 1}`}
              width={1200}
              height={1500}
              className={cn(
                "h-full w-full object-cover transition-transform duration-700",
                zoomed && "scale-150",
              )}
            />
            <span className="bg-ivory/90 label-micro absolute right-4 bottom-4 flex items-center gap-2 px-3 py-2">
              <ZoomIn className="size-3.5" aria-hidden /> {zoomed ? "Zoomed" : "Tap to zoom"}
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={activeImage === index}
                className={cn(
                  "size-20 overflow-hidden border transition-colors md:size-24",
                  activeImage === index ? "border-primary" : "border-border",
                )}
              >
                <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="label-micro text-muted-foreground">
            {collectionName(product.collection)} · {product.technique}
          </p>
          <h1 className="mt-4 text-3xl leading-[1.05] md:text-5xl">{product.name}</h1>
          <p className="mt-5 text-xl tabular-nums">{formatINR(product.price)}</p>
          <p className="label-micro text-muted-foreground mt-2">
            {AVAILABILITY_LABEL[product.availability]} · SKU {product.sku}
          </p>

          <p className="mt-7 text-sm leading-[1.9] md:text-base">{product.description}</p>

          {badges.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {badges.map((badge) => (
                <li key={badge} className="bg-cream label-micro flex items-center gap-2 px-3 py-2">
                  <Check className="size-3.5" aria-hidden /> {badge}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-6 text-xs leading-[1.7]">
              Product-specific material and provenance details available on request.
            </p>
          )}

          {/* Quantity + actions */}
          <div className="mt-9 flex items-center gap-4">
            <div className="border-border flex items-center border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="min-w-10 text-center text-sm tabular-nums">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                className="px-4 py-3"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              className="border-border flex items-center gap-2 border px-4 py-3.5"
            >
              <Heart className={cn("size-4", wishlisted && "fill-crimson text-crimson")} aria-hidden />
              <span className="label-micro">{wishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <Button
              variant="atelier"
              size="auto"
              className="w-full"
              disabled={soldOut}
              onClick={() => addToCart(product, quantity)}
            >
              {soldOut ? "This piece is reserved" : "Add to bag"}
            </Button>
            <Button variant="concierge" size="auto" className="w-full" asChild>
              <a
                href={whatsappProductLink(product)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("whatsapp_click", { source: "pdp", sku: product.sku })}
              >
                <MessageCircle className="size-4" aria-hidden /> Buy via WhatsApp
              </a>
            </Button>
          </div>

          <div className="border-border text-muted-foreground mt-8 space-y-3 border-t pt-8 text-xs">
            <p className="flex items-center gap-2">
              <Truck className="size-4" aria-hidden /> {SHIPPING_COPY.free}
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden /> 2-day return and replacement window
              with unboxing video.
            </p>
          </div>

          {/* Specifications */}
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="specs">
              <AccordionTrigger className="label-small">Specifications</AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-3 text-sm">
                  <Spec label="Technique" value={product.technique} />
                  <Spec label="Motif" value={product.motif} />
                  <Spec label="Material" value={product.material} />
                  <Spec label="Origin" value={product.origin} />
                  <Spec label="Colours" value={product.colors.join(", ")} />
                  {product.dimensions && <Spec label="Dimensions" value={product.dimensions} />}
                  {product.blousePiece && <Spec label="Blouse piece" value={product.blousePiece} />}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="label-small">Care</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-[1.9]">
                Dry clean only. Store folded in muslin away from direct light, and refold along new
                lines once a year to protect the silk at the creases.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger className="label-small">Returns & replacement</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-[1.9]">
                Defect-related returns are accepted within 2 days of delivery, supported by an
                unopened-parcel unboxing video.{" "}
                <Link to="/policies/$slug" params={{ slug: "returns" }} className="text-primary link-underline">
                  Read the full policy
                </Link>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* PDP story */}
      <section className="bg-cream/60 section-y">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="label-micro text-muted-foreground">The piece</p>
            <h2 className="mt-4 text-3xl leading-[1.1] md:text-4xl">
              Why {product.motif} is woven this way
            </h2>
          </div>
          <div className="text-muted-foreground space-y-5 text-sm leading-[1.9] md:text-base">
            <p>
              The {product.motif} field is set out before any weaving begins. Yarn is grouped,
              bound and dyed in sequence so that when the loom is dressed, the motif already exists
              inside the thread.
            </p>
            <p>
              On the loom, each pass is adjusted by hand until warp and weft register precisely.
              Small variations in outline are inherent to the process — they are the signature of a
              handwoven piece rather than a flaw.
            </p>
            <Link to="/story" className="label-small text-primary link-underline inline-block">
              The story of Patola →
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y">
          <div className="shell">
            <h2 className="text-2xl md:text-3xl">Consider alongside</h2>
            <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex flex-wrap justify-between gap-4 border-b pb-3">
      <dt className="label-micro text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
