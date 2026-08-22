import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(94_106_210/0.5),0_4px_12px_rgb(94_106_210/0.3),inset_0_1px_0_0_rgb(255_255_255/0.2)] hover:bg-primary-bright hover:shadow-[0_0_0_1px_rgb(94_106_210/0.6),0_6px_18px_rgb(94_106_210/0.45),inset_0_1px_0_0_rgb(255_255_255/0.25)]",
        primary:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(94_106_210/0.5),0_4px_12px_rgb(94_106_210/0.3),inset_0_1px_0_0_rgb(255_255_255/0.2)] hover:bg-primary-bright hover:shadow-[0_0_0_1px_rgb(94_106_210/0.6),0_6px_18px_rgb(94_106_210/0.45),inset_0_1px_0_0_rgb(255_255_255/0.25)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_0_0_1px_rgb(220_38_38/0.4),0_4px_12px_rgb(220_38_38/0.25)] hover:bg-destructive/90",
        outline:
          "border border-border bg-white/[0.03] text-foreground hover:bg-white/[0.06] hover:border-white/10",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/[0.06] hover:bg-white/[0.08]",
        ghost: "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };