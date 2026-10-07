import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/services/analytics";

const schema = z.string().trim().email("Enter a valid email address").max(255);

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = schema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0]!.message);
      return;
    }
    setError(null);
    setEmail("");
    trackEvent("newsletter_signup", { email: "redacted" });
    toast.success("Thank you — you are on the atelier list.");
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-end">
      <div>
        <p className="label-micro opacity-60">The Atelier Letter</p>
        <h2 className="mt-4 text-3xl leading-[1.1] md:text-4xl">
          New weaves, quietly announced
        </h2>
        <p className="mt-4 max-w-md text-sm leading-[1.8] opacity-75">
          A few letters a year on pieces leaving the loom, motif histories and private previews.
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate className="w-full">
        <label htmlFor="newsletter-email" className="label-micro opacity-60">
          Email address
        </label>
        <div className="border-ivory/30 mt-3 flex items-center border-b">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={255}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "newsletter-error" : undefined}
            className="placeholder:text-ivory/40 w-full bg-transparent py-3 text-base outline-none"
          />
          <button type="submit" aria-label="Subscribe" className="p-3">
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
        {error && (
          <p id="newsletter-error" className="mt-2 text-xs opacity-90">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
