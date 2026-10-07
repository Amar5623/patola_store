import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { BRAND, SHIPPING_COPY } from "@/lib/config";

const POLICIES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      SHIPPING_COPY.domestic,
      SHIPPING_COPY.free,
      "Orders below the threshold carry a flat ₹1,500 insured shipping charge.",
      "Tracking details are shared by WhatsApp and email once dispatched.",
    ],
  },
  returns: {
    title: "Returns, Refunds & Cancellation",
    body: [
      "Damaged or defective pieces may be returned or replaced when reported within 2 days of delivery.",
      "A continuous, unedited unboxing video from the sealed parcel to the revealed piece is required for every claim.",
      "Send the unboxing video and clear photos of the damage or defect on the same day the parcel is opened.",
      "Pieces must remain unused, with tags and original packaging.",
      "Orders may be cancelled for a full refund until they are dispatched. Once dispatched, the returns terms above apply.",
      "Approved refunds are issued to the original payment method within 5–7 working days of approval; your bank may take a few more days to reflect the credit.",
      `To begin, message us on WhatsApp at ${BRAND.phoneDisplay} or email ${BRAND.email}.`,
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only the details needed to fulfil your order and respond to enquiries.",
      "We never sell your information. Payments are processed by Razorpay; card, UPI and bank details are entered on Razorpay's secure window and never reach or are stored by us.",
      "Order details (name, contact, delivery address and items) are recorded in our private order register on Google Workspace and used to send order updates by WhatsApp, phone or email.",
      `Requests about your data can be sent to ${BRAND.email}.`,
    ],
  },
  terms: {
    title: "Terms of Use",
    body: [
      "Handwoven pieces may show slight variation in colour and geometry; this is a mark of the craft, not a defect.",
      "Prices are in Indian Rupees and include applicable taxes unless stated.",
      "All content and imagery belong to Pragati Patola Art.",
    ],
  },
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const policy = POLICIES[params.slug];
    if (!policy) throw notFound();
    return policy;
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.title ?? "Policy"} — Pragati Patola Art`;
    const d = loaderData?.body[0] ?? "Store policies.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PolicyPage,
});

function PolicyPage() {
  const p = Route.useLoaderData();
  return (
    <>
      <PageHeader eyebrow="Policies" title={p.title} />
      <Prose>
        {p.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
      </Prose>
    </>
  );
}
