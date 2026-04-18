// ============================================
//  APHELION — Main Terminal Controller
//  main.js
//
//  Drives the terminal UI and connects
//  all engine systems together.
//
//  Depends on: rng.js, naming.js
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

function printBlank() {
  print('');
}

function printDivider() {
  print('─'.repeat(58), 'output-dim');
}

// ── Typewriter engine ─────────────────────────
// Queues lines and prints them one at a time
// with a delay between each, like a real terminal.

const printQueue = [];
let   isPrinting = false;

function queue(text, style = '', delay = 38) {
  printQueue.push({ text, style, delay });
  if (!isPrinting) processQueue();
}

function queueBlank(delay = 38) {
  queue('', '', delay);
}

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

// ── Boot sequence ─────────────────────────────

function boot() {
  const MASTER_SEED = '4471-KETH-NULL';
  const rng         = new RNG(MASTER_SEED);

  // Power-on pause — let the CRT warm up first
  setTimeout(() => {

    queue('INITIALIZING — APHELION DEEP SURVEY TERMINAL', 'output-bright', 80);
    queue(`MASTER SEED: ${MASTER_SEED}`, 'output-dim', 120);
    queueBlank(80);
    queue('> Loading naming systems...', 'output-dim', 200);
    queue('> History engine standing by...', 'output-dim', 280);
    queue('> Guild network: CONNECTED', 'output-dim', 180);
    queueBlank(120);
    queueDivider(60);
    queue('SECTOR SURVEY — PROOF OF CONCEPT', 'output-label', 80);
    queue('Generating sample galaxy data from seed...', 'output-dim', 300);
    queueDivider(60);
    queueBlank(200);

    // ── Star system ───────────────────────────
    const systemRNG  = rng.derive('system-demo');
    const eraOptions = ['ancient', 'ancient', 'transitional', 'modern'];
    const era        = systemRNG.pick(eraOptions);
    const systemName = Naming.starSystem(systemRNG, era);

    queue('STAR SYSTEM', 'output-label', 80);
    queue(`  Designation  : ${systemName}`, '', 60);
    queue(`  Era stamp    : ${era.toUpperCase()}`, '', 60);
    queueBlank(100);

    // ── Station ───────────────────────────────
    const stationRNG  = rng.derive('station-demo');
    const stationName = Naming.station(stationRNG, era);

    queue('PRIMARY STATION', 'output-label', 80);
    queue(`  Designation  : ${stationName}`, '', 60);
    queueBlank(100);

    // ── Characters ────────────────────────────
    queue('REGISTERED PERSONNEL (SAMPLE)', 'output-label', 80);

    const charTypes = [
      { gender: 'masculine', callsign: true  },
      { gender: 'feminine',  callsign: false },
      { gender: 'any',       callsign: true  },
    ];

    charTypes.forEach((type, i) => {
      const charRNG = rng.derive(`char-demo-${i}`);
      const name    = Naming.person(charRNG, type.gender, type.callsign);
      queue(`  ${name}`, '', 80);
    });

    queueBlank(100);

    // ── Ships ─────────────────────────────────
    queue('VESSEL REGISTRY (SAMPLE)', 'output-label', 80);

    for (let i = 0; i < 2; i++) {
      const shipRNG  = rng.derive(`ship-demo-${i}`);
      const shipName = Naming.ship(shipRNG);
      queue(`  ${shipName}`, '', 80);
    }

    queueBlank(100);

    // ── Corporations ──────────────────────────
    queue('CORPORATE REGISTRY (SAMPLE)', 'output-label', 80);

    for (let i = 0; i < 2; i++) {
      const corpRNG  = rng.derive(`corp-demo-${i}`);
      const corpName = Naming.corporation(corpRNG);
      queue(`  ${corpName}`, '', 80);
    }

    queueBlank(100);

    // ── Frontier world ────────────────────────
    queue('FRONTIER BODY (SAMPLE)', 'output-label', 80);
    const worldRNG  = rng.derive('world-demo');
    const worldName = Naming.harshWorld(worldRNG);
    queue(`  ${worldName}`, '', 80);

    queueBlank(120);
    queueDivider(60);
    queue('END OF SURVEY DATA', 'output-dim', 80);
    queue('Seed is stable. All output is deterministic.', 'output-dim', 80);
    queueDivider(60);

  }, 1400); // Wait for CRT power-on animation to finish
}

// ── Run on page load ──────────────────────────
window.addEventListener('load', boot);