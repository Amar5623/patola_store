import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { BRAND } from "@/lib/config";
import { whatsappSupportLink } from "@/lib/whatsapp";
import { trackEvent } from "@/services/analytics";
import { cn } from "@/lib/utils";

export function WhatsAppFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3 md:right-8 md:bottom-8">
      {open && (
        <div className="bg-ivory border-border animate-fade-up w-72 border p-5 shadow-[var(--shadow-editorial)]">
          <p className="label-micro text-muted-foreground">WhatsApp Concierge</p>
          <p className="font-display mt-2 text-xl leading-tight">
            Guidance on choosing your Patola
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-[1.7]">
            Motif advice, colour matching, dispatch timelines and gifting — answered personally.
          </p>
          <a
            href={whatsappSupportLink()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp_click", { source: "fab" })}
            className="bg-primary text-primary-foreground label-small mt-5 flex items-center justify-center gap-2 px-4 py-3"
          >
            <MessageCircle className="size-4" aria-hidden /> Start a chat
          </a>
          <a href={`tel:${BRAND.phoneDial}`} className="text-muted-foreground mt-3 block text-center text-xs">
            or call {BRAND.phoneDisplay}
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close concierge panel" : "Open WhatsApp concierge"}
        className={cn(
          "bg-emerald-deep text-ivory flex size-14 items-center justify-center rounded-full shadow-[var(--shadow-raised)] transition-transform duration-300 hover:scale-105",
        )}
      >
        {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
      </button>
    </div>
  );
}
