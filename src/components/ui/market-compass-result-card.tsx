import * as React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, Users, Clock, MapPin, Sparkles } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  getFriendlyArchetype,
  getFriendlyAudience,
  getFriendlyDaypart,
  cleanCardSignal,
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

  // Friendly Fit Tier label & styling
  let tierLabel = "Moderate Match";
  let tierBadgeVariant: "success" | "info" | "warning" | "danger" = "warning";
  let scoreColor = "text-amber-600";

  if (result.fitTier === "STRONG_FIT" || roundedScore >= 75) {
    tierLabel = "Strong Match";
    tierBadgeVariant = "success";
    scoreColor = "text-emerald-600";
  } else if (result.fitTier === "MODERATE_FIT" || roundedScore >= 60) {
    tierLabel = "Good Match";
    tierBadgeVariant = "info";
    scoreColor = "text-blue-600";
  } else if (result.fitTier === "GATED_OUT" || roundedScore < 45) {
    tierLabel = "Restricted";
    tierBadgeVariant = "danger";
    scoreColor = "text-rose-600";
  }

  // Rank badge colors
  const rankBg =
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
  const metroLabel = (result.city === "nyc" || result.metroId === "nyc") ? "New York City" : "Dallas–Fort Worth";
  const displayCategory = isCorridorToBusiness ? archMeta.categoryGroup : metroLabel;

  // Cleaned positive highlights
  const topSignals = (result.positiveSignals || [])
    .map(s => cleanCardSignal(s))
    .filter(Boolean)
    .slice(0, 2);

  // Cleaned concern
  const topConcern = result.concerns && result.concerns.length > 0
    ? cleanCardSignal(result.concerns[0])
    : null;

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
      className="group relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Rank, Match Tier, and Score */}
        <div className="flex items-start justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${rankBg}`}>
              #{result.rank}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={tierBadgeVariant}>{tierLabel}</Badge>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {displayCategory}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-0.5">
              <span className={`text-2xl font-black ${scoreColor}`}>
                {roundedScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight block">
              Match Score
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start gap-2 mb-3">
          {isCorridorToBusiness ? (
            <span className="text-xl shrink-0 mt-0.5">{archMeta.icon || "🏪"}</span>
          ) : (
            <span className="text-base shrink-0 mt-0.5">📍</span>
          )}
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {displayTitle}
          </h3>
        </div>

        {/* Quick Overview Highlights */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Quick Location Highlights</span>
          </div>

          {/* Highlights */}
          <div className="space-y-1.5">
            {topSignals.length > 0 ? (
              topSignals.map((sig, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Balanced customer traffic and steady neighborhood demand.</span>
              </div>
            )}
          </div>

          {/* Consideration if present */}
          {topConcern && (
            <div className="pt-1">
              <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/90 px-2.5 py-1.5 rounded-lg border border-amber-200/80 font-medium leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{topConcern}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <Button
          size="sm"
          className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <span>{isCorridorToBusiness ? "View Business Match Report" : "View Corridor Match Report"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
