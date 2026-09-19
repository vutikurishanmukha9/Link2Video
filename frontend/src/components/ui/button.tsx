import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "group/button font-head font-medium inline-flex cursor-pointer items-center justify-center gap-2 rounded-xs whitespace-nowrap select-none transition-all duration-150",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ),
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-primary text-primary-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "border-2 border-black bg-secondary text-secondary-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        destructive:
          "border-2 border-black bg-destructive text-destructive-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 border-black bg-card text-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-accent/80",
        link: "border-transparent bg-transparent text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        xs: "h-7 px-2 py-0.5 text-xs",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-6 py-2.5 text-base",
        icon: "h-10 w-10 p-2",
        "icon-xs": "h-7 w-7 p-1",
        "icon-sm": "h-8 w-8 p-1.5",
        "icon-lg": "h-12 w-12 p-3",
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
