import * as React from "react";
import { Sparkles } from "lucide-react";

export interface DemoPreset {
  label: string;
  badge?: string;
  onClick: () => void;
}

export interface MarketCompassModeHeaderProps {
  mode: "corridor-to-business" | "business-to-corridor";
  tagline?: string;
  title: string;
  subtitle: string;
  presets?: DemoPreset[];
}

export function MarketCompassModeHeader({
  mode,
  tagline,
  title,
  subtitle,
  presets = [],
}: MarketCompassModeHeaderProps) {
  const defaultTagline =
    mode === "corridor-to-business"
      ? "Workflow 1: Corridor → Business"
      : "Workflow 2: Business → Corridor";

  return (
    <div className="w-full flex flex-col items-center text-center pb-8 border-b border-slate-200">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-4 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>{tagline || defaultTagline}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight">
        {title}
      </h1>

      <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
        {subtitle}
      </p>

      {presets.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mr-1">
            ⚡ Quick Demo Scenarios:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={preset.onClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <span>{preset.label}</span>
              {preset.badge && (
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                  {preset.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
