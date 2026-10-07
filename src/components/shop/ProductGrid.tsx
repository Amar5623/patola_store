import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { QuickViewDialog } from "./QuickViewDialog";
import {
  ALL_COLORS,
  ALL_MOTIFS,
  COLLECTIONS,
  type Product,
} from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
type SignatureFilter = "all" | "double" | "single" | "silk-mark" | "festive";

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Alphabetical" },
];

const PRICE_BANDS = [
  { label: "Under ₹1,50,000", min: 0, max: 150000 },
  { label: "₹1,50,000 – ₹2,00,000", min: 150000, max: 200000 },
  { label: "₹2,00,000 – ₹2,50,000", min: 200000, max: 250000 },
  { label: "Above ₹2,50,000", min: 250000, max: Number.MAX_SAFE_INTEGER },
];

export function ProductGrid({
  products,
  showCollectionFilter = true,
}: {
  products: Product[];
  showCollectionFilter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [signatureFilter, setSignatureFilter] = useState<SignatureFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [motifs, setMotifs] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const activeCount =
    techniques.length +
    collections.length +
    colors.length +
    motifs.length +
    bands.length +
    (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setTechniques([]);
    setCollections([]);
    setColors([]);
    setMotifs([]);
    setBands([]);
    setInStockOnly(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((product) => {
      if (signatureFilter === "double" && product.technique !== "Double Ikat") return false;
      if (signatureFilter === "single" && product.technique !== "Single Ikat") return false;
      if (signatureFilter === "silk-mark" && !product.certifications?.silkMark) return false;
      if (signatureFilter === "festive" && product.collection !== "festive") return false;
      if (techniques.length && !techniques.includes(product.technique)) return false;
      if (collections.length && !collections.includes(product.collection)) return false;
      if (colors.length && !product.colors.some((c) => colors.includes(c))) return false;
      if (motifs.length && !motifs.includes(product.motif)) return false;
      if (inStockOnly && product.availability === "sold_out") return false;
      if (bands.length) {
        const match = PRICE_BANDS.filter((b) => bands.includes(b.label)).some(
          (b) => product.price >= b.min && product.price < b.max,
        );
        if (!match) return false;
      }
      if (q) {
        const haystack = [product.name, product.motif, product.technique, ...product.colors]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });

    return list;
  }, [products, query, sort, signatureFilter, techniques, collections, colors, motifs, bands, inStockOnly]);

  return (
    <div className="shell py-12 md:py-16">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Featured catalog filters">
        {([
          ["all", "All Pieces"],
          ["double", "Double Ikat"],
          ["single", "Single Ikat"],
          ["silk-mark", "Silk Mark"],
          ["festive", "Festive"],
        ] as const).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={signatureFilter === value ? "atelier" : "atelierOutline"}
            size="auto"
            className="shrink-0 px-4 py-2.5"
            aria-pressed={signatureFilter === value}
            onClick={() => setSignatureFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      {/* Controls */}
      <div className="border-border flex flex-wrap items-center gap-4 border-b pb-5">
        <Button
          type="button"
          variant="atelierOutline"
          size="auto"
          className="px-5 py-3"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="size-4" aria-hidden /> Filter
          {activeCount > 0 && ` (${activeCount})`}
        </Button>

        <label className="relative flex-1 min-w-[200px]">
          <span className="sr-only">Search pieces</span>
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
            placeholder="Search this selection"
            className="border-border focus-visible:ring-ring w-full border bg-transparent py-3 pr-4 pl-10 text-sm outline-none focus-visible:ring-1"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Sort pieces</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border-border label-micro appearance-none border bg-transparent py-3.5 pr-10 pl-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            aria-hidden
          />
        </label>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="border-border animate-fade-up grid gap-8 border-b py-8 md:grid-cols-3 lg:grid-cols-5">
          <FilterGroup title="Technique">
            {["Double Ikat", "Single Ikat"].map((value) => (
              <FilterCheck
                key={value}
                label={value}
                checked={techniques.includes(value)}
                onChange={() => toggle(techniques, setTechniques, value)}
              />
            ))}
          </FilterGroup>

          {showCollectionFilter && (
            <FilterGroup title="Collection">
              {COLLECTIONS.map((collection) => (
                <FilterCheck
                  key={collection.slug}
                  label={collection.name}
                  checked={collections.includes(collection.slug)}
                  onChange={() => toggle(collections, setCollections, collection.slug)}
                />
              ))}
            </FilterGroup>
          )}

          <FilterGroup title="Colour">
            {ALL_COLORS.map((color) => (
              <FilterCheck
                key={color}
                label={color}
                checked={colors.includes(color)}
                onChange={() => toggle(colors, setColors, color)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Motif">
            {ALL_MOTIFS.map((motif) => (
              <FilterCheck
                key={motif}
                label={motif}
                checked={motifs.includes(motif)}
                onChange={() => toggle(motifs, setMotifs, motif)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Price & availability">
            {PRICE_BANDS.map((band) => (
              <FilterCheck
                key={band.label}
                label={band.label}
                checked={bands.includes(band.label)}
                onChange={() => toggle(bands, setBands, band.label)}
              />
            ))}
            <FilterCheck
              label="Available only"
              checked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
            />
          </FilterGroup>
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 py-5">
          {[...techniques, ...collections, ...colors, ...motifs, ...bands].map((chip) => (
            <span key={chip} className="bg-cream label-micro flex items-center gap-2 px-3 py-1.5">
              {chip}
            </span>
          ))}
          <button type="button" onClick={clearAll} className="label-micro text-primary flex items-center gap-1">
            <X className="size-3.5" aria-hidden /> Clear all
          </button>
        </div>
      )}

      <p className="label-micro text-muted-foreground py-8">
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        {filtered.length > 0 && (
          <>
            {" · from "}
            {formatINR(Math.min(...filtered.map((p) => p.price)))}
          </>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="ikat-pattern mx-auto h-12 w-28" role="presentation" />
          <p className="font-display mt-8 text-2xl">No pieces match these filters</p>
          <p className="text-muted-foreground mt-3 text-sm">
            {signatureFilter === "silk-mark"
              ? "No Silk Mark certification is currently recorded for this selection. Ask our concierge for verified documentation."
              : "Relax a filter, or ask our concierge to source a comparable weave."}
          </p>
          <Button variant="atelierOutline" size="auto" className="mt-8" onClick={() => { clearAll(); setSignatureFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
          ))}
        </div>
      )}

      <QuickViewDialog product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="label-micro text-muted-foreground">{title}</legend>
      <div className="mt-4 space-y-2.5">{children}</div>
    </fieldset>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="border-border accent-primary size-4 border"
      />
      <span className={cn(checked && "text-primary")}>{label}</span>
    </label>
  );
}
