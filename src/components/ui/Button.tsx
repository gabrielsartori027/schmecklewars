import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-display text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out) active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        primary: "bg-portal text-black shadow-[0_0_24px_rgb(57_255_20/0.25)] hover:brightness-110",
        secondary:
          "border border-border-hover bg-bg-surface-2 text-fg-primary hover:border-brand/40 hover:bg-bg-surface-3",
        ghost: "text-fg-secondary hover:bg-bg-surface-2 hover:text-fg-primary",
        aid: "border border-aid/40 bg-aid-soft text-aid hover:bg-aid/20",
        danger: "border border-danger/40 text-danger hover:bg-danger/10",
      },
      size: {
        sm: "px-3 py-1.5 text-xs min-h-9",
        md: "px-4 py-2.5",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants> & { href: string; external?: boolean };

export function LinkButton({
  className,
  variant,
  size,
  href,
  external,
  children,
  ...rest
}: LinkButtonProps) {
  const cls = cn(buttonVariants({ variant, size }), className);
  if (external || /^https?:|^ethereum:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={href as any} className={cls} {...rest}>
      {children}
    </Link>
  );
}
