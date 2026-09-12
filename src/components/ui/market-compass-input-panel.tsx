import * as React from "react";
import { Search, Loader2, Sparkles, MapPin, Building2, Users, Clock, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";
import { FriendlySelect, FriendlyOption } from "./friendly-select";
import {
  getFriendlyArchetype,
  getFriendlyAudience,
  getFriendlyDaypart,
} from "../../utils/friendly-labels";

export interface CorridorOption {
  corridor_id: string;
  name: string;
  metro_id: string;
  borough?: string;
  district?: string;
  level?: string;
}

export interface ArchetypeOption {
  archetype_id: string;
  name: string;
  category_id: string;
  decision_track?: string;
}

export interface AudienceOption {
  segment_id: string;
  label: string;
  family_id?: string;
}

export interface DaypartOption {
  id: string;
  label: string;
}

export interface MarketCompassInputPanelProps {
  mode: "corridor-to-business" | "business-to-corridor";
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
  isLoading: boolean;
  error?: string | null;
  corridors?: CorridorOption[];
  archetypes?: ArchetypeOption[];
  audiences?: AudienceOption[];
  dayparts?: DaypartOption[];
}

export function MarketCompassInputPanel({
  mode,
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
  isLoading,
  error,
  corridors = [],
  archetypes = [],
  audiences = [],
  dayparts = [],
}: MarketCompassInputPanelProps) {
  const isCorridorToBusiness = mode === "corridor-to-business";

  // City options
  const cityOptions: FriendlyOption[] = [
    {
      value: "all",
      label: "All Cities",
      subLabel: "New York City & Dallas–Fort Worth",
      icon: "🌐",
      group: "Target Metro Scope",
      description: "Search across all 137 commercial corridors in NYC & DFW",
    },
    {
      value: "nyc",
      label: "New York City",
      subLabel: "65 Corridors",
      icon: "🗽",
      group: "Target Metro Scope",
      description: "Manhattan, Brooklyn, Queens, Bronx & Staten Island",
    },
    {
      value: "dallas-fort-worth",
      label: "Dallas–Fort Worth",
      subLabel: "72 Corridors",
      icon: "🤠",
      group: "Target Metro Scope",
      description: "Dallas, Fort Worth, Arlington, Plano, Frisco & North Texas",
    },
  ];

  // Filter corridors based on city
  const filteredCorridors = React.useMemo(() => {
    if (!selectedCity || selectedCity === "all") return corridors;
    return corridors.filter((c) => c.metro_id === selectedCity);
  }, [corridors, selectedCity]);

  // Corridor options formatted friendly
  const corridorOptions: FriendlyOption[] = React.useMemo(() => {
    return filteredCorridors.map((c) => {
      const groupName =
        c.borough ||
        c.district ||
        (c.metro_id === "nyc" ? "New York City" : "Dallas–Fort Worth");
      return {
        value: c.corridor_id,
        label: c.name,
        subLabel: c.level === "SUB_CORRIDOR" ? "Sub-district" : "Macro Corridor",
        group: `${groupName.toUpperCase()} CORRIDORS`,
        icon: "📍",
        description: `Commercial corridor in ${groupName}`,
      };
    });
  }, [filteredCorridors]);

  // Archetype options formatted with friendly labels & categories
  const archetypeOptions: FriendlyOption[] = React.useMemo(() => {
    let list = archetypes;
    if (selectedCity === "nyc") {
      list = archetypes.filter((a) => a.category_id === "CAFE" || a.category_id === "CAFE_BAR");
      if (list.length === 0) list = archetypes;
    }

    return list.map((a) => {
      const meta = getFriendlyArchetype(a.archetype_id, a.name);
      return {
        value: a.archetype_id,
        label: meta.friendlyName,
        subLabel: a.name !== meta.friendlyName ? a.name : undefined,
        group: meta.categoryGroup,
        icon: meta.icon,
        description: meta.description,
      };
    });
  }, [archetypes, selectedCity]);

  // Audience options formatted friendly
  const audienceOptions: FriendlyOption[] = React.useMemo(() => {
    const list: FriendlyOption[] = [
      {
        value: "",
        label: "Any audience",
        subLabel: "All Cohorts",
        icon: "👥",
        group: "Audience Focus",
        description: "Evaluate situational fit across all resident and visitor cohorts",
      },
    ];

    audiences.forEach((aud) => {
      const meta = getFriendlyAudience(aud.segment_id, aud.label);
      list.push({
        value: aud.segment_id,
        label: meta.friendlyLabel,
        subLabel: aud.label !== meta.friendlyLabel ? aud.label : undefined,
        group: "Target Customer Cohorts",
        icon: meta.icon,
        description: `Target ${meta.friendlyLabel.toLowerCase()}`,
      });
    });

    return list;
  }, [audiences]);

  // Daypart options formatted friendly
  const daypartOptions: FriendlyOption[] = React.useMemo(() => {
    const list: FriendlyOption[] = [
      {
        value: "",
        label: "Any time",
        subLabel: "All Day",
        icon: "🕒",
        group: "Operating Window",
        description: "Evaluate footfall across all operational dayparts",
      },
    ];

    dayparts.forEach((dp) => {
      const meta = getFriendlyDaypart(dp.id, dp.label);
      list.push({
        value: dp.id,
        label: meta.friendlyLabel,
        subLabel: meta.timeRange,
        group: "Standard Operating Windows",
        icon: meta.icon,
        description: meta.timeRange,
      });
    });

    return list;
  }, [dayparts]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Panel Header */}
      <div className="pb-6 mb-6 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {isCorridorToBusiness ? "Explore Business Opportunities" : "Explore Suitable Locations"}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
          {isCorridorToBusiness
            ? "Tell us where you want to explore, and Market Compass will rank the most suitable business opportunities."
            : "Describe your business idea and Market Compass will rank the most suitable corridors."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Unable to process simulation</div>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Interactive Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* City Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input-city" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{isCorridorToBusiness ? "City" : "Search within"}</span>
            </Label>
            <span className="text-[11px] text-slate-600 font-medium">Step 1</span>
          </div>
          <FriendlySelect
            id="input-city"
            value={selectedCity}
            onChange={onCityChange}
            options={cityOptions}
            placeholder="Select a city..."
            searchPlaceholder="Search cities..."
            disabled={isLoading}
          />
        </div>

        {/* Primary Selection: Corridor (Mode 1) or Archetype (Mode 2) */}
        {isCorridorToBusiness ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-corridor" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Select a corridor <span className="text-rose-500">*</span></span>
              </Label>
              <span className="text-[11px] font-semibold text-blue-600">Required</span>
            </div>
            <FriendlySelect
              id="input-corridor"
              required
              value={selectedCorridor}
              onChange={onCorridorChange}
              options={corridorOptions}
              placeholder="Choose a commercial corridor..."
              searchPlaceholder="Type corridor name (e.g. Broadway, McKinney, Williamsburg)..."
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-archetype" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Business concept <span className="text-rose-500">*</span></span>
              </Label>
              <span className="text-[11px] font-semibold text-blue-600">Required</span>
            </div>
            <FriendlySelect
              id="input-archetype"
              required
              value={selectedArchetype}
              onChange={onArchetypeChange}
              options={archetypeOptions}
              placeholder="Select a business concept (e.g. Neighbourhood Café, Drive-Through)..."
              searchPlaceholder="Type concept (e.g. Coffee, Café, Hotel, Office, Station, Diner)..."
              disabled={isLoading}
            />
          </div>
        )}

        {/* Target Audience (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input-audience" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isCorridorToBusiness ? "Target audience (optional)" : "Target audience"}</span>
            </Label>
            <span className="text-[11px] text-slate-600">Optional Filter</span>
          </div>
          <FriendlySelect
            id="input-audience"
            value={selectedAudience}
            onChange={onAudienceChange}
            options={audienceOptions}
            placeholder="Any audience (All Cohorts)"
            searchPlaceholder="Search audience (e.g. Commuters, Remote Workers, Families)..."
            disabled={isLoading}
          />
        </div>

        {/* Operating Time (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input-daypart" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{isCorridorToBusiness ? "Preferred operating time (optional)" : "Preferred operating time"}</span>
            </Label>
            <span className="text-[11px] text-slate-600">Optional Filter</span>
          </div>
          <FriendlySelect
            id="input-daypart"
            value={selectedDaypart}
            onChange={onDaypartChange}
            options={daypartOptions}
            placeholder="Any time (All Day)"
            searchPlaceholder="Search operating time (e.g. Morning Rush, Lunch, Dinner)..."
            disabled={isLoading}
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="submit"
            disabled={isLoading || (isCorridorToBusiness ? !selectedCorridor : !selectedArchetype)}
            className="w-full sm:flex-1 h-12 text-sm font-semibold gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isCorridorToBusiness
                    ? "Analysing corridor opportunities..."
                    : "Finding suitable corridors..."}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {isCorridorToBusiness ? "Find Opportunities" : "Find Locations"}
                </span>
              </>
            )}
          </Button>

          {onReset && (
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={isLoading}
              className="w-full sm:w-auto h-12 text-sm text-slate-600 px-5"
            >
              Reset
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
