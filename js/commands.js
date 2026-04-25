// ============================================
//  APHELION — Command Parser
//  commands.js
//  System B: Ship object, weapons, power
// ============================================

let galaxy = null;

// ── Faction definitions ───────────────────────

const FACTIONS = {
  guild: {
    name: 'The Assayer\'s Guild',
    short: 'GUILD',
    attitude: 'neutral',
    dockGreeting: 'Guild rates apply. Veydrite assessment available on request.',
  },
  pelk: {
    name: 'Pelk Logistics',
    short: 'PELK',
    attitude: 'commercial',
    dockGreeting: 'Pelk Logistics welcomes registered vessels. Fuel and cargo exchange available.',
  },
  colonial: {
    name: 'Colonial Colonies Command',
    short: 'CCC',
    attitude: 'military',
    dockGreeting: 'CCC installation. Civilian vessels permitted. Do not photograph the array.',
  },
  feral: {
    name: 'Feral Settlement',
    short: 'FERAL',
    attitude: 'hostile',
    dockGreeting: 'No formal docking authority. Someone will approach your hull. Keep weapons cold.',
  },
  independent: {
    name: 'Independent',
    short: 'INDP',
    attitude: 'neutral',
    dockGreeting: 'No affiliation on record. Berth fees negotiated on arrival.',
  },
  forbidden: {
    name: 'Unknown Authority',
    short: '????',
    attitude: 'unknown',
    dockGreeting: 'No response on standard frequencies. Your transponder has been logged.',
  },
};

// ── Combat Engine ─────────────────────────────

const ENCOUNTER_RATES = {
  Established: 0.01,
  Contested:   0.04,
  Declining:   0.06,
  Collapsed:   0.10,
  Isolated:    0.03,
  Forbidden:   0.08,
};

const ATTACKER_TYPES = {
  feral: {
    name:     'Feral Raiders',
    short:    'FERAL',
    want:     'cargo',
    threat:   3,
    openings: [
      'Three vessels decloak off your port bow. No transponder. No hail. They are already in weapons range.',
      'A salvage hauler — or something wearing its hull — drops out of the debris field and locks onto you.',
      'They don\'t broadcast a demand. They just start closing. Feral. Hungry.',
    ],
  },
  pirate: {
    name:     'Unregistered Vessel',
    short:    'PIRATE',
    want:     'scrip',
    threat:   2,
    openings: [
      'A single ship, running dark, drops in behind you. Hail incoming: "Cut your drive or we cut it for you."',
      'Pirate intercept. They\'ve been waiting here. The ambush is clean — someone knew your route.',
      '"Captain. Nice ship. Nicer cargo. Let\'s talk numbers." The targeting lock says the talking is optional.',
    ],
  },
  hostile_faction: {
    name:     'Faction Patrol',
    short:    'PATROL',
    want:     'expulsion',
    threat:   4,
    openings: [
      'A patrol vessel hails you on the Guild frequency. The voice is not Guild. "You are not welcome here, Captain."',
      'Two armed transports fall into escort formation — one ahead, one behind. You are being herded.',
      'The station locks your docking codes remotely. A patrol decouples from the ring and burns toward you.',
    ],
  },
  unknown: {
    name:     'Unknown Contact',
    short:    '????',
    want:     'unknown',
    threat:   5,
    openings: [
      'Something is on your sensors. It is not broadcasting. It is not moving. It is getting closer.',
      'The Auspex returns a contact. The contact has no hull signature on record. It is very large.',
      'Your drive cuts out for 4.2 seconds. When it restarts, there is something between you and the jump point.',
    ],
  },
};

function rollEncounter(sys, q, playerState, blindJump) {
  let rate = ENCOUNTER_RATES[q.state] || 0.05;
  if (blindJump) rate += 0.05;

  const stationFactions = sys.bodies
    .filter(b => b.hasStation && b.factionKey)
    .map(b => b.factionKey);

  stationFactions.forEach(fk => {
    const rep = getRep(fk);
    if (rep !== null && repTier(rep) === 'HOSTILE') rate += 0.15;
  });

  if (Math.random() > rate) return null;

  let attackerKey = 'feral';
  if (sys.xenoTainted && Math.random() < 0.3) {
    attackerKey = 'unknown';
  } else if (stationFactions.some(fk => {
    const rep = getRep(fk);
    return rep !== null && repTier(rep) === 'HOSTILE';
  })) {
    attackerKey = 'hostile_faction';
  } else if (q.state === 'Collapsed' || q.state === 'Declining') {
    attackerKey = Math.random() < 0.6 ? 'feral' : 'pirate';
  } else {
    attackerKey = Math.random() < 0.5 ? 'pirate' : 'feral';
  }

  const attacker = ATTACKER_TYPES[attackerKey];
  const opening  = attacker.openings[Math.floor(Math.random() * attacker.openings.length)];

  return {
    attackerKey,
    attacker,
    openingLine: opening,
    resolved:    false,
  };
}

// ── Faction assignment ────────────────────────

function assignFaction(state, rng) {
  const pools = {
    Established: ['guild', 'pelk', 'colonial', 'pelk', 'guild'],
    Contested:   ['pelk', 'colonial', 'independent', 'feral', 'pelk'],
    Declining:   ['independent', 'pelk', 'feral', 'independent'],
    Collapsed:   ['feral', 'feral', 'independent', 'feral'],
    Isolated:    ['independent', 'independent', 'feral'],
    Forbidden:   ['forbidden', 'forbidden', 'forbidden'],
  };
  const pool = pools[state] || ['independent'];
  return pool[Math.floor(rng.next() * pool.length)];
}

// ── Station name generator ────────────────────

function generateStationName(systemName, factionKey, index, rng) {
  const prefixes = {
    guild: ["Assay Point", "Survey Station", "Guild Relay", "Assessment Post"],
    pelk: ["Pelk Depot", "Transit Hub", "Pelk Waystation", "Logistics Post"],
    colonial: ["CCC Outpost", "Colonial Station", "Forward Base", "CCC Relay"],
    feral: ["The Hulk", "Scratch Station", "The Nail", "Drift Post"],
    independent: ["Free Berth", "Open Dock", "The Anchorage", "Waypoint"],
    forbidden: ["Installation", "Unknown Station", "Sealed Platform"]
  };

  const suffixes = ["Alpha", "Beta", "Prime", "Secondary", "Auxiliary", "I", "II", "III", "IV", "V"];
  const pool = prefixes[factionKey] || prefixes.independent;
  const roll = rng && typeof rng.next === "number" ? rng.next : Math.random();
  const prefix = pool[Math.floor(roll * pool.length)];
  const tag = String(systemName || "Station").split(" ")[0];
  const suffix = index > 0 ? suffixes[Math.min(index, suffixes.length - 1)] : "";

  return [prefix, tag, suffix].filter(Boolean).join(" ");
}

// ── Ship initialization ───────────────────────

function createStartingShip(shipName) {
  const ship = {
    name:        shipName || 'The Unspoken',
    class:       'surveyor',
    size:        'light',
    designation: 'Light Surveyor',

    hull:        100,
    hullMax:     100,
    armorBase:   10,

    powerCore: {
      current:            0,
      max:                500,
      recharge:           3,
      rechargeActive:     8,
      emergencyThreshold: 10,
    },

    fuel:    60,
    fuelMax: 100,

    ammoBayMax:  200,
    ammoBayUsed: 5,

    crewMax:     4,
    crewCurrent: 1,

    subsystems: {
      hull_core:     { name: 'Hull Core',     hp: 100, hpMax: 100, arm: 20, sta: 100, staMax: 100 },
      power_core:    { name: 'Power Core',    hp:  80, hpMax:  80, arm: 15, sta:  80, staMax:  80 },
      drive:         { name: 'Drive',         hp:  80, hpMax:  80, arm: 10, sta:  80, staMax:  80 },
      weapons_array: { name: 'Weapons Array', hp:  60, hpMax:  60, arm: 15, sta:  60, staMax:  60 },
      sensor_suite:  { name: 'Sensor Suite',  hp:  40, hpMax:  40, arm:  5, sta:  40, staMax:  40 },
      cargo_hold:    { name: 'Cargo Hold',    hp:  70, hpMax:  70, arm:  5, sta:  70, staMax:  70 },
      life_support:  { name: 'Life Support',  hp:  50, hpMax:  50, arm:  5, sta:  50, staMax:  50 },
      crew_quarters: { name: 'Crew Quarters', hp:  40, hpMax:  40, arm:  0, sta:  40, staMax:  40 },
      galley:        { name: 'Galley',        hp:  30, hpMax:  30, arm:  0, sta:  30, staMax:  30 },
    },

    weaponSlots: [
      {
        id: 1, name: 'PDT-4 Point Defense Turret',
        type: 'autoturret', condition: 80, conditionMax: 100,
        active: true, ammo: { AP: 50 }, activeAmmo: 'AP',
        massPerRound: { AP: 0.1 }, burstMin: 4, burstMax: 8, powerPerBurst: 5,
      },
      {
        id: 2, name: null, type: null, condition: null,
        conditionMax: null, active: false, ammo: {}, activeAmmo: null, massPerRound: {},
      },
    ],

    utilitySlots: [
      {
        id: 1, name: 'Harrow-7 Salvage Head', type: 'salvage_cutter',
        condition: 100, conditionMax: 100, active: true, powerCost: 30,
      },
    ],
  };

  // Initialize power core to 70-85%
  initPowerCore(ship);
  return ship;
}


function normalizeSystemBodies(sys) {
  if (!sys) return [];
  if (typeof getSystemBodyIndex === 'function') return getSystemBodyIndex(sys);
  if (sys.bodyIndex) return sys.bodyIndex;
  if (sys.bodyTree) {
    const flat = [];
    sys.bodyTree.forEach(body => {
      flat.push(body);
      (body.children || []).forEach(child => flat.push(child));
    });
    sys.bodyIndex = flat;
    sys.bodies = flat;
    return flat;
  }
  return sys.bodies || [];
}

function findBodyByName(sys, query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return null;
  const bodies = normalizeSystemBodies(sys);
  return bodies.find(b => String(b.name || b.shortName || b.type || '').toLowerCase() === q)
    || bodies.find(b => String(b.name || '').toLowerCase().includes(q))
    || bodies.find(b => String(b.shortName || b.type || '').toLowerCase().includes(q));
}

function getCurrentBody(sys) {
  const bodies = normalizeSystemBodies(sys);
  if (!playerState.location) return bodies[0] || null;
  if (playerState.location.bodyId) {
    const match = bodies.find(b => b.id === playerState.location.bodyId);
    if (match) return match;
  }
  return bodies[0] || null;
}

function getBodyDisplayIndex(body, fallback = '?') {
  if (!body) return fallback;
  if (body.index !== undefined && body.index !== null) return body.index;
  if (body.ordinal !== undefined && body.ordinal !== null) return body.ordinal;
  if (body.localIndex !== undefined && body.localIndex !== null) return body.localIndex;
  return fallback;
}

function getBodyKindLabel(body) {
  if (!body) return 'BODY';
  if (body.kind) return String(body.kind).toUpperCase();
  const type = String(body.type || body.baseType || '').toLowerCase();
  if (type.includes('moon')) return 'MOON';
  if (type.includes('lagrange')) return 'LAGRANGE';
  if (type.includes('belt') || type.includes('field')) return 'FIELD';
  return 'BODY';
}

function formatBodyDisplayName(body) {
  if (!body) return '';
  const label = body.type || body.baseType || body.kind || 'Unknown Body';
  const proper = body.properName || body.displayName || body.shortName || body.name;
  if (proper && proper !== label && !String(proper).startsWith(label + ' (')) {
    return label + ' (<span class="body-name">' + proper + '</span>)';
  }
  return label;
}

function formatBodyLine(body) {
  const indent = body.depth === 0 ? '' : '    ';
  const label = getBodyKindLabel(body);
  const tags = [];
  if (body.hasStation) tags.push('station');
  if (body.hasRuin) tags.push('ruin');
  if (body.veydrite) tags.push('veydrite');
  return indent + '[' + getBodyDisplayIndex(body) + '] ' + formatBodyDisplayName(body) + '  —  ' + label + (tags.length ? '  [' + tags.join(' | ') + ']' : '');
}

function updateLocationBody(sys, body) {
  playerState.location.bodyId = body ? body.id : null;
  playerState.location.bodyName = body ? (body.name || body.type) : null;
  playerState.location.bodyKind = body ? body.kind : null;
  playerState.location.locationType = body ? body.kind : 'system';
  return playerState.location;
}

function bodyTravelHours(fromBody, toBody) {
  if (!fromBody || !toBody || fromBody.id === toBody.id) return 0;
  const pair = [fromBody.kind, toBody.kind].sort().join(':');
  const table = {
    'lagrange:planet': 5,
    'moon:planet': 4,
    'field:planet': 7,
    'field:moon': 6,
    'lagrange:moon': 3,
    'lagrange:field': 4,
    'moon:moon': 5,
    'planet:planet': 8,
    'field:field': 6,
    'lagrange:lagrange': 2,
  };
  return table[pair] || 6;
}

// ── Player State ──────────────────────────────
let playerState = {
  location:         null,
  cargo:            [],
  oreHold:          {},
  refinedHold:      {},
  orePods:          { solid: 0, liquid: 0 },
  salvagedSystems:  [],
  astrographics:    [],
  visitedSystems:   {},
  scannedSystems:   {},
  credits:          200,
  veydrite:         0,
  foldCells:        3,
  reserveVeydrite:  0,
  ship:             null,
  captainName:      'Unknown',
  galaxySeed:       '4471-KETH-NULL',
  docked:           false,
  dockedAt:         null,
  dockedFactionKey: null,
  inTrade:          false,
  inArmory:         false,
  inShipyard:       false,
  pendingTx:        null,
  pendingMenu:      false,
  currentDay:       0,
  bulletinContracts: [],
  logs:             [],
  flags:            {},
  stats:            { jumps: 0, salvages: 0, daysSurvived: 0, creditsEarned: 0, contractsCompleted: 0, veydriteSold: 0 },
  achievements:     [],
  inShipyard:       false,
  inEncounter:      false,
  encounter:        null,
  isDead:           false,
  deathCause:       '',
  currentCompartment: 'bridge',
};

// ── Init ──────────────────────────────────────

function initCommands(seed) {
  playerState.galaxySeed = seed;

  // Only generate the galaxy once per run/load.
  if (!galaxy) {
    galaxy = generateGalaxy(seed, Naming);

    // Use seeded RNG for station generation so stations are always the same
    const stationRng = new RNG(RNG.hashSeed(seed + '-stations'));

    galaxy.quadrants.forEach(q => {
      q.clusters.forEach(cluster => {
        cluster.systems.forEach(sys => {
          let stationIndex = 0;
          sys.bodies.forEach(body => {
            if (body.hasStation) {
              body.factionKey = body.factionKey || assignFaction(q.state, stationRng);
              body.faction = body.faction || FACTIONS[body.factionKey] || FACTIONS.independent;
              body.stationName = body.stationName || generateStationName(sys.name, body.factionKey, stationIndex, stationRng);
              body.hasRefinery = (body.hasRefinery !== undefined) ? body.hasRefinery : hasRefinery(body.factionKey);
              body.refineryGrade = body.refineryGrade || refineryGrade(body.factionKey);
              body.yieldShare = (body.yieldShare !== undefined)
                ? body.yieldShare
                : (body.hasRefinery ? refineryYieldShare(body.factionKey, stationRng) : null);
              stationIndex++;
            }
          });
        });
      });
    });
  }

  // Initialize ship if not already set
  if (!playerState.ship) {
    playerState.ship = createStartingShip(playerState.shipName || 'The Unspoken');
  }

  // Only set a default location if one does not already exist
  if (!playerState.location) {
    const q0      = galaxy.quadrants[0];
    const cluster = q0.clusters[0];
    const system  = cluster.systems.find(s => s.isAnchor) ?? cluster.systems[0];

    playerState.location = {
      quadrantIndex: 0,
      clusterName: cluster.name,
      systemName: system.name,
    };
  }
}

// ── Helpers ───────────────────────────────────

function getShip() { return playerState.ship; }

function getHull()  { return playerState.ship ? playerState.ship.hull  : 0; }
function getFuel()  { return playerState.ship ? playerState.ship.fuel  : 0; }
function getPower() { return playerState.ship ? playerState.ship.powerCore.current : 0; }

function damagHull(amount) {
  if (!playerState.ship) return;
  playerState.ship.hull = Math.max(0, playerState.ship.hull - amount);
}

function useFuel(amount) {
  if (!playerState.ship) return;
  playerState.ship.fuel = Math.max(0, playerState.ship.fuel - amount);
}

function getCurrentSystem() {
  if (!playerState.location) return null;
  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  return cluster && cluster.systems.find(s => s.name === loc.systemName);
}

// ── Dispatch ──────────────────────────────────

function handleCommand(raw) {
    const input          = raw.trim().toLowerCase();
    const [cmd, ...args] = input.split(/\s+/);
    if (playerState.inTrade)     return handleTradeCommand(cmd, args);
    if (playerState.inArmory)    return handleArmoryCommand(cmd, args);
    if (playerState.inShipyard) return handleShipyardCommand(cmd, args);
    if (playerState.inEncounter) return handleEncounterCommand(cmd, args);
    if (playerState.pendingFold) {
      if (cmd === 'yes' || cmd === 'y') {
        const fold = playerState.pendingFold;
        playerState.pendingFold = null;
        return '__FOLD__' + JSON.stringify(fold);
      } else {
        playerState.pendingFold = null;
        return '  [FOLD] Fold sequence cancelled.';
      }
    }
    if (playerState.pendingTx) {
      if (cmd === 'yes' || cmd === 'y') {
        const tx = playerState.pendingTx;
        playerState.pendingTx = null;
        return executeTrade(tx);
      } else {
        playerState.pendingTx = null;
        return '  [TRADE] Transaction cancelled.';
      }
    }
    
    switch (cmd) {
    case 'help':      return cmdHelp();
    case 'shipyard':  return cmdShipyard(args);
    case 'galaxy':    return renderGalaxyOverview(galaxy, playerState.location ? playerState.location.quadrantIndex : 0);
    case 'map':       return renderFoldMap(galaxy, playerState.location.quadrantIndex);
    case 'fold':      return cmdFold(args);
    case 'blindfold': return cmdBlindFold(args);
    case 'emergency': return cmdEmergencyRefine(args);
    case 'scan':      return cmdScan(args);
    case 'nav':       return cmdNav(args);
    case 'jump':      return cmdJump(args);
    case 'where':
    case 'look':      return cmdWhere();
    case 'move':      return cmdMove(args);
    case 'area':       return cmdArea();
    case 'system':    return cmdSystem();
    case 'dock':      return cmdDock();
    case 'undock':    return cmdUndock();
    case 'trade':     return cmdTrade(args);
    case 'sell':      return cmdSell(args);
    case 'buy':       return cmdBuy(args);
    case 'repair':    return cmdRepair(args);
    case 'armory':    return cmdArmory(args);
    case 'install':   return cmdInstall(args);
    case 'uninstall': return cmdUninstall(args);
    case 'salvage':   return cmdSalvage();
    case 'survey':    return cmdSurvey(args);
    case 'mine':      return cmdMine(args);
    case 'refine':    return cmdRefine(args);
    case 'rep':       return cmdRep();
    case 'bulletin':  return cmdBulletin();
    case 'accept':    return cmdAccept(args);
    case 'contract':  return cmdContract();
    case 'complete':  return cmdComplete();
    case 'abandon':   return cmdAbandon();
    case 'ping':      return cmdPing();
    case 'resolve':   return cmdResolve(args);
    case 'deepscan':       return cmdDeepscan(args);
    case 'clusterdeepscan': return cmdClusterDeepscan(args);
    case 'charts':         return cmdCharts(args);
    case 'record':         return cmdRecord();
    case 'status':    return cmdStatus();
    case 'weapons':   return cmdWeapons();
    case 'systems':   return cmdSystems();
    case 'logs':      return cmdLogs();
    case 'save':      return cmdSave();
    case 'newsave':   return cmdNewSave();
    case 'menu':      return cmdMenu();
    case 'evade':
    case 'negotiate':
    case 'fight':
    case 'yield':     return '  [ENCOUNTER] No active encounter.';
    case '':          return '';
    default:          return '  [UNKNOWN] "' + cmd + '" is not a recognized command. Type help.';
  }
}

// ── Help ──────────────────────────────────────

function cmdHelp() {
  return [
    '',
    '  ── NAVIGATION ────────────────────────────────────────────────',
    '',
    '  galaxy                    — known quadrant index',
    '  map                       — fold corridor map',
    '  area                      — current compartment status and available commands',
    '  scan <1-42>               — survey a quadrant',
    '  where                     — current position / local body stack',
    '  system                    — full current system survey',
    '  nav <system or body>      — calculated transit within quadrant',
    '  jump <system name>        — blind jump within cluster',
    '  fold <quadrant name>      — fold to connected quadrant',
    '  blindfold <quadrant name> — overdrive fold, any quadrant (12 cells)',
    '  emergency refine <n>      — convert reserve veydrite to fold cells',
    '',
    '  ── SENSORS ───────────────────────────────────────────────────',
    '',
    '  ping                — gravimetric sweep',
    '  resolve <number>    — resolve a specific contact',
    '  resolve all         — resolve all contacts',
    '  deepscan <system>         — full astrographic survey',
    '  clusterdeepscan <cluster> — survey all systems in a cluster',
    '  charts                    — view astrographic records',
    '',
    '  ── STATION ───────────────────────────────────────────────────',
    '',
    '  dock                — dock at nearest station',
    '  undock              — leave station',
    '  trade               — open trade terminal',
    '  shipyard            — browse available hulls for purchase',
    '  shipyard info <#>   — full spec sheet for a hull',
    '  shipyard buy <#>    — purchase a new hull',
    '  repair              — repair hull or weapons',
    '  buy tool            — purchase utility tool (Harrow-7 or Auger-1)',
    '  bulletin            — view available contracts',
    '  accept <number>     — accept a contract',
    '  armory              — browse weapons and ammo',
    '  install <slot> <n>  — install cargo weapon into slot',
    '  uninstall <slot>    — move weapon to cargo',
    '',
    '  ── FIELD ─────────────────────────────────────────────────────',
    '',
    '  salvage             — salvage operation',
    '  contract            — view active contract',
    '  complete            — complete active contract',
    '  abandon             — abandon active contract',
    '',
    '  ── SHIP ──────────────────────────────────────────────────────',
    '',
    '  weapons             — weapon and ammo status',
    '  systems             — subsystem status',
    '  status              — full ship status',
    '',
    '  ── GENERAL ───────────────────────────────────────────────────',
    '',
    '  rep                 — faction standing',
    '  logs                — recovered records',
    '  record              — guild record archive',
    '  menu                — return to main menu',
    '',
  ].join('\n');
}

// ── Scan ──────────────────────────────────────

function cmdScan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return renderGalaxyOverview(galaxy);
  if (args[0] === 'log') return cmdScanLog();
  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0 || index >= galaxy.quadrants.length) {
    return '  [ERROR] Invalid quadrant. Use scan <1-8>.';
  }
  return renderQuadrantDetail(galaxy, index, playerState.scannedSystems);}

function cmdScanLog() {
  const sys = getCurrentSystem();
  if (!sys) return '  [ERROR] Location data corrupted.';
  const bodies = normalizeSystemBodies(sys);
  const hasRuin = bodies.some(b => b.hasRuin);
  if (!hasRuin) {
    return ['', '  [SCAN] No ruin sites in this system.', '  Nothing to read.', ''].join('\n');
  }
  const log = rollRuinLog(sys);
  playerState.logs.push({ type: 'log', system: sys.name, text: log });
  return [
    '',
    '  ── RUIN LOG FRAGMENT ─────────────────────────────────────────',
    '',
    '  [RECOVERED FROM: ' + sys.name + ']',
    '',
    '  ' + log,
    '',
  ].join('\n');
}

// ── Nav ───────────────────────────────────────

function cmdNav(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] nav <system or body name>';
  if (playerState.docked) return '  [NAV] You are docked. Type "undock" first.';

  const ship = getShip();
  const query = args.join(' ').trim().toLowerCase();
  let targetQuadrant = null;
  let targetCluster = null;
  let targetSys = null;
  let targetBody = null;

  if (currentContacts && playerState.location) {
    contactCache[playerState.location.systemName] = currentContacts;
  }
  currentContacts = null;
  playerState.salvagedSystems = [];

  for (let qi = 0; qi < galaxy.quadrants.length; qi++) {
    const q = galaxy.quadrants[qi];
    for (let ci = 0; ci < q.clusters.length; ci++) {
      const cluster = q.clusters[ci];
      for (const sys of cluster.systems) {
        if (sys.name.toLowerCase() === query || sys.name.toLowerCase().includes(query)) {
          targetQuadrant = q;
          targetCluster = cluster;
          targetSys = sys;
          targetBody = normalizeSystemBodies(sys)[0] || null;
          break;
        }
        const bodyMatch = findBodyByName(sys, query);
        if (bodyMatch) {
          targetQuadrant = q;
          targetCluster = cluster;
          targetSys = sys;
          targetBody = bodyMatch;
          break;
        }
      }
      if (targetSys) break;
    }
    if (targetSys) break;
  }

  if (!targetSys) {
    return [
      '',
      '  [NAV] Destination not found.',
      '  Use a known system name or a surveyed body name.',
      '',
    ].join('\n');
  }

  const fuelCost = 8 + Math.floor(Math.random() * 8);
  if (ship.fuel < fuelCost) {
    return [
      '',
      '  [NAV] Insufficient fuel for transit to ' + targetSys.name + '.',
      '  Required: ' + fuelCost + ' units  |  Available: ' + ship.fuel + ' units.',
      '',
    ].join('\n');
  }

  const powerCost = 8;
  if (ship.powerCore.current < powerCost) {
    return [
      '',
      '  [NAV] Insufficient power for nav calculation.',
      '  Core: ' + ship.powerCore.current + ' / ' + ship.powerCore.max,
      '',
    ].join('\n');
  }

  const currentSys = getCurrentSystem();
  const fromBody = currentSys ? getCurrentBody(currentSys) : null;
  const localHours = targetBody ? bodyTravelHours(fromBody, targetBody) : 0;
  const travelDays = 4 + Math.floor(Math.random() * 7);

  ship.fuel -= fuelCost;
  drainPower(ship, powerCost);
  rechargePower(ship, travelDays, false);
  playerState.currentDay += travelDays;

  playerState.location = {
    quadrantIndex: galaxy.quadrants.indexOf(targetQuadrant),
    quadrantName: targetQuadrant.name,
    clusterName: targetCluster.name,
    systemName: targetSys.name,
    bodyId: targetBody ? targetBody.id : null,
    bodyName: targetBody ? (targetBody.name || targetBody.type) : null,
    bodyKind: targetBody ? targetBody.kind : null,
    locationType: targetBody ? targetBody.kind : 'system',
  };
  playerState.docked = false;
  playerState.dockedAt = null;
  playerState.dockedFactionKey = null;

  const lines = [
    '',
    '  [NAV] Plotting course to ' + targetSys.name + (targetBody ? (' / ' + (targetBody.name || targetBody.type)) : '') + '...',
    '',
    '  Quadrant : ' + targetQuadrant.name,
    '  Cluster  : ' + targetCluster.name,
    '  Star     : ' + targetSys.starClass + '-class',
    '  Hazard   : ' + '▲'.repeat(targetSys.hazard) + '△'.repeat(5 - targetSys.hazard),
    '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + ship.fuel + ' units',
    '  Power used: ' + powerCost + ' — Core: ' + ship.powerCore.current + '/' + ship.powerCore.max,
    '  Transit  : ' + travelDays + ' standard days' + (targetBody ? ('  |  Local approach: ' + localHours + 'h') : ''),
    '  Day      : ' + playerState.currentDay,
    '',
    '  Drive nominal. Arrived.',
    '  Type "where" to survey this body stack.',
    '',
  ];

  return lines.join('\n');
}

// ── Fold command ──────────────────────────────

function cmdFold(args) {
  if (!args || args.length === 0) {
    return [
      '',
      '  [FOLD] Specify a destination quadrant.',
      '  Usage: fold <quadrant name>',
      '  Type map to see connected quadrants.',
      '',
    ].join('\n');
  }

  const loc         = playerState.location;
  const currentIdx  = loc.quadrantIndex;
  const targetName  = args.join(' ').toLowerCase();

  // Find matching connected quadrant
  const connected = getConnectedQuadrants(galaxy, currentIdx);
  const match     = connected.find(({ index, known }) => {
    if (!known) return false;
    return galaxy.quadrants[index].name.toLowerCase().includes(targetName);
  });

  if (!match) {
    // Check if it exists but is unknown
    const unknownMatch = connected.find(({ index, known }) =>
      !known && galaxy.quadrants[index].name.toLowerCase().includes(targetName)
    );
    if (unknownMatch) {
      return [
        '',
        '  [FOLD] Corridor signature detected — no astrographic data on file.',
        '  Destination identity unconfirmed. Cannot plot fold.',
        '  To attempt an uncharted fold: blindfold <quadrant name>',
        '',
      ].join('\n');
    }

    // Check if it's a known quadrant but not connected
    const anyMatch = galaxy.quadrants.findIndex(q =>
      q.name.toLowerCase().includes(targetName)
    );
    if (anyMatch >= 0) {
      return [
        '',
        '  [FOLD] No charted corridor to ' + galaxy.quadrants[anyMatch].name + ' from this position.',
        '',
        '  To attempt an uncharted fold: blindfold <quadrant name>',
        '  Warning: blindfold requires 12 cells and carries significant risk.',
        '',
      ].join('\n');
    }

    return '  [FOLD] No matching quadrant found. Type map to see known corridors.';
  }

  const destIdx    = match.index;
  const destQ      = galaxy.quadrants[destIdx];
  const corrType   = match.type;
  const cellCost   = foldCellCost(corrType);
  const corridorLabel = corrType === 'highway' ? 'Highway' : corrType === 'primary' ? 'Primary' : 'Secondary';

  if (playerState.foldCells < cellCost) {
    const deficit = cellCost - playerState.foldCells;
    const rawNeeded = deficit * 10;
    return [
      '',
      '  [FOLD] Insufficient fold cells.',
      '  Required : ' + cellCost + ' cells  (' + corridorLabel + ' corridor)',
      '  Aboard   : ' + playerState.foldCells + ' cells',
      '  Deficit  : ' + deficit + ' cells  (' + rawNeeded + ' kg raw veydrite equivalent)',
      '',
      '  Buy cells at a station or feed raw reserve: feed <cells>',
      '  Buy cells at a station or use: emergency refine <n>',
      '',
    ].join('\n');
  }

  // Store pending fold for confirmation
  playerState.pendingFold = {
    type:       'fold',
    destIdx,
    destName:   destQ.name,
    destState:  destQ.state,
    corrType,
    cellCost,
    corridorLabel,
  };

  const totalSys = destQ.clusters.reduce((n, c) => n + c.systems.length, 0);

  return [
    '',
    '  [FOLD] Veydric Fold Drive — corridor lock initiated.',
    '',
    '  Destination  : ' + destQ.name,
    '  Corridor     : ' + corridorLabel + ' — charted',
    '  Cell cost    : ' + cellCost + ' cells',
    '  Cells aboard : ' + playerState.foldCells + ' / 20',
    '  After fold   : ' + (playerState.foldCells - cellCost) + ' cells remaining',
    '',
    '  ' + destQ.name + ' — ' + destQ.state.toUpperCase(),
    '  ' + destQ.notableFeature,
    '  Systems      : ' + totalSys + ' charted',
    '',
    '  Fold calculations are not instantaneous.',
    '  Estimated geometry lock: 12 seconds.',
    '',
    '  Type "yes" to begin fold sequence or anything else to cancel.',
    '',
  ].join('\n');
}

// ── Blind fold command ────────────────────────

function cmdBlindFold(args) {
  if (!args || args.length === 0) {
    return [
      '',
      '  [BLINDFOLD] Specify a destination quadrant.',
      '  Usage: blindfold <quadrant name>',
      '  Warning: requires 12 cells. Drive must be NOMINAL. Catastrophic failure possible.',
      '',
    ].join('\n');
  }

  const targetName = args.join(' ').toLowerCase();
  const destIdx    = galaxy.quadrants.findIndex(q =>
    q.name.toLowerCase().includes(targetName)
  );

  if (destIdx < 0) {
    return '  [BLINDFOLD] No matching quadrant found in registry.';
  }

  const loc        = playerState.location;
  const currentIdx = loc.quadrantIndex;

  if (destIdx === currentIdx) {
    return '  [BLINDFOLD] Already in this quadrant.';
  }

  // Check if it's actually connected — blindfold is for UNCONNECTED quadrants
  if (isConnected(galaxy, currentIdx, destIdx)) {
    return [
      '',
      '  [BLINDFOLD] A charted corridor exists to this quadrant.',
      '  Use fold ' + galaxy.quadrants[destIdx].name + ' instead.',
      '  Cost: ' + foldCellCost(getCorridorType(galaxy, currentIdx, destIdx)) + ' cells.',
      '',
    ].join('\n');
  }

  const BLINDFOLD_COST = 12;
  const destQ          = galaxy.quadrants[destIdx];
  const ship           = getShip();
  const driveSystem    = ship && ship.systems && ship.systems.find(s => s.name === 'Drive');
  const driveOk        = !driveSystem || driveSystem.hp > 50;

  if (playerState.foldCells < BLINDFOLD_COST) {
    return [
      '',
      '  [BLINDFOLD] Insufficient fold cells for overdrive.',
      '  Required : 12 cells',
      '  Aboard   : ' + playerState.foldCells + ' cells',
      '',
    ].join('\n');
  }

  if (!driveOk) {
    return [
      '',
      '  [BLINDFOLD] Drive subsystem integrity insufficient for overdrive fold.',
      '  Drive must be above 50% HP. Current drive is damaged.',
      '  Repair drive before attempting blind fold.',
      '',
    ].join('\n');
  }

  playerState.pendingFold = {
    type:      'blindfold',
    destIdx,
    destName:  destQ.name,
    destState: destQ.state,
    cellCost:  BLINDFOLD_COST,
  };

  return [
    '',
    '  [BLINDFOLD] Overdrive fold sequence — uncharted void transit.',
    '',
    '  Destination  : ' + destQ.name + ' (uncharted corridor)',
    '  Cell cost    : 12 cells (overdrive)',
    '  Cells aboard : ' + playerState.foldCells + ' / 20',
    '  After fold   : ' + (playerState.foldCells - BLINDFOLD_COST) + ' cells remaining',
    '',
    '  ── RISK TABLE ──────────────────────────────────────────────',
    '  70%  Clean fold     Drive at WORN',
    '  15%  Rough fold     Hull -10  Drive DEGRADED',
    '  10%  Bad fold       Hull -25  Drive CRITICAL  Wrong system',
    '   5%  Catastrophic   Hull -50  Drive DESTROYED',
    '',
    '  This action carries significant risk of vessel loss.',
    '  The Guild accepts no liability for overdrive incidents.',
    '',
    '  Type "yes" to initiate overdrive sequence or anything else to cancel.',
    '',
  ].join('\n');
}

// ── Emergency refine ──────────────────────────

function cmdEmergencyRefine(args) {
  if (!args || args[0] !== 'refine') {
    return [
      '',
      '  [EMERGENCY] Usage: emergency refine <cells>',
      '  Converts raw reserve veydrite into fold cells.',
      '  Rate: 10 kg per cell. 15% drive wear risk per cell.',
      '  Reserve: ' + (playerState.reserveVeydrite || 0).toFixed(1) + ' kg / 15 kg',
      '  Cells  : ' + (playerState.foldCells || 0) + ' / 20',
      '',
    ].join('\n');
  }

  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount < 1) {
    return '  [EMERGENCY] Specify number of cells to refine. Example: emergency refine 1';
  }

  const reserve = playerState.reserveVeydrite || 0;
  const current = playerState.foldCells       || 0;
  const maxNew  = 20 - current;
  const canMake = Math.min(amount, Math.floor(reserve / 10), maxNew);

  if (canMake <= 0) {
    if (reserve < 10) {
      return [
        '',
        '  [EMERGENCY] Insufficient reserve veydrite.',
        '  Minimum 10 kg required per cell.',
        '  Reserve: ' + reserve.toFixed(1) + ' kg',
        '',
      ].join('\n');
    }
    if (maxNew <= 0) {
      return '  [EMERGENCY] Fold cell magazine at capacity (20/20).';
    }
  }

  const kgConsumed = canMake * 10;
  playerState.reserveVeydrite -= kgConsumed;
  playerState.foldCells       += canMake;

  // Drive wear check — 15% per cell refined
  let wearCount = 0;
  for (let i = 0; i < canMake; i++) {
    if (Math.random() < 0.15) wearCount++;
  }

  const lines = [
    '',
    '  [EMERGENCY] Field refinement initiated.',
    '  Raw veydrite feed: ' + kgConsumed + ' kg consumed.',
    '  Cells produced   : ' + canMake,
    '  Magazine         : ' + playerState.foldCells + ' / 20',
    '  Reserve          : ' + playerState.reserveVeydrite.toFixed(1) + ' kg / 15 kg',
    '',
  ];

  if (wearCount > 0) {
    const ship  = getShip();
    const drive = ship && ship.systems && ship.systems.find(s => s.name === 'Drive');
    if (drive) {
      drive.hp  = Math.max(0, drive.hp  - (wearCount * 8));
      drive.sta = Math.max(0, drive.sta - (wearCount * 8));
      lines.push('  [WARN] Drive wear detected — ' + wearCount + ' rough feed event(s).');
      lines.push('  Drive HP: ' + drive.hp + '  STA: ' + drive.sta);
      lines.push('  Recommend drive inspection at next station.');
    }
    lines.push('');
  }

  updateSidebar();
  autosave();
  return lines.join('\n');
}

// ── Jump ──────────────────────────────────────

function cmdJump(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] jump <system name>';
  if (playerState.docked) return '  [JUMP] You are docked. Type "undock" first.';

  const ship = getShip();
  const query = args.join(' ').toLowerCase();

  if (currentContacts && playerState.location) {
    contactCache[playerState.location.systemName] = currentContacts;
  }
  currentContacts = null;
  playerState.salvagedSystems = [];


  const loc        = playerState.location;
  const q          = galaxy.quadrants[loc.quadrantIndex];
  const curCluster = q && q.clusters.find(c => c.name === loc.clusterName);
  if (!curCluster) return '  [ERROR] Location data corrupted.';

  const target = curCluster.systems.find(s =>
    s.name.toLowerCase().includes(query) && s.name !== loc.systemName
  );

  if (!target) {
    return [
      '',
      '  [JUMP] No system matching "' + args.join(' ') + '" in local cluster.',
      '  Cluster: ' + curCluster.name,
      '  Systems here:',
      ...curCluster.systems
        .filter(s => s.name !== loc.systemName)
        .map(s => '    — ' + s.name),
      '',
      '  For systems outside this cluster, use "nav".',
      '',
    ].join('\n');
  }

  const fuelCost = 6 + Math.floor(Math.random() * 5);
  if (ship.fuel < fuelCost) {
    return ['', '  [JUMP] Insufficient fuel.', '  Required: ' + fuelCost + ' units  |  Available: ' + ship.fuel + ' units.', ''].join('\n');
  }

  const powerCost = 20;
  if (ship.powerCore.current < powerCost) {
    return ['', '  [JUMP] Insufficient power for blind jump.', '  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  const travelDays = 1 + Math.floor(Math.random() * 3);
  ship.fuel -= fuelCost;
  drainPower(ship, powerCost);
  rechargePower(ship, travelDays, false);
  playerState.currentDay += travelDays;

  playerState.location = {
    quadrantIndex: loc.quadrantIndex,
    clusterName:   curCluster.name,
    systemName:    target.name,
  };
  playerState.docked           = false;
  playerState.dockedAt         = null;
  playerState.dockedFactionKey = null;

  const lines = [
    '',
    '  [JUMP] Blind jump to ' + target.name + '...',
    '',
    '  Cluster  : ' + curCluster.name,
    '  Star     : ' + target.starClass + '-class',
    '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + ship.fuel + ' units',
    '  Power used: ' + powerCost + ' — Core: ' + ship.powerCore.current + '/' + ship.powerCore.max,
    '  Transit  : ' + travelDays + ' standard days',
    '  Day      : ' + playerState.currentDay,
    '',
    '  Arrived dark. Sensors offline.',
    '  Type "where" to survey this body stack.',
    '',
  ];

  // Hull stress
  if (Math.random() < 0.3) {
    const stress = 1 + Math.floor(Math.random() * 3);
    ship.hull = Math.max(0, ship.hull - stress);
    lines.push('  [!] Exit stress — hull -' + stress + '%.  Hull: ' + ship.hull + '%');
    lines.push('');
    if (ship.hull <= 0) return handleDeath('hull failure during blind jump to ' + target.name);
  }

  // Encounter check
  const encounter = rollEncounter(target, q, playerState, true);
  if (encounter) {
    playerState.inEncounter = true;
    playerState.encounter   = encounter;
    initCombat(encounter, ship);
    lines.push('  ── CONTACT ───────────────────────────────────────────────────');
    lines.push('');
    lines.push('  ' + encounter.openingLine);
    lines.push('');
    lines.push(renderCombatOptions());
  }

  // Beacon check
  const beacon = rollBeacon(target);
  if (beacon) {
    const ageTag = beacon.age === 'recent' ? '[RECENT]' : beacon.age === 'old' ? '[ARCHIVED]' : '[UNKNOWN AGE]';
    lines.push('  ── DISTRESS BEACON DETECTED ──────────────────────────────────');
    lines.push('');
    lines.push('  ' + ageTag + ' ' + beacon.text);
    lines.push('');
    playerState.logs.push({ type: 'beacon', system: target.name, age: beacon.age, text: beacon.text });
  }

  return lines.join('\n');
}

// ── Survey ────────────────────────────────────

function cmdSurvey(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (playerState.docked) return '  [SURVEY] Undock first.';

  const ship = getShip();
  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  // survey node — broad system geological sweep
  if (!args[0] || args[0] === 'node') {
    // Must have run where or clusterdeepscan first
    if (!playerState.visitedSystems || !playerState.visitedSystems[sys.name]) {
      return [
        '',
        '  [SURVEY] No astrographic data on file for this system.',
        '  Run "where" to survey local grid before geological sweep.',
        '',
      ].join('\n');
    }

    const powerCost = 35;
    if (ship.powerCore.current < powerCost) {
      return [
        '',
        '  [SURVEY] Insufficient power for geological sweep.',
        '  Required: ' + powerCost + '  |  Available: ' + ship.powerCore.current,
        '',
      ].join('\n');
    }

    // Check for mining tool
    const hasMiningTool = ship.utilitySlots.some(s => s.type === 'mining_auger');
    if (!hasMiningTool) {
      return [
        '',
        '  [SURVEY] No mining tool detected in utility slots.',
        '  Install an Auger-1 Light Mining Head to conduct geological surveys.',
        '',
      ].join('\n');
    }

    drainPower(ship, powerCost);
    playerState.currentDay += 1;

    const lines = [
      '',
      '  ── GEOLOGICAL SURVEY — ' + sys.name.toUpperCase() + ' ────────────────────────',
      '',
      '  Auger-1 array sweeping system bodies...',
      '  Survey duration: 1 day.  Day: ' + playerState.currentDay,
      '',
    ];

    let miningBodies = 0;
    const bodies = normalizeSystemBodies(sys);
    bodies.forEach((body, i) => {
      if (!body.mining || !body.mining.ores) {
        lines.push('  [' + (i + 1) + '] ' + body.type.padEnd(20) + ' — no extractable deposits detected');
        return;
      }

      miningBodies++;
      const m = body.mining;

      // Ash hint — very subtle
      let ashHint = '';
      if (m.ashFlag && Math.random() < 0.4) {
        ashHint = '  [!] Anomalous mass reading. Verify on body survey.';
      }

      const qualityTag = m.ores.some(o => o.quality === 'rich') ? 'RICH' :
                         m.ores.some(o => o.quality === 'standard') ? 'STANDARD' : 'DEPLETED';
      const oreGrades  = [...new Set(m.ores.map(o => ORE_DEFS[o.type] ? ORE_DEFS[o.type].grade : 'common'))];
      const gradeTag   = oreGrades.includes('exotic') ? 'EXOTIC' :
                         oreGrades.includes('rare') ? 'RARE' :
                         oreGrades.includes('uncommon') ? 'UNCOMMON' : 'COMMON';

      lines.push('  [' + (i + 1) + '] ' + body.type.padEnd(20) + ' — ' + qualityTag + '  ' + gradeTag + ' deposits  (' + m.nodeYield + ' units est.)');
      if (ashHint) lines.push(ashHint);
    });

    if (miningBodies === 0) {
      lines.push('  No extractable deposits detected in this system.');
    } else {
      lines.push('');
      lines.push('  Use "survey body <n>" for detailed composition analysis.');
    }

    lines.push('');
    return lines.join('\n');
  }

  // survey body <n> — detailed geological sweep of specific body
  if (args[0] === 'body') {
    const bodyIndex = parseInt(args[1]) - 1;
    const bodies = normalizeSystemBodies(sys);
    if (isNaN(bodyIndex) || bodyIndex < 0 || bodyIndex >= bodies.length) {
      return [
        '',
        '  [SURVEY] Usage: survey body <1-' + bodies.length + '>',
        '  Run "survey node" first to identify mining targets.',
        '',
      ].join('\n');
    }

    const body = bodies[bodyIndex];

    if (!body.mining || !body.mining.ores) {
      return [
        '',
        '  [SURVEY] Body ' + (bodyIndex + 1) + ' (' + body.type + ') has no extractable deposits.',
        '',
      ].join('\n');
    }

    // Must have run survey node first
    if (!playerState.visitedSystems || !playerState.visitedSystems[sys.name]) {
      return [
        '',
        '  [SURVEY] No system data on file. Run "survey node" first.',
        '',
      ].join('\n');
    }

    const hasMiningTool = ship.utilitySlots.some(s => s.type === 'mining_auger');
    if (!hasMiningTool) {
      return [
        '',
        '  [SURVEY] No mining tool detected.',
        '  Install an Auger-1 Light Mining Head to conduct body surveys.',
        '',
      ].join('\n');
    }

    const powerCost = 15;
    if (ship.powerCore.current < powerCost) {
      return [
        '',
        '  [SURVEY] Insufficient power.',
        '  Required: ' + powerCost + '  |  Available: ' + ship.powerCore.current,
        '',
      ].join('\n');
    }

    drainPower(ship, powerCost);
    playerState.currentDay += 1;

    const m = body.mining;
    m.surveyed = true;

    const lines = [
      '',
      '  ── BODY SURVEY: [' + (bodyIndex + 1) + '] ' + body.type.toUpperCase() + ' ─────────────────────────',
      '',
      '  Survey duration: 1 day.  Day: ' + playerState.currentDay,
      '',
    ];

    // Ash detection — harder to spot
    if (m.ashFlag) {
      if (Math.random() < 0.25) {
        lines.push('  [!!] ANOMALOUS CRYSTALLINE STRUCTURE DETECTED.');
        lines.push('  Mass readings inconsistent with known ore compositions.');
        lines.push('  Guild notation: potential NPCP contamination. File report on dock.');
        lines.push('  Proceed with extreme caution.');
        lines.push('');
      } else {
        lines.push('  [!] Minor mass anomaly detected. Within survey tolerance.');
        lines.push('');
      }
    }

    lines.push('  ── ORE COMPOSITION ───────────────────────────────────────────');
    lines.push('');

    m.ores.forEach((ore, i) => {
      const def     = ORE_DEFS[ore.type];
      if (!def) return;
      const refined = REFINED_DEFS[def.refinesTo];
      const refName = refined ? refined.name : def.refinesTo;
      lines.push(
        '  [' + (i + 1) + '] ' + def.name.padEnd(22) +
        ore.quality.padEnd(10) +
        ore.quantity + ' units  →  ' + refName
      );
    });

    lines.push('');
    lines.push('  Total yield estimate : ' + m.nodeYield + ' units');
    lines.push('  Node status          : ' + (m.ashFlag ? 'ANOMALOUS' : 'NOMINAL'));
    lines.push('');
    lines.push('  Use "mine body ' + (bodyIndex + 1) + '" to begin extraction.');
    lines.push('  Use "mine body ' + (bodyIndex + 1) + ' <cycles>" to queue multiple cycles.');
    lines.push('');

    return lines.join('\n');
  }

  return '  [SURVEY] Usage: survey node  |  survey body <n>';
}

// ── Mine ──────────────────────────────────────

function cmdMine(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (playerState.docked) return '  [MINE] Undock first.';

  const ship = getShip();

  // Check for mining tool
  const miningSlot = ship.utilitySlots.find(s => s.type === 'mining_auger');
  if (!miningSlot) {
    return [
      '',
      '  [MINE] No mining tool detected in utility slots.',
      '  Install an Auger-1 Light Mining Head to begin extraction.',
      '',
    ].join('\n');
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  if (!args[0] || args[0] !== 'body') {
    return [
      '',
      '  [MINE] Usage: mine body <n>  |  mine body <n> <cycles>',
      '  Run "survey node" then "survey body <n>" before mining.',
      '',
    ].join('\n');
  }

  const bodyIndex = parseInt(args[1]) - 1;
  const bodies = normalizeSystemBodies(sys);
    if (isNaN(bodyIndex) || bodyIndex < 0 || bodyIndex >= bodies.length) {
    return '  [MINE] Invalid body index. Use survey node to list bodies.';
  }

  const body = bodies[bodyIndex];

  if (!body.mining || !body.mining.ores || body.mining.ores.length === 0) {
    return [
      '',
      '  [MINE] Body ' + (bodyIndex + 1) + ' (' + body.type + ') has no extractable deposits.',
      '',
    ].join('\n');
  }

  if (!body.mining.surveyed) {
    return [
      '',
      '  [MINE] Body ' + (bodyIndex + 1) + ' has not been surveyed.',
      '  Run "survey body ' + (bodyIndex + 1) + '" before extraction.',
      '',
    ].join('\n');
  }

  if (body.mining.nodeYield <= 0) {
    return [
      '',
      '  [MINE] Body ' + (bodyIndex + 1) + ' is exhausted. No yield remaining.',
      '',
    ].join('\n');
  }

  const cycles    = Math.max(1, parseInt(args[2]) || 1);
  const powerCost = 25 * cycles;

  if (ship.powerCore.current < powerCost) {
    const canDo = Math.max(1, Math.floor(ship.powerCore.current / 25));
    return [
      '',
      '  [MINE] Insufficient power for ' + cycles + ' cycle(s).',
      '  Required: ' + powerCost + '  |  Available: ' + ship.powerCore.current,
      '  Can run: ' + canDo + ' cycle(s) with current power.',
      '',
    ].join('\n');
  }

  // Check ore pod capacity
  if (!playerState.orePods) playerState.orePods = { solid: 0, liquid: 0 };
  const podCapacity    = 50; // Standard Ore Pod
  const liquidCapacity = 50; // Standard Fluid Pod (if installed)

  const m = body.mining;
  const lines = [
    '',
    '  ── EXTRACTION OPERATION ──────────────────────────────────────',
    '',
    '  Body     : [' + (bodyIndex + 1) + '] ' + body.type,
    '  Cycles   : ' + cycles,
    '  Power    : ' + powerCost + ' units',
    '',
  ];

  drainPower(ship, powerCost);
  const miningDays = cycles * (1 + Math.floor(Math.random() * 2));
  playerState.currentDay += miningDays;
  rechargePower(ship, miningDays, false);

  let totalExtracted = 0;
  let ashTriggered   = false;
  let podFull        = false;

  for (let cycle = 0; cycle < cycles; cycle++) {
    if (m.nodeYield <= 0) break;

    // Ash propagation check per cycle
    if (m.ashFlag) {
      if (Math.random() < 0.05) {
        // Ash spreads to adjacent body
        const adjacentBodies = bodies.filter((b, i) =>
          i !== bodyIndex && b.mining && b.mining.ores && !b.mining.ashFlag
        );
        if (adjacentBodies.length > 0) {
          const target = adjacentBodies[Math.floor(Math.random() * adjacentBodies.length)];
          target.mining.ashFlag = true;
          ashTriggered = true;
        }
      }
      // Ash degrades yield
      m.ashProgress = Math.min(100, m.ashProgress + 20);
      m.nodeYield   = Math.max(0, Math.floor(m.nodeYield * 0.8));
    }

    // Extract from each ore type proportionally
    const cycleYield = Math.min(m.nodeYield, 8 + Math.floor(Math.random() * 8));
    m.nodeYield     -= cycleYield;
    totalExtracted  += cycleYield;

    // Distribute extracted ore to pods
    const isLiquid = m.ores.some(o => ORE_DEFS[o.type] && ORE_DEFS[o.type].liquid);
    if (isLiquid) {
      const space = liquidCapacity - playerState.orePods.liquid;
      const add   = Math.min(cycleYield, space);
      playerState.orePods.liquid += add;
      if (add < cycleYield) { podFull = true; break; }
    } else {
      const space = podCapacity - playerState.orePods.solid;
      const add   = Math.min(cycleYield, space);
      playerState.orePods.solid += add;

      // Track ore type breakdown
      if (!playerState.oreHold) playerState.oreHold = {};
      m.ores.forEach(ore => {
        if (!ORE_DEFS[ore.type] || ORE_DEFS[ore.type].liquid) return;
        const share = Math.round((ore.quantity / m.ores.reduce((n, o) => n + o.quantity, 0)) * add);
        playerState.oreHold[ore.type] = (playerState.oreHold[ore.type] || 0) + share;
      });

      if (add < cycleYield) { podFull = true; break; }
    }
  }

  lines.push('  Extraction complete.  Duration: ' + miningDays + ' day(s).');
  lines.push('  Day: ' + playerState.currentDay);
  lines.push('');
  lines.push('  Yield extracted  : ' + totalExtracted + ' units');
  lines.push('  Node remaining   : ' + m.nodeYield + ' units');
  lines.push('');

  if (m.ashFlag) {
    lines.push('  [!!] ASH CONTAMINATION ACTIVE — yield degrading.');
    if (ashTriggered) {
      lines.push('  [!!] CONTAMINATION SPREADING — adjacent body affected.');
    }
    lines.push('  File Guild report on dock. Bounty available.');
    lines.push('');
  }

  if (podFull) {
    lines.push('  [!] Ore pod at capacity. Offload at a station before continuing.');
    lines.push('');
  }

  // Ore hold summary
  if (playerState.oreHold && Object.keys(playerState.oreHold).length > 0) {
    lines.push('  ── ORE HOLD ──────────────────────────────────────────────────');
    lines.push('');
    Object.entries(playerState.oreHold).forEach(([oreType, qty]) => {
      const def = ORE_DEFS[oreType];
      if (def && qty > 0) {
        lines.push('  ' + def.name.padEnd(24) + qty + ' units');
      }
    });
    lines.push('');
    lines.push('  Solid pod: ' + (playerState.orePods.solid || 0) + ' / ' + podCapacity + ' units');
    if (playerState.orePods.liquid > 0) {
      lines.push('  Fluid pod: ' + playerState.orePods.liquid + ' / ' + liquidCapacity + ' units');
    }
    lines.push('');
  }

  updateSidebar();
  autosave();
  return lines.join('\n');
}

// ── Refine ────────────────────────────────────

function cmdRefine(args) {
  if (!playerState.docked) return '  [REFINE] You must be docked at a station with a refinery.';

  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys  = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const stationBody = normalizeSystemBodies(sys).find(b => b.hasStation && b.stationName === playerState.dockedAt);
  if (!stationBody || !stationBody.hasRefinery) {
    return [
      '',
      '  [REFINE] This station has no refinery.',
      '  Pelk Logistics and CCC installations typically offer refining services.',
      '',
    ].join('\n');
  }

  if (!playerState.oreHold || Object.keys(playerState.oreHold).length === 0) {
    return [
      '',
      '  [REFINE] No ore in hold.',
      '  Mine ore deposits with "mine body <n>" before refining.',
      '',
    ].join('\n');
  }

  const repScore  = getRep(playerState.dockedFactionKey);
  const tier      = repScore !== null ? repTier(repScore) : 'UNKNOWN';
  const grade     = stationBody.refineryGrade;
  const share     = stationBody.yieldShare || 0.15;
  const shareDisp = Math.round(share * 100);

  // Show refinery menu if no args
  if (!args[0]) {
    const lines = [
      '',
      '  ── REFINERY TERMINAL ─────────────────────────────────────────',
      '',
      '  Station  : ' + playerState.dockedAt,
      '  Grade    : ' + grade.toUpperCase(),
      '  Fee      : ' + shareDisp + '% yield share  (station keeps ' + shareDisp + '% of refined output)',
      '',
      '  ── ORE HOLD ──────────────────────────────────────────────────',
      '',
    ];

    Object.entries(playerState.oreHold).forEach(([oreType, qty]) => {
      const def     = ORE_DEFS[oreType];
      if (!def || qty <= 0) return;
      const refined = REFINED_DEFS[def.refinesTo];
      const yRate   = refineYieldRate(def.grade, grade, tier);
      const output  = Math.floor(qty * def.units * yRate * (1 - share));
      const refName = refined ? refined.name : def.refinesTo;
      lines.push('  ' + def.name.padEnd(22) + qty + ' units  →  ' + refName + ' x' + output + '  (' + Math.round(yRate * 100) + '% yield)');
    });

    lines.push('');
    lines.push('  refine all        — refine entire ore hold');
    lines.push('  refine scrip      — pay flat scrip fee instead of yield share');
    lines.push('');
    return lines.join('\n');
  }

  // refine all
  if (args[0] === 'all' || args[0] === 'scrip') {
    const payWithScrip = args[0] === 'scrip';
    const lines = [
      '',
      '  ── REFINING OPERATION ────────────────────────────────────────',
      '',
    ];

    if (!playerState.refinedHold) playerState.refinedHold = {};
    let totalScripCost = 0;

    Object.entries(playerState.oreHold).forEach(([oreType, qty]) => {
      const def     = ORE_DEFS[oreType];
      if (!def || qty <= 0) return;
      const refined = REFINED_DEFS[def.refinesTo];
      if (!refined) return;

      const yRate     = refineYieldRate(def.grade, grade, tier);
      const grossOut  = Math.floor(qty * def.units * yRate);
      const stationCut = payWithScrip ? 0 : Math.floor(grossOut * share);
      const playerOut = grossOut - stationCut;
      const scripCost = payWithScrip
        ? refineryScripFee(playerState.dockedFactionKey, q.state) * qty
        : 0;

      totalScripCost += scripCost;
      playerState.refinedHold[def.refinesTo] = (playerState.refinedHold[def.refinesTo] || 0) + playerOut;

      const refName = refined.name;
      lines.push('  ' + def.name.padEnd(22) + qty + ' units  →  ' + refName + ' x' + playerOut);
    });

    if (payWithScrip) {
      if (playerState.credits < totalScripCost) {
        return [
          '',
          '  [REFINE] Insufficient scrip.',
          '  Required: ' + totalScripCost + ' CR  |  Available: ' + playerState.credits + ' CR',
          '  Use "refine all" for yield-share payment instead.',
          '',
        ].join('\n');
      }
      playerState.credits -= totalScripCost;
      lines.push('');
      lines.push('  Processing fee : ' + totalScripCost + ' CR');
      lines.push('  Scrip remaining: ' + playerState.credits + ' CR');
    } else {
      lines.push('');
      lines.push('  Station yield share: ' + shareDisp + '% retained by ' + playerState.dockedAt);
    }

    // Clear ore hold and pods
    playerState.oreHold = {};
    if (playerState.orePods) {
      playerState.orePods.solid  = 0;
      playerState.orePods.liquid = 0;
    }

    lines.push('');
    lines.push('  ── REFINED METALS HOLD ───────────────────────────────────────');
    lines.push('');

    Object.entries(playerState.refinedHold).forEach(([metalKey, qty]) => {
      const def = REFINED_DEFS[metalKey];
      if (def && qty > 0) {
        lines.push('  ' + def.name.padEnd(24) + qty + ' units');
      }
    });

    lines.push('');
    lines.push('  Use "sell metals" to sell refined metals.');
    lines.push('');

    updateSidebar();
    autosave();
    return lines.join('\n');
  }

  return '  [REFINE] Usage: refine  |  refine all  |  refine scrip';
}

// ── Salvage ───────────────────────────────────

function cmdSalvage() {
  if (playerState.docked) return '  [SALVAGE] Undock first.';
  const ship = getShip();

  // Check power
  const utSlot = ship.utilitySlots.find(s => s.type === 'salvage_cutter');
  const powerNeeded = utSlot ? utSlot.powerCost : 30;
  if (ship.powerCore.current < powerNeeded) {
    return [
      '',
      '  [SALVAGE] Insufficient power for Harrow-7 operation.',
      '  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max,
      '  Required: ' + powerNeeded,
      '',
    ].join('\n');
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  // Check if already salvaged this visit
  const sysKey = sys.name;
  if (playerState.salvagedSystems.includes(sysKey)) {
    return [
      '',
      '  [SALVAGE] This site has already been worked today.',
      '  Move on and return another day, or find a new site.',
      '',
    ].join('\n');
  }
  
  const bodies    = normalizeSystemBodies(sys);
  const hasRuin   = bodies.some(b => b.hasRuin);
  const hasVeyd   = bodies.some(b => b.veydrite);
  const hasDebris = ['Debris Field', 'Shattered Planet', 'Dust Belt']
    .some(t => bodies.some(b => b.type === t || b.baseType === t));

  if (!hasRuin && !hasVeyd && !hasDebris) {
    return ['', '  [SALVAGE] Nothing to salvage in ' + sys.name + '.', ''].join('\n');
  }

  drainPower(ship, powerNeeded);
  const salvageDays = 1 + Math.floor(Math.random() * 2);
  playerState.currentDay += salvageDays;
  rechargePower(ship, salvageDays, false);

// Record this salvage so it can't be repeated same day
  playerState.salvagedSystems.push(sysKey);

  // Trim old entries to prevent bloat
  if (playerState.salvagedSystems.length > 50) {
    playerState.salvagedSystems = playerState.salvagedSystems.slice(-50);
  }

  const result     = rollSalvage(sys, q.state);
  const salvageOut = renderSalvageResult(result, playerState) + '  Day: ' + playerState.currentDay + '\n';
  const salvageAch = triggerAchievements({ type: 'salvage' });
  return salvageOut + (salvageAch ? salvageAch + '\n' : '');
}

// ── Dock ──────────────────────────────────────

function cmdDock(args) {
  if (playerState.docked) return '  [DOCK] Already docked at ' + playerState.dockedAt + '.';

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const bodies = normalizeSystemBodies(sys);
  const currentBody = getCurrentBody(sys);

  const allStationBodies = bodies.filter(b => b.hasStation);

  const localStationBodies = currentBody
    ? allStationBodies.filter(b =>
        b.id === currentBody.id ||
        b.parentId === currentBody.id ||
        b.id === currentBody.parentId ||
        (b.parentId && currentBody.parentId && b.parentId === currentBody.parentId)
      )
    : allStationBodies;

  const stationBodies = localStationBodies;

  if (stationBodies.length === 0) {
    return [
      '',
      '  [DOCK] No station in immediate local approach.',
      '  Use "system" to view the full body index and travel to a station-bearing body first.',
      ''
    ].join('\n');
  }

  let body;
  if (args && args.length > 0) {
    const targetName = args.join(' ').toLowerCase();
    body = stationBodies.find(b =>
      b.stationName && b.stationName.toLowerCase().includes(targetName)
    );

    if (!body) {
      const available = stationBodies.map(b => b.stationName).join(', ');
      return [
        '',
        '  [DOCK] Station not found in local approach: "' + args.join(' ') + '"',
        '  Nearby stations: ' + available,
        ''
      ].join('\n');
    }
  } else {
    body = stationBodies[0];

    if (stationBodies.length > 1) {
      const available = stationBodies.map(b => b.stationName).join(', ');
      return [
        '',
        '  [DOCK] Multiple nearby stations detected.',
        '  ' + available,
        '  Specify station name: dock <station name>',
        ''
      ].join('\n');
    }
  }

  const faction = body.faction || FACTIONS.independent;
  const fee     = dockingFee(body.factionKey);
  const ship    = getShip();

  const rep = getRep(body.factionKey);
  if (rep !== null && repTier(rep) === 'HOSTILE') {
    return ['', '  [DOCK] Docking refused.', '  ' + faction.name + ' has flagged your vessel.', ''].join('\n');
  }

  let hardshipDock = false;

  if (fee > 0 && playerState.credits < fee) {
    if (body.factionKey === 'feral' || fee === 0) {
    } else {
      hardshipDock = true;
    }
  }

  if (!hardshipDock && fee > 0) {
    playerState.credits -= fee;
  }

  meetFaction(body.factionKey);

  const repKey = 'docked_' + body.stationName + '_' + playerState.currentDay;
  const repResult = playerState.flags[repKey]
    ? null
    : hardshipDock
      ? adjustRep(body.factionKey, -5, 'Docked without paying fees')
      : adjustRep(body.factionKey, 1, 'Docked and paid fees');
  if (repResult) playerState.flags[repKey] = true;

  ship.powerCore.current = ship.powerCore.max;

  playerState.docked           = true;
  playerState.dockedAt         = body.stationName;
  playerState.dockedFactionKey = body.factionKey;

  const faction_info = FACTION_REGISTRY[body.factionKey];
  if (faction_info && faction_info.contracts) {
    playerState.bulletinContracts = generateContracts(body.factionKey, galaxy, playerState.location);
  } else {
    playerState.bulletinContracts = [];
  }

  const shipyardCtx = buildShipyardSession();
  const hasShipyard =
    shipyardCtx &&
    shipyardCtx.market &&
    shipyardCtx.market.length > 0;

  const feeNote = hardshipDock
    ? 'Hardship dock — fee of ' + fee + ' CR waived. Reputation penalty applied.'
    : fee > 0
      ? 'Docking fee: ' + fee + ' CR.  Scrip: ' + playerState.credits + ' CR.'
      : 'No docking fee.';

  const lines = [
    '',
    '  [DOCK] Docking request acknowledged.',
    '',
    '  Station  : ' + body.stationName,
    '  Operator : ' + faction.name + '  [' + faction.short + ']',
    '  System   : ' + sys.name,
    '',
    '  ' + faction.dockGreeting,
    '  ' + feeNote,
    '  Power Core recharged — shore power connected.',
    '',
    '  ── STATION SERVICES ──────────────────────────────────────────',
    '',
    '  ' + stationServices(faction.attitude) + (hasShipyard ? '  |  Shipyard' : ''),
    '',
  ];

  if (faction_info && faction_info.contracts) {
    lines.push('  Contracts available — type "bulletin" to view.');
  }
  lines.push('  Type "trade" to open the trade terminal.');
  lines.push('  Type "armory" to browse weapons and ammo.');
  lines.push('  Type "repair" for hull and weapon repair.');
  if (shipyardCtx && shipyardCtx.market && shipyardCtx.market.length > 0) {
    lines.push('Type shipyard to browse available hulls.');
  }
  lines.push('  Type "undock" to return to space.');
  lines.push('');
  lines.push(renderRepChange(repResult));
  lines.push('');
  if (typeof updateAuspex === 'function') updateAuspex();

  const sys2 = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (sys2 && sys2.xenoTainted) triggerAchievements({ type: 'xeno_system' });

  const dockAch = triggerAchievements({ type: 'dock' });
  if (dockAch) lines.push(dockAch);

  return lines.join('\n');
}

// ── Undock ────────────────────────────────────

function cmdUndock() {
  if (!playerState.docked) return '  [UNDOCK] You are not currently docked.';
  const name = playerState.dockedAt;
  playerState.docked           = false;
  playerState.dockedAt         = null;
  playerState.dockedFactionKey = null;
  playerState.inTrade          = false;
  playerState.inArmory         = false;
  playerState.inShipyard       = false;
  playerState.bulletinContracts = [];
  if (typeof updateAuspex === 'function') updateAuspex();
  return ['', '  [UNDOCK] Departing ' + name + '.', '  Thrusters nominal. Open space.', ''].join('\n');
}

// ── Trade ─────────────────────────────────────

function cmdTrade(args) {
  if (!playerState.docked) return '  [TRADE] You must be docked to access the trade terminal.';
  if (args[0] === 'exit') { playerState.inTrade = false; return '  [TRADE] Terminal closed.'; }
  const loc = playerState.location;
  const q   = galaxy.quadrants[loc.quadrantIndex];
  playerState.inTrade = true;
  return buildTradeMenu(playerState, playerState.dockedFactionKey, q.state);
}

function handleTradeCommand(cmd, args) {
  if (playerState.pendingFold && (cmd === 'yes' || cmd === 'y')) {
    const fold = playerState.pendingFold;
    playerState.pendingFold = null;
    return '__FOLD__' + JSON.stringify(fold);
  }
  if (playerState.pendingFold && cmd !== 'yes' && cmd !== 'y') {
    playerState.pendingFold = null;
    return '  [FOLD] Fold sequence cancelled.';
  }
  if (playerState.pendingTx) {
    if (cmd === 'yes' || cmd === 'y') {
      const tx = playerState.pendingTx;
      playerState.pendingTx = null;
      return executeTrade(tx);
    } else {
      playerState.pendingTx = null;
      return '  [TRADE] Transaction cancelled.';
    }
  }
  if (cmd === 'exit')    { playerState.inTrade = false; return '  [TRADE] Terminal closed.'; }
  if (cmd === 'sell')    return cmdSell(args);
  if (cmd === 'buy')     return cmdBuy(args);
  if (cmd === 'repair')  return cmdRepair(args);
  if (cmd === 'install')   return cmdInstall(args);
  if (cmd === 'uninstall') return cmdUninstall(args);
  if (cmd === 'status')  return cmdStatus();
  if (cmd === 'weapons') return cmdWeapons();
  if (cmd === 'trade') {
    const loc = playerState.location;
    const q   = galaxy.quadrants[loc.quadrantIndex];
    return buildTradeMenu(playerState, playerState.dockedFactionKey, q.state);
  }
  return ['  [TRADE] Unknown command.', '  Use: sell veydrite <n>  |  buy fuel <n>  |  repair  |  exit'].join('\n');
}

// ── Sell ──────────────────────────────────────

function cmdSell(args) {
  if (!playerState.docked) return '  [SELL] You must be docked to sell.';
  if (args[0] === 'astrographics') return cmdSellAstrographics(args);
  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  let price   = veydritePrice(q.state);
  const guildRep = getRep('guild');
  if (guildRep !== null) {
    if (repTier(guildRep) === 'TRUSTED') price = Math.round(price * 1.15);
    if (repTier(guildRep) === 'HOSTILE') price = Math.round(price * 0.75);
  }
  if (!args[0] || args[0] !== 'veydrite') return '  [SELL] Usage: sell veydrite <amount> or sell veydrite all';
  if (playerState.veydrite <= 0) return '  [SELL] No veydrite in hold.';
  let amount;
  if (args[1] === 'all') {
    amount = playerState.veydrite;
  } else {
    amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) return '  [SELL] Specify an amount.';
    if (amount > playerState.veydrite) return '  [SELL] You only have ' + playerState.veydrite + ' kg in hold.';
  }
  const earned = amount * price;
  playerState.pendingTx = { type: 'sell', commodity: 'veydrite', amount, earned };
  const repResult = adjustRep('guild', 2, 'Sold veydrite at Guild rate');
  return [
    '',
    '  [SELL] Confirm transaction?',
    '  Sell     : ' + amount + ' kg veydrite',
    '  Rate     : ' + price + ' CR/kg',
    '  You get  : ' + earned + ' CR',
    '',
    renderRepChange(repResult),
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

// ── Buy ───────────────────────────────────────

function cmdBuy(args) {
  if (!playerState.docked) return '  [BUY] You must be docked to buy.';
  if (!args[0]) return '  [BUY] Usage: buy fuel <n>  |  buy weapon <n> <slot>  |  buy ammo <slot> <#> <n>';
  
  if (args[0] === 'weapon') return cmdBuyWeapon(args);
  if (args[0] === 'ammo')   return cmdBuyAmmo(args);
  if (args[0] === 'fuel')  return cmdBuyFuel(args);
  if (args[0] === 'cells') return cmdBuyCells(args);
  if (args[0] === 'tool')  return cmdBuyTool(args);
  return '  [BUY] Unknown item. Try: fuel, weapon, ammo, cells, tool';
}

function cmdBuyFuel(args) {
  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  const price = fuelPrice(q.state);
  const ship  = getShip();

  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount <= 0) return '  [BUY] Specify an amount. Example: buy fuel 20';

  const cost = amount * price;
  if (playerState.credits < cost) {
    return ['', '  [BUY] Insufficient scrip.', '  Cost: ' + cost + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
  }

  playerState.pendingTx = { type: 'buy', commodity: 'fuel', amount, cost };

  return [
    '',
    '  [BUY] Confirm fuel purchase?',
    '  Buy      : ' + amount + ' units',
    '  Rate     : ' + price + ' CR/unit',
    '  You pay  : ' + cost + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdBuyCells(args) {
  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount < 1) return '  [BUY] Usage: buy cells <amount>';
  const faction = playerState.dockedFactionKey;
  const rep     = getRep(faction);
  const tier    = rep !== null ? repTier(rep) : 'UNKNOWN';
  const result  = foldCellPrice(faction, tier);
  if (!result)        return '  [REFUSED] This station will not sell fold cells to you.';
  if (result.noStock) return '  [NO STOCK] This station has no fold cells available.';
  const max    = 20 - playerState.foldCells;
  const buying = Math.min(amount, max);
  if (buying <= 0) return '  [FULL] Fold cell magazine is at capacity (20/20).';
  const total  = result.price * buying;
  if (playerState.credits < total) {
    return [
      '',
      '  [BUY] Insufficient scrip.',
      '  ' + buying + ' cells at ' + result.price + ' CR each = ' + total + ' CR required.',
      '  You have: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }
  playerState.pendingTx = { type: 'buy', commodity: 'cells', amount: buying, cost: total, priceEach: result.price };
  return [
    '',
    '  [BUY] Confirm fold cell purchase?',
    '  Buy      : ' + buying + ' cells',
    '  Rate     : ' + result.price + ' CR/cell',
    '  You pay  : ' + total + ' CR',
    '  Magazine : ' + playerState.foldCells + ' / 20  →  ' + (playerState.foldCells + buying) + ' / 20',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdBuyTool(args) {
  if (!playerState.docked) return '  [BUY] Must be docked.';
  const ship = getShip();

  // List available tools if no args
  if (!args[1]) {
    const lines = [
      '',
      '  ── UTILITY TOOLS ─────────────────────────────────────────────',
      '',
    ];
    Object.values(TOOL_DEFS).forEach((tool, i) => {
      const installed = ship.utilitySlots.some(s => s.type === tool.type);
      const tag = installed ? '  [INSTALLED]' : '';
      lines.push('  [' + (i + 1) + '] ' + tool.name.padEnd(32) + tool.price + ' CR' + tag);
      lines.push('      ' + tool.desc);
      lines.push('');
    });
    lines.push('  buy tool <#>         — purchase and install tool');
    lines.push('  buy tool <#> cargo   — purchase and store in cargo');
    lines.push('');
    return lines.join('\n');
  }

  const toolIndex = parseInt(args[1]) - 1;
  const toolKeys  = Object.keys(TOOL_DEFS);
  const toolKey   = toolKeys[toolIndex];
  if (!toolKey) return '  [BUY] Invalid tool index. Type "buy tool" to see available tools.';

  const def   = TOOL_DEFS[toolKey];
  const toCargo = args[2] === 'cargo';

  if (playerState.credits < def.price) {
    return [
      '',
      '  [BUY] Insufficient scrip.',
      '  Cost: ' + def.price + ' CR  |  You have: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  playerState.pendingTx = {
    type:    'buy_tool',
    toolKey,
    def,
    toCargo,
  };

  return [
    '',
    '  [BUY] Confirm tool purchase?',
    '',
    '  Tool     : ' + def.name,
    '  Installs : ' + (toCargo ? 'cargo hold' : 'utility slot (replaces current)'),
    '  Cost     : ' + def.price + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function executeTrade(tx) {
  const ship = getShip();
  if (tx.type === 'sell' && tx.commodity === 'veydrite') {
    playerState.veydrite -= tx.amount;
    playerState.credits  += tx.earned;
    playerState.stats.veydriteSold = (playerState.stats.veydriteSold || 0) + tx.amount;
    const veyAch = triggerAchievements({ type: 'veydrite_sale' });
    return ['', '  [SELL] Transaction complete.', '  Sold: ' + tx.amount + ' kg  |  Earned: ' + tx.earned + ' CR', '  Scrip: ' + playerState.credits + ' CR', veyAch, ''].join('\n');
  }
  if (tx.type === 'buy' && tx.commodity === 'cells') {
      playerState.credits   -= tx.cost;
      playerState.foldCells += tx.amount;
      autosave();
      updateSidebar();
      return [
        '',
        '  [BUY] Fold cells loaded.',
        '  Purchased : ' + tx.amount + ' cells at ' + tx.priceEach + ' CR each',
        '  Total     : ' + tx.cost + ' CR',
        '  Magazine  : ' + playerState.foldCells + ' / 20',
        '  Scrip     : ' + playerState.credits + ' CR',
        '',
      ].join('\n');
    }
  
  if (tx.type === 'buy' && tx.commodity === 'fuel') {
    playerState.credits -= tx.cost;
    ship.fuel = Math.min(ship.fuelMax, ship.fuel + tx.amount);
    return ['', '  [BUY] Fuel transfer complete.', '  Purchased: ' + tx.amount + ' units  |  Cost: ' + tx.cost + ' CR', '  Fuel: ' + ship.fuel + '/' + ship.fuelMax + '  |  Scrip: ' + playerState.credits + ' CR', ''].join('\n');
  }

  if (tx.type === 'repair_hull') {
    ship.hull = Math.min(ship.hullMax, ship.hull + tx.amount);
    playerState.credits -= tx.cost;
    return ['', '  [REPAIR] Hull repairs complete.', '  Repaired: +' + tx.amount + '%  |  Hull: ' + ship.hull + '%', '  Scrip: ' + playerState.credits + ' CR', ''].join('\n');
  }

  if (tx.type === 'buy_weapon_cargo') {
    const ship = getShip();
    if (!ship.cargoWeapons) ship.cargoWeapons = [];
    playerState.credits -= tx.price;
    ship.cargoWeapons.push({
      weaponType:   tx.weaponType,
      name:         tx.def.name,
      condition:    100,
      conditionMax: 100,
      ammo:         {},
      activeAmmo:   tx.def.compatibleAmmo[0] || null,
      massPerRound: tx.def.massPerRound || {},
    });
    return [
      '',
      '  [BUY] ' + tx.def.name + ' purchased and stored in cargo.',
      '  Scrip: ' + playerState.credits + ' CR',
      '  Cargo weapons: ' + ship.cargoWeapons.length,
      '',
    ].join('\n');
  }
  
  if (tx.type === 'buy_weapon') {
    const ship = getShip();
    playerState.credits -= tx.price;
    const slot = ship.weaponSlots.find(s => s.id === tx.slotId);
    if (slot) {
      slot.name         = tx.def.name;
      slot.type         = tx.weaponType;
      slot.condition    = 100;
      slot.conditionMax = 100;
      slot.active       = true;
      slot.ammo         = {};
      slot.activeAmmo   = tx.def.compatibleAmmo[0] || null;
      slot.massPerRound = tx.def.massPerRound || {};
      slot.burstMin     = tx.def.burstMin;
      slot.burstMax     = tx.def.burstMax;
      slot.powerPerBurst = tx.def.powerPerBurst || 0;
    }
    return [
      '',
      '  [BUY] ' + tx.def.name + ' purchased and installed in slot ' + tx.slotId + '.',
      '  Scrip: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  if (tx.type === 'buy_ammo') {
    const ship = getShip();
    playerState.credits -= tx.cost;
    const slot = ship.weaponSlots.find(s => s.id === tx.slotId);
    if (slot) {
      slot.ammo[tx.ammoType] = (slot.ammo[tx.ammoType] || 0) + tx.amount;
      calcAmmoBayUsed(ship);
    }
    return [
      '',
      '  [BUY] Ammo loaded.',
      '  ' + tx.ammoType + '  x' + tx.amount + '  →  Slot ' + tx.slotId,
      '  Scrip: ' + playerState.credits + ' CR',
      '  Ammo bay: ' + ship.ammoBayUsed + '/' + ship.ammoBayMax + ' kg',
      '',
    ].join('\n');
  }

if (tx.type === 'buy_tool') {
    const ship = getShip();
    playerState.credits -= tx.def.price;
    if (tx.toCargo) {
      if (!ship.cargoTools) ship.cargoTools = [];
      ship.cargoTools.push({ ...tx.def });
      return [
        '',
        '  [BUY] ' + tx.def.name + ' stored in cargo.',
        '  Use "install tool <slot>" to equip it.',
        '  Scrip: ' + playerState.credits + ' CR',
        '',
      ].join('\n');
    }
    // Install directly — replaces current utility slot
    const slot = ship.utilitySlots[0];
    if (slot) {
      // Move current tool to cargo if present
      if (slot.type) {
        if (!ship.cargoTools) ship.cargoTools = [];
        ship.cargoTools.push({
          name:      slot.name,
          type:      slot.type,
          powerCost: slot.powerCost,
        });
      }
      slot.name      = tx.def.name;
      slot.type      = tx.def.type;
      slot.powerCost = tx.def.powerCost;
      slot.condition = 100;
    }
    updateSidebar();
    return [
      '',
      '  [BUY] ' + tx.def.name + ' installed in utility slot.',
      '  Previous tool moved to cargo hold.',
      '  Scrip: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }
  
  if (tx.type === 'sell_weapon') {
    playerState.credits += tx.value;
    if (tx.removeWeapon) tx.removeWeapon();
    calcAmmoBayUsed(getShip());
    return [
      '',
      '  [SELL] Transaction complete.',
      '  ' + (WEAPON_DEFS[tx.weaponType] ? WEAPON_DEFS[tx.weaponType].name : tx.weaponType) + ' sold.',
      '  Earned: ' + tx.value + ' CR  |  Scrip: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  if (tx.type === 'repair_system') {
    const ship = getShip();
    const sub  = ship.subsystems[tx.subKey];
    if (sub) {
      sub.hp  = sub.hpMax;
      sub.sta = sub.staMax;
    }
    playerState.credits -= tx.cost;
    return [
      '',
      '  [REPAIR] ' + (sub ? sub.name : tx.subKey) + ' fully restored.',
      '  Scrip: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }
  
  if (tx.type === 'buy_ship') {
    const result = executeShipPurchase(playerState, tx.shipId, tx.price);
    shipyardSession = null;
    autosave();
    updateSidebar();
    return result;
  }

  return '  [ERROR] Unknown transaction type.';
}

// ── Repair ────────────────────────────────────

function cmdRepair(args) {
  if (!playerState.docked) return ['', '  [REPAIR] You must be docked to repair.', ''].join('\n');
  const ship = getShip();
  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];

  const costPerPoint = { Established: 8, Contested: 12, Declining: 18,
                          Collapsed: 30, Isolated: 22, Forbidden: 35 }[q.state] || 15;

  if (!args[0]) {
    const damage   = ship.hullMax - ship.hull;
    const fullCost = damage * costPerPoint;
    return [
      '',
      '  [REPAIR] Hull integrity: ' + ship.hull + '/' + ship.hullMax,
      '  Damage: ' + damage + ' points',
      '',
      '  Rate        : ' + costPerPoint + ' CR per point',
      '  Full repair : ' + fullCost + ' CR',
      '  Scrip       : ' + playerState.credits + ' CR',
      '',
      '  repair hull full       — full hull repair',
      '  repair hull <amount>   — partial hull repair',
      '',
    ].join('\n');
  }

  if (args[0] === 'hull') {
    const damage = ship.hullMax - ship.hull;
    if (damage <= 0) return ['', '  [REPAIR] Hull is at full integrity.', ''].join('\n');
    let amount;
    if (args[1] === 'full') {
      amount = damage;
    } else {
      amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return '  [REPAIR] Usage: repair hull full  or  repair hull <amount>';
      amount = Math.min(amount, damage);
    }
    const cost = amount * costPerPoint;
    if (playerState.credits < cost) {
      return ['', '  [REPAIR] Insufficient scrip.', '  Cost: ' + cost + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
    }
    playerState.pendingTx = { type: 'repair_hull', amount, cost };
    return [
      '',
      '  [REPAIR] Confirm hull repair?',
      '  Hull now  : ' + ship.hull + '%',
      '  Repair    : +' + amount + ' points',
      '  Hull after: ' + Math.min(ship.hullMax, ship.hull + amount) + '%',
      '  Cost      : ' + cost + ' CR',
      '',
      '  Type "yes" to confirm or anything else to cancel.',
      '',
    ].join('\n');
  }

if (args[0] === 'weapon') return cmdRepairWeapon(args);
  if (args[0] === 'system') return cmdRepairSystem(args);

  return '  [REPAIR] Usage: repair hull full  |  repair weapon <slot>  |  repair system <name>';
}

// ── Weapons command ───────────────────────────

function cmdWeapons() {
  const ship = getShip();
  if (!ship) return '  [ERROR] No ship data.';
  return renderWeaponStatus(ship);
}

// ── Systems command ───────────────────────────

function cmdSystems() {
  const ship = getShip();
  if (!ship) return '  [ERROR] No ship data.';
  return renderSubsystemStatus(ship);
}

// ── Shipyard ──────────────────────────────────
 
// Tracks the current shipyard browsing session so <#> indices are stable
// across shipyard, shipyard info, and shipyard buy commands.
let shipyardSession = null;

function buildShipyardSession() {
  if (!playerState.docked) return null;

  const loc = playerState.location;
  const q = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster ? cluster.systems.find(s => s.name === loc.systemName) : null;
  if (!sys) return null;

  const body = normalizeSystemBodies(sys).find(b => b.hasStation);
  if (!body) return null;

  const factionKey = playerState.dockedFactionKey;
  const rep = getRep(factionKey);
  const tier = rep != null ? repTier(rep) : "UNKNOWN";

  // Shipyards only operate at Established and Contested installations
    const noMarket = 
      ["feral", "forbidden"].includes(factionKey) ||
      !["Established", "Contested"].includes(q.state);

  if (noMarket) return null;

  const market = typeof getShipMarket === "function"
    ? getShipMarket(factionKey, q.state, tier)
    : [];

  return {
    factionKey,
    quadrantState: q.state,
    tier,
    market,
    stationName: playerState.dockedAt
  };
}

function cmdShipyard(args) {
  if (!playerState.docked) return [
    "SHIPYARD You must be docked to access the shipyard.",
    ""
  ].join("\n");

  if (args && args[0] && args[0].toLowerCase() === "exit") {
    shipyardSession = null;
    return [
      "SHIPYARD",
      "",
      "Terminal closed."
    ].join("\n");
  }

  if (!args || args.length === 0) {
    shipyardSession = buildShipyardSession();

    if (!shipyardSession || shipyardSession.market.length === 0) return [
      "SHIPYARD No hull market at this station.",
      "Ship markets operate at Established and Contested installations.",
      "Feral and Forbidden space do not maintain registered shipyards.",
      ""
    ].join("\n");

    return renderShipMarket(
      shipyardSession.market,
      shipyardSession.factionKey,
      shipyardSession.quadrantState,
      shipyardSession.tier,
      playerState.credits,
      playerState.ship
    );
  }

  const sub = args[0].toLowerCase();

  if (sub === "info") {
    if (!shipyardSession) shipyardSession = buildShipyardSession();
    if (!shipyardSession || shipyardSession.market.length === 0) {
      return "SHIPYARD No market data. Type shipyard first.";
    }

    const index = parseInt(args[1], 10) - 1;
    if (isNaN(index) || index < 0 || index >= shipyardSession.market.length) return [
      `SHIPYARD Usage shipyard info 1-${shipyardSession.market.length}`,
      "Type shipyard to see the hull list.",
      ""
    ].join("\n");

    const offer = shipyardSession.market[index];
    return renderShipSpec(offer.def, offer.price);
  }

  if (sub === "buy") {
    if (!shipyardSession) shipyardSession = buildShipyardSession();
    if (!shipyardSession || shipyardSession.market.length === 0) {
      return "SHIPYARD No market data. Type shipyard first.";
    }

    const index = parseInt(args[1], 10) - 1;
    if (isNaN(index) || index < 0 || index >= shipyardSession.market.length) return [
      `SHIPYARD Usage shipyard buy 1-${shipyardSession.market.length}`,
      "Type shipyard to see the hull list.",
      ""
    ].join("\n");

    const offer = shipyardSession.market[index];
    const def = offer.def;
    const price = offer.price;

    if (playerState.credits < price) return [
      "SHIPYARD Insufficient scrip.",
      `${def.name} costs ${price} CR.`,
      `You have ${playerState.credits} CR.`,
      ""
    ].join("\n");

    playerState.pendingTx = {
      type: "buyship",
      shipId: def.id,
      price,
      def
    };

    const currentHull = playerState.ship ? playerState.ship.designation : "unknown";

    return [
      "SHIPYARD Confirm hull purchase?",
      "",
      `New hull ${def.name} (${def.designation})`,
      `Current hull ${currentHull}`,
      `Cost ${price} CR`,
      `Scrip after ${playerState.credits - price} CR`,
      "",
      "Your current weapons and tools will be transferred to",
      "the new vessel's cargo hold where possible.",
      "",
      "This action cannot be undone.",
      "The Guild does not offer trade-in credit.",
      "",
      "Type yes to confirm or anything else to cancel.",
      ""
    ].join("\n");
  }

  return [
    "SHIPYARD Unknown command.",
    "Usage: shipyard, shipyard info n, shipyard buy n, shipyard exit",
    ""
  ].join("\n");
}

// ── Armory ────────────────────────────────────

function getArmoryContext() {
  if (!playerState.docked) return null;
  const loc = playerState.location;
  const q = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster?.systems.find(s => s.name === loc.systemName);
  if (!sys) return null;

  const bodies = normalizeSystemBodies(sys);
  const body = bodies.find(b => b.hasStation && b.stationName === playerState.dockedAt)
    || bodies.find(b => b.hasStation);

  if (!body) return null;

  const rep = getRep(body.factionKey);
  const tier = rep != null ? repTier(rep) : "UNKNOWN";
  const stock = getArmoryStock(body.factionKey, q.state, rep);

  return { q, sys, body, rep, tier, stock };
}

function cmdArmory(args) {
  if (!playerState.docked) return ['', '  [ARMORY] You must be docked to access the armory.', ''].join('\n');

  const ctx = getArmoryContext();
  if (!ctx) return ['', '  [ARMORY] No armory data available.', ''].join('\n');

  const ship = getShip();
  if (!ship.cargoWeapons) ship.cargoWeapons = [];

  playerState.inArmory = true;
  return renderArmory(ctx.stock, ship, playerState.credits, playerState.dockedFactionKey, ctx.q.state);
}

function handleArmoryCommand(cmd, args) {
  if (playerState.pendingTx) {
    if (cmd === 'yes' || cmd === 'y') {
      const tx = playerState.pendingTx;
      playerState.pendingTx = null;
      return executeTrade(tx);
    } else {
      playerState.pendingTx = null;
      return '  [ARMORY] Transaction cancelled.';
    }
  }
  if (cmd === 'exit')      { playerState.inArmory = false; return ['', '  [ARMORY] Terminal closed.', ''].join('\n'); }
  if (cmd === 'armory')    return cmdArmory(args);
  if (cmd === 'buy')       return cmdBuy(args);
  if (cmd === 'sell')      return cmdSell(args);
  if (cmd === 'repair')    return cmdRepair(args);
  if (cmd === 'shipyard')  return cmdShipyard(args);
  if (cmd === 'install')   return cmdInstall(args);
  if (cmd === 'uninstall') return cmdUninstall(args);
  if (cmd === 'status')    return cmdStatus();
  if (cmd === 'weapons')   return cmdWeapons();
  return ['', '  [ARMORY] Unknown command.', '  Use: buy  |  sell  |  repair  |  install  |  uninstall  |  armory  |  exit', ''].join('\n');
}

function cmdBuyWeapon(args) {
  if (!playerState.docked) return '  [BUY] Must be docked.';

  const ctx = getArmoryContext();
  if (!ctx || !ctx.stock) return '  [ARMORY] No armory available.';
  if (ctx.stock.restricted) return '  [ARMORY] Access restricted.';

  const ship = getShip();
  if (!ship.cargoWeapons) ship.cargoWeapons = [];

  // args[0] = 'weapon', args[1] = index number, args[2] = slot|cargo
  const weaponIndex = parseInt(args[1]) - 1;
  const slotArg     = args[2];

  if (isNaN(weaponIndex) || weaponIndex < 0) {
    return ['', '  [BUY] Usage: buy weapon <#> <slot|cargo>', '  Type "armory" to see weapon index numbers.', ''].join('\n');
  }

  if (!slotArg) {
    return ['', '  [BUY] Specify a destination: buy weapon <#> <slot number|cargo>', ''].join('\n');
  }

  const matchedType = ctx.stock.weapons[weaponIndex];
  if (!matchedType) {
    return ['', '  [BUY] No weapon at index ' + (weaponIndex + 1) + '.', '  Type "armory" to see available weapons.', ''].join('\n');
  }

  const def   = WEAPON_DEFS[matchedType];
  const price = weaponPrice(matchedType, ctx.stock.priceMod, ctx.tier);

  if (playerState.credits < price) {
    return ['', '  [BUY] Insufficient scrip.', '  Cost: ' + price + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
  }

  // Cargo destination
  if (slotArg === 'cargo') {
    playerState.pendingTx = {
      type:       'buy_weapon_cargo',
      weaponType: matchedType,
      price,
      def,
    };
    return [
      '',
      '  [BUY] Confirm purchase?',
      '',
      '  Weapon : ' + def.name,
      '  Store  : cargo hold',
      '  Cost   : ' + price + ' CR',
      '',
      '  Type "yes" to confirm or anything else to cancel.',
      '',
    ].join('\n');
  }

  // Slot destination
  const slotId = parseInt(slotArg);
  if (isNaN(slotId)) {
    return ['', '  [BUY] Specify a slot number or "cargo".', ''].join('\n');
  }

  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot) return '  [BUY] Invalid slot number.';

  if (slot.type) {
    return [
      '',
      '  [BUY] Slot ' + slotId + ' is occupied by ' + slot.name + '.',
      '  Uninstall it first, or use "cargo" as destination.',
      '',
    ].join('\n');
  }

  playerState.pendingTx = {
    type:       'buy_weapon',
    weaponType: matchedType,
    slotId,
    price,
    def,
  };

  return [
    '',
    '  [BUY] Confirm purchase?',
    '',
    '  Weapon : ' + def.name,
    '  Slot   : ' + slotId,
    '  Cost   : ' + price + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdBuyAmmo(args) {
  if (!playerState.docked) return '  [BUY] Must be docked.';

  const ctx = getArmoryContext();
  if (!ctx || !ctx.stock) return '  [ARMORY] No armory available.';

  const ship = getShip();

  // buy ammo <slot> <#> <amount>
  const slotId      = parseInt(args[1]);
  const ammoIndex   = parseInt(args[2]) - 1;
  const amount      = parseInt(args[3]);

  if (isNaN(slotId) || isNaN(ammoIndex) || ammoIndex < 0 || isNaN(amount) || amount <= 0) {
    return '  [BUY] Usage: buy ammo <slot> <#> <amount>  —  use "armory" to see ammo index numbers.';
  }

  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot || !slot.type) return '  [BUY] No weapon in slot ' + slotId + '.';

  const ammoType = ctx.stock.ammo[ammoIndex];
  if (!ammoType) {
    return ['', '  [BUY] No ammo at index ' + (ammoIndex + 1) + '.', '  Type "armory" to see available ammo.', ''].join('\n');
  }

  const weaponDef = WEAPON_DEFS[slot.type];
  if (!weaponDef || !weaponDef.compatibleAmmo.includes(ammoType)) {
    return [
      '',
      '  [BUY] ' + slot.name + ' cannot use ' + ammoType + ' ammo.',
      '  Compatible: ' + (weaponDef ? weaponDef.compatibleAmmo.join(', ') : 'none'),
      '',
    ].join('\n');
  }

  const cost = ammoPrice(ammoType, amount, ctx.stock.priceMod, ctx.tier);

  if (playerState.credits < cost) {
    return ['', '  [BUY] Insufficient scrip.', '  Cost: ' + cost + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
  }

  // Check ammo bay mass
  const massPerRound = weaponDef.massPerRound[ammoType] || 0;
  const addedMass    = massPerRound * amount;
  const currentMass  = calcAmmoBayUsed(ship);

  if (currentMass + addedMass > ship.ammoBayMax) {
    const canFit = Math.floor((ship.ammoBayMax - currentMass) / massPerRound);
    return [
      '',
      '  [BUY] Insufficient ammo bay capacity.',
      '  Requested: ' + addedMass.toFixed(1) + ' kg  |  Available: ' + (ship.ammoBayMax - currentMass).toFixed(1) + ' kg',
      '  Can fit: ' + canFit + ' rounds of ' + ammoType,
      '',
    ].join('\n');
  }

  // Stage confirmation
  playerState.pendingTx = {
    type:      'buy_ammo',
    slotId,
    ammoType,
    amount,
    cost,
    massPerRound,
  };

  const ammoDef = AMMO_DEFS[ammoType] || { name: ammoType };

  return [
    '',
    '  [BUY] Confirm ammo purchase?',
    '',
    '  Weapon : ' + slot.name + '  [Slot ' + slotId + ']',
    '  Ammo   : ' + ammoDef.name + ' (' + ammoType + ')  x' + amount,
    '  Mass   : +' + addedMass.toFixed(1) + ' kg',
    '  Cost   : ' + cost + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdSellWeapon(args) {
  if (!playerState.docked) return '  [SELL] Must be docked.';
  if (args[0] === 'weapon' || args[0] === 'cargo') return cmdSellWeapon(args);
  
  const ctx  = getArmoryContext();
  const ship = getShip();
  if (!ship.cargoWeapons) ship.cargoWeapons = [];

  const source = args[1]; // 'slot' number or 'cargo' number
  const index  = parseInt(args[2]);

  let weaponType, condition, sourceName, removeWeapon;

  if (source === 'cargo') {
    const cargoIdx = index - 1;
    const cw = ship.cargoWeapons[cargoIdx];
    if (!cw) return '  [SELL] No weapon in cargo slot ' + index + '.';
    weaponType  = cw.weaponType;
    condition   = cw.condition;
    sourceName  = 'Cargo ' + index;
    removeWeapon = () => ship.cargoWeapons.splice(cargoIdx, 1);
  } else {
    const slotId = parseInt(source);
    const slot   = ship.weaponSlots.find(s => s.id === slotId);
    if (!slot || !slot.type) return '  [SELL] No weapon in slot ' + slotId + '.';
    weaponType  = slot.type;
    condition   = slot.condition;
    sourceName  = 'Slot ' + slotId;
    removeWeapon = () => {
      slot.name = null; slot.type = null; slot.condition = null;
      slot.conditionMax = null; slot.active = false;
      slot.ammo = {}; slot.activeAmmo = null; slot.massPerRound = {};
    };
  }

  const value = sellWeaponValue(weaponType, condition, ctx ? ctx.tier : 'UNKNOWN');
  const def   = WEAPON_DEFS[weaponType];

  playerState.pendingTx = {
    type:         'sell_weapon',
    weaponType,
    value,
    sourceName,
    removeWeapon,
  };

  return [
    '',
    '  [SELL] Confirm sale?',
    '',
    '  Weapon    : ' + (def ? def.name : weaponType) + '  [' + sourceName + ']',
    '  Condition : ' + condition + '/100',
    '  You get   : ' + value + ' CR  (market rate)',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdRepairWeapon(args) {
  if (!playerState.docked) return '  [REPAIR] Must be docked.';
  const ctx = getArmoryContext();
  if (!ctx || !ctx.stock || !ctx.stock.repair) {
    return ['', '  [REPAIR] No weapon repair service at this station.', ''].join('\n');
  }
  const ship   = getShip();
  const slotId = parseInt(args[1]);
  if (isNaN(slotId)) return '  [REPAIR] Usage: repair weapon <slot>';
  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot || !slot.type) return '  [REPAIR] No weapon in slot ' + slotId + '.';
  const damage = slot.conditionMax - slot.condition;
  if (damage <= 0) return ['', '  [REPAIR] Weapon is already at full condition.', ''].join('\n');
  const loc = playerState.location;
  const q   = galaxy.quadrants[loc.quadrantIndex];
  const costPerPoint = { Established: 5, Contested: 8, Declining: 12,
                          Collapsed: 20, Isolated: 15, Forbidden: 25 }[q.state] || 8;

  // No subcommand — show quote
  if (!args[2]) {
    return [
      '',
      '  [REPAIR] ' + slot.name,
      '  Condition : ' + slot.condition + '/100',
      '  Damage    : ' + damage + ' points',
      '  Cost      : ' + (damage * costPerPoint) + ' CR  (' + costPerPoint + ' CR/point)',
      '  Scrip     : ' + playerState.credits + ' CR',
      '',
      '  repair weapon ' + slotId + ' full     — full repair',
      '  repair weapon ' + slotId + ' <amount> — partial repair',
      '',
    ].join('\n');
  }

  // Determine amount
  let amount;
  if (args[2] === 'full') {
    amount = damage;
  } else {
    amount = parseInt(args[2]);
    if (isNaN(amount) || amount <= 0) return '  [REPAIR] Usage: repair weapon ' + slotId + ' full  or  repair weapon ' + slotId + ' <amount>';
    amount = Math.min(amount, damage);
  }

  const cost = amount * costPerPoint;
  if (playerState.credits < cost) {
    return ['', '  [REPAIR] Insufficient scrip.', '  Cost: ' + cost + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
  }

  // Execute repair
  slot.condition = Math.min(slot.conditionMax, slot.condition + amount);
  playerState.credits -= cost;
  autosave();
  updateSidebar();

  return [
    '',
    '  [REPAIR] ' + slot.name + ' repaired.',
    '  Condition : ' + slot.condition + '/100',
    '  Cost      : ' + cost + ' CR',
    '  Scrip     : ' + playerState.credits + ' CR',
    '',
  ].join('\n');
}
function cmdRepairSystem(args) {
  if (!playerState.docked) return '  [REPAIR] Must be docked.';

  const ctx = getArmoryContext();
  if (!ctx || !ctx.stock || !ctx.stock.repair) {
    return ['', '  [REPAIR] No subsystem repair service at this station.', ''].join('\n');
  }

  const ship  = getShip();
  const query = args.slice(1).join('_').toLowerCase();

  // Find matching subsystem
  const subKey = Object.keys(ship.subsystems).find(k =>
    k.includes(query) || query.includes(k.replace('_', ''))
  );

  if (!subKey) {
    return [
      '',
      '  [REPAIR] Unknown subsystem.',
      '  Available: ' + Object.keys(ship.subsystems).map(k => k.replace('_', ' ')).join(', '),
      '',
    ].join('\n');
  }

  const sub      = ship.subsystems[subKey];
  const hpDamage = sub.hpMax - sub.hp;
  const staDamage = sub.staMax - sub.sta;

  if (hpDamage === 0 && staDamage === 0) {
    return ['', '  [REPAIR] ' + sub.name + ' is fully operational.', ''].join('\n');
  }

  const loc = playerState.location;
  const q   = galaxy.quadrants[loc.quadrantIndex];
  const costPerPoint = { Established: 12, Contested: 18, Declining: 25,
                          Collapsed: 50, Isolated: 30, Forbidden: 60 }[q.state] || 18;
  const totalCost = (hpDamage + staDamage) * costPerPoint;

  playerState.pendingTx = {
    type:    'repair_system',
    subKey,
    hpDamage,
    staDamage,
    cost:    totalCost,
  };

  return [
    '',
    '  [REPAIR] Confirm subsystem repair?',
    '',
    '  Subsystem : ' + sub.name,
    '  HP damage : ' + hpDamage + ' points',
    '  STA damage: ' + staDamage + ' points',
    '  Cost      : ' + totalCost + ' CR',
    '  Scrip     : ' + playerState.credits + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

function cmdInstall(args) {
  const ship = getShip();
  if (!ship.cargoWeapons) ship.cargoWeapons = [];

  const slotId   = parseInt(args[0]);
  const cargoIdx = parseInt(args[1]) - 1;

  if (isNaN(slotId) || isNaN(cargoIdx)) {
    return '  [INSTALL] Usage: install <slot> <cargo#>';
  }

  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot) return '  [INSTALL] Invalid slot number.';
  if (slot.type) return '  [INSTALL] Slot ' + slotId + ' is occupied. Uninstall first.';

  const cw = ship.cargoWeapons[cargoIdx];
  if (!cw) return '  [INSTALL] No weapon in cargo position ' + (cargoIdx + 1) + '.';

  // Install
  slot.name         = cw.name;
  slot.type         = cw.weaponType;
  slot.condition    = cw.condition;
  slot.conditionMax = cw.conditionMax;
  slot.active       = true;
  slot.ammo         = cw.ammo || {};
  slot.activeAmmo   = cw.activeAmmo;
  slot.massPerRound = cw.massPerRound || {};

  const def = WEAPON_DEFS[cw.weaponType];
  if (def) {
    slot.burstMin      = def.burstMin;
    slot.burstMax      = def.burstMax;
    slot.powerPerBurst = def.powerPerBurst;
  }

  ship.cargoWeapons.splice(cargoIdx, 1);

  return [
    '',
    '  [INSTALL] ' + slot.name + ' installed in slot ' + slotId + '.',
    '  Condition: ' + slot.condition + '/100',
    '',
  ].join('\n');
}

function cmdUninstall(args) {
  const ship   = getShip();
  if (!ship.cargoWeapons) ship.cargoWeapons = [];

  const slotId = parseInt(args[0]);
  if (isNaN(slotId)) return '  [UNINSTALL] Usage: uninstall <slot>';

  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot || !slot.type) return '  [UNINSTALL] No weapon in slot ' + slotId + '.';

  ship.cargoWeapons.push({
    weaponType:   slot.type,
    name:         slot.name,
    condition:    slot.condition,
    conditionMax: slot.conditionMax,
    ammo:         slot.ammo || {},
    activeAmmo:   slot.activeAmmo,
    massPerRound: slot.massPerRound || {},
  });

  const name = slot.name;
  slot.name = null; slot.type = null; slot.condition = null;
  slot.conditionMax = null; slot.active = false;
  slot.ammo = {}; slot.activeAmmo = null; slot.massPerRound = {};

  return [
    '',
    '  [UNINSTALL] ' + name + ' moved to cargo hold.',
    '  Cargo weapons: ' + ship.cargoWeapons.length,
    '',
  ].join('\n');
}

// ── Status ────────────────────────────────────

function cmdStatus() {
  const ship       = getShip();
  const dockStatus = playerState.docked ? 'Docked at ' + playerState.dockedAt : 'In space';
  const active     = activeContracts.find(c => !c.completed && !c.failed);

  const hullPct  = ship ? Math.round((ship.hull / ship.hullMax) * 100) : 0;
  const fuelPct  = ship ? Math.round((ship.fuel / ship.fuelMax) * 100) : 0;
  const powerPct = ship ? Math.round((ship.powerCore.current / ship.powerCore.max) * 100) : 0;

  const hullBar  = '█'.repeat(Math.round(hullPct  / 10)) + '░'.repeat(10 - Math.round(hullPct  / 10));
  const fuelBar  = '█'.repeat(Math.round(fuelPct  / 10)) + '░'.repeat(10 - Math.round(fuelPct  / 10));
  const powerBar = '█'.repeat(Math.round(powerPct / 10)) + '░'.repeat(10 - Math.round(powerPct / 10));

  return [
    '',
    '  ── SHIP STATUS ───────────────────────────────────────────────',
    '',
    '  Captain   : ' + playerState.captainName,
    '  Vessel    : ' + (ship ? ship.name + '  (' + ship.designation + ')' : '—'),
    '  Status    : ' + dockStatus,
    '  Day       : ' + playerState.currentDay,
    '',
    '  Hull      : ' + hullBar + '  ' + (ship ? ship.hull + '/' + ship.hullMax : '—'),
    '  Fuel      : ' + fuelBar + '  ' + (ship ? ship.fuel + '/' + ship.fuelMax : '—'),
    '  Power     : ' + powerBar + '  ' + (ship ? ship.powerCore.current + '/' + ship.powerCore.max : '—') + '  [' + (ship ? powerStatus(ship) : '—') + ']',
    '',
    '  Scrip     : ' + playerState.credits + ' CR',
    '  Veydrite  : ' + playerState.veydrite + ' kg',
    '',
    active
      ? '  CONTRACT  : ' + active.title + '  [Day ' + (active.issuedDay + active.timeLimitDays) + ' deadline]'
      : '  CONTRACT  : none active',
    '',
    '  UTILITY   : ' + (ship && ship.utilitySlots[0] ? ship.utilitySlots[0].name : '— empty') ,
    '',
  ].join('\n');
}

// ── Where ─────────────────────────────────────


function cmdSystem() {
  if (!playerState.location) return '  [STATUS] No location fix.';
  const loc = playerState.location;
  const q = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const bodies = normalizeSystemBodies(sys);
  const stations = bodies.filter(b => b.hasStation);
  const ruins = bodies.filter(b => b.hasRuin);
  const veydrite = bodies.filter(b => b.veydrite);
  const currentBody = getCurrentBody(sys);
  const anchor = sys.isAnchor ? '  ◆ ANCHOR' : '';

  const lines = [
    '',
    '  ── SYSTEM SURVEY ─────────────────────────────────────────────',
    '',
    '  System   : ' + sys.name + anchor,
    '  Cluster  : ' + cluster.name,
    '  Quadrant : ' + q.name + '  [' + (loc.quadrantIndex + 1) + ']  [' + q.state + ']',
    '  Star     : ' + sys.starClass + '-class',
    '  Bodies   : ' + bodies.length + ' indexed locations',
    '  Jumps    : ' + sys.jumpPoints + ' outbound',
    '  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard) + '  (' + sys.hazard + '/5)',
    '  Traffic  : ' + '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic) + '  (' + sys.traffic + '/5)',
    currentBody ? ('  Position : ' + formatBodyDisplayName(currentBody) + '  [' + getBodyKindLabel(currentBody) + ']') : '  Position : system-level approach',
    '',
    '  ── ASSETS ───────────────────────────────────────────────────',
    '',
    '  Stations : ' + (stations.length ? stations.length + ' detected' : 'none detected'),
  ];

  if (stations.length > 0) {
    stations.forEach(b => {
      const f = b.faction || FACTIONS.independent;
      const rep = getRep(b.factionKey);
      const tier = rep !== null ? '  [' + repTier(rep) + ']' : '';
      lines.push('    — ' + (b.stationName || formatBodyDisplayName(b)) + '  [' + f.short + ']' + tier);
    });
    lines.push('  ' + stationDescription(q.state));
  }

  lines.push('');
  lines.push('  Ruins    : ' + (ruins.length ? ruins.length + ' site(s) on record' : 'none on record'));
  if (ruins.length > 0) lines.push('  ' + ruinDescription(q.state));
  lines.push('');
  lines.push('  Veydrite : ' + (veydrite.length ? ('POSITIVE — ' + veydrite.length + ' body/bodies') : 'negative'));
  if (veydrite.length > 0) lines.push('  ' + veydriteRating(sys.starClass));
  lines.push('');
  lines.push('  ── BODY INDEX ───────────────────────────────────────────────');
  lines.push('');
  bodies.forEach(body => lines.push('  ' + formatBodyLine(body)));
  lines.push('');
  lines.push('  ── OPERATOR NOTE ────────────────────────────────────────────');
  lines.push('');
  lines.push('  ' + systemFlavor(sys, q.state));
  lines.push('');
  return lines.join('\n');
}

function cmdWhere() {
  if (!playerState.location) return '  [STATUS] No location fix.';
  const loc = playerState.location;
  const q = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const bodies = normalizeSystemBodies(sys);
  const currentBody = getCurrentBody(sys);
  const anchor = sys.isAnchor ? '  ◆ ANCHOR' : '';

  const bodyStations = currentBody && currentBody.hasStation ? [currentBody] : [];
  const bodyRuins = currentBody && currentBody.hasRuin ? [currentBody] : [];
  const bodyVeydrite = currentBody && currentBody.veydrite ? [currentBody] : [];
  const siblings = currentBody
    ? bodies.filter(b => b.id !== currentBody.id && (b.parentId ? b.parentId === currentBody.parentId : true)).slice(0, 3)
    : [];

  const lines = [
    '',
    '  ── CURRENT POSITION ──────────────────────────────────────────',
    '',
    '  System   : ' + sys.name + anchor,
    '  Cluster  : ' + cluster.name,
    '  Quadrant : ' + q.name + '  [' + (loc.quadrantIndex + 1) + ']  [' + q.state + ']',
    currentBody
      ? ('  Position : ' + formatBodyDisplayName(currentBody) + '  [' + getBodyKindLabel(currentBody) + ']')
      : '  Position : system-level approach',
    '  Day      : ' + playerState.currentDay,
    '',
    '  ── LOCAL READOUT ─────────────────────────────────────────────',
    '',
    '  Star     : ' + sys.starClass + '-class',
    '  Jumps    : ' + sys.jumpPoints + ' outbound',
    '  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard) + '  (' + sys.hazard + '/5)',
    '  Traffic  : ' + '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic) + '  (' + sys.traffic + '/5)',
  ];

  lines.push('');
  lines.push('  ── LOCAL CONDITIONS ─────────────────────────────────────────');
  lines.push('');
  lines.push('  Station  : ' + (bodyStations.length ? 'present' : 'none detected on current body'));
  if (bodyStations.length) {
    bodyStations.forEach(b => {
      const f = b.faction || FACTIONS.independent;
      lines.push('    — ' + (b.stationName || formatBodyDisplayName(b)) + '  [' + f.short + ']');
    });
  }
  lines.push('  Ruins    : ' + (bodyRuins.length ? 'present' : 'none detected on current body'));
  lines.push('  Veydrite : ' + (bodyVeydrite.length ? 'positive signature' : 'negative on current body'));

  lines.push('');
  lines.push('  ── NEARBY BODIES ────────────────────────────────────────────');
  lines.push('');
  if (siblings.length > 0) {
    siblings.forEach(body => lines.push('  ' + formatBodyLine(body)));
  } else {
    lines.push('  No nearby indexed bodies in immediate readout.');
  }

  lines.push('');
  lines.push('  ── FIELD NOTES ───────────────────────────────────────────────');
  lines.push('');
  lines.push('  ' + systemFlavor(sys, q.state));
  lines.push('');
  lines.push('  Use "system" for full survey and complete body index.');
  lines.push('');

  if (typeof updateAuspex === 'function') updateAuspex();
  if (!playerState.visitedSystems) playerState.visitedSystems = {};
  playerState.visitedSystems[sys.name] = true;
  return lines.join('\n');
}

function cmdRep() {
  const sys = getCurrentSystem();
  return renderRep(sys);
}

// ── Area command ──────────────────────────────
 
// Compartment metadata — display names and available commands per compartment.
const COMPARTMENT_META = {
  bridge: {
    label:    'Bridge',
    commands: ['nav', 'fold', 'blindfold', 'map', 'galaxy', 'where', 'system',
               'ping', 'resolve', 'scan', 'deepscan', 'clusterdeepscan',
               'status', 'systems'],
  },
  engineering: {
    label:    'Engineering',
    commands: ['power', 'recharge', 'repair drive', 'emergency refine',
               'fold cell status', 'power management', 'systems'],
  },
  cargo: {
    label:    'Cargo Bay',
    commands: ['inventory', 'jettison', 'transfer', 'manifest'],
  },
  quarters: {
    label:    'Crew Quarters',
    commands: ['rest', 'crew status'],
  },
  airlock: {
    label:    'Airlock',
    commands: ['deploy tool', 'retrieve tool', 'swap pod'],
  },
  reserve_tank: {
    label:    'Reserve Tank Bay',
    commands: ['emergency refine', 'check reserve', 'fill reserve'],
  },
  extraction: {
    label:    'Extraction Bay',
    commands: ['mine', 'survey', 'pod status', 'ore manifest'],
  },
  salvage_bay: {
    label:    'Salvage Bay',
    commands: ['salvage', 'scan log', 'salvage manifest'],
  },
  refinery: {
    label:    'Refinery',
    commands: ['refine', 'refine all', 'yield check'],
  },
  weapons_bay: {
    label:    'Weapons Bay',
    commands: ['load', 'unload', 'weapon status', 'ammo count'],
  },
  flight_deck: {
    label:    'Flight Deck',
    commands: ['launch', 'recall', 'flight status'],
  },
};
 
// ---------------------------------------------------------------------------
// Procedural flavor text generators — one per compartment.
// Each receives the ship object and returns a single descriptive line.
// Text reacts to power state, hull integrity, subsystem damage, and docked state.
// ---------------------------------------------------------------------------
 
function areaFlavor_bridge(ship, docked) {
  const pwr   = powerStatus(ship);
  const hull  = Math.round((ship.hull / ship.hullMax) * 100);
  const sensor = ship.subsystems && ship.subsystems.sensor_suite;
  const sensorDamaged = sensor && sensor.hp < sensor.hpMax * 0.5;
 
  if (pwr === 'EMERGENCY') return 'The displays are dim. Emergency lighting only. Half the consoles are dark.';
  if (pwr === 'CRITICAL')  return 'Readouts flicker. The navigation array is pulling from reserve. Fold calculations are suspended.';
  if (sensorDamaged)       return 'The sensor suite is degraded. Auspex returns incomplete data. Ping range is reduced.';
  if (hull < 30)           return 'Warning indicators crowd the damage panel. The hull is not in good shape. Neither is the mood on this bridge.';
  if (docked)              return 'Shore power connected. All consoles nominal. The station feed scrolls quietly in the background.';
  if (pwr === 'FULL')      return 'All displays nominal. Navigation array locked. The galaxy is waiting.';
  return 'Consoles nominal. Sensor array passive. Nothing unusual on the boards.';
}
 
function areaFlavor_engineering(ship) {
  const drive  = ship.subsystems && ship.subsystems.drive;
  const pcore  = ship.subsystems && ship.subsystems.power_core;
  const pwr    = powerStatus(ship);
  const driveDamaged  = drive  && drive.hp  < drive.hpMax  * 0.5;
  const pcoreDamaged  = pcore  && pcore.hp  < pcore.hpMax  * 0.5;
 
  if (pwr === 'EMERGENCY')  return 'The power core is nearly spent. The recharge coils are cycling at minimum. Everything else is waiting.';
  if (pwr === 'CRITICAL')   return 'Core output is low. The drive is running on what it has. Do not attempt a fold from this state.';
  if (driveDamaged && pcoreDamaged) return 'Both the drive and the power core are showing significant damage. This ship needs a station.';
  if (driveDamaged)         return 'The drive is damaged. Nav and fold functions are degraded. Repair before attempting transit.';
  if (pcoreDamaged)         return 'The power core is running below rated output. Recharge rate is reduced. Dock when possible.';
  if (pwr === 'FULL')       return 'Core at capacity. Drive nominal. Fold cells loaded. Engineering is in good shape.';
  return 'Core cycling normally. Drive nominal. The hum of the power plant fills the space.';
}
 
function areaFlavor_cargo(ship, playerState) {
  const cargoHold = ship.subsystems && ship.subsystems.cargo_hold;
  const holdDamaged = cargoHold && cargoHold.hp < cargoHold.hpMax * 0.5;
  const hasOre      = playerState.oreHold && Object.keys(playerState.oreHold).some(k => playerState.oreHold[k] > 0);
  const hasVeyd     = playerState.veydrite > 0;
  const podSolid    = playerState.orePods && playerState.orePods.solid > 0;
 
  if (holdDamaged) return 'The hold is showing structural damage. Cargo integrity is at risk. Do not jettison unless necessary.';
  if (hasOre && podSolid) return 'Ore pods are loaded. The hold smells like rock dust and machine heat. Good work.';
  if (hasVeyd) return 'Veydrite in the hold. ' + playerState.veydrite + ' kg. It sits quiet, the way valuable things do.';
  if (!hasVeyd && !hasOre) return 'The hold is empty. It echoes. That is either a problem or an opportunity, depending on where you are.';
  return 'Hold integrity nominal. Cargo secured.';
}
 
function areaFlavor_quarters(ship) {
  const life = ship.subsystems && ship.subsystems.life_support;
  const crew = ship.subsystems && ship.subsystems.crew_quarters;
  const lifeDamaged = life && life.hp < life.hpMax * 0.5;
  const crewDamaged = crew && crew.hp < crew.hpMax * 0.5;
  const hull = Math.round((ship.hull / ship.hullMax) * 100);
 
  if (lifeDamaged) return 'Life support is degraded. The air is thin. CO2 scrubbers are running at reduced capacity. This is urgent.';
  if (crewDamaged) return 'The quarters took damage. Some bunks are unsealed. The structural integrity report makes for uncomfortable reading.';
  if (hull < 30)   return 'The hull damage is audible from here. The ship makes sounds it should not make. Sleep is unlikely.';
  return 'Quarters nominal. Life support cycling. It is not comfortable, but it is adequate.';
}
 
function areaFlavor_airlock(ship, docked) {
  const hull = Math.round((ship.hull / ship.hullMax) * 100);
 
  if (docked)    return 'Docked and sealed. The station umbilical is connected. External hardpoints are accessible for pod management.';
  if (hull < 30) return 'The outer hull is compromised. EVA is not recommended in this condition. The void is less forgiving than usual when you are already damaged.';
  return 'Airlock sealed. Pressure nominal. External hardpoints accessible. The dark is right on the other side of that door.';
}
 
function areaFlavor_reserve_tank(ship, playerState) {
  const reserve = playerState.reserveVeydrite || 0;
  const pct     = Math.round((reserve / 15) * 100);
 
  if (reserve <= 0)  return 'The reserve tank is empty. You have no emergency fold capability. Fill this before entering Collapsed space.';
  if (reserve < 5)   return 'Reserve critically low — ' + reserve.toFixed(1) + ' kg. Less than one emergency fold available. Prioritize refill.';
  if (reserve < 10)  return 'Reserve at ' + reserve.toFixed(1) + ' kg — ' + pct + '%. One emergency fold available if you are careful.';
  if (reserve >= 15) return 'Reserve full — 15 kg. One emergency fold guaranteed. The tank is doing its job.';
  return 'Reserve at ' + reserve.toFixed(1) + ' kg — ' + pct + '%. Emergency fold capability standing by.';
}
 
function areaFlavor_extraction(ship, playerState) {
  const miningSlot = ship.utilitySlots && ship.utilitySlots.find(s => s.type === 'mining_auger');
  const podSolid   = playerState.orePods && playerState.orePods.solid || 0;
  const podCap     = 50;
 
  if (!miningSlot)           return 'No mining tool detected in utility slots. The extraction bay is quiet. Install an Auger-1 to begin operations.';
  if (podSolid >= podCap)    return 'Ore pod at capacity. The bay is full. Offload at a station before running another extraction cycle.';
  if (podSolid > podCap * 0.7) return 'Ore pod ' + Math.round((podSolid / podCap) * 100) + '% full. Room for more, but plan your next offload.';
  if (miningSlot.condition < 40) return 'The Auger array is showing wear — condition ' + miningSlot.condition + '/100. Operations will continue but plan for repair.';
  return 'Auger array nominal. Ore pod ready. Run survey node to identify extraction targets.';
}
 
function areaFlavor_salvage_bay(ship) {
  const salvageSlot = ship.utilitySlots && ship.utilitySlots.find(s => s.type === 'salvage_cutter');
 
  if (!salvageSlot)              return 'No salvage tool detected. The Harrow mount is empty. Install a Harrow-7 to begin salvage operations.';
  if (salvageSlot.condition < 20) return 'Harrow-7 is in critical condition — ' + salvageSlot.condition + '/100. Jam probability is high. Repair before operating.';
  if (salvageSlot.condition < 40) return 'Harrow-7 is worn — condition ' + salvageSlot.condition + '/100. It will work, but not reliably. Repair when you can.';
  return 'Harrow-7 nominal. Ready for salvage operations. Find a ruin site, a debris field, or a veydrite deposit.';
}
 
function areaFlavor_refinery(ship, docked) {
  const hasOre = true; // check in cmdArea directly
 
  if (!docked) return 'The refinery is offline in open space. Dock at a station to access refinery services, or use onboard processing if this hull supports it.';
  return 'Refinery systems online. Station connection active. Ore ready for processing.';
}
 
function areaFlavor_weapons_bay(ship) {
  const weapons     = ship.weaponSlots || [];
  const armed       = weapons.filter(s => s.type);
  const totalAmmo   = armed.reduce((n, s) => n + Object.values(s.ammo || {}).reduce((a, b) => a + b, 0), 0);
  const weapArray   = ship.subsystems && ship.subsystems.weapons_array;
  const arrayDamaged = weapArray && weapArray.hp < weapArray.hpMax * 0.5;
 
  if (arrayDamaged)    return 'Weapons array is damaged. Fire control is degraded. Accuracy is reduced. Repair before entering contested space.';
  if (armed.length === 0) return 'No weapons installed. The bay is cold. The ship is not armed. Plan accordingly.';
  if (totalAmmo === 0) return armed.length + ' weapon(s) installed, no ammunition loaded. The guns are present. The rounds are not.';
  if (totalAmmo < 20)  return 'Ammunition running low across ' + armed.length + ' slot(s). Resupply at next station.';
  return armed.length + ' weapon(s) nominal. ' + totalAmmo + ' rounds across all slots. Weapons array standing by.';
}
 
function areaFlavor_flight_deck(ship) {
  return 'Flight deck pressurized. Fighter bays standing by. Launch authority requires Flight Deck command.';
}
 
// ---------------------------------------------------------------------------
// Subsystem status relevant to each compartment.
// Returns an array of { label, value, alert } objects for display.
// ---------------------------------------------------------------------------
 
function areaSubsystems(compartmentId, ship, playerState) {
  const s = ship.subsystems || {};
  const pwr = ship.powerCore || {};
 
  const fmt = (sub) => {
    if (!sub) return null;
    const pct = Math.round((sub.hp / sub.hpMax) * 100);
    const alert = pct < 30 ? 'CRITICAL' : pct < 60 ? 'DAMAGED' : null;
    return { label: sub.name, value: pct + '%  HP: ' + sub.hp + '/' + sub.hpMax, alert };
  };
 
  const powerRow = {
    label: 'Power Core',
    value: pwr.current + '/' + pwr.max + '  [' + powerStatus(ship) + ']',
    alert: powerStatus(ship) === 'EMERGENCY' ? 'EMERGENCY'
         : powerStatus(ship) === 'CRITICAL'  ? 'CRITICAL' : null,
  };
 
  const cellRow = {
    label: 'Fold Cells',
    value: (playerState.foldCells || 0) + ' / 20',
    alert: (playerState.foldCells || 0) === 0 ? 'EMPTY' : (playerState.foldCells || 0) < 3 ? 'LOW' : null,
  };
 
  switch (compartmentId) {
    case 'bridge':
      return [
        powerRow,
        cellRow,
        fmt(s.sensor_suite),
        fmt(s.weapons_array),
      ].filter(Boolean);
 
    case 'engineering':
      return [
        powerRow,
        cellRow,
        fmt(s.power_core),
        fmt(s.drive),
      ].filter(Boolean);
 
    case 'cargo':
      return [
        fmt(s.cargo_hold),
        {
          label: 'Veydrite Hold',
          value: (playerState.veydrite || 0) + ' kg',
          alert: null,
        },
        {
          label: 'Ore Pod (solid)',
          value: ((playerState.orePods && playerState.orePods.solid) || 0) + ' / 50 units',
          alert: null,
        },
      ].filter(Boolean);
 
    case 'quarters':
      return [
        fmt(s.life_support),
        fmt(s.crew_quarters),
        fmt(s.galley),
      ].filter(Boolean);
 
    case 'airlock':
      return [
        {
          label: 'Hull Integrity',
          value: ship.hull + '/' + ship.hullMax + '  (' + Math.round((ship.hull / ship.hullMax) * 100) + '%)',
          alert: ship.hull < ship.hullMax * 0.3 ? 'CRITICAL' : ship.hull < ship.hullMax * 0.6 ? 'DAMAGED' : null,
        },
        fmt(s.hull_core),
      ].filter(Boolean);
 
    case 'reserve_tank':
      return [
        {
          label: 'Reserve Veydrite',
          value: ((playerState.reserveVeydrite || 0)).toFixed(1) + ' / 15 kg',
          alert: (playerState.reserveVeydrite || 0) < 5 ? 'LOW' : null,
        },
        powerRow,
      ].filter(Boolean);
 
    case 'extraction':
      return [
        powerRow,
        {
          label: 'Ore Pod (solid)',
          value: ((playerState.orePods && playerState.orePods.solid) || 0) + ' / 50 units',
          alert: null,
        },
        {
          label: 'Ore Pod (liquid)',
          value: ((playerState.orePods && playerState.orePods.liquid) || 0) + ' / 50 units',
          alert: null,
        },
      ].filter(Boolean);
 
    case 'salvage_bay':
      return [
        powerRow,
        {
          label: 'Veydrite Hold',
          value: (playerState.veydrite || 0) + ' kg',
          alert: null,
        },
        {
          label: 'Reserve Tank',
          value: ((playerState.reserveVeydrite || 0)).toFixed(1) + ' / 15 kg',
          alert: (playerState.reserveVeydrite || 0) < 5 ? 'LOW' : null,
        },
      ].filter(Boolean);
 
    case 'refinery':
      return [
        fmt(s.cargo_hold),
        {
          label: 'Ore in Hold',
          value: playerState.oreHold
            ? Object.values(playerState.oreHold).reduce((a, b) => a + b, 0) + ' units'
            : '0 units',
          alert: null,
        },
      ].filter(Boolean);
 
    case 'weapons_bay':
      return [
        powerRow,
        fmt(s.weapons_array),
        {
          label: 'Ammo Bay',
          value: (ship.ammoBayUsed || 0) + ' / ' + (ship.ammoBayMax || 200) + ' kg',
          alert: null,
        },
      ].filter(Boolean);
 
    case 'flight_deck':
      return [
        powerRow,
        {
          label: 'Fighter Bays',
          value: '4 bays',
          alert: null,
        },
      ].filter(Boolean);
 
    default:
      return [powerRow].filter(Boolean);
  }
}
 
// ---------------------------------------------------------------------------
// Main area command
// ---------------------------------------------------------------------------
 
function cmdArea() {
  const ship        = getShip();
  const compartment = playerState.currentCompartment || 'bridge';
  const meta        = COMPARTMENT_META[compartment];
 
  if (!ship)  return '  [AREA] No ship data available.';
  if (!meta)  return '  [AREA] Compartment not recognized: ' + compartment;
 
  const label   = meta.label;
  const docked  = playerState.docked;
 
  // Generate procedural flavor text
  const flavor = {
    bridge:      () => areaFlavor_bridge(ship, docked),
    engineering: () => areaFlavor_engineering(ship),
    cargo:       () => areaFlavor_cargo(ship, playerState),
    quarters:    () => areaFlavor_quarters(ship),
    airlock:     () => areaFlavor_airlock(ship, docked),
    reserve_tank:() => areaFlavor_reserve_tank(ship, playerState),
    extraction:  () => areaFlavor_extraction(ship, playerState),
    salvage_bay: () => areaFlavor_salvage_bay(ship),
    refinery:    () => areaFlavor_refinery(ship, docked),
    weapons_bay: () => areaFlavor_weapons_bay(ship),
    flight_deck: () => areaFlavor_flight_deck(ship),
  }[compartment];
 
  const flavorText = flavor ? flavor() : 'Systems nominal.';
 
  // Get relevant subsystem status
  const subsystems = areaSubsystems(compartment, ship, playerState);
 
  // Filter commands to those on this ship
  const availableCompartments = (ship.compartments && Array.isArray(ship.compartments))
    ? ship.compartments
    : ['bridge', 'engineering', 'cargo', 'quarters', 'airlock'];
 
  const lines = [
    '',
    '  ── ' + label.toUpperCase() + ' ──────────────────────────────────────────────────',
    '',
    '  ' + flavorText,
    '',
  ];
 
  // Subsystem status block
  if (subsystems.length > 0) {
    lines.push('  ── STATUS ───────────────────────────────────────────────────');
    lines.push('');
    subsystems.forEach(sub => {
      const alertTag = sub.alert ? '  [' + sub.alert + ']' : '';
      lines.push('  ' + sub.label.padEnd(20) + sub.value + alertTag);
    });
    lines.push('');
  }
 
  // Available commands in this compartment
  lines.push('  ── AVAILABLE HERE ───────────────────────────────────────────');
  lines.push('');
 
  const cmds = meta.commands;
  // Display in two columns
  for (let i = 0; i < cmds.length; i += 2) {
    const left  = cmds[i]   ? cmds[i].padEnd(28)   : '';
    const right = cmds[i+1] ? cmds[i+1]             : '';
    lines.push('  ' + left + right);
  }
 
  lines.push('');
 
  // Other compartments — quick move list
  const otherCompartments = availableCompartments.filter(c => c !== compartment);
  if (otherCompartments.length > 0) {
    lines.push('  ── OTHER COMPARTMENTS ───────────────────────────────────────');
    lines.push('');
    otherCompartments.forEach(c => {
      const m = COMPARTMENT_META[c];
      if (m) lines.push('  move ' + c.replace('_', ' ').padEnd(22) + m.label);
    });
    lines.push('');
  }
 
  return lines.join('\n');
}
 
 

// ── Charts ────────────────────────────────────

function cmdCharts(args) {
  const records = playerState.astrographics;
  if (!records || records.length === 0) {
    return [
      '',
      '  [CHARTS] No astrographic data on record.',
      '  Run deepscan on systems to generate chart data.',
      '',
    ].join('\n');
  }

  // charts <system name> — show detail for a specific record
  if (args.length > 0) {
    const query  = args.join(' ').toLowerCase();
    const entry  = records.find(r => r.systemName.toLowerCase().includes(query));
    if (!entry) {
      return [
        '',
        '  [CHARTS] No record matching "' + args.join(' ') + '".',
        '  Type "charts" to list all records.',
        '',
      ].join('\n');
    }

    const d       = entry.data;
    const age     = playerState.currentDay - entry.scannedDay;
    const quality = entry.quality === 'deep' ? 'Deep scan' : 'Basic scan';

    const lines = [
      '',
      '  ── CHART RECORD: ' + entry.systemName.toUpperCase() + ' ──────────────────────────',
      '',
      '  Quality     : ' + quality + '  (' + entry.units + ' units)',
      '  Recorded    : Day ' + entry.scannedDay + '  (' + age + ' days ago)',
      '',
    ];

    if (entry.quality === 'deep' && d) {
      const hazardBar  = d.hazard  !== undefined ? '▲'.repeat(d.hazard)  + '△'.repeat(5 - d.hazard)  : '—';
      const trafficBar = d.traffic !== undefined ? '◉'.repeat(d.traffic) + '○'.repeat(5 - d.traffic) : '—';
      lines.push('  Star class  : ' + (d.starClass || '—') + '-type');
      lines.push('  Bodies      : ' + (d.bodyCount  || '—'));
      lines.push('  State       : ' + (d.state       || '—'));
      lines.push('  Hazard      : ' + hazardBar);
      lines.push('  Traffic     : ' + trafficBar);
      lines.push('  Jump points : ' + (d.jumpPoints  || '—') + ' outbound');
      lines.push('  Station     : ' + (d.hasStation  ? 'present' : 'none detected'));
      lines.push('  Veydrite    : ' + (d.hasVeydrite ? 'trace deposits  [VYD]' : 'none detected'));
      lines.push('  Ruins       : ' + (d.hasRuin     ? 'structural signatures  [RUN]' : 'none detected'));
    } else {
      lines.push('  Detail      : basic record only — deepscan for full data');
    }

    lines.push('');
    lines.push('  Type "sell astrographics" to sell this record at a Guild station.');
    lines.push('');
    return lines.join('\n');
  }

  // charts — list all records
  const repScore = getRep('guild');
  const lines    = [
    '',
    '  ── ASTROGRAPHIC RECORDS ──────────────────────────────────────',
    '',
    '  ' + records.length + ' system(s) on record.',
    '',
  ];

  records.forEach((entry, i) => {
    const val     = astrographicValue(entry, playerState.currentDay, repScore);
    const aging   = val.aging ? ' [aging]' : '';
    const quality = entry.quality === 'deep' ? 'deep' : 'basic';
    const age     = playerState.currentDay - entry.scannedDay;
    lines.push(
      '  [' + (i + 1) + '] ' + entry.systemName.padEnd(26) +
      quality.padEnd(8) +
      ('Day ' + entry.scannedDay).padEnd(10) +
      entry.units + ' units' + aging
    );
  });

  lines.push('');
  lines.push('  charts <system name>   — view full record');
  lines.push('  sell astrographics     — sell records at a Guild station');
  lines.push('');
  return lines.join('\n');
}

// ── Cluster Deepscan ──────────────────────────

function cmdClusterDeepscan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';

  const ship = getShip();
  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];
  if (!q) return '  [ERROR] Location data unavailable.';

  const query = args.join(' ').toLowerCase().trim();
  if (!query) return '  [CLUSTERDEEPSCAN] Usage: clusterdeepscan <cluster name>';

  // Find cluster in current quadrant
  let targetCluster = null;
  q.clusters.forEach(cluster => {
    if (cluster.name.toLowerCase().includes(query)) {
      targetCluster = cluster;
    }
  });

  if (!targetCluster) {
    return [
      '',
      '  [CLUSTERDEEPSCAN] No cluster matching "' + query + '" in this quadrant.',
      '  Use scan <#> to list clusters in your quadrant.',
      '',
    ].join('\n');
  }

  const systems    = targetCluster.systems;
  const costPerSys = 25;

  // Check we have enough power for at least one system
  if (ship.powerCore.current < costPerSys + 1) {
    return [
      '',
      '  [CLUSTERDEEPSCAN] Insufficient power to begin sweep.',
      '  Required: ' + (costPerSys + 1) + ' minimum  |  Available: ' + ship.powerCore.current,
      '',
    ].join('\n');
  }

  // Calculate how many systems we can scan
  const maxScannable = Math.floor((ship.powerCore.current - 1) / costPerSys);
  const toScan       = systems.slice(0, maxScannable);
  const skipped      = systems.length - toScan.length;

  // Return special prefix for main.js to handle sequentially
  const payload = {
    clusterName: targetCluster.name,
    systems:     toScan.map(sys => {
      const hasStation  = sys.bodies.some(b => b.hasStation);
      const hasRuin     = sys.bodies.some(b => b.hasRuin);
      const hasVeyd     = sys.bodies.some(b => b.veydrite);
      const bodyCount   = sys.bodies.length;
      const units       = astrographicYield(sys, 'deep', q.state);

      // Find station name
      let stationName = 'none detected';
      if (hasStation) {
        const stationBody = sys.bodies.find(b => b.hasStation);
        stationName = stationBody && stationBody.stationName
          ? stationBody.stationName
          : 'station present';
      }

      const hazardBar  = '▲'.repeat(sys.hazard)  + '△'.repeat(5 - sys.hazard);
      const trafficBar = '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic);

      return {
        name:       sys.name,
        starClass:  sys.starClass,
        bodyCount,
        hazard:     sys.hazard,
        traffic:    sys.traffic,
        jumpPoints: sys.jumpPoints,
        hasStation,
        hasRuin,
        hasVeyd,
        hasBeacon:  sys.hasBeacon,
        stationName,
        hazardBar,
        trafficBar,
        state:      q.state,
        units,
        costPerSys,
      };
    }),
    skipped,
    quadrantIndex: loc.quadrantIndex,
  };

// Data and power are applied per-system during display in main.js
  triggerAchievements({ type: 'cluster_sweep', clusterName: targetCluster.name });
  return '__CLUSTERDEEPSCAN__' + JSON.stringify(payload);
}

// ── Achievement helper ────────────────────────

function triggerAchievements(context) {
  const awarded = checkAchievements(playerState, context);
  if (!awarded || awarded.length === 0) return '';
  return awarded.map(a =>
    '\n  [RECORD] Guild Archive updated — ' + a.title
  ).join('');
}

// ── Record command ────────────────────────────

function cmdRecord() {
  return renderAchievements(playerState);
}

// ── Deepscan ──────────────────────────────────

function cmdPing() {
  if (!playerState.location) return '  [PING] No location fix.';

  const ship = getShip();
  const powerCost = 5;
  if (ship.powerCore.current < powerCost) {
    return ['', '  [PING] Insufficient power for gravimetric sweep.', '  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q && q.clusters.find(c => c.name === loc.clusterName)
    : q && q.clusters[loc.clusterIndex || 0];
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  drainPower(ship, powerCost);

  const isRepeatPing = currentContacts !== null;

  if (isRepeatPing) {
    const roll = Math.random();
    if (roll < 0.02) {
      const validContacts = currentContacts.filter(c => !c.xeno);
      if (validContacts.length >= 2) {
        const c1 = validContacts[Math.floor(Math.random() * validContacts.length)];
        let c2   = validContacts[Math.floor(Math.random() * validContacts.length)];
        while (c2 === c1) c2 = validContacts[Math.floor(Math.random() * validContacts.length)];
        const c1idx = currentContacts.indexOf(c1) + 1;
        const c2idx = currentContacts.indexOf(c2) + 1;
        if (Math.random() < 0.6) currentContacts.splice(currentContacts.indexOf(c2), 1);
        const lines = ['', '  [PING] Gravimetric sweep complete.', '  ' + currentContacts.length + ' contact(s) detected.', ''];
        currentContacts.forEach((c, i) => {
            lines.push(c.resolved && !c.xeno
              ? (c.dark
                ? '  ◈ [' + (i+1) + '] [NO SIGNATURE] — running dark'
                : '  ◈ [' + (i+1) + '] ' + (c.prefix ? c.prefix + ' ' : '') + (c.shipName ? '"' + c.shipName + '" — ' : '— ') + c.shipClass + '  [' + c.registry + ']')
            : '  ◈ [' + (i+1) + '] ' + (c.xeno ? 'mass-unknown' : c.mass));
        });
        lines.push('');
        lines.push('  [!] Weapons discharge detected — contacts ' + c1idx + ' and ' + c2idx + '.');
        lines.push('  One contact is no longer responding.');
        lines.push('');
        if (sys) contactCache[sys.name] = currentContacts;
        const anyResolved = currentContacts.some(c => c.resolved);
        updateAuspexTraffic(currentContacts, anyResolved ? 'mixed' : false);
        return lines.join('\n');
      }
    } else if (roll < 0.05) {
      const removable = currentContacts.filter(c => !c.xeno);
      if (removable.length > 0) {
        const gone = removable[Math.floor(Math.random() * removable.length)];
        currentContacts.splice(currentContacts.indexOf(gone), 1);
      }
    } else if (roll < 0.08) {
      const newContact = generateContacts(sys, q.state);
      if (newContact.length > 0) currentContacts.push(newContact[0]);
    }
  } else {
    if (contactCache[sys.name]) {
      currentContacts = contactCache[sys.name];
    } else {
      currentContacts = generateContacts(sys, q.state);
      contactCache[sys.name] = currentContacts;
    }
  }

  if (sys) contactCache[sys.name] = currentContacts;
  const anyResolved = currentContacts.some(c => c.resolved);
  updateAuspexTraffic(currentContacts, anyResolved ? 'mixed' : false);

  if (currentContacts.length === 0) {
    return ['', '  [PING] Gravimetric sweep complete.', '  No contacts in local space.', '  Power used: ' + powerCost + ' — Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  const lines = ['', '  [PING] Gravimetric sweep complete.', '  ' + currentContacts.length + ' contact(s) detected.', '  Power used: ' + powerCost + ' — Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''];
  currentContacts.forEach((c, i) => {
    if (c.resolved && !c.xeno) {
      if (c.dark) {
        lines.push('  ◈ [' + (i+1) + '] [NO SIGNATURE] — running dark');
      } else {
            lines.push('  ◈ [' + (i+1) + '] ' + (c.prefix ? c.prefix + ' ' : '') + (c.shipName ? '"' + c.shipName + '" — ' : '— ') + c.shipClass + '  [' + c.registry + ']');
      }
    } else {
      lines.push('  ◈ [' + (i+1) + '] ' + (c.xeno ? 'mass-unknown' : c.mass));
    }
  });
  lines.push('');
  lines.push('  Type "resolve <number>" to identify a contact.');
  lines.push('');
  return lines.join('\n');
}

// ── Resolve ───────────────────────────────────

function cmdResolve(args) {
  if (!playerState.location) return '  [RESOLVE] No location fix.';
  if (!currentContacts || currentContacts.length === 0) {
    return ['', '  [RESOLVE] No contacts to resolve. Run "ping" first.', ''].join('\n');
  }

  const ship = getShip();
  const powerCost = Math.max(3, Math.round(currentContacts.length * 1.5));
  if (ship.powerCore.current < powerCost) {
    return ['', '  [RESOLVE] Insufficient power.  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  if (args[0] === 'all') {
    drainPower(ship, powerCost * 2);
    const scanDays = Math.max(1, Math.floor(currentContacts.length * 0.4));
    playerState.currentDay += scanDays;
    const lines = ['', '  [RESOLVE] Scanning all contacts...', '  Scan duration: ' + scanDays + ' day(s).  Day: ' + playerState.currentDay, ''];
    currentContacts.forEach((c, i) => {
      if (c.xeno) { lines.push('  ◈ [' + (i+1) + '] [NO SIGNATURE] — does not resolve'); }
      else { c.resolved = true; lines.push(c.dark ? '  ◈ [' + (i+1) + '] [NO SIGNATURE] — running dark' : '  ◈ [' + (i+1) + '] ' + (c.prefix ? c.prefix + ' ' : '') + (c.shipName ? '"' + c.shipName + '" — ' : '— ') + c.shipClass + '  [' + c.registry + ']'); }
    });
    lines.push('');
    updateAuspexTraffic(currentContacts, true);
    return lines.join('\n');
  }

  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0 || index >= currentContacts.length) {
    return ['', '  [RESOLVE] Invalid contact.  Usage: resolve <1-' + currentContacts.length + '>  or  resolve all', ''].join('\n');
  }

  const contact  = currentContacts[index];
  const scanDays = Math.max(0, Math.round(currentContacts.length * 0.15));

  if (contact.resolved) {
    const lines = ['', '  [RESOLVE] Contact ' + (index+1) + ' already resolved.', ''];
    if (contact.xeno) { lines.push('  ◈ [' + (index+1) + '] [NO SIGNATURE] — does not resolve'); }
    else if (contact.dark) { lines.push('  ◈ [' + (index+1) + '] [NO SIGNATURE] — running dark'); }
    else { lines.push('  ◈ [' + (index+1) + '] ' + (contact.prefix ? contact.prefix + ' ' : '') + (contact.shipName ? '"' + contact.shipName + '" — ' : '') + contact.shipClass + '  [' + contact.registry + ']'); }
    lines.push('');
    return lines.join('\n');
  }

  drainPower(ship, powerCost);

  if (contact.xeno) {
    if (scanDays > 0) playerState.currentDay += scanDays;
    return ['', '  [RESOLVE] Scanning contact ' + (index+1) + '...', scanDays > 0 ? '  Scan duration: ' + scanDays + ' day(s).  Day: ' + playerState.currentDay : '', '', '  ◈ [' + (index+1) + '] [NO SIGNATURE]', '  Contact does not resolve. Signal structure is anomalous.', ''].join('\n');
  }

  contact.resolved = true;
  if (scanDays > 0) playerState.currentDay += scanDays;

  const lines = ['', '  [RESOLVE] Scanning contact ' + (index+1) + '...', scanDays > 0 ? '  Scan duration: ' + scanDays + ' day(s).  Day: ' + playerState.currentDay : '', ''];
  if (contact.dark) { lines.push('  ◈ [' + (index+1) + '] [NO SIGNATURE] — running dark'); lines.push('  No transponder. No registry ping.'); }
  else { lines.push('  ◈ [' + (index+1) + '] ' + (contact.prefix ? contact.prefix + ' ' : '') + (contact.shipName ? '"' + contact.shipName + '" — ' : '') + contact.shipClass + '  [' + contact.registry + ']'); }
  lines.push('');
  updateAuspexTraffic(currentContacts, 'mixed');
  return lines.join('\n');
}

// ── Rep ───────────────────────────────────────

function cmdRep() {
  const sys = getCurrentSystem();
  return renderRep(sys);
}

// ── Charts ────────────────────────────────────

function cmdCharts(args) {
  const records = playerState.astrographics;
  if (!records || records.length === 0) {
    return [
      '',
      '  [CHARTS] No astrographic data on record.',
      '  Run deepscan on systems to generate chart data.',
      '',
    ].join('\n');
  }

  // charts <system name> — show detail for a specific record
  if (args.length > 0) {
    const query  = args.join(' ').toLowerCase();
    const entry  = records.find(r => r.systemName.toLowerCase().includes(query));
    if (!entry) {
      return [
        '',
        '  [CHARTS] No record matching "' + args.join(' ') + '".',
        '  Type "charts" to list all records.',
        '',
      ].join('\n');
    }

    const d       = entry.data;
    const age     = playerState.currentDay - entry.scannedDay;
    const quality = entry.quality === 'deep' ? 'Deep scan' : 'Basic scan';

    const lines = [
      '',
      '  ── CHART RECORD: ' + entry.systemName.toUpperCase() + ' ──────────────────────────',
      '',
      '  Quality     : ' + quality + '  (' + entry.units + ' units)',
      '  Recorded    : Day ' + entry.scannedDay + '  (' + age + ' days ago)',
      '',
    ];

    if (entry.quality === 'deep' && d) {
      const hazardBar  = d.hazard  !== undefined ? '▲'.repeat(d.hazard)  + '△'.repeat(5 - d.hazard)  : '—';
      const trafficBar = d.traffic !== undefined ? '◉'.repeat(d.traffic) + '○'.repeat(5 - d.traffic) : '—';
      lines.push('  Star class  : ' + (d.starClass || '—') + '-type');
      lines.push('  Bodies      : ' + (d.bodyCount  || '—'));
      lines.push('  State       : ' + (d.state       || '—'));
      lines.push('  Hazard      : ' + hazardBar);
      lines.push('  Traffic     : ' + trafficBar);
      lines.push('  Jump points : ' + (d.jumpPoints  || '—') + ' outbound');
      lines.push('  Station     : ' + (d.hasStation  ? 'present' : 'none detected'));
      lines.push('  Veydrite    : ' + (d.hasVeydrite ? 'trace deposits  [VYD]' : 'none detected'));
      lines.push('  Ruins       : ' + (d.hasRuin     ? 'structural signatures  [RUN]' : 'none detected'));
    } else {
      lines.push('  Detail      : basic record only — deepscan for full data');
    }

    lines.push('');
    lines.push('  Type "sell astrographics" to sell this record at a Guild station.');
    lines.push('');
    return lines.join('\n');
  }

  // charts — list all records
  const repScore = getRep('guild');
  const lines    = [
    '',
    '  ── ASTROGRAPHIC RECORDS ──────────────────────────────────────',
    '',
    '  ' + records.length + ' system(s) on record.',
    '',
  ];

  records.forEach((entry, i) => {
    const val     = astrographicValue(entry, playerState.currentDay, repScore);
    const aging   = val.aging ? ' [aging]' : '';
    const quality = entry.quality === 'deep' ? 'deep' : 'basic';
    const age     = playerState.currentDay - entry.scannedDay;
    lines.push(
      '  [' + (i + 1) + '] ' + entry.systemName.padEnd(26) +
      quality.padEnd(8) +
      ('Day ' + entry.scannedDay).padEnd(10) +
      entry.units + ' units' + aging
    );
  });

  lines.push('');
  lines.push('  charts <system name>   — view full record');
  lines.push('  sell astrographics     — sell records at a Guild station');
  lines.push('');
  return lines.join('\n');
}

// ── Cluster Deepscan ──────────────────────────

function cmdClusterDeepscan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';

  const ship = getShip();
  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];
  if (!q) return '  [ERROR] Location data unavailable.';

  const query = args.join(' ').toLowerCase().trim();
  if (!query) return '  [CLUSTERDEEPSCAN] Usage: clusterdeepscan <cluster name>';

  // Find cluster in current quadrant
  let targetCluster = null;
  q.clusters.forEach(cluster => {
    if (cluster.name.toLowerCase().includes(query)) {
      targetCluster = cluster;
    }
  });

  if (!targetCluster) {
    return [
      '',
      '  [CLUSTERDEEPSCAN] No cluster matching "' + query + '" in this quadrant.',
      '  Use scan <#> to list clusters in your quadrant.',
      '',
    ].join('\n');
  }

  const systems    = targetCluster.systems;
  const costPerSys = 25;

  // Check we have enough power for at least one system
  if (ship.powerCore.current < costPerSys + 1) {
    return [
      '',
      '  [CLUSTERDEEPSCAN] Insufficient power to begin sweep.',
      '  Required: ' + (costPerSys + 1) + ' minimum  |  Available: ' + ship.powerCore.current,
      '',
    ].join('\n');
  }

  // Calculate how many systems we can scan
  const maxScannable = Math.floor((ship.powerCore.current - 1) / costPerSys);
  const toScan       = systems.slice(0, maxScannable);
  const skipped      = systems.length - toScan.length;

  // Return special prefix for main.js to handle sequentially
  const payload = {
    clusterName: targetCluster.name,
    systems:     toScan.map(sys => {
      const hasStation  = sys.bodies.some(b => b.hasStation);
      const hasRuin     = sys.bodies.some(b => b.hasRuin);
      const hasVeyd     = sys.bodies.some(b => b.veydrite);
      const bodyCount   = sys.bodies.length;
      const units       = astrographicYield(sys, 'deep', q.state);

      // Find station name
      let stationName = 'none detected';
      if (hasStation) {
        const stationBody = sys.bodies.find(b => b.hasStation);
        stationName = stationBody && stationBody.stationName
          ? stationBody.stationName
          : 'station present';
      }

      const hazardBar  = '▲'.repeat(sys.hazard)  + '△'.repeat(5 - sys.hazard);
      const trafficBar = '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic);

      return {
        name:       sys.name,
        starClass:  sys.starClass,
        bodyCount,
        hazard:     sys.hazard,
        traffic:    sys.traffic,
        jumpPoints: sys.jumpPoints,
        hasStation,
        hasRuin,
        hasVeyd,
        hasBeacon:  sys.hasBeacon,
        stationName,
        hazardBar,
        trafficBar,
        state:      q.state,
        units,
        costPerSys,
      };
    }),
    skipped,
    quadrantIndex: loc.quadrantIndex,
  };

// Data and power are applied per-system during display in main.js
  triggerAchievements({ type: 'cluster_sweep', clusterName: targetCluster.name });
  return '__CLUSTERDEEPSCAN__' + JSON.stringify(payload);
}

// ── Achievement helper ────────────────────────

function triggerAchievements(context) {
  const awarded = checkAchievements(playerState, context);
  if (!awarded || awarded.length === 0) return '';
  return awarded.map(a =>
    '\n  [RECORD] Guild Archive updated — ' + a.title
  ).join('');
}

// ── Record command ────────────────────────────

function cmdRecord() {
  return renderAchievements(playerState);
}

// ── Deepscan ──────────────────────────────────


function cmdDeepscan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';

  const ship = getShip();
  const loc  = playerState.location;
  const q    = galaxy.quadrants[loc.quadrantIndex];
  if (!q) return '  [ERROR] Location data unavailable.';

  // Find target system in current quadrant only
  const query = args.join(' ').toLowerCase().trim();
  if (!query) return '  [DEEPSCAN] Usage: deepscan <system name>';

  let targetSys  = null;
  let targetName = null;
  q.clusters.forEach(cluster => {
    cluster.systems.forEach(sys => {
      if (sys.name.toLowerCase().includes(query)) {
        targetSys  = sys;
        targetName = sys.name;
      }
    });
  });

  if (!targetSys) {
    return [
      '',
      '  [DEEPSCAN] No system matching "' + query + '" in this quadrant.',
      '  Deepscan range is limited to your current quadrant.',
      '',
    ].join('\n');
  }

  // Power check
  const powerCost = 40;
  if (ship.powerCore.current < powerCost) {
    return [
      '',
      '  [DEEPSCAN] Insufficient power.',
      '  Required: ' + powerCost + '  |  Available: ' + ship.powerCore.current,
      '  Recharge or dock for shore power.',
      '',
    ].join('\n');
  }

  // Drain power
  drainPower(ship, powerCost);

  // Build result immediately — delay is cosmetic only
  const hasStation = targetSys.bodies.some(b => b.hasStation);
  const hasRuin    = targetSys.bodies.some(b => b.hasRuin);
  const hasVeyd    = targetSys.bodies.some(b => b.veydrite);
  const bodyCount  = targetSys.bodies.length;

  // Generate astrographic data
  const units    = astrographicYield(targetSys, 'deep', q.state);
  const existing = playerState.astrographics.findIndex(a => a.systemName === targetName);
  const entry    = {
    systemName:    targetName,
    quadrantIndex: loc.quadrantIndex,
    quality:       'deep',
    scannedDay:    playerState.currentDay,
    units,
    data: {
      state:      q.state,
      starClass:  targetSys.starClass,
      hazard:     targetSys.hazard,
      traffic:    targetSys.traffic,
      jumpPoints: targetSys.jumpPoints,
      bodyCount,
      hasStation,
      hasRuin,
      hasVeydrite: hasVeyd,
    },
  };

  if (existing >= 0) {
    playerState.astrographics[existing] = entry;
  } else {
    playerState.astrographics.push(entry);
  }
  playerState.scannedSystems[targetName] = true;

  // Find station name if present
  let stationName = 'none detected';
  if (hasStation) {
    const stationBody = targetSys.bodies.find(b => b.hasStation);
    stationName = stationBody && stationBody.stationName
      ? stationBody.stationName
      : 'station present';
  }

  const hazardBar  = '▲'.repeat(targetSys.hazard)  + '△'.repeat(5 - targetSys.hazard);
  const trafficBar = '◉'.repeat(targetSys.traffic) + '○'.repeat(5 - targetSys.traffic);
  const powerAfter = ship.powerCore.current;

  const result = [
    '',
    '  ── ' + targetName.toUpperCase() + ' ─────────────────────────────────────────',
    '',
    '  Star class  : ' + targetSys.starClass + '-type',
    '  Bodies      : ' + bodyCount,
    '  State       : ' + q.state,
    '  Hazard      : ' + hazardBar,
    '  Traffic     : ' + trafficBar,
    '  Jump points : ' + targetSys.jumpPoints + ' outbound',
    '  Station     : ' + stationName,
    '  Veydrite    : ' + (hasVeyd ? 'trace deposits detected  [VYD]' : 'none detected'),
    '  Ruins       : ' + (hasRuin ? 'structural signatures present  [RUN]' : 'none detected'),
    '  Beacon      : ' + (targetSys.hasBeacon ? 'active  [BCN]' : 'none'),
    '',
    '  Astrographic data recorded.  +' + units + ' units',
    '  Power core: ' + powerAfter + '/' + ship.powerCore.max + '  [' + powerStatus(ship) + ']',
    '',
  ].join('\n');

  // Cosmetic delay — print init lines then resolve
  triggerAchievements({ type: 'deepscan', systemName: targetName });
  return '__DEEPSCAN__' + JSON.stringify({ targetName, result });
}

// ── Sell Astrographics ────────────────────────

function cmdSellAstrographics(args) {
  if (!playerState.docked) return '  [SELL] Must be docked.';

  const factionKey = playerState.dockedFactionKey;
  if (factionKey !== 'guild') {
    return ['', '  [SELL] Astrographic data is purchased exclusively by the Assayer\'s Guild.', '  Dock at a Guild station to sell your charts.', ''].join('\n');
  }

  const records = playerState.astrographics;
  if (!records || records.length === 0) {
    return ['', '  [SELL] No astrographic data on record.', '  Run deepscan on systems to generate chart data.', ''].join('\n');
  }

  const repScore = getRep('guild');

  // sell astrographics all
  if (args[1] === 'all') {
    let total = 0;
    records.forEach(entry => {
      const val = astrographicValue(entry, playerState.currentDay, repScore);
      total += val.total;
      delete playerState.scannedSystems[entry.systemName];
    });
    playerState.astrographics = [];
    playerState.credits += total;
    const astroAchAll = triggerAchievements({ type: 'astro_sale' });
    return [
      '',
      '  [SELL] All astrographic records transferred to Guild archive.',
      '  Charts cleared from memory matrix.',
      '  Earned: ' + total + ' CR  |  Scrip: ' + playerState.credits + ' CR',
      astroAchAll,
      '',
    ].join('\n');
  }

  // sell astrographics <#>
  const index = parseInt(args[1]) - 1;
  if (!isNaN(index) && index >= 0) {
    const entry = records[index];
    if (!entry) return '  [SELL] No record at index ' + (index + 1) + '.';
    const val = astrographicValue(entry, playerState.currentDay, repScore);
    playerState.credits += val.total;
    delete playerState.scannedSystems[entry.systemName];
    playerState.astrographics.splice(index, 1);
    return [
      '',
      '  [SELL] Record transferred: ' + entry.systemName,
      '  Chart deleted from memory matrix.',
      '  Earned: ' + val.total + ' CR  |  Scrip: ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  // No args — show portfolio
  const lines = [
    '',
    '  ── ASTROGRAPHIC DATA — ASSAYER\'S GUILD ──────────────────────',
    '',
    '  Charted systems on record: ' + records.length,
    '',
  ];

  records.forEach((entry, i) => {
    const val     = astrographicValue(entry, playerState.currentDay, repScore);
    const aging   = val.aging ? '  [aging]' : '';
    const quality = entry.quality === 'deep' ? 'deep scan' : 'basic scan';
    lines.push(
      '  [' + (i + 1) + '] ' + entry.systemName.padEnd(24) +
      quality.padEnd(12) +
      ('Day ' + entry.scannedDay).padEnd(10) +
      entry.units + ' units   ' +
      val.total + ' CR' + aging
    );
  });

  lines.push('');
  lines.push('  sell astrographics <#>   — sell individual record');
  lines.push('  sell astrographics all   — sell entire portfolio');
  lines.push('');
  lines.push('  Warning: sold data is permanently deleted from your charts.');
  lines.push('');

  return lines.join('\n');
}

// ── Bulletin ──────────────────────────────────

function cmdBulletin() {
  if (!playerState.docked) return '  [BULLETIN] You must be docked to access the contract board.';
  const faction_info = FACTION_REGISTRY[playerState.dockedFactionKey];
  if (!faction_info || !faction_info.contracts) return '  [BULLETIN] No contract board at this station.';
  const rep = getRep(playerState.dockedFactionKey);
  if (rep !== null && repTier(rep) === 'WATCHED') {
    return ['', '  [BULLETIN] Access restricted.', '  Improve your standing first.', ''].join('\n');
  }
  if (playerState.bulletinContracts.length === 0) return '  [BULLETIN] No contracts available.';
  return renderBulletin(playerState.dockedFactionKey, playerState.bulletinContracts);
}

// ── Accept ────────────────────────────────────

function cmdAccept(args) {
  if (!playerState.docked) return '  [ACCEPT] You must be docked to accept contracts.';
  const index  = parseInt(args[0]) - 1;
  if (isNaN(index)) return '  [ACCEPT] Usage: accept <number>';
  const result = acceptContract(index, playerState.bulletinContracts, playerState.currentDay);
  if (result.error) return '  [ACCEPT] ' + result.error;
  const c = result.contract;
  const acceptAch = triggerAchievements({ type: 'contract_accepted' });
  return ['', '  [ACCEPT] Contract accepted.', '', '  ' + c.title, '  ' + c.description, '', '  Payment    : ' + c.payment + ' CR', '  Rep reward : +' + c.repReward, '  Time limit : ' + c.timeLimitDays + ' days', '  Deadline   : Day ' + (playerState.currentDay + c.timeLimitDays), '', '  Good luck.', acceptAch, ''].join('\n');
}

// ── Contract ──────────────────────────────────

function cmdContract() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [CONTRACT] No active contract.';
  return renderActiveContract(active, playerState.currentDay);
}

// ── Complete ──────────────────────────────────

function cmdComplete() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [COMPLETE] No active contract.';
  const sys = getCurrentSystem();
  if (!sys) return '  [ERROR] Location data corrupted.';
  if (sys.name !== active.target) {
    return ['', '  [COMPLETE] You are not at the target system.', '  Required: ' + active.target, '  Current : ' + sys.name, ''].join('\n');
  }
  const daysElapsed = playerState.currentDay - active.issuedDay;
  const result      = completeContract(active, daysElapsed, playerState);
  playerState.stats.contractsCompleted = (playerState.stats.contractsCompleted || 0) + 1;
  const completeAch = triggerAchievements({ type: 'contract_complete', fast: result.fast });
  const lines = ['', '  [COMPLETE] Contract fulfilled.', '', '  ' + active.title, '  Payment  : ' + result.total + ' CR' + (result.bonus > 0 ? '  (speed bonus: +' + result.bonus + ' CR)' : ''), '  Rep      : +' + result.repEarned + (result.fast ? '  (ahead of schedule)' : ''), '  Scrip    : ' + playerState.credits + ' CR', ''];
  if (result.repResult) lines.push(renderRepChange(result.repResult));
  if (completeAch) lines.push(completeAch);
  lines.push('');
  return lines.join('\n');
}

// ── Abandon ───────────────────────────────────

function cmdAbandon() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [ABANDON] No active contract.';
  const result     = failContract(active);
  const abandonAch = triggerAchievements({ type: 'contract_abandoned' });
  const lines      = ['', '  [ABANDON] Contract abandoned.', '  ' + active.title, '  Reputation penalty applied.', ''];
  if (result.repResult) lines.push(renderRepChange(result.repResult));
  if (abandonAch) lines.push(abandonAch);
  lines.push('');
  return lines.join('\n');
}

// ── Logs ──────────────────────────────────────

function cmdLogs() {
  if (playerState.logs.length === 0) {
    return ['', '  [LOGS] No records recovered yet.', '  Scan ruin sites with "scan log".', ''].join('\n');
  }
  const lines = ['', '  ── RECOVERED RECORDS ─────────────────────────────────────────', '', '  ' + playerState.logs.length + ' record(s) on file.', ''];
  playerState.logs.forEach((entry, i) => {
    const typeTag = entry.type === 'beacon' ? 'BEACON' : 'LOG FRAGMENT';
    lines.push('  [' + (i + 1) + '] ' + typeTag + ' — ' + entry.system);
    lines.push('  ' + entry.text);
    lines.push('');
  });
  return lines.join('\n');
}

// ── Save ──────────────────────────────────────

function cmdSave() {
  const ship = getShip();
  const result = saveGame(playerState, reputation, {
    active:  activeContracts.find(c => !c.completed && !c.failed) || null,
    history: activeContracts.filter(c => c.completed || c.failed),
  });
  if (result.success) {
    const date = new Date(result.savedAt);
    return ['', '  [SAVE] Game saved.', '  ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString(), ''].join('\n');
  }
  return '  [SAVE] Save failed: ' + result.error;
}

function cmdNewSave() {
  return ['', '  [NEWSAVE] This will delete this pilot record permanently.', '  There is no recovery. The void does not give back.', '  Type "yes" to confirm or anything else to cancel.', ''].join('\n');
}

function cmdMenu() {
  playerState.pendingMenu = true;
  return ['', '  [MENU] Return to main menu?', '  Your progress has been autosaved.', '', '  Type "yes" to confirm or anything else to cancel.', ''].join('\n');
}

// ── Flavor text ───────────────────────────────

function stationServices(attitude) {
  const services = {
    neutral: 'Fuel exchange  |  Cargo hold  |  Assay terminal  |  Armory  |  Bulletin board',
    commercial: 'Fuel exchange  |  Cargo trading  |  Armory  |  Pelk contract board  |  Repair bay',
    military: 'Fuel exchange  |  Restricted cargo only  |  Military armory  |  CCC contract board',
    hostile: 'Fuel price negotiable  |  No formal services  |  Watch your cargo',
    unknown: 'Services unknown  |  Proceed with caution',
  };
  return services[attitude] || services.neutral;
}

function stationDescription(state) {
  const pool = {
    Established: 'Functional. Docking fees apply. Guild rates posted.',
    Contested:   'Station control is disputed. Expect armed presence.',
    Declining:   'Infrastructure degraded. Some berths sealed.',
    Collapsed:   'Station is derelict or under feral management.',
    Isolated:    'Station operates independently. Unknown protocols.',
    Forbidden:   'Station presence unconfirmed. Approach with caution.',
  };
  return pool[state] || 'Status unknown.';
}

function ruinDescription(state) {
  const pool = {
    Established: 'Catalogued and sealed. Guild survey team on record.',
    Contested:   'Contested salvage rights. Multiple parties active.',
    Declining:   'Partially stripped. Some sections may be intact.',
    Collapsed:   'Unsurveyed. No liability assumed for entry.',
    Isolated:    'Pre-contact construction. Classification pending.',
    Forbidden:   'Access prohibited. Reason not on public record.',
  };
  return pool[state] || 'No data.';
}

function veydriteRating(starClass) {
  const ratings = {
    O: 'EXCEPTIONAL — O-class remnant field. Guild interest likely.',
    B: 'HIGH — B-class signature. Worth logging.',
    A: 'MODERATE — A-class trace. Viable extraction.',
    F: 'LOW-MODERATE — F-class deposit. Marginal return.',
    G: 'LOW — G-class ambient. Background levels.',
    K: 'TRACE — K-class. Below extraction threshold.',
    M: 'NEGLIGIBLE — M-class. Not worth the fuel.',
  };
  return ratings[starClass] || 'Unclassified.';
}

function systemFlavor(sys, state) {
  const hasStation = sys.bodies.some(b => b.hasStation);
  const hasRuin    = sys.bodies.some(b => b.hasRuin);
  const hasVeyd    = sys.bodies.some(b => b.veydrite);
  if (sys.xenoTainted) return xenoFlavor(sys, state);
  if (state === 'Collapsed' && !hasStation) return 'Nothing answers on any frequency. The bodies drift without comment.';
  if (state === 'Forbidden') return 'Your transponder has been logged. Someone knows you are here.';
  if (state === 'Isolated' && !hasStation) return 'No beacon. No registry ping. This system is not on the network.';
  if (hasStation && hasVeyd) return 'A working station and veydrite sign. Somebody already knows about this place.';
  if (hasRuin && !hasStation) return 'Whatever was here is gone. The ruins do not explain what happened.';
  if (hasVeyd && !hasStation) return 'Veydrite present and no extraction operation in sight. Either overlooked or avoided.';
  if (state === 'Contested' && hasStation) return 'The station is flying two flags. Neither crew looks comfortable.';
  if (state === 'Declining') return 'The infrastructure is tired. Everything here is running on borrowed time.';
  return 'Nothing unusual on passive scan. The system holds its silence.';
}

function xenoFlavor(sys, state) {
  const hasRuin    = sys.bodies.some(b => b.hasRuin);
  const hasStation = sys.bodies.some(b => b.hasStation);
  const notes = [
    'Passive scan returns clean. The bodies are where they should be. Traffic log shows one entry, no exit.',
    'The ruins here are older than the colony records. The colony records do not mention this.',
    'Veydrite readings are normal. The shadow on the deep scan is not veydrite.',
    'No station. No beacon. The navigation computer logged a course correction it did not initiate.',
    'Survey team filed a report seventeen years ago. The report is eight words long. The eighth word is not a word.',
    'Something in the debris field is the wrong temperature. It has been the wrong temperature for a long time.',
    'The system is quiet. The system has always been quiet. The silence here has a shape.',
    'Guild records show a survey attempt in 2271. The surveyor\'s vessel returned. The surveyor did not.',
    'Three of the bodies show impact scarring consistent with kinetic strike. There is no record of conflict in this system.',
    'Ruin site is flagged as pre-collapse architecture. The materials are not pre-collapse materials.',
    'Long-range scan shows eleven bodies. Close approach shows ten. The count does not change.',
    'Traffic is listed as zero. Something moved on the thermal array. It moved in a straight line.',
    'The station here closed in 2289. The lights are still on.',
    'No life signs. The atmospheric readings on the third body include a compound with no industrial source.',
    'This system was declared empty in the Guild survey of 2301. The survey vessel\'s final log entry reads: it is not empty.',
  ];
  const index = (sys.name.length + sys.hazard * 3 + (hasRuin ? 7 : 0)) % notes.length;
  return notes[index];
}

// =============================================================================
// APHELION — commands.js PATCH
// Compartment movement system — additions only.
// Apply these three changes to your existing commands.js.
// =============================================================================
 
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 1 OF 3 — playerState
// Add currentCompartment to your playerState object.
// Location: the closing lines of the playerState literal, before the final };
//
// ADD this one line anywhere inside the playerState object:
//
//   currentCompartment: 'bridge',   // compartment movement system
//
// Example — your playerState should end up looking like:
//
//   let playerState = {
//     ...
//     isDead:             false,
//     deathCause:         '',
//     currentCompartment: 'bridge',   // ← ADD THIS
//   };
// ─────────────────────────────────────────────────────────────────────────────
 
 
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 2 OF 3 — handleCommand switch
// Add the 'move' case to your switch(cmd) block.
// Location: inside handleCommand(), in the switch block.
// Place it alongside the other navigation cases (nav, fold, where, etc.)
//
// ADD this line:
//   case 'move':      return cmdMove(args);
//
// Example placement in your switch:
//
//   case 'where':
//   case 'look':      return cmdWhere();
//   case 'move':      return cmdMove(args);   // ← ADD THIS
//   case 'system':    return cmdSystem();
// ─────────────────────────────────────────────────────────────────────────────
 
 
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 3 OF 3 — cmdMove function
// Paste this entire function block anywhere in commands.js.
// Recommended: after cmdWhere() / before cmdRep(), or near the bottom
// before the contact engine section.
// ─────────────────────────────────────────────────────────────────────────────
 
// ── Move (compartment navigation) ────────────────────────────────────────────
 
// Alias table — maps player input to canonical compartment IDs.
// All keys are lowercase. Multi-word aliases use the joined args string.
const COMPARTMENT_ALIASES = {
  // Bridge
  'bridge':           'bridge',
  'br':               'bridge',
 
  // Engineering
  'engineering':      'engineering',
  'eng':              'engineering',
  'engine':           'engineering',
  'engines':          'engineering',
 
  // Cargo Bay
  'cargo':            'cargo',
  'cargo bay':        'cargo',
  'hold':             'cargo',
  'bay':              'cargo',
 
  // Crew Quarters
  'quarters':         'quarters',
  'crew quarters':    'quarters',
  'crew':             'quarters',
  'bunk':             'quarters',
  'bunks':            'quarters',
  'berths':           'quarters',
 
  // Airlock
  'airlock':          'airlock',
  'lock':             'airlock',
  'eva':              'airlock',
  'external':         'airlock',
 
  // Reserve Tank Bay — Light Surveyor exclusive
  'reserve tank':     'reserve_tank',
  'reserve_tank':     'reserve_tank',
  'reserve':          'reserve_tank',
  'tank':             'reserve_tank',
  'tank bay':         'reserve_tank',
 
  // Extraction Bay — mining vessels
  'extraction':       'extraction',
  'extraction bay':   'extraction',
  'mining bay':       'extraction',
  'mine bay':         'extraction',
 
  // Salvage Bay — salvage vessels
  'salvage bay':      'salvage_bay',
  'salvage_bay':      'salvage_bay',
  // NOTE: 'salvage' alone is NOT aliased here — it's an existing field command.
  // Players must type 'salvage bay' to move to the compartment.
 
  // Refinery — industrial vessels
  'refinery':         'refinery',
  'ref':              'refinery',
 
  // Weapons Bay — military vessels
  'weapons bay':      'weapons_bay',
  'weapons_bay':      'weapons_bay',
  'armory bay':       'weapons_bay',
  // NOTE: 'weapons' and 'armory' alone are existing commands; not aliased here.
 
  // Flight Deck — Escort Carrier only
  'flight deck':      'flight_deck',
  'flight_deck':      'flight_deck',
  'flight':           'flight_deck',
  'hangar':           'flight_deck',
  'deck':             'flight_deck',
};
 
// Display labels for compartment IDs — used in feedback strings.
const COMPARTMENT_LABELS = {
  bridge:       'Bridge',
  engineering:  'Engineering',
  cargo:        'Cargo Bay',
  quarters:     'Crew Quarters',
  airlock:      'Airlock',
  reserve_tank: 'Reserve Tank Bay',
  extraction:   'Extraction Bay',
  salvage_bay:  'Salvage Bay',
  refinery:     'Refinery',
  weapons_bay:  'Weapons Bay',
  flight_deck:  'Flight Deck',
};
 
// Universal compartments — present on every ship regardless of class.
const UNIVERSAL_COMPARTMENTS = ['bridge', 'engineering', 'cargo', 'quarters', 'airlock'];
 
// Class-specific compartments — keyed by ship class/designation.
// Checked against ship.class (e.g. 'surveyor') and ship.designation (e.g. 'Light Surveyor').
const CLASS_COMPARTMENTS = {
  // Light Surveyor only
  'light surveyor':   ['reserve_tank'],
  // Mining vessels
  'light mining vessel': ['extraction'],
  'medium industrial':   ['extraction', 'refinery'],
  'heavy industrial':    ['extraction', 'refinery'],
  // Salvage vessels
  'light salvager':      ['salvage_bay'],
  'medium salvager':     ['salvage_bay'],
  // Military vessels
  'interceptor':         ['weapons_bay'],
  'corvette':            ['weapons_bay'],
  'frigate':             ['weapons_bay'],
  // Escort Carrier
  'escort carrier':      ['weapons_bay', 'flight_deck'],
};
 
/**
 * Get the list of compartments available on the player's current ship.
 * Falls back to universal compartments if ship data is unavailable.
 * @returns {string[]} array of compartment IDs
 */
function getAvailableCompartments() {
  const ship = getShip();
  if (!ship) return UNIVERSAL_COMPARTMENTS;
 
  // ships.js createShipInstance populates ship.compartments directly — use it if present.
  if (ship.compartments && Array.isArray(ship.compartments)) {
    return ship.compartments;
  }
 
  // Fallback: derive from designation or class strings.
  const designationKey = (ship.designation || '').toLowerCase();
  const classKey       = (ship.class       || '').toLowerCase();
 
  const extras = CLASS_COMPARTMENTS[designationKey]
               || CLASS_COMPARTMENTS[classKey]
               || [];
 
  return [...UNIVERSAL_COMPARTMENTS, ...extras];
}
 
/**
 * Resolve a player-typed compartment phrase to a canonical compartment ID.
 * Returns null if unrecognized.
 * @param {string[]} args — raw args array from handleCommand (after 'move')
 * @returns {string|null}
 */
function resolveCompartmentInput(args) {
  if (!args || args.length === 0) return null;
  const phrase = args.join(' ').toLowerCase().trim();
  return COMPARTMENT_ALIASES[phrase] ?? null;
}
 
/**
 * Main move command handler.
 * Usage: move <compartment name or alias>
 */
function cmdMove(args) {
  // No destination — list available compartments.
  if (!args || args.length === 0) {
    const available  = getAvailableCompartments();
    const current    = playerState.currentCompartment || 'bridge';
    const curLabel   = COMPARTMENT_LABELS[current] || current;
 
    const lines = [
      '',
      '  [MOVE] Current location: ' + curLabel.toUpperCase(),
      '',
      '  Available compartments:',
      '',
    ];
 
    available.forEach(id => {
      const label   = COMPARTMENT_LABELS[id] || id;
      const marker  = id === current ? '  ►' : '   ';
      lines.push(marker + ' ' + label.padEnd(22) + 'move ' + id.replace('_', ' '));
    });
 
    lines.push('');
    return lines.join('\n');
  }
 
  // Resolve input to canonical ID.
  const targetId = resolveCompartmentInput(args);
 
  if (!targetId) {
    const phrase = args.join(' ');
    return [
      '',
      '  [MOVE] "' + phrase + '" is not a recognized compartment.',
      '  Type "move" to see available compartments.',
      '',
    ].join('\n');
  }
 
  const available = getAvailableCompartments();
  const current   = playerState.currentCompartment || 'bridge';
 
  // Already here.
  if (targetId === current) {
    const label = COMPARTMENT_LABELS[targetId] || targetId;
    return [
      '',
      '  [MOVE] Already in ' + label + '.',
      '',
    ].join('\n');
  }
 
  // Compartment exists but not on this hull.
  if (!available.includes(targetId)) {
    const label = COMPARTMENT_LABELS[targetId] || targetId;
    const ship  = getShip();
    return [
      '',
      '  [MOVE] ' + label + ' is not installed on this vessel.',
      '  Hull: ' + (ship ? ship.designation : 'unknown') + '.',
      '  Type "move" to see available compartments.',
      '',
    ].join('\n');
  }
 
  // Valid move — update state and confirm.
  playerState.currentCompartment = targetId;
  const label      = COMPARTMENT_LABELS[targetId] || targetId;
  const curLabel   = COMPARTMENT_LABELS[current]  || current;
 
  // Compartment-specific arrival messages.
  const arrivalNotes = {
    bridge:       'Navigation and sensor arrays online.',
    engineering:  'Power core nominal. Drive status green.',
    cargo:        'Hold integrity nominal. Manifest available.',
    quarters:     'Life support nominal.',
    airlock:      'External hardpoints accessible. EVA clearance ready.',
    reserve_tank: 'Reserve tank status: ' + (playerState.reserveVeydrite || 0).toFixed(1) + ' kg / 15 kg.',
    extraction:   'Auger array standing by.',
    salvage_bay:  'Harrow unit standing by.',
    refinery:     'Refinery offline until docked.',
    weapons_bay:  'Weapons array accessible.',
    flight_deck:  'Fighter bays accessible.',
  };
 
  return [
    '',
    '  [MOVE] ' + curLabel + '  →  ' + label,
    '  ' + (arrivalNotes[targetId] || ''),
    '',
  ].join('\n');
}

// ── Contact engine ────────────────────────────

const CONTACT_SHIP_CLASSES = [
  { name: 'Bulk Freighter',  mass: 'mass-heavy',   named: 0.8 },
  { name: 'Light Freighter', mass: 'mass-light',   named: 0.6 },
  { name: 'Prospector',      mass: 'mass-light',   named: 0.4 },
  { name: 'Fuel Tanker',     mass: 'mass-heavy',   named: 0.5 },
  { name: 'Patrol Vessel',   mass: 'mass-medium',  named: 0.9 },
  { name: 'Salvage Hauler',  mass: 'mass-medium',  named: 0.3 },
  { name: 'Survey Craft',    mass: 'mass-light',   named: 0.5 },
  { name: 'Transport',       mass: 'mass-medium',  named: 0.6 },
  { name: 'Armed Escort',    mass: 'mass-medium',  named: 0.7 },
  { name: 'Courier',         mass: 'mass-light',   named: 0.5 },
];

const REGISTRIES = [
  'Pelk registry', 'Guild registry', 'CCC registry',
  'colonial registry', 'free registry',
  'unregistered', 'unregistered', 'unregistered',
];

function generateVesselPrefix(registry, shipClass) {
  // Dark/unregistered vessels have no prefix
  if (!registry || registry === 'unregistered') return null;

  // Class-based prefix pools
  const classPrefixes = {
    'Bulk Freighter':  ['HFV','BFV','DFV','PLV','PCF'],
    'Light Freighter': ['LFV','TCV','ICV','PLV','PFV'],
    'Prospector':      ['LSV','MSV','IRV','GSV','ORV'],
    'Fuel Tanker':     ['HFV','BFV','PLV','PTV','TCV'],
    'Patrol Vessel':   ['CPV','CMV','CSV','CFV','ACV'],
    'Salvage Hauler':  ['SRV','RCV','MRV','ICV','FRV'],
    'Survey Craft':    ['LSV','DSV','GSV','ESV','OSV'],
    'Transport':       ['CTV','TCV','PLV','PTV','ICV'],
    'Armed Escort':    ['CMV','CPV','CSV','ACV','CFV'],
    'Courier':         ['IRV','IFV','GSV','GCV','RSV'],
  };

  // Registry modifier — Guild vessels get Guild prefixes, etc.
  const registryOverride = {
    'Guild registry':    ['GSV','GDV','GAV','GCV','GRV','GFV','RAS'],
    'Pelk registry':     ['PLV','PFV','PTV','PCF','PRV'],
    'CCC registry':      ['CCV','CMV','CPV','CFV','CTV'],
    'colonial registry': ['CTV','CMV','CFV','CCV','CPV'],
    'free registry':     ['ICV','IFV','IRV','FCV','RSV'],
  };

  const pool = registryOverride[registry] || classPrefixes[shipClass] || ['ICV','IRV','IFV'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateContacts(sys, quadrantState) {
  const traffic   = sys.traffic || 0;
  const xenoTaint = sys.xenoTainted || false;
  const baseCount = Math.floor(traffic * 1.5);
  const variance  = Math.floor(Math.random() * 3) - 1;
  let count       = Math.max(0, baseCount + variance);
  const contacts  = [];

  for (let i = 0; i < count; i++) {
    const shipClass    = CONTACT_SHIP_CLASSES[Math.floor(Math.random() * CONTACT_SHIP_CLASSES.length)];
    const dark         = Math.random() < 0.08 + (quadrantState === 'Collapsed' ? 0.12 : 0);
    const registry     = REGISTRIES[Math.floor(Math.random() * REGISTRIES.length)];
    const isRegistered = registry !== 'unregistered';
    const hasName      = !dark && isRegistered && Math.random() < shipClass.named;
    const shipName     = hasName ? generateContactName() : null;
    const prefix       = generateVesselPrefix(registry, shipClass.name);
    contacts.push({ shipClass: shipClass.name, mass: shipClass.mass, dark, registry, shipName, prefix, resolved: false });
  }

  if (xenoTaint) {
    contacts.push({ shipClass: null, mass: 'mass-unknown', dark: true, registry: null, shipName: null, resolved: false, xeno: true });
  }

  return contacts;
}

function generateContactName() {
  if (typeof NAMES === 'undefined') return null;
  const roll = Math.random();
  if (roll < 0.3 && NAMES.ship_virtue) {
    // Single word — e.g. "Resolute"
    return NAMES.ship_virtue[Math.floor(Math.random() * NAMES.ship_virtue.length)];
  } else if (roll < 0.6 && NAMES.ship_endurance && NAMES.ship_endurance_noun) {
    // Two words — e.g. "Iron Watch"
    return NAMES.ship_endurance[Math.floor(Math.random() * NAMES.ship_endurance.length)] + ' ' +
           NAMES.ship_endurance_noun[Math.floor(Math.random() * NAMES.ship_endurance_noun.length)];
  } else if (NAMES.ship_aspiration) {
    // Single or two words from aspiration — e.g. "Long Claim" or "Resolve"
    return NAMES.ship_aspiration[Math.floor(Math.random() * NAMES.ship_aspiration.length)];
  }
  return null;
}

let currentContacts = null;
const contactCache  = {};
