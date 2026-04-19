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

function assignFaction(state) {
  const pools = {
    Established: ['guild', 'pelk', 'colonial', 'pelk', 'guild'],
    Contested:   ['pelk', 'colonial', 'independent', 'feral', 'pelk'],
    Declining:   ['independent', 'pelk', 'feral', 'independent'],
    Collapsed:   ['feral', 'feral', 'independent', 'feral'],
    Isolated:    ['independent', 'independent', 'feral'],
    Forbidden:   ['forbidden', 'forbidden', 'forbidden'],
  };
  const pool = pools[state] || ['independent'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Station name generator ────────────────────

function generateStationName(systemName, factionKey) {
  const prefixes = {
    guild:       ['Assay Point', 'Survey Station', 'Guild Relay', 'Assessment Post'],
    pelk:        ['Pelk Depot', 'Transit Hub', 'Pelk Waystation', 'Logistics Post'],
    colonial:    ['CCC Outpost', 'Colonial Station', 'Forward Base', 'CCC Relay'],
    feral:       ['The Hulk', 'Scratch Station', 'The Nail', 'Drift Post'],
    independent: ['Free Berth', 'Open Dock', 'The Anchorage', 'Waypoint'],
    forbidden:   ['Installation', 'Unknown Station', 'Sealed Platform'],
  };
  const pool   = prefixes[factionKey] || prefixes.independent;
  const prefix = pool[Math.floor(Math.random() * pool.length)];
  const tag    = systemName.split(' ')[0];
  return prefix + ' ' + tag;
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

let galaxy = null;
let playerState = {
  location:         null,
  cargo:            [],
  credits:          200,
  veydrite:         0,
  ship:             null,   // set in initCommands
  captainName:      'Unknown',
  galaxySeed:       '4471-KETH-NULL',
  docked:           false,
  dockedAt:         null,
  dockedFactionKey: null,
  inTrade:          false,
  pendingTx:        null,
  pendingMenu:      false,
  currentDay:       0,
  bulletinContracts: [],
  logs:             [],
  flags:            {},
  stats:            { jumps: 0, salvages: 0, daysSurvived: 0, creditsEarned: 0 },
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

  galaxy.quadrants.forEach(q => {
    q.clusters.forEach(cluster => {
      cluster.systems.forEach(sys => {
        sys.bodies.forEach(body => {
          if (body.hasStation) {
            body.factionKey  = assignFaction(q.state);
            body.faction     = FACTIONS[body.factionKey] || FACTIONS.independent;
            body.stationName = generateStationName(sys.name, body.factionKey);
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
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
  return cluster && cluster.systems.find(s => s.name === loc.systemName);
}

// ── Dispatch ──────────────────────────────────

function handleCommand(raw) {
  const input          = raw.trim().toLowerCase();
  const [cmd, ...args] = input.split(/\s+/);

  if (playerState.inTrade)    return handleTradeCommand(cmd, args);
  if (playerState.inEncounter) return handleEncounterCommand(cmd, args);

  switch (cmd) {
    case 'help':      return cmdHelp();
    case 'galaxy':    return renderGalaxyOverview(galaxy);
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
    case 'salvage':   return cmdSalvage();
    case 'rep':       return cmdRep();
    case 'bulletin':  return cmdBulletin();
    case 'accept':    return cmdAccept(args);
    case 'contract':  return cmdContract();
    case 'complete':  return cmdComplete();
    case 'abandon':   return cmdAbandon();
    case 'ping':      return cmdPing();
    case 'resolve':   return cmdResolve(args);
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
    '  galaxy              — full quadrant index',
    '  scan <1-8>          — survey a quadrant',
    '  where               — current system survey',
    '  nav <system name>   — calculated jump anywhere',
    '  jump <system name>  — blind jump within cluster',
    '',
    '  ── SENSORS ───────────────────────────────────────────────────',
    '',
    '  ping                — gravimetric sweep',
    '  resolve <number>    — resolve a specific contact',
    '  resolve all         — resolve all contacts',
    '',
    '  ── STATION ───────────────────────────────────────────────────',
    '',
    '  dock                — dock at nearest station',
    '  undock              — leave station',
    '  trade               — open trade terminal',
    '  repair              — repair hull or weapons',
    '  bulletin            — view available contracts',
    '  accept <number>     — accept a contract',
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
  return renderQuadrantDetail(galaxy, index);
}

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
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

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

  const result = rollSalvage(sys, q.state);
  return renderSalvageResult(result, playerState) + '  Day: ' + playerState.currentDay + '\n';
}

// ── Dock ──────────────────────────────────────

function cmdDock() {
  if (playerState.docked) return '  [DOCK] Already docked at ' + playerState.dockedAt + '.';

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
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
  const repResult = adjustRep(body.factionKey, 1, 'Docked and paid fees');

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
  lines.push('  Type "repair" for hull and weapon repair.');
  lines.push('  Type "undock" to return to space.');
  lines.push('');
  lines.push(renderRepChange(repResult));
  lines.push('');

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
  playerState.bulletinContracts = [];
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
  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  const price = fuelPrice(q.state);
  if (!args[0] || args[0] !== 'fuel') return '  [BUY] Usage: buy fuel <amount>';
  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount <= 0) return '  [BUY] Specify an amount.';
  const cost = amount * price;
  if (playerState.credits < cost) {
    return ['', '  [BUY] Insufficient scrip.', '  Cost: ' + cost + ' CR  |  You have: ' + playerState.credits + ' CR', ''].join('\n');
  }
  playerState.pendingTx = { type: 'buy', commodity: 'fuel', amount, cost };
  return [
    '',
    '  [BUY] Confirm transaction?',
    '  Buy      : ' + amount + ' units fuel',
    '  Rate     : ' + price + ' CR/unit',
    '  You pay  : ' + cost + ' CR',
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
    return ['', '  [SELL] Transaction complete.', '  Sold: ' + tx.amount + ' kg  |  Earned: ' + tx.earned + ' CR', '  Scrip: ' + playerState.credits + ' CR', ''].join('\n');
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

  return '  [REPAIR] Usage: repair  |  repair hull full  |  repair hull <amount>';
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
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
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
    '  Quadrant : ' + q.name + '  [' + q.state + ']',
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
    return ['', '  [EVADE] You pull away. They don\'t follow.', '  Fuel burned: ' + fuelCost + ' units.  Remaining: ' + ship.fuel, ''].join('\n');
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
    lines.push('  [JAM] ' + result.weapon + ' jammed. Clear and retry.');
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
    lines.push('  Ammo remaining: ' + (slot.ammo[slot.activeAmmo] || 0) + ' rds');
    lines.push('');

    // Enemy destroyed?
    if (enemy.hull <= 0) {
      playerState.inEncounter = false;
      playerState.encounter   = null;
      clearCombatState();
      lines.push('  Enemy vessel destroyed.');
      lines.push('  Salvage may be available. Type "salvage".');
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
  const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
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
  return ['', '  [ACCEPT] Contract accepted.', '', '  ' + c.title, '  ' + c.description, '', '  Payment    : ' + c.payment + ' CR', '  Rep reward : +' + c.repReward, '  Time limit : ' + c.timeLimitDays + ' days', '  Deadline   : Day ' + (playerState.currentDay + c.timeLimitDays), '', '  Good luck.', ''].join('\n');
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
  const lines = ['', '  [COMPLETE] Contract fulfilled.', '', '  ' + active.title, '  Payment  : ' + result.total + ' CR' + (result.bonus > 0 ? '  (speed bonus: +' + result.bonus + ' CR)' : ''), '  Rep      : +' + result.repEarned + (result.fast ? '  (ahead of schedule)' : ''), '  Scrip    : ' + playerState.credits + ' CR', ''];
  if (result.repResult) lines.push(renderRepChange(result.repResult));
  lines.push('');
  return lines.join('\n');
}

// ── Abandon ───────────────────────────────────

function cmdAbandon() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [ABANDON] No active contract.';
  const result = failContract(active);
  const lines  = ['', '  [ABANDON] Contract abandoned.', '  ' + active.title, '  Reputation penalty applied.', ''];
  if (result.repResult) lines.push(renderRepChange(result.repResult));
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
  return ['', '  [NEWSAVE] This will erase your current save and start over.', '  Type "yes" to confirm or anything else to cancel.', ''].join('\n');
}

function cmdMenu() {
  playerState.pendingMenu = true;
  return ['', '  [MENU] Return to main menu?', '  Your progress has been autosaved.', '', '  Type "yes" to confirm or anything else to cancel.', ''].join('\n');
}

// ── Flavor text ───────────────────────────────

function stationServices(attitude) {
  const services = {
    neutral:    'Fuel exchange  |  Cargo hold  |  Assay terminal  |  Bulletin board',
    commercial: 'Fuel exchange  |  Cargo trading  |  Pelk contract board  |  Repair bay',
    military:   'Fuel exchange  |  Restricted cargo only  |  CCC contract board',
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
