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

export default function CorridorToBusinessPage() {
  const [selectedCity, setSelectedCity] = React.useState<string>("nyc");
  const [selectedCorridor, setSelectedCorridor] = React.useState<string>("si.st_george_north_shore");
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

  // When city changes, clear corridor if not in selected city
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const validInCity = corridors.filter(
      (c) => city === "all" || c.metro_id === city
    );
    if (!validInCity.some((c) => c.corridor_id === selectedCorridor)) {
      setSelectedCorridor(validInCity[0]?.corridor_id || "");
    }
  };

  // Submission handler to call scoring engine
  const handleFindOpportunities = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedCorridor) {
      setError("Please select a commercial corridor to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/recommend/corridor-to-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity !== "all" ? selectedCity : null,
          corridor: selectedCorridor,
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
        setError(data.error || "No recommendations could be computed.");
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
    setSelectedCorridor("");
    setSelectedAudience("");
    setSelectedDaypart("");
    setResults(null);
    setHasSearched(false);
    setError(null);
  };

  // Demo presets
  const presets = [
    {
      label: "St. George North Shore",
      badge: "NYC Ferry",
      onClick: () => {
        setSelectedCity("nyc");
        setSelectedCorridor("si.st_george_north_shore");
        setSelectedAudience("morning_commuters");
        setSelectedDaypart("weekday_am");
        setTimeout(() => handleFindOpportunities(), 50);
      },
    },
    {
      label: "Times Square–Hell's Kitchen",
      badge: "NYC High Volume",
      onClick: () => {
        setSelectedCity("nyc");
        setSelectedCorridor("L0LspQpQc63r");
        setSelectedAudience("tourist_mainstream");
        setSelectedDaypart("weekday_evening");
        setTimeout(() => handleFindOpportunities(), 50);
      },
    },
    {
      label: "McKinney Historic Downtown",
      badge: "DFW Family",
      onClick: () => {
        setSelectedCity("dallas-fort-worth");
        setSelectedCorridor("dfw.mckinney");
        setSelectedAudience("family_household");
        setSelectedDaypart("weekend_day");
        setTimeout(() => handleFindOpportunities(), 50);
      },
    },
  ];

  const benefitPoints = [
    { text: "Discover business ideas suited to a specific corridor.", highlight: "Discover business ideas" },
    { text: "Match opportunities with local audiences and activity patterns.", highlight: "local audiences and activity" },
    { text: "Compare the top three recommended business archetypes.", highlight: "top three recommended" },
    { text: "Understand the signals behind every recommendation.", highlight: "signals behind every" },
    { text: "Explore nearby anchors such as campuses, hospitals, malls, and stadiums.", highlight: "nearby anchors" },
    { text: "Identify potential whitespace using observed mapped-place data.", highlight: "potential whitespace" },
  ];

  const selectedCorridorObj = corridors.find((c) => c.corridor_id === selectedCorridor);

  return (
    <MarketCompassSimulationLayout
      mode="corridor-to-business"
      tagline="Workflow 1: Corridor → Business"
      title="Find a Business for a Place"
      subtitle="Select a city and corridor to discover business opportunities that align with its audience, timing, existing observed supply, and surrounding context."
      description="Select a city and corridor to discover business opportunities that align with its audience, timing, existing observed supply, and surrounding context."
      benefitPoints={benefitPoints}
      presets={presets}
      selectedCity={selectedCity}
      onCityChange={handleCityChange}
      selectedCorridor={selectedCorridor}
      onCorridorChange={setSelectedCorridor}
      selectedArchetype=""
      onArchetypeChange={() => {}}
      selectedAudience={selectedAudience}
      onAudienceChange={setSelectedAudience}
      selectedDaypart={selectedDaypart}
      onDaypartChange={setSelectedDaypart}
      onSubmit={handleFindOpportunities}
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
        selectedCorridorObj
          ? `Top 3 Business Opportunities for ${selectedCorridorObj.name}`
          : "Top Business Opportunities"
      }
    />
  );
}
