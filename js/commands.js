// ============================================
//  APHELION — Command Parser
//  commands.js
//  Stage 7: Factions, Reputation, Contracts
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

// ── Player State ──────────────────────────────

let galaxy = null;
let playerState = {
  location:         null,
  cargo:            [],
  credits:          200,
  veydrite:         0,
  fuel:             60,
  hull:             80,
  ship:             'Wayward-class Prospector',
  shipName:         'The Unspoken',
  captainName:      'Unknown',
  galaxySeed:       '4471-KETH-NULL',
  docked:           false,
  dockedAt:         null,
  dockedFactionKey: null,
  inTrade:          false,
  pendingTx:        null,
  pendingMenu:      false,
  inEncounter:      false,
  encounter:        null,
  currentDay:       0,
  bulletinContracts: [],
  logs:              [],
};

// ── Init ──────────────────────────────────────

function initCommands(seed) {
  galaxy = generateGalaxy(seed, Naming);
  playerState.galaxySeed = seed;


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

// ── Dispatch ──────────────────────────────────

function handleCommand(raw) {
  const input          = raw.trim().toLowerCase();
  const [cmd, ...args] = input.split(/\s+/);

  if (playerState.inTrade) return handleTradeCommand(cmd, args);
  if (playerState.inEncounter) return handleEncounterCommand(cmd);


  switch (cmd) {
    case 'help':     return cmdHelp();
    case 'galaxy':   return renderGalaxyOverview(galaxy);
    case 'scan':     return cmdScan(args);
    case 'nav':      return cmdNav(args);
    case 'jump':       return cmdJump(args);
    case 'where':
    case 'look':     return cmdWhere();
    case 'dock':     return cmdDock();
    case 'undock':   return cmdUndock();
    case 'trade':    return cmdTrade(args);
    case 'sell':     return cmdSell(args);
    case 'buy':      return cmdBuy(args);
    case 'salvage':  return cmdSalvage();
    case 'rep':      return cmdRep();
    case 'bulletin': return cmdBulletin();
    case 'accept':   return cmdAccept(args);
    case 'contract': return cmdContract();
    case 'complete': return cmdComplete();
    case 'abandon':  return cmdAbandon();
    case 'status':   return cmdStatus();
    case 'ping':       return cmdPing();
    case 'resolve':    return cmdResolve();
    case 'logs':     return cmdLogs();
    case 'evade':      return cmdEvade();
    case 'negotiate':  return cmdNegotiate();
    case 'fight':      return cmdFight();
    case 'yield':      return cmdYield();
    case 'save':     return cmdSave();
    case 'menu':     return cmdMenu();
    case 'newsave':  return cmdNewSave();
    case '':         return '';
    default:         return '  [UNKNOWN] "' + cmd + '" is not a recognized command. Type help.';
  }
}

// ── Help ──────────────────────────────────────

function cmdHelp() {
  return [
    '',
    '  menu                — return to main menu',
    '  ── NAVIGATION ────────────────────────────────────────────────',
    '',
    '  galaxy              — full quadrant index',
    '  scan <1-8>          — survey a quadrant',
    '  where               — current system survey',
    '  jump <system name>  — blind jump within current cluster (fast, dark)',
    '  nav <system name>   — navigate to a system',
    '',
    '  ── STATION ───────────────────────────────────────────────────',
    '',
    '  dock                — dock at nearest station',
    '  undock              — leave station',
    '  trade               — open trade terminal',
    '  bulletin            — view available contracts',
    '  accept <number>     — accept a contract',
    '',
    '  ── FIELD ─────────────────────────────────────────────────────',
    '',
    '  salvage             — salvage operation',
    '  contract            — view active contract',
    '  complete            — complete active contract',
    '  abandon             — abandon active contract',
    '  evade              — attempt to evade an encounter',
    '  negotiate          — attempt to talk your way out',
    '  fight              — engage directly',
    '  yield              — surrender cargo',
    '',
    '  ── GENERAL ───────────────────────────────────────────────────',
    '',
    '  rep                 — faction standing',
    '  status              — ship status',
    '  logs                — recovered logs and beacons',
    '  scan log            — scan ruin sites for data fragments',
    '',
  ].join('\n');
}

// ── Scan ──────────────────────────────────────

function cmdScan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return renderGalaxyOverview(galaxy);

  // scan log — read ruin logs in current system
  if (args[0] === 'log') {
    return cmdScanLog();
  }

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
    return [
      '',
      '  [SCAN] No ruin sites in this system.',
      '  Nothing to read.',
      '',
    ].join('\n');
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

function cmdJump(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] jump <system name>';
  if (playerState.docked) return '  [JUMP] You are docked. Type "undock" first.';
  currentContacts = null;

  const query = args.join(' ').toLowerCase();

  // Find current cluster
  const loc        = playerState.location;
  const q          = galaxy.quadrants[loc.quadrantIndex];
  const curCluster = q && q.clusters.find(c => c.name === loc.clusterName);

  if (!curCluster) return '  [ERROR] Location data corrupted.';

  // Search only within current cluster
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

  // Fuel cost — cheaper than nav
  const fuelCost = 6 + Math.floor(Math.random() * 5);
  if (playerState.fuel < fuelCost) {
    return [
      '',
      '  [JUMP] Insufficient fuel.',
      '  Required: ' + fuelCost + ' units  |  Available: ' + playerState.fuel + ' units.',
      '',
    ].join('\n');
  }

  // Transit time — fast
  const travelDays = 1 + Math.floor(Math.random() * 3);
  playerState.fuel       -= fuelCost;
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
    '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + playerState.fuel + ' units',
    '  Transit  : ' + travelDays + ' standard days',
    '  Day      : ' + playerState.currentDay,
    '',
    '  Arrived dark. Sensors offline.',
    '  Type "where" to survey this system.',
    '',
  ];

  // Hull stress — 30% chance of minor damage
  if (Math.random() < 0.3) {
    const stress = 1 + Math.floor(Math.random() * 3);
    playerState.hull = Math.max(0, playerState.hull - stress);
    lines.push('  [!] Exit stress — hull integrity -' + stress + '%.  Hull: ' + playerState.hull + '%');
    lines.push('');

    if (playerState.hull <= 0) {
      return handleDeath('hull failure during blind jump to ' + target.name);
    }
  }

  // Higher encounter rate for blind jumps
  const encounter = rollEncounter(target, q, playerState, true);
  if (encounter) {
    playerState.inEncounter = true;
    playerState.encounter   = encounter;
    lines.push('  ── CONTACT ───────────────────────────────────────────────────');
    lines.push('');
    lines.push('  ' + encounter.openingLine);
    lines.push('');
    lines.push('  Hull: ' + playerState.hull + '%  |  Fuel: ' + playerState.fuel + ' units  |  Scrip: ' + playerState.credits + ' CR');
    lines.push('');
    lines.push('  evade  |  negotiate  |  fight  |  yield');
    lines.push('');
  }

  // Beacon check — but don't update auspex (arrived dark)
  const beacon = rollBeacon(target);
  if (beacon) {
    const ageTag = beacon.age === 'recent'  ? '[RECENT]'
                 : beacon.age === 'old'     ? '[ARCHIVED]'
                 : '[UNKNOWN AGE]';
    lines.push('  ── DISTRESS BEACON DETECTED ──────────────────────────────────');
    lines.push('');
    lines.push('  ' + ageTag + ' ' + beacon.text);
    lines.push('');
    playerState.logs.push({ type: 'beacon', system: target.name, age: beacon.age, text: beacon.text });
  }

  // Check active contract
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (active) {
    const status = checkContractStatus(active, playerState.currentDay, target.name);
    if (status && status.status === 'failed') {
      const result = failContract(active);
      lines.push('  [CONTRACT] FAILED — ' + active.title);
      lines.push('  Time limit exceeded.');
      if (result.repResult) lines.push(renderRepChange(result.repResult));
      lines.push('');
    } else if (status && status.status === 'ready') {
      lines.push('  [CONTRACT] Target system reached — type "complete" to finish.');
      lines.push('  Days remaining: ' + status.daysLeft);
      lines.push('');
    } else if (status && status.status === 'active') {
      lines.push('  [CONTRACT] ' + active.title + ' — ' + status.daysLeft + ' days remaining.');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Nav ───────────────────────────────────────

function cmdNav(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] nav <system name>';
  if (playerState.docked) return '  [NAV] You are docked. Type "undock" first.';
// Clear contacts on nav — new system, fresh sweep needed
  currentContacts = null;

  const query = args.join(' ').toLowerCase();

  for (let qi = 0; qi < galaxy.quadrants.length; qi++) {
    const q = galaxy.quadrants[qi];
    for (let ci = 0; ci < q.clusters.length; ci++) {
      const cluster = q.clusters[ci];
      for (const sys of cluster.systems) {
        if (sys.name.toLowerCase().includes(query)) {

          const fuelCost = 8 + Math.floor(Math.random() * 8);
          if (playerState.fuel < fuelCost) {
            return [
              '',
              '  [NAV] Insufficient fuel for transit to ' + sys.name + '.',
              '  Required: ' + fuelCost + ' units  |  Available: ' + playerState.fuel + ' units.',
              '  Dock at a station and buy fuel.',
              '',
            ].join('\n');
          }

          const travelDays = 2 + Math.floor(Math.random() * 6);
          playerState.fuel       -= fuelCost;
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
            '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + playerState.fuel + ' units',
            '  Transit  : ' + travelDays + ' standard days',
            '  Day      : ' + playerState.currentDay,
            '',
            '  Drive nominal. Arrived.',
            '  Type "where" to survey this system.',
            '',
          ];

          // Check active contract status after arriving
          const active = activeContracts.find(c => !c.completed && !c.failed);
          if (active) {
            const status = checkContractStatus(active, playerState.currentDay, sys.name);
            if (status && status.status === 'failed') {
              const result = failContract(active);
              lines.push('  [CONTRACT] FAILED — ' + active.title);
              lines.push('  Time limit exceeded.');
              if (result.repResult) lines.push(renderRepChange(result.repResult));
              lines.push('');
            } else if (status && status.status === 'ready') {
              lines.push('  [CONTRACT] Target system reached — type "complete" to finish.');
              lines.push('  Days remaining: ' + status.daysLeft);
              lines.push('');
            } else if (status && status.status === 'active') {
              lines.push('  [CONTRACT] ' + active.title + ' — ' + status.daysLeft + ' days remaining.');
              lines.push('');
            }
          }

          // Combat encounter check
          const encounter = rollEncounter(sys, q, playerState);
          if (encounter) {
            playerState.inEncounter = true;
            playerState.encounter   = encounter;
            lines.push('');
            lines.push('  ── CONTACT ───────────────────────────────────────────────────');
            lines.push('');
            lines.push('  ' + encounter.openingLine);
            lines.push('');
            lines.push('  Hull: ' + playerState.hull + '%  |  Fuel: ' + playerState.fuel + ' units  |  Scrip: ' + playerState.credits + ' CR');
            lines.push('');
            lines.push('  ── YOUR OPTIONS ──────────────────────────────────────────────');
            lines.push('');
            lines.push('  evade      — burn fuel, attempt to outrun them');
            lines.push('  negotiate  — attempt to talk, bribe, or bluff your way out');
            lines.push('  fight      — engage directly (dangerous without weapons)');
            lines.push('  yield      — surrender cargo and veydrite');
            lines.push('');
          }
          
          // Beacon check on arrival
          const beacon = rollBeacon(sys);
          if (beacon) {
            const ageTag = beacon.age === 'recent'  ? '[RECENT]'
                         : beacon.age === 'old'     ? '[ARCHIVED]'
                         : '[UNKNOWN AGE]';
            lines.push('  ── DISTRESS BEACON DETECTED ' + '─'.repeat(29));
            lines.push('');
            lines.push('  ' + ageTag + ' ' + beacon.text);
            lines.push('');
            playerState.logs.push({ type: 'beacon', system: sys.name, age: beacon.age, text: beacon.text });
          }

// Update auspex on arrival
          if (typeof updateAuspex === 'function') updateAuspex();
          
          return lines.join('\n');
        }
      }
    }
  }
  return '  [NAV] No system matching "' + args.join(' ') + '" found in catalog.';
}

// ── Salvage ───────────────────────────────────

function cmdSalvage() {
  if (playerState.docked) return '  [SALVAGE] Undock first.';

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
    return [
      '',
      '  [SALVAGE] Nothing to salvage in ' + sys.name + '.',
      '  No ruins, debris fields, or veydrite deposits detected.',
      '',
    ].join('\n');
  }

  // Salvage takes time
  const salvageDays = 1 + Math.floor(Math.random() * 2);
  playerState.currentDay += salvageDays;

  const result = rollSalvage(sys, q.state);
  const output = renderSalvageResult(result, playerState);

  // Check contract after salvage time passes
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (active) {
    const status = checkContractStatus(active, playerState.currentDay, sys.name);
    if (status && status.status === 'failed') {
      failContract(active);
      return output + '\n  [CONTRACT] FAILED during salvage — time limit exceeded.\n';
    }
  }

  return output + '  Day: ' + playerState.currentDay + '\n';
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
    return [
      '',
      '  [DOCK] No station in ' + sys.name + '.',
      '  The void offers no berth.',
      '',
    ].join('\n');
  }

  const body    = stationBodies[0];
  const faction = body.faction || FACTIONS.independent;
  const fee     = dockingFee(body.factionKey);

  // Check if hostile
  const rep = getRep(body.factionKey);
  if (rep !== null && repTier(rep) === 'HOSTILE') {
    return [
      '',
      '  [DOCK] Docking refused.',
      '  ' + faction.name + ' has flagged your vessel.',
      '  Your standing: HOSTILE (' + rep + ')',
      '  Find another port.',
      '',
    ].join('\n');
  }

  if (fee > 0 && playerState.credits < fee) {
    return [
      '',
      '  [DOCK] Docking fee: ' + fee + ' CR.',
      '  Insufficient scrip.',
      '',
    ].join('\n');
  }

  if (fee > 0) playerState.credits -= fee;

  // Meet faction and gain small rep for paying
  meetFaction(body.factionKey);
  const repResult = adjustRep(body.factionKey, 1, 'Docked and paid fees');

  playerState.docked           = true;
  playerState.dockedAt         = body.stationName;
  playerState.dockedFactionKey = body.factionKey;

  // Generate bulletin contracts for this faction
  const faction_info = FACTION_REGISTRY[body.factionKey];
  if (faction_info && faction_info.contracts) {
    playerState.bulletinContracts = generateContracts(
      body.factionKey, galaxy, playerState.location
    );
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
  lines.push('  Type "undock" to return to space.');
  lines.push('');
  lines.push(renderRepChange(repResult));
  lines.push('');

  if (typeof updateAuspex === 'function') updateAuspex();
  
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
  return [
    '',
    '  [UNDOCK] Departing ' + name + '.',
    '  Thrusters nominal. Open space.',
    '',
  ].join('\n');
}

// ── Trade ─────────────────────────────────────

function cmdTrade(args) {
  if (!playerState.docked) return '  [TRADE] You must be docked to access the trade terminal.';
  if (args[0] === 'exit') {
    playerState.inTrade = false;
    return '  [TRADE] Terminal closed.';
  }
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

  if (cmd === 'exit') {
    playerState.inTrade = false;
    return '  [TRADE] Terminal closed.';
  }
  if (cmd === 'sell')   return cmdSell(args);
  if (cmd === 'buy')    return cmdBuy(args);
  if (cmd === 'status') return cmdStatus();
  if (cmd === 'trade') {
    const loc = playerState.location;
    const q   = galaxy.quadrants[loc.quadrantIndex];
    return buildTradeMenu(playerState, playerState.dockedFactionKey, q.state);
  }

  return [
    '  [TRADE] Unknown command.',
    '  Use: sell veydrite <amount>  |  buy fuel <amount>  |  exit',
  ].join('\n');
}

// ── Sell ──────────────────────────────────────

function cmdSell(args) {
  if (!playerState.docked) return '  [SELL] You must be docked to sell.';

  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  let price   = veydritePrice(q.state);

  // Guild rep affects price
  const guildRep = getRep('guild');
  if (guildRep !== null) {
    const tier = repTier(guildRep);
    if (tier === 'TRUSTED') price = Math.round(price * 1.15);
    if (tier === 'HOSTILE') price = Math.round(price * 0.75);
  }

  if (!args[0] || args[0] !== 'veydrite') {
    return '  [SELL] Usage: sell veydrite <amount> or sell veydrite all';
  }
  if (playerState.veydrite <= 0) return '  [SELL] No veydrite in hold.';

  let amount;
  if (args[1] === 'all') {
    amount = playerState.veydrite;
  } else {
    amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) return '  [SELL] Specify an amount.';
    if (amount > playerState.veydrite) {
      return '  [SELL] You only have ' + playerState.veydrite + ' kg in hold.';
    }
  }

  const earned = amount * price;
  playerState.pendingTx = { type: 'sell', commodity: 'veydrite', amount, earned };

  // Guild rep bump for selling veydrite
  const repResult = adjustRep('guild', 2, 'Sold veydrite at Guild rate');

  return [
    '',
    '  [SELL] Confirm transaction?',
    '',
    '  Sell     : ' + amount + ' kg veydrite',
    '  Rate     : ' + price + ' CR/kg' + (guildRep !== null && repTier(guildRep) === 'TRUSTED' ? '  (TRUSTED bonus applied)' : ''),
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
    return [
      '',
      '  [BUY] Insufficient scrip.',
      '  Cost     : ' + cost + ' CR',
      '  You have : ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  playerState.pendingTx = { type: 'buy', commodity: 'fuel', amount, cost };

  return [
    '',
    '  [BUY] Confirm transaction?',
    '',
    '  Buy      : ' + amount + ' units fuel',
    '  Rate     : ' + price + ' CR/unit',
    '  You pay  : ' + cost + ' CR',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}

// ── Execute Trade ─────────────────────────────

function executeTrade(tx) {
  if (tx.type === 'sell' && tx.commodity === 'veydrite') {
    playerState.veydrite -= tx.amount;
    playerState.credits  += tx.earned;
    return [
      '',
      '  [SELL] Transaction complete.',
      '  Sold     : ' + tx.amount + ' kg veydrite',
      '  Earned   : ' + tx.earned + ' CR',
      '  Scrip    : ' + playerState.credits + ' CR',
      '  Veydrite : ' + playerState.veydrite + ' kg remaining',
      '',
    ].join('\n');
  }
  if (tx.type === 'buy' && tx.commodity === 'fuel') {
    playerState.credits -= tx.cost;
    playerState.fuel    += tx.amount;
    return [
      '',
      '  [BUY] Fuel transfer complete.',
      '  Purchased : ' + tx.amount + ' units',
      '  Cost      : ' + tx.cost + ' CR',
      '  Scrip     : ' + playerState.credits + ' CR remaining',
      '  Fuel      : ' + playerState.fuel + ' units',
      '',
    ].join('\n');
  }
  return '  [ERROR] Unknown transaction type.';
}

// ── Bulletin ──────────────────────────────────

function cmdBulletin() {
  if (!playerState.docked) {
    return '  [BULLETIN] You must be docked to access the contract board.';
  }

  const faction_info = FACTION_REGISTRY[playerState.dockedFactionKey];
  if (!faction_info || !faction_info.contracts) {
    return '  [BULLETIN] No contract board at this station.';
  }

  const rep = getRep(playerState.dockedFactionKey);
  if (rep !== null && repTier(rep) === 'WATCHED') {
    return [
      '',
      '  [BULLETIN] Access restricted.',
      '  Your standing with ' + faction_info.name + ' is too low.',
      '  Improve your reputation before contracts become available.',
      '',
    ].join('\n');
  }

  if (playerState.bulletinContracts.length === 0) {
    return '  [BULLETIN] No contracts available at this station.';
  }

  return renderBulletin(playerState.dockedFactionKey, playerState.bulletinContracts);
}

// ── Accept ────────────────────────────────────

function cmdAccept(args) {
  if (!playerState.docked) return '  [ACCEPT] You must be docked to accept contracts.';

  const index = parseInt(args[0]) - 1;
  if (isNaN(index)) return '  [ACCEPT] Usage: accept <number>';

  const result = acceptContract(index, playerState.bulletinContracts, playerState.currentDay);
  if (result.error) return '  [ACCEPT] ' + result.error;

  const c = result.contract;
  return [
    '',
    '  [ACCEPT] Contract accepted.',
    '',
    '  ' + c.title,
    '  ' + c.description,
    '',
    '  Payment    : ' + c.payment + ' CR',
    '  Rep reward : +' + c.repReward,
    '  Time limit : ' + c.timeLimitDays + ' days',
    '  Deadline   : Day ' + (playerState.currentDay + c.timeLimitDays),
    '',
    '  Good luck.',
    '',
  ].join('\n');
}

// ── Contract status ───────────────────────────

function cmdContract() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [CONTRACT] No active contract.';
  return renderActiveContract(active, playerState.currentDay);
}

// ── Complete ──────────────────────────────────

function cmdComplete() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [COMPLETE] No active contract to complete.';

  const sys = getCurrentSystem();
  if (!sys) return '  [ERROR] Location data corrupted.';

  if (sys.name !== active.target) {
    return [
      '',
      '  [COMPLETE] You are not at the target system.',
      '  Required: ' + active.target,
      '  Current : ' + sys.name,
      '',
    ].join('\n');
  }

  const daysElapsed = playerState.currentDay - active.issuedDay;
  const result      = completeContract(active, daysElapsed, playerState);

  const lines = [
    '',
    '  [COMPLETE] Contract fulfilled.',
    '',
    '  ' + active.title,
    '  Payment  : ' + result.total + ' CR' + (result.bonus > 0 ? '  (speed bonus: +' + result.bonus + ' CR)' : ''),
    '  Rep      : +' + result.repEarned + (result.fast ? '  (ahead of schedule)' : ''),
    '  Scrip    : ' + playerState.credits + ' CR',
    '',
  ];

  if (result.repResult) lines.push(renderRepChange(result.repResult));
  lines.push('');

  return lines.join('\n');
}

// ── Abandon ───────────────────────────────────

function cmdAbandon() {
  const active = activeContracts.find(c => !c.completed && !c.failed);
  if (!active) return '  [ABANDON] No active contract.';

  const result = failContract(active);
  const lines  = [
    '',
    '  [ABANDON] Contract abandoned.',
    '  ' + active.title,
    '  Reputation penalty applied.',
    '',
  ];
  if (result.repResult) lines.push(renderRepChange(result.repResult));
  lines.push('');
  return lines.join('\n');
}

// ── Rep ───────────────────────────────────────

function cmdRep() {
  const sys = getCurrentSystem();
  return renderRep(sys);
}

// ── Status ────────────────────────────────────

function cmdStatus() {
  const dockStatus = playerState.docked
    ? 'Docked at ' + playerState.dockedAt
    : 'In space';

  const hullBar = '█'.repeat(Math.round(playerState.hull / 10)) +
                  '░'.repeat(10 - Math.round(playerState.hull / 10));
  const fuelBar = '█'.repeat(Math.round(playerState.fuel / 10)) +
                  '░'.repeat(10 - Math.round(playerState.fuel / 10));

  const active = activeContracts.find(c => !c.completed && !c.failed);

  return [
    '',
    '  ── SHIP STATUS ───────────────────────────────────────────────',
    '',
    '  Captain   : ' + playerState.captainName,
    '  Vessel    : ' + playerState.shipName + '  (' + playerState.ship + ')',
    '  Status    : ' + dockStatus,
    '  Day       : ' + playerState.currentDay,
    '',
    '  Scrip     : ' + playerState.credits + ' CR',
    '  Veydrite  : ' + playerState.veydrite + ' kg',
    '  Fuel      : ' + playerState.fuel + ' units',
    '',
    '  Hull      : ' + hullBar + '  ' + playerState.hull + '%',
    '  Jump drive: NOMINAL',
    '',
    active
      ? '  CONTRACT  : ' + active.title + '  [Day ' + (active.issuedDay + active.timeLimitDays) + ' deadline]'
      : '  CONTRACT  : none active',
    '',
  ].join('\n');
}

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


  // Boost rate if hostile rep with dominant faction
  const stationFactions = sys.bodies
    .filter(b => b.hasStation && b.factionKey)
    .map(b => b.factionKey);

  stationFactions.forEach(fk => {
    const rep = getRep(fk);
    if (rep !== null && repTier(rep) === 'HOSTILE') {
      rate += 0.15;
    }
  });

  if (Math.random() > rate) return null;

  // Pick attacker type
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

// ── Encounter commands ────────────────────────

function handleEncounterCommand(cmd) {
  if (cmd === 'evade')     return cmdEvade();
  if (cmd === 'negotiate') return cmdNegotiate();
  if (cmd === 'fight')     return cmdFight();
  if (cmd === 'yield')     return cmdYield();
  if (cmd === 'status')    return cmdStatus();

  return [
    '',
    '  [ENCOUNTER] You are under threat. Resolve this first.',
    '',
    '  evade  |  negotiate  |  fight  |  yield',
    '',
  ].join('\n');
}

function cmdEvade() {
  if (!playerState.inEncounter) return '  [EVADE] No active encounter.';

  const enc     = playerState.encounter;
  const threat  = enc.attacker.threat;
  const fuelCost = 10 + Math.floor(Math.random() * 10);

  if (playerState.fuel < fuelCost) {
    // Not enough fuel — forced to fight or yield
    playerState.inEncounter = false;
    playerState.encounter   = null;
    return [
      '',
      '  [EVADE] Insufficient fuel to run.',
      '  Drive sputters. They close the distance.',
      '  You have no choice. Type "yield" or "fight".',
      '',
    ].join('\n');
  }

  // Evade chance — better with low threat, more fuel
  const evadeChance = Math.max(0.2, 0.8 - (threat * 0.1));
  const roll        = Math.random();

  playerState.fuel -= fuelCost;

  if (roll < evadeChance) {
    // Success
    playerState.inEncounter = false;
    playerState.encounter   = null;
    return [
      '',
      '  [EVADE] You push the drive hard and pull away.',
      '  Fuel burned: ' + fuelCost + ' units.  Remaining: ' + playerState.fuel + ' units.',
      '  They don\'t follow. Or they can\'t.',
      '',
    ].join('\n');
  } else {
    // Fail — hull damage from pursuit
    const damage = 5 + Math.floor(Math.random() * 10) * threat;
    playerState.hull = Math.max(0, playerState.hull - damage);

    if (playerState.hull <= 0) {
      return handleDeath('destroyed while attempting to evade ' + enc.attacker.name);
    }

    return [
      '',
      '  [EVADE] They stay with you. Weapons fire clips your hull.',
      '  Hull damage: -' + damage + '%  |  Hull: ' + playerState.hull + '%',
      '  Fuel burned: ' + fuelCost + ' units.  Remaining: ' + playerState.fuel + ' units.',
      '',
      '  They\'re still on you. Choose again:',
      '  evade  |  negotiate  |  fight  |  yield',
      '',
    ].join('\n');
  }
}

function cmdNegotiate() {
  if (!playerState.inEncounter) return '  [NEGOTIATE] No active encounter.';

  const enc    = playerState.encounter;
  const threat = enc.attacker.threat;
  const want   = enc.attacker.want;

  // Base chance
  let chance = Math.max(0.15, 0.65 - (threat * 0.08));

  // Modifiers
  if (want === 'scrip' && playerState.credits > 500)  chance += 0.15;
  if (want === 'cargo' && playerState.veydrite === 0)  chance += 0.20;
  if (want === 'unknown')                              chance  = 0.10;

  const roll = Math.random();

  if (roll < chance) {
    // Success — but may cost something
    playerState.inEncounter = false;
    playerState.encounter   = null;

    let cost = '';
    if (want === 'scrip' && playerState.credits > 0) {
      const bribe = Math.min(playerState.credits, Math.floor(50 + Math.random() * 150));
      playerState.credits -= bribe;
      cost = '\n  Bribe paid: ' + bribe + ' CR.  Scrip remaining: ' + playerState.credits + ' CR.';
    }

    return [
      '',
      '  [NEGOTIATE] They take what you offer and pull back.',
      cost,
      '  You watch them go. Close call.',
      '',
    ].join('\n');

  } else {
    // Fail — they attack
    const damage = 8 + Math.floor(Math.random() * 8) * threat;
    playerState.hull = Math.max(0, playerState.hull - damage);

    if (playerState.hull <= 0) {
      return handleDeath('destroyed after failed negotiation with ' + enc.attacker.name);
    }

    return [
      '',
      '  [NEGOTIATE] They don\'t want to talk.',
      '  Hull damage: -' + damage + '%  |  Hull: ' + playerState.hull + '%',
      '',
      '  evade  |  negotiate  |  fight  |  yield',
      '',
    ].join('\n');
  }
}

function cmdFight() {
  if (!playerState.inEncounter) return '  [FIGHT] No active encounter.';

  const enc    = playerState.encounter;
  const threat = enc.attacker.threat;

  // No weapons = very bad odds
  const fightChance = 0.15;
  const roll        = Math.random();

  if (roll < fightChance) {
    // Lucky win
    playerState.inEncounter = false;
    playerState.encounter   = null;
    const damage = 10 + Math.floor(Math.random() * 15);
    playerState.hull = Math.max(0, playerState.hull - damage);

    if (playerState.hull <= 0) {
      return handleDeath('destroyed in combat with ' + enc.attacker.name);
    }

    return [
      '',
      '  [FIGHT] You make yourself expensive enough that they break off.',
      '  Hull damage: -' + damage + '%  |  Hull: ' + playerState.hull + '%',
      '  You\'re not a fighter. But today you were enough of one.',
      '',
    ].join('\n');

  } else {
    // Heavy damage
    const damage = 20 + Math.floor(Math.random() * 20) * (threat / 2);
    playerState.hull = Math.max(0, playerState.hull - damage);

    if (playerState.hull <= 0) {
      return handleDeath('destroyed in combat with ' + enc.attacker.name);
    }

    return [
      '',
      '  [FIGHT] They hit you hard.',
      '  Hull damage: -' + damage + '%  |  Hull: ' + playerState.hull + '%',
      '',
      '  You\'re still here. Barely.',
      '  evade  |  negotiate  |  fight  |  yield',
      '',
    ].join('\n');
  }
}

function cmdYield() {
  if (!playerState.inEncounter) return '  [YIELD] No active encounter.';

  const enc  = playerState.encounter;
  const want = enc.attacker.want;

  playerState.inEncounter = false;
  playerState.encounter   = null;

  const lines = [
    '',
    '  [YIELD] You cut your drive and broadcast surrender.',
    '',
  ];

  if (want === 'cargo' || want === 'scrip') {
    if (playerState.veydrite > 0) {
      lines.push('  They take your veydrite. All ' + playerState.veydrite + ' kg.');
      playerState.veydrite = 0;
    }
    if (playerState.credits > 100) {
      const taken = Math.floor(playerState.credits * 0.4);
      playerState.credits -= taken;
      lines.push('  They take ' + taken + ' CR from your cargo account.');
    }
  } else if (want === 'expulsion') {
    lines.push('  They escort you to the jump point and watch you leave.');
    lines.push('  You are not welcome in this space.');
    const repResult = adjustRep(
      enc.attacker.short === 'PATROL' ? playerState.dockedFactionKey || 'colonial' : 'feral',
      -5, 'Expelled from controlled space'
    );
    if (repResult) lines.push('  ' + renderRepChange(repResult));
  } else {
    lines.push('  They take nothing. They just watch you.');
    lines.push('  The contact disappears from sensors.');
    lines.push('  You don\'t know what they wanted.');
  }

  lines.push('');
  lines.push('  You are clear. For now.');
  lines.push('');

  return lines.join('\n');
}

function handleDeath(cause) {
  // Record in graveyard
  recordDeath(playerState, cause);

  // Delete save
  deleteSave();

  // Signal main.js to show death screen
  playerState.isDead = true;
  playerState.deathCause = cause;

  return '__DEATH__';
}

// ── Traffic & Contact Engine ──────────────────

const SHIP_CLASSES = [
  { name: 'Bulk Freighter',      mass: 'mass-heavy',   named: 0.8 },
  { name: 'Light Freighter',     mass: 'mass-light',   named: 0.6 },
  { name: 'Prospector',          mass: 'mass-light',   named: 0.4 },
  { name: 'Fuel Tanker',         mass: 'mass-heavy',   named: 0.5 },
  { name: 'Patrol Vessel',       mass: 'mass-medium',  named: 0.9 },
  { name: 'Salvage Hauler',      mass: 'mass-medium',  named: 0.3 },
  { name: 'Survey Craft',        mass: 'mass-light',   named: 0.5 },
  { name: 'Transport',           mass: 'mass-medium',  named: 0.6 },
  { name: 'Armed Escort',        mass: 'mass-medium',  named: 0.7 },
  { name: 'Derelict',            mass: 'mass-unknown', named: 0.0 },
];

const REGISTRIES = [
  'Pelk registry', 'Guild registry', 'CCC registry',
  'colonial registry', 'free registry', 'unregistered',
  'unregistered', 'unregistered',
];

function generateContacts(sys, quadrantState) {
  const traffic    = sys.traffic || 0;
  const xenoTaint  = sys.xenoTainted || false;

  // Contact count based on traffic level
  const baseCount  = Math.floor(traffic * 1.5);
  const variance   = Math.floor(Math.random() * 3) - 1;
  let count        = Math.max(0, baseCount + variance);

  const contacts   = [];

  for (let i = 0; i < count; i++) {
    const shipClass  = SHIP_CLASSES[Math.floor(Math.random() * (SHIP_CLASSES.length - 1))]; // exclude derelict
    const dark       = Math.random() < 0.08 + (quadrantState === 'Collapsed' ? 0.12 : 0);
    const registry   = REGISTRIES[Math.floor(Math.random() * REGISTRIES.length)];
    const hasName    = !dark && Math.random() < shipClass.named;
    const shipName   = hasName ? generateContactName() : null;

    contacts.push({
      shipClass:  shipClass.name,
      mass:       shipClass.mass,
      dark:       dark,
      registry:   registry,
      shipName:   shipName,
      resolved:   false,
    });
  }

  // Xeno contact — always present in tainted systems, never resolves
  if (xenoTaint) {
    contacts.push({
      shipClass: null,
      mass:      'mass-unknown',
      dark:      true,
      registry:  null,
      shipName:  null,
      resolved:  false,
      xeno:      true,
    });
  }

  return contacts;
}

function generateContactName() {
  const prefixes = [
    'Iron','Silent','Pale','Last','Bitter',
    'Dark','Long','Cold','Hard','Lost',
    'Hollow','Slow','Far','Dead','Heavy',
    'Low','Distant','Outer','Final','First',
    'Deep','Grey','Black','Faded','Spent',
    'Lean','Bare','Worn','Dust','Salt',
    'Dry','Raw','Rough','True','Old',
    'Late','Early','Edge','Rim','Core',
    'Central','Broken','Fixed','Still','Quiet',
    'Soft','Narrow','Wide','Short','Blind',
    'Red','Blue','Dull','Stark','Mean',
    'Harsh','Tired','Empty','Lowline','Highline',
    'Midnight','Grave','Hinter','Border','Frontier',
    'Rust','Slag','Ash','Void','Null',
    'Greyline','Hardline','Longline','Coldline','Darkline',
    'Stone','Dusty','Farside','Nearside','Backside',
    'Starboard','Portside','Windward','Leeward','Upbound',
    'Downbound','Inbound','Outbound','Head','Tail',
    'Side','Cross','Line','Fixed','Steady'
  ];
  const suffixes = [
    'Run','Watch','Passage','Haul','Burn',
    'Mile','Shift','Road','Crossing','End',
    'Trade','March','Pull','Grind','Leg',
    'Lane','Line','Route','Track','Trail',
    'Way','Roadstead','Circuit','Loop','Stretch',
    'Span','Transit','Carry','Lift','Drag',
    'Tow','Train','Chain','Queue','Cycle',
    'Rotation','Stint','Tour','Duty','Posting',
    'Legwatch','Shiftwatch','Dogwatch','Midwatch','Stand',
    'Hold','Station','Slot','Window','Lane‑Slot',
    'Vector','Arc','Reach','Course','Drift',
    'Flow','Stream','Current','Trackline','Wayline',
    'Ridge','Edge','Rim','Border','Front',
    'Stage','Step','Phase','Segment','Section',
    'Tier','Band','Ring','Loopline','Spanline',
    'Jump','Hop','Step‑Run','Spur','Branch',
    'Feeder','Trunk','Spine','Chainline','Bridge',
    'Crosscut','Cut','Break','Fallback','Advance',
    'Push','Draw','Carryline','Transitline','Overrun'
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return prefix + ' ' + suffix;
}

// Store contacts for current system
let currentContacts = null;

function cmdPing() {
  if (!playerState.location) return '  [PING] No location fix.';

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  // Generate fresh contacts for this system
  currentContacts = generateContacts(sys, q.state);

  // Update auspex with gravimetric view
  updateAuspexTraffic(currentContacts, false);

  if (currentContacts.length === 0) {
    return [
      '',
      '  [PING] Gravimetric sweep complete.',
      '  No contacts in local space.',
      '',
    ].join('\n');
  }

  const lines = [
    '',
    '  [PING] Gravimetric sweep complete.',
    '  ' + currentContacts.length + ' contact(s) detected.',
    '',
  ];

  currentContacts.forEach((c, i) => {
    lines.push('  ◈ [' + (i + 1) + '] ' + c.mass);
  });

  lines.push('');
  lines.push('  Type "resolve" for active identification scan.');
  lines.push('');

  return lines.join('\n');
}

function cmdResolve() {
  if (!playerState.location) return '  [RESOLVE] No location fix.';
  if (!currentContacts || currentContacts.length === 0) {
    return [
      '',
      '  [RESOLVE] No contacts to resolve. Run "ping" first.',
      '',
    ].join('\n');
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q && q.clusters.find(c => c.name === loc.clusterName);
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);
  if (!sys) return '  [ERROR] Location data corrupted.';

  // Active scan — costs time based on contact count
  const scanDays = Math.max(0, Math.floor(currentContacts.length * 0.3));
  if (scanDays > 0) playerState.currentDay += scanDays;

  // Mark all non-xeno contacts as resolved
  currentContacts.forEach(c => {
    if (!c.xeno) c.resolved = true;
  });

  // Boost encounter chance — we just broadcast
  const encounterBoost = rollEncounter(sys, q, playerState, false);
  const broadcastTriggered = encounterBoost &&
    (q.state === 'Forbidden' || q.state === 'Collapsed') &&
    Math.random() < 0.15;

  // Update auspex with resolved view
  updateAuspexTraffic(currentContacts, true);

  const lines = [
    '',
    '  [RESOLVE] Active emission scan complete.',
    scanDays > 0 ? '  Scan duration: ' + scanDays + ' day(s).  Day: ' + playerState.currentDay : '',
    '',
  ];

  currentContacts.forEach((c, i) => {
    if (c.xeno) {
      lines.push('  ◈ [' + (i + 1) + '] [NO SIGNATURE] — running dark');
      lines.push('       does not resolve');
    } else if (c.dark) {
      lines.push('  ◈ [' + (i + 1) + '] [NO SIGNATURE] — running dark');
    } else {
      const nameStr = c.shipName ? '\n       "' + c.shipName + '"' : '';
      lines.push('  ◈ [' + (i + 1) + '] ' + c.shipClass + ' — ' + c.registry + nameStr);
    }
  });

  lines.push('');

  if (broadcastTriggered) {
    lines.push('  [!] Your active scan was detected.');
    lines.push('  Someone in this space knows you are here.');
    lines.push('');
  }

  return lines.join('\n');
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

  if (playerState.docked) {
    lines.push('  Docked at: ' + playerState.dockedAt);
    lines.push('');
  }

// Update auspex on where
  if (typeof updateAuspex === 'function') updateAuspex();
  
  return lines.join('\n');
}

// ── Helpers ───────────────────────────────────

function getCurrentSystem() {
  if (!playerState.location) return null;
  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
  return cluster && cluster.systems.find(s => s.name === loc.systemName);
}

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

  // Xeno-tainted systems get different notes
  if (sys.xenoTainted) {
    return xenoFlavor(sys, state);
  }

  if (state === 'Collapsed' && !hasStation) {
    return 'Nothing answers on any frequency. The bodies drift without comment.';
  }
  if (state === 'Forbidden') {
    return 'Your transponder has been logged. Someone knows you are here.';
  }
  if (state === 'Isolated' && !hasStation) {
    return 'No beacon. No registry ping. This system is not on the network.';
  }
  if (hasStation && hasVeyd) {
    return 'A working station and veydrite sign. Somebody already knows about this place.';
  }
  if (hasRuin && !hasStation) {
    return 'Whatever was here is gone. The ruins do not explain what happened.';
  }
  if (hasVeyd && !hasStation) {
    return 'Veydrite present and no extraction operation in sight. Either overlooked or avoided.';
  }
  if (state === 'Contested' && hasStation) {
    return 'The station is flying two flags. Neither crew looks comfortable.';
  }
  if (state === 'Declining') {
    return 'The infrastructure is tired. Everything here is running on borrowed time.';
  }
  return 'Nothing unusual on passive scan. The system holds its silence.';
}

function xenoFlavor(sys, state) {
  const hasRuin    = sys.bodies.some(b => b.hasRuin);
  const hasStation = sys.bodies.some(b => b.hasStation);

  // Pool of xeno-adjacent field notes
  // Rules: never name what it is. Never confirm anything.
  // Suggest through absence, wrongness, silence.
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

  // Pick deterministically based on system name length + hazard
  // so the same system always gets the same note
  const index = (sys.name.length + sys.hazard * 3 + (hasRuin ? 7 : 0)) % notes.length;
  return notes[index];
}
function cmdLogs() {
  if (playerState.logs.length === 0) {
    return [
      '',
      '  [LOGS] No records recovered yet.',
      '  Scan ruin sites with "scan log".',
      '  Beacons are logged automatically on arrival.',
      '',
    ].join('\n');
  }

  const lines = [
    '',
    '  ── RECOVERED RECORDS ─────────────────────────────────────────',
    '',
    '  ' + playerState.logs.length + ' record(s) on file.',
    '',
  ];

  playerState.logs.forEach((entry, i) => {
    const typeTag = entry.type === 'beacon' ? 'BEACON' : 'LOG FRAGMENT';
    lines.push('  [' + (i + 1) + '] ' + typeTag + ' — ' + entry.system);
    lines.push('  ' + entry.text);
    lines.push('');
  });

  return lines.join('\n');
}
function cmdSave() {
  const result = saveGame(playerState, reputation, {
    active:  activeContracts.find(c => !c.completed && !c.failed) || null,
    history: activeContracts.filter(c => c.completed || c.failed),
  });

  if (result.success) {
    const date = new Date(result.savedAt);
    return [
      '',
      '  [SAVE] Game saved.',
      '  ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
      '',
    ].join('\n');
  }
  return '  [SAVE] Save failed: ' + result.error;
}

function cmdNewSave() {
  return [
    '',
    '  [NEWSAVE] This will erase your current save and start over.',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}
function cmdMenu() {
  playerState.pendingMenu = true;
  return [
    '',
    '  [MENU] Return to main menu?',
    '  Your progress has been autosaved.',
    '',
    '  Type "yes" to confirm or anything else to cancel.',
    '',
  ].join('\n');
}
