import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="shell py-16 md:py-24">
      <div className="text-foreground/85 max-w-3xl space-y-6 text-base leading-[1.85] [&_h2]:font-display [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:leading-tight [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
