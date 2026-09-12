/**
 * Market Compass - Signal & Demand Clock Processor
 */

import {
  DEMAND_CLOCK_TO_DAYPARTS,
  SIGNAL_TO_AUDIENCE_SEGMENTS,
  STANDARD_DAYPARTS
} from '../constants.js';

/**
 * Resolves dayparts from an archetype's demand clocks
 */
export function resolveArchetypeDayparts(demandClocks = []) {
  const dayparts = new Set();
  for (const clock of demandClocks) {
    const mapped = DEMAND_CLOCK_TO_DAYPARTS[clock];
    if (mapped) {
      for (const dp of mapped) {
        dayparts.add(dp);
      }
    }
  }
  // Default fallback if no clocks mapped
  if (dayparts.size === 0) {
    return ['weekday_am', 'weekday_midday', 'weekday_evening'];
  }
  return Array.from(dayparts);
}

/**
 * Maps archetype signals to corridor audience segments
 */
export function mapSignalsToSegments(signals = []) {
  const segments = new Set();
  for (const sig of signals) {
    const mapped = SIGNAL_TO_AUDIENCE_SEGMENTS[sig];
    if (mapped) {
      for (const seg of mapped) {
        segments.add(seg);
      }
    }
  }
  return Array.from(segments);
}

/**
 * Evaluates the alignment of an archetype's required signals against corridor audience scores.
 * @param {object} corridor - Corridor record
 * @param {object} archetype - Archetype record
 * @returns {object} { score: 0-100, primaryScore, supportingScore, signalsEvaluated, positiveSignals, concerns }
 */
export function evaluateAudienceSignalMatch(corridor, archetype) {
  const audienceScores = corridor.audience_scores || {};
  const audienceConf = corridor.audience_confidence || {};
  
  const primarySignals = archetype.primary_signals || [];
  const supportingSignals = archetype.supporting_signals || [];

  const positiveSignals = [];
  const concerns = [];

  // Helper to score a signal list
  function scoreSignalList(signalList, role) {
    if (!signalList.length) return { avg: 50, count: 0 };
    
    let totalScore = 0;
    let totalCount = 0;

    for (const sig of signalList) {
      const mappedSegs = SIGNAL_TO_AUDIENCE_SEGMENTS[sig] || [];
      if (mappedSegs.length === 0) continue;

      let maxSegScore = 0;
      let maxSegId = mappedSegs[0];

      for (const segId of mappedSegs) {
        const raw = audienceScores[segId];
        if (typeof raw === 'number') {
          if (raw > maxSegScore) {
            maxSegScore = raw;
            maxSegId = segId;
          }
        }
      }

      // Convert 0-10 to 0-100
      const scaled = maxSegScore * 10;
      const conf = audienceConf[maxSegId] || 'MEDIUM';
      const confWeight = conf === 'HIGH' ? 1.0 : conf === 'MEDIUM' ? 0.9 : 0.8;
      
      totalScore += scaled * confWeight;
      totalCount++;

      if (maxSegScore >= 6) {
        positiveSignals.push(`Strong ${role.toLowerCase()} customer match for ${sig.replace(/_/g, ' ').toLowerCase()} habits`);
      } else if (maxSegScore <= 2 && role === 'PRIMARY') {
        concerns.push(`Lower observed customer footfall for ${sig.replace(/_/g, ' ').toLowerCase()} in this corridor`);
      }
    }

    return {
      avg: totalCount > 0 ? totalScore / totalCount : 50,
      count: totalCount
    };
  }

  const primEval = scoreSignalList(primarySignals, 'PRIMARY');
  const suppEval = scoreSignalList(supportingSignals, 'SUPPORTING');

  let combinedScore = 50;
  if (primEval.count > 0 && suppEval.count > 0) {
    combinedScore = (primEval.avg * 0.70) + (suppEval.avg * 0.30);
  } else if (primEval.count > 0) {
    combinedScore = primEval.avg;
  } else if (suppEval.count > 0) {
    combinedScore = suppEval.avg;
  }

  return {
    score: Math.min(100, Math.max(0, combinedScore)),
    primaryAvg: primEval.avg,
    supportingAvg: suppEval.avg,
    positiveSignals,
    concerns
  };
}
