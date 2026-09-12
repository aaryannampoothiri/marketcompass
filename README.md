# Market Compass 🧭
### *Find the Right Business. In the Right Place.*

> **Market Compass** is an enterprise-grade spatial intelligence and commercial recommendation engine. It pairs physical retail corridors with business concept archetypes across major metropolitan markets (New York City & Dallas–Fort Worth) using a deterministic, 6-dimensional scoring methodology.

---

## Table of Contents

1. [Executive Summary & Core Premise](#-executive-summary--core-premise)
2. [Dual Recommendation Modes](#-dual-recommendation-modes)
   - [Mode 1: Find a Business for a Place (`Corridor → Business`)](#mode-1-find-a-business-for-a-place-corridor--business)
   - [Mode 2: Find a Place for a Business (`Business → Corridor`)](#mode-2-find-a-place-for-a-business-business--corridor)
   - [Corridor Exploration Directory & Interactive Modals](#corridor-exploration-directory--interactive-modals)
3. [System Architecture & Codebase Map](#-system-architecture--codebase-map)
4. [Dataset Specifications & Taxonomy](#-dataset-specifications--taxonomy)
   - [Corridors & Spatial Topologies (137 Corridors)](#corridors--spatial-topologies-137-corridors)
   - [Business Concept Archetypes (67 Archetypes)](#business-concept-archetypes-67-archetypes)
   - [Audience Segments & Demand Clocks (55 Segments)](#audience-segments--demand-clocks-55-segments)
   - [Special Anchor Zones (62 Zones)](#special-anchor-zones-62-zones)
   - [Standard Temporal Dayparts (5 Windows)](#standard-temporal-dayparts-5-windows)
5. [The 6-Dimension Scoring & Recommendation Engine](#-the-6-dimension-scoring--recommendation-engine)
   - [Mathematical Formula & Weighting Model](#mathematical-formula--weighting-model)
   - [Dimension 1: Concept & Location Fit (30%)](#dimension-1-concept--location-fit-30)
   - [Dimension 2: Customer Demand & Footfall (25%)](#dimension-2-customer-demand--footfall-25)
   - [Dimension 3: Best Operating Hours (15%)](#dimension-3-best-operating-hours-15)
   - [Dimension 4: Competition & Market Space (15%)](#dimension-4-competition--market-space-15)
   - [Dimension 5: Nearby Attractions & Anchors (5%)](#dimension-5-nearby-attractions--anchors-5)
   - [Dimension 6: Accessibility & Walkability (10%)](#dimension-6-accessibility--walkability-10)
   - [Gating Rules & Institutional Prerequisites](#gating-rules--institutional-prerequisites)
   - [Compatibility Tiers](#compatibility-tiers)
6. [Humanization & Translation Layer](#-humanization--translation-layer)
7. [REST API Documentation](#-rest-api-documentation)
8. [Frontend Design System & UI Architecture](#-frontend-design-system--ui-architecture)
9. [Installation, Build, & Execution Guide](#-installation-build--execution-guide)
10. [Automated Test Suite & Verification](#-automated-test-suite--verification)
11. [Methodology & Safety Disclaimers](#-methodology--safety-disclaimers)

---

## 🌟 Executive Summary & Core Premise

Opening or leasing a physical business is historically fraught with location risk. Retailers frequently sign leases in high-traffic areas only to discover that the footfall consists of fast-moving rail commuters who never stop for seated dining, or late-night patrons when the concept is built for morning coffee. Conversely, landlords and developers often struggle to identify which retail concepts will thrive in vacant storefronts.

**Market Compass solves this spatial mismatch** by replacing guesswork and black-box AI hallucinations with a **100% transparent, deterministic spatial evaluation engine**.

### Why Market Compass?
- **Deterministic & Auditable**: Every score is derived from explicit mathematical formulas, verified against observed corridor demographics, spatial topology, brand ecology, and temporal demand clocks.
- **Bi-Directional Discovery**: Serves both sides of the commercial equation—property owners looking for tenants, and operators searching for locations.
- **Rich Metro Coverage**: Ships pre-loaded with **137 commercial corridors** across **New York City (65)** and **Dallas–Fort Worth (72)**, covering 67 commercial archetypes, 55 demographic segments, and 62 special landmark anchor zones.
- **Plain-English Humanization**: Translates complex spatial tokens (e.g. `ROAD_NETWORK_ORIGINS_AND_DIRECTIONAL_PASS_BY_FLOW`, `us.cafe.scheduled_rail_adjacent_street_express.v1`) into clean, actionable business English.

---

## 🔄 Dual Recommendation Modes

Market Compass delivers two complementary decision pathways:

```
                      ┌────────────────────────────────────────┐
                      │             MARKET COMPASS             │
                      │         Spatial Decision Engine        │
                      └───────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │         MODE 1         │                      │         MODE 2         │
     │  Find Business for     │                      │   Find Place for       │
     │      a Corridor        │                      │     a Business         │
     │  (Corridor → Business) │                      │ (Business → Corridor)  │
     └───────────┬────────────┘                      └───────────┬────────────┘
                 │                                               │
     Input: Corridor (+ Target / Time)               Input: Archetype (+ Metro / Target / Time)
                 │                                               │
     Output: Top 3 Business Concepts                 Output: Top 3 Optimal Corridors
     with Fit Tiers & Factor Breakdown               with Compatibility Descriptors
```

### Mode 1: Find a Business for a Place (`Corridor → Business`)
* **Primary Users**: Landlords, Commercial Real Estate Brokers, Business Improvement Districts (BIDs), City Economic Development Teams.
* **Objective**: Given a specific physical corridor (e.g., *SoHo–Broadway*, *Deep Ellum*, *Long Island City*), determine the top 3 commercial business models with the highest situational compatibility.
* **Optional Modifiers**: Target audience focus (e.g., *Morning Commuters*, *Remote Workers*) and preferred operating time window (e.g., *Weekday Morning*, *Late Night*).

### Mode 2: Find a Place for a Business (`Business → Corridor`)
* **Primary Users**: Franchise Operators, Independent Restaurateurs, Hospitality Groups, Retail Founders.
* **Objective**: Given a specific business archetype (e.g., *Specialty Coffee Roastery*, *Late-Night Street Food Spot*, *Fast-Casual Salad Bar*), identify the top 3 corridors across the metro area (or cross-metro) that maximize footfall synergy and market whitespace.
* **Optional Modifiers**: Metro filter (*New York City* or *Dallas–Fort Worth*), target demographic, and operating daypart.

### Corridor Exploration Directory & Interactive Modals
* **Directory (`#explore`)**: Searchable, filterable catalog of all 137 corridors with quick metrics for neighborhood momentum, timing alpha, pedestrian vs. vehicle orientation, daytime safety perception, and hosted special anchor zones.
* **Deep-Dive Opportunity Modal**: Full-screen modal presenting the 6-dimension score radar, plain-English positive signals & considerations, hosted anchor zone proximity, and specific operational advice.
* **Corridor Profile Modal**: Complete spatial dossier including dominant visitor profiles, behavioral indices, barrier notes, and top audience rankings.

---

## 🏗 System Architecture & Codebase Map

Market Compass is architected with a decoupled Node.js/Express backend engine and a modern React 19 + TypeScript frontend client built with `esbuild`.

```
marketcompass/
├── package.json               # Manifest & build scripts (start, dev, build:react, test)
├── server.js                  # Express.js REST server & static file host (Port 3000)
├── README.md                  # Comprehensive platform documentation
│
├── src/                       # Core engine & application source
│   ├── index.js               # Module entry point exporting all engine modules
│   ├── constants.js           # 6-dimension weights, fit tiers, daypart mappings, signal dictionaries
│   │
│   ├── engine/                # Mathematical calculation & scoring algorithms
│   │   ├── scoring.js         # 6-dimension deterministic evaluation function
│   │   ├── signals.js         # Demand clock resolution & audience signal matching
│   │   └── recommender.js     # Mode 1 & Mode 2 top-3 ranking implementations
│   │
│   ├── data/                  # Dataset ingestion & integrity guards
│   │   ├── loader.js          # In-memory indexer for JSON bundle & H3 spatial grids
│   │   └── validator.js       # Input resolver, fuzzy matcher & validation guards
│   │
│   ├── utils/                 # Presentation & transformation helpers
│   │   └── friendly-labels.ts # 500+ line humanization dictionary & text sanitizers
│   │
│   ├── components/            # React UI components
│   │   ├── mount-hero.tsx     # React DOM mounting bootstrap
│   │   └── ui/                # Component library
│   │       ├── market-compass-hero.tsx              # Main application shell, state & navigation
│   │       ├── market-compass-simulation-layout.tsx # Split-screen simulation canvas
│   │       ├── market-compass-input-panel.tsx       # Mode 1 & 2 search controls & filters
│   │       ├── market-compass-result-card.tsx       # Top-3 opportunity recommendation cards
│   │       ├── market-compass-score-breakdown.tsx   # Visual 6-dimension breakdown & badges
│   │       ├── market-compass-benefits.tsx          # Key advantages & operator guidance
│   │       ├── market-compass-mode-header.tsx       # Dynamic section headers & descriptions
│   │       ├── friendly-select.tsx                  # Accessible, searchable dropdown with icons
│   │       ├── button.tsx, badge.tsx, card.tsx, ... # Tailwind/CSS primitive tokens
│   │
│   └── mount-app.tsx          # React application client entry point
│
├── public/                    # Static web assets
│   ├── index.html             # Single-page HTML skeleton & meta headers
│   ├── css/
│   │   ├── index.css          # Design system CSS variables, glassmorphism, responsive grid
│   │   └── hero.css           # Simulation layout & component styles
│   └── js/
│       └── react-hero.js      # Bundled React application (generated via esbuild)
│
└── tests/                     # Test automation
    └── scoring.test.js        # Comprehensive 37-assertion engine test suite
```

---

## 📊 Dataset Specifications & Taxonomy

Market Compass is powered by release bundle **`usa-corridors-20260906-r2`**, indexing physical spatial data across two distinct metropolitan archetypes:

| Metropolitan Market | Corridors | Business Archetypes | Special Anchor Zones | Primary Transit Topology |
| :--- | :--- | :--- | :--- | :--- |
| **New York City (NYC)** | 65 corridors | 31 Cafés | 25 Anchor Zones | High-Density Subway / Pedestrian |
| **Dallas–Fort Worth (DFW)** | 72 corridors | 67 (31 Cafés + 36 Restaurants) | 37 Anchor Zones | Arterial Highway / Auto-Centric / Mixed |
| **Combined Platform Total** | **137 Corridors** | **67 Unique Archetypes** | **62 Anchor Zones** | **55 Standard Audiences** |

### Corridors & Spatial Topologies (137 Corridors)
Each corridor profile contains:
- **Identification**: Canonical `corridor_id` (e.g., `si.st_george_north_shore`, `dfw.deep_ellum`), `legacy_corridor_id`, and `metro_id`.
- **Classification**: Geographic hierarchy (`borough`, `district`, `neighborhoods`), commercial level (`REGIONAL_DESTINATION`, `DISTRICT_COMMERCIAL`, `NEIGHBORHOOD_LOCAL`), and physical form (`PEDESTRIAN_HIGH_STREET`, `TRANSIT_ORIENTED`, `ARTERIAL_STRIP`, `LIFESTYLE_CENTER`).
- **Behavioral Indices (0–100)**: `neighborhood_momentum`, `timing_alpha`, `transit_car_orientation`, `path_of_travel_friction`, and `crime_safety` (day & night).
- **Brand Ecology & Whitespace**: Category whitespace scores (`cafe`, `fast_casual`, `casual_dining`, `fine_dining`), corporate `chain_dominance`, and retail `halo_strength`.
- **Audience Matrix**: Normalized 0–10 presence scores across 55 audience segments, paired with confidence ratings (`HIGH`, `MEDIUM`, `LOW`).

### Business Concept Archetypes (67 Archetypes)
Categorized into two core commercial sectors:
1. **Café Archetypes (31)**: Destination Roasteries, High Street Flagships, Neighborhood Takeaway Espresso, Drive-Thru Windows, Office Lobby Kiosks, Hospital Concessions, Train Station Express Bars, Mobile Pushcarts.
2. **Restaurant Archetypes (36)**: Neighborhood Casual Full-Service, All-Day Diners, Fast-Casual Assembly Lines, Late-Night Counter Spots, Food Hall Stalls, Airport Concessions, Stadium Event Stalls, Ghost / Delivery Kitchens.

Each archetype defines:
- **Decision Track**: `OPEN_MARKET_SITE` (standard lease), `CONTROLLED_HOST` (requires airport, stadium, or university host), or `LIVE_OPPORTUNITY`.
- **Primary & Supporting Signals**: Required customer habits (e.g., `TRANSIT_PASSENGER`, `DAYTIME_WORKER`, `NIGHTTIME_OPEN_ORIGINS`).
- **Demand Clocks**: Operational peak periods (e.g., `AM_COMMUTE`, `WEEKDAY_LUNCH`, `LATE_NIGHT`, `WEEKEND_BRUNCH`).

### Audience Segments & Demand Clocks (55 Segments)
Divided into 12 overarching demographic and behavioral families:
- **Commuter Flows**: `morning_commuters`, `evening_commuters`, `rail_transfer`, `early_morning_routine`.
- **Workplace & Corporate**: `office_routine`, `business_meetings`, `hybrid_remote`, `retail_service_workers`.
- **Residents & Families**: `neighborhood_routine`, `family_household`, `resident_value`, `resident_premium`.
- **Tourism & Culture**: `tourist_mainstream`, `tourist_premium`, `cultural_visitors`, `sightseeing_visitors`.
- **Events & Nightlife**: `stadium_event`, `theater_event`, `after_work_social`, `late_night_social`, `dining_social`.
- **Institutional & Industrial**: `hospital_workers`, `outpatient_visits`, `student_value`, `industrial_logistics_workers`.

### Special Anchor Zones (62 Zones)
High-impact traffic generators indexed to host corridors:
- **Airports**: JFK, LaGuardia, Newark, DFW International, Dallas Love Field.
- **Stadiums & Arenas**: Yankee Stadium, Madison Square Garden, Barclays Center, AT&T Stadium, American Airlines Center.
- **Academic Campuses**: Columbia University, NYU, UT Dallas, TCU, SMU.
- **Hospital Complexes**: Mount Sinai, Bellevue/NYU Langone, UT Southwestern Medical District.
- **Shopping & Lifestyle Centers**: NorthPark Center, Legacy West, Hudson Yards.

### Standard Temporal Dayparts (5 Windows)
1. **`weekday_am`**: 6:00 AM – 10:30 AM (*Morning Rush / Breakfast / Commute*)
2. **`weekday_midday`**: 11:00 AM – 2:30 PM (*Lunch / Midday Errands*)
3. **`weekday_evening`**: 5:00 PM – 9:30 PM (*Dinner / Happy Hour / Social*)
4. **`late_night`**: 10:00 PM – 4:00 AM (*Nightlife / Shift Workers*)
5. **`weekend_day`**: 9:00 AM – 5:00 PM (*Weekend Leisure / Brunch / Shopping*)

---

## ⚙ The 6-Dimension Scoring & Recommendation Engine

The engine computes an objective 0–100 compatibility score for any corridor-archetype pairing using a weighted linear combination of 6 discrete dimensions.

### Mathematical Formula & Weighting Model

$$\text{Final Opportunity Score} = \sum_{k=1}^{6} \left( \text{Dimension Score}_k \times \text{Weight}_k \right)$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SCORING DIMENSION WEIGHT ALLOCATION                  │
├──────────────────────────────────────┬────────┬────────────────────────┤
│ Dimension                            │ Weight │ Focus Area             │
├──────────────────────────────────────┼────────┼────────────────────────┤
│ 1. Concept & Location Fit            │  30%   │ Spatial & Track Fit    │
│ 2. Customer Demand & Footfall        │  25%   │ Demographic Alignment  │
│ 3. Best Operating Hours              │  15%   │ Temporal Daypart Match │
│ 4. Competition & Market Space        │  15%   │ Whitespace & Ecology   │
│ 5. Nearby Attractions & Anchors      │   5%   │ Special Zone Synergy   │
│ 6. Accessibility & Walkability       │  10%   │ Flow, Transit & Safety │
├──────────────────────────────────────┴────────┴────────────────────────┤
│ Total Weight: 100% (1.00)                                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Dimension 1: Concept & Location Fit (30%)
* **Implementation**: `src/engine/scoring.js` (Lines 40–97)
* **Logic**:
  1. Checks for precomputed corridor-archetype synergy pairs from dataset exports.
  2. If precomputed data is absent, synthesizes score using category whitespace and spatial layout compatibility.
  3. Validates the archetype's `decision_track`. If the concept is marked `CONTROLLED_HOST` (such as an airport terminal restaurant or stadium food kiosk) and the corridor lacks the mandatory host facility, the concept is **Gated Out** and capped at $\le 20$ points.

### Dimension 2: Customer Demand & Footfall (25%)
* **Implementation**: `src/engine/scoring.js` (Lines 101–145) & `src/engine/signals.js` (Lines 53–127)
* **Logic**:
  1. Archetype primary signals are mapped to corresponding audience segments and scored (0–100), weighted at **70%**.
  2. Supporting signals are mapped and scored, weighted at **30%**.
  3. Segment scores are adjusted by audience confidence levels (`HIGH` = 1.0x, `MEDIUM` = 0.9x, `LOW` = 0.8x).
  4. If the user provides a specific target audience, the score blends **60% Archetype Signal Alignment** + **40% Target Audience Presence**.

### Dimension 3: Best Operating Hours (15%)
* **Implementation**: `src/engine/scoring.js` (Lines 149–212)
* **Logic**:
  1. Maps the archetype's `demand_clocks` into standard dayparts (`DEMAND_CLOCK_TO_DAYPARTS`).
  2. Measures the corridor's observed customer activity density during those hours (`daypart_occasion_density`).
  3. If the user selects a preferred operating time, the engine checks whether the business model naturally operates in that window:
     - **Matching Daypart**: Full density score applied.
     - **Off-Peak Daypart**: Scaled by **0.60x** penalty to reflect lower footfall efficiency.

### Dimension 4: Competition & Market Space (15%)
* **Implementation**: `src/engine/scoring.js` (Lines 215–256)
* **Logic**:
  1. Retrieves category-specific unmet demand index (`whitespace_quality[category]`).
  2. Incorporates corridor brand ecology (`chain_dominance` and `halo_strength`).
  3. Corridors with high retail halo strength ($\gt 60$) provide a positive synergistic bonus to independent concepts.

### Dimension 5: Nearby Attractions & Anchors (5%)
* **Implementation**: `src/engine/scoring.js` (Lines 259–294)
* **Logic**:
  1. Identifies hosted landmark destinations in the corridor (airports, arenas, transit terminals, university campuses).
  2. General corridors receive a baseline 55 points. Corridors hosting recognized landmark generators receive 75–90 points.

### Dimension 6: Accessibility & Walkability (10%)
* **Implementation**: `src/engine/scoring.js` (Lines 297–344)
* **Logic**:
  1. Evaluates gateway dependency (`access.gateway_dependency`): Low/None yields a $+10$ bonus; High dependency incurs a $-10$ adjustment.
  2. Incorporates travel friction: Low friction ($\lt 40$) yields a $+10$ bonus; high friction ($\gt 65$) incurs a $-10$ penalty.
  3. Neighborhood momentum ($\ge 65$) adds a $+5$ vitality bonus.

---

### Gating Rules & Institutional Prerequisites

Certain commercial models cannot operate on standard commercial open streets without an institutional host:

```
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Gated Archetype                      │ Mandatory Corridor Requirement                         │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Airport Terminal Concessions         │ Active Airport Special Zone (e.g., JFK, LGA, DFW)      │
│ Stadium & Arena Kiosks               │ Active Sports / Entertainment Arena (e.g., MSG, AT&T)  │
│ Subway In-Station Express            │ High Transit / Turnstile Gateway Infrastructure       │
│ Hospital Captive Canteens            │ Regional Medical Center / Hospital Anchor Zone         │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
*When gating conditions fail, the concept receives the `GATED_OUT` classification with an explicit explanation of missing host infrastructure.*

---

### Compatibility Tiers

| Score Range | Tier Key | Display Label | Operator Interpretation |
| :---: | :--- | :--- | :--- |
| **75 – 100** | `STRONG_FIT` | **Strong Fit** 🟢 | Outstanding synergy across footfall, operating hours, and spatial character. |
| **60 – 74** | `MODERATE_FIT` | **Moderate Fit** 🟡 | Commercially viable with balanced strengths and manageable operational tradeoffs. |
| **45 – 59** | `WEAK_FIT` | **Weak Fit** 🟠 | Noticeable friction; requires deliberate concept adaptation or marketing. |
| **0 – 44** | `INSUFFICIENT_CONTEXT` | **Insufficient Data** ⚪ | Incomplete data coverage or low signal certainty. |
| *Gated* | `GATED_OUT` | **Gated Out** 🔴 | Fails mandatory institutional hosting prerequisites. |

---

## 🗣 Humanization & Translation Layer

To make complex geospatial intelligence accessible to all stakeholders, Market Compass includes an active humanization engine located in `src/utils/friendly-labels.ts`.

### How It Works:
1. **Archetype Transformation**: Converts raw IDs like `us.restaurant.assembly_line_fast_casual.v1` into `"Build-Your-Own Fast Casual (Bowls/Burritos)"` with category groupings and custom emoji icons (`🌯`).
2. **Audience Transformation**: Converts `morning_commuters` into `"Morning Commuters & Transit Riders"` (`🚆`).
3. **Daypart Transformation**: Converts `weekday_evening` into `"Evening Rush & Dinner (5:00 PM – 9:30 PM)"` (`🌆`).
4. **Card Signal Sanitizer (`cleanCardSignal`)**: Strips regex code artifacts, underscores, and technical jargon from signal notes, turning raw tokens into clean, executive-ready insights.

---

## 🔌 REST API Documentation

The Express.js server exposes clean, JSON REST endpoints:

### 1. System Coverage Stats
`GET /api/stats`
```json
{
  "success": true,
  "data": {
    "bundleId": "usa-corridors-20260906-r2",
    "exportedAt": "2026-09-06T18:30:00Z",
    "cities": [
      { "id": "nyc", "name": "New York City", "corridorCount": 65, "archetypeCount": 31 },
      { "id": "dallas-fort-worth", "name": "Dallas–Fort Worth", "corridorCount": 72, "archetypeCount": 67 }
    ],
    "corridorsCount": 137,
    "archetypesCount": 67,
    "audienceSegmentsCount": 55,
    "specialZonesCount": 62,
    "mappedPlacesCount": 5206
  }
}
```

### 2. Search & Filter Corridors
`GET /api/corridors?city=nyc&search=broadway&form=PEDESTRIAN_HIGH_STREET&sortBy=momentum`

### 3. Corridor Profile Detail
`GET /api/corridors/:id` (Accepts canonical `corridor_id` or legacy slug)

### 4. Business Archetypes List
`GET /api/archetypes?city=dallas-fort-worth&category=restaurant`

### 5. Audience Segments List
`GET /api/audiences`

### 6. Standard Dayparts
`GET /api/dayparts`

### 7. Mode 1 Recommendation (`Corridor → Business`)
`POST /api/recommend/corridor-to-business`
* **Request Body**:
```json
{
  "city": "nyc",
  "corridor": "si.st_george_north_shore",
  "targetAudience": "morning_commuters",
  "operatingTime": "weekday_am",
  "limit": 3
}
```
* **Response**:
```json
{
  "success": true,
  "mode": "CORRIDOR_TO_BUSINESS",
  "corridorInput": "si.st_george_north_shore",
  "recommendations": [
    {
      "rank": 1,
      "archetypeId": "us.cafe.scheduled_rail_adjacent_street_express.v1",
      "name": "Quick Coffee Shop Near Railway Stations",
      "category": "CAFE",
      "score": 78.4,
      "fitTier": "STRONG_FIT",
      "fitTierLabel": "Strong Fit",
      "recommendedTargetAudience": "morning_commuters, rail_transfer",
      "recommendedOperatingTime": "Weekday Morning (AM Commute / Breakfast)",
      "explanation": "Strong spatial and audience synergy. High customer footfall during morning transit hours.",
      "positiveSignals": [
        "Strong primary customer match for commuter habits.",
        "High customer activity during morning commute hours."
      ],
      "concerns": [],
      "dimensions": {
        "businessFit": { "name": "Concept & Location Fit", "score": 85, "weightedContribution": 25.5 },
        "audienceCompatibility": { "name": "Customer Demand & Footfall", "score": 82, "weightedContribution": 20.5 },
        "operatingTimeCompatibility": { "name": "Best Operating Hours", "score": 78, "weightedContribution": 11.7 },
        "supplyAndWhitespace": { "name": "Competition & Market Space", "score": 65, "weightedContribution": 9.75 },
        "specialZoneRelevance": { "name": "Nearby Attractions & Anchors", "score": 70, "weightedContribution": 3.5 },
        "accessAndContext": { "name": "Accessibility & Walkability", "score": 75, "weightedContribution": 7.5 }
      }
    }
  ]
}
```

### 8. Mode 2 Recommendation (`Business → Corridor`)
`POST /api/recommend/business-to-corridor`
* **Request Body**:
```json
{
  "city": "dallas-fort-worth",
  "archetype": "us.restaurant.neighborhood_casual_full_service.v1",
  "operatingTime": "weekday_evening",
  "limit": 3
}
```

### 9. Evaluate Specific Pair
`POST /api/evaluate-pair`
* **Request Body**:
```json
{
  "corridorId": "dfw.deep_ellum",
  "archetypeId": "us.restaurant.high_street_evening_social.v1"
}
```

---

## 🎨 Frontend Design System & UI Architecture

Market Compass delivers a clean, high-contrast, state-of-the-art web interface:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         NAVIGATION & METRO BAR                         │
├────────────────────────────────────────────────────────────────────────┤
│  [Logo: Market Compass]    [Mode 1: Find Business]  [Mode 2: Find Place]│
│                            [Explore Corridors]      [Methodology]       │
├──────────────────────────────────┬─────────────────────────────────────┤
│  INPUT CANVAS (Left Column)      │  SIMULATION CANVAS (Right Column)   │
│  - Mode Selection Tabs           │  - Top-3 Ranked Recommendation Cards│
│  - Searchable Metro/Corridor     │  - Score Badges & Fit Tiers         │
│  - Friendly Select Dropdowns     │  - Plain-English Highlights         │
│  - Audience Focus Filter         │  - Expandable 6-Dimension Breakdowns│
│  - Operating Time Filter         │  - Interactive Modal Triggers       │
│  - "Run Simulation" Button       │                                     │
├──────────────────────────────────┴─────────────────────────────────────┤
│  CORRIDOR EXPLORATION DIRECTORY (Search, Multi-Filter, Quick Metrics)  │
├────────────────────────────────────────────────────────────────────────┤
│  METHODOLOGY & TRANSPARENCY (6 Dimension Weights, Tiers, Disclaimers)  │
└────────────────────────────────────────────────────────────────────────┘
```

### UI Features:
- **Responsive Split Canvas**: Side-by-side configuration panel and real-time recommendation feed.
- **Glassmorphism & Color Palette**: High-contrast slate neutrals (`#0f172a`, `#1e293b`), vibrant brand indigo (`#4f46e5`), emerald success tokens (`#10b981`), and amber warning indicators (`#f59e0b`).
- **Interactive Modals**: Full-screen modal components for deep-dive opportunity reports and comprehensive corridor dossiers.
- **Micro-Animations**: Smooth scale-in transitions, hover effects, and responsive layout adjustments.

---

## 🚀 Installation, Build, & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aaryannampoothiri/marketcompass.git
cd marketcompass
npm install
```

### 2. Build the React Frontend Bundle
Market Compass uses `esbuild` for lightning-fast compilation of TypeScript/JSX components into `public/js/react-hero.js`:
```bash
npm run build:react
```

### 3. Start the Web Application
```bash
npm start
# Server boots at: http://localhost:3000
```

### 4. Development Workflow
To rebuild UI changes and run the local server concurrently:
```bash
npm run build:react
npm run dev
```

---

## 🧪 Automated Test Suite & Verification

The platform includes an automated regression test suite covering dataset integrity, Mode 1 and Mode 2 rankings, edge cases, gating logic, and mathematical determinism:

```bash
npm test
```

### Test Coverage Highlights:
- ✅ **Dataset Indexing**: Validates 137 corridors, 55 audience segments, 67 archetypes, and 62 special zones.
- ✅ **Mode 1 Recommendations**: Asserts exactly 3 normalized recommendations with all 6 dimension metrics.
- ✅ **Mode 2 Recommendations**: Verifies cross-metro and single-metro ranking pipelines.
- ✅ **Edge Case Resilience**:
  - Handles non-existent target audience IDs without throwing errors.
  - Handles invalid operating dayparts with intelligent fallback scoring.
  - Handles schema asymmetries (e.g., DFW null places root vs. NYC null spending power).
- ✅ **Institutional Gating**: Asserts that airport/stadium concessions are gated out when host anchors are missing.
- ✅ **100% Determinism**: Asserts identical output across duplicate execution runs.

---

## 📜 Methodology & Safety Disclaimers

Market Compass strictly adheres to transparent spatial intelligence guidelines:

1. **Observed Supply Sampling**: Supply and competitor presence metrics are derived from observed and sampled commercial directories, not an exhaustive census of all operating licenses.
2. **Curated Spatial Modeling**: Behavioral velocity, crime perception, timing alpha, and whitespace metrics represent expert geospatial assessments.
3. **No Revenue Guarantee**: Opportunity scores measure spatial, temporal, and demographic compatibility; they do not guarantee customer conversion volume, foot traffic totals, or commercial revenue.

---

### License & Acknowledgements
Developed by the **Market Compass Engineering Team**. Built with React 19, TypeScript, Lucide Icons, and Express.js.