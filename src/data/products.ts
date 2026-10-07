import crimson from "@/assets/product-crimson.jpg";
import emerald from "@/assets/product-emerald.jpg";
import ivory from "@/assets/product-ivory.jpg";
import indigo from "@/assets/product-indigo.jpg";
import weave from "@/assets/texture-weave.jpg";
import hero from "@/assets/hero-patola.jpg";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  currency: "INR";
  description: string;
  technique: "Double Ikat" | "Single Ikat";
  material: string;
  origin: string;
  motif: string;
  colors: string[];
  dimensions?: string;
  blousePiece?: string;
  images: string[];
  video?: string;
  availability: "in_stock" | "low_stock" | "sold_out";
  sku: string;
  certifications?: {
    silkMark?: boolean;
    giRelatedClaim?: boolean;
    handloomCertification?: boolean;
  };
  featured: boolean;
}

export const COLLECTIONS = [
  {
    slug: "royal-heritage",
    name: "Royal Heritage",
    label: "Royal Heritage",
    description:
      "Archival compositions drawn from court textiles — dense grids, ceremonial borders and disciplined alignment.",
  },
  {
    slug: "bridal",
    name: "Bridal",
    label: "Bridal",
    description:
      "Pieces intended for the wedding trousseau: deep crimson grounds, gold-rich borders and generous motif fields.",
  },
  {
    slug: "festive",
    name: "Festive",
    label: "Festive",
    description:
      "Lighter grounds and vivid motif play, woven for celebration days and family occasions.",
  },
  {
    slug: "contemporary",
    name: "Contemporary",
    label: "Contemporary",
    description:
      "Restrained fields, open negative space and modern colour pairings for present-day wardrobes.",
  },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];

const IMAGE_SETS: Record<string, string[]> = {
  crimson: [crimson, weave, hero],
  emerald: [emerald, weave, hero],
  ivory: [ivory, weave, hero],
  indigo: [indigo, weave, hero],
};

type Seed = {
  name: string;
  collection: CollectionSlug;
  price: number;
  technique: Product["technique"];
  motif: string;
  colors: string[];
  palette: keyof typeof IMAGE_SETS;
  availability: Product["availability"];
  featured?: boolean;
  description: string;
  certifications?: Product["certifications"];
};

const SEEDS: Seed[] = [
  {
    name: "Navratna Crimson",
    collection: "bridal",
    price: 185000,
    technique: "Double Ikat",
    motif: "Navratna Bhat",
    colors: ["Crimson", "Gold", "Ivory"],
    palette: "crimson",
    availability: "in_stock",
    featured: true,
    description:
      "A nine-jewel Navratna field woven in crimson with an ivory and gold motif structure. Both warp and weft are resist-dyed before weaving, so the pattern reads identically on either face.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Nari Kunj Emerald",
    collection: "royal-heritage",
    price: 212000,
    technique: "Double Ikat",
    motif: "Nari Kunj",
    colors: ["Emerald", "Gold", "Ivory"],
    palette: "emerald",
    availability: "low_stock",
    featured: true,
    description:
      "The Nari Kunj composition — figures within a garden grid — held in a deep emerald ground with a ceremonial gold border.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Phulwali Royale",
    collection: "royal-heritage",
    price: 168000,
    technique: "Double Ikat",
    motif: "Phulwali Bhat",
    colors: ["Maroon", "Gold", "Green"],
    palette: "crimson",
    availability: "in_stock",
    featured: true,
    description:
      "A flowering Phulwali field in maroon, ordered by a repeating diamond lattice and closed with a broad woven border.",
  },
  {
    name: "Kunjar Ruby",
    collection: "bridal",
    price: 246000,
    technique: "Double Ikat",
    motif: "Kunjar Bhat (elephant)",
    colors: ["Ruby", "Gold", "Ivory"],
    palette: "crimson",
    availability: "in_stock",
    featured: true,
    description:
      "Elephant motifs in procession across a ruby ground — one of the most demanding Patola alignments to achieve on the loom.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Chhabadi Ivory",
    collection: "contemporary",
    price: 128000,
    technique: "Single Ikat",
    motif: "Chhabadi Bhat (basket)",
    colors: ["Ivory", "Crimson", "Ochre"],
    palette: "ivory",
    availability: "in_stock",
    featured: true,
    description:
      "An open ivory field with basket motifs, drawn lighter for contemporary wear while keeping the traditional border language.",
  },
  {
    name: "Popat Indigo",
    collection: "festive",
    price: 152000,
    technique: "Double Ikat",
    motif: "Popat Kunj (parrot)",
    colors: ["Indigo", "Gold", "Green"],
    palette: "indigo",
    availability: "in_stock",
    featured: true,
    description:
      "Parrots set within an indigo lattice with gold cross-work — a festive composition with unusual depth of ground colour.",
  },
  {
    name: "Geometric Saffron",
    collection: "contemporary",
    price: 116000,
    technique: "Single Ikat",
    motif: "Geometric Bhat",
    colors: ["Saffron", "Ivory", "Brown"],
    palette: "ivory",
    availability: "in_stock",
    description:
      "A disciplined geometric repeat in saffron and ivory, with wide negative space and a narrow woven border.",
  },
  {
    name: "Heritage Crimson Gold",
    collection: "royal-heritage",
    price: 232000,
    technique: "Double Ikat",
    motif: "Ratanchowk",
    colors: ["Crimson", "Gold"],
    palette: "crimson",
    availability: "low_stock",
    description:
      "The Ratanchowk courtyard grid, woven with a heavy gold border and a tightly aligned crimson field.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Royal Emerald Ikat",
    collection: "royal-heritage",
    price: 198000,
    technique: "Double Ikat",
    motif: "Vohra Gaji Bhat",
    colors: ["Emerald", "Ivory", "Gold"],
    palette: "emerald",
    availability: "in_stock",
    description:
      "Vohra Gaji — historically woven for merchant families — interpreted in emerald with an ivory motif structure.",
  },
  {
    name: "Patan Ivory Crimson",
    collection: "bridal",
    price: 176000,
    technique: "Double Ikat",
    motif: "Paan Bhat",
    colors: ["Ivory", "Crimson", "Gold"],
    palette: "ivory",
    availability: "in_stock",
    description:
      "A pale ivory ground carrying a crimson leaf repeat, finished with an elephant border in the Patan manner.",
  },
  {
    name: "Rasleela Maroon",
    collection: "bridal",
    price: 268000,
    technique: "Double Ikat",
    motif: "Rasleela Bhat",
    colors: ["Maroon", "Gold", "Ivory"],
    palette: "crimson",
    availability: "low_stock",
    description:
      "A narrative Rasleela field — the most time-intensive composition in the atelier, requiring months of dyeing and weaving.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Chowkhandi Emerald",
    collection: "festive",
    price: 144000,
    technique: "Single Ikat",
    motif: "Chowkhandi Bhat",
    colors: ["Emerald", "Ochre", "Ivory"],
    palette: "emerald",
    availability: "in_stock",
    description:
      "A square-grid Chowkhandi repeat in emerald and ochre, balanced for daytime festive wear.",
  },
  {
    name: "Galdo Indigo Gold",
    collection: "contemporary",
    price: 138000,
    technique: "Single Ikat",
    motif: "Galdo Bhat",
    colors: ["Indigo", "Gold"],
    palette: "indigo",
    availability: "in_stock",
    description:
      "An indigo ground with a spare gold Galdo repeat, made for those who prefer quiet Patola.",
  },
  {
    name: "Pan Bhat Crimson",
    collection: "festive",
    price: 158000,
    technique: "Double Ikat",
    motif: "Paan Bhat",
    colors: ["Crimson", "Green", "Gold"],
    palette: "crimson",
    availability: "in_stock",
    description:
      "Betel-leaf motifs in a crimson field with green accents — a classic festive Patola vocabulary.",
  },
  {
    name: "Navratna Emerald",
    collection: "royal-heritage",
    price: 205000,
    technique: "Double Ikat",
    motif: "Navratna Bhat",
    colors: ["Emerald", "Crimson", "Ivory"],
    palette: "emerald",
    availability: "in_stock",
    description:
      "The Navratna grid in emerald, with crimson and ivory jewel blocks placed at each intersection.",
  },
  {
    name: "Fulvadi Ivory",
    collection: "contemporary",
    price: 112000,
    technique: "Single Ikat",
    motif: "Fulvadi Bhat",
    colors: ["Ivory", "Rose", "Gold"],
    palette: "ivory",
    availability: "in_stock",
    description:
      "A soft ivory ground with a small-scale flowering repeat — the lightest piece in the current selection.",
  },
  {
    name: "Kunjar Indigo",
    collection: "royal-heritage",
    price: 221000,
    technique: "Double Ikat",
    motif: "Kunjar Bhat (elephant)",
    colors: ["Indigo", "Ivory", "Gold"],
    palette: "indigo",
    availability: "low_stock",
    description:
      "Elephants in ivory against indigo, with the alignment held across the full width of the field.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Ratanchowk Crimson",
    collection: "bridal",
    price: 254000,
    technique: "Double Ikat",
    motif: "Ratanchowk",
    colors: ["Crimson", "Gold", "Emerald"],
    palette: "crimson",
    availability: "in_stock",
    description:
      "A bridal Ratanchowk with emerald corner-work and a deep gold border, woven for ceremonial wear.",
  },
  {
    name: "Chhabadi Emerald",
    collection: "festive",
    price: 149000,
    technique: "Single Ikat",
    motif: "Chhabadi Bhat (basket)",
    colors: ["Emerald", "Ivory", "Ochre"],
    palette: "emerald",
    availability: "in_stock",
    description:
      "Basket motifs arranged on an emerald ground with ivory outlines and a narrow ochre border.",
  },
  {
    name: "Popat Crimson",
    collection: "festive",
    price: 162000,
    technique: "Double Ikat",
    motif: "Popat Kunj (parrot)",
    colors: ["Crimson", "Green", "Ivory"],
    palette: "crimson",
    availability: "in_stock",
    description:
      "Parrot pairs in a crimson garden grid — a motif read as a blessing on new beginnings.",
  },
  {
    name: "Vohra Gaji Ivory",
    collection: "royal-heritage",
    price: 189000,
    technique: "Double Ikat",
    motif: "Vohra Gaji Bhat",
    colors: ["Ivory", "Maroon", "Gold"],
    palette: "ivory",
    availability: "in_stock",
    description:
      "The Vohra Gaji grid inverted onto an ivory ground, so the maroon motif structure carries the composition.",
  },
  {
    name: "Tarangi Indigo",
    collection: "contemporary",
    price: 124000,
    technique: "Single Ikat",
    motif: "Tarangi (wave)",
    colors: ["Indigo", "Ivory"],
    palette: "indigo",
    availability: "in_stock",
    description:
      "A wave repeat in indigo and ivory with no gold — the most modern reading of Patola in the selection.",
  },
  {
    name: "Bridal Crimson Heirloom",
    collection: "bridal",
    price: 296000,
    technique: "Double Ikat",
    motif: "Navratna & Kunjar",
    colors: ["Crimson", "Gold", "Emerald", "Ivory"],
    palette: "crimson",
    availability: "low_stock",
    featured: true,
    description:
      "The atelier's principal bridal piece, combining Navratna and Kunjar fields across a single length of silk.",
    certifications: { handloomCertification: true },
  },
  {
    name: "Festive Emerald Gold",
    collection: "festive",
    price: 171000,
    technique: "Double Ikat",
    motif: "Phulwali Bhat",
    colors: ["Emerald", "Gold"],
    palette: "emerald",
    availability: "in_stock",
    description:
      "An emerald flowering field with a gold border, woven at a weight suited to long festive days.",
  },
  {
    name: "Patan Indigo Heirloom",
    collection: "royal-heritage",
    price: 238000,
    technique: "Double Ikat",
    motif: "Rasleela Bhat",
    colors: ["Indigo", "Gold", "Ivory"],
    palette: "indigo",
    availability: "sold_out",
    description:
      "A Rasleela narrative in indigo. This piece is currently reserved; comparable weaves can be discussed with the concierge.",
    certifications: { handloomCertification: true },
  },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const PRODUCTS: Product[] = SEEDS.map((seed, index) => ({
  id: `ppa-${String(index + 1).padStart(3, "0")}`,
  slug: slugify(seed.name),
  name: seed.name,
  category: "Patola Saree",
  collection: seed.collection,
  price: seed.price,
  currency: "INR",
  description: seed.description,
  technique: seed.technique,
  material: "Handwoven silk, resist-dyed yarn",
  origin: "Patan, Gujarat",
  motif: seed.motif,
  colors: seed.colors,
  dimensions: "5.5 m length × 1.1 m width (approximate, handwoven)",
  blousePiece: "0.8 m unstitched blouse piece included",
  images: IMAGE_SETS[seed.palette]!,
  availability: seed.availability,
  sku: `PPA-${seed.technique === "Double Ikat" ? "DI" : "SI"}-${String(index + 1).padStart(3, "0")}`,
  certifications: seed.certifications ?? {},
  featured: seed.featured ?? false,
}));

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const featuredProducts = () => PRODUCTS.filter((p) => p.featured);
export const productsByCollection = (slug: string) =>
  PRODUCTS.filter((p) => p.collection === slug);

export const ALL_MOTIFS = Array.from(new Set(PRODUCTS.map((p) => p.motif))).sort();
export const ALL_COLORS = Array.from(new Set(PRODUCTS.flatMap((p) => p.colors))).sort();

export const AVAILABILITY_LABEL: Record<Product["availability"], string> = {
  in_stock: "Available",
  low_stock: "Last piece",
  sold_out: "Reserved",
};

export const collectionName = (slug: string) =>
  COLLECTIONS.find((c) => c.slug === slug)?.name ?? slug;
