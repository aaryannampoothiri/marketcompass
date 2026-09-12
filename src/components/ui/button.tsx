import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none text-sm";
    
    let variantStyles = "";
    if (variant === "default") {
      variantStyles = "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.98]";
    } else if (variant === "outline") {
      variantStyles = "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-sm";
    } else if (variant === "secondary") {
      variantStyles = "bg-slate-100 text-slate-900 hover:bg-slate-200";
    } else if (variant === "ghost") {
      variantStyles = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";
    } else if (variant === "link") {
      variantStyles = "text-blue-600 underline-offset-4 hover:underline";
    }

    let sizeStyles = "";
    if (size === "default") {
      sizeStyles = "h-11 px-5 py-2";
    } else if (size === "sm") {
      sizeStyles = "h-9 rounded-md px-3 text-xs";
    } else if (size === "lg") {
      sizeStyles = "h-12 rounded-lg px-8 text-base";
    } else if (size === "icon") {
      sizeStyles = "h-10 w-10";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
