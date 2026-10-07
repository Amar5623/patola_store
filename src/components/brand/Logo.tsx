import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group block text-center leading-none", className)} aria-label="Pragati Patola Art — home">
      <span className="font-display block text-lg tracking-[0.3em] uppercase md:text-xl">
        Pragati
      </span>
      {!compact && (
        <span className="font-display mt-1 block text-lg tracking-[0.3em] uppercase md:text-xl">
          Patola Art
        </span>
      )}
      <span className="label-micro mt-1.5 block opacity-60">The Art of Patan</span>
    </Link>
  );
}
