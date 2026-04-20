// ============================================
//  APHELION — Command Parser
//  commands.js
//  System B: Ship object, weapons, power
// ============================================

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
    guild:       ['Assay Point', 'Survey Station', 'Guild Relay', 'Assessment Post'],
    pelk:        ['Pelk Depot', 'Transit Hub', 'Pelk Waystation', 'Logistics Post'],
    colonial:    ['CCC Outpost', 'Colonial Station', 'Forward Base', 'CCC Relay'],
    feral:       ['The Hulk', 'Scratch Station', 'The Nail', 'Drift Post'],
    independent: ['Free Berth', 'Open Dock', 'The Anchorage', 'Waypoint'],
    forbidden:   ['Installation', 'Unknown Station', 'Sealed Platform'],
  };

  const suffixes = ['Alpha', 'Beta', 'Prime', 'Secondary', 'Auxiliary',
                    'I', 'II', 'III', 'IV', 'V'];

  const pool   = prefixes[factionKey] || prefixes.independent;
  const prefix = pool[Math.floor(rng.next() * pool.length)];
  const tag    = systemName.split(' ')[0];
  const suffix = index > 0 ? ' ' + suffixes[Math.min(index, suffixes.length - 1)] : '';

  return prefix + ' ' + tag + suffix;
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
  pendingTx:        null,
  pendingMenu:      false,
  currentDay:       0,
  bulletinContracts: [],
  logs:             [],
  flags:            {},
  stats:            { jumps: 0, salvages: 0, daysSurvived: 0, creditsEarned: 0, contractsCompleted: 0, veydriteSold: 0 },
  achievements:     [],
  inEncounter:      false,
  encounter:        null,
  isDead:           false,
  deathCause:       '',
};

// ── Init ──────────────────────────────────────

function initCommands(seed) {
  galaxy = generateGalaxy(seed, Naming);
  playerState.galaxySeed = seed;

  // Initialize ship if not already set
  if (!playerState.ship) {
    playerState.ship = createStartingShip(playerState.shipName || 'The Unspoken');
  }

// Use seeded RNG for station generation so stations are always the same
  const stationRng = new RNG(RNG.hashSeed(seed + '-stations'));

  galaxy.quadrants.forEach(q => {
    q.clusters.forEach(cluster => {
      cluster.systems.forEach(sys => {
        let stationIndex = 0;
        sys.bodies.forEach(body => {
          if (body.hasStation) {
            body.factionKey    = assignFaction(q.state, stationRng);
            body.faction       = FACTIONS[body.factionKey] || FACTIONS.independent;
            body.stationName   = generateStationName(sys.name, body.factionKey, stationIndex++, stationRng);
            body.hasRefinery   = hasRefinery(body.factionKey);
            body.refineryGrade = refineryGrade(body.factionKey);
            body.yieldShare    = body.hasRefinery
              ? refineryYieldShare(body.factionKey, stationRng)
              : null;
          }
        });
      });
    });
  });

  const q0      = galaxy.quadrants[0];
  const cluster = q0.clusters[0];
  const system  = cluster.systems.find(s => s.isAnchor) ?? cluster.systems[0];

  playerState.location = {
    quadrantIndex: 0,
    clusterName:   cluster.name,
    systemName:    system.name,
  };
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
    '  scan <1-42>               — survey a quadrant',
    '  where                     — current system survey',
    '  nav <system name>         — calculated jump within quadrant',
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
    '  repair              — repair hull or weapons',
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
  const hasRuin = sys.bodies.some(b => b.hasRuin);
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
  if (args.length === 0) return '  [USAGE] nav <system name>';
  if (playerState.docked) return '  [NAV] You are docked. Type "undock" first.';

  const ship  = getShip();
  const query = args.join(' ').toLowerCase();

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
        if (sys.name.toLowerCase().includes(query)) {
          const fuelCost = 8 + Math.floor(Math.random() * 8);
          if (ship.fuel < fuelCost) {
            return [
              '',
              '  [NAV] Insufficient fuel for transit to ' + sys.name + '.',
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

          const travelDays = 4 + Math.floor(Math.random() * 7);
          ship.fuel -= fuelCost;
          drainPower(ship, powerCost);
          rechargePower(ship, travelDays, false);
          playerState.currentDay += travelDays;

          playerState.location = {
            quadrantIndex: qi,
            clusterName:   cluster.name,
            systemName:    sys.name,
          };
          playerState.docked           = false;
          playerState.dockedAt         = null;
          playerState.dockedFactionKey = null;

          const lines = [
            '',
            '  [NAV] Plotting course to ' + sys.name + '...',
            '',
            '  Quadrant : ' + q.name,
            '  Cluster  : ' + cluster.name,
            '  Star     : ' + sys.starClass + '-class',
            '  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard),
            '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + ship.fuel + ' units',
            '  Power used: ' + powerCost + ' — Core: ' + ship.powerCore.current + '/' + ship.powerCore.max,
            '  Transit  : ' + travelDays + ' standard days',
            '  Day      : ' + playerState.currentDay,
            '',
            '  Drive nominal. Arrived.',
            '  Type "where" to survey this system.',
            '',
          ];

          // Encounter check
          const encounter = rollEncounter(sys, q, playerState, false);
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
          const beacon = rollBeacon(sys);
          if (beacon) {
            const ageTag = beacon.age === 'recent' ? '[RECENT]' : beacon.age === 'old' ? '[ARCHIVED]' : '[UNKNOWN AGE]';
            lines.push('  ── DISTRESS BEACON DETECTED ──────────────────────────────────');
            lines.push('');
            lines.push('  ' + ageTag + ' ' + beacon.text);
            lines.push('');
            playerState.logs.push({ type: 'beacon', system: sys.name, age: beacon.age, text: beacon.text });
          }

          // Contract check
          const active = activeContracts.find(c => !c.completed && !c.failed);
          if (active) {
            const status = checkContractStatus(active, playerState.currentDay, sys.name);
            if (status && status.status === 'failed') {
              const result = failContract(active);
              lines.push('  [CONTRACT] FAILED — ' + active.title);
              if (result.repResult) lines.push(renderRepChange(result.repResult));
              lines.push('');
            } else if (status && status.status === 'ready') {
              lines.push('  [CONTRACT] Target reached — type "complete" to finish.');
              lines.push('');
            } else if (status && status.status === 'active') {
              lines.push('  [CONTRACT] ' + active.title + ' — ' + status.daysLeft + ' days remaining.');
              lines.push('');
            }
          }

          return lines.join('\n');
        }
      }
    }
  }
  return '  [NAV] No system matching "' + args.join(' ') + '" found in catalog.';
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
    '  Type "where" to survey this system.',
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
    sys.bodies.forEach((body, i) => {
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
    if (isNaN(bodyIndex) || bodyIndex < 0 || bodyIndex >= sys.bodies.length) {
      return [
        '',
        '  [SURVEY] Usage: survey body <1-' + sys.bodies.length + '>',
        '  Run "survey node" first to identify mining targets.',
        '',
      ].join('\n');
    }

    const body = sys.bodies[bodyIndex];

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
  if (isNaN(bodyIndex) || bodyIndex < 0 || bodyIndex >= sys.bodies.length) {
    return '  [MINE] Invalid body index. Use survey node to list bodies.';
  }

  const body = sys.bodies[bodyIndex];

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
        const adjacentBodies = sys.bodies.filter((b, i) =>
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

  const stationBody = sys.bodies.find(b => b.hasStation && b.stationName === playerState.dockedAt);
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
  
  const hasRuin   = sys.bodies.some(b => b.hasRuin);
  const hasVeyd   = sys.bodies.some(b => b.veydrite);
  const hasDebris = ['Debris Field', 'Shattered Planet', 'Dust Belt']
    .some(t => sys.bodies.some(b => b.type === t));

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

function cmdDock() {
  if (playerState.docked) return '  [DOCK] Already docked at ' + playerState.dockedAt + '.';

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const stationBodies = sys.bodies.filter(b => b.hasStation);
  if (stationBodies.length === 0) {
    return ['', '  [DOCK] No station in ' + sys.name + '.', ''].join('\n');
  }

  const body    = stationBodies[0];
  const faction = body.faction || FACTIONS.independent;
  const fee     = dockingFee(body.factionKey);
  const ship    = getShip();

  const rep = getRep(body.factionKey);
  if (rep !== null && repTier(rep) === 'HOSTILE') {
    return ['', '  [DOCK] Docking refused.', '  ' + faction.name + ' has flagged your vessel.', ''].join('\n');
  }

  if (fee > 0 && playerState.credits < fee) {
    return ['', '  [DOCK] Docking fee: ' + fee + ' CR.  Insufficient scrip.', ''].join('\n');
  }

  if (fee > 0) playerState.credits -= fee;

  meetFaction(body.factionKey);
  // Only gain rep once per day per station
  const repKey = 'docked_' + body.stationName + '_' + playerState.currentDay;
  const repResult = playerState.flags[repKey]
    ? null
    : adjustRep(body.factionKey, 1, 'Docked and paid fees');
  if (repResult) playerState.flags[repKey] = true;
  // Shore power — recharge core fully
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

  const feeNote = fee > 0
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
    '  ' + stationServices(faction.attitude),
    '',
  ];

  if (faction_info && faction_info.contracts) {
    lines.push('  Contracts available — type "bulletin" to view.');
  }
lines.push('  Type "trade" to open the trade terminal.');
  lines.push('  Type "armory" to browse weapons and ammo.');
  lines.push('  Type "repair" for hull and weapon repair.');
  lines.push('  Type "undock" to return to space.');
  lines.push('');
  lines.push(renderRepChange(repResult));
  lines.push('');
if (typeof updateAuspex === 'function') updateAuspex();

  // Xeno achievement
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
  return '  [BUY] Unknown item. Try: fuel, weapon, ammo, cells';
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
  const repTier = getRepTier(faction, playerState);
  const result  = foldCellPrice(faction, repTier);
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

function executeTrade(tx) {
  const ship = getShip();
  if (tx.type === 'sell' && tx.commodity === 'veydrite') {
    playerState.veydrite -= tx.amount;
    playerState.credits  += tx.earned;
    playerState.stats.veydriteSold = (playerState.stats.veydriteSold || 0) + tx.amount;
    const veyAch = triggerAchievements({ type: 'veydrite_sale' });
    return ['', '  [SELL] Transaction complete.', '  Sold: ' + tx.amount + ' kg  |  Earned: ' + tx.earned + ' CR', '  Scrip: ' + playerState.credits + ' CR', veyAch, ''].join('\n');
  }
  if (tx.type === 'buy' && tx.commodity === 'fuel') {
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

// ── Armory ────────────────────────────────────

function getArmoryContext() {
  if (!playerState.docked) return null;
  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys   = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return null;
  const body  = sys.bodies.find(b => b.hasStation);
  if (!body)  return null;
  const rep   = getRep(body.factionKey);
  const tier  = rep !== null ? repTier(rep) : 'UNKNOWN';
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
  const fullCost = damage * costPerPoint;

  return [
    '',
    '  [REPAIR] ' + slot.name,
    '  Condition : ' + slot.condition + '/100',
    '  Damage    : ' + damage + ' points',
    '  Cost      : ' + fullCost + ' CR  (' + costPerPoint + ' CR/point)',
    '  Scrip     : ' + playerState.credits + ' CR',
    '',
    '  repair weapon ' + slotId + ' full     — full repair',
    '  repair weapon ' + slotId + ' <amount> — partial repair',
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
  ].join('\n');
}

// ── Where ─────────────────────────────────────

function cmdWhere() {
  if (!playerState.location) return '  [STATUS] No location fix.';
  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = loc.clusterName
    ? q.clusters.find(c => c.name === loc.clusterName)
    : q.clusters[loc.clusterIndex || 0];
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  const stations = sys.bodies.filter(b => b.hasStation);
  const ruins    = sys.bodies.filter(b => b.hasRuin);
  const veydrite = sys.bodies.filter(b => b.veydrite);
  const anchor   = sys.isAnchor ? '  ◆ ANCHOR' : '';

  const lines = [
    '',
    '  ── CURRENT POSITION ──────────────────────────────────────────',
    '',
    '  System   : ' + sys.name + anchor,
    '  Cluster  : ' + cluster.name,
    '  Quadrant : ' + q.name + '  [' + (loc.quadrantIndex + 1) + ']  [' + q.state + ']',
    '  Star     : ' + sys.starClass + '-class  |  Bodies: ' + sys.bodies.length,
    '  Day      : ' + playerState.currentDay,
    '',
    '  ── LOCAL SURVEY ──────────────────────────────────────────────',
    '',
  ];

  if (stations.length > 0) {
    lines.push('  Stations : ' + stations.length + ' detected');
    stations.forEach(b => {
      const f   = b.faction || FACTIONS.independent;
      const rep = getRep(b.factionKey);
      const tier = rep !== null ? '  [' + repTier(rep) + ']' : '';
      lines.push('    — ' + b.stationName + '  [' + f.short + ']' + tier);
    });
    lines.push('  ' + stationDescription(q.state));
  } else {
    lines.push('  Stations : none detected');
  }
  lines.push('');

  if (ruins.length > 0) {
    lines.push('  Ruins    : ' + ruins.length + ' site(s) on record');
    lines.push('  ' + ruinDescription(q.state));
  } else {
    lines.push('  Ruins    : none on record');
  }
  lines.push('');

  if (veydrite.length > 0) {
    lines.push('  Veydrite : POSITIVE — ' + veydrite.length + ' body/bodies');
    lines.push('  ' + veydriteRating(sys.starClass));
  } else {
    lines.push('  Veydrite : negative');
  }

  lines.push('');
  lines.push('  Jumps    : ' + sys.jumpPoints + ' outbound');
  lines.push('  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard) + '  (' + sys.hazard + '/5)');
  lines.push('  Traffic  : ' + '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic) + '  (' + sys.traffic + '/5)');
  lines.push('');
  lines.push('  ── FIELD NOTES ───────────────────────────────────────────────');
  lines.push('');
  lines.push('  ' + systemFlavor(sys, q.state));
  lines.push('');
  if (playerState.docked) { lines.push('  Docked at: ' + playerState.dockedAt); lines.push(''); }

  if (typeof updateAuspex === 'function') updateAuspex();
  if (!playerState.visitedSystems) playerState.visitedSystems = {};
  playerState.visitedSystems[sys.name] = true;
  return lines.join('\n');
}

// ── Combat ────────────────────────────────────

function renderCombatOptions() {
  const ship  = getShip();
  const state = getCombatState();
  const hasWeapons = ship && ship.weaponSlots.some(s => s.type && s.ammo && Object.values(s.ammo).some(v => v > 0));

  return [
    '  Hull: ' + (ship ? ship.hull + '/' + ship.hullMax : '—') + '  |  Power: ' + (ship ? ship.powerCore.current + '/' + ship.powerCore.max : '—'),
    '',
    '  evade      — burn fuel, attempt to outrun',
    '  negotiate  — bribe, bluff, or convince',
    hasWeapons
      ? '  fight      — engage  (type "weapons" to check loadout)'
      : '  fight      — engage  [WARNING: no effective weapons]',
    '  yield      — surrender cargo',
    '',
    '  profile    — hull signature scan of contact',
    '  sigint     — full emissions analysis',
    '  weapons    — check your weapon status',
    '',
  ].join('\n');
}

function handleEncounterCommand(cmd, args) {
  switch(cmd) {
    case 'evade':     return cmdEvade();
    case 'negotiate': return cmdNegotiate();
    case 'fight':     return cmdFight(args);
    case 'yield':     return cmdYield();
    case 'profile':   return cmdProfile();
    case 'sigint':    return cmdSigint();
    case 'target':    return cmdTarget(args);
    case 'fire':      return cmdFire(args);
    case 'reload':    return cmdReload(args);
    case 'weapons':   return cmdWeapons();
    case 'status':    return cmdStatus();
    case 'systems':   return cmdSystems();
    default:
      return [
        '',
        '  [ENCOUNTER] You are under threat.',
        '',
        renderCombatOptions(),
      ].join('\n');
  }
}

function cmdEvade() {
  if (!playerState.inEncounter) return '  [EVADE] No active encounter.';
  const enc      = playerState.encounter;
  const ship     = getShip();
  const fuelCost = 10 + Math.floor(Math.random() * 10);

  if (ship.fuel < fuelCost) {
    return ['', '  [EVADE] Insufficient fuel to run.', '  Type "yield" or "fight".', ''].join('\n');
  }

  const threat     = enc.attacker.threat;
  const evadeChance = Math.max(0.2, 0.8 - (threat * 0.1));

  ship.fuel -= fuelCost;

  if (Math.random() < evadeChance) {
    playerState.inEncounter = false;
    playerState.encounter   = null;
    clearCombatState();
    return ['', '  [EVADE] You pull away. They don\'t follow.', '  Fuel burned: ' + fuelCost + ' units.  Remaining: ' + ship.fuel + ' units.', ''].join('\n');
  }

  const damage = 5 + Math.floor(Math.random() * 10) * threat;
  ship.hull = Math.max(0, ship.hull - damage);
  if (ship.hull <= 0) return handleDeath('destroyed while attempting to evade ' + enc.attacker.name);

  return [
    '',
    '  [EVADE] They stay with you. Fire clips your hull.',
    '  Hull damage: -' + damage + '  |  Hull: ' + ship.hull + '/' + ship.hullMax,
    '  Fuel burned: ' + fuelCost + ' units.',
    '',
    renderCombatOptions(),
  ].join('\n');
}

function cmdNegotiate() {
  if (!playerState.inEncounter) return '  [NEGOTIATE] No active encounter.';
  const enc    = playerState.encounter;
  const ship   = getShip();
  const threat = enc.attacker.threat;
  const want   = enc.attacker.want;

  let chance = Math.max(0.15, 0.65 - (threat * 0.08));
  if (want === 'scrip'   && playerState.credits  > 500) chance += 0.15;
  if (want === 'cargo'   && playerState.veydrite === 0)  chance += 0.20;
  if (want === 'unknown')                                chance  = 0.10;

  if (Math.random() < chance) {
    playerState.inEncounter = false;
    playerState.encounter   = null;
    clearCombatState();
    let cost = '';
    if (want === 'scrip' && playerState.credits > 0) {
      const bribe = Math.min(playerState.credits, Math.floor(50 + Math.random() * 150));
      playerState.credits -= bribe;
      cost = '\n  Bribe paid: ' + bribe + ' CR.  Scrip: ' + playerState.credits + ' CR.';
    }
    return ['', '  [NEGOTIATE] They take what you offer and pull back.', cost, '  You watch them go.', ''].join('\n');
  }

  const damage = 8 + Math.floor(Math.random() * 8) * threat;
  ship.hull = Math.max(0, ship.hull - damage);
  if (ship.hull <= 0) return handleDeath('destroyed after failed negotiation with ' + enc.attacker.name);

  return [
    '',
    '  [NEGOTIATE] They don\'t want to talk.',
    '  Hull damage: -' + damage + '  |  Hull: ' + ship.hull + '/' + ship.hullMax,
    '',
    renderCombatOptions(),
  ].join('\n');
}

function cmdFight(args) {
  if (!playerState.inEncounter) return '  [FIGHT] No active encounter.';

  const ship  = getShip();
  const state = getCombatState();
  const enc   = playerState.encounter;

  if (!state || !state.enemy) {
    return ['', '  [FIGHT] No combat data. Something went wrong.', ''].join('\n');
  }

  const enemy = state.enemy;

  // Check if player has weapons with ammo
  const armedSlot = ship.weaponSlots.find(s =>
    s.type && s.ammo && Object.values(s.ammo).some(v => v > 0)
  );

  if (!armedSlot) {
    // No weapons — desperate brawl
    if (Math.random() < 0.12) {
      playerState.inEncounter = false;
      playerState.encounter   = null;
      clearCombatState();
      const damage = 15 + Math.floor(Math.random() * 20);
      ship.hull = Math.max(0, ship.hull - damage);
      if (ship.hull <= 0) return handleDeath('destroyed in unarmed combat with ' + enc.attacker.name);
      return ['', '  [FIGHT] You make yourself expensive enough. They break off.', '  Hull damage: -' + damage + '  |  Hull: ' + ship.hull + '/' + ship.hullMax, ''].join('\n');
    }
    const damage = 25 + Math.floor(Math.random() * 25);
    ship.hull = Math.max(0, ship.hull - damage);
    if (ship.hull <= 0) return handleDeath('destroyed in combat with ' + enc.attacker.name);
    return ['', '  [FIGHT] They hit you hard. No weapons to answer with.', '  Hull damage: -' + damage + '  |  Hull: ' + ship.hull + '/' + ship.hullMax, '', renderCombatOptions()].join('\n');
  }

  // Has weapons — open combat sub-mode
  return [
    '',
    '  ── COMBAT ────────────────────────────────────────────────────',
    '',
    '  Target: ' + enemy.name + '  Hull: ' + enemy.hull + '/' + enemy.hullMax,
    '  Targeting: ' + (state.playerTarget || 'hull_core'),
    '',
    '  Your weapons:',
    ...ship.weaponSlots.filter(s => s.type).map(s => {
      const ammoTotal = Object.values(s.ammo).reduce((a, b) => a + b, 0);
      return '    [' + s.id + '] ' + s.name + '  ' + conditionRating(s.condition) + '  ' + ammoTotal + ' rds  active: ' + s.activeAmmo;
    }),
    '',
    '  fire <slot>          — fire weapon',
    '  fire <slot> <ammo>   — fire with specific ammo',
    '  target <subsystem>   — change target',
    '  profile              — scan enemy hull',
    '  sigint               — full enemy analysis',
    '  disengage            — attempt to break off',
    '',
  ].join('\n');
}

function cmdFire(args) {
  if (!playerState.inEncounter) return '  [FIRE] No active encounter.';

  const ship  = getShip();
  const state = getCombatState();
  if (!state || !state.enemy) return '  [FIRE] No combat data.';

  const slotId = parseInt(args[0]);
  if (isNaN(slotId)) return '  [FIRE] Usage: fire <slot number>';

  // Override ammo if specified
  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot || !slot.type) return '  [FIRE] No weapon in slot ' + slotId + '.';

  if (args[1]) {
    const ammoType = args[1].toUpperCase();
    if (slot.ammo[ammoType] === undefined) return '  [FIRE] Ammo type "' + ammoType + '" not loaded in slot ' + slotId + '.';
    slot.activeAmmo = ammoType;
  }

  const enemy  = state.enemy;
  const target = state.playerTarget || 'hull_core';
  const targetSub = enemy.subsystems[target];
  const targetArm = targetSub ? targetSub.arm : enemy.armor;

  const result = resolveShot(ship, slotId, target, targetArm);

  if (result.error) return ['', '  [FIRE] ' + result.error, ''].join('\n');

  const lines = ['', '  ── WEAPONS FIRE ──────────────────────────────────────────────', ''];

  if (result.jammed) {
    lines.push('  [JAM] ' + result.weapon + ' jammed.');
    lines.push('  Condition: ' + slot.condition + '/100  [' + conditionRating(slot.condition) + ']');
    lines.push('  Repair at next station to reduce jam risk.');
    lines.push('');
  } else {
    lines.push('  ' + result.weapon + '  [' + result.ammoType + ']  burst: ' + result.burst + ' rds');

    // Apply damage to enemy
    if (targetSub) {
      const eff = Math.max(1, result.hullDamage - targetSub.arm);
      targetSub.hp  = Math.max(0, targetSub.hp  - eff);
      targetSub.sta = Math.max(0, targetSub.sta - Math.round(eff * 1.5));
      enemy.hull    = Math.max(0, enemy.hull - Math.round(eff * 0.5));

      lines.push('  Hit: ' + target.replace('_', ' ').toUpperCase() + '  Damage: ' + eff);
      lines.push('  ' + target.replace('_', ' ').toUpperCase() + ' HP: ' + targetSub.hp + '  Hull: ' + enemy.hull + '/' + enemy.hullMax);

      if (targetSub.hp <= 0) {
        lines.push('  [!] ' + target.replace('_', ' ').toUpperCase() + ' DESTROYED.');
        if (target === 'hull_core') {
          playerState.inEncounter = false;
          playerState.encounter   = null;
          clearCombatState();
          lines.push('  Enemy vessel destroyed.');
          lines.push('  Salvage may be available. Type "salvage".');
          const killAch1 = triggerAchievements({ type: 'kill', enemyClass: enemy.name, attackerKey: enc.attackerKey });
          if (killAch1) lines.push(killAch1);
          lines.push('');
          return lines.join('\n');
        }
      }
    } else {
      const eff = Math.max(1, result.hullDamage - (enemy.armor || 0));
      enemy.hull = Math.max(0, enemy.hull - eff);
      lines.push('  Hull hit.  Damage: ' + eff + '  Enemy hull: ' + enemy.hull + '/' + enemy.hullMax);
    }

    lines.push('  Weapon condition: ' + result.conditionAfter + '/100  [' + result.conditionRating + ']');
    if (result.conditionBefore !== result.conditionRating) {
      const warnings = {
        WORN:     '  [WARN] ' + result.weapon + ' wearing. Jam risk increasing.',
        DEGRADED: '  [WARN] ' + result.weapon + ' degraded. Performance compromised.',
        CRITICAL: '  [!!] ' + result.weapon + ' CRITICAL. High jam probability. Repair immediately.',
      };
      if (warnings[result.conditionRating]) lines.push(warnings[result.conditionRating]);
    }
    lines.push('  Ammo remaining: ' + (slot.ammo[slot.activeAmmo] || 0) + ' rds');
    lines.push('');

    // Enemy destroyed?
      if (enemy.hull <= 0) {
      playerState.inEncounter = false;
      playerState.encounter   = null;
      clearCombatState();
      lines.push('  Enemy vessel destroyed.');
      lines.push('  Salvage may be available. Type "salvage".');
      const killAch2 = triggerAchievements({ type: 'kill', enemyClass: enemy.name, attackerKey: enc.attackerKey });
      if (killAch2) lines.push(killAch2);
      lines.push('');
      return lines.join('\n');
    }

    // Enemy fires back
    const counterResult = enemyAttack(enemy, ship);
    if (counterResult && counterResult.hit) {
      ship.hull = Math.max(0, ship.hull - counterResult.damage);
      lines.push('  ── RETURN FIRE ───────────────────────────────────────────────');
      lines.push('  Enemy hit your hull.  Damage: -' + counterResult.damage + '  Hull: ' + ship.hull + '/' + ship.hullMax);
      lines.push('');
      if (ship.hull <= 0) return handleDeath('destroyed in combat with ' + enc.attacker.name);
      const surviveAch = triggerAchievements({ type: 'survived_combat', hullPct: Math.round((ship.hull / ship.hullMax) * 100), attackerKey: enc.attackerKey });
      if (surviveAch) lines.push(surviveAch);
    } else if (counterResult && counterResult.missed) {
      lines.push('  Enemy fires — missed.');
      lines.push('');
    }
  }

  lines.push(renderCombatOptions());
  return lines.join('\n');
}

function cmdTarget(args) {
  if (!playerState.inEncounter) return '  [TARGET] No active encounter.';
  const state = getCombatState();
  if (!state || !state.enemy) return '  [TARGET] No combat data.';

  const enemy = state.enemy;
  if (!enemy.profiled && !enemy.siginted) {
    return ['', '  [TARGET] Run "profile" first to reveal enemy subsystems.', ''].join('\n');
  }

  const query = args.join('_').toLowerCase();
  const subsystems = Object.keys(enemy.subsystems);
  const match = subsystems.find(k => k.includes(query) || query.includes(k.replace('_', '')));

  if (!match) {
    return [
      '',
      '  [TARGET] Unknown subsystem. Available:',
      ...subsystems.map(k => '    — ' + k.replace('_', ' ')),
      '',
    ].join('\n');
  }

  state.playerTarget = match;
  return ['', '  [TARGET] Targeting: ' + match.replace('_', ' ').toUpperCase(), ''].join('\n');
}

function cmdProfile() {
  if (!playerState.inEncounter) return '  [PROFILE] No active encounter.';
  const state = getCombatState();
  const ship  = getShip();
  if (!state || !state.enemy) return '  [PROFILE] No combat data.';

  const powerCost = 10;
  if (ship.powerCore.current < powerCost) {
    return ['', '  [PROFILE] Insufficient power.  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  drainPower(ship, powerCost);
  state.enemy.profiled = true;
  return renderEnemyProfile(state.enemy);
}

function cmdSigint() {
  if (!playerState.inEncounter) return '  [SIGINT] No active encounter.';
  const state = getCombatState();
  const ship  = getShip();
  if (!state || !state.enemy) return '  [SIGINT] No combat data.';

  if (!state.enemy.profiled) {
    return ['', '  [SIGINT] Run "profile" first.', ''].join('\n');
  }

  const powerCost = 25;
  if (ship.powerCore.current < powerCost) {
    return ['', '  [SIGINT] Insufficient power.  Core: ' + ship.powerCore.current + '/' + ship.powerCore.max, ''].join('\n');
  }

  drainPower(ship, powerCost);
  state.enemy.siginted = true;

  // Enemy may detect the scan
  if (Math.random() < 0.3) {
    const damage = 5 + Math.floor(Math.random() * 10);
    ship.hull = Math.max(0, ship.hull - damage);
    const result = renderEnemyProfile(state.enemy);
    return result + '\n  [!] They detected your scan. Hull damage: -' + damage + '  Hull: ' + ship.hull + '/' + ship.hullMax + '\n';
  }

  return renderEnemyProfile(state.enemy);
}

function cmdYield() {
  if (!playerState.inEncounter) return '  [YIELD] No active encounter.';
  const enc  = playerState.encounter;
  const want = enc.attacker.want;

  playerState.inEncounter = false;
  playerState.encounter   = null;
  clearCombatState();

  const lines = ['', '  [YIELD] You cut your drive and broadcast surrender.', ''];

  if (want === 'cargo' || want === 'scrip') {
    if (playerState.veydrite > 0) {
      lines.push('  They take your veydrite. All ' + playerState.veydrite + ' kg.');
      playerState.veydrite = 0;
    }
    if (playerState.credits > 100) {
      const taken = Math.floor(playerState.credits * 0.4);
      playerState.credits -= taken;
      lines.push('  They take ' + taken + ' CR.');
    }
  } else if (want === 'expulsion') {
    lines.push('  They escort you to the jump point.');
    const repResult = adjustRep(playerState.dockedFactionKey || 'colonial', -5, 'Expelled from controlled space');
    if (repResult) lines.push(renderRepChange(repResult));
  } else {
    lines.push('  They take nothing. They just watch you.');
    lines.push('  The contact disappears from sensors.');
  }

  lines.push('');
  lines.push('  You are clear. For now.');
  lines.push('');
  return lines.join('\n');
}

function handleDeath(cause) {
  recordDeath(playerState, cause);
  deleteSave();
  playerState.isDead     = true;
  playerState.deathCause = cause;
  return '__DEATH__';
}

// ── Ping ──────────────────────────────────────

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
            ? (c.dark ? '  ◈ [' + (i+1) + '] [NO SIGNATURE] — running dark' : '  ◈ [' + (i+1) + '] ' + c.shipClass + ' — ' + c.registry + (c.shipName ? '\n       "' + c.shipName + '"' : ''))
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
        lines.push('  ◈ [' + (i+1) + '] ' + c.shipClass + ' — ' + c.registry);
        if (c.shipName) lines.push('       "' + c.shipName + '"');
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
      else { c.resolved = true; lines.push(c.dark ? '  ◈ [' + (i+1) + '] [NO SIGNATURE] — running dark' : '  ◈ [' + (i+1) + '] ' + c.shipClass + ' — ' + c.registry + (c.shipName ? '\n       "' + c.shipName + '"' : '')); }
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
    else { lines.push('  ◈ [' + (index+1) + '] ' + contact.shipClass + ' — ' + contact.registry); if (contact.shipName) lines.push('       "' + contact.shipName + '"'); }
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
  else { lines.push('  ◈ [' + (index+1) + '] ' + contact.shipClass + ' — ' + contact.registry); if (contact.shipName) lines.push('       "' + contact.shipName + '"'); }
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
    neutral:    'Fuel exchange  |  Cargo hold  |  Assay terminal  |  Armory  |  Bulletin board',
    commercial: 'Fuel exchange  |  Cargo trading  |  Armory  |  Pelk contract board  |  Repair bay',
    military:   'Fuel exchange  |  Restricted cargo only  |  Military armory  |  CCC contract board',
    hostile:    'Fuel (price negotiable)  |  No formal services  |  Watch your cargo',
    unknown:    'Services unknown  |  Proceed with caution',
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
    contacts.push({ shipClass: shipClass.name, mass: shipClass.mass, dark, registry, shipName, resolved: false });
  }

  if (xenoTaint) {
    contacts.push({ shipClass: null, mass: 'mass-unknown', dark: true, registry: null, shipName: null, resolved: false, xeno: true });
  }

  return contacts;
}

function generateContactName() {
  if (typeof NAMES !== 'undefined') {
    const roll = Math.random();
    if (roll < 0.3 && NAMES.ship_virtue) {
      return NAMES.ship_virtue[Math.floor(Math.random() * NAMES.ship_virtue.length)];
    } else if (roll < 0.6 && NAMES.ship_endurance && NAMES.ship_endurance_noun) {
      return NAMES.ship_endurance[Math.floor(Math.random() * NAMES.ship_endurance.length)] + ' ' +
             NAMES.ship_endurance_noun[Math.floor(Math.random() * NAMES.ship_endurance_noun.length)];
    } else if (NAMES.ship_endurance && NAMES.ship_aspiration) {
      return NAMES.ship_endurance[Math.floor(Math.random() * NAMES.ship_endurance.length)] + ' ' +
             NAMES.ship_aspiration[Math.floor(Math.random() * NAMES.ship_aspiration.length)];
    }
  }
  return null;
}

let currentContacts = null;
const contactCache  = {};
