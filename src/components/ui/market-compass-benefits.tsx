import * as React from "react";
import { Check } from "lucide-react";

export interface BenefitPoint {
  text: string;
  highlight?: string;
}

export interface MarketCompassBenefitsProps {
  description: string;
  points: BenefitPoint[];
}

export function MarketCompassBenefits({ description, points }: MarketCompassBenefitsProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
        {description}
      </p>

      <div className="space-y-3.5 pt-2">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-3 group">
            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug">
              {point.highlight ? (
                <>
                  {point.text.split(point.highlight)[0]}
                  <span className="font-semibold text-slate-900">{point.highlight}</span>
                  {point.text.split(point.highlight)[1]}
                </>
              ) : (
                point.text
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
