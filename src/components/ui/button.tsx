import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-crimson",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:border-primary hover:bg-secondary/60",
        secondary: "bg-secondary text-secondary-foreground hover:bg-cream",
        ghost: "hover:bg-secondary/70",
        link: "text-primary underline-offset-4 hover:underline",
        /* Brand variants — use these instead of ad-hoc colour classes */
        atelier:
          "bg-primary text-primary-foreground label-small px-8 py-4 h-auto hover:bg-crimson",
        atelierOutline:
          "border border-primary/40 text-primary bg-transparent label-small px-8 py-4 h-auto hover:border-primary hover:bg-primary hover:text-primary-foreground",
        onImage:
          "border border-ivory/60 bg-ivory/10 text-ivory label-small px-8 py-4 h-auto backdrop-blur-sm hover:bg-ivory hover:text-maroon-deep",
        gold: "bg-gold text-maroon-deep label-small px-8 py-4 h-auto hover:bg-gold-light",
        concierge:
          "border border-emerald-deep/40 text-emerald-deep bg-transparent label-small px-8 py-4 h-auto hover:bg-emerald-deep hover:text-ivory",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-sm px-8",
        icon: "h-10 w-10",
        auto: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
