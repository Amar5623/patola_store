import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BRAND } from "@/lib/config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pragati Patola Art" },
      { name: "description", content: "Speak with the Pragati Patola Art concierge by WhatsApp, phone or email." },
      { property: "og:title", content: "Contact — Pragati Patola Art" },
      { property: "og:description", content: "Speak with our concierge by WhatsApp, phone or email." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hello, I am ${name.trim()}.\n\n${msg.trim()}`);
    window.open(`https://wa.me/${BRAND.whatsapp}?text=${text}`, "_blank", "noopener");
  };
  const field = "border-border bg-background w-full border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary";
  return (
    <>
      <PageHeader eyebrow="Concierge" title="Contact us" description="We reply personally, usually within a few hours." />
      <div className="shell grid gap-16 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6 text-sm leading-[1.8]">
          <p><span className="label-micro text-muted-foreground block">Phone / WhatsApp</span><a href={`tel:${BRAND.phoneDial}`}>{BRAND.phoneDisplay}</a></p>
          <p><span className="label-micro text-muted-foreground block">Email</span><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
          <p><span className="label-micro text-muted-foreground block">Address</span>{Object.values(BRAND.address).join(", ")}</p>
        </div>
        <form onSubmit={send} className="space-y-4">
          <label className="block"><span className="label-micro">Name</span>
            <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-2`} /></label>
          <label className="block"><span className="label-micro">Message</span>
            <textarea required maxLength={1000} rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} className={`${field} mt-2`} /></label>
          <Button type="submit" variant="atelier" size="auto">Send via WhatsApp</Button>
        </form>
      </div>
    </>
  );
}
