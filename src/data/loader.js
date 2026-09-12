/**
 * Market Compass - Data Loader & Normalized Registry
 * Reads, verifies, and indexes portable corridor exports.
 */

import fs from 'fs';
import path from 'path';

export const DEFAULT_DATASET_DIR = 'C:/Users/ARYAN/Downloads/starter-kit/usa-corridors-20260906-r2';

let cachedDataset = null;

/**
 * Normalizes city/metro input string to canonical metro_id
 */
export function normalizeMetroId(input) {
  if (!input) return null;
  const str = input.toLowerCase().trim();
  if (str === 'nyc' || str === 'new york' || str === 'new york city' || str === 'ny') {
    return 'nyc';
  }
  if (
    str === 'dfw' ||
    str === 'dallas' ||
    str === 'fort worth' ||
    str === 'dallas-fort-worth' ||
    str === 'dallas_fort_worth' ||
    str === 'dallas fort worth'
  ) {
    return 'dallas-fort-worth';
  }
  return str;
}

/**
 * Loads and indexes all JSON dataset files from disk.
 * @param {string} datasetDir - Directory containing the dataset files.
 * @returns {object} Normalized dataset index
 */
export function loadDataset(datasetDir = DEFAULT_DATASET_DIR) {
  if (cachedDataset && cachedDataset._dir === datasetDir) {
    return cachedDataset;
  }

  const manifestPath = path.join(datasetDir, 'EXPORT_MANIFEST.json');
  const nycPath = path.join(datasetDir, 'NYC_CORRIDORS.full.json');
  const dfwPath = path.join(datasetDir, 'DALLAS_FORT_WORTH_CORRIDORS.full.json');
  const h3Path = path.join(datasetDir, 'NYC_CORRIDOR_H3_10_OWNERSHIP.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Dataset manifest not found at: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const nycData = JSON.parse(fs.readFileSync(nycPath, 'utf8'));
  const dfwData = JSON.parse(fs.readFileSync(dfwPath, 'utf8'));
  const h3Data = fs.existsSync(h3Path) ? JSON.parse(fs.readFileSync(h3Path, 'utf8')) : null;

  const dataset = {
    _dir: datasetDir,
    manifest,
    exportedAt: manifest.exported_at,
    bundleId: manifest.bundle_id,
    
    // Corridors
    corridors: [...nycData.corridors, ...dfwData.corridors],
    corridorsById: new Map(),
    corridorsByMetro: {
      'nyc': nycData.corridors,
      'dallas-fort-worth': dfwData.corridors
    },

    // Audience Segments (shared 55 taxonomy)
    audienceSegments: dfwData.audience_segments || nycData.audience_segments,
    audienceSegmentsById: new Map(),

    // Archetypes
    archetypes: [...nycData.archetypes, ...(dfwData.archetypes.filter(a => a.category_id === 'RESTAURANT'))],
    archetypesById: new Map(),
    archetypesByMetro: {
      'nyc': nycData.archetypes,
      'dallas-fort-worth': dfwData.archetypes
    },

    // Precomputed Scores
    scoresByKey: new Map(),
    scoresList: [...nycData.corridor_archetype_scores, ...dfwData.corridor_archetype_scores],

    // Special Zones
    specialZones: [...nycData.special_zones, ...dfwData.special_zones],
    specialZonesById: new Map(),
    specialZonesByCorridorId: new Map(),

    // Map Contexts
    mapContextByCorridorId: new Map(),
    h3Ownership: h3Data
  };

  // 1. Index corridors
  for (const c of dataset.corridors) {
    dataset.corridorsById.set(c.corridor_id, c);
    if (c.legacy_corridor_id) {
      dataset.corridorsById.set(c.legacy_corridor_id.toLowerCase(), c);
    }
  }

  // 2. Index audience segments
  for (const seg of dataset.audienceSegments) {
    dataset.audienceSegmentsById.set(seg.segment_id, seg);
  }

  // 3. Index archetypes
  // DFW includes 67 (31 cafe + 36 restaurant); NYC has 31 cafe
  for (const arch of dfwData.archetypes) {
    dataset.archetypesById.set(arch.archetype_id, arch);
  }
  for (const arch of nycData.archetypes) {
    if (!dataset.archetypesById.has(arch.archetype_id)) {
      dataset.archetypesById.set(arch.archetype_id, arch);
    }
  }

  // 4. Index precomputed scores: key = `${corridor_id}::${archetype_id}`
  for (const s of dataset.scoresList) {
    dataset.scoresByKey.set(`${s.corridor_id}::${s.archetype_id}`, s);
  }

  // 5. Index special zones
  for (const z of dataset.specialZones) {
    dataset.specialZonesById.set(z.zone_id, z);
    for (const corrId of z.host_corridor_ids || []) {
      if (!dataset.specialZonesByCorridorId.has(corrId)) {
        dataset.specialZonesByCorridorId.set(corrId, []);
      }
      dataset.specialZonesByCorridorId.get(corrId).push(z);
    }
    for (const legId of z.legacy_host_corridor_ids || []) {
      const corr = dataset.corridorsById.get(legId.toLowerCase());
      if (corr && !dataset.specialZonesByCorridorId.get(corr.corridor_id)?.includes(z)) {
        if (!dataset.specialZonesByCorridorId.has(corr.corridor_id)) {
          dataset.specialZonesByCorridorId.set(corr.corridor_id, []);
        }
        dataset.specialZonesByCorridorId.get(corr.corridor_id).push(z);
      }
    }
  }

  // 6. Index map contexts
  if (nycData.map?.corridor_context) {
    for (const ctx of nycData.map.corridor_context) {
      dataset.mapContextByCorridorId.set(ctx.corridor_id, ctx);
    }
  }
  if (dfwData.map?.corridor_context) {
    for (const ctx of dfwData.map.corridor_context) {
      if (ctx.corridor_id) {
        dataset.mapContextByCorridorId.set(ctx.corridor_id, ctx);
      }
    }
  }

  cachedDataset = dataset;
  return dataset;
}
