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
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  
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
   OPPORTUNITY DETAIL REPORT MODAL
   ========================================================================= */
async function openOpportunityReport(corridorId, archetypeId, targetAudience = '', operatingTime = '') {
  const modal = document.getElementById('modal-report');
  const body = document.getElementById('report-modal-body');
  modal.classList.add('active');
  body.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span><p style="margin-top:1rem">Building comprehensive opportunity report...</p></div>';

  try {
    const res = await fetch('/api/evaluate-pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corridorId, archetypeId, targetAudience, operatingTime })
    }).then(r => r.json());

    if (res.success && res.data) {
      renderOpportunityReportContent(res.data, targetAudience, operatingTime);
    } else {
      body.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${res.error || 'Failed to load report'}</p></div>`;
    }
  } catch (err) {
    body.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

function renderOpportunityReportContent(data, targetAudience, operatingTime) {
  const { report, corridor, archetype, hostedZones } = data;
  const body = document.getElementById('report-modal-body');
  document.getElementById('report-title').textContent = `${archetype.name} @ ${corridor.name}`;

  const tierBadge = report.fitTier === 'STRONG_FIT' ? 'badge-success' : report.fitTier === 'MODERATE_FIT' ? 'badge-info' : 'badge-warning';

  let html = `
    <!-- Executive Summary -->
    <div class="report-exec-summary">
      <div class="exec-header">
        <div>
          <span class="badge ${tierBadge}">${report.fitTierLabel}</span>
          <span class="badge badge-neutral">${corridor.metro_id.toUpperCase()}</span>
          <span class="badge badge-accent">${archetype.category_id}</span>
        </div>
        <div class="exec-score-box">
          <span class="exec-score-val">${Math.round(report.score)}</span>
          <span class="exec-score-max">/100 Opportunity Score</span>
        </div>
      </div>
      <div class="exec-verdict">
        <strong>Strategic Verdict:</strong> ${report.explanation}
      </div>
    </div>

    <!-- 1. Score Breakdown (6 Real Dimensions) -->
    <div>
      <h3 class="report-section-title">📊 6-Dimension Score Breakdown</h3>
      <div class="dimensions-breakdown-grid">
  `;

  for (const [key, dim] of Object.entries(report.dimensions)) {
    const scoreVal = Math.round(dim.score);
    const weightPct = Math.round(dim.weight * 100);
    const contrib = Math.round(dim.weightedContribution * 10) / 10;

    html += `
      <div class="dimension-card">
        <div class="dim-card-header">
          <span class="dim-name">${dim.name}</span>
          <span class="dim-weight">Weight: ${weightPct}%</span>
        </div>
        <div class="dim-meter-wrapper">
          <div class="dim-meter-fill" style="width: ${scoreVal}%"></div>
        </div>
        <div class="dim-meta">
          <span>Score: <strong class="dim-score-val">${scoreVal}/100</strong></span>
          <span>Contribution: +${contrib} pts</span>
        </div>
        <div class="dim-desc">${dim.explanation}</div>
      </div>
    `;
  }

  html += `
      </div>
    </div>

    <!-- 2. Detailed Entrepreneur & Business Planner Analysis -->
    <div class="two-col-grid">
      <!-- Audience Analysis -->
      <div class="info-card">
        <h4>👥 Audience & Customer Flow Analysis</h4>
        <p><strong>Dominant Corridor Flows:</strong> ${(corridor.dominant_audience || []).join(', ') || 'General commercial pedestrian flow'}</p>
        <p><strong>Primary Required Signals:</strong> ${(archetype.primary_signals || []).map(s => s.replace(/_/g, ' ')).join(', ')}</p>
        <p><strong>Supporting Signals:</strong> ${(archetype.supporting_signals || []).map(s => s.replace(/_/g, ' ')).join(', ') || 'None required'}</p>
        <p>${report.dimensions.audienceCompatibility.explanation}</p>
      </div>

      <!-- Operating Time Analysis -->
      <div class="info-card">
        <h4>⏰ Operating Time & Daypart Compatibility</h4>
        <p><strong>Archetype Trading Windows:</strong> ${(archetype.demand_clocks || []).join(', ')}</p>
        <p><strong>Recommended Active Windows:</strong> ${report.recommendedOperatingTime}</p>
        <p>${report.dimensions.operatingTimeCompatibility.explanation}</p>
      </div>

      <!-- Business Fit Analysis -->
      <div class="info-card">
        <h4>🎯 Commercial Model & Decision Track</h4>
        <p><strong>Decision Track:</strong> <code>${archetype.decision_track === 'CONTROLLED_HOST' ? 'Institutional / Captive Host' : archetype.decision_track === 'OPEN_MARKET_SITE' ? 'Open Market Street Frontage' : 'Live Redevelopment Infill'}</code></p>
        <p><strong>Access Contract:</strong> ${archetype.access_contract ? archetype.access_contract.replace(/_/g, ' ') : 'Standard Pedestrian Frontage'}</p>
        <p><strong>Required Institutional Gate:</strong> ${archetype.required_gate || 'None (Open Commercial Site)'}</p>
        <p>${report.dimensions.businessFit.explanation}</p>
      </div>

      <!-- Observed Supply & Whitespace Analysis -->
      <div class="info-card">
        <h4>🏪 Observed Supply & Whitespace Potential</h4>
        <p><strong>Category Whitespace Index:</strong> ${report.dimensions.supplyAndWhitespace.whitespaceIndex ?? 50}/100</p>
        <p><strong>Corporate Chain Dominance:</strong> ${corridor.behavior?.brand_ecology?.chain_dominance ?? 50}%</p>
        <p><strong>Brand Halo Synergies:</strong> ${corridor.behavior?.brand_ecology?.halo_strength ?? 50}/100</p>
        <p>${report.dimensions.supplyAndWhitespace.explanation}</p>
      </div>
    </div>

    <!-- 3. Special Zones & Institutional Anchors -->
    <div class="info-card">
      <h4>🏛 Special Zones & Major Destination Anchors</h4>
      ${hostedZones.length > 0 ? `
        <p>This corridor directly hosts or borders <strong>${hostedZones.length}</strong> major special zone anchor(s):</p>
        <ul style="padding-left:1.25rem; margin-bottom:0.5rem;">
          ${hostedZones.map(z => `<li><strong>${z.name}</strong> (${z.zone_type.replace(/_/g, ' ')}) ${z.note ? `— ${z.note}` : ''}</li>`).join('')}
        </ul>
        <p style="font-size:0.8rem; color:var(--text-dim);">Anchor institutions create distinct arrival peaks, event schedules, and visitor demographics.</p>
      ` : `
        <p>Standard urban commercial fabric without specialized single-purpose destination anchors (e.g. airport terminals or stadium complexes).</p>
      `}
    </div>

    <!-- 4. Corridor Spatial Context -->
    <div class="info-card">
      <h4>🗺 Corridor Spatial Context & Physical Access</h4>
      <p><strong>Urban Fabric:</strong> ${corridor.character || 'Commercial district corridor.'}</p>
      <p><strong>Sub-Neighborhoods:</strong> ${(corridor.neighborhoods || []).join(', ')}</p>
      <p><strong>Gateway Dependency:</strong> ${corridor.access?.gateway_dependency || 'LOW'}</p>
      ${corridor.access?.barrier_note ? `<p><strong>Barrier Note:</strong> ${corridor.access.barrier_note}</p>` : ''}
      <p><strong>Safety Perception (Day / Evening / Late):</strong> ${corridor.behavior?.crime_safety?.day ?? 60} / ${corridor.behavior?.crime_safety?.evening ?? 50} / ${corridor.behavior?.crime_safety?.late_night ?? 40}</p>
    </div>

    <!-- 5. Strengths vs Considerations -->
    <div class="two-col-grid">
      <div class="info-card" style="border-left: 4px solid var(--color-success);">
        <h4 style="color:#A7F3D0;">✓ Opportunity Strengths (Positive Drivers)</h4>
        <ul class="signal-list">
          ${report.positiveSignals.map(s => `<li class="signal-item signal-item-positive"><span>•</span> <span>${s}</span></li>`).join('')}
        </ul>
      </div>

      <div class="info-card" style="border-left: 4px solid var(--color-warning);">
        <h4 style="color:#FDE68A;">⚠ Strategic Considerations & Tradeoffs</h4>
        <ul class="signal-list">
          ${report.concerns.length > 0 ? report.concerns.map(c => `<li class="signal-item signal-item-concern"><span>•</span> <span>${c}</span></li>`).join('') : '<li class="signal-item"><span>•</span> <span>No significant friction or access gating detected.</span></li>'}
        </ul>
      </div>
    </div>

    <!-- 6. Required Methodological Disclaimer Banner -->
    <div class="disclaimer-banner">
      <strong>Methodological Notice:</strong> Observed supply reflects mapped locations in the dataset and should not be treated as a complete market census. Behavioral and timing indicators represent curated expert derivations (<code>CURATED_EXPERT_ESTIMATE</code>). Opportunity scores measure situational compatibility and do not claim or guarantee customer revenue or business success.
    </div>
  `;

  body.innerHTML = html;
}

function closeReportModal() {
  document.getElementById('modal-report').classList.remove('active');
  // Reset hash if on report subroute
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

  document.getElementById('explore-count').textContent = `Showing ${list.length} of ${state.corridors.length} corridors`;
  renderCorridorsGrid(list);
}

function renderCorridorsGrid(corridors) {
  const container = document.getElementById('corridors-grid');
  if (corridors.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>No Matching Corridors</h3>
        <p>Try adjusting your search query or city filters.</p>
      </div>
    `;
    return;
  }

  let html = '';
  corridors.forEach(c => {
    const metroBadge = c.metro_id === 'nyc' ? 'NYC' : 'DFW';

    html += `
      <div class="corridor-item-card" onclick="openCorridorProfile('${c.corridor_id}')">
        <div>
          <div class="corridor-item-header">
            <h3 class="corridor-item-title">${c.name}</h3>
            <span class="badge badge-neutral">${metroBadge}</span>
          </div>

          <div class="card-badges">
            <span class="badge badge-accent">${c.borough || c.metro_id}</span>
            <span class="badge badge-neutral">${c.level === 'SUB_CORRIDOR' ? 'Sub-district' : 'Macro'}</span>
            ${c.special_zones_count > 0 ? `<span class="badge badge-warning">${c.special_zones_count} Special Zone(s)</span>` : ''}
          </div>

          <p class="corridor-item-char">${c.character || 'Commercial urban corridor.'}</p>
        </div>

        <div>
          <div class="corridor-stats-row">
            <div>
              <div class="c-stat-label">Momentum</div>
              <div class="c-stat-val">${c.momentum}</div>
            </div>
            <div>
              <div class="c-stat-label">Timing Alpha</div>
              <div class="c-stat-val">${c.timing_alpha}</div>
            </div>
            <div>
              <div class="c-stat-label">Transit/Ped</div>
              <div class="c-stat-val">${c.transit_orientation}%</div>
            </div>
          </div>

          <div class="card-footer">
            <span class="click-hint">View Profile & Recommendations →</span>
            <button class="btn btn-secondary btn-sm">Profile</button>
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
  body.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span><p style="margin-top:1rem">Loading corridor profile...</p></div>';

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
  document.getElementById('corridor-modal-title').textContent = corridor.name;

  const densities = corridor.behavior?.daypart_occasion_density || {};

  let html = `
    <!-- Header Summary -->
    <div class="report-exec-summary">
      <div class="exec-header">
        <div>
          <span class="badge badge-accent">${corridor.borough || corridor.district}</span>
          <span class="badge badge-neutral">${corridor.metro_id.toUpperCase()}</span>
          <span class="badge badge-info">${corridor.form || 'STANDARD_URBAN'}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="startFindBusinessForCorridor('${corridor.corridor_id}', '${corridor.metro_id}')">
          ⚡ Find Business Fit for This Corridor
        </button>
      </div>
      <p style="font-size:1.05rem; color:var(--text-main); margin-top:0.5rem;">${corridor.character}</p>
    </div>

    <!-- Stats & Indicators -->
    <div class="two-col-grid">
      <div class="info-card">
        <h4>📈 Commercial & Behavioral Dynamics</h4>
        <p><strong>Neighborhood Momentum:</strong> ${corridor.behavior?.neighborhood_momentum ?? 50}/100</p>
        <p><strong>Early-Mover Timing Alpha:</strong> ${corridor.behavior?.timing_alpha ?? 50}/100</p>
        <p><strong>Transit vs Car Orientation:</strong> ${corridor.behavior?.transit_car_orientation ?? 50}% (${(corridor.behavior?.transit_car_orientation ?? 50) > 50 ? 'Transit/Pedestrian Oriented' : 'Auto Oriented'})</p>
        <p><strong>Path-of-Travel Friction:</strong> ${corridor.behavior?.path_of_travel_friction ?? 50}/100</p>
        <p><strong>Chain Dominance:</strong> ${corridor.behavior?.brand_ecology?.chain_dominance ?? 50}%</p>
      </div>

      <div class="info-card">
        <h4>🕒 Daypart Footfall & Activity Density</h4>
        <p><strong>Weekday Morning (AM):</strong> ${densities.weekday_am ?? 'N/A'}/100</p>
        <p><strong>Weekday Midday (Lunch):</strong> ${densities.weekday_midday ?? 'N/A'}/100</p>
        <p><strong>Weekday Evening (Dinner):</strong> ${densities.weekday_evening ?? 'N/A'}/100</p>
        <p><strong>Late Night:</strong> ${densities.late_night ?? 'N/A'}/100</p>
        <p><strong>Weekend Daytime:</strong> ${densities.weekend_day ?? 'N/A'}/100</p>
      </div>
    </div>

    <!-- Audiences -->
    <div class="info-card">
      <h4>👥 Top Customer & Commuter Audiences</h4>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:0.75rem; margin-top:0.75rem;">
        ${topAudiences.map(a => `
          <div style="background:var(--bg-card); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <div style="font-size:0.85rem; font-weight:700; color:var(--text-bright);">${a.label}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Score: <strong>${a.score}/10</strong> (${a.confidence} cert.)</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Special Zones -->
    <div class="info-card">
      <h4>🏛 Hosted Special Zones (${hostedZones.length})</h4>
      ${hostedZones.length > 0 ? `
        <ul>
          ${hostedZones.map(z => `<li><strong>${z.name}</strong> (${z.zone_type})</li>`).join('')}
        </ul>
      ` : `<p>None</p>`}
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
  if (e.target.classList.contains('modal-backdrop')) {
    closeReportModal();
    closeCorridorModal();
  }
}
