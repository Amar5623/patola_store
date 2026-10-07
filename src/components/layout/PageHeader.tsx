import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <header className="border-border border-b pt-32 pb-12 md:pt-40 md:pb-16">
      <div className="shell">
        {eyebrow && <p className="label-micro text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-4 text-4xl leading-[1.02] md:text-6xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-[1.8] md:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
