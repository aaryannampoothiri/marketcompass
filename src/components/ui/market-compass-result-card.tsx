import * as React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, Users, Clock, Building2, MapPin, Sparkles } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  getFriendlyArchetype,
  getFriendlyAudience,
  getFriendlyDaypart,
} from "../../utils/friendly-labels";

export interface RecommendationResult {
  rank: number;
  id?: string;
  archetypeId?: string;
  corridorId?: string;
  name: string;
  corridorName?: string;
  city?: string;
  metroId?: string;
  category?: string;
  score: number;
  fitTier: "STRONG_FIT" | "MODERATE_FIT" | "WEAK_FIT" | "GATED_OUT" | string;
  fitTierLabel: string;
  explanation: string;
  positiveSignals?: string[];
  concerns?: string[];
  recommendedTargetAudience?: string;
  recommendedOperatingTime?: string;
  audienceCompatibility?: { label: string; score: number };
  businessFit?: { label: string; score: number };
  operatingTimeCompatibility?: { label: string; score: number };
}

export interface MarketCompassResultCardProps {
  result: RecommendationResult;
  mode: "corridor-to-business" | "business-to-corridor";
  selectedCorridorId?: string;
  selectedArchetypeId?: string;
  selectedAudience?: string;
  selectedDaypart?: string;
  onOpenReport?: (corridorId: string, archetypeId: string) => void;
}

export function MarketCompassResultCard({
  result,
  mode,
  selectedCorridorId,
  selectedArchetypeId,
  selectedAudience = "",
  selectedDaypart = "",
  onOpenReport,
}: MarketCompassResultCardProps) {
  const isCorridorToBusiness = mode === "corridor-to-business";
  const roundedScore = Math.round(result.score);

  // Score badge variant
  let tierBadgeVariant: "success" | "info" | "warning" | "danger" = "warning";
  let scoreColor = "text-amber-600";

  if (result.fitTier === "STRONG_FIT" || roundedScore >= 75) {
    tierBadgeVariant = "success";
    scoreColor = "text-emerald-600";
  } else if (result.fitTier === "MODERATE_FIT" || roundedScore >= 60) {
    tierBadgeVariant = "info";
    scoreColor = "text-blue-600";
  } else if (result.fitTier === "GATED_OUT" || roundedScore < 45) {
    tierBadgeVariant = "danger";
    scoreColor = "text-rose-600";
  }

  // Rank badge colors
  const rankColors =
    result.rank === 1
      ? "bg-amber-500 text-white shadow-xs"
      : result.rank === 2
      ? "bg-slate-700 text-white shadow-xs"
      : "bg-slate-500 text-white shadow-xs";

  const targetCorridorId = isCorridorToBusiness ? selectedCorridorId || result.corridorId || "" : result.corridorId || "";
  const targetArchetypeId = isCorridorToBusiness ? result.archetypeId || result.id || "" : selectedArchetypeId || result.archetypeId || "";

  // Friendly meta
  const archMeta = getFriendlyArchetype(targetArchetypeId, result.name);

  const displayTitle = isCorridorToBusiness ? archMeta.friendlyName : result.corridorName || result.name;
  const displayCategory = isCorridorToBusiness ? archMeta.categoryGroup : (result.city === "nyc" ? "New York City" : "Dallas–Fort Worth");

  const handleCardClick = () => {
    if (onOpenReport) {
      onOpenReport(targetCorridorId, targetArchetypeId);
    } else if (typeof window !== "undefined" && (window as any).openOpportunityReport) {
      (window as any).openOpportunityReport(
        targetCorridorId,
        targetArchetypeId,
        selectedAudience,
        selectedDaypart
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Rank & Score */}
        <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm ${rankColors}`}>
              #{result.rank}
            </span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {isCorridorToBusiness ? "Business Concept" : "Corridor Match"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={tierBadgeVariant}>{result.fitTierLabel || result.fitTier}</Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {displayCategory}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-0.5">
              <span className={`text-2xl sm:text-3xl font-black ${scoreColor}`}>
                {roundedScore}
              </span>
              <span className="text-xs font-semibold text-slate-500">/100</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight block">
              Opportunity Fit
            </span>
          </div>
        </div>

        {/* Title with Friendly Icon */}
        <div className="flex items-start gap-2">
          {isCorridorToBusiness && archMeta.icon && (
            <span className="text-xl shrink-0 mt-0.5">{archMeta.icon}</span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {displayTitle}
          </h3>
        </div>

        {/* Why this recommendation box */}
        <div className="mt-3.5 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Why this {isCorridorToBusiness ? "business concept" : "corridor"}?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {result.explanation}
          </p>

          {/* Key Positive Signal */}
          {result.positiveSignals && result.positiveSignals.length > 0 && (
            <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200/60">
              {result.positiveSignals.slice(0, 2).map((sig, sIdx) => (
                <div key={sIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          )}

          {/* Concern/Gated note */}
          {result.concerns && result.concerns.length > 0 && (
            <div className="mt-1.5">
              <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 p-1.5 rounded border border-amber-200/70 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{result.concerns[0]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Context metadata rows */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {result.recommendedTargetAudience && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{result.recommendedTargetAudience}</span>
            </div>
          )}
          {result.recommendedOperatingTime && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{result.recommendedOperatingTime}</span>
            </div>
          )}
          {result.audienceCompatibility && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Audience: {Math.round(result.audienceCompatibility.score)}/100</span>
            </div>
          )}
          {result.businessFit && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Fit: {Math.round(result.businessFit.score)}/100</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
          Inspect 6-Dimension Report
        </span>
        <Button
          size="sm"
          variant="outline"
          className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors gap-1 text-xs h-8 px-3"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <span>Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
