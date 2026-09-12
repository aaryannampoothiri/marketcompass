/**
 * Market Compass Recommendation Engine - Comprehensive Test Suite
 */

import {
  loadDataset,
  recommendBusinessesForCorridor,
  recommendCorridorsForBusiness,
  scoreCorridorArchetypePair,
  resolveCorridor,
  resolveArchetype
} from '../src/index.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  totalTests++;
  if (actual !== expected) {
    console.error(`❌ FAIL: ${message} (Expected: ${expected}, Actual: ${actual})`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=====================================================');
console.log('🧪 RUNNING MARKET COMPASS ENGINE TEST SUITE');
console.log('=====================================================\n');

// 1. DATASET LOADING
console.log('--- 1. Testing Dataset Loading ---');
const dataset = loadDataset();
assert(dataset.corridors.length === 137, 'Total corridors equals 137 (65 NYC + 72 DFW)');
assert(dataset.audienceSegments.length === 55, 'Audience segments count equals 55');
assert(dataset.archetypes.length >= 67, 'Total archetypes indexed >= 67');
assert(dataset.specialZones.length === 62, 'Total special zones equals 62 (25 NYC + 37 DFW)');

// 2. MODE 1: CORRIDOR -> BUSINESS
console.log('\n--- 2. Testing Mode 1: Corridor → Business (NYC) ---');
const nycResults = recommendBusinessesForCorridor({
  city: 'nyc',
  corridor: 'si.st_george_north_shore'
});

assertEqual(nycResults.length, 3, 'Returns exactly top 3 business archetypes');
assert(nycResults[0].rank === 1, 'Top result rank is 1');
assert(nycResults[0].score >= 0 && nycResults[0].score <= 100, 'Score is normalized between 0 and 100');
assert(typeof nycResults[0].name === 'string' && nycResults[0].name.length > 0, 'Archetype name is non-empty');
assert(typeof nycResults[0].fitTier === 'string', 'Fit tier is present');
assert(typeof nycResults[0].explanation === 'string' && nycResults[0].explanation.length > 0, 'Explanation is provided');
assert(Array.isArray(nycResults[0].positiveSignals) && nycResults[0].positiveSignals.length > 0, 'Positive signals list provided');
assert(nycResults[0].dimensions && Object.keys(nycResults[0].dimensions).length === 6, 'All 6 scoring dimensions present');

console.log(`Top NYC recommendation for St. George: "${nycResults[0].name}" (Score: ${nycResults[0].score}, Tier: ${nycResults[0].fitTier})`);

console.log('\n--- 3. Testing Mode 1 with Audience & Timing Filters (DFW) ---');
const dfwFiltered = recommendBusinessesForCorridor({
  city: 'dallas-fort-worth',
  corridor: 'dfw.mckinney',
  targetAudience: 'morning_commuters',
  operatingTime: 'weekday_am'
});

assertEqual(dfwFiltered.length, 3, 'Returns exactly 3 recommendations with active filters');
assert(dfwFiltered[0].dimensions.audienceCompatibility.score > 0, 'Audience compatibility evaluated');
assert(dfwFiltered[0].dimensions.operatingTimeCompatibility.score > 0, 'Operating time compatibility evaluated');
console.log(`Top DFW recommendation for McKinney (AM Commute): "${dfwFiltered[0].name}" (Score: ${dfwFiltered[0].score})`);

// 4. MODE 2: BUSINESS -> CORRIDOR
console.log('\n--- 4. Testing Mode 2: Business → Corridor (Single City: NYC) ---');
const mode2Nyc = recommendCorridorsForBusiness({
  city: 'nyc',
  archetype: 'us.cafe.neighborhood_seated.v1'
});

assertEqual(mode2Nyc.length, 3, 'Returns exactly top 3 corridors for seated coffeehouse in NYC');
assert(mode2Nyc[0].city === 'nyc', 'All results match requested metro NYC');
assert(typeof mode2Nyc[0].audienceCompatibility.label === 'string', 'Audience compatibility label provided');
assert(typeof mode2Nyc[0].businessFit.label === 'string', 'Business fit label provided');
assert(typeof mode2Nyc[0].operatingTimeCompatibility.label === 'string', 'Operating time compatibility label provided');
console.log(`Top NYC corridor for Seated Coffeehouse: "${mode2Nyc[0].corridorName}" (Score: ${mode2Nyc[0].score})`);

console.log('\n--- 5. Testing Mode 2: Business → Corridor (All Cities) ---');
const mode2All = recommendCorridorsForBusiness({
  archetype: 'us.cafe.scheduled_rail_adjacent_street_express.v1',
  operatingTime: 'weekday_am'
});

assertEqual(mode2All.length, 3, 'Returns exactly top 3 corridors across all metros');
console.log(`Top cross-metro corridors for Scheduled Rail Street Express:`);
mode2All.forEach(r => console.log(`  #${r.rank} [${r.city.toUpperCase()}] ${r.corridorName} (Score: ${r.score})`));

// 6. EDGE CASE A: No Matching / Non-Existent Audience Segment
console.log('\n--- 6. Edge Case A: Non-Existent Target Audience ---');
const edgeAudience = recommendBusinessesForCorridor({
  corridor: 'si.st_george_north_shore',
  targetAudience: 'intergalactic_tourists_nonexistent'
});
assertEqual(edgeAudience.length, 3, 'Gracefully handles invalid audience without crashing');
assert(edgeAudience[0].score > 0, 'Fallback scores archetype signals successfully');

// 7. EDGE CASE B: Missing / Unknown Timing Data
console.log('\n--- 7. Edge Case B: Unknown Operating Time ---');
const edgeTiming = recommendBusinessesForCorridor({
  corridor: 'si.st_george_north_shore',
  operatingTime: 'solar_eclipse_midnight'
});
assertEqual(edgeTiming.length, 3, 'Gracefully handles invalid timing without crashing');
assert(edgeTiming[0].dimensions.operatingTimeCompatibility.score > 0, 'Uses fallback timing evaluation');

// 8. EDGE CASE C: Incomplete Corridor Data (DFW null root places vs NYC null spending)
console.log('\n--- 8. Edge Case C: Incomplete Corridor Data Handling ---');
const dfwCorr = resolveCorridor(dataset, 'dfw.mckinney');
const nycCorr = resolveCorridor(dataset, 'si.st_george_north_shore');
assert(dfwCorr.places === null, 'Verified DFW corridor has null places root');
assert(nycCorr.spending_power === null, 'Verified NYC corridor has null spending_power');

const dfwScore = scoreCorridorArchetypePair(dfwCorr, resolveArchetype(dataset, 'us.cafe.scheduled_rail_adjacent_street_express.v1'), dataset);
const nycScore = scoreCorridorArchetypePair(nycCorr, resolveArchetype(dataset, 'us.cafe.scheduled_rail_adjacent_street_express.v1'), dataset);

assert(dfwScore.score >= 0 && dfwScore.score <= 100, 'DFW corridor scores successfully despite null places');
assert(nycScore.score >= 0 && nycScore.score <= 100, 'NYC corridor scores successfully despite null spending_power');

// 9. EDGE CASE D: Controlled Host Gating (Airport Concession)
console.log('\n--- 9. Edge Case D: Controlled Host Gating Verification ---');
const airportArchetype = resolveArchetype(dataset, 'us.cafe.airport_terminal_concession.v1');
const nonAirportCorr = resolveCorridor(dataset, 'si.st_george_north_shore');

const gatedScore = scoreCorridorArchetypePair(nonAirportCorr, airportArchetype, dataset);
assert(gatedScore.fitTier === 'GATED_OUT', 'Correctly gates out airport concession in non-airport corridor');
assert(gatedScore.dimensions.businessFit.isGatedOut === true, 'businessFit dimension flags isGatedOut');
assert(gatedScore.concerns.some(c => c.toLowerCase().includes('gate') || c.toLowerCase().includes('host') || c.toLowerCase().includes('airport')), 'Concern notes gating restriction');

// 10. SUB-CORRIDORS & RESTAURANT ARCHETYPES
console.log('\n--- 10. Testing NYC Sub-Corridors & DFW Restaurant Archetypes ---');
const subCorrResults = recommendBusinessesForCorridor({
  corridor: 'Hudson Yards'
});
assertEqual(subCorrResults.length, 3, 'Successfully scores NYC sub-corridor (Hudson Yards)');
console.log(`Top recommendation for Hudson Yards sub-corridor: "${subCorrResults[0].name}" (Score: ${subCorrResults[0].score})`);

const restaurantResults = recommendCorridorsForBusiness({
  city: 'dallas-fort-worth',
  archetype: 'us.restaurant.arterial_parking_led_inline.v1',
  operatingTime: 'weekday_evening'
});
assertEqual(restaurantResults.length, 3, 'Successfully scores DFW restaurant archetype');
console.log(`Top DFW corridor for Arterial Restaurant: "${restaurantResults[0].corridorName}" (Score: ${restaurantResults[0].score})`);

// 11. METHODOLOGICAL SAFETY AND DETERMINISM
console.log('\n--- 11. Methodological Safety & Determinism ---');
assert(nycResults[0].disclaimers.SUPPLY_NOTE.includes('observed'), 'Methodological disclaimer mentions observed supply');
assert(!nycResults[0].explanation.includes('guarantee'), 'No guaranteed demand claimed');

// Run identical query twice
const run1 = recommendBusinessesForCorridor({ city: 'nyc', corridor: 'si.st_george_north_shore' });
const run2 = recommendBusinessesForCorridor({ city: 'nyc', corridor: 'si.st_george_north_shore' });
assertEqual(JSON.stringify(run1), JSON.stringify(run2), 'Scoring engine is 100% deterministic');

console.log('\n=====================================================');
console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} assertions`);
console.log('=====================================================\n');
