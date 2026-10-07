import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Pragati Patola Art" },
      { name: "description", content: "Answers on shipping, returns, authenticity, care and payments for Patola sarees." },
      { property: "og:title", content: "FAQ — Pragati Patola Art" },
      { property: "og:description", content: "Answers on shipping, returns, authenticity and care." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  ["Is every saree double ikat?", "No. Each product page states whether a piece is double ikat, single ikat or another technique."],
  ["How long does shipping take?", "Insured dispatch across India takes 3–6 working days. Orders above ₹1,00,000 ship free."],
  ["What is your return policy?", "Returns or replacements are accepted within 2 days of delivery, with an unboxing video."],
  ["Can I consult before buying?", "Yes — message us on WhatsApp for photos, videos or a live viewing."],
  ["How should I care for my Patola?", "Dry clean only. Store folded in muslin and refold every few months."],
];

function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Frequently asked questions" />
      <div className="shell max-w-3xl py-16 md:py-24">
        {faqs.map(([q, a]) => (
          <details key={q} className="border-border group border-b py-6">
            <summary className="font-display cursor-pointer text-xl md:text-2xl">{q}</summary>
            <p className="text-muted-foreground mt-4 leading-[1.8]">{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
