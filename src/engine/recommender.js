/**
 * Market Compass - Recommendation Engine
 * 
 * Supports two dual recommendation pathways:
 * MODE 1: Corridor → Top 3 Business Archetypes
 * MODE 2: Business Archetype → Top 3 Corridors
 */

import { loadDataset, normalizeMetroId } from '../data/loader.js';
import { resolveCorridor, resolveArchetype, validateAudienceSegment, validateOperatingTime } from '../data/validator.js';
import { scoreCorridorArchetypePair } from './scoring.js';

/**
 * Helper to turn a numeric score into a qualitative descriptor
 */
function getDescriptor(score) {
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Moderate';
  if (score >= 45) return 'Fair';
  return 'Low';
}

/**
 * MODE 1: Given a Corridor, recommend the Top N Business Archetypes
 * 
 * @param {object} params
 * @param {string} [params.city] - City / metro ('nyc' | 'dallas-fort-worth')
 * @param {string} params.corridor - Corridor ID, slug, or name
 * @param {string} [params.targetAudience] - Optional target audience segment ID or name
 * @param {string} [params.operatingTime] - Optional target daypart (e.g., 'weekday_am')
 * @param {number} [params.limit=3] - Number of recommendations to return (default 3)
 * @param {string} [params.datasetDir] - Optional dataset directory
 * @returns {Array<object>} Exactly top N ranked business archetype recommendations
 */
export function recommendBusinessesForCorridor({
  city = null,
  corridor: corridorInput,
  targetAudience = null,
  operatingTime = null,
  limit = 3,
  datasetDir = undefined
}) {
  const dataset = loadDataset(datasetDir);
  const corridor = resolveCorridor(dataset, corridorInput, city);

  // Validate optional filters
  let validatedAudience = null;
  if (targetAudience) {
    const audRes = validateAudienceSegment(dataset, targetAudience);
    if (audRes && !audRes.invalid) {
      validatedAudience = audRes;
    }
  }

  let validatedTime = null;
  if (operatingTime) {
    const timeRes = validateOperatingTime(operatingTime);
    if (timeRes && !timeRes.invalid) {
      validatedTime = timeRes;
    }
  }

  // Determine candidate archetypes:
  // For NYC: 31 cafes
  // For DFW: 67 archetypes (cafes + restaurants)
  const candidateArchetypes = dataset.archetypesByMetro[corridor.metro_id] || dataset.archetypes;

  // Score all candidate archetypes for this corridor
  const evaluations = candidateArchetypes.map(archetype => {
    return scoreCorridorArchetypePair(corridor, archetype, dataset, {
      targetAudience: validatedAudience,
      operatingTime: validatedTime
    });
  });

  // Sort descending by total score
  evaluations.sort((a, b) => b.score - a.score);

  // Take top N
  const topResults = evaluations.slice(0, limit).map((evalItem, index) => {
    return {
      rank: index + 1,
      archetypeId: evalItem.archetypeId,
      name: evalItem.archetypeName,
      category: evalItem.category,
      score: evalItem.score,
      fitTier: evalItem.fitTier,
      fitTierLabel: evalItem.fitTierLabel,
      recommendedTargetAudience: evalItem.recommendedAudience,
      recommendedOperatingTime: evalItem.recommendedOperatingTime,
      explanation: evalItem.explanation,
      positiveSignals: evalItem.positiveSignals,
      concerns: evalItem.concerns,
      dimensions: evalItem.dimensions,
      disclaimers: evalItem.disclaimers
    };
  });

  return topResults;
}

/**
 * MODE 2: Given a Business Archetype, recommend the Top N Corridors
 * 
 * @param {object} params
 * @param {string} [params.city] - City / metro ('nyc' | 'dallas-fort-worth' | null for all cities)
 * @param {string} params.archetype - Business archetype ID, name, or slug
 * @param {string} [params.targetAudience] - Optional target audience segment ID or name
 * @param {string} [params.operatingTime] - Optional target daypart
 * @param {number} [params.limit=3] - Number of recommendations to return (default 3)
 * @param {string} [params.datasetDir] - Optional dataset directory
 * @returns {Array<object>} Exactly top N ranked corridor recommendations
 */
export function recommendCorridorsForBusiness({
  city = null,
  archetype: archetypeInput,
  targetAudience = null,
  operatingTime = null,
  limit = 3,
  datasetDir = undefined
}) {
  const dataset = loadDataset(datasetDir);
  const archetype = resolveArchetype(dataset, archetypeInput);

  // Validate optional filters
  let validatedAudience = null;
  if (targetAudience) {
    const audRes = validateAudienceSegment(dataset, targetAudience);
    if (audRes && !audRes.invalid) {
      validatedAudience = audRes;
    }
  }

  let validatedTime = null;
  if (operatingTime) {
    const timeRes = validateOperatingTime(operatingTime);
    if (timeRes && !timeRes.invalid) {
      validatedTime = timeRes;
    }
  }

  // Filter corridors by city if requested
  const normalizedCity = city ? normalizeMetroId(city) : null;
  const candidateCorridors = normalizedCity
    ? (dataset.corridorsByMetro[normalizedCity] || [])
    : dataset.corridors;

  if (candidateCorridors.length === 0) {
    throw new Error(`No corridors available for requested metro "${city}".`);
  }

  // Score all candidate corridors for this archetype
  const evaluations = candidateCorridors.map(corridor => {
    return scoreCorridorArchetypePair(corridor, archetype, dataset, {
      targetAudience: validatedAudience,
      operatingTime: validatedTime
    });
  });

  // Sort descending by total score
  evaluations.sort((a, b) => b.score - a.score);

  // Take top N
  const topResults = evaluations.slice(0, limit).map((evalItem, index) => {
    const audScore = evalItem.dimensions.audienceCompatibility.score;
    const fitScore = evalItem.dimensions.businessFit.score;
    const timeScore = evalItem.dimensions.operatingTimeCompatibility.score;

    return {
      rank: index + 1,
      corridorId: evalItem.corridorId,
      corridorName: evalItem.corridorName,
      city: evalItem.city,
      score: evalItem.score,
      fitTier: evalItem.fitTier,
      fitTierLabel: evalItem.fitTierLabel,
      audienceCompatibility: {
        score: audScore,
        label: getDescriptor(audScore),
        explanation: evalItem.dimensions.audienceCompatibility.explanation
      },
      businessFit: {
        score: fitScore,
        label: getDescriptor(fitScore),
        explanation: evalItem.dimensions.businessFit.explanation
      },
      operatingTimeCompatibility: {
        score: timeScore,
        label: getDescriptor(timeScore),
        explanation: evalItem.dimensions.operatingTimeCompatibility.explanation
      },
      explanation: evalItem.explanation,
      positiveSignals: evalItem.positiveSignals,
      concerns: evalItem.concerns,
      dimensions: evalItem.dimensions,
      disclaimers: evalItem.disclaimers
    };
  });

  return topResults;
}
