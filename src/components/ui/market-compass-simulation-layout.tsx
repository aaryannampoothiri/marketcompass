import * as React from "react";
import { Sparkles, MapPin, Building2, AlertCircle } from "lucide-react";
import { MarketCompassModeHeader, DemoPreset } from "./market-compass-mode-header";
import { MarketCompassBenefits, BenefitPoint } from "./market-compass-benefits";
import {
  MarketCompassInputPanel,
  CorridorOption,
  ArchetypeOption,
  AudienceOption,
  DaypartOption,
} from "./market-compass-input-panel";
import { MarketCompassResultCard, RecommendationResult } from "./market-compass-result-card";

export type SimulationMode = "corridor-to-business" | "business-to-corridor";

export interface MarketCompassSimulationLayoutProps {
  mode: SimulationMode;
  tagline?: string;
  title: string;
  subtitle: string;
  description: string;
  benefitPoints: BenefitPoint[];
  presets?: DemoPreset[];

  // Form State & Handlers
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedCorridor: string;
  onCorridorChange: (corridorId: string) => void;
  selectedArchetype: string;
  onArchetypeChange: (archetypeId: string) => void;
  selectedAudience: string;
  onAudienceChange: (audienceId: string) => void;
  selectedDaypart: string;
  onDaypartChange: (daypartId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset?: () => void;

  // Data Options
  corridors?: CorridorOption[];
  archetypes?: ArchetypeOption[];
  audiences?: AudienceOption[];
  dayparts?: DaypartOption[];

  // Simulation Status & Results
  isLoading: boolean;
  error?: string | null;
  results?: RecommendationResult[] | null;
  hasSearched: boolean;
  resultsHeaderTitle?: string;
  onOpenReport?: (corridorId: string, archetypeId: string) => void;
}

export function MarketCompassSimulationLayout({
  mode,
  tagline,
  title,
  subtitle,
  description,
  benefitPoints,
  presets = [],
  selectedCity,
  onCityChange,
  selectedCorridor,
  onCorridorChange,
  selectedArchetype,
  onArchetypeChange,
  selectedAudience,
  onAudienceChange,
  selectedDaypart,
  onDaypartChange,
  onSubmit,
  onReset,
  corridors = [],
  archetypes = [],
  audiences = [],
  dayparts = [],
  isLoading,
  error,
  results,
  hasSearched,
  resultsHeaderTitle,
  onOpenReport,
}: MarketCompassSimulationLayoutProps) {
  const isCorridorToBusiness = mode === "corridor-to-business";
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to results upon successful return
  React.useEffect(() => {
    if (results && results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  return (
    <div className="w-full bg-slate-50/40 min-h-screen text-slate-900 font-sans antialiased py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs py-8 lg:py-12">
        {/* Large Centered Header */}
        <MarketCompassModeHeader
          mode={mode}
          tagline={tagline}
          title={title}
          subtitle={subtitle}
          presets={presets}
        />

        {/* Two-Column Desktop Grid Layout */}
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14 items-start">
          {/* Left Column: Context, Tagline & Benefits */}
          <div className="space-y-6 pr-0 lg:pr-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                {isCorridorToBusiness ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Location Intelligence Simulation</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Expansion Strategy Simulation</span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {isCorridorToBusiness
                  ? "Turn a location into an opportunity."
                  : "Turn a business idea into a location strategy."}
              </h2>
            </div>

            <MarketCompassBenefits
              description={description}
              points={benefitPoints}
            />
          </div>

          {/* Right Column: Interactive Form */}
          <div className="w-full lg:pl-6">
            <MarketCompassInputPanel
              mode={mode}
              selectedCity={selectedCity}
              onCityChange={onCityChange}
              selectedCorridor={selectedCorridor}
              onCorridorChange={onCorridorChange}
              selectedArchetype={selectedArchetype}
              onArchetypeChange={onArchetypeChange}
              selectedAudience={selectedAudience}
              onAudienceChange={onAudienceChange}
              selectedDaypart={selectedDaypart}
              onDaypartChange={onDaypartChange}
              onSubmit={onSubmit}
              onReset={onReset}
              isLoading={isLoading}
              error={error}
              corridors={corridors}
              archetypes={archetypes}
              audiences={audiences}
              dayparts={dayparts}
            />
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultsRef} className="mt-16 pt-10 border-t border-slate-200">
          {isLoading && (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 animate-pulse shadow-sm">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isCorridorToBusiness
                  ? "Analysing corridor opportunities..."
                  : "Finding suitable corridors..."}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2">
                Evaluating customer signals, operating time overlap, supply whitespace, special zones, and access notes across dataset records.
              </p>
            </div>
          )}

          {!isLoading && hasSearched && results && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Ranked Results</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {resultsHeaderTitle ||
                      (isCorridorToBusiness
                        ? "Top Business Opportunities"
                        : "Top Recommended Corridors")}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing top <strong>3</strong> algorithmic recommendations
                </div>
              </div>

              {/* 3 Result Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <MarketCompassResultCard
                    key={result.rank}
                    result={result}
                    mode={mode}
                    selectedCorridorId={selectedCorridor}
                    selectedArchetypeId={selectedArchetype}
                    selectedAudience={selectedAudience}
                    selectedDaypart={selectedDaypart}
                    onOpenReport={onOpenReport}
                  />
                ))}
              </div>
            </div>
          )}

          {!isLoading && hasSearched && results && results.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-10 text-center">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isCorridorToBusiness
                  ? "No recommendations available for the selected inputs."
                  : "No suitable corridors found for the selected inputs."}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1.5">
                Try widening your search filters or switching your target audience or operating time to discover compatible opportunities.
              </p>
            </div>
          )}

          {!isLoading && !hasSearched && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center mx-auto mb-3">
                {isCorridorToBusiness ? (
                  <MapPin className="w-6 h-6 text-blue-600" />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ready to Run Location Simulation
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1.5">
                {isCorridorToBusiness
                  ? "Select a city and corridor in the form above or click a demo scenario to calculate the top 3 situational business matches."
                  : "Select a business concept in the form above or click a demo scenario to identify the top 3 commercial corridors."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
