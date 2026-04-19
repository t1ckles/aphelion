// ============================================
//  APHELION — Main Terminal Controller
//  main.js
//  Stage 10: Save/Load + Main Menu
// ============================================

const MASTER_SEED = '4471-KETH-NULL';
let menuDismissed = false;

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

  // Captain and ship
  setStyledText('sb-captain', playerState.captainName || '—', 'sb-white');
  setStyledText('sb-ship',    playerState.shipName    || '—', 'sb-dim');
  setText('sb-day', 'Day ' + (playerState.currentDay || 0));

  // Bars
  const hull = Math.max(0, Math.min(100, playerState.hull || 0));
  const fuel = Math.max(0, Math.min(100, playerState.fuel || 0));
  setBar('sb-hull-bar', hull, 100, 10, hull < 30 ? 'sb-orange' : 'sb-white');
  setBar('sb-fuel-bar', fuel, 100, 10, fuel < 20 ? 'sb-orange' : 'sb-green');

  // Cargo
  setStyledText('sb-credits',  (playerState.credits  || 0) + ' CR', 'sb-cyan');
  setStyledText('sb-veydrite', (playerState.veydrite || 0) + ' kg',
    playerState.veydrite > 0 ? 'sb-cyan' : 'sb-dim');

  // Location
  if (playerState.location && typeof galaxy !== 'undefined' && galaxy) {
    const loc     = playerState.location;
    const q       = galaxy.quadrants[loc.quadrantIndex];
    const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
    const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);

    setStyledText('sb-system',   sys     ? sys.name     : '—', 'sb-white');
    setStyledText('sb-cluster',  cluster ? cluster.name : '—', 'sb-dim');
    setStyledText('sb-quadrant', q       ? q.name       : '—', 'sb-dim');
    const stateClass = {
      Established: 'sb-green',
      Contested:   'sb-orange',
      Declining:   'sb-orange',
      Collapsed:   'sb-orange',
      Isolated:    'sb-cyan',
      Forbidden:   'sb-white',
    }[q.state] || 'sb-dim';
    setStyledText('sb-state', q ? '[' + q.state + ']' : '—', stateClass);
    setText('sb-docked', playerState.docked ? '⬛ ' + playerState.dockedAt : '');
  }

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
      const f = b.faction || { short: 'INDP' };
      html += '<div class="ax-cyan">' + (b.stationName || 'Unknown') + '</div>';
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

  body.innerHTML = html;
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
  const contBtn  = document.getElementById('menu-continue');
  const saveInfo = document.getElementById('menu-save-info');
  const save     = loadGame();

  if (save) {
    contBtn.style.display = 'block';
    saveInfo.innerHTML =
      save.captain.name + ' · ' + save.ship.name + '<br>' +
      'Day ' + (save.currentDay || 0) + ' · ' + save.economy.credits + ' CR<br>' +
      save.location.systemName;
  }

  document.addEventListener('keydown', menuKeyHandler);

  contBtn.addEventListener('click', () => { if (save) startContinue(save); });
  document.getElementById('menu-new').addEventListener('click', () => {
    dismissMenu();
    startNewGame();
  });
}

function menuKeyHandler(e) {
  if (menuDismissed) {
    document.removeEventListener('keydown', menuKeyHandler);
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key !== 'c' && e.key !== 'C' && e.key !== 'n' && e.key !== 'N') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  const save = loadGame();

  if (e.key === 'c' || e.key === 'C') {
    if (save) {
      document.removeEventListener('keydown', menuKeyHandler);
      e.preventDefault();
      e.stopPropagation();
      startContinue(save);
    }
  } else if (e.key === 'n' || e.key === 'N') {
    document.removeEventListener('keydown', menuKeyHandler);
    e.preventDefault();
    e.stopPropagation();
    dismissMenu();
    setTimeout(() => { startNewGame(); }, 750);
  }
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
          queue('Vessel: ' + playerState.shipName, 'output-dim', 80);
          queue('Day ' + playerState.currentDay + ' — ' + playerState.location.systemName, 'output-dim', 80);
          queueBlank(80);

          const overview = handleCommand('where');
          overview.split('\n').forEach(line => queue(line, '', 18));

          const waitForQueue = setInterval(() => {
            if (!isPrinting && printQueue.length === 0) {
              clearInterval(waitForQueue);
              enableInput('command');
              updateSidebar();
              bootAuspex(() => {});            }
          }, 100);
        });
      }
    }, 100);

  }, 400);
}

// ── New Game ──────────────────────────────────

function generateRandomSeed() {
  const words = [
    'KETH', 'VAEL', 'NULL', 'DROSS', 'OSSIAN',
    'THAL', 'GYRE', 'VEXIS', 'NARR', 'CAERN',
    'ULVAR', 'SHETH', 'AETHON', 'SOLUS', 'EREBUS'
  ];
  const numbers = Math.floor(Math.random() * 9000) + 1000;
  const word    = words[Math.floor(Math.random() * words.length)];
  const suffix  = Math.floor(Math.random() * 900) + 100;
  return numbers + '-' + word + '-' + suffix;
}

function startNewGame() {
  deleteSave();

  setTimeout(() => {
    // Just show registration — no boot sequence yet
    queue('APHELION — NEW PILOT REGISTRATION', 'output-bright', 80);
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
      updateAuspex();

      askPlayer('  Name your vessel:', (shipName) => {
        playerState.shipName = shipName || 'The Unspoken';
        print('');
        print('  Vessel registered: ' + playerState.shipName, 'output-dim');
        print('');
        updateSidebar();
        updateAuspex();

        const autoSeed = generateRandomSeed();

        askPlayer('  Galaxy seed: ' + autoSeed + '  — press Enter to accept or type your own:', (seedInput) => {
          const chosenSeed = seedInput.trim() || autoSeed;

          print('');
          print('  Seed confirmed: ' + chosenSeed, 'output-dim');
          print('');

          // NOW do the dramatic boot sequence
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
                    autosave();
                    // Boot auspex AFTER everything else is done
                    bootAuspex(() => {});                  }
                }, 100);
              });
            }
          }, 100);
        }, 600);
      });
    });
  }, 400);
}

// ── Sidebar boot sequence ─────────────────────

function bootSidebar(captainName, shipName, onComplete) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) { onComplete(); return; }

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
    () => { sidebar.classList.add('sidebar-visible'); setSidebarHtml('sb-captain', '<span class="sb-white">INITIALIZING...</span>'); },
    () => { setStyledText('sb-captain', '> PILOT RECORD', 'sb-dim'); },
    () => { setStyledText('sb-captain', '> VERIFYING...', 'sb-dim'); },
    () => { setStyledText('sb-captain', captainName, 'sb-white'); },
    () => { setStyledText('sb-ship', '> VESSEL ID...', 'sb-dim'); },
    () => { setStyledText('sb-ship', shipName, 'sb-dim'); setText('sb-day', 'Day 0'); },
    () => { setSidebarHtml('sb-hull-bar', '<span class="sb-white">CHECKING SYS...</span>'); },
    () => { setBar('sb-hull-bar', 80, 100, 10, 'sb-white'); },
    () => { setBar('sb-fuel-bar', 60, 100, 10, 'sb-green'); },
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
          print('  [NEWSAVE] Erasing save data...', 'output-dim');
          setTimeout(() => { deleteSave(); location.reload(); }, 800);
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
      setTimeout(() => {
        const response = handleCommand(raw);
        if (response === '__DEATH__') {
          showDeathScreen();
          return;
        }
        if (response) {
          response.split('\n').forEach(line => queue(line, '', 55));
        }

        const waitForResponse = setInterval(() => {
          if (!isPrinting && printQueue.length === 0) {
            clearInterval(waitForResponse);
            updateSidebar();
            updateAuspex();
            autosave();
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
