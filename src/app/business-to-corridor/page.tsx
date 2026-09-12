"use client";

import * as React from "react";
import {
  MarketCompassSimulationLayout,
  SimulationMode,
} from "../../components/ui/market-compass-simulation-layout";
import {
  CorridorOption,
  ArchetypeOption,
  AudienceOption,
  DaypartOption,
} from "../../components/ui/market-compass-input-panel";
import { RecommendationResult } from "../../components/ui/market-compass-result-card";

export default function BusinessToCorridorPage() {
  const [selectedCity, setSelectedCity] = React.useState<string>("all");
  const [selectedArchetype, setSelectedArchetype] = React.useState<string>(
    "us.cafe.scheduled_rail_adjacent_street_express.v1"
  );
  const [selectedAudience, setSelectedAudience] = React.useState<string>("");
  const [selectedDaypart, setSelectedDaypart] = React.useState<string>("");

  const [corridors, setCorridors] = React.useState<CorridorOption[]>([]);
  const [archetypes, setArchetypes] = React.useState<ArchetypeOption[]>([]);
  const [audiences, setAudiences] = React.useState<AudienceOption[]>([]);
  const [dayparts, setDayparts] = React.useState<DaypartOption[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<RecommendationResult[] | null>(null);
  const [hasSearched, setHasSearched] = React.useState<boolean>(false);

  // Load datasets on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        const [corrRes, archRes, audRes, dayRes] = await Promise.all([
          fetch("/api/corridors").then((r) => r.json()),
          fetch("/api/archetypes").then((r) => r.json()),
          fetch("/api/audiences").then((r) => r.json()),
          fetch("/api/dayparts").then((r) => r.json()),
        ]);

        if (corrRes.success && corrRes.data) setCorridors(corrRes.data);
        if (archRes.success && archRes.data) setArchetypes(archRes.data);
        if (audRes.success && audRes.data) setAudiences(audRes.data);
        if (dayRes.success && dayRes.data) setDayparts(dayRes.data);
      } catch (err: any) {
        console.error("Failed to load datasets:", err);
      }
    }
    loadData();
  }, []);

  const handleFindLocations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedArchetype) {
      setError("Please select a business concept archetype.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/recommend/business-to-corridor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity !== "all" ? selectedCity : null,
          archetype: selectedArchetype,
          targetAudience: selectedAudience || null,
          operatingTime: selectedDaypart || null,
          limit: 3,
        }),
      });

      const data = await response.json();

      if (data.success && data.recommendations) {
        setResults(data.recommendations);
      } else {
        setResults([]);
        setError(data.error || "No suitable corridors found for the selected inputs.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach the Market Compass scoring engine.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCity("all");
    setSelectedArchetype("");
    setSelectedAudience("");
    setSelectedDaypart("");
    setResults(null);
    setHasSearched(false);
    setError(null);
  };

  // Demo presets
  const presets = [
    {
      label: "Morning Transit Street Express",
      badge: "Cross-Metro",
      onClick: () => {
        setSelectedCity("all");
        setSelectedArchetype("us.cafe.scheduled_rail_adjacent_street_express.v1");
        setSelectedAudience("morning_commuters");
        setSelectedDaypart("weekday_am");
        setTimeout(() => handleFindLocations(), 50);
      },
    },
    {
      label: "Neighborhood Seated Coffeehouse",
      badge: "NYC Focus",
      onClick: () => {
        setSelectedCity("nyc");
        setSelectedArchetype("us.cafe.neighborhood_seated.v1");
        setSelectedAudience("hybrid_remote");
        setSelectedDaypart("weekday_midday");
        setTimeout(() => handleFindLocations(), 50);
      },
    },
    {
      label: "Arterial Parking-Led Restaurant",
      badge: "DFW Focus",
      onClick: () => {
        setSelectedCity("dallas-fort-worth");
        setSelectedArchetype("us.restaurant.arterial_parking_led_inline.v1");
        setSelectedAudience("family_household");
        setSelectedDaypart("weekday_evening");
        setTimeout(() => handleFindLocations(), 50);
      },
    },
  ];

  const benefitPoints = [
    { text: "Discover corridors that match your business concept.", highlight: "corridors that match" },
    { text: "Compare audience compatibility across locations.", highlight: "audience compatibility" },
    { text: "Find operating times that align with corridor activity.", highlight: "operating times that align" },
    { text: "Consider nearby anchors and surrounding context.", highlight: "nearby anchors" },
    { text: "Review observed supply before exploring potential whitespace.", highlight: "observed supply before" },
    { text: "Understand why each corridor was recommended.", highlight: "why each corridor" },
  ];

  const selectedArchObj = archetypes.find((a) => a.archetype_id === selectedArchetype);

  return (
    <MarketCompassSimulationLayout
      mode="business-to-corridor"
      tagline="Workflow 2: Business → Corridor"
      title="Find a Place for a Business"
      subtitle="Tell us what kind of business you have in mind, who you want to serve, and when you expect to operate. Market Compass will identify corridors with the strongest available fit."
      description="Tell us what kind of business you have in mind, who you want to serve, and when you expect to operate. Market Compass will identify corridors with the strongest available fit."
      benefitPoints={benefitPoints}
      presets={presets}
      selectedCity={selectedCity}
      onCityChange={setSelectedCity}
      selectedCorridor=""
      onCorridorChange={() => {}}
      selectedArchetype={selectedArchetype}
      onArchetypeChange={setSelectedArchetype}
      selectedAudience={selectedAudience}
      onAudienceChange={setSelectedAudience}
      selectedDaypart={selectedDaypart}
      onDaypartChange={setSelectedDaypart}
      onSubmit={handleFindLocations}
      onReset={handleReset}
      corridors={corridors}
      archetypes={archetypes}
      audiences={audiences}
      dayparts={dayparts}
      isLoading={isLoading}
      error={error}
      results={results}
      hasSearched={hasSearched}
      resultsHeaderTitle={
        selectedArchObj
          ? `Top 3 Recommended Corridors for "${selectedArchObj.name}"`
          : "Top Recommended Corridors"
      }
    />
  );
}
