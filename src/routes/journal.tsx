import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Pragati Patola Art" },
      { name: "description", content: "Notes on Patola motifs, care, bridal styling and the weavers of Gujarat." },
      { property: "og:title", content: "Journal — Pragati Patola Art" },
      { property: "og:description", content: "Notes on Patola motifs, care and craft." },
    ],
  }),
  component: JournalPage,
});

const posts = [
  { cat: "Motifs", title: "Reading Narikunj, Chhabdi and Paan", excerpt: "A guide to the geometry that defines Patan Patola." },
  { cat: "Care", title: "How to store an heirloom silk", excerpt: "Muslin, cedar and a yearly refold keep a Patola for generations." },
  { cat: "Bridal", title: "Styling Patola for the wedding season", excerpt: "Pairing classic reds with gold jewellery and modern drapes." },
  { cat: "Craft", title: "Months on the loom", excerpt: "Why a single double ikat saree can take half a year." },
];

function JournalPage() {
  return (
    <>
      <PageHeader eyebrow="Journal" title="Notes from the loom" />
      <div className="shell grid gap-10 py-16 md:grid-cols-2 md:py-24">
        {posts.map((p) => (
          <article key={p.title} className="border-border border-t pt-6">
            <p className="label-micro text-primary/70">{p.cat}</p>
            <h2 className="mt-3 text-2xl md:text-3xl">{p.title}</h2>
            <p className="text-muted-foreground mt-3 leading-[1.8]">{p.excerpt}</p>
            <p className="label-micro text-muted-foreground mt-4">Coming soon</p>
          </article>
        ))}
      </div>
    </>
  );
}
