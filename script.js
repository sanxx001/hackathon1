/**
 * FoodShare AI - Core Application Script
 * Hackathon Prototype - Save Food. Share Hope.
 * Built with Vanilla JavaScript, HTML5, CSS3, and LocalStorage.
 * No external APIs or server dependencies required.
 */

// =============================================================================
// 1. DATA INITIALIZATION & CONSTANTS
// =============================================================================
const STORAGE_KEY = 'foodshare_ai_donations';

/**
 * Returns dynamic ISO date strings relative to current time
 * so demo deadlines are always realistic during live hackathon judging.
 */
function getRelativeDate(hoursFromNow) {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  // Returns 'YYYY-MM-DDTHH:MM' suitable for datetime-local
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Initial demo data clearly labelled for hackathon presentation
const INITIAL_DEMO_DATA = [
  {
    id: 'FS-101',
    name: '45 Freshly Packed Vegetable Biryani Bowls',
    category: 'Cooked Meals',
    quantity: 45,
    unit: 'meals / portions',
    storage: 'Keep Warm (Above 60°C)',
    prepTime: getRelativeDate(-2),
    pickupDeadline: getRelativeDate(3), // Expiring in 3 hours (Urgent!)
    donorName: 'Green Garden Caterers (Demo)',
    donorLocation: 'Downtown Metro',
    donorAddress: '104 Market Street, Rear Kitchen Dock',
    dietTags: ['Vegetarian', 'Nut-Free', 'Halal Friendly'],
    specialNotes: 'Portioned into tamper-evident biodegradable boxes. Please bring hot-holding bags.',
    status: 'Available',
    requests: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'FS-102',
    name: '30 Artisan Whole Wheat Loaves & Baguettes',
    category: 'Bakery & Bread',
    quantity: 30,
    unit: 'loaves',
    storage: 'Room Temperature / Dry',
    prepTime: getRelativeDate(-5),
    pickupDeadline: getRelativeDate(18), // 18 hours left
    donorName: 'Sunrise Bakery & Cafe (Demo)',
    donorLocation: 'West End District',
    donorAddress: '52 Elmwood Avenue',
    dietTags: ['Vegetarian', 'Vegan', 'Dairy-Free'],
    specialNotes: 'Freshly baked this morning. Bagged in paper bags, ready for pickup.',
    status: 'Available',
    requests: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'FS-103',
    name: '25 kg Fresh Apples, Oranges & Bananas',
    category: 'Fresh Produce',
    quantity: 25,
    unit: 'kg',
    storage: 'Room Temperature / Dry',
    prepTime: getRelativeDate(-12),
    pickupDeadline: getRelativeDate(28),
    donorName: 'Harvest Fresh Grocers (Demo)',
    donorLocation: 'Northside Hub',
    donorAddress: '308 Orchard Boulevard',
    dietTags: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'],
    specialNotes: 'Grade A and B seasonal fruit crates, ideal for youth center snack program.',
    status: 'Requested',
    requests: [
      {
        orgName: 'Youth Outreach Center (Demo)',
        contactPerson: 'David Miller',
        pickupTime: getRelativeDate(4),
        transport: 'Volunteer Car',
        purpose: 'Afternoon community center nutritious snack program.',
        requestedAt: getRelativeDate(-1)
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'FS-104',
    name: '60 Cans of Crushed Tomatoes & Kidney Beans',
    category: 'Packaged & Canned',
    quantity: 60,
    unit: 'boxes',
    storage: 'Room Temperature / Dry',
    prepTime: getRelativeDate(-48),
    pickupDeadline: getRelativeDate(72),
    donorName: 'Metro Logistics Food Hub (Demo)',
    donorLocation: 'East Industrial',
    donorAddress: 'Warehouse B, Bay 4',
    dietTags: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal Friendly'],
    specialNotes: 'Completely sealed cases, shelf-stable commercial pantry stock.',
    status: 'Accepted',
    requests: [
      {
        orgName: 'Hope Haven Shelter (Demo)',
        contactPerson: 'Sister Clara',
        pickupTime: getRelativeDate(10),
        transport: 'Van with Cool Box',
        purpose: 'Weekly community pantry distribution hampers.',
        requestedAt: getRelativeDate(-3)
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'FS-105',
    name: '35 Gourmet Pasta with Roasted Veggies',
    category: 'Cooked Meals',
    quantity: 35,
    unit: 'meals / portions',
    storage: 'Refrigerated (2°C - 4°C)',
    prepTime: getRelativeDate(-24),
    pickupDeadline: getRelativeDate(2),
    donorName: 'University Faculty Club Dining (Demo)',
    donorLocation: 'University Area',
    donorAddress: 'Campus South Hall, Loading Gate 1',
    dietTags: ['Vegetarian', 'Nut-Free'],
    specialNotes: 'Chilled in blast chiller, maintained at 3°C.',
    status: 'Delivered',
    requests: [
      {
        orgName: 'St. Jude Food Pantry (Demo)',
        contactPerson: 'Marcus Vance',
        pickupTime: getRelativeDate(-2),
        transport: 'Van with Cool Box',
        purpose: 'Hot supper outreach.',
        requestedAt: getRelativeDate(-6)
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'FS-106',
    name: '20 Pre-packaged Mixed Deli Sandwiches',
    category: 'Cooked Meals',
    quantity: 20,
    unit: 'meals / portions',
    storage: 'Refrigerated (2°C - 4°C)',
    prepTime: getRelativeDate(-26),
    pickupDeadline: getRelativeDate(-2), // 2 hours in the PAST! To demonstrate expired safety handling
    donorName: 'Downtown Deli & Wraps (Demo)',
    donorLocation: 'Downtown Metro',
    donorAddress: '78 Pine Street',
    dietTags: ['Nut-Free'],
    specialNotes: 'Demonstration of safety cut-off. Deadline has passed, cannot be claimed.',
    status: 'Expired',
    requests: [],
    createdAt: getRelativeDate(-26)
  }
];

// =============================================================================
// 2. STATE MANAGEMENT & LOCAL STORAGE
// =============================================================================
let donations = [];

/**
 * Loads data safely from LocalStorage with fallback to demo data
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      donations = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
      saveData();
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        donations = parsed;
      } else {
        donations = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
        saveData();
      }
    }
  } catch (err) {
    console.error('LocalStorage parse error, resetting to initial demo data:', err);
    donations = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    saveData();
  }

  // Audit deadlines and update any newly expired items automatically
  auditDeadlines();
}

/**
 * Saves current donation records to LocalStorage
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (err) {
    console.error('Failed to save to LocalStorage:', err);
    showToast('Storage Warning', 'Could not save data locally. Check browser storage permissions.', 'warning');
  }
}

/**
 * Resets data back to pristine demo test set
 */
function resetDemoData() {
  donations = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  saveData();
  renderAll();
  showToast('Demo Data Reset', 'Platform restored to initial sample records for demonstration.', 'info');
}

/**
 * Audits deadlines: any Available or Requested donation past its pickup deadline
 * is automatically converted to 'Expired' to protect community health.
 */
function auditDeadlines() {
  const now = new Date();
  let updated = false;

  donations.forEach(item => {
    if (item.status === 'Available' || item.status === 'Requested') {
      const deadline = new Date(item.pickupDeadline);
      if (deadline < now) {
        item.status = 'Expired';
        updated = true;
      }
    }
  });

  if (updated) {
    saveData();
  }
}

// =============================================================================
// 3. UI RENDERING & COMPONENT BUILDERS
// =============================================================================

/**
 * Formats ISO date to readable string (e.g., "Oct 31, 2:30 PM")
 */
function formatDateTime(isoString) {
  if (!isoString) return 'Not specified';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Returns hours and minutes remaining until deadline or 'Expired'
 */
function getDeadlineStatus(deadlineIso) {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { isExpired: true, text: 'Expired', urgent: false };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours < 4) {
    return {
      isExpired: false,
      text: `${diffHours}h ${diffMinutes}m remaining`,
      urgent: true
    };
  } else if (diffHours < 24) {
    return {
      isExpired: false,
      text: `${diffHours} hours remaining`,
      urgent: false
    };
  } else {
    const days = Math.floor(diffHours / 24);
    return {
      isExpired: false,
      text: `${days} day${days > 1 ? 's' : ''} left`,
      urgent: false
    };
  }
}

/**
 * Updates Dashboard Stat Counters
 */
function updateDashboard() {
  const total = donations.length;
  const available = donations.filter(d => d.status === 'Available').length;
  const requested = donations.filter(d => d.status === 'Requested' || d.status === 'Accepted').length;
  const delivered = donations.filter(d => d.status === 'Delivered').length;

  const totalEl = document.getElementById('statTotalListings');
  const availEl = document.getElementById('statAvailable');
  const reqEl = document.getElementById('statRequested');
  const delEl = document.getElementById('statDelivered');

  if (totalEl) totalEl.textContent = total;
  if (availEl) availEl.textContent = available;
  if (reqEl) reqEl.textContent = requested;
  if (delEl) delEl.textContent = delivered;
}

/**
 * Renders Available Donations Marketplace Cards
 */
function renderDonations() {
  const grid = document.getElementById('donationsGrid');
  const emptyState = document.getElementById('noResultsState');
  const counterText = document.getElementById('filteredCountText');

  if (!grid) return;

  // Read search & filter inputs
  const searchTerm = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'ALL';
  const locationFilter = document.getElementById('locationFilter')?.value || 'ALL';
  const statusFilter = document.getElementById('statusFilter')?.value || 'ALL';

  // Filter list
  const filtered = donations.filter(item => {
    // Search query matches name, donor, location, or notes
    const matchesSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.donorName.toLowerCase().includes(searchTerm) ||
      item.donorLocation.toLowerCase().includes(searchTerm) ||
      (item.specialNotes && item.specialNotes.toLowerCase().includes(searchTerm));

    // Category filter
    const matchesCat = (categoryFilter === 'ALL') || (item.category === categoryFilter);

    // Location filter
    const matchesLoc = (locationFilter === 'ALL') || (item.donorLocation === locationFilter);

    // Status filter
    const matchesStatus = (statusFilter === 'ALL') || (item.status === statusFilter);

    return matchesSearch && matchesCat && matchesLoc && matchesStatus;
  });

  if (counterText) {
    counterText.textContent = `Showing ${filtered.length} of ${donations.length} listing${donations.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Build Cards
  grid.innerHTML = filtered.map(item => {
    const deadlineInfo = getDeadlineStatus(item.pickupDeadline);
    const isExpired = item.status === 'Expired' || deadlineInfo.isExpired;
    const isAvailable = item.status === 'Available' && !isExpired;

    // Badge CSS classes
    const statusClass = item.status.toLowerCase();

    // Dietary pills
    const dietHtml = (item.dietTags && item.dietTags.length > 0)
      ? item.dietTags.map(tag => `<span class="diet-pill">${tag}</span>`).join('')
      : '<span class="diet-pill">Standard Prep</span>';

    // Button states
    let requestBtnHtml = '';
    if (isAvailable) {
      requestBtnHtml = `
        <button class="btn btn-primary btn-sm btn-request" onclick="openRequestModal('${item.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Request Food
        </button>
      `;
    } else if (isExpired) {
      requestBtnHtml = `
        <button class="btn btn-secondary btn-sm btn-request" disabled title="Pickup deadline has passed to ensure food safety">
          Expired (Locked)
        </button>
      `;
    } else {
      requestBtnHtml = `
        <button class="btn btn-secondary btn-sm btn-request" disabled title="Currently ${item.status}">
          ${item.status}
        </button>
      `;
    }

    return `
      <article class="food-card ${isExpired ? 'card-expired' : ''}" data-id="${item.id}">
        <div class="card-top-row">
          <span class="category-tag">${item.category}</span>
          <span class="status-badge ${statusClass}">${item.status}</span>
        </div>

        <h3 class="food-title">${escapeHtml(item.name)}</h3>

        <div class="donor-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>From <strong>${escapeHtml(item.donorName)}</strong></span>
        </div>

        <div class="card-specs-grid">
          <div class="spec-item">
            <span class="spec-label">Quantity</span>
            <span class="spec-val">${item.quantity} ${item.unit}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Zone</span>
            <span class="spec-val">${escapeHtml(item.donorLocation)}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Storage</span>
            <span class="spec-val" style="font-size: 0.8rem;">${escapeHtml(item.storage)}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Prep Time</span>
            <span class="spec-val" style="font-size: 0.8rem;">${formatDateTime(item.prepTime)}</span>
          </div>
        </div>

        <div class="deadline-countdown-box ${deadlineInfo.urgent ? 'is-urgent' : ''} ${isExpired ? 'is-expired' : ''}">
          <span class="deadline-text">Pickup by: <strong>${formatDateTime(item.pickupDeadline)}</strong></span>
          <span class="countdown-timer">${deadlineInfo.urgent ? '⚠️ ' : ''}${deadlineInfo.text}</span>
        </div>

        <div class="diet-tags-row">
          ${dietHtml}
        </div>

        ${item.specialNotes ? `<p style="font-size: 0.82rem; color: #475569; margin-bottom: 1rem;"><em>Note:</em> ${escapeHtml(item.specialNotes)}</p>` : ''}

        <div class="card-footer-actions">
          ${requestBtnHtml}
          <a href="#status-tracking" class="btn btn-secondary btn-sm" title="View tracking status in lifecycle table">
            Track
          </a>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Renders the Lifecycle Status Tracking Table
 */
function renderTrackingTable() {
  const tbody = document.getElementById('trackingTableBody');
  if (!tbody) return;

  if (donations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2rem;">No donation records available.</td></tr>`;
    return;
  }

  tbody.innerHTML = donations.map(item => {
    const isExpired = item.status === 'Expired';
    let actionButtons = '';

    if (item.status === 'Requested') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="advanceStatus('${item.id}', 'Accepted')" title="Donor approves request">
          Accept Request
        </button>
      `;
    } else if (item.status === 'Accepted') {
      actionButtons = `
        <button class="btn btn-primary btn-sm" onclick="advanceStatus('${item.id}', 'Collected')" title="NGO picks up food">
          Confirm Collected
        </button>
      `;
    } else if (item.status === 'Collected') {
      actionButtons = `
        <button class="btn btn-primary btn-sm" style="background-color: #059669;" onclick="advanceStatus('${item.id}', 'Delivered')" title="Food delivered to shelter / recipients">
          Confirm Delivered
        </button>
      `;
    } else if (item.status === 'Delivered') {
      actionButtons = `<span style="font-size: 0.8rem; font-weight: 700; color: #059669;">✓ Delivery Complete</span>`;
    } else if (item.status === 'Expired') {
      actionButtons = `<span style="font-size: 0.8rem; color: #dc2626;">Safety Lock (Expired)</span>`;
    } else {
      // Available
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="openRequestModal('${item.id}')">
          Request
        </button>
      `;
    }

    const latestReq = (item.requests && item.requests.length > 0)
      ? item.requests[item.requests.length - 1]
      : null;

    const recipientDetails = latestReq
      ? `<strong>${escapeHtml(latestReq.orgName)}</strong><br><small style="color: #64748b;">Contact: ${escapeHtml(latestReq.contactPerson)}</small>`
      : '<span style="color: #94a3b8;">No recipient yet</span>';

    return `
      <tr>
        <td>
          <span class="table-item-name">${escapeHtml(item.name)}</span>
          <span class="table-item-donor">Donor: ${escapeHtml(item.donorName)}</span>
        </td>
        <td><strong>${item.quantity}</strong> ${item.unit}</td>
        <td>${escapeHtml(item.donorLocation)}</td>
        <td>
          <div>${formatDateTime(item.pickupDeadline)}</div>
          ${isExpired ? '<small style="color: #dc2626; font-weight: 600;">Past Deadline</small>' : ''}
        </td>
        <td>
          <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
        </td>
        <td>${recipientDetails}</td>
        <td>
          <div class="stepper-actions">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Advances a donation's status in the lifecycle (Available -> Requested -> Accepted -> Collected -> Delivered)
 */
function advanceStatus(id, newStatus) {
  const item = donations.find(d => d.id === id);
  if (!item) {
    showToast('Error', 'Donation not found.', 'error');
    return;
  }

  // Prevent modifying expired items
  if (item.status === 'Expired' && newStatus !== 'Available') {
    showToast('Action Blocked', 'This listing is expired to comply with food safety standards and cannot be progressed.', 'warning');
    return;
  }

  const oldStatus = item.status;
  item.status = newStatus;
  saveData();
  renderAll();

  showToast('Status Updated', `Donation "${item.name}" moved from ${oldStatus} to ${newStatus}.`, 'success');
}

// =============================================================================
// 4. SMART MATCHING ENGINE (Rule-Based AI Simulation)
// =============================================================================
/**
 * Ranks donations for an NGO using deterministic rules:
 * 1. Proximity / Zone Match (Weight: 40%)
 * 2. Quantity & Capacity Match (Weight: 35%)
 * 3. Deadline Urgency (Weight: 25%)
 * Plus optional category preference bonus
 */
function calculateSmartMatches(ngoLocation, neededQty, categoryPref) {
  // Only available and non-expired donations can be matched
  const availableItems = donations.filter(d => {
    if (d.status !== 'Available') return false;
    const deadline = new Date(d.pickupDeadline);
    return deadline > new Date();
  });

  if (availableItems.length === 0) {
    return [];
  }

  const scored = availableItems.map(item => {
    let score = 0;
    const reasons = [];

    // Rule 1: Proximity Score (Max 40 points)
    if (item.donorLocation === ngoLocation) {
      score += 40;
      reasons.push('📍 Exact Zone Match (Downtown Metro)');
    } else {
      score += 15;
      reasons.push('🚗 Nearby District (Cross-zone transfer)');
    }

    // Rule 2: Quantity Compatibility (Max 35 points)
    // Compare requested portions with item quantity
    const qty = Number(item.quantity) || 1;
    const target = Number(neededQty) || 1;
    const ratio = Math.min(qty, target) / Math.max(qty, target);
    const qtyScore = Math.round(ratio * 35);
    score += qtyScore;

    if (qty >= target) {
      reasons.push(`📦 Covers 100% of required portions (${qty} vs ${target})`);
    } else {
      reasons.push(`📦 Partial batch: provides ${qty} of ${target} portions`);
    }

    // Rule 3: Pickup Urgency (Max 25 points)
    // Food nearing its deadline receives priority so it gets rescued first!
    const hoursLeft = (new Date(item.pickupDeadline) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft <= 4) {
      score += 25;
      reasons.push(`⚡ High Urgency: Must rescue within ${Math.max(1, Math.round(hoursLeft))}h`);
    } else if (hoursLeft <= 12) {
      score += 18;
      reasons.push(`⏱️ Moderate Urgency: ${Math.round(hoursLeft)}h remaining`);
    } else {
      score += 10;
      reasons.push(`⏳ Ample Time: ${Math.round(hoursLeft)}h remaining`);
    }

    // Optional Rule: Category Preference
    if (categoryPref && categoryPref !== 'ANY') {
      if (item.category === categoryPref) {
        score = Math.min(100, score + 10);
        reasons.push(`🎯 Preferred Category: ${item.category}`);
      }
    }

    // Cap at 99% for realism in simulation
    const finalScore = Math.min(99, Math.max(35, score));

    return {
      item,
      score: finalScore,
      reasons
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Renders results of Smart Matching form
 */
function renderSmartMatchResults() {
  const container = document.getElementById('smartMatchResults');
  if (!container) return;

  const ngoLoc = document.getElementById('ngoLocation')?.value || 'Downtown Metro';
  const neededQty = parseInt(document.getElementById('ngoNeedQuantity')?.value, 10) || 30;
  const catPref = document.getElementById('ngoCategoryPref')?.value || 'ANY';

  const matches = calculateSmartMatches(ngoLoc, neededQty, catPref);

  if (matches.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #64748b; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1;">
        <p><strong>No available donations found for matching.</strong></p>
        <p style="font-size: 0.85rem;">All existing listings may already be claimed, delivered, or expired. You can list a new surplus donation above to test matching.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(match => {
    const { item, score, reasons } = match;
    return `
      <div class="match-item-card">
        <div class="match-item-top">
          <div class="match-item-info">
            <h4>${escapeHtml(item.name)}</h4>
            <div class="match-item-meta">
              <span>Donor: <strong>${escapeHtml(item.donorName)}</strong></span> &bull; 
              <span>Zone: ${escapeHtml(item.donorLocation)}</span>
            </div>
          </div>
          <div class="match-score-pill">
            ${score}% Match
          </div>
        </div>

        <div class="match-reasons-row">
          ${reasons.map(r => `<span class="reason-tag">${r}</span>`).join('')}
        </div>

        <div class="match-item-action">
          <span class="match-quantity-note">
            Available: <strong>${item.quantity} ${item.unit}</strong> (${item.storage})
          </span>
          <button class="btn btn-primary btn-sm" onclick="openRequestModal('${item.id}')">
            Claim This Match
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================================
// 5. DONATION FORM SUBMISSION & VALIDATION
// =============================================================================
function setupDonationForm() {
  const form = document.getElementById('donationForm');
  if (!form) return;

  // Set default values for prep time (now - 1h) and deadline (now + 6h)
  const prepEl = document.getElementById('prepTime');
  const deadEl = document.getElementById('pickupDeadline');
  if (prepEl && !prepEl.value) prepEl.value = getRelativeDate(-1);
  if (deadEl && !deadEl.value) deadEl.value = getRelativeDate(6);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();

    // Inputs
    const foodName = document.getElementById('foodName')?.value.trim();
    const foodCategory = document.getElementById('foodCategory')?.value;
    const quantityVal = parseFloat(document.getElementById('quantityVal')?.value);
    const quantityUnit = document.getElementById('quantityUnit')?.value;
    const storageCondition = document.getElementById('storageCondition')?.value;
    const prepTime = document.getElementById('prepTime')?.value;
    const pickupDeadline = document.getElementById('pickupDeadline')?.value;
    const donorName = document.getElementById('donorName')?.value.trim();
    const donorLocation = document.getElementById('donorLocation')?.value;
    const donorAddress = document.getElementById('donorAddress')?.value.trim();
    const specialNotes = document.getElementById('specialNotes')?.value.trim();
    const safetyCheck = document.getElementById('safetyCheck')?.checked;

    // Checkboxes for dietary tags
    const dietCheckboxes = document.querySelectorAll('input[name="dietTags"]:checked');
    const dietTags = Array.from(dietCheckboxes).map(cb => cb.value);

    // Validation
    let hasError = false;

    if (!foodName || foodName.length < 3) {
      showFieldError('foodNameError', 'Please provide a descriptive food name (at least 3 characters).');
      hasError = true;
    }

    if (!foodCategory) {
      showFieldError('foodCategoryError', 'Please select a food category.');
      hasError = true;
    }

    if (isNaN(quantityVal) || quantityVal <= 0) {
      showFieldError('quantityValError', 'Please enter a valid quantity greater than zero.');
      hasError = true;
    }

    if (!prepTime) {
      showFieldError('prepTimeError', 'Preparation or packing time is required.');
      hasError = true;
    }

    if (!pickupDeadline) {
      showFieldError('pickupDeadlineError', 'Pickup deadline is required.');
      hasError = true;
    } else {
      const deadlineDate = new Date(pickupDeadline);
      if (deadlineDate <= new Date()) {
        showFieldError('pickupDeadlineError', 'Pickup deadline must be set in the future.');
        hasError = true;
      }
    }

    if (!donorName || donorName.length < 2) {
      showFieldError('donorNameError', 'Please enter the donor or organization name.');
      hasError = true;
    }

    if (!donorLocation) {
      showFieldError('donorLocationError', 'Please select a location zone.');
      hasError = true;
    }

    if (!safetyCheck) {
      showFieldError('safetyCheckError', 'You must agree to the Donor Freshness & Safety Declaration.');
      hasError = true;
    }

    if (hasError) {
      showToast('Form Validation Error', 'Please correct the highlighted fields before submitting.', 'error');
      return;
    }

    // Build new donation record
    const newDonation = {
      id: 'FS-' + Math.floor(1000 + Math.random() * 9000),
      name: foodName,
      category: foodCategory,
      quantity: quantityVal,
      unit: quantityUnit,
      storage: storageCondition,
      prepTime: prepTime,
      pickupDeadline: pickupDeadline,
      donorName: donorName,
      donorLocation: donorLocation,
      donorAddress: donorAddress || 'Address provided to verified recipient',
      dietTags: dietTags,
      specialNotes: specialNotes,
      status: 'Available',
      requests: [],
      createdAt: new Date().toISOString()
    };

    // Prepend to donations list so newly added item appears first
    donations.unshift(newDonation);
    saveData();
    renderAll();

    // Reset Form
    form.reset();
    if (prepEl) prepEl.value = getRelativeDate(-1);
    if (deadEl) deadEl.value = getRelativeDate(6);

    showToast('Donation Published!', `"${foodName}" is now live and available for community shelters to request.`, 'success');

    // Smooth scroll to the available food section to see the newly created card
    const browseSec = document.getElementById('available-food');
    if (browseSec) {
      browseSec.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Reset button clears errors too
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setTimeout(() => {
        clearFormErrors();
        if (prepEl) prepEl.value = getRelativeDate(-1);
        if (deadEl) deadEl.value = getRelativeDate(6);
      }, 50);
    });
  }
}

function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.field-error');
  errorElements.forEach(el => el.textContent = '');
}

// =============================================================================
// 6. REQUEST FOOD MODAL & SUBMISSION
// =============================================================================
function openRequestModal(donationId) {
  const item = donations.find(d => d.id === donationId);
  if (!item) {
    showToast('Error', 'Donation listing could not be found.', 'error');
    return;
  }

  // Safety check: Don't allow requesting expired listings
  if (item.status === 'Expired' || new Date(item.pickupDeadline) <= new Date()) {
    showToast('Safety Alert', 'This food donation has expired and cannot be requested.', 'error');
    return;
  }

  if (item.status !== 'Available') {
    showToast('Not Available', `This donation is already ${item.status}.`, 'warning');
    return;
  }

  const modal = document.getElementById('requestModal');
  const summaryBox = document.getElementById('modalItemSummary');
  const hiddenIdInput = document.getElementById('requestDonationId');
  const pickupInput = document.getElementById('reqEstimatedPickup');

  if (hiddenIdInput) hiddenIdInput.value = item.id;

  // Set default estimated pickup time 1 hour from now
  if (pickupInput) {
    pickupInput.value = getRelativeDate(1);
    pickupInput.max = item.pickupDeadline; // Cannot schedule pickup after deadline!
  }

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <h4 style="font-size: 1.05rem; color: #0f172a;">${escapeHtml(item.name)}</h4>
        <span class="category-tag">${item.category}</span>
      </div>
      <p style="font-size: 0.85rem; margin-bottom: 0.25rem;">
        <strong>Quantity:</strong> ${item.quantity} ${item.unit} &bull;
        <strong>Zone:</strong> ${escapeHtml(item.donorLocation)}
      </p>
      <p style="font-size: 0.82rem; color: #475569; margin: 0;">
        <strong>Donor:</strong> ${escapeHtml(item.donorName)} &bull;
        <strong>Pickup Deadline:</strong> ${formatDateTime(item.pickupDeadline)}
      </p>
    `;
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeRequestModal() {
  const modal = document.getElementById('requestModal');
  if (modal) modal.style.display = 'none';
}

function setupRequestModal() {
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelRequestBtn');
  const modal = document.getElementById('requestModal');
  const form = document.getElementById('requestFoodForm');

  if (closeBtn) closeBtn.addEventListener('click', closeRequestModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeRequestModal);

  // Close when clicking backdrop outside card
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRequestModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const donationId = document.getElementById('requestDonationId')?.value;
      const orgName = document.getElementById('reqOrgName')?.value.trim();
      const contactPerson = document.getElementById('reqContactPerson')?.value.trim();
      const estPickup = document.getElementById('reqEstimatedPickup')?.value;
      const transportType = document.getElementById('reqTransportType')?.value;
      const purpose = document.getElementById('reqPurpose')?.value.trim();

      if (!orgName || !contactPerson || !estPickup) {
        showToast('Required Fields', 'Please complete all required fields.', 'warning');
        return;
      }

      const item = donations.find(d => d.id === donationId);
      if (!item) {
        showToast('Error', 'Donation not found.', 'error');
        return;
      }

      // Validate pickup is before deadline
      if (new Date(estPickup) > new Date(item.pickupDeadline)) {
        showToast('Pickup Time Error', 'Estimated pickup time cannot be later than the safe pickup deadline.', 'error');
        return;
      }

      // Add request record
      if (!item.requests) item.requests = [];
      item.requests.push({
        orgName,
        contactPerson,
        pickupTime: estPickup,
        transport: transportType,
        purpose: purpose || 'Community food assistance',
        requestedAt: new Date().toISOString()
      });

      // Update status to 'Requested'
      item.status = 'Requested';

      saveData();
      closeRequestModal();
      renderAll();

      showToast('Request Submitted Successfully!', `Your request for "${item.name}" was sent to the donor. Status is now Requested.`, 'success');
    });
  }
}

// =============================================================================
// 7. TOAST NOTIFICATION SYSTEM
// =============================================================================
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <p class="toast-message">${escapeHtml(message)}</p>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.classList.add('toast-leave');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4500);
}

// =============================================================================
// 8. SEARCH, FILTERS & UTILITY LISTENERS
// =============================================================================
function setupSearchAndFilters() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  const statusFilter = document.getElementById('statusFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (clearBtn) clearBtn.style.display = searchInput.value ? 'block' : 'none';
      renderDonations();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
      renderDonations();
    });
  }

  if (categoryFilter) categoryFilter.addEventListener('change', renderDonations);
  if (locationFilter) locationFilter.addEventListener('change', renderDonations);
  if (statusFilter) statusFilter.addEventListener('change', renderDonations);

  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    if (categoryFilter) categoryFilter.value = 'ALL';
    if (locationFilter) locationFilter.value = 'ALL';
    if (statusFilter) statusFilter.value = 'ALL';
    renderDonations();
  }

  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);
  if (emptyStateResetBtn) emptyStateResetBtn.addEventListener('click', resetAllFilters);
}

function setupSmartMatchListener() {
  const form = document.getElementById('smartMatchForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      renderSmartMatchResults();
      showToast('Matches Calculated', 'Simulated allocation ranked best suitable donations.', 'info');
    });
  }
}

function setupMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function setupDemoActionButtons() {
  const topReset = document.getElementById('resetDemoBtnTop');
  const footerReset = document.getElementById('footerResetBtn');
  const quickSampleBtn = document.getElementById('quickSampleBtn');

  if (topReset) topReset.addEventListener('click', resetDemoData);
  if (footerReset) footerReset.addEventListener('click', resetDemoData);

  if (quickSampleBtn) {
    quickSampleBtn.addEventListener('click', () => {
      const urgentBatch = {
        id: 'FS-' + Math.floor(1000 + Math.random() * 9000),
        name: '50 Hot Soup & Bread Roll Combos (Urgent Rescue)',
        category: 'Cooked Meals',
        quantity: 50,
        unit: 'meals / portions',
        storage: 'Keep Warm (Above 60°C)',
        prepTime: getRelativeDate(-1),
        pickupDeadline: getRelativeDate(2), // 2 hours left
        donorName: 'Civic Banquet Hall (Demo)',
        donorLocation: 'Downtown Metro',
        donorAddress: '88 Grand Avenue',
        dietTags: ['Vegetarian', 'Nut-Free'],
        specialNotes: 'Added via quick test button. Nearing pickup deadline.',
        status: 'Available',
        requests: [],
        createdAt: new Date().toISOString()
      };
      donations.unshift(urgentBatch);
      saveData();
      renderAll();
      showToast('Urgent Batch Added', '50 hot meals expiring in 2 hours added for testing.', 'success');
      
      const browseSec = document.getElementById('available-food');
      if (browseSec) browseSec.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Utility function to escape HTML and prevent XSS injection in demo
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Master Render Function
function renderAll() {
  auditDeadlines();
  updateDashboard();
  renderDonations();
  renderTrackingTable();
  renderSmartMatchResults();
}

// =============================================================================
// 9. APP INITIALIZATION ON DOM READY
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupDonationForm();
  setupRequestModal();
  setupSearchAndFilters();
  setupSmartMatchListener();
  setupMobileNav();
  setupDemoActionButtons();
  renderAll();

  // Periodic deadline watcher every 30 seconds
  setInterval(() => {
    auditDeadlines();
    updateDashboard();
    renderDonations();
    renderTrackingTable();
  }, 30000);

  console.log('FoodShare AI hackathon prototype successfully initialized.');
});
