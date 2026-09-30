import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex min-h-11 min-w-11 select-none items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  quiet: "border border-hairline bg-paper text-ink hover:bg-wash",
};

export function Button({ variant = "quiet", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
