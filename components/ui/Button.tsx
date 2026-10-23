import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-md font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "h-control px-5 bg-primary text-white hover:bg-primary-dark disabled:bg-line disabled:text-muted",
  secondary:
    "h-control px-5 border border-primary text-primary bg-white hover:bg-primary-tint hover:text-primary-dark disabled:border-line disabled:text-muted disabled:bg-white",
  text:
    "min-h-[44px] px-0 py-1 text-primary underline-offset-4 hover:underline hover:text-primary-dark",
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
