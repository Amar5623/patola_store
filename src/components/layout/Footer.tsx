import { Link } from "@tanstack/react-router";
import { BadgeCheck, Facebook, Instagram, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/config";
import { whatsappSupportLink } from "@/lib/whatsapp";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";

const SHOP = [
  { to: "/shop", label: "All Pieces" },
  { to: "/collections/royal-heritage", label: "Royal Heritage" },
  { to: "/collections/bridal", label: "Bridal" },
  { to: "/collections/festive", label: "Festive" },
  { to: "/collections/contemporary", label: "Contemporary" },
] as const;

const DISCOVER = [
  { to: "/story", label: "The Story of Patola" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About the Atelier" },
] as const;

const CARE = [
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
  { to: "/policies/shipping", label: "Shipping" },
  { to: "/policies/returns", label: "Returns & Replacement" },
] as const;

const LEGAL = [
  { to: "/policies/privacy", label: "Privacy Policy" },
  { to: "/policies/terms", label: "Terms of Use" },
] as const;

export function Footer() {
  return (
    <footer className="bg-maroon-deep text-ivory mt-px">
      <div className="shell py-16 md:py-24">
        <NewsletterForm />

        <div className="ikat-pattern my-14 h-10 opacity-20" role="presentation" />

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl tracking-[0.2em] uppercase">Pragati Patola Art</p>
            <p className="mt-4 max-w-sm text-sm leading-[1.8] opacity-75">
              Handwoven Patola from Patan, Gujarat. {BRAND.secondary}
            </p>
            <div className="mt-8 flex items-center gap-5">
              <a href={BRAND.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="size-5 opacity-75 transition-opacity hover:opacity-100" />
              </a>
              <a href={BRAND.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook className="size-5 opacity-75 transition-opacity hover:opacity-100" />
              </a>
              <a href={whatsappSupportLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <MessageCircle className="size-5 opacity-75 transition-opacity hover:opacity-100" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={SHOP} />
          <FooterColumn title="Discover" links={DISCOVER} />
          <div className="space-y-10">
            <FooterColumn title="Customer Care" links={CARE} />
            <FooterColumn title="Legal" links={LEGAL} />
          </div>
        </div>

        <div className="border-ivory/15 mt-16 grid gap-8 border-t pt-10 md:grid-cols-3">
          <div>
            <p className="label-micro opacity-60">Atelier</p>
            <address className="mt-3 flex gap-3 text-sm leading-[1.8] not-italic opacity-80">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
              <span>
                {BRAND.name}
                <br />
                {BRAND.address.line1}
                <br />
                {BRAND.address.line2}
                <br />
                {BRAND.address.line3}
                <br />
                {BRAND.address.city}
                <br />
                {BRAND.address.state}
              </span>
            </address>
          </div>
          <div>
            <p className="label-micro opacity-60">Speak with us</p>
            <a
              href={`tel:${BRAND.phoneDial}`}
              className="mt-3 flex items-center gap-3 text-sm opacity-85 hover:opacity-100"
            >
              <Phone className="size-4" aria-hidden /> {BRAND.phoneDisplay}
            </a>
            <a
              href={whatsappSupportLink()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center gap-3 text-sm opacity-85 hover:opacity-100"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp Concierge
            </a>
          </div>
          <div>
            <p className="label-micro opacity-60">Trust &amp; provenance</p>
            <div className="mt-3 space-y-3 text-sm opacity-80">
              <p className="flex items-center gap-2"><ShieldCheck className="size-4" aria-hidden /> Patan Patola GI heritage</p>
              <p className="flex items-center gap-2"><BadgeCheck className="size-4" aria-hidden /> Silk Mark shown when verified</p>
              <p className="leading-[1.8]">Piece-specific documentation is available on request.</p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs opacity-55">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { to: string; label: string }[];
}) {
  return (
    <div>
      <p className="label-micro opacity-60">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm opacity-80 transition-opacity hover:opacity-100">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
