import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PRODUCTS, collectionName } from "@/data/products";
import { formatINR } from "@/lib/format";
import { trackEvent } from "@/services/analytics";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().slice(0, 80);
    if (q.length < 2) return [];
    return PRODUCTS.filter((p) =>
      [p.name, p.motif, p.technique, p.collection, ...p.colors].join(" ").toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
    >
      <DialogContent className="bg-ivory top-24 max-w-2xl translate-y-0 p-0 sm:rounded-none">
        <div className="border-border flex items-center gap-3 border-b px-6 py-5">
          <Search className="text-muted-foreground size-5" aria-hidden />
          <DialogTitle className="sr-only">Search the collection</DialogTitle>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 2) trackEvent("search", { query: e.target.value });
            }}
            maxLength={80}
            placeholder="Search by name, motif or colour"
            aria-label="Search the collection"
            className="placeholder:text-muted-foreground w-full bg-transparent text-base outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="text-muted-foreground px-6 py-10 text-sm">
              No pieces match that search. Our concierge can help you find something similar.
            </p>
          )}
          <ul>
            {results.map((product) => (
              <li key={product.id} className="border-border border-b last:border-0">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-cream/60 flex items-center gap-4 px-6 py-4 transition-colors"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    loading="lazy"
                    className="size-16 object-cover"
                  />
                  <span className="flex-1">
                    <span className="font-display block text-lg">{product.name}</span>
                    <span className="label-micro text-muted-foreground">
                      {collectionName(product.collection)} · {product.motif}
                    </span>
                  </span>
                  <span className="text-sm tabular-nums">{formatINR(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
