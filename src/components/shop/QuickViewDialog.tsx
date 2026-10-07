import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { collectionName, type Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { whatsappProductLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";

export function QuickViewDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const addToCart = useCart((s) => s.addToCart);

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-ivory max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-none">
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="bg-cream aspect-[4/5]">
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8">
              <p className="label-micro text-muted-foreground">
                {collectionName(product.collection)}
              </p>
              <DialogTitle className="font-display mt-3 text-3xl leading-tight">
                {product.name}
              </DialogTitle>
              <p className="mt-3 text-lg tabular-nums">{formatINR(product.price)}</p>
              <DialogDescription className="mt-5 text-sm leading-[1.8]">
                {product.description}
              </DialogDescription>
              <dl className="mt-6 space-y-2 text-sm">
                <Row label="Technique" value={product.technique} />
                <Row label="Motif" value={product.motif} />
                <Row label="Origin" value={product.origin} />
                <Row label="SKU" value={product.sku} />
              </dl>
              <div className="mt-8 space-y-3">
                <Button
                  variant="atelier"
                  size="auto"
                  className="w-full"
                  disabled={product.availability === "sold_out"}
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                >
                  {product.availability === "sold_out" ? "Reserved" : "Add to bag"}
                </Button>
                <Button variant="atelierOutline" size="auto" className="w-full" asChild>
                  <Link to="/product/$slug" params={{ slug: product.slug }}>
                    View full details
                  </Link>
                </Button>
                <Button variant="concierge" size="auto" className="w-full" asChild>
                  <a
                    href={whatsappProductLink(product)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden /> Buy via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between gap-4 border-b pb-2">
      <dt className="label-micro text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
