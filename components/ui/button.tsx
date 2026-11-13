import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[10px] text-[16px] font-semibold transition-[background-color,color,border-color,box-shadow,transform,filter,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-95",
        secondary: "border border-border bg-transparent text-foreground hover:bg-muted",
        text: "text-primary hover:bg-accent",
        danger: "border border-destructive text-destructive hover:bg-expense-soft",
      },
      size: {
        default: "h-12 px-5 w-full",
        auto: "h-12 px-5",
        sm: "h-11 px-4 text-[14px]",
        icon: "h-11 w-11 shrink-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean };

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      <span className={cn("inline-flex items-center gap-2 transition-opacity duration-150", loading && "opacity-80")}>
        {children}
      </span>
    </button>
  );
}

export { buttonVariants };
