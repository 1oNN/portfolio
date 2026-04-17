import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  as: Tag = "button",
  href,
  target,
  rel,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-accent text-white hover:opacity-90 hover:shadow-lg shadow-md",
    secondary:
      "border bg-transparent hover:bg-[var(--accent-muted)] hover:border-[var(--accent)]",
    ghost: "hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  };

  const classes = cn(base, sizes[size], variants[variant], className);

  if (Tag === "a") {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
