/**
 * Market Compass Engine - Core Constants & Mapping Configurations
 * Release Bundle: usa-corridors-20260906-r2
 */

export const STANDARD_DAYPARTS = [
  'weekday_am',
  'weekday_midday',
  'weekday_evening',
  'late_night',
  'weekend_day'
];

export const DAYPART_LABELS = {
  weekday_am: 'Weekday Morning (AM Commute / Breakfast)',
  weekday_midday: 'Weekday Midday (Lunch / Errand)',
  weekday_evening: 'Weekday Evening (PM Commute / Dinner / Social)',
  late_night: 'Late Night (Nightlife / Shift Workers)',
  weekend_day: 'Weekend Daytime (Brunch / Leisure / Shopping)'
};

/**
 * Maps granular archetype demand clocks to standard corridor dayparts
 */
export const DEMAND_CLOCK_TO_DAYPARTS = {
  EARLY_MORNING: ['weekday_am'],
  AM_COMMUTE: ['weekday_am'],
  MIDDAY: ['weekday_midday'],
  WEEKDAY_LUNCH: ['weekday_midday'],
  PM_COMMUTE: ['weekday_evening'],
  EVENING: ['weekday_evening'],
  DINNER: ['weekday_evening'],
  LATE_NIGHT: ['late_night'],
  OVERNIGHT: ['late_night'],
  WEEKEND_DAY: ['weekend_day'],
  WEEKEND_BRUNCH: ['weekend_day'],
  MEAL_DAYPARTS: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  WEEKDAY_LUNCH_DINNER_AND_WEEKEND_SEPARATE: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  LUNCH_DINNER_AND_WEEKEND_SEPARATE: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  DINNER_WEEKEND_AND_LUNCH_SEPARATE: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  DINNER_WEEKEND_AND_OCCASION: ['weekday_evening', 'weekend_day'],
  EVENING_AND_WEEKEND: ['weekday_evening', 'weekend_day'],
  MEAL_AND_WEEKEND_DESTINATION_WINDOWS: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  FLIGHT_AND_WORKER_WINDOWS: ['weekday_am', 'weekday_midday', 'weekday_evening', 'late_night', 'weekend_day'],
  GOVERNED_EVENTS: ['weekday_evening', 'weekend_day'],
  ACTIVE_EVENT_DATES_AND_HOURS: ['weekday_evening', 'weekend_day'],
  PRE_AND_POST_EVENT_WINDOWS: ['weekday_evening', 'weekend_day'],
  VENUE_OPEN_AND_PROGRAM_WINDOWS: ['weekday_evening', 'weekend_day'],
  HALL_MARKET_OPEN_HOURS: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  MALL_OPEN_HOURS: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  CENTER_OPEN_HOURS: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  PARTNER_STORE_HOURS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  ACADEMIC_CALENDAR_MEAL_PERIODS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  ACADEMIC_CALENDAR_AND_MEALS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  SHIFT_VISITOR_AND_SERVICE_WINDOWS: ['weekday_am', 'weekday_midday', 'weekday_evening', 'late_night'],
  SHIFT_CHANGE_AND_MEAL_BREAKS: ['weekday_am', 'weekday_midday', 'weekday_evening', 'late_night'],
  STAFF_SHIFT_VISITOR_AND_COMPANION_WINDOWS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  GUEST_MEAL_AND_EVENT_WINDOWS: ['weekday_am', 'weekday_midday', 'weekday_evening', 'weekend_day'],
  WORKPLACE_ATTENDANCE_AND_SHIFTS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  DIRECTIONAL_COMMUTE_AND_MEAL_DAYPART: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  SERVICE_AND_DIRECTIONAL_PASSENGER_WINDOWS: ['weekday_am', 'weekday_evening'],
  SCHEDULED_SERVICE_WINDOWS: ['weekday_am', 'weekday_midday', 'weekday_evening'],
  CONCESSION_HOURS_AND_SEASON: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  PERMITTED_OPERATING_WINDOW: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  BREAKFAST_LUNCH_DINNER_OVERNIGHT_SEPARATE: ['weekday_am', 'weekday_midday', 'weekday_evening', 'late_night', 'weekend_day'],
  DAYPART_AND_LATE_NIGHT_SEPARATE: ['weekday_evening', 'late_night'],
  VISITOR_DAYTIME_AND_EVENING_SEPARATE: ['weekday_midday', 'weekday_evening', 'weekend_day'],
  ORDER_DAYPART_WITH_PREP_AND_VERTICAL_DELAY: ['weekday_midday', 'weekday_evening', 'weekend_day']
};

/**
 * Maps archetype signal tokens to corridor audience segments and behavioral attributes
 */
export const SIGNAL_TO_AUDIENCE_SEGMENTS = {
  TRANSIT_PASSENGER: ['rail_transfer', 'morning_commuters', 'evening_commuters'],
  COMMUTER: ['morning_commuters', 'evening_commuters', 'early_morning_routine'],
  CAPTIVE_HOST: ['airport_travel', 'hotel_stay_visitors', 'conference_business'],
  HOSPITALITY_GUEST: ['hotel_stay_visitors', 'tourist_premium', 'conference_business'],
  DAYTIME_WORKER: ['office_routine', 'business_meetings', 'hybrid_remote', 'retail_service_workers'],
  TOURIST_VISITOR: ['tourist_mainstream', 'tourist_premium', 'tourist_family', 'sightseeing_visitors', 'cultural_visitors'],
  EVENT_SEASONAL: ['stadium_event', 'theater_event', 'cultural_visitors', 'weekend_social_visits'],
  CAMPUS_POPULATION: ['student_value', 'study_groups', 'faculty_staff', 'campus_neighborhood_overlap'],
  SHOPPING_ERRAND: ['everyday_shoppers', 'local_errands', 'shopping_daytrip', 'premium_shoppers'],
  EVENING_NIGHT_CONVENIENCE: ['late_night_social', 'overnight_workers', 'after_work_social'],
  VEHICLE_PASSBY: ['car_errands', 'morning_commuters', 'evening_commuters'],
  RESIDENT_BASE: ['neighborhood_routine', 'family_household', 'resident_value', 'resident_premium'],
  MEDICAL_POPULATION: ['hospital_workers', 'outpatient_visits', 'visitors_carers'],
  INDUSTRIAL_SHIFT: ['industrial_logistics_workers', 'construction_trades', 'overnight_workers'],
  EXPOSED_PASSENGER_AND_WORKER_FLOWS: ['airport_travel', 'rail_transfer', 'morning_commuters'],
  TICKETED_ATTENDEES_AND_EVENT_WORKERS: ['stadium_event', 'theater_event'],
  ROAD_NETWORK_ORIGINS_AND_PASS_BY_FLOW: ['car_errands', 'local_errands'],
  ROAD_NETWORK_ORIGINS_AND_DIRECTIONAL_PASS_BY_FLOW: ['car_errands', 'morning_commuters', 'evening_commuters'],
  RESIDENTS_WORKERS_STUDENTS_AND_PICKUP_TRIPS: ['neighborhood_routine', 'office_routine', 'student_value', 'local_errands'],
  PUBLIC_CAMPUS_GATES_AND_BUILDING_ENTRANCES: ['student_value', 'faculty_staff', 'campus_neighborhood_overlap'],
  AUTHORIZED_CAMPUS_POPULATION: ['student_value', 'study_groups', 'faculty_staff'],
  VENUE_VISITORS_AND_WORKERS: ['cultural_visitors', 'theater_event', 'stadium_event'],
  DELIVERY_ORDERS_AND_PICKUP_ORIGINS: ['neighborhood_routine', 'family_household', 'hybrid_remote'],
  OBSERVED_FOOD_DESTINATION_TRIPS_NOT_RESIDENT_ETHNICITY: ['dining_social', 'intracity_destination_visits', 'weekend_social_visits'],
  NAMED_HOST_VISITS_AND_INTERNAL_CIRCULATION: ['conference_business', 'hotel_stay_visitors', 'tourist_mainstream'],
  EVENING_CORRIDOR_VISITORS_RESIDENTS_AND_WORKERS: ['after_work_social', 'dining_social', 'evening_commuters'],
  STAFF_VISITORS_AND_PATIENT_COMPANIONS: ['hospital_workers', 'visitors_carers', 'outpatient_visits'],
  GUESTS_VISITORS_AND_HOTEL_WORKERS: ['hotel_stay_visitors', 'conference_business', 'tourist_premium'],
  WORKPLACE_GATES_SHIFT_ARRIVALS_AND_TRANSIT: ['office_routine', 'morning_commuters', 'evening_commuters'],
  PLANNED_PARTIES_AND_RESERVATION_ORIGINS: ['dining_social', 'weekend_social_visits', 'weekend_brunch'],
  NIGHTTIME_OPEN_ORIGINS_SHIFT_WORKERS_AND_TRANSIT: ['late_night_social', 'overnight_workers'],
  MALL_SHOPPERS_AND_EMPLOYEES: ['everyday_shoppers', 'shopping_daytrip', 'premium_shoppers', 'retail_service_workers'],
  PUBLIC_FACILITY_ENTRANCES: ['community_social', 'civic_community', 'local_errands'],
  PEDESTRIANS_IN_OPERATING_WINDOW: ['walking_pass_through', 'neighborhood_routine', 'everyday_shoppers'],
  RESIDENTS_NEARBY_WORKERS_AND_LOCAL_VISITORS: ['neighborhood_routine', 'office_routine', 'local_errands'],
  LOCAL_RESIDENTS_WORKERS_AND_PLANNED_PARTIES: ['neighborhood_routine', 'dining_social', 'family_household'],
  RESIDENT_ROUTINE_AND_NEARBY_WORKERS: ['neighborhood_routine', 'office_routine', 'local_errands'],
  RESIDENTS_NEARBY_WORKERS_STUDENTS_AND_LOCAL_VISITORS: ['neighborhood_routine', 'office_routine', 'student_value'],
  WORKER_BUILDINGS_AND_WEEKDAY_TRIP_ENDS: ['office_routine', 'business_meetings'],
  OCCUPANTS_AND_AUTHORIZED_VISITORS: ['office_routine', 'hybrid_remote'],
  PUBLIC_SPACE_ENTRANCES_PATHS_AND_HOSTED_ACTIVITY: ['park_recreation', 'waterfront_leisure', 'community_social'],
  PASSENGERS_AND_WORKERS_IN_SAME_CONCOURSE: ['rail_transfer', 'airport_travel'],
  STORE_TRIPS_AND_EMPLOYEES: ['everyday_shoppers', 'retail_service_workers'],
  SCHEDULED_RAIL_ENTRANCE_FLOW: ['rail_transfer', 'morning_commuters', 'evening_commuters'],
  EVENT_MARKET_ATTENDEES_AND_WORKERS: ['shopping_daytrip', 'cultural_visitors', 'weekend_social_visits'],
  DELIVERY_ORDERS_ALLOWED_BY_OPERATOR: ['family_household', 'neighborhood_routine'],
  NAMED_CENTER_TRIPS_AND_INTERNAL_PUBLIC_PATHS: ['shopping_daytrip', 'everyday_shoppers'],
  PASSENGERS_TRAVERSING_SAME_CIRCULATION_SIDE: ['airport_travel', 'rail_transfer'],
  NAMED_VENUE_ENTRANCES_AND_GOVERNED_EVENTS: ['stadium_event', 'theater_event'],
  ACCOMMODATION_ATTRACTION_AND_VISITOR_SERVICE_ORIGINS: ['hotel_stay_visitors', 'tourist_mainstream', 'sightseeing_visitors']
};

/**
 * Scoring Dimension Weights (Must sum to 1.0)
 */
export const SCORING_WEIGHTS = {
  BUSINESS_FIT: 0.30,
  AUDIENCE_COMPATIBILITY: 0.25,
  OPERATING_TIME: 0.15,
  SUPPLY_WHITESPACE: 0.15,
  SPECIAL_ZONE: 0.05,
  ACCESS_CONTEXT: 0.10
};

/**
 * Score Tier Classifications
 */
export const FIT_TIERS = {
  STRONG_FIT: {
    label: 'Strong Fit',
    minScore: 75,
    description: 'High alignment across demand signals, operating hours, and corridor access.'
  },
  MODERATE_FIT: {
    label: 'Moderate Fit',
    minScore: 60,
    description: 'Viable location with balanced strengths and minor operational tradeoffs.'
  },
  WEAK_FIT: {
    label: 'Weak Fit',
    minScore: 45,
    description: 'Low signal alignment or noticeable spatial friction; requires strategic adaptation.'
  },
  INSUFFICIENT_CONTEXT: {
    label: 'Insufficient Context',
    minScore: 0,
    description: 'Data coverage or signal certainty is too low to assert situational viability.'
  },
  GATED_OUT: {
    label: 'Gated Out',
    minScore: 0,
    description: 'Fails mandatory operational prerequisites or institutional hosting requirements.'
  }
};

/**
 * Safe Terminology and Disclaimers
 */
export const METHODOLOGICAL_DISCLAIMERS = {
  SUPPLY_NOTE: 'Supply and competition metrics are based on observed and sampled business locations, not an exhaustive commercial census.',
  ESTIMATE_NOTE: 'Behavioral, crime perception, timing alpha, and whitespace metrics represent curated expert evaluations.',
  NO_GUARANTEE_NOTE: 'Opportunity scores measure spatial and situational compatibility; they do not guarantee customer footfall, demand volume, or commercial revenue.'
};
