import { BRAND } from "./config";
import { formatINR } from "./format";

function buildLink(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const whatsappSupportLink = () =>
  buildLink(
    `Namaste ${BRAND.name}. I would like guidance on choosing a Patola saree.\n\nMay I speak with a Patola concierge?`,
  );

export function whatsappProductLink(input: {
  name: string;
  sku: string;
  price: number;
  slug: string;
}) {
  return buildLink(
    [
      `Namaste ${BRAND.name},`,
      "",
      "I am interested in this piece:",
      `Piece: ${input.name}`,
      `SKU: ${input.sku}`,
      `Price: ${formatINR(input.price)}`,
      `Reference: /product/${input.slug}`,
      "",
      "Could you share availability, material details and dispatch timeline?",
    ].join("\n"),
  );
}

export function whatsappCartLink(
  items: Array<{ name: string; sku: string; quantity: number; price: number }>,
  total: number,
) {
  return buildLink(
    [
      `Namaste ${BRAND.name},`,
      "",
      "I would like assistance with this selection:",
      ...items.map((i) => `• ${i.name} (${i.sku}) × ${i.quantity} — ${formatINR(i.price * i.quantity)}`),
      "",
      `Estimated total: ${formatINR(total)}`,
      "",
      "Please guide me through the next steps.",
    ].join("\n"),
  );
}

export function whatsappOrderConfirmationLink(input: {
  orderId: string;
  name: string;
  total: number;
}) {
  return buildLink(
    [
      `Namaste ${BRAND.name},`,
      "",
      `Order reference: ${input.orderId}`,
      `Name: ${input.name}`,
      `Order value: ${formatINR(input.total)}`,
      "",
      "Please confirm dispatch details for my order.",
    ].join("\n"),
  );
}

export function whatsappEnquiryLink(input: { name: string; message: string }) {
  return buildLink(
    [`Namaste ${BRAND.name},`, "", `Name: ${input.name}`, "", input.message].join("\n"),
  );
}
