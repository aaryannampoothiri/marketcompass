/**
 * Market Compass - Input Validator & Data Integrity Guard
 */

import { STANDARD_DAYPARTS } from '../constants.js';
import { normalizeMetroId } from './loader.js';

/**
 * Validates corridor lookup input and resolves corridor entity.
 */
export function resolveCorridor(dataset, corridorInput, cityInput = null) {
  if (!corridorInput) {
    throw new Error('Corridor input (corridorId or name) is required.');
  }

  const query = corridorInput.trim();
  const normalizedCity = cityInput ? normalizeMetroId(cityInput) : null;

  // 1. Direct ID lookup
  if (dataset.corridorsById.has(query)) {
    const c = dataset.corridorsById.get(query);
    if (normalizedCity && c.metro_id !== normalizedCity) {
      throw new Error(`Corridor "${c.name}" (${query}) belongs to metro "${c.metro_id}", not "${normalizedCity}".`);
    }
    return c;
  }

  // 2. Direct legacy ID lookup (case-insensitive)
  if (dataset.corridorsById.has(query.toLowerCase())) {
    const c = dataset.corridorsById.get(query.toLowerCase());
    if (normalizedCity && c.metro_id !== normalizedCity) {
      throw new Error(`Corridor "${c.name}" (${query}) belongs to metro "${c.metro_id}", not "${normalizedCity}".`);
    }
    return c;
  }

  // 3. Name or partial match
  const candidates = dataset.corridors.filter(c => {
    if (normalizedCity && c.metro_id !== normalizedCity) return false;
    const nameMatch = c.name.toLowerCase() === query.toLowerCase();
    const subMatch = c.name.toLowerCase().includes(query.toLowerCase());
    const neighMatch = (c.neighborhoods || []).some(n => n.toLowerCase().includes(query.toLowerCase()));
    return nameMatch || subMatch || neighMatch;
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length > 1) {
    // Exact name priority
    const exact = candidates.find(c => c.name.toLowerCase() === query.toLowerCase());
    if (exact) return exact;
    const names = candidates.slice(0, 5).map(c => `"${c.name}" (${c.metro_id})`).join(', ');
    throw new Error(`Ambiguous corridor query "${query}". Matches multiple corridors: ${names}`);
  }

  throw new Error(`Corridor "${query}" not found in dataset${normalizedCity ? ` for metro "${normalizedCity}"` : ''}.`);
}

/**
 * Validates archetype lookup input and resolves archetype entity.
 */
export function resolveArchetype(dataset, archetypeInput) {
  if (!archetypeInput) {
    throw new Error('Archetype input (archetypeId or name) is required.');
  }

  const query = archetypeInput.trim();

  // 1. Direct ID lookup
  if (dataset.archetypesById.has(query)) {
    return dataset.archetypesById.get(query);
  }

  // 2. Direct name match or partial match
  const candidates = dataset.archetypes.filter(a => {
    return a.name.toLowerCase() === query.toLowerCase() ||
           a.archetype_id.toLowerCase().includes(query.toLowerCase()) ||
           a.name.toLowerCase().includes(query.toLowerCase());
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length > 1) {
    const exact = candidates.find(a => a.name.toLowerCase() === query.toLowerCase());
    if (exact) return exact;
    const names = candidates.slice(0, 5).map(a => `"${a.name}"`).join(', ');
    throw new Error(`Ambiguous archetype query "${query}". Matches multiple archetypes: ${names}`);
  }

  throw new Error(`Business archetype "${query}" not found in dataset.`);
}

/**
 * Validates target audience segment ID
 */
export function validateAudienceSegment(dataset, segmentId) {
  if (!segmentId) return null;
  const cleanId = String(segmentId).trim().toLowerCase();
  if (dataset.audienceSegmentsById.has(cleanId)) {
    return cleanId;
  }
  // Check if user passed label (e.g. "Morning commuters")
  for (const [id, seg] of dataset.audienceSegmentsById.entries()) {
    if (seg && typeof seg.label === 'string' && seg.label.toLowerCase() === cleanId) {
      return id;
    }
  }
  return { invalid: true, provided: segmentId };
}

/**
 * Validates operating time daypart
 */
export function validateOperatingTime(daypart) {
  if (!daypart) return null;
  const clean = daypart.trim().toLowerCase();
  if (STANDARD_DAYPARTS.includes(clean)) {
    return clean;
  }
  // Human aliases
  if (clean.includes('morning') || clean.includes('am') || clean.includes('breakfast')) return 'weekday_am';
  if (clean.includes('midday') || clean.includes('lunch') || clean.includes('noon')) return 'weekday_midday';
  if (clean.includes('evening') || clean.includes('dinner') || clean.includes('pm')) return 'weekday_evening';
  if (clean.includes('night') || clean.includes('late')) return 'late_night';
  if (clean.includes('weekend') || clean.includes('brunch') || clean.includes('saturday') || clean.includes('sunday')) return 'weekend_day';

  return { invalid: true, provided: daypart };
}
