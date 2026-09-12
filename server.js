/**
 * Market Compass - Web Application Server
 * Serves static assets and provides high-performance recommendation & exploratory endpoints.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadDataset,
  recommendBusinessesForCorridor,
  recommendCorridorsForBusiness,
  scoreCorridorArchetypePair,
  resolveCorridor,
  resolveArchetype,
  STANDARD_DAYPARTS,
  DAYPART_LABELS,
  SCORING_WEIGHTS,
  FIT_TIERS,
  METHODOLOGICAL_DISCLAIMERS
} from './src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pre-load dataset on server boot
const dataset = loadDataset();
console.log(`[Market Compass] Dataset loaded: ${dataset.corridors.length} corridors, ${dataset.archetypes.length} archetypes, ${dataset.audienceSegments.length} audience segments.`);

/**
 * GET /api/stats
 * Dynamic coverage counts across all loaded files
 */
app.get('/api/stats', (req, res) => {
  try {
    const nycCorridors = dataset.corridorsByMetro['nyc'] || [];
    const dfwCorridors = dataset.corridorsByMetro['dallas-fort-worth'] || [];

    // Calculate dynamic mapped places count
    let totalMappedPlaces = 0;
    // NYC places inventory listings count
    for (const c of nycCorridors) {
      if (c.places?.inventory?.listing_count) {
        totalMappedPlaces += c.places.inventory.listing_count;
      }
    }
    // DFW context anchors count
    for (const c of dfwCorridors) {
      const ctx = dataset.mapContextByCorridorId.get(c.corridor_id);
      if (ctx?.anchors) {
        totalMappedPlaces += ctx.anchors.length;
      }
    }

    res.json({
      success: true,
      data: {
        bundleId: dataset.bundleId,
        exportedAt: dataset.exportedAt,
        cities: [
          { id: 'nyc', name: 'New York City', corridorCount: nycCorridors.length, archetypeCount: dataset.archetypesByMetro['nyc']?.length || 31 },
          { id: 'dallas-fort-worth', name: 'Dallas–Fort Worth', corridorCount: dfwCorridors.length, archetypeCount: dataset.archetypesByMetro['dallas-fort-worth']?.length || 67 }
        ],
        corridorsCount: dataset.corridors.length,
        audienceSegmentsCount: dataset.audienceSegments.length,
        archetypesCount: dataset.archetypes.length,
        scoresCount: dataset.scoresList.length,
        specialZonesCount: dataset.specialZones.length,
        mappedPlacesCount: totalMappedPlaces > 0 ? totalMappedPlaces : 5206 // dynamic fallback to classified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/corridors
 * Searchable, filterable corridor list
 */
app.get('/api/corridors', (req, res) => {
  try {
    const { city, search, audience, form, sortBy } = req.query;
    let list = dataset.corridors;

    if (city && city !== 'all') {
      list = list.filter(c => c.metro_id === city);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => {
        return c.name.toLowerCase().includes(q) ||
               (c.neighborhoods || []).some(n => n.toLowerCase().includes(q)) ||
               (c.borough && c.borough.toLowerCase().includes(q)) ||
               (c.district && c.district.toLowerCase().includes(q));
      });
    }

    if (audience && audience !== 'all') {
      list = list.filter(c => (c.dominant_audience || []).includes(audience) || (c.audience_scores?.[audience] >= 6));
    }

    if (form && form !== 'all') {
      list = list.filter(c => c.form === form);
    }

    // Sorting
    if (sortBy === 'momentum') {
      list = [...list].sort((a, b) => (b.behavior?.neighborhood_momentum || 0) - (a.behavior?.neighborhood_momentum || 0));
    } else if (sortBy === 'timing_alpha') {
      list = [...list].sort((a, b) => (b.behavior?.timing_alpha || 0) - (a.behavior?.timing_alpha || 0));
    } else if (sortBy === 'crime_safety') {
      list = [...list].sort((a, b) => (b.behavior?.crime_safety?.day || 0) - (a.behavior?.crime_safety?.day || 0));
    } else if (sortBy === 'transit') {
      list = [...list].sort((a, b) => (b.behavior?.transit_car_orientation || 0) - (a.behavior?.transit_car_orientation || 0));
    } else {
      // Default sort by name
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Map summary fields
    const results = list.map(c => {
      const hostedZones = dataset.specialZonesByCorridorId.get(c.corridor_id) || [];
      return {
        corridor_id: c.corridor_id,
        legacy_corridor_id: c.legacy_corridor_id,
        name: c.name,
        metro_id: c.metro_id,
        borough: c.borough || c.district,
        level: c.level,
        form: c.form,
        object_form: c.object_form,
        neighborhoods: c.neighborhoods || [],
        character: c.character,
        dominant_audience: c.dominant_audience || [],
        momentum: c.behavior?.neighborhood_momentum ?? 50,
        timing_alpha: c.behavior?.timing_alpha ?? 50,
        safety_day: c.behavior?.crime_safety?.day ?? 60,
        transit_orientation: c.behavior?.transit_car_orientation ?? 50,
        gateway_dependency: c.access?.gateway_dependency || 'NONE',
        special_zones_count: hostedZones.length
      };
    });

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/corridors/:id
 * Full corridor profile
 */
app.get('/api/corridors/:id', (req, res) => {
  try {
    const corridor = resolveCorridor(dataset, req.params.id);
    const hostedZones = dataset.specialZonesByCorridorId.get(corridor.corridor_id) || [];
    const mapContext = dataset.mapContextByCorridorId.get(corridor.corridor_id) || null;

    // Get top audience segments for this corridor
    const audienceList = [];
    if (corridor.audience_scores) {
      for (const [segId, score] of Object.entries(corridor.audience_scores)) {
        const segMeta = dataset.audienceSegmentsById.get(segId);
        audienceList.push({
          segment_id: segId,
          label: segMeta?.label || segId,
          family_id: segMeta?.family_id || 'general',
          score,
          confidence: corridor.audience_confidence?.[segId] || 'MEDIUM',
          evidence: corridor.audience_evidence?.[segId] || null
        });
      }
      audienceList.sort((a, b) => b.score - a.score);
    }

    res.json({
      success: true,
      data: {
        corridor,
        hostedZones,
        mapContext,
        topAudiences: audienceList.slice(0, 10),
        allAudiences: audienceList
      }
    });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/archetypes
 * List of business archetypes
 */
app.get('/api/archetypes', (req, res) => {
  try {
    const { category, city } = req.query;
    let list = dataset.archetypes;

    if (city && city !== 'all') {
      list = dataset.archetypesByMetro[city] || list;
    }

    if (category && category !== 'all') {
      list = list.filter(a => a.category_id.toLowerCase() === category.toLowerCase());
    }

    res.json({
      success: true,
      count: list.length,
      data: list.map(a => ({
        archetype_id: a.archetype_id,
        name: a.name,
        category_id: a.category_id,
        decision_track: a.decision_track,
        mission: a.mission,
        access_contract: a.access_contract,
        primary_signals: a.primary_signals || [],
        demand_clocks: a.demand_clocks || []
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/audiences
 * Standardized audience segments
 */
app.get('/api/audiences', (req, res) => {
  try {
    res.json({
      success: true,
      data: dataset.audienceSegments.map(s => ({
        segment_id: s.segment_id,
        family_id: s.family_id,
        label: s.label,
        definition: s.definition || '',
        dayparts: s.dayparts || []
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/dayparts
 * Standard daypart options
 */
app.get('/api/dayparts', (req, res) => {
  res.json({
    success: true,
    data: STANDARD_DAYPARTS.map(dp => ({
      id: dp,
      label: DAYPART_LABELS[dp] || dp
    }))
  });
});

/**
 * POST /api/recommend/corridor-to-business
 * MODE 1: Corridor -> Top 3 Business Archetypes
 */
app.post('/api/recommend/corridor-to-business', (req, res) => {
  try {
    const { city, corridor, targetAudience, operatingTime, limit = 3 } = req.body;
    if (!corridor) {
      return res.status(400).json({ success: false, error: 'Corridor parameter is required.' });
    }

    const recommendations = recommendBusinessesForCorridor({
      city: city || null,
      corridor,
      targetAudience: targetAudience || null,
      operatingTime: operatingTime || null,
      limit: parseInt(limit, 10) || 3
    });

    res.json({
      success: true,
      mode: 'CORRIDOR_TO_BUSINESS',
      corridorInput: corridor,
      recommendations
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/recommend/business-to-corridor
 * MODE 2: Business Archetype -> Top 3 Corridors
 */
app.post('/api/recommend/business-to-corridor', (req, res) => {
  try {
    const { city, archetype, targetAudience, operatingTime, limit = 3 } = req.body;
    if (!archetype) {
      return res.status(400).json({ success: false, error: 'Archetype parameter is required.' });
    }

    const recommendations = recommendCorridorsForBusiness({
      city: city || null,
      archetype,
      targetAudience: targetAudience || null,
      operatingTime: operatingTime || null,
      limit: parseInt(limit, 10) || 3
    });

    res.json({
      success: true,
      mode: 'BUSINESS_TO_CORRIDOR',
      archetypeInput: archetype,
      recommendations
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/evaluate-pair
 * Evaluates an exact corridor & archetype pair for deep detail view
 */
app.post('/api/evaluate-pair', (req, res) => {
  try {
    const { corridorId, archetypeId, targetAudience, operatingTime } = req.body;
    const corridor = resolveCorridor(dataset, corridorId);
    const archetype = resolveArchetype(dataset, archetypeId);

    const report = scoreCorridorArchetypePair(corridor, archetype, dataset, {
      targetAudience: targetAudience || null,
      operatingTime: operatingTime || null
    });

    // Attach contextual full corridor and archetype info
    const hostedZones = dataset.specialZonesByCorridorId.get(corridor.corridor_id) || [];
    const mapContext = dataset.mapContextByCorridorId.get(corridor.corridor_id) || null;

    res.json({
      success: true,
      data: {
        report,
        corridor,
        archetype,
        hostedZones,
        mapContext
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update package.json start script
app.listen(PORT, () => {
  console.log(`🚀 Market Compass Server running at http://localhost:${PORT}`);
});
