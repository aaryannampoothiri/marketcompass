/**
 * Market Compass - Public Entrypoint
 * 
 * Exposes core data loaders, scoring utilities, recommendation methods, and domain constants.
 */

export {
  loadDataset,
  normalizeMetroId,
  DEFAULT_DATASET_DIR
} from './data/loader.js';

export {
  resolveCorridor,
  resolveArchetype,
  validateAudienceSegment,
  validateOperatingTime
} from './data/validator.js';

export {
  scoreCorridorArchetypePair
} from './engine/scoring.js';

export {
  recommendBusinessesForCorridor,
  recommendCorridorsForBusiness
} from './engine/recommender.js';

export {
  STANDARD_DAYPARTS,
  DAYPART_LABELS,
  DEMAND_CLOCK_TO_DAYPARTS,
  SIGNAL_TO_AUDIENCE_SEGMENTS,
  SCORING_WEIGHTS,
  FIT_TIERS,
  METHODOLOGICAL_DISCLAIMERS
} from './constants.js';
