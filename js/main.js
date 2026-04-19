// ============================================
//  APHELION — Main Terminal Controller
//  main.js
//  Stage 7: Sidebar status panel
// ============================================

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

// ── Sidebar ───────────────────────────────────

function updateSidebar() {
  if (typeof playerState === 'undefined' || !playerState) return;

  // Vessel
  setText('sb-captain', playerState.captainName || '—');
  setText('sb-ship',    playerState.shipName    || '—');
  setText('sb-day',     'Day ' + (playerState.currentDay || 0));

  // Bars
  const hull = Math.max(0, Math.min(100, playerState.hull || 0));
  const fuel = Math.max(0, Math.min(100, playerState.fuel || 0));
  setBar('sb-hull-bar', hull, 100, 10);
  setBar('sb-fuel-bar', fuel, 100, 10);

  // Cargo
  setText('sb-credits',  (playerState.credits  || 0) + ' CR');
  setText('sb-veydrite', (playerState.veydrite || 0) + ' kg');

  // Location
  if (playerState.location && typeof galaxy !== 'undefined' && galaxy) {
    const loc     = playerState.location;
    const q       = galaxy.quadrants[loc.quadrantIndex];
    const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
    const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);

    setText('sb-system',   sys     ? sys.name     : '—');
    setText('sb-cluster',  cluster ? cluster.name : '—');
    setText('sb-quadrant', q       ? q.name       : '—');
    setText('sb-state',    q       ? '[' + q.state + ']' : '—');
    setText('sb-docked',   playerState.docked
      ? '⬛ ' + playerState.dockedAt
      : '');
  }

  // Contract
  const active = typeof activeContracts !== 'undefined'
    ? activeContracts.find(c => !c.completed && !c.failed)
    : null;

  if (active) {
    const daysLeft = active.timeLimitDays - (playerState.currentDay - active.issuedDay);
    const urgent   = daysLeft <= 2 ? ' (!)' : '';
    setSidebarHtml('sb-contract',
      '<div class="sidebar-value">' + active.title + '</div>' +
      '<div class="sidebar-dim">→ ' + active.target + '</div>' +
      '<div class="' + (daysLeft <= 2 ? 'sidebar-warn' : 'sidebar-dim') + '">' +
        daysLeft + ' days left' + urgent +
      '</div>'
    );
  } else {
    setText('sb-contract', 'none active');
  }

  // Reputation
  if (typeof reputation !== 'undefined') {
    const keys    = Object.keys(reputation);
    if (keys.length === 0) {
      setText('sb-rep', 'no contacts');
    } else {
      let html = '';
      keys.forEach(key => {
        const score   = reputation[key];
        const tier    = repTier(score);
        const faction = FACTION_REGISTRY[key];
        if (!faction) return;
        const scoreStr = (score >= 0 ? '+' : '') + score;
        const cls = tier === 'HOSTILE' ? 'sidebar-warn'
                  : tier === 'TRUSTED' ? 'sidebar-value'
                  : 'sidebar-dim';
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

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setSidebarHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setBar(id, value, max, width) {
  const el = document.getElementById(id);
  if (!el) return;
  const filled = Math.round((value / max) * width);
  const empty  = width - filled;
  el.textContent = '█'.repeat(filled) + '░'.repeat(empty) + ' ' + value + '%';
}

// ── Sidebar boot sequence ─────────────────────

function bootSidebar(captainName, shipName, onComplete) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) { onComplete(); return; }

  // Clear everything first
  setText('sb-captain', '');
  setText('sb-ship', '');
  setText('sb-day', '');
  setText('sb-system', '');
  setText('sb-cluster', '');
  setText('sb-quadrant', '');
  setText('sb-state', '');
  setText('sb-docked', '');
  setText('sb-credits', '');
  setText('sb-veydrite', '');
  setText('sb-contract', '');
  setText('sb-rep', '');
  setText('sb-hull-bar', '');
  setText('sb-fuel-bar', '');

  const steps = [
    () => { sidebar.style.visibility = 'visible'; sidebar.style.opacity = '1'; setSidebarHtml('sb-captain', '<span style="color:#ffffff">INITIALIZING...</span>'); },
    () => { setText('sb-captain', '> PILOT RECORD'); },
    () => { setText('sb-captain', '> VERIFYING...'); },
    () => { setText('sb-captain', captainName); },
    () => { setText('sb-ship', '> VESSEL ID...'); },
    () => { setText('sb-ship', shipName); setText('sb-day', 'Day 0'); },
    () => { setSidebarHtml('sb-hull-bar', '<span style="color:#ffffff">CHECKING SYS...</span>'); },
    () => { setBar('sb-hull-bar', 80, 100, 10); },
    () => { setBar('sb-fuel-bar', 60, 100, 10); },
    () => { setText('sb-credits', '200 CR'); setText('sb-veydrite', '0 kg'); },
    () => { setText('sb-system', '> LOCATING...'); },
    () => { setText('sb-contract', 'none active'); setText('sb-rep', 'no contacts'); },
    () => { updateSidebar(); },
    () => { onComplete(); },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval);
      return;
    }
    steps[i]();
    i++;
  }, 200);
}

// ── Boot sequence ─────────────────────────────

function boot() {
  const MASTER_SEED = '4471-KETH-NULL';

  setTimeout(() => {

    queue('INITIALIZING — APHELION DEEP SURVEY TERMINAL', 'output-bright', 80);
    queue('MASTER SEED: ' + MASTER_SEED, 'output-dim', 120);
    queueBlank(80);
    queue('> Loading naming systems...', 'output-dim', 200);
    queue('> History engine standing by...', 'output-dim', 280);
    queue('> Guild network: CONNECTED', 'output-dim', 180);
    queueBlank(120);
    queueDivider(60);
    queue('NEW PILOT REGISTRATION', 'output-label', 80);
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

        setTimeout(() => {
          queueDivider(60);
          queue('REGISTRATION COMPLETE — GALAXY ACCESS GRANTED', 'output-label', 80);
          queueDivider(60);
          queueBlank(80);

          initCommands(MASTER_SEED);

          const waitForPrint = setInterval(() => {
            if (!isPrinting && printQueue.length === 0) {
              clearInterval(waitForPrint);
              bootSidebar(playerState.captainName, playerState.shipName, () => {
                updateSidebar();
                const overview = handleCommand('galaxy');
                overview.split('\n').forEach(line => queue(line, '', 12));

                const waitForQueue = setInterval(() => {
                  if (!isPrinting && printQueue.length === 0) {
                    clearInterval(waitForQueue);
                    enableInput('command');
                    updateSidebar();
                  }
                }, 100);
              });
            }
          }, 100);
        }, 800);
      });
    });
  }, 1400);
}

// ── Input handling ────────────────────────────

let inputMode      = 'command';
let inputEnabled   = false;
let currentInputValue = '';
let promptCallback = null;

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

      const response = handleCommand(raw);
      if (response) {
        response.split('\n').forEach(line => print(line));
      }

      updateSidebar();

      const output = document.getElementById('output');
      if (output) output.scrollTop = output.scrollHeight;
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
window.addEventListener('load', boot);
