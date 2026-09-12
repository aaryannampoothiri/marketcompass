/**
 * Friendly Labels & Human-Readable Mapping Dictionary
 * Translates dataset technical tokens into intuitive, everyday language.
 */

export interface FriendlyArchetypeMeta {
  friendlyName: string;
  categoryGroup: string;
  icon: string;
  description: string;
}

export const ARCHETYPE_FRIENDLY_MAP: Record<string, FriendlyArchetypeMeta> = {
  // Cafes
  "us.cafe.destination_roastery_flagship.v1": {
    friendlyName: "Premium Coffee Roastery",
    categoryGroup: "Premium & Specialty",
    icon: "☕",
    description: "Specialty roastery and flagship coffee experience with seating",
  },
  "us.cafe.destination_high_street_cafe.v1": {
    friendlyName: "High Street Fashion Café",
    categoryGroup: "Premium & Specialty",
    icon: "☕",
    description: "Trendy café on prominent shopping and entertainment streets",
  },
  "us.cafe.destination_flagship.v1": {
    friendlyName: "Flagship Specialty Café",
    categoryGroup: "Premium & Specialty",
    icon: "✨",
    description: "High-profile brand showcase café with premium offerings",
  },
  "us.cafe.reservation_coffee_tea_salon.v1": {
    friendlyName: "Reservation Tea & Coffee Lounge",
    categoryGroup: "Premium & Specialty",
    icon: "🫖",
    description: "Seated tasting lounge for artisanal teas and pour-overs",
  },
  "us.cafe.private_members_club_cafe.v1": {
    friendlyName: "Members-Only Club Café",
    categoryGroup: "Premium & Specialty",
    icon: "👑",
    description: "Exclusive lounge café within private clubs or co-working spaces",
  },
  "us.cafe.neighborhood_seated.v1": {
    friendlyName: "Neighbourhood Café & Coffeehouse",
    categoryGroup: "Everyday Cafés",
    icon: "☕",
    description: "Cozy local café with seating for socializing, reading, or laptop work",
  },
  "us.cafe.neighborhood_takeaway.v1": {
    friendlyName: "Quick Takeaway Coffee Shop",
    categoryGroup: "Quick-Service & Takeaway",
    icon: "🏃",
    description: "Fast-grab coffee and pastries for walking neighborhood footfall",
  },
  "us.cafe.drive_through.v1": {
    friendlyName: "Drive-Through Café",
    categoryGroup: "Everyday Cafés",
    icon: "🚗",
    description: "Car-friendly drive-thru window for on-the-go beverages",
  },
  "us.cafe.residential_amenity_cafe.v1": {
    friendlyName: "Residential Community Café",
    categoryGroup: "Everyday Cafés",
    icon: "🏘️",
    description: "Convenient café inside or adjacent to large apartment buildings",
  },
  "us.cafe.office_district_coffeehouse.v1": {
    friendlyName: "Office Area Seated Café",
    categoryGroup: "Office & Workplace",
    icon: "🏢",
    description: "Café tailored for corporate meetings, catch-ups, and workday pauses",
  },
  "us.cafe.office_district_street_express.v1": {
    friendlyName: "Quick Coffee Shop Near Offices",
    categoryGroup: "Office & Workplace",
    icon: "💼",
    description: "High-speed morning and lunch espresso bar in corporate districts",
  },
  "us.cafe.office_lobby_counter.v1": {
    friendlyName: "Office Lobby Coffee Counter",
    categoryGroup: "Office & Workplace",
    icon: "🏢",
    description: "Internal counter serving tenants inside office towers",
  },
  "us.cafe.workplace_captive_counter.v1": {
    friendlyName: "Corporate Campus Coffee Bar",
    categoryGroup: "Office & Workplace",
    icon: "💻",
    description: "In-house barista counter dedicated to corporate campus staff",
  },
  "us.cafe.industrial_logistics_district_counter.v1": {
    friendlyName: "Coffee Shop for Industrial Workers",
    categoryGroup: "Office & Workplace",
    icon: "🏭",
    description: "Early-morning shift coffee and hearty breakfast counter",
  },
  "us.cafe.hospital_captive_kiosk.v1": {
    friendlyName: "Hospital Lobby Coffee Kiosk",
    categoryGroup: "Hospitals & Hotels",
    icon: "🏥",
    description: "24/7 or early-morning coffee spot serving medical staff & visitors",
  },
  "us.cafe.medical_district_street_counter.v1": {
    friendlyName: "Coffee Shop Near Hospitals",
    categoryGroup: "Hospitals & Hotels",
    icon: "🩺",
    description: "Street-level café accessible to clinic patients and healthcare workers",
  },
  "us.cafe.hotel_lobby_cafe.v1": {
    friendlyName: "Hotel Lobby Café & Bar",
    categoryGroup: "Hospitals & Hotels",
    icon: "🏨",
    description: "All-day coffee and cocktail lounge serving hotel guests and locals",
  },
  "us.cafe.mall_food_court_kiosk.v1": {
    friendlyName: "Mall Coffee Kiosk",
    categoryGroup: "Shopping & Retail",
    icon: "🛍️",
    description: "Shopping mall concourse espresso and beverage kiosk",
  },
  "us.cafe.shopping_center_inline.v1": {
    friendlyName: "Shopping Center Inline Café",
    categoryGroup: "Shopping & Retail",
    icon: "🏬",
    description: "Storefront café in outdoor strip malls and retail plazas",
  },
  "us.cafe.retail_shop_in_shop.v1": {
    friendlyName: "Coffee Counter Inside a Store",
    categoryGroup: "Shopping & Retail",
    icon: "👕",
    description: "Barista nook integrated inside boutique, bookstore, or lifestyle store",
  },
  "us.cafe.scheduled_rail_adjacent_street_express.v1": {
    friendlyName: "Quick Coffee Shop Near Railway Stations",
    categoryGroup: "Transport & Public Spaces",
    icon: "🚉",
    description: "High-volume grab-and-go espresso bar near train & transit hubs",
  },
  "us.cafe.subway_station_kiosk.v1": {
    friendlyName: "Subway Station Coffee Kiosk",
    categoryGroup: "Transport & Public Spaces",
    icon: "🚇",
    description: "In-station commuter turnstile coffee and snack kiosk",
  },
  "us.cafe.regional_terminal_ferry_concourse.v1": {
    friendlyName: "Ferry & Bus Terminal Café",
    categoryGroup: "Transport & Public Spaces",
    icon: "⛴️",
    description: "Concourse café serving long-distance commuters and travelers",
  },
  "us.cafe.public_space_kiosk.v1": {
    friendlyName: "Public Park / Plaza Coffee Kiosk",
    categoryGroup: "Transport & Public Spaces",
    icon: "🌳",
    description: "Outdoor park kiosk serving strolling pedestrians and park visitors",
  },
  "us.cafe.cultural_venue_cafe.v1": {
    friendlyName: "Museum & Theater Café",
    categoryGroup: "Transport & Public Spaces",
    icon: "🎨",
    description: "Café inside or adjacent to museums, libraries, and galleries",
  },
  "us.cafe.visitor_attraction_cafe.v1": {
    friendlyName: "Tourist Landmark Café",
    categoryGroup: "Transport & Public Spaces",
    icon: "🗺️",
    description: "Café located at high-footfall tourist attractions and viewpoints",
  },
  "us.cafe.mobile_street_cart.v1": {
    friendlyName: "Mobile Coffee Cart",
    categoryGroup: "Mobile & Temporary",
    icon: "🚚",
    description: "Permitted mobile pushcart for flexible high-density street corners",
  },

  // Restaurants
  "us.restaurant.neighborhood_casual_full_service.v1": {
    friendlyName: "Neighbourhood Casual Dining",
    categoryGroup: "Everyday Dining",
    icon: "🍽️",
    description: "Warm table-service restaurant for casual dinners and weekend lunches",
  },
  "us.restaurant.neighborhood_all_day_diner.v1": {
    friendlyName: "All-Day Classic Diner",
    categoryGroup: "Everyday Dining",
    icon: "🍳",
    description: "Beloved neighborhood spot serving breakfast, lunch, and comfort meals",
  },
  "us.restaurant.neighborhood_seated_fast_casual.v1": {
    friendlyName: "Neighbourhood Fast-Casual Eatery",
    categoryGroup: "Everyday Dining",
    icon: "🥗",
    description: "Order-at-counter fresh meals with comfortable dining room seating",
  },
  "us.restaurant.neighborhood_qsr_takeaway.v1": {
    friendlyName: "Neighbourhood Quick Takeaway",
    categoryGroup: "Quick-Service & Takeaway",
    icon: "🥡",
    description: "Fast-service takeout meals and delivery for local residents",
  },
  "us.restaurant.assembly_line_fast_casual.v1": {
    friendlyName: "Build-Your-Own Fast Casual (Bowls/Burritos)",
    categoryGroup: "Quick-Service & Takeaway",
    icon: "🌯",
    description: "Custom assembly-line bowls, salads, or burritos with rapid throughput",
  },
  "us.restaurant.drive_through_qsr.v1": {
    friendlyName: "Drive-Through Quick Restaurant",
    categoryGroup: "Quick-Service & Takeaway",
    icon: "🚗",
    description: "High-efficiency drive-thru and counter fast-food restaurant",
  },
  "us.restaurant.late_night_counter_service.v1": {
    friendlyName: "Late-Night Street Food Spot",
    categoryGroup: "Evening & Nightlife",
    icon: "🌙",
    description: "Post-midnight counter service serving nightlife crowd and shift workers",
  },
  "us.restaurant.high_street_evening_social.v1": {
    friendlyName: "Vibrant Evening Social Restaurant & Bar",
    categoryGroup: "Evening & Nightlife",
    icon: "🍸",
    description: "Trendy dining venue with craft cocktails and social ambiance",
  },
  "us.restaurant.destination_food_corridor.v1": {
    friendlyName: "Destination Dining Hotspot",
    categoryGroup: "Premium & Specialty",
    icon: "🌟",
    description: "Acclaimed culinary concept drawing diners from across the entire metro",
  },
  "us.restaurant.large_format_group_dining.v1": {
    friendlyName: "Large-Format Family & Group Restaurant",
    categoryGroup: "Everyday Dining",
    icon: "👨‍👩‍👧‍👦",
    description: "Spacious seating suited for large parties, family gatherings, and events",
  },
  "us.restaurant.office_district_weekday_lunch.v1": {
    friendlyName: "Office Area Lunch Spot",
    categoryGroup: "Office & Workplace",
    icon: "🍱",
    description: "Speedy midday dining designed for corporate lunch breaks",
  },
  "us.restaurant.office_workplace_captive_foodservice.v1": {
    friendlyName: "Corporate Office Food Hall",
    categoryGroup: "Office & Workplace",
    icon: "🏢",
    description: "Internal dining facility dedicated to major corporate office hubs",
  },
  "us.restaurant.industrial_logistics_shift_meal.v1": {
    friendlyName: "Worker Shift-Meal Canteen",
    categoryGroup: "Office & Workplace",
    icon: "🏭",
    description: "Hearty, value-driven hot meals for logistics and warehouse shifts",
  },
  "us.restaurant.hospital_captive_foodservice.v1": {
    friendlyName: "Hospital Food Court & Cafeteria",
    categoryGroup: "Hospitals & Hotels",
    icon: "🏥",
    description: "Wholesome food service for medical staff, patients, and families",
  },
  "us.restaurant.medical_district_quick_meal.v1": {
    friendlyName: "Quick Eatery Near Medical Centers",
    categoryGroup: "Hospitals & Hotels",
    icon: "🩺",
    description: "Fast, healthy meals accessible to doctors, nurses, and clinic visitors",
  },
  "us.restaurant.hotel_integrated_restaurant.v1": {
    friendlyName: "Full-Service Hotel Restaurant",
    categoryGroup: "Hospitals & Hotels",
    icon: "🏨",
    description: "Signature hotel dining room offering breakfast, dinner, and room service",
  },
  "us.restaurant.mall_food_court_unit.v1": {
    friendlyName: "Mall Food Court Counter",
    categoryGroup: "Shopping & Retail",
    icon: "🛍️",
    description: "Counter-service restaurant inside high-traffic shopping mall food courts",
  },
  "us.restaurant.shopping_center_inline.v1": {
    friendlyName: "Shopping Center Family Restaurant",
    categoryGroup: "Shopping & Retail",
    icon: "🏬",
    description: "Casual sit-down eatery located in open-air retail centers and plazas",
  },
  "us.restaurant.retail_grocery_shop_in_shop.v1": {
    friendlyName: "Prepared Food Counter in Grocery Store",
    categoryGroup: "Shopping & Retail",
    icon: "🛒",
    description: "Deli or prepared meal station inside supermarkets and specialty grocers",
  },
  "us.restaurant.arterial_parking_led_inline.v1": {
    friendlyName: "Strip Mall Restaurant with Parking",
    categoryGroup: "Shopping & Retail",
    icon: "🚘",
    description: "High-visibility suburban restaurant with dedicated front parking",
  },
  "us.restaurant.food_hall_market_stall.v1": {
    friendlyName: "Food Hall / Artisan Market Stall",
    categoryGroup: "Shopping & Retail",
    icon: "🎪",
    description: "Gourmet vendor stall in vibrant multi-vendor food halls",
  },
  "us.restaurant.scheduled_rail_adjacent_street_express.v1": {
    friendlyName: "Train Station Quick Meal Counter",
    categoryGroup: "Transport & Public Spaces",
    icon: "🚉",
    description: "Rapid grab-and-go meal counter right outside major transit stations",
  },
  "us.restaurant.subway_station_internal_quick_service.v1": {
    friendlyName: "In-Station Transit Quick Service",
    categoryGroup: "Transport & Public Spaces",
    icon: "🚇",
    description: "Subway concourse fast-food unit serving rush-hour commuters",
  },
  "us.restaurant.airport_terminal_concession.v1": {
    friendlyName: "Airport Gate Concession Restaurant",
    categoryGroup: "Transport & Public Spaces",
    icon: "✈️",
    description: "Post-security airport terminal dining for air travelers",
  },
  "us.restaurant.regional_terminal_concourse.v1": {
    friendlyName: "Intercity Bus & Train Station Dining",
    categoryGroup: "Transport & Public Spaces",
    icon: "🚆",
    description: "Spacious station dining for regional and interstate travelers",
  },
  "us.restaurant.arena_event_concession.v1": {
    friendlyName: "Sports Stadium & Arena Concession",
    categoryGroup: "Cultural & Event Venues",
    icon: "🏟️",
    description: "High-speed stadium kiosk for game-day and concert crowds",
  },
  "us.restaurant.theater_event_district_pre_post.v1": {
    friendlyName: "Pre & Post Show Theater Restaurant",
    categoryGroup: "Cultural & Event Venues",
    icon: "🎭",
    description: "Dinner spot specialized in timely dining before and after Broadway shows",
  },
  "us.restaurant.cultural_venue_foodservice.v1": {
    friendlyName: "Museum & Concert Hall Dining",
    categoryGroup: "Cultural & Event Venues",
    icon: "🏛️",
    description: "Artistic dining room or bistro inside cultural institutions",
  },
  "us.restaurant.visitor_district_all_day.v1": {
    friendlyName: "Tourist District All-Day Restaurant",
    categoryGroup: "Cultural & Event Venues",
    icon: "🗺️",
    description: "Bustling all-day restaurant in historic or tourist-heavy quarters",
  },
  "us.restaurant.campus_adjacent_quick_meal.v1": {
    friendlyName: "Student-Friendly Fast Casual (Near Campus)",
    categoryGroup: "Everyday Dining",
    icon: "🎓",
    description: "Budget-friendly, hearty meals and late-night eats right off university grounds",
  },
  "us.restaurant.campus_captive_foodservice.v1": {
    friendlyName: "University Dining Hall Vendor",
    categoryGroup: "Everyday Dining",
    icon: "🏫",
    description: "On-campus student center food outlet",
  },
  "us.restaurant.mobile_food_cart_truck.v1": {
    friendlyName: "Food Truck / Mobile Meal Cart",
    categoryGroup: "Mobile & Temporary",
    icon: "🚚",
    description: "Mobile food truck operating at street rallies, parks, and corporate plazas",
  },
  "us.restaurant.seasonal_market_pop_up.v1": {
    friendlyName: "Pop-Up Food Stall & Seasonal Market",
    categoryGroup: "Mobile & Temporary",
    icon: "🎪",
    description: "Temporary festival and holiday market culinary booth",
  },
  "us.restaurant.delivery_pickup_production_kitchen.v1": {
    friendlyName: "Delivery-Only Cloud Kitchen",
    categoryGroup: "Mobile & Temporary",
    icon: "🛵",
    description: "Dedicated production kitchen optimized exclusively for DoorDash/UberEats",
  },
  "us.restaurant.shared_kitchen_operator_suite.v1": {
    friendlyName: "Shared Commercial Kitchen Operator",
    categoryGroup: "Mobile & Temporary",
    icon: "👨‍🍳",
    description: "Commercial culinary incubator suite for food entrepreneurs",
  },
};

export const AUDIENCE_FRIENDLY_MAP: Record<string, { friendlyLabel: string; icon: string }> = {
  morning_commuters: { friendlyLabel: "Morning Commuters & Transit Riders", icon: "🚆" },
  office_routine: { friendlyLabel: "Office & Corporate Employees", icon: "💼" },
  business_meetings: { friendlyLabel: "Business Executives & Client Meetings", icon: "👔" },
  hybrid_remote: { friendlyLabel: "Remote Workers & Freelancers", icon: "💻" },
  student_value: { friendlyLabel: "College & University Students", icon: "🎓" },
  family_household: { friendlyLabel: "Families & Neighborhood Households", icon: "👨‍👩‍👧" },
  resident_value: { friendlyLabel: "Budget-Conscious Local Residents", icon: "🏘️" },
  resident_premium: { friendlyLabel: "Affluent Local Residents", icon: "💎" },
  neighborhood_routine: { friendlyLabel: "Local Neighborhood Regulars", icon: "🚶" },
  tourist_mainstream: { friendlyLabel: "Tourists & Metro Visitors", icon: "🗺️" },
  tourist_premium: { friendlyLabel: "Luxury & High-Spend Visitors", icon: "✨" },
  tourist_family: { friendlyLabel: "Visiting Vacation Families", icon: "🏖️" },
  hotel_stay_visitors: { friendlyLabel: "Hotel Guests & Travelers", icon: "🏨" },
  conference_business: { friendlyLabel: "Conference & Convention Attendees", icon: "🎟️" },
  cultural_visitors: { friendlyLabel: "Museum & Arts Patrons", icon: "🎨" },
  theater_event: { friendlyLabel: "Theater & Show Audiences", icon: "🎭" },
  stadium_event: { friendlyLabel: "Sports Fans & Stadium Crowds", icon: "🏟️" },
  weekend_social_visits: { friendlyLabel: "Weekend Social Diners & Brunchers", icon: "🥂" },
  after_work_social: { friendlyLabel: "After-Work Happy Hour Crowds", icon: "🍸" },
  dining_social: { friendlyLabel: "Dinner & Foodie Enthusiasts", icon: "🍽️" },
  late_night_social: { friendlyLabel: "Late-Night Socializers", icon: "🌙" },
  hospital_workers: { friendlyLabel: "Healthcare & Hospital Workers", icon: "🩺" },
  outpatient_visits: { friendlyLabel: "Clinic & Hospital Patients", icon: "🏥" },
  industrial_logistics_workers: { friendlyLabel: "Industrial & Logistics Workers", icon: "🏭" },
  construction_trades: { friendlyLabel: "Trade & Construction Crews", icon: "🏗️" },
  overnight_workers: { friendlyLabel: "Night Shift & Essential Workers", icon: "🔦" },
  everyday_shoppers: { friendlyLabel: "Everyday Retail Shoppers", icon: "🛍️" },
  premium_shoppers: { friendlyLabel: "Luxury & High-End Shoppers", icon: "🛍️" },
  car_errands: { friendlyLabel: "Drivers & Roadside Errands", icon: "🚗" },
  rail_transfer: { friendlyLabel: "Train & Subway Commuters", icon: "🚉" },
};

export const DAYPART_FRIENDLY_MAP: Record<
  string,
  { friendlyLabel: string; icon: string; timeRange: string }
> = {
  weekday_am: {
    friendlyLabel: "Morning Rush",
    icon: "🌅",
    timeRange: "6:00 AM – 10:30 AM (Commute & Breakfast)",
  },
  weekday_midday: {
    friendlyLabel: "Lunch & Midday",
    icon: "☀️",
    timeRange: "11:00 AM – 2:30 PM (Midday Dining & Errands)",
  },
  weekday_evening: {
    friendlyLabel: "Evening Rush & Dinner",
    icon: "🌆",
    timeRange: "5:00 PM – 9:30 PM (Dinner & Social Hours)",
  },
  late_night: {
    friendlyLabel: "Late Night",
    icon: "🌙",
    timeRange: "10:00 PM – 4:00 AM (Nightlife & Shift Workers)",
  },
  weekend_day: {
    friendlyLabel: "Weekend Daytime & Brunch",
    icon: "☕",
    timeRange: "9:00 AM – 5:00 PM (Brunch & Leisure Footfall)",
  },
};

/**
 * Gets user-friendly presentation details for an archetype ID
 */
export function getFriendlyArchetype(archetypeId: string, rawName?: string): FriendlyArchetypeMeta {
  if (ARCHETYPE_FRIENDLY_MAP[archetypeId]) {
    return ARCHETYPE_FRIENDLY_MAP[archetypeId];
  }

  // Fallback cleanup
  const cleanName = (rawName || archetypeId)
    .replace(/^us\.(cafe|restaurant)\./, "")
    .replace(/\.v\d+$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    friendlyName: cleanName,
    categoryGroup: "Business Concepts",
    icon: "🏪",
    description: "Commercial business concept archetype",
  };
}

/**
 * Gets user-friendly presentation details for an audience ID
 */
export function getFriendlyAudience(audienceId: string, rawLabel?: string): { friendlyLabel: string; icon: string } {
  if (AUDIENCE_FRIENDLY_MAP[audienceId]) {
    return AUDIENCE_FRIENDLY_MAP[audienceId];
  }

  const clean = (rawLabel || audienceId)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    friendlyLabel: clean,
    icon: "👥",
  };
}

/**
 * Gets user-friendly presentation details for a daypart ID
 */
export function getFriendlyDaypart(
  daypartId: string,
  rawLabel?: string
): { friendlyLabel: string; icon: string; timeRange: string } {
  if (DAYPART_FRIENDLY_MAP[daypartId]) {
    return DAYPART_FRIENDLY_MAP[daypartId];
  }

  return {
    friendlyLabel: rawLabel || daypartId,
    icon: "🕒",
    timeRange: "Operating Hours",
  };
}
