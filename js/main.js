// ============================================
//  APHELION — Main Terminal Controller
//  main.js
//  Stage 10: Save/Load + Main Menu
// ============================================

const MASTER_SEED = '4471-KETH-NULL';
let menuDismissed   = false;
let activeSlot      = null;

// ── Terminal output ───────────────────────────

function print(text, style = '') {
  const output = document.getElementById('output');
  const line   = document.createElement('span');
  line.classList.add('output-line');
  if (style) line.classList.add(style);
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// ── Typewriter engine ─────────────────────────

const printQueue = [];
let isPrinting = false;


function queue(text, style = '', delay = 38) {
  printQueue.push({ text, style, delay });
  if (!isPrinting) processQueue();
}

function queueBlank(delay = 38) { queue('', '', delay); }
function queueDivider(delay = 38) {
  queue('─'.repeat(58), 'output-dim', delay);
}

function processQueue() {
  if (printQueue.length === 0) {
    isPrinting = false;
    return;
  }
  isPrinting = true;
  const { text, style, delay } = printQueue.shift();
  print(text, style);
  setTimeout(processQueue, delay);
}

// ── Sidebar helpers ───────────────────────────

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setStyledText(id, text, cssClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = cssClass || '';
  el.textContent = text;
}

function setSidebarHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setBar(id, value, max, width, cssClass) {
  const el = document.getElementById(id);
  if (!el) return;
  const filled = Math.round((value / max) * width);
  const empty  = width - filled;
  el.className = 'sidebar-bar ' + (cssClass || 'sb-green');
  el.textContent = '█'.repeat(filled) + '░'.repeat(empty) + ' ' + value + '%';
}

// ── Sidebar update ────────────────────────────

function updateSidebar() {
  if (typeof playerState === 'undefined' || !playerState) return;

  const ship = playerState.ship;

  // Captain and ship
  setStyledText('sb-captain', playerState.captainName || '—', 'sb-white');
  setStyledText('sb-ship',    ship ? ship.name : '—', 'sb-dim');
  setText('sb-day', 'Day ' + (playerState.currentDay || 0));

  // Bars — read from ship object
  const hull  = ship ? Math.max(0, Math.min(ship.hullMax,  ship.hull))  : 0;
  const fuel  = ship ? Math.max(0, Math.min(ship.fuelMax,  ship.fuel))  : 0;
  const power = ship ? Math.max(0, Math.min(ship.powerCore.max, ship.powerCore.current)) : 0;

  const hullPct  = ship ? Math.round((hull  / ship.hullMax)          * 100) : 0;
  const fuelPct  = ship ? Math.round((fuel  / ship.fuelMax)          * 100) : 0;
  const powerPct = ship ? Math.round((power / ship.powerCore.max)    * 100) : 0;

  setBar('sb-hull-bar',  hull,  ship ? ship.hullMax          : 100, 10, hullPct  < 30 ? 'sb-orange' : 'sb-white');
  setBar('sb-fuel-bar',  fuel,  ship ? ship.fuelMax          : 100, 10, fuelPct  < 20 ? 'sb-orange' : 'sb-green');
  setBar('sb-power-bar', power, ship ? ship.powerCore.max    : 500, 10, powerPct < 15 ? 'sb-orange' : 'sb-cyan');

  // Cargo
  setStyledText('sb-credits',  (playerState.credits  || 0) + ' CR', 'sb-cyan');
  setStyledText('sb-veydrite', (playerState.veydrite || 0) + ' kg',
    playerState.veydrite > 0 ? 'sb-cyan' : 'sb-dim');
  const astroCount = playerState.astrographics ? playerState.astrographics.length : 0;
  setStyledText('sb-astro', astroCount > 0 ? astroCount + ' systems' : '—',
    astroCount > 0 ? 'sb-cyan' : 'sb-dim');

  const cellsEl = document.getElementById('sb-cells');
  if (cellsEl) cellsEl.textContent = (playerState.foldCells ?? 3) + ' / 20';

  const reserveEl = document.getElementById('sb-reserve');
  if (reserveEl) reserveEl.textContent = (playerState.reserveVeydrite ?? 0).toFixed(1) + ' kg';

  // Contract
  const active = typeof activeContracts !== 'undefined'
    ? activeContracts.find(c => !c.completed && !c.failed)
    : null;

  if (active) {
    const daysLeft = active.timeLimitDays - (playerState.currentDay - active.issuedDay);
    const urgent   = daysLeft <= 2;
    setSidebarHtml('sb-contract',
      '<div class="' + (urgent ? 'sb-orange' : 'sb-white') + '">' + active.title + '</div>' +
      '<div class="sb-dim">→ ' + active.target + '</div>' +
      '<div class="' + (urgent ? 'sb-orange' : 'sb-dim') + '">' +
        daysLeft + ' days left' + (urgent ? ' (!)' : '') +
      '</div>'
    );
  } else {
    setStyledText('sb-contract', 'none active', 'sb-dim');
  }

  // Reputation
  if (typeof reputation !== 'undefined') {
    const keys = Object.keys(reputation);
    if (keys.length === 0) {
      setStyledText('sb-rep', 'no contacts', 'sb-dim');
    } else {
      let html = '';
      keys.forEach(key => {
        const score   = reputation[key];
        const tier    = repTier(score);
        const faction = FACTION_REGISTRY[key];
        if (!faction) return;
        const scoreStr = (score >= 0 ? '+' : '') + score;
        const cls = tier === 'HOSTILE' ? 'sb-orange'
                  : tier === 'WATCHED' ? 'sb-orange'
                  : tier === 'TRUSTED' ? 'sb-white'
                  : 'sb-dim';
        html += '<div class="sidebar-row">' +
          '<span class="' + cls + '">' + faction.short + '</span>' +
          '<span class="' + cls + '">' + tier + '</span>' +
          '<span class="' + cls + '">' + scoreStr + '</span>' +
        '</div>';
      });
      setSidebarHtml('sb-rep', html);
    }
  }
}

// ── Auspex ────────────────────────────────────

function updateAuspex() {
  if (typeof playerState === 'undefined' || !playerState) return;
  if (typeof galaxy === 'undefined' || !galaxy) return;
  if (!playerState.location) return;

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);

  if (!sys) return;

  const body = document.getElementById('auspex-body');
  if (!body) return;

  let html = '';

  // System header
  html += '<div class="ax-white">' + sys.name + '</div>';
  html += '<div class="ax-dim">' + sys.starClass + '-class  |  ' + sys.bodies.length + ' bodies</div>';
  html += '<div class="ax-dim">' + q.state + '</div>';

  // Bodies
  html += '<div class="ax-label">BODIES</div>';
  sys.bodies.forEach((b, i) => {
    const tags = [];
    if (b.hasStation) tags.push('<span class="ax-cyan">[STA]</span>');
    if (b.veydrite)   tags.push('<span class="ax-white">[VYD]</span>');
    if (b.hasRuin)    tags.push('<span class="ax-dim">[RUN]</span>');

    const tagStr = tags.length > 0 ? ' ' + tags.join(' ') : '';
    html += '<div class="ax-dim">[' + (i + 1) + '] ' + b.type + tagStr + '</div>';
  });

  // Stations
  const stations = sys.bodies.filter(b => b.hasStation);
  if (stations.length > 0) {
    html += '<div class="ax-label">STATIONS</div>';
  stations.forEach(b => {
      const f        = b.faction || { short: 'INDP' };
      const isDocked = playerState.docked && playerState.dockedAt === b.stationName;
      html += '<div class="ax-cyan">' + (b.stationName || 'Unknown') +
              (isDocked ? ' <span class="ax-orange">[DOCKED]</span>' : '') + '</div>';
      html += '<div class="ax-dim">[' + f.short + ']</div>';
    });
  }

  // Signals
  html += '<div class="ax-label">SIGNALS</div>';
  if (sys.hasBeacon) {
    html += '<div class="ax-orange">BCN  active</div>';
  } else {
    html += '<div class="ax-dim">no signals</div>';
  }

  // Xeno — subtle, never explicit
  if (sys.xenoTainted) {
    html += '<div class="ax-dim">anomalous reading</div>';
  }

  // Environment
  html += '<div class="ax-label">ENVIRONMENT</div>';
  html += '<div class="ax-dim">Hazard  ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard) + '</div>';
  html += '<div class="ax-dim">Traffic ' + '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic) + '</div>';
  html += '<div class="ax-dim">Jumps   ' + sys.jumpPoints + ' outbound</div>';

  // Docked
  if (playerState.docked) {
    html += '<div class="ax-label">DOCKED</div>';
    html += '<div class="ax-cyan">' + playerState.dockedAt + '</div>';
  }

  // Only preserve traffic if we're in the same system
  // currentContacts being null means we've moved — clear traffic
  const existing = body.innerHTML;
  const trafficMarker = '<!-- traffic -->';
  const trafficIndex  = existing.indexOf(trafficMarker);
  if (trafficIndex !== -1 && typeof currentContacts !== 'undefined' && currentContacts !== null) {
    body.innerHTML = html + existing.substring(trafficIndex);
  } else {
    body.innerHTML = html;
  }
}

function updateCombatAlert() {
  const terminal = document.getElementById('terminal');
  const inCombat = typeof playerState !== 'undefined' && playerState.inEncounter;

  if (inCombat) {
    terminal.classList.add('in-combat');
    // Add warning to auspex
    const body = document.getElementById('auspex-body');
    if (body) {
      const existing  = body.innerHTML;
      const alertTag  = '<!-- combat-alert -->';
      const alertHtml = alertTag + '<div class="ax-orange" style="margin-bottom:6px;">⚠ CONTACT — THREAT ACTIVE</div><div class="auspex-divider"></div>';
      if (!existing.includes(alertTag)) {
        body.innerHTML = alertHtml + existing;
      }
    }
  } else {
    terminal.classList.remove('in-combat');
    // Remove warning from auspex
    const body = document.getElementById('auspex-body');
    if (body && body.innerHTML.includes('<!-- combat-alert -->')) {
      body.innerHTML = body.innerHTML.replace(
        /<!-- combat-alert -->.*?<div class="auspex-divider"><\/div>/s, ''
      );
    }
  }
}

function bootAuspex(onComplete) {
  const auspex = document.getElementById('auspex');
  if (!auspex) { if (onComplete) onComplete(); return; }

  const body = document.getElementById('auspex-body');

  const steps = [
    () => {
      auspex.classList.add('sidebar-visible');
      if (body) body.innerHTML = '<div class="ax-white">AUSPEX INITIALIZING...</div>';
    },
    () => { if (body) body.innerHTML = '<div class="ax-dim">> calibrating array...</div>'; },
    () => { if (body) body.innerHTML = '<div class="ax-dim">> scanning local grid...</div>'; },
    () => { if (body) body.innerHTML = '<div class="ax-dim">> signal check...</div>'; },
    () => { if (body) body.innerHTML = '<div class="ax-dim">> environment nominal</div>'; },
    () => { if (body) body.innerHTML = '<div class="ax-dim">> local grid online</div>'; },
    () => { if (onComplete) onComplete(); },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) { clearInterval(interval); return; }
    steps[i]();
    i++;
  }, 250);
}

function updateAuspexTraffic(contacts, resolved) {
  if (!contacts) return;
  const body = document.getElementById('auspex-body');
  if (!body) return;

  // Get current auspex content and append traffic section
  // We rebuild the traffic section only
  let existing = body.innerHTML;

  // Remove old traffic section if present
  const trafficMarker = '<!-- traffic -->';
  const markerIndex   = existing.indexOf(trafficMarker);
  if (markerIndex !== -1) {
    existing = existing.substring(0, markerIndex);
  }

  let trafficHtml = trafficMarker;
  trafficHtml += '<div class="ax-label">TRAFFIC</div>';

  if (contacts.length === 0) {
    trafficHtml += '<div class="ax-dim">no contacts</div>';
} else if (!resolved) {
    trafficHtml += '<div class="ax-dim">gravimetric sweep</div>';
    trafficHtml += '<div class="ax-dim">' + contacts.length + ' contact(s)</div>';
    contacts.forEach(c => {
      const cls = c.xeno ? 'ax-orange' : 'ax-dim';
      trafficHtml += '<div class="' + cls + '">  ◈ ' + c.mass + '</div>';
    });
  } else {
    // mixed or true — render each contact based on its own resolved state
    trafficHtml += '<div class="ax-dim">' + contacts.length + ' contact(s)</div>';
    contacts.forEach(c => {
      if (c.xeno) {
        trafficHtml += '<div class="ax-orange">  ◈ [NO SIG]</div>';
        if (c.resolved) trafficHtml += '<div class="ax-dim">    does not resolve</div>';
      } else if (!c.resolved) {
        // Not yet resolved — show mass only
        trafficHtml += '<div class="ax-dim">  ◈ ' + c.mass + '</div>';
      } else if (c.dark) {
        trafficHtml += '<div class="ax-orange">  ◈ [NO SIG] dark</div>';
      } else {
        trafficHtml += '<div class="ax-cyan">  ◈ ' + c.shipClass + '</div>';
        if (c.shipName) {
          trafficHtml += '<div class="ax-white">    "' + c.shipName + '"</div>';
        }
        trafficHtml += '<div class="ax-dim">    ' + c.registry + '</div>';
      }
    });
  }

  body.innerHTML = existing + trafficHtml;
}

// ── Death screen ──────────────────────────────

function showDeathScreen() {
  inputEnabled = false;

  // Clear output
  setTimeout(() => {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';

    // Clear sidebar and auspex
    const sidebar = document.getElementById('sidebar');
    const auspex  = document.getElementById('auspex');
    if (sidebar) sidebar.style.opacity = '0';
    if (auspex)  auspex.style.opacity  = '0';

    // Show death message
    setTimeout(() => {
      const cause = playerState.deathCause || 'unknown cause';
      const name  = playerState.shipName   || 'Unknown vessel';
      const captain = playerState.captainName || 'Unknown';
      const day   = playerState.currentDay  || 0;

      queue('', '', 200);
      queue(name + ' did not return.', 'output-bright', 100);
      queue('', '', 200);
      queue('No distress beacon was recovered.', 'output-dim', 100);
      queue('', '', 400);
      queue('Captain ' + captain + '  |  Day ' + day + '  |  ' + cause + '.', 'output-dim', 100);
      queue('', '', 800);
      queue('─'.repeat(58), 'output-dim', 100);
      queue('', '', 600);

      const waitForDeath = setInterval(() => {
        if (!isPrinting && printQueue.length === 0) {
          clearInterval(waitForDeath);
          setTimeout(() => { location.reload(); }, 2000);
        }
      }, 100);

    }, 600);
  }, 400);
}

// ── Autosave ──────────────────────────────────

function autosave() {
  if (typeof playerState === 'undefined' || !playerState.captainName ||
      playerState.captainName === 'Unknown') return;
  saveGame(playerState, reputation, {
    active:  activeContracts ? activeContracts.find(c => !c.completed && !c.failed) || null : null,
    history: activeContracts ? activeContracts.filter(c => c.completed || c.failed) : [],
  });
}

// ── Main Menu ─────────────────────────────────

function showMainMenu() {
  let slots;
  try {
    slots = getAllSlots();
  } catch(e) {
    console.error('getAllSlots failed:', e);
    slots = [{slot:1,save:null},{slot:2,save:null},{slot:3,save:null}];
  }

  const mostRecent = slots
    .filter(s => s.save && s.save.savedAt)
    .sort((a, b) => b.save.savedAt - a.save.savedAt)[0];

const contBtn  = document.getElementById('menu-continue');
  const loadBtn  = document.getElementById('menu-load');
  const info     = document.getElementById('menu-save-info');
  const anySaves = slots.some(s => s.save !== null);

  if (mostRecent) {
    contBtn.style.display = 'block';
    info.textContent =
      mostRecent.save.captain.name + '  ·  ' +
      (mostRecent.save.ship ? mostRecent.save.ship.name : '') +
      '  ·  Day ' + (mostRecent.save.currentDay || 0);
    contBtn.onclick = () => {
      activeSlot = mostRecent.slot;
      startContinue(mostRecent.save);
    };
  } else {
    contBtn.style.display = 'none';
  }

  loadBtn.style.display = anySaves ? 'block' : 'none';

  slots.forEach(({ slot, save }) => {
    const el       = document.getElementById('menu-slot-' + slot);
    const infoSpan = el.querySelector('.slot-info');
    const detail   = document.getElementById('slot-detail-' + slot);

    if (save) {
      const ship    = save.ship ? save.ship.name : 'Unknown vessel';
      const cls     = save.ship ? save.ship.designation : '';
      const date    = save.savedAt ? new Date(save.savedAt).toLocaleDateString() : 'unknown';
      const time    = save.savedAt ? new Date(save.savedAt).toLocaleTimeString() : '';

      infoSpan.textContent = save.captain.name + '  ·  ' + ship + '  ·  Day ' + (save.currentDay || 0);
      el.classList.add('slot-occupied');

      detail.innerHTML = `
        <div class="slot-detail-row"><span>Vessel</span><span>${ship} (${cls})</span></div>
        <div class="slot-detail-row"><span>Location</span><span>${save.location.systemName || 'unknown'}</span></div>
        <div class="slot-detail-row"><span>Day</span><span>${save.currentDay || 0}</span></div>
        <div class="slot-detail-row"><span>Scrip</span><span>${save.economy.credits} CR</span></div>
        <div class="slot-detail-row"><span>Hull</span><span>${save.ship.hull || '?'} / ${save.ship.hullMax || '?'}</span></div>
        <div class="slot-detail-row"><span>Saved</span><span>${date} ${time}</span></div>
        <div class="slot-detail-actions">
          <span class="slot-action" id="slot-load-${slot}">[L] Load</span>
          <span class="slot-action danger" id="slot-delete-${slot}">[X] Delete</span>
        </div>
      `;
    } else {
      infoSpan.textContent = '— EMPTY —';
      el.classList.add('slot-empty');
      detail.innerHTML = `
        <div class="slot-detail-actions">
          <span class="slot-action" id="slot-new-${slot}">[N] New Game</span>
        </div>
      `;
    }

    el.addEventListener('click', (e) => {
      if (e.target.id === 'slot-load-' + slot)   { activeSlot = slot; dismissMenu(); startContinue(save); return; }
      if (e.target.id === 'slot-delete-' + slot)  { confirmDeleteSlot(slot); return; }
      if (e.target.id === 'slot-new-' + slot)     { activeSlot = slot; dismissMenu(); startNewGame(slot); return; }
      selectSlot(slot);
    });
  });

  document.getElementById('menu-load').addEventListener('click', openSlotModal);
  document.getElementById('slot-cancel').addEventListener('click', closeSlotModal);
  document.getElementById('menu-new').addEventListener('click', () => {
    const emptySlot = slots.find(s => s.save === null);
    if (emptySlot) {
      dismissMenu();
      startNewGame(emptySlot.slot);
    } else {
      openSlotModal('new');
    }
  });

  document.getElementById('menu-archive').addEventListener('click', openAchievementsModal);
  document.addEventListener('keydown', menuKeyHandler);
}

function menuKeyHandler(e) {
  if (menuDismissed) {
    document.removeEventListener('keydown', menuKeyHandler);
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const modalOpen = document.getElementById('slot-modal').style.display !== 'none';

  const achModalOpen = document.getElementById('achievements-modal').style.display !== 'none';
  if (e.key === 'Escape' && achModalOpen) {
    e.preventDefault();
    closeAchievementsModal();
    return;
  }

  if (e.key === 'Escape' && modalOpen) {
    e.preventDefault();
    closeSlotModal();
    return;
  }

  if (e.key === '1' || e.key === '2' || e.key === '3') {
    if (modalOpen) {
      e.preventDefault();
      selectSlot(parseInt(e.key));
    }
    return;
  }

  if (modalOpen) return; // eat all other keys while modal is open

  if (e.key === 'c' || e.key === 'C') {
    const mostRecent = getAllSlots()
      .filter(s => s.save && s.save.savedAt)
      .sort((a, b) => b.save.savedAt - a.save.savedAt)[0];
    if (mostRecent) {
      document.removeEventListener('keydown', menuKeyHandler);
      e.preventDefault();
      activeSlot = mostRecent.slot;
      startContinue(mostRecent.save);
    }
  } else if (e.key === 'l' || e.key === 'L') {
    e.preventDefault();
    openSlotModal('load');
  } else if (e.key === 'n' || e.key === 'N') {
    document.removeEventListener('keydown', menuKeyHandler);
    e.preventDefault();
    const slots     = getAllSlots();
    const emptySlot = slots.find(s => s.save === null);
    if (emptySlot) {
      dismissMenu();
      setTimeout(() => { startNewGame(emptySlot.slot); }, 750);
    } else {
      openSlotModal('new');
    }
  }
}

let slotModalMode = null;

function openSlotModal(mode) {
  slotModalMode = (mode === 'new') ? 'new' : 'load';
  const hint = document.getElementById('slot-modal-hint');
  hint.textContent = slotModalMode === 'new'
    ? 'All slots occupied. Choose a slot to overwrite.'
    : 'Press 1, 2, or 3 to select a pilot record.';
  document.getElementById('slot-modal').style.display = 'flex';
}

function closeSlotModal() {
  document.getElementById('slot-modal').style.display = 'none';
  slotModalMode = null;
  activeSlot    = null;
  [1, 2, 3].forEach(s => {
    document.getElementById('menu-slot-' + s).classList.remove('slot-selected');
  });
}

function selectSlot(slot) {
  activeSlot = slot;
  [1, 2, 3].forEach(s => {
    document.getElementById('menu-slot-' + s).classList.toggle('slot-selected', s === slot);
  });
}

function confirmDeleteSlot(slot) {
  const detail = document.getElementById('slot-detail-' + slot);
  detail.innerHTML += `
    <div style="font-size:11px;color:#ff8800;margin-top:8px;">
      Delete this pilot record? This cannot be undone.<br>
      <span class="slot-action" id="slot-delete-confirm-${slot}" style="color:#ff8800">[Y] Confirm delete</span>
      &nbsp;&nbsp;
      <span class="slot-action" id="slot-delete-cancel-${slot}">[N] Cancel</span>
    </div>
  `;
  document.getElementById('slot-delete-confirm-' + slot).addEventListener('click', () => {
    deleteSlotSave(slot);
    closeSlotModal();
    showMainMenu();
  });
  document.getElementById('slot-delete-cancel-' + slot).addEventListener('click', () => {
    closeSlotModal();
    showMainMenu();
  });
}

function menuKeyHandler(e) {
  if (menuDismissed) {
    document.removeEventListener('keydown', menuKeyHandler);
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const modalOpen = document.getElementById('slot-modal').style.display !== 'none';

  if (e.key === 'Escape' && modalOpen) {
    e.preventDefault();
    closeSlotModal();
    return;
  }

  if (e.key === '1' || e.key === '2' || e.key === '3') {
    if (modalOpen) {
      e.preventDefault();
      selectSlot(parseInt(e.key));
    }
    return;
  }

  if (modalOpen) return;

  if (e.key === 'c' || e.key === 'C') {
    const mostRecent = getAllSlots()
      .filter(s => s.save && s.save.savedAt)
      .sort((a, b) => b.save.savedAt - a.save.savedAt)[0];
    if (mostRecent) {
      document.removeEventListener('keydown', menuKeyHandler);
      e.preventDefault();
      activeSlot = mostRecent.slot;
      startContinue(mostRecent.save);
    }
  } else if (e.key === 'l' || e.key === 'L') {
    e.preventDefault();
    openSlotModal('load');
  } else if (e.key === 'n' || e.key === 'N') {
    document.removeEventListener('keydown', menuKeyHandler);
    e.preventDefault();
    const slots     = getAllSlots();
    const emptySlot = slots.find(s => s.save === null);
    if (emptySlot) {
      dismissMenu();
      setTimeout(() => { startNewGame(emptySlot.slot); }, 750);
    } else {
      openSlotModal('new');
    }
  }
}

// ── Achievements modal ────────────────────────

function openAchievementsModal() {
  const modal = document.getElementById('achievements-modal');
  const list  = document.getElementById('achievements-list');

  // Load from all slots and merge into a hall of records
  const slots       = getAllSlots();
  const allRecords  = [];

  slots.forEach(({ slot, save }) => {
    if (!save || !save.achievements || save.achievements.length === 0) return;
    save.achievements.forEach(a => {
      allRecords.push({
        ...a,
        pilotName: save.captain.name,
        slotLabel: 'Slot ' + slot,
      });
    });
  });

  // Also include current session if in-game
  if (typeof playerState !== 'undefined' && playerState.achievements && playerState.achievements.length > 0) {
    playerState.achievements.forEach(a => {
      if (!allRecords.some(r => r.id === a.id && r.pilotName === playerState.captainName)) {
        allRecords.push({
          ...a,
          pilotName: playerState.captainName,
          slotLabel: 'Active',
        });
      }
    });
  }

  list.innerHTML = '';

  if (allRecords.length === 0) {
    list.innerHTML = '<div style="color:#006618;font-size:12px;padding:8px 0;">No entries on record. The archive updates as operations are conducted.</div>';
  } else {
    // Group by category
    const grouped = {};
    allRecords.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });

    Object.keys(grouped).sort().forEach(cat => {
      const catEl = document.createElement('div');
      catEl.className = 'ach-category';
      catEl.textContent = cat.toUpperCase();
      list.appendChild(catEl);

      grouped[cat].forEach(a => {
        const entry = document.createElement('div');
        entry.className = 'ach-entry';
        entry.innerHTML =
          '<div class="ach-summary">' +
            '<span class="ach-day">Day ' + a.day + '</span>' +
            '<span class="ach-title">' + a.title + '</span>' +
          '</div>' +
          '<div class="ach-detail">' +
            a.detail + '<br><br>' +
            '<span style="color:#004410;">Pilot: ' + a.pilotName + '  ·  ' + a.slotLabel + '</span>' +
          '</div>';
        entry.addEventListener('click', () => {
          entry.classList.toggle('ach-expanded');
        });
        list.appendChild(entry);
      });
    });
  }

  modal.style.display = 'flex';
  document.getElementById('achievements-cancel').addEventListener('click', closeAchievementsModal);
}

function closeAchievementsModal() {
  document.getElementById('achievements-modal').style.display = 'none';
}

function dismissMenu() {
  const menu = document.getElementById('main-menu');
  menu.classList.add('hidden');
  setTimeout(() => {
    menu.style.display = 'none';
    menuDismissed = true;
  }, 700);
}

// ── Continue Game ─────────────────────────────

function startContinue(save) {
  dismissMenu();

  setTimeout(() => {
    queue('INITIALIZING — APHELION DEEP SURVEY TERMINAL', 'output-bright', 80);
    queue('INITIALIZING GALAXY ENGINE...', 'output-dim', 120);
    queueBlank(80);
    queue('> Loading galaxy data...', 'output-dim', 200);
    queue('> Restoring pilot record...', 'output-dim', 280);
    queue('> Guild network: CONNECTED', 'output-dim', 180);
    queueBlank(120);
    queueDivider(60);
    queue('SAVE FILE LOADED', 'output-label', 80);
    queueDivider(60);
    queueBlank(80);

    initCommands(save.galaxySeed || MASTER_SEED);
    applySave(save, playerState, reputation, activeContracts);

    const waitForPrint = setInterval(() => {
      if (!isPrinting && printQueue.length === 0) {
        clearInterval(waitForPrint);

        bootSidebar(playerState.captainName, playerState.shipName, () => {
          updateSidebar();
          queue('', '', 80);
          queue('Welcome back, ' + playerState.captainName + '.', 'output-bright', 80);
          queue('Vessel: ' + (playerState.ship ? playerState.ship.name : playerState.shipName || 'Unknown'), 'output-dim', 80);
          queue('Day ' + playerState.currentDay + ' — ' + playerState.location.systemName, 'output-dim', 80);
          queueBlank(80);
          queueDivider(60);
          queueBlank(60);
          queue('  ── SUGGESTED ACTIONS ────────────────────────────────────────', 'output-dim', 60);
          queueBlank(40);
          queue('  where          — survey your current system', 'output-dim', 40);
          queue('  ping           — sweep for local contacts', 'output-dim', 40);
          queue('  galaxy         — view the full quadrant map', 'output-dim', 40);

          if (playerState.docked) {
            queue('  trade          — open trade terminal', 'output-dim', 40);
            queue('  armory         — browse weapons and ammo', 'output-dim', 40);
            queue('  bulletin       — check available contracts', 'output-dim', 40);
          } else {
            queue('  nav <s>        — plot a course', 'output-dim', 40);
            queue('  salvage        — begin salvage operation', 'output-dim', 40);
            queue('  scan log       — search ruins for data', 'output-dim', 40);
          }

          queueBlank(80);
          queueDivider(60);
          queueBlank(80);

          const waitForQueue = setInterval(() => {
            if (!isPrinting && printQueue.length === 0) {
              clearInterval(waitForQueue);
              enableInput('command');
              bootAuspex(() => { updateAuspex(); });
              updateSidebar();
            }
          }, 100);
        });
      }
    }, 100);

  }, 400);
}

// ── New Game ──────────────────────────────────

function generateRandomSeed() {
  const words = [
  'KETH','VAEL','NULL','DROSS','OSSIAN',
  'THAL','GYRE','VEXIS','NARR','CAERN',
  'ULVAR','SHETH','AETHON','SOLUS','EREBUS',
  'VEYDRIS','KORRATH','HIIGARA','ITHEN','SOVAK',
  'VANDRIS','RAVETH','MORVAK','ORVETH','ZETHIS',
  'PELION','ARDIS','BRENNA','CALYX','DAVAN',
  'ELVAR','GRETH','HAVAN','IRETH','JORVAK',
  'VAEDRIS','KETHIS','VAELON','NARROK','DROTH',
  'OSSIK','THALEN','GYRIS','VEXAR','NARITH',
  'CAERON','ULVETH','SHALEN','AETHIS','SOLEN',
  'ERETH','KELVAK','MELVAK','NETHIS','ORVAK',
  'VAETH','KELN','XAELN','YOVAK','ZELVAK',
  'AKSETH','BALETH','CRESITH','TELVAK','URVAK',
  'QUETH','RELVAK','SELVAK','WELVAK','XETHIS',
  'YELVAK','KORVETH','BELVAK','DELVAK','FORVAK'
  ];
  
  const numbers = Math.floor(Math.random() * 9000) + 1000;
  const word    = words[Math.floor(Math.random() * words.length)];
  const suffix  = Math.floor(Math.random() * 900) + 100;
  return numbers + '-' + word + '-' + suffix;
}

function startNewGame(slot) {
  deleteSlotSave(slot);

  setTimeout(() => {
    queue('APHELION — NEW PILOT REGISTRATION', 'output-bright', 80);
    queue('SLOT ' + slot, 'output-dim', 80);
    queueDivider(60);
    queueBlank(80);
    queue('No pilot record found for this terminal.', 'output-dim', 100);
    queue('Registration required before galaxy access is granted.', 'output-dim', 100);
    queueBlank(200);

    askPlayer('  Enter your name, Captain:', (captainName) => {
      playerState.captainName = captainName || 'Unknown';
      print('');
      print('  Registered: ' + playerState.captainName, 'output-dim');
      updateSidebar();

      askPlayer('  Name your vessel:', (shipName) => {
        playerState.shipName = shipName || 'The Unspoken';
        print('');
        print('  Vessel registered: ' + playerState.shipName, 'output-dim');
        print('');
        updateSidebar();

        const autoSeed = generateRandomSeed();

        askPlayer('  Galaxy seed: ' + autoSeed + '  — press Enter to accept or type your own:', (seedInput) => {
          const chosenSeed = seedInput.trim() || autoSeed;

          print('');
          print('  Seed confirmed: ' + chosenSeed, 'output-dim');
          print('');

          queue('INITIALIZING — APHELION DEEP SURVEY TERMINAL', 'output-bright', 80);
          queue('UNIVERSE SEED: ' + chosenSeed, 'output-dim', 120);
          queueBlank(80);
          queue('> Loading naming systems...', 'output-dim', 200);
          queue('> History engine standing by...', 'output-dim', 280);
          queue('> Guild network: CONNECTED', 'output-dim', 180);
          queueBlank(120);
          queueDivider(60);
          queue('REGISTRATION COMPLETE — GALAXY ACCESS GRANTED', 'output-label', 80);
          queueDivider(60);
          queueBlank(80);

          initCommands(chosenSeed);
          playerState.foldCells       = 3;
          playerState.reserveVeydrite = Math.floor(7 + Math.random() * 5);
          

          const waitForBoot = setInterval(() => {
            if (!isPrinting && printQueue.length === 0) {
              clearInterval(waitForBoot);
              bootSidebar(playerState.captainName, playerState.shipName, () => {
                updateSidebar();
                const overview = handleCommand('galaxy');
                overview.split('\n').forEach(line => queue(line, '', 12));

                const waitForQueue = setInterval(() => {
                  if (!isPrinting && printQueue.length === 0) {
                    clearInterval(waitForQueue);
                    enableInput('command');
                    updateSidebar();
                    autosave(slot);
                    bootAuspex(() => {});
                  }
                }, 100);
              });
            }
          }, 100);
        }, 600);
      });
    });
  }, 400);
}

// ── Autosave ──────────────────────────────────

function autosave(slot) {
  if (typeof playerState === 'undefined' || !playerState.captainName ||
      playerState.captainName === 'Unknown') return;
  const s = slot || activeSlot || 1;
  saveGameToSlot(s, playerState, reputation, {
    active:  activeContracts ? activeContracts.find(c => !c.completed && !c.failed) || null : null,
    history: activeContracts ? activeContracts.filter(c => c.completed || c.failed) : [],
  });
}

// ── Sidebar boot sequence ─────────────────────

function bootSidebar(captainName, shipName, onComplete) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) { onComplete(); return; }

  setText('sb-captain', '');
  setText('sb-ship', '');
  setText('sb-day', '');
  setText('sb-credits', '');
  setText('sb-veydrite', '');
  setText('sb-contract', '');
  setText('sb-rep', '');
  setText('sb-hull-bar', '');
  setText('sb-fuel-bar', '');

  const steps = [
    () => { sidebar.classList.add('sidebar-visible'); setSidebarHtml('sb-captain', '<span class="sb-white">INITIALIZING...</span>'); },
    () => { setStyledText('sb-captain', '> PILOT RECORD', 'sb-dim'); },
    () => { setStyledText('sb-captain', '> VERIFYING...', 'sb-dim'); },
    () => { setStyledText('sb-captain', captainName, 'sb-white'); },
    () => { setStyledText('sb-ship', '> VESSEL ID...', 'sb-dim'); },
    () => { setStyledText('sb-ship', shipName, 'sb-dim'); setText('sb-day', 'Day 0'); },
    () => { setSidebarHtml('sb-hull-bar', '<span class="sb-white">CHECKING SYS...</span>'); },
    () => { setBar('sb-hull-bar',  80,  100, 10, 'sb-white'); },
    () => { setBar('sb-fuel-bar',  60,  100, 10, 'sb-green'); },
    () => { setBar('sb-power-bar', 350, 500, 10, 'sb-cyan');  },
    () => { setStyledText('sb-credits', '200 CR', 'sb-cyan'); setStyledText('sb-veydrite', '0 kg', 'sb-dim'); },
    () => { setStyledText('sb-system', '> LOCATING...', 'sb-dim'); },
    () => { setStyledText('sb-contract', 'none active', 'sb-dim'); setStyledText('sb-rep', 'no contacts', 'sb-dim'); },
    () => { updateSidebar(); },
    () => { onComplete(); },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) { clearInterval(interval); return; }
    steps[i]();
    i++;
  }, 200);
}

// ── Input handling ────────────────────────────

let inputMode         = 'command';
let inputEnabled      = false;
let currentInputValue = '';
let promptCallback    = null;
let pendingNewSave    = false;

function enableInput(mode = 'command') {
  inputEnabled = true;
  inputMode    = mode;
}

function askPlayer(question, callback) {
  const waitForQueue = setInterval(() => {
    if (!isPrinting) {
      clearInterval(waitForQueue);
      print('');
      print(question, 'output-bright');
      print('');
      enableInput('prompt');
      promptCallback = callback;
    }
  }, 100);
}

document.addEventListener('keydown', (e) => {
  if (!inputEnabled) return;

  if (e.key === 'Enter') {
    const raw = currentInputValue.trim();
    currentInputValue = '';
    updateTyped('');

    if (inputMode === 'prompt') {
      inputEnabled   = false;
      inputMode      = 'command';
      const cb       = promptCallback;
      promptCallback = null;
      if (cb) cb(raw);

    } else {
      if (raw === '') return;
      print('> ' + raw, 'output-cmd');

      if (pendingNewSave) {
        pendingNewSave = false;
        if (raw.toLowerCase() === 'yes' || raw.toLowerCase() === 'y') {
          print('  [NEWSAVE] Pilot record deleted.', 'output-dim');
          setTimeout(() => {
            if (typeof activeSlot !== 'undefined' && activeSlot) {
              deleteSlotSave(activeSlot);
            } else {
              deleteSave();
            }
            location.reload();
          }, 800);
          return;
        } else {
          print('  [NEWSAVE] Cancelled.', 'output-dim');
          return;
        }
      }

      if (playerState.pendingMenu) {
        playerState.pendingMenu = false;
        if (raw.toLowerCase() === 'yes' || raw.toLowerCase() === 'y') {
          print('  [MENU] Returning to main menu...', 'output-dim');
          setTimeout(() => { location.reload(); }, 800);
          return;
        } else {
          print('  [MENU] Cancelled.', 'output-dim');
          return;
        }
      }

      if (raw.toLowerCase() === 'newsave') {
        pendingNewSave = true;
      }

      const thinkTime = 200 + Math.floor(Math.random() * 600);
      const cmdWord   = raw.trim().toLowerCase().split(/\s+/)[0];

      setTimeout(() => {
        const response = handleCommand(raw);
        if (response === '__DEATH__') {
          showDeathScreen();
          return;
        }

if (response && response.trim().startsWith('__CLUSTERDEEPSCAN__')) {
          const payload = JSON.parse(response.trim().slice(19));
          const SCAN_MESSAGES = [
            'Array focusing...',
            'Gravitometric sweep in progress...',
            'Resolving stellar bodies...',
            'Calibrating sensor return...',
            'Cross-referencing Guild charts...',
            'Astrographic matrix compiling...',
            'Signal processing...',
            'Triangulating jump geometry...',
            'Deep field analysis running...',
            'Refining positional data...',
          ];

          queue('', '', 40);
          queue('  [CLUSTERDEEPSCAN] Initializing cluster sweep — ' + payload.clusterName.toUpperCase(), 'output-dim', 80);
          queue('  [CLUSTERDEEPSCAN] ' + payload.systems.length + ' systems queued.', 'output-dim', 120);
          queue('', '', 80);

          let cumulativeDelay = 400;

          payload.systems.forEach((sys, i) => {
            const sysDelay    = 3000 + Math.floor(Math.random() * 3000);
            const numMessages = 2 + Math.floor(Math.random() * 3);

            setTimeout(() => {
              queue('  [' + (i + 1) + '/' + payload.systems.length + '] Targeting: ' + sys.name.toUpperCase(), 'output-dim', 60);
            }, cumulativeDelay);
            cumulativeDelay += 300;

            for (let m = 0; m < numMessages; m++) {
              const msgDelay = Math.floor((sysDelay / (numMessages + 1)) * (m + 1));
              const msg      = SCAN_MESSAGES[Math.floor(Math.random() * SCAN_MESSAGES.length)];
              setTimeout(() => {
                queue('    > ' + msg, 'output-dim', 60);
              }, cumulativeDelay + msgDelay);
            }

            setTimeout(() => {
              drainPower(getShip(), sys.costPerSys);
              const ship  = getShip();
              const entry = {
                systemName:    sys.name,
                quadrantIndex: payload.quadrantIndex,
                quality:       'deep',
                scannedDay:    playerState.currentDay,
                units:         sys.units,
                data: {
                  state:       sys.state,
                  starClass:   sys.starClass,
                  hazard:      sys.hazard,
                  traffic:     sys.traffic,
                  jumpPoints:  sys.jumpPoints,
                  bodyCount:   sys.bodyCount,
                  hasStation:  sys.hasStation,
                  hasRuin:     sys.hasRuin,
                  hasVeydrite: sys.hasVeyd,
                },
              };
              const existing = playerState.astrographics.findIndex(a => a.systemName === sys.name);
              if (existing >= 0) {
                playerState.astrographics[existing] = entry;
              } else {
                playerState.astrographics.push(entry);
              }
              playerState.scannedSystems[sys.name] = true;
              queue('', '', 40);
              queue('  ── ' + sys.name.toUpperCase() + ' ─────────────────────────────────────', '', 40);
              queue('  Star class  : ' + sys.starClass + '-type', '', 40);
              queue('  Bodies      : ' + sys.bodyCount, '', 40);
              queue('  State       : ' + sys.state, '', 40);
              queue('  Hazard      : ' + sys.hazardBar, '', 40);
              queue('  Traffic     : ' + sys.trafficBar, '', 40);
              queue('  Jump points : ' + sys.jumpPoints + ' outbound', '', 40);
              queue('  Station     : ' + sys.stationName, '', 40);
              queue('  Veydrite    : ' + (sys.hasVeyd ? 'trace deposits  [VYD]' : 'none detected'), '', 40);
              queue('  Ruins       : ' + (sys.hasRuin ? 'structural signatures  [RUN]' : 'none detected'), '', 40);
              queue('  Beacon      : ' + (sys.hasBeacon ? 'active  [BCN]' : 'none'), '', 40);
              queue('  Data recorded.  +' + sys.units + ' units', 'output-dim', 40);
              queue('  Power core: ' + ship.powerCore.current + '/' + ship.powerCore.max + '  [' + powerStatus(ship) + ']', 'output-dim', 40);
              queue('', '', 40);
              updateSidebar();
            }, cumulativeDelay + sysDelay);

            cumulativeDelay += sysDelay + 600;
          });

          setTimeout(() => {
            const ship = getShip();
            queue('  ── CLUSTER SWEEP COMPLETE ────────────────────────────────', 'output-dim', 60);
            queue('  ' + payload.systems.length + ' systems surveyed.', 'output-dim', 60);
            if (payload.skipped > 0) {
              queue('  [!] ' + payload.skipped + ' system(s) skipped — insufficient power.', 'output-warn', 60);
            }
            if (ship) {
              queue('  Power core: ' + ship.powerCore.current + '/' + ship.powerCore.max + '  [' + powerStatus(ship) + ']', 'output-dim', 60);
            }
            queue('', '', 60);
            updateSidebar();
            autosave();
          }, cumulativeDelay + 200);

          return;
        }
        
        if (response && response.trim().startsWith('__DEEPSCAN__')) {
          const payload = JSON.parse(response.slice(12));
          queue('', '', 40);
          queue('  [DEEPSCAN] Initializing deep sensor sweep...', 'output-dim', 80);
          queue('  [DEEPSCAN] Targeting: ' + payload.targetName.toUpperCase(), 'output-dim', 120);
          queue('  [DEEPSCAN] Array charging — stand by.', 'output-dim', 160);
          const delay = 3000 + Math.floor(Math.random() * 3000);
          setTimeout(() => {
            payload.result.split('\n').forEach(line => queue(line, '', 40));
            const waitForDeepscan = setInterval(() => {
              if (!isPrinting && printQueue.length === 0) {
                clearInterval(waitForDeepscan);
                updateSidebar();
                autosave();
              }
            }, 100);
          }, delay);
          return;
        }
        if (response) {
          response.split('\n').forEach(line => queue(line, '', 55));
        }

        const waitForResponse = setInterval(() => {
          if (!isPrinting && printQueue.length === 0) {
            clearInterval(waitForResponse);
            updateSidebar();
            updateCombatAlert();
            autosave();
            // Update auspex on nav and where/look only
            if (cmdWord === 'nav' || cmdWord === 'where' || cmdWord === 'look') {
              updateAuspex();
            }
            const output = document.getElementById('output');
            if (output) output.scrollTop = output.scrollHeight;
          }
        }, 50);

      }, thinkTime);
    }

  } else if (e.key === 'Backspace') {
    currentInputValue = currentInputValue.slice(0, -1);
    updateTyped(currentInputValue);

  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    currentInputValue += e.key;
    updateTyped(currentInputValue);
  }
});

function updateTyped(text) {
  const el = document.getElementById('typed');
  if (el) el.textContent = text;
}

// ── Run on page load ──────────────────────────
window.addEventListener('load', () => {
  showMainMenu();
});
