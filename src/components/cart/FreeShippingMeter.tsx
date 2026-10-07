import { Truck } from "lucide-react";
import { freeShippingProgress } from "@/lib/config";
import { formatINR } from "@/lib/format";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const { remaining, progress, unlocked } = freeShippingProgress(subtotal);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Truck className="text-primary size-4" aria-hidden />
        <p className="label-micro">
          {unlocked ? "You've unlocked complimentary shipping" : "Complimentary shipping"}
        </p>
      </div>
      {!unlocked && (
        <p className="text-muted-foreground mt-2 text-xs">
          You are {formatINR(remaining)} away
        </p>
      )}
      <div
        className="bg-cream mt-3 h-1.5 w-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progress towards complimentary shipping"
      >
        <div
          className="bg-gold h-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
