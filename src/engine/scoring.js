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
    positiveSignals.push(`High algorithmic archetype fit (${finalFitScore}/100) based on commercial decision track "${archetype.decision_track}".`);
  }

  dimensions.businessFit = {
    name: 'Business & Archetype Fit',
    score: Math.round(finalFitScore * 10) / 10,
    weight: SCORING_WEIGHTS.BUSINESS_FIT,
    weightedContribution: Math.round(finalFitScore * SCORING_WEIGHTS.BUSINESS_FIT * 10) / 10,
    supportingFields: ['corridor_archetype_scores.score', 'archetypes.decision_track', 'archetypes.required_gate'],
    isGatedOut,
    gatingReason,
    explanation: isGatedOut
      ? `Gated out: ${gatingReason}`
      : `Algorithmic archetype baseline score is ${finalFitScore}/100 in this corridor.`
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
        positiveSignals.push(`Target audience "${targetLabel}" is strongly present (${userAudScore}/10, ${userAudConf} confidence).`);
      } else if (userAudScore <= 3) {
        concerns.push(`Target audience "${targetLabel}" has low observed presence (${userAudScore}/10) in ${corridor.name}.`);
      }
      audienceExplanation = `Combined archetype demand signals (${Math.round(signalMatch.score)}/100) with target audience "${targetLabel}" (${userAudScore}/10).`;
    } else {
      audienceExplanation = `Evaluated archetype core demand signals (${Math.round(signalMatch.score)}/100). Target audience "${targetAudience}" not directly scored for this corridor.`;
    }
  } else {
    // Top dominant audience mention
    const dominant = corridor.dominant_audience || [];
    if (dominant.length > 0) {
      positiveSignals.push(`Corridor dominant customer flows: ${dominant.join(', ')}.`);
    }
    audienceExplanation = `Evaluated ${archetype.primary_signals?.length || 0} primary and ${archetype.supporting_signals?.length || 0} supporting audience signals against corridor profile.`;
  }

  dimensions.audienceCompatibility = {
    name: 'Audience Compatibility',
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
        : Math.max(10, rawTimeDensity * 0.6); // Penalty if concept does not match time window

      if (operatesInDaypart && rawTimeDensity >= 60) {
        positiveSignals.push(`Peak operating match: Corridor activity during ${timeLabel} is strong (${rawTimeDensity}/100).`);
      } else if (!operatesInDaypart) {
        concerns.push(`Time mismatch: "${archetype.name}" typically does not focus on ${timeLabel}.`);
      } else if (rawTimeDensity < 40) {
        concerns.push(`Low corridor footfall during requested operating window: ${timeLabel} (${rawTimeDensity}/100).`);
      }

      timingExplanation = operatesInDaypart
        ? `Requested daypart (${timeLabel}) matches business model with corridor activity score of ${rawTimeDensity}/100.`
        : `Business model primarily operates in [${archetypeDayparts.join(', ')}]; requested ${timeLabel} introduces operational friction.`;
    } else {
      timingScore = 50;
      timingExplanation = `Requested operating time (${operatingTime}) not indexed in corridor dayparts.`;
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
      positiveSignals.push(`Strong activity window in ${DAYPART_LABELS[topDaypart.dp] || topDaypart.dp} (${topDaypart.val}/100).`);
    }

    timingExplanation = `Corridor activity averages ${Math.round(timingScore)}/100 across key operating windows (${archetypeDayparts.join(', ')}).`;
  }

  dimensions.operatingTimeCompatibility = {
    name: 'Operating-Time Compatibility',
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
    positiveSignals.push(`Potential whitespace detected: ${categoryKey.toUpperCase()} category shows room for expansion (${categoryWhitespace}/100 index).`);
  } else if (categoryWhitespace <= 35) {
    concerns.push(`High observed supply: ${categoryKey.toUpperCase()} category has limited unmet demand (${categoryWhitespace}/100 whitespace).`);
  }

  if (chainDominance >= 65) {
    concerns.push(`High corporate chain dominance (${chainDominance}%) may increase customer acquisition barriers for independent concepts.`);
  } else if (haloStrength >= 65) {
    positiveSignals.push(`Beneficial brand halo (${haloStrength}/100) from established complementary co-tenants.`);
  }

  dimensions.supplyAndWhitespace = {
    name: 'Observed Supply & Whitespace',
    score: Math.round(supplyScore * 10) / 10,
    weight: SCORING_WEIGHTS.SUPPLY_WHITESPACE,
    weightedContribution: Math.round(supplyScore * SCORING_WEIGHTS.SUPPLY_WHITESPACE * 10) / 10,
    supportingFields: ['corridors.behavior.whitespace_quality', 'corridors.behavior.brand_ecology'],
    categoryEvaluated: categoryKey,
    whitespaceIndex: categoryWhitespace,
    explanation: `Evaluated ${categoryKey} whitespace index (${categoryWhitespace}/100) alongside brand halo (${haloStrength}/100) and chain dominance (${chainDominance}%).`
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
      positiveSignals.push(`Direct institutional anchor present: Encompasses special zone(s) [${zoneNames}].`);
    } else {
      positiveSignals.push(`Proximity to major destination generator: [${zoneNames}].`);
    }
    zoneExplanation = `Corridor benefits from ${hostedZones.length} designated special zone(s): ${zoneNames}.`;
  } else {
    if (archetype.decision_track === 'CONTROLLED_HOST') {
      specialZoneScore = 20;
      zoneExplanation = `No matching special zones found for this controlled-host concept.`;
    } else {
      specialZoneScore = 55;
      zoneExplanation = `Standard urban corridor without specialized single-purpose destination anchors.`;
    }
  }

  dimensions.specialZoneRelevance = {
    name: 'Special-Zone Relevance',
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
    concerns.push(`Physical path-of-travel friction is elevated (${friction}/100) due to street grid/geographic barriers.`);
  }

  // Momentum bonus
  if (momentum >= 65) {
    accessScore += 5;
    positiveSignals.push(`Positive neighborhood momentum (${momentum}/100) indicates growing commercial investment.`);
  }

  accessScore = Math.min(100, Math.max(0, accessScore));

  if (access.barrier_note) {
    access.barrier_note.length < 100
      ? concerns.push(`Corridor access note: ${access.barrier_note}`)
      : concerns.push(`Corridor access note: ${access.barrier_note.slice(0, 95)}...`);
  }

  dimensions.accessAndContext = {
    name: 'Access & Corridor Context',
    score: Math.round(accessScore * 10) / 10,
    weight: SCORING_WEIGHTS.ACCESS_CONTEXT,
    weightedContribution: Math.round(accessScore * SCORING_WEIGHTS.ACCESS_CONTEXT * 10) / 10,
    supportingFields: ['corridors.access', 'corridors.behavior.path_of_travel_friction', 'corridors.behavior.neighborhood_momentum'],
    gatewayDependency: gatewayDep,
    transitCarOrientation: transitOrientation,
    explanation: `Access friction: ${friction}/100, transit-orientation: ${transitOrientation}/100, gateway dependency: ${gatewayDep}.`
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

  // Deduplicate and filter signals
  const uniquePositives = Array.from(new Set(positiveSignals)).slice(0, 3);
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
