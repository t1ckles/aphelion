// ============================================
//  APHELION — Main Terminal Controller
//  main.js
//  Stage 4: Player Identity
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

// ── Input modes ───────────────────────────────
// The terminal has two modes:
// 'command' — normal play, routes to handleCommand()
// 'prompt'  — asking the player a setup question,
//             routes to a one-shot callback

let inputMode     = 'command';
let inputEnabled  = false;
let currentInput  = '';
let promptCallback = null;

function enableInput(mode = 'command') {
  inputEnabled = true;
  inputMode    = mode;
}

function askPlayer(question, callback) {
  // Wait for the queue to finish, then ask
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

    // Ask for captain name, then ship name, then launch
    askPlayer('  Enter your name, Captain:', (captainName) => {
      playerState.captainName = captainName || 'Unknown';
      print('');
      print('  Registered: ' + playerState.captainName, 'output-dim');

      askPlayer('  Name your vessel:', (shipName) => {
        playerState.shipName = shipName || 'The Unspoken';
        print('');
        print('  Vessel registered: ' + playerState.shipName, 'output-dim');
        print('');

        // Small dramatic pause then launch
        setTimeout(() => {
          queueDivider(60);
          queue('REGISTRATION COMPLETE — GALAXY ACCESS GRANTED', 'output-label', 80);
          queueDivider(60);
          queueBlank(80);

          // Initialize galaxy
          initCommands(MASTER_SEED);
          const overview = handleCommand('galaxy');
          overview.split('\n').forEach(line => queue(line, '', 12));

          // Enable normal command mode after queue finishes
          const waitForQueue = setInterval(() => {
            if (!isPrinting && printQueue.length === 0) {
              clearInterval(waitForQueue);
              enableInput('command');
            }
          }, 100);

        }, 800);
      });
    });

  }, 1400);
}

// ── Input handling ────────────────────────────

let currentInputValue = '';

document.addEventListener('keydown', (e) => {
  if (!inputEnabled) return;

  if (e.key === 'Enter') {
    const raw = currentInputValue.trim();
    currentInputValue = '';
    updateTyped('');

    if (inputMode === 'prompt') {
      // One-shot — disable input, fire callback
      inputEnabled = false;
      inputMode    = 'command';
      const cb     = promptCallback;
      promptCallback = null;
      if (cb) cb(raw);

    } else {
      // Normal command mode
      if (raw === '') return;
      print('> ' + raw, 'output-cmd');
      const response = handleCommand(raw);
      if (response) {
        response.split('\n').forEach(line => print(line));
      }
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
