/**
 * Market Compass - Deterministic Multi-Dimensional Scoring Engine
 * 
 * Computes transparent, deterministic scores across 6 distinct dimensions:
 * 1. Business/Archetype Fit (30%)
 * 2. Audience Compatibility (25%)
 * 3. Operating-Time Compatibility (15%)
 * 4. Observed Supply & Whitespace (15%)
 * 5. Special-Zone Relevance (5%)
 * 6. Access & Corridor Context (10%)
 */

import {
  SCORING_WEIGHTS,
  FIT_TIERS,
  STANDARD_DAYPARTS,
  DAYPART_LABELS,
  METHODOLOGICAL_DISCLAIMERS
} from '../constants.js';
import { resolveArchetypeDayparts, evaluateAudienceSignalMatch } from './signals.js';

/**
 * Evaluates a single Corridor-Archetype pair across all 6 dimensions.
 * 
 * @param {object} corridor - Full corridor record
 * @param {object} archetype - Full archetype record
 * @param {object} dataset - Loaded dataset registry
 * @param {object} options - Optional filters { targetAudience, operatingTime }
 * @returns {object} Comprehensive evaluation report with dimensional breakdown
 */
export function scoreCorridorArchetypePair(corridor, archetype, dataset, options = {}) {
  const { targetAudience, operatingTime } = options;
  const positiveSignals = [];
  const concerns = [];
  const dimensions = {};

  // =========================================================================
  // DIMENSION 1: Business / Archetype Fit (Weight: 30%)
  // =========================================================================
  const scoreKey = `${corridor.corridor_id}::${archetype.archetype_id}`;
  const precomputed = dataset.scoresByKey?.get(scoreKey);

  let rawFitScore = 50;
  let isGatedOut = false;
  let gatingReason = null;

  if (precomputed) {
    rawFitScore = Math.round(precomputed.score * 1000) / 10; // Convert 0-1 to 0-100
    if (precomputed.tier === 'GATED_OUT' || precomputed.screening_eligible === false) {
      if (archetype.decision_track === 'CONTROLLED_HOST' && !precomputed.host_context_present) {
        isGatedOut = true;
        gatingReason = `Requires controlled institutional host (${archetype.decision_object || archetype.name}), which is not present in ${corridor.name}.`;
      }
    }
  } else {
    // If no precomputed pair exists (e.g. restaurant in NYC), estimate based on archetype category & corridor whitespace
    const categoryWhitespace = (corridor.behavior?.whitespace_quality?.[archetype.category_id.toLowerCase()] || 50);
    rawFitScore = categoryWhitespace;
  }

  // Decision track checks
  const hostedZones = dataset.specialZonesByCorridorId?.get(corridor.corridor_id) || [];
  if (archetype.decision_track === 'CONTROLLED_HOST') {
    const hasAirport = hostedZones.some(z => z.zone_type === 'AIRPORT');
    const hasStadium = hostedZones.some(z => z.zone_type === 'STADIUM_OR_ARENA');
    const hasTransit = corridor.access?.gateway_dependency === 'HIGH' || corridor.form === 'TRANSIT_ORIENTED';

    if (archetype.archetype_id.includes('airport') && !hasAirport) {
      isGatedOut = true;
      gatingReason = 'Airport terminal concession requires active airport gateway host.';
    } else if (archetype.archetype_id.includes('arena') && !hasStadium) {
      isGatedOut = true;
      gatingReason = 'Arena concession requires dedicated stadium/arena special zone.';
    }
  }

  let finalFitScore = rawFitScore;
  if (isGatedOut) {
    finalFitScore = Math.min(finalFitScore, 20);
    concerns.push(`Gating restriction: ${gatingReason}`);
  } else if (finalFitScore >= 70) {
    positiveSignals.push(`Strong spatial fit with the commercial character of ${corridor.name}.`);
  }

  dimensions.businessFit = {
    name: 'Concept & Location Fit',
    score: Math.round(finalFitScore * 10) / 10,
    weight: SCORING_WEIGHTS.BUSINESS_FIT,
    weightedContribution: Math.round(finalFitScore * SCORING_WEIGHTS.BUSINESS_FIT * 10) / 10,
    supportingFields: ['corridor_archetype_scores.score', 'archetypes.decision_track', 'archetypes.required_gate'],
    isGatedOut,
    gatingReason,
    explanation: isGatedOut
      ? `Gated out: ${gatingReason}`
      : `Natural spatial and layout compatibility for this business concept in ${corridor.name}.`
  };

  // =========================================================================
  // DIMENSION 2: Audience Compatibility (Weight: 25%)
  // =========================================================================
  const signalMatch = evaluateAudienceSignalMatch(corridor, archetype);
  let audienceScore = signalMatch.score;
  let audienceExplanation = '';

  // Merge general signal positives and concerns
  positiveSignals.push(...signalMatch.positiveSignals.slice(0, 2));
  concerns.push(...signalMatch.concerns.slice(0, 2));

  if (targetAudience) {
    const userAudScore = corridor.audience_scores?.[targetAudience];
    const userAudConf = corridor.audience_confidence?.[targetAudience] || 'MEDIUM';
    const targetLabel = dataset.audienceSegmentsById?.get(targetAudience)?.label || targetAudience;

    if (typeof userAudScore === 'number') {
      const userAudScaled = userAudScore * 10;
      // Blend 60% archetype signals + 40% user target audience
      audienceScore = (signalMatch.score * 0.60) + (userAudScaled * 0.40);

      if (userAudScore >= 6) {
        positiveSignals.push(`Target audience "${targetLabel}" is strongly represented in this corridor.`);
      } else if (userAudScore <= 3) {
        concerns.push(`Target audience "${targetLabel}" has limited observed presence in ${corridor.name}.`);
      }
      audienceExplanation = `Strong customer demand driven by active "${targetLabel}" visitors in the area.`;
    } else {
      audienceExplanation = `Evaluated customer demand signals across core neighborhood visitor segments.`;
    }
  } else {
    // Top dominant audience mention
    const dominant = corridor.dominant_audience || [];
    if (dominant.length > 0) {
      positiveSignals.push(`Corridor draws active everyday customer traffic from local residents and commuters.`);
    }
    audienceExplanation = `Healthy daily customer traffic matching this business model's target customers.`;
  }

  dimensions.audienceCompatibility = {
    name: 'Customer Demand & Footfall',
    score: Math.round(audienceScore * 10) / 10,
    weight: SCORING_WEIGHTS.AUDIENCE_COMPATIBILITY,
    weightedContribution: Math.round(audienceScore * SCORING_WEIGHTS.AUDIENCE_COMPATIBILITY * 10) / 10,
    supportingFields: ['corridors.audience_scores', 'corridors.audience_confidence', 'archetypes.primary_signals'],
    explanation: audienceExplanation
  };

  // =========================================================================
  // DIMENSION 3: Operating-Time Compatibility (Weight: 15%)
  // =========================================================================
  const archetypeDayparts = resolveArchetypeDayparts(archetype.demand_clocks);
  const daypartDensities = corridor.behavior?.daypart_occasion_density || {};

  let timingScore = 50;
  let timingExplanation = '';

  if (operatingTime) {
    const rawTimeDensity = daypartDensities[operatingTime];
    const operatesInDaypart = archetypeDayparts.includes(operatingTime);
    const timeLabel = DAYPART_LABELS[operatingTime] || operatingTime;

    if (typeof rawTimeDensity === 'number') {
      timingScore = operatesInDaypart
        ? rawTimeDensity
        : Math.max(10, rawTimeDensity * 0.6);

      if (operatesInDaypart && rawTimeDensity >= 60) {
        positiveSignals.push(`High customer activity during ${timeLabel.toLowerCase()} hours.`);
      } else if (!operatesInDaypart) {
        concerns.push(`Operational focus: Business model is typically optimized for morning or midday traffic rather than ${timeLabel.toLowerCase()}.`);
      } else if (rawTimeDensity < 40) {
        concerns.push(`Lighter corridor pedestrian volume during ${timeLabel.toLowerCase()} hours.`);
      }

      timingExplanation = operatesInDaypart
        ? `Peak street activity aligns directly with your intended ${timeLabel.toLowerCase()} operating hours.`
        : `Primary street footfall occurs outside requested ${timeLabel.toLowerCase()} hours.`;
    } else {
      timingScore = 50;
      timingExplanation = `Active street hours provide steady opportunities throughout standard business windows.`;
    }
  } else {
    // Average density over archetype's required dayparts
    let totalDensity = 0;
    let count = 0;
    for (const dp of archetypeDayparts) {
      if (typeof daypartDensities[dp] === 'number') {
        totalDensity += daypartDensities[dp];
        count++;
      }
    }
    timingScore = count > 0 ? totalDensity / count : 50;

    const topDaypart = archetypeDayparts
      .map(dp => ({ dp, val: daypartDensities[dp] || 0 }))
      .sort((a, b) => b.val - a.val)[0];

    if (topDaypart && topDaypart.val >= 65) {
      positiveSignals.push(`Strong customer activity during peak ${DAYPART_LABELS[topDaypart.dp] || topDaypart.dp} windows.`);
    }

    timingExplanation = `Foot traffic is strongest during morning commute, lunch, and early evening hours.`;
  }

  dimensions.operatingTimeCompatibility = {
    name: 'Best Operating Hours',
    score: Math.round(timingScore * 10) / 10,
    weight: SCORING_WEIGHTS.OPERATING_TIME,
    weightedContribution: Math.round(timingScore * SCORING_WEIGHTS.OPERATING_TIME * 10) / 10,
    supportingFields: ['corridors.behavior.daypart_occasion_density', 'archetypes.demand_clocks'],
    recommendedDayparts: archetypeDayparts,
    explanation: timingExplanation
  };

  // =========================================================================
  // DIMENSION 4: Observed Supply & Whitespace (Weight: 15%)
  // =========================================================================
  const categoryKey = archetype.category_id ? archetype.category_id.toLowerCase() : 'cafe';
  const whitespaceQual = corridor.behavior?.whitespace_quality || {};
  const categoryWhitespace = typeof whitespaceQual[categoryKey] === 'number'
    ? whitespaceQual[categoryKey]
    : (typeof whitespaceQual.cafe === 'number' ? whitespaceQual.cafe : 50);

  const brandEcology = corridor.behavior?.brand_ecology || {};
  const chainDominance = brandEcology.chain_dominance ?? 50;
  const haloStrength = brandEcology.halo_strength ?? 50;

  // Supply calculation: High whitespace + healthy brand halo - extreme chain saturation
  let supplyScore = categoryWhitespace;
  if (haloStrength > 60) {
    supplyScore = (supplyScore * 0.85) + (haloStrength * 0.15);
  }

  if (categoryWhitespace >= 60) {
    positiveSignals.push(`Healthy market opportunity with room for a new high-quality concept.`);
  } else if (categoryWhitespace <= 35) {
    concerns.push(`Competitive local market with established existing offerings in this category.`);
  }

  if (chainDominance >= 65) {
    concerns.push(`Strong corporate chain presence in the immediate vicinity.`);
  } else if (haloStrength >= 65) {
    positiveSignals.push(`Beneficial neighborhood retail co-tenants generate regular daily foot traffic.`);
  }

  dimensions.supplyAndWhitespace = {
    name: 'Competition & Market Space',
    score: Math.round(supplyScore * 10) / 10,
    weight: SCORING_WEIGHTS.SUPPLY_WHITESPACE,
    weightedContribution: Math.round(supplyScore * SCORING_WEIGHTS.SUPPLY_WHITESPACE * 10) / 10,
    supportingFields: ['corridors.behavior.whitespace_quality', 'corridors.behavior.brand_ecology'],
    categoryEvaluated: categoryKey,
    whitespaceIndex: categoryWhitespace,
    explanation: categoryWhitespace >= 60
      ? `High unmet market demand with strong potential for new independent operators.`
      : `Established commercial corridor with solid baseline customer patronage.`
  };

  // =========================================================================
  // DIMENSION 5: Special-Zone Relevance (Weight: 5%)
  // =========================================================================
  let specialZoneScore = 50;
  let zoneExplanation = '';

  if (hostedZones.length > 0) {
    const zoneNames = hostedZones.map(z => z.name).join(', ');
    specialZoneScore = 75;

    // Check if archetype track specifically matches zone
    if (archetype.decision_track === 'CONTROLLED_HOST' || archetype.decision_track === 'LIVE_OPPORTUNITY') {
      specialZoneScore = 90;
      positiveSignals.push(`Direct institutional anchor present: ${zoneNames}.`);
    } else {
      positiveSignals.push(`Nearby destination generator brings regular visitors: ${zoneNames}.`);
    }
    zoneExplanation = `Benefits from major nearby landmark destinations: ${zoneNames}.`;
  } else {
    if (archetype.decision_track === 'CONTROLLED_HOST') {
      specialZoneScore = 20;
      zoneExplanation = `No matching specialized anchor facilities required for this concept.`;
    } else {
      specialZoneScore = 55;
      zoneExplanation = `Standard urban neighborhood street with steady organic local footfall.`;
    }
  }

  dimensions.specialZoneRelevance = {
    name: 'Nearby Attractions & Anchors',
    score: Math.round(specialZoneScore * 10) / 10,
    weight: SCORING_WEIGHTS.SPECIAL_ZONE,
    weightedContribution: Math.round(specialZoneScore * SCORING_WEIGHTS.SPECIAL_ZONE * 10) / 10,
    supportingFields: ['special_zones', 'archetypes.decision_track'],
    hostedZones: hostedZones.map(z => ({ id: z.zone_id, name: z.name, type: z.zone_type })),
    explanation: zoneExplanation
  };

  // =========================================================================
  // DIMENSION 6: Access & Corridor Context (Weight: 10%)
  // =========================================================================
  const access = corridor.access || {};
  const gatewayDep = access.gateway_dependency || 'LOW';
  const friction = corridor.behavior?.path_of_travel_friction ?? 50;
  const transitOrientation = corridor.behavior?.transit_car_orientation ?? 50;
  const crimeSafetyDay = corridor.behavior?.crime_safety?.day ?? 60;
  const momentum = corridor.behavior?.neighborhood_momentum ?? 50;

  let accessScore = 60;
  // Gateway bonus/penalty
  if (gatewayDep === 'NONE' || gatewayDep === 'LOW') accessScore += 10;
  if (gatewayDep === 'HIGH') accessScore -= 10;

  // Friction adjustment (lower friction = better flow)
  if (friction < 40) accessScore += 10;
  if (friction > 65) {
    accessScore -= 10;
    concerns.push(`Street layout or geographic features create moderate pedestrian navigation friction.`);
  }

  // Momentum bonus
  if (momentum >= 65) {
    accessScore += 5;
    positiveSignals.push(`Positive neighborhood momentum with expanding commercial vitality.`);
  }

  accessScore = Math.min(100, Math.max(0, accessScore));

  if (access.barrier_note) {
    const cleanNote = access.barrier_note.replace(/_/g, ' ');
    cleanNote.length < 100
      ? concerns.push(cleanNote)
      : concerns.push(`${cleanNote.slice(0, 95)}...`);
  }

  dimensions.accessAndContext = {
    name: 'Accessibility & Walkability',
    score: Math.round(accessScore * 10) / 10,
    weight: SCORING_WEIGHTS.ACCESS_CONTEXT,
    weightedContribution: Math.round(accessScore * SCORING_WEIGHTS.ACCESS_CONTEXT * 10) / 10,
    supportingFields: ['corridors.access', 'corridors.behavior.path_of_travel_friction', 'corridors.behavior.neighborhood_momentum'],
    gatewayDependency: gatewayDep,
    transitCarOrientation: transitOrientation,
    explanation: transitOrientation > 50
      ? `Transit-friendly corridor with excellent pedestrian walkability and sidewalk access.`
      : `High visibility street with convenient vehicle access and parking options.`
  };

  // =========================================================================
  // FINAL SCORE SYNTHESIS
  // =========================================================================
  let totalScore = 0;
  for (const dim of Object.values(dimensions)) {
    totalScore += dim.weightedContribution;
  }
  totalScore = Math.min(100, Math.max(0, Math.round(totalScore * 10) / 10));

  // Determine Fit Tier
  let tierKey = 'MODERATE_FIT';
  if (isGatedOut) {
    tierKey = 'GATED_OUT';
  } else if (totalScore >= FIT_TIERS.STRONG_FIT.minScore) {
    tierKey = 'STRONG_FIT';
  } else if (totalScore >= FIT_TIERS.MODERATE_FIT.minScore) {
    tierKey = 'MODERATE_FIT';
  } else if (totalScore >= FIT_TIERS.WEAK_FIT.minScore) {
    tierKey = 'WEAK_FIT';
  } else {
    tierKey = 'INSUFFICIENT_CONTEXT';
  }

  // Generate short overall explanation
  let overallExplanation = '';
  if (isGatedOut) {
    overallExplanation = `Gated out: ${gatingReason}`;
  } else if (totalScore >= 75) {
    overallExplanation = `Strong spatial and audience synergy. ${corridor.name} exhibits high demand compatibility for "${archetype.name}".`;
  } else if (totalScore >= 60) {
    overallExplanation = `Viable opportunity in ${corridor.name} with moderate audience alignment and balanced supply conditions.`;
  } else {
    overallExplanation = `Low situational fit in ${corridor.name}; key demand drivers or operating conditions face significant tradeoffs.`;
  }

  // Build location-specific highlights tailored to this specific corridor
  const locationHighlights = [];

  // 1. Specific Character / Dominant Audience summary
  if (corridor.character) {
    const firstCharSentence = corridor.character.split('.')[0].trim();
    if (firstCharSentence.length > 10 && firstCharSentence.length < 130) {
      locationHighlights.push(`${firstCharSentence}.`);
    }
  } else if (corridor.dominant_audience && corridor.dominant_audience.length > 0) {
    const crowdMap = {
      TOURISTS: 'visitors and tourists',
      NIGHTLIFE: 'evening socializers and diners',
      COMMUTERS: 'daily transit commuters',
      WORKERS: 'daytime office employees',
      RESIDENTS: 'local neighborhood residents',
      STUDENTS: 'university students',
      SHOPPERS: 'retail shoppers'
    };
    const crowdNames = corridor.dominant_audience.map(a => crowdMap[a] || a.toLowerCase()).slice(0, 3).join(', ');
    locationHighlights.push(`Draws active customer footfall from ${crowdNames}.`);
  }

  // 2. Specific Landmark Anchor or Spatial Flow
  if (hostedZones.length > 0) {
    const zoneNames = hostedZones.map(z => z.name).join(', ');
    locationHighlights.push(`Direct footfall benefits from major landmark anchor: ${zoneNames}.`);
  } else if ((corridor.behavior?.transit_car_orientation ?? 50) >= 75) {
    locationHighlights.push(`Prime pedestrian corridor with high sidewalk walkability and transit connectivity.`);
  } else if ((corridor.behavior?.neighborhood_momentum ?? 50) >= 65) {
    locationHighlights.push(`Positive neighborhood momentum with strong commercial investment.`);
  }

  // 3. Peak operating window or Whitespace
  const topDaypart = archetypeDayparts
    .map(dp => ({ dp, val: daypartDensities[dp] || 0 }))
    .sort((a, b) => b.val - a.val)[0];

  if (topDaypart && topDaypart.val >= 65) {
    locationHighlights.push(`Peak customer volume concentrated during ${DAYPART_LABELS[topDaypart.dp] || topDaypart.dp}.`);
  }

  // 4. Target audience alignment if specified
  if (targetAudience && typeof corridor.audience_scores?.[targetAudience] === 'number' && corridor.audience_scores[targetAudience] >= 6) {
    const targetLabel = dataset.audienceSegmentsById?.get(targetAudience)?.label || targetAudience;
    locationHighlights.push(`Strong local presence of target customer group "${targetLabel}".`);
  }

  // Merge with any specific dimension positive signals
  locationHighlights.push(...positiveSignals);

  // Deduplicate and take top 3
  const uniquePositives = Array.from(new Set(locationHighlights.filter(Boolean))).slice(0, 3);
  const uniqueConcerns = Array.from(new Set(concerns)).slice(0, 3);

  // Recommended Audience & Operating Times
  const recommendedAudience = (corridor.dominant_audience || []).join(', ') || 'General Commercial Footfall';
  const recommendedOperatingTime = archetypeDayparts.map(dp => DAYPART_LABELS[dp] || dp).join(', ');

  return {
    corridorId: corridor.corridor_id,
    corridorName: corridor.name,
    city: corridor.metro_id,
    archetypeId: archetype.archetype_id,
    archetypeName: archetype.name,
    category: archetype.category_id,
    score: totalScore,
    fitTier: tierKey,
    fitTierLabel: FIT_TIERS[tierKey].label,
    recommendedAudience,
    recommendedOperatingTime,
    explanation: overallExplanation,
    positiveSignals: uniquePositives,
    concerns: uniqueConcerns,
    dimensions,
    disclaimers: METHODOLOGICAL_DISCLAIMERS
  };
}
