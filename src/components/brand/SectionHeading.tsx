import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="label-micro text-primary/70">{eyebrow}</p>}
      <h2 className="mt-4 text-3xl leading-[1.05] md:text-5xl">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-5 text-base leading-[1.75] md:text-lg">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function IkatRule({ className }: { className?: string }) {
  return <div className={cn("ikat-rule", className)} role="presentation" />;
}
