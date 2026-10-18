/**
 * Product catalogue, from the client's brochure (PRagati patola art brochure.xlsx).
 * One photo per piece, stored in src/assets/products/<code>.jpg.
 * The SKU is the client's own product code, so Sheet rows match their brochure.
 */

const PHOTOS = import.meta.glob<string>("../assets/products/*.jpg", {
  eager: true,
  import: "default",
});

function photo(code: string) {
  const url = PHOTOS[`../assets/products/${code.toLowerCase()}.jpg`];
  if (!url) throw new Error(`Missing product photo for ${code}`);
  return url;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "Patola Saree" | "Patola Dupatta";
  collection: CollectionSlug;
  price: number;
  currency: "INR";
  description: string;
  technique: "Double Ikat" | "Single Ikat" | "Semi Ikat";
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

export const TECHNIQUES: Product["technique"][] = ["Double Ikat", "Single Ikat", "Semi Ikat"];

export const COLLECTIONS = [
  {
    slug: "double-ikat",
    name: "Double Ikat",
    label: "Double Ikat",
    description:
      "Patola in its truest form: warp and weft are both resist-dyed before weaving, so the pattern reads the same on either side. Sarees and dupattas.",
  },
  {
    slug: "single-ikat",
    name: "Single Ikat",
    label: "Single Ikat",
    description:
      "Patola where one set of threads carries the dyed pattern, finished here with rich golden jhari work.",
  },
  {
    slug: "semi-ikat",
    name: "Semi Ikat",
    label: "Semi Ikat",
    description:
      "Semi Patola sarees with classic Patola motifs (Navratna, Manek Chowk, elephant and parrot) at a more accessible price.",
  },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];

const TECHNIQUE_COLLECTION: Record<Product["technique"], CollectionSlug> = {
  "Double Ikat": "double-ikat",
  "Single Ikat": "single-ikat",
  "Semi Ikat": "semi-ikat",
};

type Seed = {
  code: string;
  name: string;
  category?: Product["category"];
  technique: Product["technique"];
  price: number;
  motif: string;
  colors: string[];
  description: string;
  featured?: boolean;
};

const SEEDS: Seed[] = [
  // Double Ikat
  {
    code: "P0001",
    name: "Deer Motif Double Ikat Dupatta",
    category: "Patola Dupatta",
    technique: "Double Ikat",
    price: 30999,
    motif: "Deer",
    colors: ["Red", "Multicolour"],
    description: "A pot dupatta in double ikat with a deer design across the field.",
    featured: true,
  },
  {
    code: "P0002",
    name: "Royal Blue Bird Double Ikat Saree",
    technique: "Double Ikat",
    price: 149000,
    motif: "Birds",
    colors: ["Blue", "Red"],
    description: "A double ikat Patola saree with bird motifs set in a royal blue grid.",
  },
  {
    code: "P0005",
    name: "Laheriya Sparrow and Flower Double Ikat Saree",
    technique: "Double Ikat",
    price: 165000,
    motif: "Laheriya",
    colors: ["Blue", "Multicolour"],
    description: "A double ikat saree in a Laheriya layout of sparrows and flowers.",
  },
  {
    code: "P0006",
    name: "Jhalar Matla Double Ikat Saree",
    technique: "Double Ikat",
    price: 130000,
    motif: "Jhalar Matla",
    colors: ["Maroon", "Multicolour"],
    description: "A double ikat saree in Jhalar Matla art, finished with a flower border.",
  },
  {
    code: "P0013",
    name: "Antique Purple Heritage Double Ikat Saree",
    technique: "Double Ikat",
    price: 195000,
    motif: "Narikunjar",
    colors: ["Purple"],
    description:
      "A double ikat saree in antique and royal purple that brings together Hathi Popat, Narikunjar, Panchanda, Manek Chowk, Navratna and button-flower designs, with Laheriya work.",
    featured: true,
  },
  {
    code: "P0014",
    name: "Elephant, Lion, Horse and Parrot Double Ikat Saree",
    technique: "Double Ikat",
    price: 110000,
    motif: "Elephant and Parrot",
    colors: ["Red", "Blue"],
    description:
      "A double ikat Patola with elephant, lion, horse and parrot designs in ruby red and royal blue.",
    featured: true,
  },
  {
    code: "P0027",
    name: "Royal Blue Navratna Double Ikat Saree",
    technique: "Double Ikat",
    price: 130000,
    motif: "Navratna",
    colors: ["Blue", "Maroon"],
    description: "A double ikat saree with a royal blue Navratna field and maroon border.",
    featured: true,
  },
  {
    code: "P0049",
    name: "Elephant and Parrot Double Ikat Dupatta",
    category: "Patola Dupatta",
    technique: "Double Ikat",
    price: 35999,
    motif: "Elephant and Parrot",
    colors: ["Multicolour"],
    description: "A double ikat dupatta, also worn as a shawl, with elephant and parrot designs.",
  },

  // Single Ikat
  {
    code: "S0001",
    name: "Ruby Red Jhari Single Ikat Saree",
    technique: "Single Ikat",
    price: 17000,
    motif: "Jhari",
    colors: ["Red", "Golden"],
    description: "A single ikat Patola in rich ruby red with golden jhari art and a golden border.",
    featured: true,
  },
  {
    code: "S0002",
    name: "Purple Jhari Single Ikat Saree",
    technique: "Single Ikat",
    price: 16500,
    motif: "Jhari",
    colors: ["Purple", "Golden"],
    description: "A single ikat Patola in rich purple with golden jhari work.",
  },
  {
    code: "S0003",
    name: "Maroon Navratna Single Ikat Saree",
    technique: "Single Ikat",
    price: 17500,
    motif: "Navratna",
    colors: ["Maroon", "Golden"],
    description: "A Navratna single ikat Patola in rich maroon with golden jhari work.",
  },
  {
    code: "S0004",
    name: "Golden Laheriya Single Ikat Saree",
    technique: "Single Ikat",
    price: 15700,
    motif: "Laheriya",
    colors: ["Golden"],
    description: "A single ikat saree in Laheriya with a plain golden body.",
  },

  // Semi Ikat
  {
    code: "SEMI0001",
    name: "White Navratna Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Navratna",
    colors: ["White", "Red"],
    description: "A white Navratna semi Patola saree with a red Panchanda border.",
  },
  {
    code: "SEMI0002",
    name: "Ten Finger Design Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 33000,
    motif: "Ten Finger",
    colors: ["Multicolour"],
    description: "A multicolour semi Patola saree in the ten finger design.",
  },
  {
    code: "SEMI0003",
    name: "Manek Chowk Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 33000,
    motif: "Manek Chowk",
    colors: ["Yellow", "Red"],
    description:
      "A semi Patola saree in a yellow and red Manek Chowk design with a Panchanda border.",
  },
  {
    code: "SEMI0004",
    name: "Blue and Maroon Navratna Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 30000,
    motif: "Navratna",
    colors: ["Blue", "Red"],
    description: "A Navratna semi Patola saree in blue and maroon.",
  },
  {
    code: "SEMI0005",
    name: "White and Pink Elephant Parrot Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Elephant and Parrot",
    colors: ["White", "Pink", "Red"],
    description:
      "A white and pink semi Patola saree with elephant and parrot designs and a red Panchanda border.",
  },
  {
    code: "SEMI0006",
    name: "Elephant, Parrot and Star Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Elephant and Parrot",
    colors: ["Red"],
    description:
      "A red semi Patola saree with elephant, parrot and star designs and a Panchanda border.",
  },
  {
    code: "SEMI0007",
    name: "Chhabdi Elephant Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 39000,
    motif: "Chhabdi",
    colors: ["Red", "Blue"],
    description:
      "A red and blue semi Patola saree in the Chhabdi design, with an elephant inside each motif.",
    featured: true,
  },
  {
    code: "SEMI0008",
    name: "White Navratna Elephant Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Navratna",
    colors: ["White", "Red"],
    description:
      "A white Navratna semi Patola saree with an elephant design inside and a Panchanda border pallu.",
  },
  {
    code: "SEMI0009",
    name: "Maroon and Indigo Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 33000,
    motif: "Patola Grid",
    colors: ["Maroon", "Indigo"],
    description: "A semi Patola saree in maroon, red and indigo.",
  },
  {
    code: "SEMI0010",
    name: "Green Manek Chowk Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 32000,
    motif: "Manek Chowk",
    colors: ["Green", "Red"],
    description: "A green Manek Chowk semi Patola saree with a Panchanda border.",
  },
  {
    code: "SEMI0011",
    name: "Yellow Navratna Tree Pallu Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Navratna",
    colors: ["Purple", "Yellow"],
    description:
      "A Navratna semi Patola saree in purple and yellow, with a tree design on the pallu.",
  },
  {
    code: "SEMI0012",
    name: "Green Navratna Ghungroo Border Semi Ikat Saree",
    technique: "Semi Ikat",
    price: 35000,
    motif: "Navratna",
    colors: ["Green", "Red"],
    description: "A green Navratna semi Patola saree with a red Ghungroo border.",
  },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const PRODUCTS: Product[] = SEEDS.map((seed) => {
  const category = seed.category ?? "Patola Saree";
  return {
    id: seed.code.toLowerCase(),
    slug: slugify(seed.name),
    name: seed.name,
    category,
    collection: TECHNIQUE_COLLECTION[seed.technique],
    price: seed.price,
    currency: "INR",
    description: seed.description,
    technique: seed.technique,
    material: "Malbari silk",
    origin: "Gujarat, India",
    motif: seed.motif,
    colors: seed.colors,
    dimensions: category === "Patola Dupatta" ? "2.5 m length" : "5.5 m length",
    images: [photo(seed.code)],
    availability: "in_stock",
    sku: seed.code,
    certifications: {},
    featured: seed.featured ?? false,
  };
});

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const featuredProducts = () => PRODUCTS.filter((p) => p.featured);
export const productsByCollection = (slug: string) => PRODUCTS.filter((p) => p.collection === slug);

export const ALL_MOTIFS = Array.from(new Set(PRODUCTS.map((p) => p.motif))).sort();
export const ALL_COLORS = Array.from(new Set(PRODUCTS.flatMap((p) => p.colors))).sort();

export const AVAILABILITY_LABEL: Record<Product["availability"], string> = {
  in_stock: "Available",
  low_stock: "Last piece",
  sold_out: "Reserved",
};

export const collectionName = (slug: string) =>
  COLLECTIONS.find((c) => c.slug === slug)?.name ?? slug;
