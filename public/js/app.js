/**
 * Market Compass - Frontend Application Controller
 * Handles routing, API integration, interactive forms, and dynamic report generation.
 */

// Application State
const state = {
  activeView: 'dashboard',
  stats: null,
  corridors: [],
  archetypes: [],
  audiences: [],
  dayparts: [],
  selectedPair: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupRouting();
  await loadInitialData();
  renderDashboardStats();
  populateFormDropdowns();
  handleUrlRoute();
});

/* =========================================================================
   ROUTING & VIEW MANAGEMENT
   ========================================================================= */
function setupRouting() {
  window.addEventListener('hashchange', handleUrlRoute);
}

function handleUrlRoute() {
  let hash = window.location.hash.replace('#', '') || 'dashboard';
  
  if (hash === 'corridor-to-business') hash = 'find-business';
  if (hash === 'business-to-corridor') hash = 'find-place';

  if (hash.startsWith('report/')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      openOpportunityReport(parts[1], parts[2]);
      return;
    }
  }

  if (hash.startsWith('corridor/')) {
    const parts = hash.split('/');
    if (parts.length >= 2) {
      openCorridorProfile(parts[1]);
      return;
    }
  }

  navigateTo(hash, false);
}

function navigateTo(viewId, updateHash = true) {
  if (viewId === 'corridor-to-business') viewId = 'find-business';
  if (viewId === 'business-to-corridor') viewId = 'find-place';

  const validViews = ['dashboard', 'find-business', 'find-place', 'explore', 'methodology'];
  if (!validViews.includes(viewId)) viewId = 'dashboard';

  state.activeView = viewId;

  // Update Nav Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.view === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Views
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(`view-${viewId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  if (updateHash) {
    window.location.hash = viewId;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger view-specific renders
  if (viewId === 'explore') {
    filterCorridors();
  }
}
window.navigateTo = navigateTo;

/* =========================================================================
   DATA LOADING
   ========================================================================= */
async function loadInitialData() {
  try {
    const [statsRes, corrRes, archRes, audRes, dayRes] = await Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/corridors').then(r => r.json()),
      fetch('/api/archetypes').then(r => r.json()),
      fetch('/api/audiences').then(r => r.json()),
      fetch('/api/dayparts').then(r => r.json())
    ]);

    if (statsRes.success) state.stats = statsRes.data;
    if (corrRes.success) state.corridors = corrRes.data;
    if (archRes.success) state.archetypes = archRes.data;
    if (audRes.success) state.audiences = audRes.data;
    if (dayRes.success) state.dayparts = dayRes.data;
  } catch (err) {
    console.error('[Market Compass] Error loading initial data:', err);
  }
}

function renderDashboardStats() {
  if (!state.stats) return;

  const d = state.stats;
  document.getElementById('stats-bundle-id').textContent = `Bundle: ${d.bundleId}`;
  document.getElementById('stat-cities').textContent = d.cities.length;
  document.getElementById('stat-corridors').textContent = d.corridorsCount.toLocaleString();
  document.getElementById('stat-audiences').textContent = d.audienceSegmentsCount.toLocaleString();
  document.getElementById('stat-archetypes').textContent = d.archetypesCount.toLocaleString();
  document.getElementById('stat-places').textContent = d.mappedPlacesCount.toLocaleString();
}

function populateFormDropdowns() {
  // Populate C2B Audiences
  const audSelects = [document.getElementById('c2b-audience'), document.getElementById('b2c-audience')];
  audSelects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">All Relevant Audiences</option>';
    
    // Group by family
    const families = {};
    state.audiences.forEach(a => {
      const fam = a.family_id || 'Other';
      if (!families[fam]) families[fam] = [];
      families[fam].push(a);
    });

    for (const [fam, list] of Object.entries(families)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = fam.toUpperCase();
      list.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.segment_id;
        opt.textContent = a.label;
        optgroup.appendChild(opt);
      });
      sel.appendChild(optgroup);
    }
  });

  // Populate Dayparts
  const daySelects = [document.getElementById('c2b-daypart'), document.getElementById('b2c-daypart')];
  daySelects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">All Operating Windows</option>';
    state.dayparts.forEach(dp => {
      const opt = document.createElement('option');
      opt.value = dp.id;
      opt.textContent = dp.label;
      sel.appendChild(opt);
    });
  });

  // Populate C2B Corridors based on default NYC city
  onC2BCityChange();

  // Populate B2C Archetypes
  onB2CCityChange();
}

/* =========================================================================
   DEMO PRESETS FOR LIVE HACKATHON
   ========================================================================= */
function applyC2BPreset(corridorId, city, audience, daypart) {
  document.getElementById('c2b-city').value = city;
  onC2BCityChange();
  
  setTimeout(() => {
    document.getElementById('c2b-corridor').value = corridorId;
    if (audience) document.getElementById('c2b-audience').value = audience;
    if (daypart) document.getElementById('c2b-daypart').value = daypart;
    
    // Auto-trigger submit for instantaneous demo
    document.getElementById('form-corridor-to-business').dispatchEvent(new Event('submit'));
  }, 50);
}

function applyB2CPreset(archetypeId, city, audience, daypart) {
  document.getElementById('b2c-city').value = city;
  onB2CCityChange();

  setTimeout(() => {
    document.getElementById('b2c-archetype').value = archetypeId;
    if (audience) document.getElementById('b2c-audience').value = audience;
    if (daypart) document.getElementById('b2c-daypart').value = daypart;

    // Auto-trigger submit for instantaneous demo
    document.getElementById('form-business-to-corridor').dispatchEvent(new Event('submit'));
  }, 50);
}

/* =========================================================================
   MODE 1: CORRIDOR -> BUSINESS
   ========================================================================= */
function onC2BCityChange() {
  const city = document.getElementById('c2b-city').value;
  const corridorSelect = document.getElementById('c2b-corridor');
  corridorSelect.innerHTML = '<option value="">Select a corridor...</option>';

  const filtered = city === 'all' 
    ? state.corridors 
    : state.corridors.filter(c => c.metro_id === city);

  // Group by borough / district
  const groups = {};
  filtered.forEach(c => {
    const grp = c.borough || c.metro_id.toUpperCase();
    if (!groups[grp]) groups[grp] = [];
    groups[grp].push(c);
  });

  for (const [grpName, list] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = grpName;
    list.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.corridor_id;
      opt.textContent = `${c.name} (${c.level === 'SUB_CORRIDOR' ? 'Sub-district' : 'Macro'})`;
      optgroup.appendChild(opt);
    });
    corridorSelect.appendChild(optgroup);
  }
}

async function handleCorridorToBusiness(e) {
  e.preventDefault();

  const city = document.getElementById('c2b-city').value;
  const corridorId = document.getElementById('c2b-corridor').value;
  const targetAudience = document.getElementById('c2b-audience').value;
  const operatingTime = document.getElementById('c2b-daypart').value;
  const submitBtn = document.getElementById('btn-c2b-submit');
  const resultsContainer = document.getElementById('c2b-results');

  if (!corridorId) {
    alert('Please select a commercial corridor.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing 6 Dimensions...';
  resultsContainer.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span><p style="margin-top:1rem">Evaluating customer signals, operating time overlap, supply whitespace, and access friction...</p></div>';

  try {
    const res = await fetch('/api/recommend/corridor-to-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: city !== 'all' ? city : null,
        corridor: corridorId,
        targetAudience: targetAudience || null,
        operatingTime: operatingTime || null,
        limit: 3
      })
    }).then(r => r.json());

    if (res.success && res.recommendations) {
      renderCorridorToBusinessResults(res.recommendations, corridorId, targetAudience, operatingTime);
    } else {
      resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No Recommendations Found</h3><p>${res.error || 'Unable to compute scores.'}</p></div>`;
    }
  } catch (err) {
    resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error</h3><p>${err.message}</p></div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">⚡</span> Find Top 3 Business Concepts';
  }
}

function renderCorridorToBusinessResults(recommendations, corridorId, targetAudience, operatingTime) {
  const container = document.getElementById('c2b-results');
  const corridor = state.corridors.find(c => c.corridor_id === corridorId);
  const corrName = corridor ? corridor.name : corridorId;

  let html = `
    <div class="results-header-card">
      <div>
        <div class="tagline-pill">Top 3 Ranked Business Concepts</div>
        <h3 class="results-title">Optimal Business Concepts for ${corrName}</h3>
      </div>
      <span class="badge badge-accent">Ranked by Fit Score</span>
    </div>
    <div class="results-grid">
  `;

  recommendations.forEach((r, idx) => {
    const rankClass = `rank-pill-${r.rank}`;
    const scoreVal = Math.round(r.score);
    const scoreColorClass = scoreVal >= 75 ? 'score-num-strong' : scoreVal >= 60 ? 'score-num-moderate' : 'score-num-weak';
    const tierBadgeClass = r.fitTier === 'STRONG_FIT' ? 'badge-success' : r.fitTier === 'MODERATE_FIT' ? 'badge-info' : 'badge-warning';

    html += `
      <div class="recommendation-card" onclick="openOpportunityReport('${corridorId}', '${r.archetypeId}', '${targetAudience || ''}', '${operatingTime || ''}')">
        <div>
          <div class="card-top">
            <div class="rank-pill ${rankClass}">#${r.rank}</div>
            <div class="score-display">
              <div class="score-num-box">
                <span class="score-num ${scoreColorClass}">${scoreVal}</span>
                <span class="score-max">/100</span>
              </div>
              <span class="score-caption">Opportunity Score</span>
            </div>
          </div>

          <h3 class="card-title">${r.name}</h3>

          <div class="card-badges">
            <span class="badge ${tierBadgeClass}">${r.fitTierLabel}</span>
            <span class="badge badge-neutral">${r.category}</span>
          </div>

          <!-- Central "Why this recommendation?" Section -->
          <div class="why-recommendation-box">
            <div class="why-title">💡 Why this recommendation?</div>
            <p style="font-size:0.84rem; color:var(--text-muted); line-height:1.45; margin-bottom:0.5rem;">${r.explanation}</p>
            <ul class="why-reasons-list">
              ${(r.positiveSignals || []).slice(0, 2).map(s => `
                <li class="why-reason-item">
                  <span class="why-reason-icon">✓</span>
                  <span>${s}</span>
                </li>
              `).join('')}
              ${(r.concerns || []).slice(0, 1).map(c => `
                <li class="why-reason-item">
                  <span class="why-concern-icon">⚠</span>
                  <span style="color:#FDE68A;">${c}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">Audience:</span>
              <span class="detail-val">${r.recommendedTargetAudience}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Active Hours:</span>
              <span class="detail-val">${r.recommendedOperatingTime}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="click-hint">Inspect 6-Dimension Report →</span>
          <button class="btn btn-secondary btn-sm">Full Report</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function resetC2BForm() {
  document.getElementById('form-corridor-to-business').reset();
  onC2BCityChange();
  document.getElementById('c2b-results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📍</div>
      <h3>Ready to Discover Opportunities</h3>
      <p>Select a city and commercial corridor above, then click <strong>"Find Opportunities"</strong> to generate the top 3 recommended business archetypes.</p>
    </div>
  `;
}

/* =========================================================================
   MODE 2: BUSINESS -> CORRIDOR
   ========================================================================= */
function onB2CCityChange() {
  const city = document.getElementById('b2c-city').value;
  const archetypeSelect = document.getElementById('b2c-archetype');
  archetypeSelect.innerHTML = '<option value="">Select a business concept...</option>';

  const filtered = city === 'nyc' 
    ? state.archetypes.filter(a => a.category_id === 'CAFE')
    : state.archetypes;

  // Group by category
  const groups = {};
  filtered.forEach(a => {
    const cat = a.category_id || 'GENERAL';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(a);
  });

  for (const [catName, list] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = `${catName} ARCHETYPES`;
    list.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.archetype_id;
      opt.textContent = a.name;
      optgroup.appendChild(opt);
    });
    archetypeSelect.appendChild(optgroup);
  }
}

async function handleBusinessToCorridor(e) {
  e.preventDefault();

  const city = document.getElementById('b2c-city').value;
  const archetypeId = document.getElementById('b2c-archetype').value;
  const targetAudience = document.getElementById('b2c-audience').value;
  const operatingTime = document.getElementById('b2c-daypart').value;
  const submitBtn = document.getElementById('btn-b2c-submit');
  const resultsContainer = document.getElementById('b2c-results');

  if (!archetypeId) {
    alert('Please select a business archetype.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Searching Corridors...';
  resultsContainer.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span><p style="margin-top:1rem">Evaluating corridor compatibility across all candidate locations...</p></div>';

  try {
    const res = await fetch('/api/recommend/business-to-corridor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: city !== 'all' ? city : null,
        archetype: archetypeId,
        targetAudience: targetAudience || null,
        operatingTime: operatingTime || null,
        limit: 3
      })
    }).then(r => r.json());

    if (res.success && res.recommendations) {
      renderBusinessToCorridorResults(res.recommendations, archetypeId, targetAudience, operatingTime);
    } else {
      resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No Locations Found</h3><p>${res.error || 'Unable to compute scores.'}</p></div>`;
    }
  } catch (err) {
    resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error</h3><p>${err.message}</p></div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">🎯</span> Find Locations';
  }
}

function renderBusinessToCorridorResults(recommendations, archetypeId, targetAudience, operatingTime) {
  const container = document.getElementById('b2c-results');
  const archetype = state.archetypes.find(a => a.archetype_id === archetypeId);
  const archName = archetype ? archetype.name : archetypeId;

  let html = `
    <div class="results-header-card">
      <div>
        <div class="tagline-pill">Top 3 Ranked Commercial Corridors</div>
        <h3 class="results-title">Optimal Locations for "${archName}"</h3>
      </div>
      <span class="badge badge-accent">Ranked by Fit Score</span>
    </div>
    <div class="results-grid">
  `;

  recommendations.forEach((r, idx) => {
    const rankClass = `rank-pill-${r.rank}`;
    const scoreVal = Math.round(r.score);
    const scoreColorClass = scoreVal >= 75 ? 'score-num-strong' : scoreVal >= 60 ? 'score-num-moderate' : 'score-num-weak';
    const tierBadgeClass = r.fitTier === 'STRONG_FIT' ? 'badge-success' : r.fitTier === 'MODERATE_FIT' ? 'badge-info' : 'badge-warning';
    const metroLabel = r.city === 'nyc' ? 'New York City' : 'Dallas–Fort Worth';

    html += `
      <div class="recommendation-card" onclick="openOpportunityReport('${r.corridorId}', '${archetypeId}', '${targetAudience || ''}', '${operatingTime || ''}')">
        <div>
          <div class="card-top">
            <div class="rank-pill ${rankClass}">#${r.rank}</div>
            <div class="score-display">
              <div class="score-num-box">
                <span class="score-num ${scoreColorClass}">${scoreVal}</span>
                <span class="score-max">/100</span>
              </div>
              <span class="score-caption">Opportunity Score</span>
            </div>
          </div>

          <h3 class="card-title">${r.corridorName}</h3>

          <div class="card-badges">
            <span class="badge ${tierBadgeClass}">${r.fitTierLabel}</span>
            <span class="badge badge-neutral">${metroLabel}</span>
          </div>

          <!-- Central "Why this recommendation?" Section -->
          <div class="why-recommendation-box">
            <div class="why-title">💡 Why this corridor?</div>
            <p style="font-size:0.84rem; color:var(--text-muted); line-height:1.45; margin-bottom:0.5rem;">${r.explanation}</p>
            <ul class="why-reasons-list">
              ${(r.positiveSignals || []).slice(0, 2).map(s => `
                <li class="why-reason-item">
                  <span class="why-reason-icon">✓</span>
                  <span>${s}</span>
                </li>
              `).join('')}
              ${(r.concerns || []).slice(0, 1).map(c => `
                <li class="why-reason-item">
                  <span class="why-concern-icon">⚠</span>
                  <span style="color:#FDE68A;">${c}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">Audience:</span>
              <span class="detail-val">${r.audienceCompatibility.label} (${Math.round(r.audienceCompatibility.score)}/100)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Business Fit:</span>
              <span class="detail-val">${r.businessFit.label} (${Math.round(r.businessFit.score)}/100)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Timing Match:</span>
              <span class="detail-val">${r.operatingTimeCompatibility.label} (${Math.round(r.operatingTimeCompatibility.score)}/100)</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="click-hint">Inspect 6-Dimension Report →</span>
          <button class="btn btn-secondary btn-sm">Full Report</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function resetB2CForm() {
  document.getElementById('form-business-to-corridor').reset();
  onB2CCityChange();
  document.getElementById('b2c-results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🏢</div>
      <h3>Ready to Discover Locations</h3>
      <p>Select a business archetype above or click a <strong>Demo Shortcut</strong> to instantly evaluate the top 3 ranked commercial corridors.</p>
    </div>
  `;
}

/* =========================================================================
   FRIENDLY LABELS DICTIONARY FOR MODALS
   ========================================================================= */
const MODAL_ARCHETYPE_MAP = {
  "us.cafe.destination_roastery_flagship.v1": { friendlyName: "Premium Coffee Roastery", group: "Premium & Specialty", icon: "☕" },
  "us.cafe.destination_high_street_cafe.v1": { friendlyName: "High Street Fashion Café", group: "Premium & Specialty", icon: "☕" },
  "us.cafe.destination_flagship.v1": { friendlyName: "Flagship Specialty Café", group: "Premium & Specialty", icon: "✨" },
  "us.cafe.reservation_coffee_tea_salon.v1": { friendlyName: "Reservation Tea & Coffee Lounge", group: "Premium & Specialty", icon: "🫖" },
  "us.cafe.private_members_club_cafe.v1": { friendlyName: "Members-Only Club Café", group: "Premium & Specialty", icon: "👑" },
  "us.cafe.neighborhood_seated.v1": { friendlyName: "Neighbourhood Café & Coffeehouse", group: "Everyday Cafés", icon: "☕" },
  "us.cafe.neighborhood_takeaway.v1": { friendlyName: "Quick Takeaway Coffee Shop", group: "Quick-Service & Takeaway", icon: "🏃" },
  "us.cafe.drive_through.v1": { friendlyName: "Drive-Through Café", group: "Everyday Cafés", icon: "🚗" },
  "us.cafe.residential_amenity_cafe.v1": { friendlyName: "Residential Community Café", group: "Everyday Cafés", icon: "🏘️" },
  "us.cafe.office_district_coffeehouse.v1": { friendlyName: "Office Area Seated Café", group: "Office & Workplace", icon: "🏢" },
  "us.cafe.office_district_street_express.v1": { friendlyName: "Quick Coffee Shop Near Offices", group: "Office & Workplace", icon: "💼" },
  "us.cafe.office_lobby_counter.v1": { friendlyName: "Office Lobby Coffee Counter", group: "Office & Workplace", icon: "🏢" },
  "us.cafe.workplace_captive_counter.v1": { friendlyName: "Corporate Campus Coffee Bar", group: "Office & Workplace", icon: "💻" },
  "us.cafe.industrial_logistics_district_counter.v1": { friendlyName: "Coffee Shop for Industrial Workers", group: "Office & Workplace", icon: "🏭" },
  "us.cafe.hospital_captive_kiosk.v1": { friendlyName: "Hospital Lobby Coffee Kiosk", group: "Hospitals & Hotels", icon: "🏥" },
  "us.cafe.medical_district_street_counter.v1": { friendlyName: "Coffee Shop Near Hospitals", group: "Hospitals & Hotels", icon: "🩺" },
  "us.cafe.hotel_lobby_cafe.v1": { friendlyName: "Hotel Lobby Café & Bar", group: "Hospitals & Hotels", icon: "🏨" },
  "us.cafe.mall_food_court_kiosk.v1": { friendlyName: "Mall Coffee Kiosk", group: "Shopping & Retail", icon: "🛍️" },
  "us.cafe.shopping_center_inline.v1": { friendlyName: "Shopping Center Inline Café", group: "Shopping & Retail", icon: "🏬" },
  "us.cafe.retail_shop_in_shop.v1": { friendlyName: "Coffee Counter Inside a Store", group: "Shopping & Retail", icon: "👕" },
  "us.cafe.scheduled_rail_adjacent_street_express.v1": { friendlyName: "Quick Coffee Shop Near Railway Stations", group: "Transport & Public Spaces", icon: "🚉" },
  "us.cafe.subway_station_kiosk.v1": { friendlyName: "Subway Station Coffee Kiosk", group: "Transport & Public Spaces", icon: "🚇" },
  "us.cafe.regional_terminal_ferry_concourse.v1": { friendlyName: "Ferry & Bus Terminal Café", group: "Transport & Public Spaces", icon: "⛴️" },
  "us.cafe.public_space_kiosk.v1": { friendlyName: "Public Park / Plaza Coffee Kiosk", group: "Transport & Public Spaces", icon: "🌳" },
  "us.cafe.cultural_venue_cafe.v1": { friendlyName: "Museum & Theater Café", group: "Transport & Public Spaces", icon: "🎨" },
  "us.cafe.visitor_attraction_cafe.v1": { friendlyName: "Tourist Landmark Café", group: "Transport & Public Spaces", icon: "🗺️" },
  "us.cafe.mobile_street_cart.v1": { friendlyName: "Mobile Coffee Cart", group: "Mobile & Temporary", icon: "🚚" },
  "us.restaurant.neighborhood_casual_full_service.v1": { friendlyName: "Neighbourhood Casual Dining", group: "Everyday Dining", icon: "🍽️" },
  "us.restaurant.neighborhood_all_day_diner.v1": { friendlyName: "All-Day Classic Diner", group: "Everyday Dining", icon: "🍳" },
  "us.restaurant.neighborhood_seated_fast_casual.v1": { friendlyName: "Neighbourhood Fast-Casual Eatery", group: "Everyday Dining", icon: "🥗" },
  "us.restaurant.neighborhood_qsr_takeaway.v1": { friendlyName: "Neighbourhood Quick Takeaway", group: "Quick-Service & Takeaway", icon: "🥡" },
  "us.restaurant.assembly_line_fast_casual.v1": { friendlyName: "Build-Your-Own Fast Casual", group: "Quick-Service & Takeaway", icon: "🌯" },
  "us.restaurant.drive_through_qsr.v1": { friendlyName: "Drive-Through Quick Restaurant", group: "Quick-Service & Takeaway", icon: "🚗" },
  "us.restaurant.late_night_counter_service.v1": { friendlyName: "Late-Night Street Food Spot", group: "Evening & Nightlife", icon: "🌙" },
  "us.restaurant.high_street_evening_social.v1": { friendlyName: "Vibrant Evening Social Restaurant", group: "Evening & Nightlife", icon: "🍸" },
  "us.restaurant.destination_food_corridor.v1": { friendlyName: "Destination Dining Hotspot", group: "Premium & Specialty", icon: "🌟" },
  "us.restaurant.large_format_group_dining.v1": { friendlyName: "Large-Format Family & Group Dining", group: "Everyday Dining", icon: "👨‍👩‍👧‍👦" },
  "us.restaurant.office_district_weekday_lunch.v1": { friendlyName: "Office Area Lunch Spot", group: "Office & Workplace", icon: "🍱" },
  "us.restaurant.office_workplace_captive_foodservice.v1": { friendlyName: "Corporate Office Food Hall", group: "Office & Workplace", icon: "🏢" },
  "us.restaurant.industrial_logistics_shift_meal.v1": { friendlyName: "Worker Shift-Meal Canteen", group: "Office & Workplace", icon: "🏭" },
  "us.restaurant.hospital_captive_foodservice.v1": { friendlyName: "Hospital Food Court", group: "Hospitals & Hotels", icon: "🏥" },
  "us.restaurant.medical_district_quick_meal.v1": { friendlyName: "Quick Eatery Near Medical Centers", group: "Hospitals & Hotels", icon: "🩺" },
  "us.restaurant.hotel_integrated_restaurant.v1": { friendlyName: "Full-Service Hotel Restaurant", group: "Hospitals & Hotels", icon: "🏨" },
  "us.restaurant.mall_food_court_unit.v1": { friendlyName: "Mall Food Court Counter", group: "Shopping & Retail", icon: "🛍️" },
  "us.restaurant.shopping_center_inline.v1": { friendlyName: "Shopping Center Family Restaurant", group: "Shopping & Retail", icon: "🏬" },
  "us.restaurant.retail_grocery_shop_in_shop.v1": { friendlyName: "Prepared Food Counter in Grocery Store", group: "Shopping & Retail", icon: "🛒" },
  "us.restaurant.arterial_parking_led_inline.v1": { friendlyName: "Strip Mall Restaurant with Parking", group: "Shopping & Retail", icon: "🚘" },
  "us.restaurant.food_hall_market_stall.v1": { friendlyName: "Food Hall / Artisan Market Stall", group: "Shopping & Retail", icon: "🎪" },
  "us.restaurant.scheduled_rail_adjacent_street_express.v1": { friendlyName: "Train Station Quick Meal Counter", group: "Transport & Public Spaces", icon: "🚉" },
  "us.restaurant.subway_station_internal_quick_service.v1": { friendlyName: "In-Station Transit Quick Service", group: "Transport & Public Spaces", icon: "🚇" },
  "us.restaurant.airport_terminal_concession.v1": { friendlyName: "Airport Gate Concession", group: "Transport & Public Spaces", icon: "✈️" },
  "us.restaurant.regional_terminal_concourse.v1": { friendlyName: "Intercity Station Dining Room", group: "Transport & Public Spaces", icon: "🚆" },
  "us.restaurant.arena_event_concession.v1": { friendlyName: "Sports Stadium & Arena Concession", group: "Cultural & Event Venues", icon: "🏟️" },
  "us.restaurant.theater_event_district_pre_post.v1": { friendlyName: "Pre & Post Show Theater Restaurant", group: "Cultural & Event Venues", icon: "🎭" },
  "us.restaurant.cultural_venue_foodservice.v1": { friendlyName: "Museum & Concert Hall Dining", group: "Cultural & Event Venues", icon: "🏛️" },
  "us.restaurant.visitor_district_all_day.v1": { friendlyName: "Tourist District All-Day Restaurant", group: "Cultural & Event Venues", icon: "🗺️" },
  "us.restaurant.campus_adjacent_quick_meal.v1": { friendlyName: "Student-Friendly Fast Casual", group: "Everyday Dining", icon: "🎓" },
  "us.restaurant.campus_captive_foodservice.v1": { friendlyName: "University Dining Hall Vendor", group: "Everyday Dining", icon: "🏫" },
  "us.restaurant.mobile_food_cart_truck.v1": { friendlyName: "Food Truck / Mobile Meal Cart", group: "Mobile & Temporary", icon: "🚚" },
  "us.restaurant.seasonal_market_pop_up.v1": { friendlyName: "Pop-Up Food Stall & Seasonal Market", group: "Mobile & Temporary", icon: "🎪" },
  "us.restaurant.delivery_pickup_production_kitchen.v1": { friendlyName: "Delivery-Only Cloud Kitchen", group: "Mobile & Temporary", icon: "🛵" },
  "us.restaurant.shared_kitchen_operator_suite.v1": { friendlyName: "Shared Commercial Kitchen Operator", group: "Mobile & Temporary", icon: "👨‍🍳" }
};

function getModalFriendlyArchetype(id, rawName) {
  if (MODAL_ARCHETYPE_MAP[id]) return MODAL_ARCHETYPE_MAP[id];
  const clean = (rawName || id).replace(/^us\.(cafe|restaurant)\./, '').replace(/\.v\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { friendlyName: clean, group: "Business Concepts", icon: "🏪" };
}

const FRIENDLY_DIMENSION_NAMES = {
  businessFit: { 
    title: "Concept & Location Fit", 
    icon: "🏢", 
    tip: "Measures how naturally this business format suits the corridor's street layout and customer flow." 
  },
  audienceCompatibility: { 
    title: "Customer Demand & Footfall", 
    icon: "👥", 
    tip: "Measures the concentration of matching customers (commuters, residents, workers) in this area." 
  },
  operatingTimeCompatibility: { 
    title: "Best Operating Hours", 
    icon: "⏰", 
    tip: "Measures foot traffic volume during your intended morning, midday, and evening operating hours." 
  },
  supplyAndWhitespace: { 
    title: "Competition & Market Space", 
    icon: "🏪", 
    tip: "Measures local customer demand vs existing corporate chains and neighborhood competitors." 
  },
  accessAndContext: { 
    title: "Accessibility & Walkability", 
    icon: "🚶", 
    tip: "Measures sidewalk accessibility, proximity to transit stations, and walking ease." 
  },
  specialZoneRelevance: { 
    title: "Nearby Attractions & Anchors", 
    icon: "🏛️", 
    tip: "Measures foot traffic benefits from nearby stadiums, campuses, hospitals, or transit terminals." 
  }
};

function cleanSignalText(text) {
  if (!text) return '';

  const SIGNAL_REPLACEMENTS = {
    'TRANSIT_PASSENGER': 'daily transit commuters and subway passengers',
    'COMMUTER': 'morning and evening commuters',
    'CAPTIVE_HOST': 'hotel guests, travelers, and event visitors',
    'HOSPITALITY_GUEST': 'hotel visitors and out-of-town guests',
    'DAYTIME_WORKER': 'daytime office employees and remote workers',
    'TOURIST_VISITOR': 'visitors, tourists, and sightseeing crowds',
    'EVENT_SEASONAL': 'event attendees, theater-goers, and weekend crowds',
    'CAMPUS_POPULATION': 'university students and faculty',
    'SHOPPING_ERRAND': 'retail shoppers and local errand runners',
    'EVENING_NIGHT_CONVENIENCE': 'nightlife visitors, diners, and evening socializers',
    'VEHICLE_PASSBY': 'roadside drivers and vehicle commuters',
    'RESIDENT_BASE': 'local neighborhood residents',
    'MEDICAL_POPULATION': 'healthcare workers, patients, and clinic visitors',
    'INDUSTRIAL_SHIFT': 'industrial and morning shift workers'
  };

  let clean = text
    .replace(/High algorithmic archetype fit \([^)]+\) based on commercial decision track "([^"]+)"/gi, 'Strong commercial fit with local customer traffic and store format')
    .replace(/High algorithmic archetype fit \([^)]+\)[^.]*/gi, 'High natural compatibility with this commercial street')
    .replace(/Strong primary audience alignment:\s*([A-Z_]+)\s*(\([^)]+\))?/gi, (m, sig) => {
      const plain = SIGNAL_REPLACEMENTS[sig.trim()] || sig.toLowerCase().replace(/_/g, ' ');
      return `Strong primary customer demand from ${plain}`;
    })
    .replace(/Strong supporting audience alignment:\s*([A-Z_]+)\s*(\([^)]+\))?/gi, (m, sig) => {
      const plain = SIGNAL_REPLACEMENTS[sig.trim()] || sig.toLowerCase().replace(/_/g, ' ');
      return `Additional visitor flow from ${plain}`;
    })
    .replace(/Target audience "([^"]+)" is strongly present \([^)]+\)/gi, 'Active customer crowd ("$1") regularly frequents this corridor')
    .replace(/Corridor dominant customer flows:\s*([^.]+)\.?/gi, (m, p1) => `Steady daily foot traffic from ${p1.toLowerCase().replace(/_/g, ' ')}`)
    .replace(/High observed supply:\s*([A-Z_]+)\s*category has limited unmet demand\s*\([^)]+\)/gi, 'Established commercial area with strong local competition in this category')
    .replace(/High corporate chain dominance \([^)]+\) may increase customer acquisition barriers[^\n.]*/gi, 'Notable presence of established corporate brands in the immediate area')
    .replace(/Corridor access note:\s*/gi, '')
    .replace(/Access friction: \d+\/\d+, transit-orientation: \d+\/\d+, gateway dependency: \w+/gi, 'Transit-friendly location with smooth pedestrian access')
    .replace(/\([a-z0-9_]+:\s*\d+\/\d+\)/gi, '')
    .replace(/\(\d+(\.\d+)?\/\d+\s*whitespace\)/gi, '')
    .replace(/\(\d+(\.\d+)?\/\d+\)/gi, '')
    .replace(/LIVE OPPORTUNITY/g, 'high commercial demand')
    .replace(/OPEN_MARKET_SITE/g, 'open commercial market')
    .replace(/CONTROLLED_HOST/g, 'institutional location')
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!clean.endsWith('.')) clean += '.';
  }
  return clean;
}

function formatAudienceList(list) {
  if (!list || list.length === 0) return 'Local residents, commuters, and everyday shoppers';
  const nameMap = {
    RESIDENTS: 'Local Residents',
    NIGHTLIFE: 'Evening Socializers',
    SHOPPERS: 'Retail Shoppers',
    COMMUTERS: 'Transit Commuters',
    WORKERS: 'Office Workers',
    STUDENTS: 'University Students',
    TOURISTS: 'Visitors & Tourists'
  };
  return list.map(item => nameMap[item] || item.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ');
}

/* =========================================================================
   OPPORTUNITY DETAIL REPORT MODAL
   ========================================================================= */
async function openOpportunityReport(corridorId, archetypeId, targetAudience = '', operatingTime = '') {
  const modal = document.getElementById('modal-report');
  const body = document.getElementById('report-modal-body');
  modal.classList.add('active');
  body.innerHTML = '<div class="empty-state" style="padding:3rem 1rem;"><span class="loading-spinner"></span><p style="margin-top:1rem; font-weight:600; color:#334155;">Generating clear location evaluation report...</p></div>';

  try {
    const res = await fetch('/api/evaluate-pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corridorId, archetypeId, targetAudience, operatingTime })
    }).then(r => r.json());

    if (res.success && res.data) {
      renderOpportunityReportContent(res.data, targetAudience, operatingTime);
    } else {
      body.innerHTML = `<div class="empty-state"><h3>Unable to Load Report</h3><p>${res.error || 'Failed to load report data.'}</p></div>`;
    }
  } catch (err) {
    body.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

function renderOpportunityReportContent(data, targetAudience, operatingTime) {
  const { report, corridor, archetype, hostedZones } = data;
  const body = document.getElementById('report-modal-body');

  const archMeta = getModalFriendlyArchetype(archetype.archetype_id, archetype.name);
  const titleEl = document.getElementById('report-title');
  titleEl.innerHTML = `<span style="margin-right:0.35rem;">${archMeta.icon}</span> ${archMeta.friendlyName} <span style="color:#64748B; font-weight:500;">in ${corridor.name}</span>`;

  const roundedScore = Math.round(report.score);
  const tierBadgeClass = report.fitTier === 'STRONG_FIT' || roundedScore >= 75
    ? 'badge-success'
    : report.fitTier === 'MODERATE_FIT' || roundedScore >= 60
    ? 'badge-info'
    : 'badge-warning';

  const metroName = corridor.metro_id === 'nyc' ? 'New York City' : 'Dallas–Fort Worth';
  const scoreColor = roundedScore >= 75 ? '#059669' : roundedScore >= 60 ? '#2563EB' : '#D97706';

  let html = `
    <!-- 1. Friendly Executive Summary -->
    <div class="report-exec-summary">
      <div class="exec-header">
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span class="badge ${tierBadgeClass}" style="font-size:0.8rem; padding:0.35rem 0.75rem;">${report.fitTierLabel || 'VIABLE OPPORTUNITY'}</span>
          <span class="badge badge-neutral">${metroName}</span>
          <span class="badge badge-secondary" style="background:#F1F5F9; color:#475569;">${archMeta.group}</span>
        </div>
        <div class="exec-score-box">
          <span class="exec-score-val" style="color:${scoreColor};">${roundedScore}</span>
          <span class="exec-score-max">/100 Match Score</span>
        </div>
      </div>
      <div class="exec-verdict">
        <strong style="color:#0F172A; display:block; margin-bottom:0.25rem;">💡 Bottom Line Summary:</strong>
        ${report.explanation}
      </div>
    </div>

    <!-- 2. The Key Match Factors -->
    <div>
      <h3 class="report-section-title">
        <span>📊</span> How We Evaluated This Match
      </h3>
      <div class="dimensions-breakdown-grid">
  `;

  for (const [key, dim] of Object.entries(report.dimensions)) {
    const scoreVal = Math.round(dim.score);
    const weightPct = Math.round(dim.weight * 100);
    const friendlyDim = FRIENDLY_DIMENSION_NAMES[key] || { title: dim.name, icon: "📌", tip: "" };
    const barColor = scoreVal >= 75 ? 'linear-gradient(90deg, #10B981, #059669)' : scoreVal >= 60 ? 'linear-gradient(90deg, #3B82F6, #2563EB)' : 'linear-gradient(90deg, #F59E0B, #D97706)';

    html += `
      <div class="dimension-card">
        <div class="dim-card-header">
          <span class="dim-name">
            <span style="margin-right:0.25rem;">${friendlyDim.icon}</span> ${friendlyDim.title}
          </span>
          <span class="dim-weight">${weightPct}% importance</span>
        </div>
        <div class="dim-meter-wrapper">
          <div class="dim-meter-fill" style="width: ${scoreVal}%; background: ${barColor};"></div>
        </div>
        <div class="dim-meta">
          <span>Score: <strong class="dim-score-val">${scoreVal}/100</strong></span>
          <span style="color:${scoreVal >= 70 ? '#059669' : '#475569'}; font-weight:600;">${scoreVal >= 75 ? 'Strong Match' : scoreVal >= 60 ? 'Good Match' : 'Moderate'}</span>
        </div>
        <div class="dim-desc" style="color:#64748B;">${friendlyDim.tip}</div>
      </div>
    `;
  }

  html += `
      </div>
    </div>

    <!-- 3. Practical Everyday Market Insights -->
    <div class="two-col-grid">
      <!-- Audience Insights -->
      <div class="info-card">
        <h4>👥 Who Visits This Area & Why They Buy</h4>
        <p><strong>Primary Crowd:</strong> ${formatAudienceList(corridor.dominant_audience)}</p>
        <p><strong>Customer Need:</strong> Convenient, fast everyday food and beverages during active commute and lunch windows.</p>
      </div>

      <!-- Operating Hours Insights -->
      <div class="info-card">
        <h4>⏰ Recommended Opening Windows</h4>
        <p><strong>Best Footfall Hours:</strong> ${report.recommendedOperatingTime}</p>
        <p><strong>Peak Daily Period:</strong> High morning commute and midday lunch traffic with steady footfall.</p>
      </div>

      <!-- Location Setup Insights -->
      <div class="info-card">
        <h4>🏢 Location Setup & Frontage</h4>
        <p><strong>Format Type:</strong> Walk-in streetfront location or transit-accessible counter.</p>
        <p><strong>Foot Traffic Flow:</strong> High sidewalk circulation with minimal physical barriers and easy customer entry.</p>
      </div>

      <!-- Competition & Market Space -->
      <div class="info-card">
        <h4>🏪 Competition & Market Opportunity</h4>
        <p><strong>Room for New Business:</strong> ${report.dimensions.supplyAndWhitespace.whitespaceIndex >= 60 ? 'High unmet opportunity — healthy room for a quality local offering.' : 'Established commercial area with steady customer demand.'}</p>
        <p><strong>Corporate Chains:</strong> Nearby retail presence creates strong everyday customer footfall habits.</p>
      </div>
    </div>

    <!-- 4. Nearby Destinations & Anchor Institutions -->
    <div class="info-card">
      <h4>🏛 Nearby Destinations & Landmark Anchors</h4>
      ${hostedZones.length > 0 ? `
        <p>This location benefits from <strong>${hostedZones.length}</strong> major landmark(s) nearby that bring extra visitors:</p>
        <ul style="padding-left:1.25rem; margin:0.5rem 0 0.5rem; font-size:0.88rem; color:#334155;">
          ${hostedZones.map(z => `<li style="margin-bottom:0.25rem;"><strong>${z.name}</strong> <span style="color:#64748B;">(${z.zone_type.replace(/_/g, ' ')})</span></li>`).join('')}
        </ul>
        <p style="font-size:0.8rem; color:#64748B;">These anchors generate regular waves of visitors, students, or event crowds.</p>
      ` : `
        <p>Standard neighborhood commercial street with steady everyday residential and worker foot traffic.</p>
      `}
    </div>

    <!-- 5. Key Advantages vs Things to Plan For -->
    <div class="two-col-grid">
      <div class="info-card" style="border-left: 4px solid #10B981; background:#F0FDF4;">
        <h4 style="color:#065F46;">🟢 Top Advantages (Why This Works)</h4>
        <ul class="signal-list">
          ${report.positiveSignals.map(s => `<li class="signal-item" style="color:#166534; font-size:0.85rem; padding:0.25rem 0;"><span>✓</span> <span>${cleanSignalText(s)}</span></li>`).join('')}
        </ul>
      </div>

      <div class="info-card" style="border-left: 4px solid #F59E0B; background:#FFFBEB;">
        <h4 style="color:#92400E;">🟡 Practical Things to Keep in Mind</h4>
        <ul class="signal-list">
          ${report.concerns.length > 0 ? report.concerns.map(c => `<li class="signal-item" style="color:#78350F; font-size:0.85rem; padding:0.25rem 0;"><span>•</span> <span>${cleanSignalText(c)}</span></li>`).join('') : '<li class="signal-item" style="color:#78350F; font-size:0.85rem;"><span>•</span> <span>No significant location friction detected. Ready for site visit.</span></li>'}
        </ul>
      </div>
    </div>

    <!-- 6. Practical Advice for Founders & Operators -->
    <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:0.75rem; padding:1rem 1.25rem; color:#1E40AF; font-size:0.85rem; line-height:1.5;">
      <strong>💡 Practical Advice for Operators:</strong> This report highlights the compatibility between your business concept and the local customer footfall. When selecting a specific lease space, always inspect the street in person during your intended peak operating hours.
    </div>
  `;

  body.innerHTML = html;
}

function closeReportModal() {
  document.getElementById('modal-report').classList.remove('active');
  if (window.location.hash.startsWith('#report/')) {
    window.location.hash = state.activeView;
  }
}

/* =========================================================================
   EXPLORE CORRIDORS
   ========================================================================= */
function filterCorridors() {
  const search = (document.getElementById('explore-search')?.value || '').toLowerCase().trim();
  const city = document.getElementById('explore-city')?.value || 'all';
  const form = document.getElementById('explore-form')?.value || 'all';
  const sortBy = document.getElementById('explore-sort')?.value || 'name';

  let list = [...state.corridors];

  if (city !== 'all') {
    list = list.filter(c => c.metro_id === city);
  }

  if (form !== 'all') {
    list = list.filter(c => c.form === form);
  }

  if (search) {
    list = list.filter(c => {
      return c.name.toLowerCase().includes(search) ||
             (c.neighborhoods || []).some(n => n.toLowerCase().includes(search)) ||
             (c.borough && c.borough.toLowerCase().includes(search));
    });
  }

  // Sorting
  if (sortBy === 'momentum') {
    list.sort((a, b) => (b.momentum || 50) - (a.momentum || 50));
  } else if (sortBy === 'timing_alpha') {
    list.sort((a, b) => (b.timing_alpha || 50) - (a.timing_alpha || 50));
  } else if (sortBy === 'crime_safety') {
    list.sort((a, b) => (b.safety_day || 60) - (a.safety_day || 60));
  } else if (sortBy === 'transit') {
    list.sort((a, b) => (b.transit_orientation || 50) - (a.transit_orientation || 50));
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const countEl = document.getElementById('explore-count');
  if (countEl) countEl.textContent = `Showing ${list.length} of ${state.corridors.length} corridors`;
  renderCorridorsGrid(list);
}

function renderCorridorsGrid(corridors) {
  const container = document.getElementById('corridors-grid');
  if (!container) return;

  if (corridors.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding:3.5rem 1rem; text-align:center; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:1rem;">
        <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</div>
        <h3 style="color:#0F172A; font-weight:800; font-size:1.2rem; margin-bottom:0.35rem;">No Matching Corridors Found</h3>
        <p style="color:#64748B; font-size:0.9rem;">Try clearing your search query or selecting a different metro area.</p>
      </div>
    `;
    return;
  }

  let html = '';
  corridors.forEach(c => {
    const isNYC = c.metro_id === 'nyc';
    const metroLabel = isNYC ? 'NYC' : 'DFW';
    const metroBadgeBg = isNYC ? '#EFF6FF' : '#F0FDF4';
    const metroBadgeColor = isNYC ? '#1E40AF' : '#166534';
    const metroBadgeBorder = isNYC ? '#BFDBFE' : '#BBF7D0';

    html += `
      <div class="corridor-item-card" onclick="openCorridorProfile('${c.corridor_id}')" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:1rem; padding:1.4rem; box-shadow:0 1px 3px rgba(0,0,0,0.04); cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
        <div>
          <!-- Header -->
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem; margin-bottom:0.6rem;">
            <h3 style="font-size:1.15rem; font-weight:800; color:#0F172A; margin:0; line-height:1.3;">📍 ${c.name}</h3>
            <span style="font-size:0.75rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:9999px; background:${metroBadgeBg}; color:${metroBadgeColor}; border:1px solid ${metroBadgeBorder}; flex-shrink:0;">${metroLabel}</span>
          </div>

          <!-- Badges -->
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.85rem;">
            <span style="font-size:0.75rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:0.375rem; background:#F1F5F9; color:#475569; border:1px solid #E2E8F0;">${c.borough || c.district || 'Metro District'}</span>
            <span style="font-size:0.75rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:0.375rem; background:#F8FAFC; color:#64748B; border:1px solid #E2E8F0;">${c.level === 'SUB_CORRIDOR' ? 'Sub-district' : 'Macro Corridor'}</span>
            ${c.special_zones_count > 0 ? `<span style="font-size:0.75rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:0.375rem; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">🏛️ ${c.special_zones_count} Landmark</span>` : ''}
          </div>

          <!-- Character -->
          <p style="font-size:0.88rem; color:#475569; line-height:1.5; margin-bottom:1.25rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${c.character || 'Vibrant commercial street with steady neighborhood footfall.'}
          </p>
        </div>

        <div>
          <!-- Key Metrics -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:0.75rem; padding:0.75rem 0.5rem; margin-bottom:1rem; text-align:center;">
            <div>
              <div style="font-size:0.68rem; color:#64748B; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Momentum</div>
              <div style="font-size:1rem; font-weight:800; color:#0F172A; margin-top:0.15rem;">${c.momentum}/100</div>
            </div>
            <div style="border-left:1px solid #E2E8F0; border-right:1px solid #E2E8F0;">
              <div style="font-size:0.68rem; color:#64748B; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Market Timing</div>
              <div style="font-size:1rem; font-weight:800; color:#0F172A; margin-top:0.15rem;">${c.timing_alpha}/100</div>
            </div>
            <div>
              <div style="font-size:0.68rem; color:#64748B; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Pedestrian</div>
              <div style="font-size:1rem; font-weight:800; color:#059669; margin-top:0.15rem;">${c.transit_orientation}%</div>
            </div>
          </div>

          <!-- Footer Button -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:0.5rem; border-top:1px solid #F1F5F9;">
            <span style="font-size:0.82rem; color:#2563EB; font-weight:700;">Explore Profile & Match</span>
            <span style="font-size:1rem; color:#2563EB; font-weight:700;">→</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* =========================================================================
   CORRIDOR PROFILE MODAL
   ========================================================================= */
async function openCorridorProfile(corridorId) {
  const modal = document.getElementById('modal-corridor');
  const body = document.getElementById('corridor-modal-body');
  modal.classList.add('active');
  body.innerHTML = '<div class="empty-state" style="padding:3rem 1rem;"><span class="loading-spinner"></span><p style="margin-top:1rem; font-weight:600; color:#334155;">Loading commercial corridor profile...</p></div>';

  try {
    const res = await fetch(`/api/corridors/${corridorId}`).then(r => r.json());
    if (res.success && res.data) {
      renderCorridorProfileContent(res.data);
    } else {
      body.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${res.error || 'Corridor not found'}</p></div>`;
    }
  } catch (err) {
    body.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

function renderCorridorProfileContent(data) {
  const { corridor, hostedZones, topAudiences } = data;
  const body = document.getElementById('corridor-modal-body');
  const titleEl = document.getElementById('corridor-modal-title');
  titleEl.innerHTML = `📍 ${corridor.name}`;

  const densities = corridor.behavior?.daypart_occasion_density || {};
  const metroLabel = corridor.metro_id === 'nyc' ? 'New York City' : 'Dallas–Fort Worth';

  let html = `
    <!-- Header Summary -->
    <div class="report-exec-summary">
      <div class="exec-header">
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span class="badge badge-accent">${corridor.borough || corridor.district}</span>
          <span class="badge badge-neutral">${metroLabel}</span>
          <span class="badge badge-info">${corridor.level === 'SUB_CORRIDOR' ? 'Sub-district' : 'Macro Corridor'}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="startFindBusinessForCorridor('${corridor.corridor_id}', '${corridor.metro_id}')" style="font-size:0.8rem; padding:0.45rem 1rem;">
          ⚡ Find Best Businesses for This Area
        </button>
      </div>
      <p style="font-size:1rem; color:#334155; line-height:1.55; margin-top:0.35rem;">${corridor.character || 'Vibrant commercial corridor with strong community activity.'}</p>
    </div>

    <!-- Stats & Indicators -->
    <div class="two-col-grid">
      <div class="info-card">
        <h4>📈 Neighborhood Activity & Trends</h4>
        <p><strong>Neighborhood Momentum:</strong> <strong>${corridor.behavior?.neighborhood_momentum ?? 50}/100</strong> (Positive growth)</p>
        <p><strong>Early Mover Advantage:</strong> <strong>${corridor.behavior?.timing_alpha ?? 50}/100</strong></p>
        <p><strong>Pedestrian vs Car Flow:</strong> ${(corridor.behavior?.transit_car_orientation ?? 50) > 50 ? '🚶 Walk-in & Transit Oriented' : '🚗 Car & Roadside Oriented'}</p>
        <p><strong>Walkway Ease:</strong> High walkability with straightforward pedestrian access.</p>
      </div>

      <div class="info-card">
        <h4>🕒 Busiest Times of Day</h4>
        <p><strong>🌅 Morning Commute (AM):</strong> ${densities.weekday_am ? densities.weekday_am + '/100 activity' : 'Steady morning foot traffic'}</p>
        <p><strong>☀️ Lunch & Midday:</strong> ${densities.weekday_midday ? densities.weekday_midday + '/100 activity' : 'Active lunch crowds'}</p>
        <p><strong>🌆 Evening & Dinner:</strong> ${densities.weekday_evening ? densities.weekday_evening + '/100 activity' : 'Dinner & social footfall'}</p>
        <p><strong>☕ Weekend Daytime:</strong> ${densities.weekend_day ? densities.weekend_day + '/100 activity' : 'Weekend leisure & shopping'}</p>
      </div>
    </div>

    <!-- Audiences -->
    <div class="info-card">
      <h4>👥 Who Frequents This Corridor</h4>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:0.75rem; margin-top:0.75rem;">
        ${topAudiences.map(a => `
          <div style="background:#F8FAFC; padding:0.85rem; border-radius:0.5rem; border:1px solid #E2E8F0;">
            <div style="font-size:0.88rem; font-weight:700; color:#0F172A;">${a.label}</div>
            <div style="font-size:0.78rem; color:#64748B; margin-top:0.25rem;">Presence: <strong style="color:#059669;">${a.score}/10 High</strong></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Special Zones -->
    <div class="info-card">
      <h4>🏛 Landmark Attractions & Anchors (${hostedZones.length})</h4>
      ${hostedZones.length > 0 ? `
        <ul style="padding-left:1.25rem; font-size:0.88rem; color:#334155;">
          ${hostedZones.map(z => `<li style="margin-bottom:0.25rem;"><strong>${z.name}</strong> <span style="color:#64748B;">(${z.zone_type.replace(/_/g, ' ')})</span></li>`).join('')}
        </ul>
      ` : `<p style="font-size:0.88rem; color:#64748B;">Standard neighborhood retail street without single-purpose stadium or airport gates.</p>`}
    </div>
  `;

  body.innerHTML = html;
}

function startFindBusinessForCorridor(corridorId, metroId) {
  closeCorridorModal();
  navigateTo('find-business');
  
  // Set city & corridor
  const citySelect = document.getElementById('c2b-city');
  if (citySelect) {
    citySelect.value = metroId;
    onC2BCityChange();
  }
  
  const corrSelect = document.getElementById('c2b-corridor');
  if (corrSelect) {
    corrSelect.value = corridorId;
  }

  // Trigger recommendation search automatically
  document.getElementById('form-corridor-to-business').dispatchEvent(new Event('submit'));
}

function closeCorridorModal() {
  document.getElementById('modal-corridor').classList.remove('active');
  if (window.location.hash.startsWith('#corridor/')) {
    window.location.hash = 'explore';
  }
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'modal-report') {
    closeReportModal();
  }
  if (e.target.id === 'modal-corridor') {
    closeCorridorModal();
  }
}

// Support hash routing for the React UI links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'find-business', 'find-place', 'corridor-to-business', 'business-to-corridor', 'explore', 'methodology'].includes(hash)) {
        navigateTo(hash);
    }
});

// Explicitly bind globally
window.openOpportunityReport = openOpportunityReport;
window.closeReportModal = closeReportModal;
window.openCorridorProfile = openCorridorProfile;
window.closeCorridorModal = closeCorridorModal;
window.navigateTo = navigateTo;

