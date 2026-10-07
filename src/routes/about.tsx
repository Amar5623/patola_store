import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { BRAND } from "@/lib/config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Atelier — Pragati Patola Art" },
      { name: "description", content: "Pragati Patola Art brings handwoven Patola from Gujarat's weaving families to collectors worldwide." },
      { property: "og:title", content: "About the Atelier — Pragati Patola Art" },
      { property: "og:description", content: "The people and principles behind Pragati Patola Art." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="The Atelier" title="About Pragati Patola Art" description={BRAND.supporting} />
      <Prose>
        <p>Pragati Patola Art works directly with master weavers to present Patola sarees that honour the discipline of the craft: accurate geometry, rich natural lustre and patient hand work.</p>
        <h2>Our principles</h2>
        <ul>
          <li>Honest descriptions — technique and certification stated only where verified.</li>
          <li>Fair work — weavers are paid for the months each piece demands.</li>
          <li>Care in dispatch — every order is insured and packed by hand.</li>
        </ul>
        <h2>Visit us</h2>
        <p>{Object.values(BRAND.address).join(", ")}</p>
      </Prose>
    </>
  ),
});
