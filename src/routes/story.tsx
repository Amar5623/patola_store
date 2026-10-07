import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { IkatRule } from "@/components/brand/SectionHeading";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Story of Patola — Pragati Patola Art" },
      { name: "description", content: "Nine centuries of double ikat weaving in Patan, Gujarat: history, technique and GI heritage." },
      { property: "og:title", content: "The Story of Patola — Pragati Patola Art" },
      { property: "og:description", content: "Nine centuries of double ikat weaving in Patan, Gujarat." },
    ],
  }),
  component: StoryPage,
});

const timeline = [
  ["12th century", "King Kumarpala of the Solanki dynasty is traditionally associated with bringing 700 Salvi weaving families from Jalna to Patan."],
  ["Generations of precision", "Salvi artisans refine the exacting double-ikat discipline, tying and dyeing both warp and weft before weaving."],
  ["17th century", "Patola travels the spice routes to Southeast Asia as a prized trade textile."],
  ["20th century", "A handful of families keep the double ikat tradition alive."],
  ["2013", "Patan Patola receives Geographical Indication protection."],
];

function StoryPage() {
  return (
    <>
      <PageHeader eyebrow="Heritage" title="The Story of Patola" description="A textile planned thread by thread, before a single pass of the shuttle." />
      <Prose>
        <h2>Double ikat, explained</h2>
        <p>In double ikat, both warp and weft threads are resist-dyed before weaving. Each thread is tied and dyed in exact sequence so that, on the loom, the pattern appears where the two sets of colour meet. A single saree can take months to complete.</p>
        <p>Because the design lives in the dyed threads themselves, a true double ikat Patola reads the same on both sides.</p>
        <h2>A timeline</h2>
        <ol className="border-border space-y-6 border-l pl-6">
          {timeline.map(([y, t]) => (
            <li key={y} className="list-none">
              <p className="label-micro text-primary/70">{y}</p>
              <p className="mt-1">{t}</p>
            </li>
          ))}
        </ol>
        <h2>Geographical Indication &amp; Silk Mark</h2>
        <p>Patan Patola is protected by a Geographical Indication. Silk Mark and other certification badges appear only where the individual piece has verified documentation; ask the concierge to review it before purchase.</p>
        <IkatRule className="my-12" />
        <Link to="/shop" className="bg-primary text-primary-foreground label-small inline-flex px-8 py-4">View the collection</Link>
      </Prose>
    </>
  );
}
