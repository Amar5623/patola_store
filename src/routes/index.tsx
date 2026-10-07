import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import heroImage from "@/assets/hero-patola.jpg";
import weaveImage from "@/assets/texture-weave.jpg";
import loomImage from "@/assets/heritage-loom.jpg";
import { Button } from "@/components/ui/button";
import { SectionHeading, IkatRule } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/shop/ProductCard";
import { COLLECTIONS, featuredProducts } from "@/data/products";
import { BRAND } from "@/lib/config";
import { whatsappSupportLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pragati Patola Art — The Art of Patan | Handwoven Patola Sarees" },
      {
        name: "description",
        content:
          "Handwoven double ikat Patola sarees from Patan, Gujarat. Heritage motifs, resist-dyed silk and concierge guidance. Woven once. Treasured forever.",
      },
      { property: "og:title", content: "Pragati Patola Art — The Art of Patan" },
      {
        property: "og:description",
        content:
          "Handwoven double ikat Patola sarees from Patan, Gujarat. Woven once. Treasured forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = featuredProducts().slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative flex h-[85vh] min-h-[560px] items-end overflow-hidden md:h-[92vh]">
        <img
          src={heroImage}
          alt="A crimson and gold Patola saree draped over a carved wooden stand"
          width={1920}
          height={1200}
          className="animate-slow-reveal absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-veil)" }}
          role="presentation"
        />
        <div className="shell text-ivory relative pb-16 md:pb-24">
          <p className="label-micro animate-fade-up opacity-80">
            Patan · Gujarat &nbsp;/&nbsp; Handwoven Textiles &nbsp;/&nbsp; Heritage Collection
          </p>
          <h1
            className="animate-fade-up mt-6 max-w-4xl text-[2.6rem] leading-[1.02] md:text-7xl xl:text-8xl"
            style={{ animationDelay: "120ms" }}
          >
            900 Years of Royal Double-Ikat Masterpieces
          </h1>
          <p
            className="animate-fade-up font-display mt-5 text-2xl opacity-90 md:text-3xl"
            style={{ animationDelay: "240ms" }}
          >
            Woven once. Treasured forever.
          </p>
          <p
            className="animate-fade-up mt-5 max-w-lg text-sm leading-[1.8] opacity-80 md:text-base"
            style={{ animationDelay: "320ms" }}
          >
            Discover Patola — where silk, colour and precision become heirlooms.
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-wrap gap-4"
            style={{ animationDelay: "420ms" }}
          >
            <Button variant="gold" size="auto" asChild>
              <Link to="/shop">Explore Collection</Link>
            </Button>
            <Button variant="onImage" size="auto" asChild>
              <a href={whatsappSupportLink()} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" aria-hidden /> Consult on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* HERITAGE INTRODUCTION */}
      <section className="section-y">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Heritage"
              title="A legacy written in silk"
              description="Patola is more than a saree. It is a discipline of colour, alignment and handweaving, shaped by generations of textile knowledge in Gujarat."
            />
            <p className="text-muted-foreground mt-6 max-w-xl text-sm leading-[1.9]">
              Each length begins as undyed silk yarn. The motif is resist-tied and dyed shade by
              shade, then woven so that warp and weft meet exactly — a process measured in months,
              not days.
            </p>
            <Link to="/story" className="label-small text-primary link-underline mt-8 inline-flex items-center gap-2">
              Explore the story <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="hover-zoom-media aspect-[5/4]">
            <img
              src={weaveImage}
              alt="Macro detail of Patola double ikat silk weave"
              loading="lazy"
              width={1408}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* SIGNATURE COLLECTION */}
      <section className="bg-cream/60 section-y">
        <div className="shell">
          <SectionHeading eyebrow="Signature" title="Four houses of Patola" align="center" />
          <div className="mt-14 grid gap-px md:grid-cols-2 lg:grid-cols-4">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.slug}
                to="/collections/$slug"
                params={{ slug: collection.slug }}
                className="group bg-ivory hover:bg-warm-white p-8 transition-colors"
              >
                <p className="label-micro text-muted-foreground">Collection</p>
                <h3 className="font-display mt-4 text-2xl">{collection.name}</h3>
                <p className="text-muted-foreground mt-4 text-sm leading-[1.8]">
                  {collection.description}
                </p>
                <span className="label-micro text-primary mt-6 inline-flex items-center gap-2">
                  View pieces{" "}
                  <ArrowRight
                    className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DOUBLE IKAT STORY */}
      <section className="bg-maroon-deep text-ivory section-y">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="hover-zoom-media order-2 aspect-[5/4] lg:order-1">
            <img
              src={loomImage}
              alt="Hands weaving crimson silk on a traditional wooden handloom"
              loading="lazy"
              width={1408}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="label-micro opacity-70">Technique</p>
            <h2 className="mt-4 text-3xl leading-[1.05] md:text-5xl">
              Double ikat: pattern before cloth
            </h2>
            <p className="mt-6 text-sm leading-[1.9] opacity-80 md:text-base">
              In double ikat, both warp and weft threads are tied and dyed before a single pass of
              weaving. The motif exists in the yarn itself, which is why the pattern appears
              identically on both faces of the cloth — and why alignment is unforgiving.
            </p>
            <ol className="mt-10 space-y-5">
              {[
                ["01", "Yarn preparation", "Degummed silk is measured and grouped for the design."],
                ["02", "Resist tying", "Sections are bound by hand so dye cannot reach them."],
                ["03", "Dyeing in sequence", "Each colour is applied in a fixed order, lightest first."],
                ["04", "Aligned weaving", "Warp and weft are matched thread by thread on the loom."],
              ].map(([step, title, copy]) => (
                <li key={step} className="border-ivory/15 flex gap-5 border-b pb-5">
                  <span className="label-micro text-gold-light pt-1">{step}</span>
                  <span>
                    <span className="font-display block text-xl">{title}</span>
                    <span className="mt-1 block text-sm leading-[1.7] opacity-75">{copy}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-y">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured" title="Pieces currently on offer" className="mb-0" />
            <Link to="/shop" className="label-small text-primary link-underline">
              View all 25 pieces →
            </Link>
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* STORY OF PATOLA + MOTIF DISCOVERY */}
      <section className="bg-cream/60 section-y">
        <div className="shell">
          <SectionHeading
            eyebrow="Motifs"
            title="Read the language of the grid"
            description="Every Patola field is built from named motifs. Learning them changes how a piece is chosen."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Navratna", "Nine-jewel grid, associated with prosperity and ceremony."],
              ["Kunjar", "Elephant motif — strength, and the most demanding alignment."],
              ["Popat Kunj", "Parrots in a garden, read as a blessing on new beginnings."],
              ["Phulwali", "A flowering field, the most widely loved festive composition."],
            ].map(([name, copy]) => (
              <div key={name} className="bg-ivory p-8">
                <IkatRule className="mb-6" />
                <h3 className="font-display text-xl">{name}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-[1.8]">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/story" className="label-small text-primary link-underline">
              Explore the motif library →
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST / PROVENANCE */}
      <section className="section-y">
        <div className="shell grid gap-10 md:grid-cols-3">
          {[
            [
              ShieldCheck,
              "Provenance on request",
              "Piece-specific material and provenance details are shared before purchase. We make no blanket certification claims.",
            ],
            [
              Truck,
              "Insured dispatch",
              "Each piece is documented, packed and dispatched insured. Complimentary above ₹1,00,000.",
            ],
            [
              MessageCircle,
              "Two-day return window",
              "Unboxing video documentation supports our 2-day return and replacement policy.",
            ],
          ].map(([Icon, title, copy]) => {
            const Component = Icon as typeof ShieldCheck;
            return (
              <div key={title as string}>
                <Component className="text-primary size-6" aria-hidden />
                <h3 className="font-display mt-5 text-xl">{title as string}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-[1.8]">{copy as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHATSAPP CONCIERGE */}
      <section className="bg-emerald-deep text-ivory section-y">
        <div className="shell text-center">
          <p className="label-micro opacity-70">Concierge</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-[1.1] md:text-5xl">
            Speak with a Patola concierge
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-[1.8] opacity-80 md:text-base">
            Motif guidance, colour matching, bridal timelines and gifting — answered personally on
            WhatsApp or by phone.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="auto" asChild>
              <a href={whatsappSupportLink()} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" aria-hidden /> WhatsApp concierge
              </a>
            </Button>
            <Button variant="onImage" size="auto" asChild>
              <a href={`tel:${BRAND.phoneDial}`}>{BRAND.phoneDisplay}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
