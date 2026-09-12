import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let variantStyles = "bg-blue-100 text-blue-800 border-blue-200";
  if (variant === "secondary") variantStyles = "bg-slate-100 text-slate-800 border-slate-200";
  if (variant === "outline") variantStyles = "border-slate-300 text-slate-700";
  if (variant === "success") variantStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (variant === "warning") variantStyles = "bg-amber-50 text-amber-800 border-amber-200";
  if (variant === "danger") variantStyles = "bg-rose-50 text-rose-700 border-rose-200";
  if (variant === "info") variantStyles = "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles} ${className}`}
      {...props}
    />
  );
}
