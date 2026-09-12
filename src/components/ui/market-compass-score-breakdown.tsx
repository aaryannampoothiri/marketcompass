import * as React from "react";
import { ArrowDown, Layers, MapPin, Building2, Clock, Users, ShieldCheck, Sparkles } from "lucide-react";

export interface MarketCompassScoreBreakdownProps {
  mode: "corridor-to-business" | "business-to-corridor";
}

export function MarketCompassScoreBreakdown({ mode }: MarketCompassScoreBreakdownProps) {
  const isCorridorToBusiness = mode === "corridor-to-business";

  return (
    <div className="mt-8 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-100/60 p-6 text-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Algorithmic Decision Pipeline
            </h4>
            <p className="text-[11px] text-slate-500">6-Dimension Deterministic Scoring</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
          Engine v26
        </span>
      </div>

      {/* Decision Flow */}
      <div className="space-y-3">
        {/* Step 1 */}
        <div className="rounded-xl border border-blue-200/70 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {isCorridorToBusiness ? "Selected Commercial Corridor" : "Target Business Concept"}
              </div>
              <div className="text-[11px] text-slate-500">
                {isCorridorToBusiness ? "Spatial context, zone anchors & footfall" : "Operating model, demand clocks & access"}
              </div>
            </div>
          </div>
          {isCorridorToBusiness ? (
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          )}
        </div>

        {/* Connector */}
        <div className="flex justify-center -my-1">
          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>

        {/* Step 2: 6 Dimension Engine */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100">
                2
              </div>
              <span className="text-xs font-bold text-slate-900">
                Cross-Signal Compatibility Engine
              </span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              100-pt Scale
            </span>
          </div>

          {/* Dimension Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-blue-600" /> 30%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Business Fit</div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <Users className="w-2.5 h-2.5 text-indigo-600" /> 25%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Audience</div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <Clock className="w-2.5 h-2.5 text-amber-600" /> 15%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Dayparts</div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <Layers className="w-2.5 h-2.5 text-emerald-600" /> 15%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Whitespace</div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-teal-600" /> 10%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Access & Safety</div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-600" /> 5%
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">Zone Anchors</div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center -my-1">
          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                {isCorridorToBusiness
                  ? "Top 3 Ranked Business Opportunities"
                  : "Top 3 Ranked Commercial Corridors"}
              </div>
              <div className="text-[11px] text-emerald-700">
                Ranked by Opportunity Score, Fit Tier, & Signal Evidence
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
      </div>
    </div>
  );
}
