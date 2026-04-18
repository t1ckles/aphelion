// ============================================
//  APHELION — Command Parser
//  commands.js
//  Stage 5: Economy wired in
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
  location:     null,
  cargo:        [],
  credits:      200,
  veydrite:     0,
  fuel:         60,
  hull:         80,
  ship:         'Wayward-class Prospector',
  shipName:     'The Unspoken',
  captainName:  'Unknown',
  docked:       false,
  dockedAt:     null,
  dockedFactionKey: null,
  inTrade:      false,
};

// ── Init ──────────────────────────────────────

function initCommands(seed) {
  galaxy = generateGalaxy(seed, Naming);

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

  // Trade mode intercepts commands
  if (playerState.inTrade) {
    return handleTradeCommand(cmd, args);
  }

  switch (cmd) {
    case 'help':    return cmdHelp();
    case 'galaxy':  return renderGalaxyOverview(galaxy);
    case 'scan':    return cmdScan(args);
    case 'nav':     return cmdNav(args);
    case 'where':
    case 'look':    return cmdWhere();
    case 'dock':    return cmdDock();
    case 'undock':  return cmdUndock();
    case 'trade':   return cmdTrade(args);
    case 'sell':    return cmdSell(args);
    case 'buy':     return cmdBuy(args);
    case 'salvage': return cmdSalvage();
    case 'status':  return cmdStatus();
    case '':        return '';
    default:        return '  [UNKNOWN] "' + cmd + '" is not a recognized command. Type help.';
  }
}

// ── Help ──────────────────────────────────────

function cmdHelp() {
  return [
    '',
    '  ── TERMINAL COMMANDS ─────────────────────────────────────────',
    '',
    '  galaxy              — full quadrant index',
    '  scan <1-8>          — survey a quadrant in detail',
    '  where               — current system survey',
    '  nav <system name>   — navigate to a named system',
    '  salvage             — salvage operation in current system',
    '  dock                — dock at nearest station',
    '  undock              — leave station',
    '  trade               — open trade terminal (when docked)',
    '  sell veydrite <n>   — sell veydrite (when docked)',
    '  buy fuel <n>        — buy fuel units (when docked)',
    '  status              — ship and cargo readout',
    '',
  ].join('\n');
}

// ── Scan ──────────────────────────────────────

function cmdScan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return renderGalaxyOverview(galaxy);
  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0 || index >= galaxy.quadrants.length) {
    return '  [ERROR] Invalid quadrant. Use scan <1-8>.';
  }
  return renderQuadrantDetail(galaxy, index);
}

// ── Nav ───────────────────────────────────────

function cmdNav(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] nav <system name>';
  if (playerState.docked) return '  [NAV] You are docked. Type "undock" first.';

  const query = args.join(' ').toLowerCase();

  for (let qi = 0; qi < galaxy.quadrants.length; qi++) {
    const q = galaxy.quadrants[qi];
    for (let ci = 0; ci < q.clusters.length; ci++) {
      const cluster = q.clusters[ci];
      for (const sys of cluster.systems) {
        if (sys.name.toLowerCase().includes(query)) {

          // Fuel cost
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

          playerState.fuel -= fuelCost;
          playerState.location = {
            quadrantIndex: qi,
            clusterName:   cluster.name,
            systemName:    sys.name,
          };
          playerState.docked       = false;
          playerState.dockedAt     = null;
          playerState.dockedFactionKey = null;

          const days = 2 + Math.floor(Math.random() * 6);
          return [
            '',
            '  [NAV] Plotting course to ' + sys.name + '...',
            '',
            '  Quadrant : ' + q.name,
            '  Cluster  : ' + cluster.name,
            '  Star     : ' + sys.starClass + '-class',
            '  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard),
            '  Fuel used: ' + fuelCost + ' units  |  Remaining: ' + playerState.fuel + ' units',
            '',
            '  Transit: ' + days + ' standard days. Arrived.',
            '  Type "where" to survey this system.',
            '',
          ].join('\n');
        }
      }
    }
  }
  return '  [NAV] No system matching "' + args.join(' ') + '" found in catalog.';
}

// ── Salvage ───────────────────────────────────

function cmdSalvage() {
  if (playerState.docked) {
    return '  [SALVAGE] Undock first before beginning salvage operations.';
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  const cluster = q.clusters.find(c => c.name === loc.clusterName);
  const sys     = cluster && cluster.systems.find(s => s.name === loc.systemName);

  if (!sys) return '  [ERROR] Location data corrupted.';

  const hasRuin  = sys.bodies.some(b => b.hasRuin);
  const hasVeyd  = sys.bodies.some(b => b.veydrite);
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

  const result = rollSalvage(sys, q.state);
  return renderSalvageResult(result, playerState);
}

// ── Dock ──────────────────────────────────────

function cmdDock() {
  if (playerState.docked) {
    return '  [DOCK] Already docked at ' + playerState.dockedAt + '.';
  }

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

  if (fee > 0 && playerState.credits < fee) {
    return [
      '',
      '  [DOCK] Docking fee: ' + fee + ' CR.',
      '  Insufficient scrip. You need ' + fee + ' CR to dock here.',
      '',
    ].join('\n');
  }

  if (fee > 0) playerState.credits -= fee;

  playerState.docked           = true;
  playerState.dockedAt         = body.stationName;
  playerState.dockedFactionKey = body.factionKey;

  const feeNote = fee > 0
    ? '  Docking fee: ' + fee + ' CR charged.  Remaining scrip: ' + playerState.credits + ' CR.'
    : '  No docking fee.';

  return [
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
    '  Type "trade" to open the trade terminal.',
    '  Type "undock" to return to space.',
    '',
  ].join('\n');
}

// ── Undock ────────────────────────────────────

function cmdUndock() {
  if (!playerState.docked) return '  [UNDOCK] You are not currently docked.';
  const name = playerState.dockedAt;
  playerState.docked           = false;
  playerState.dockedAt         = null;
  playerState.dockedFactionKey = null;
  playerState.inTrade          = false;
  return [
    '',
    '  [UNDOCK] Departing ' + name + '.',
    '  Thrusters nominal. Open space.',
    '',
  ].join('\n');
}

// ── Trade ─────────────────────────────────────

function cmdTrade(args) {
  if (!playerState.docked) {
    return '  [TRADE] You must be docked to access the trade terminal.';
  }
  if (args[0] === 'exit') {
    playerState.inTrade = false;
    return '  [TRADE] Terminal closed.';
  }

  const loc     = playerState.location;
  const q       = galaxy.quadrants[loc.quadrantIndex];
  playerState.inTrade = true;

  return buildTradeMenu(playerState, playerState.dockedFactionKey, q.state);
}

function handleTradeCommand(cmd, args) {
  const loc = playerState.location;
  const q   = galaxy.quadrants[loc.quadrantIndex];

  if (cmd === 'exit' || (cmd === 'trade' && args[0] === 'exit')) {
    playerState.inTrade = false;
    return '  [TRADE] Terminal closed.';
  }
  if (cmd === 'sell') return cmdSell(args);
  if (cmd === 'buy')  return cmdBuy(args);
  if (cmd === 'status') return cmdStatus();


  return [
    '  [TRADE] Unknown trade command.',
    '  Use: sell veydrite <amount>  |  buy fuel <amount>  |  exit',
  ].join('\n');
}

// ── Sell ──────────────────────────────────────

function cmdSell(args) {
  if (!playerState.docked) return '  [SELL] You must be docked to sell.';

  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  const price = veydritePrice(q.state);

  if (!args[0] || args[0] !== 'veydrite') {
    return '  [SELL] Usage: sell veydrite <amount> or sell veydrite all';
  }

  if (playerState.veydrite <= 0) {
    return '  [SELL] No veydrite in hold.';
  }

  let amount;
  if (args[1] === 'all') {
    amount = playerState.veydrite;
  } else {
    amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return '  [SELL] Specify an amount. Example: sell veydrite 10';
    }
    if (amount > playerState.veydrite) {
      return '  [SELL] You only have ' + playerState.veydrite + ' kg in hold.';
    }
  }

  const earned = amount * price;
  playerState.veydrite -= amount;
  playerState.credits  += earned;

  return [
    '',
    '  [SELL] Transaction complete.',
    '  Sold     : ' + amount + ' kg veydrite',
    '  Rate     : ' + price + ' CR/kg',
    '  Earned   : ' + earned + ' CR',
    '  Scrip    : ' + playerState.credits + ' CR',
    '  Veydrite : ' + playerState.veydrite + ' kg remaining',
    '',
  ].join('\n');
}

// ── Buy ───────────────────────────────────────

function cmdBuy(args) {
  if (!playerState.docked) return '  [BUY] You must be docked to buy.';

  const loc   = playerState.location;
  const q     = galaxy.quadrants[loc.quadrantIndex];
  const price = fuelPrice(q.state);

  if (!args[0] || args[0] !== 'fuel') {
    return '  [BUY] Usage: buy fuel <amount>';
  }

  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount <= 0) {
    return '  [BUY] Specify an amount. Example: buy fuel 20';
  }

  const cost = amount * price;
  if (playerState.credits < cost) {
    return [
      '',
      '  [BUY] Insufficient scrip.',
      '  Cost     : ' + cost + ' CR  (' + amount + ' units at ' + price + ' CR/unit)',
      '  You have : ' + playerState.credits + ' CR',
      '',
    ].join('\n');
  }

  playerState.credits -= cost;
  playerState.fuel    += amount;

  return [
    '',
    '  [BUY] Fuel transfer complete.',
    '  Purchased : ' + amount + ' units',
    '  Rate      : ' + price + ' CR/unit',
    '  Cost      : ' + cost + ' CR',
    '  Scrip     : ' + playerState.credits + ' CR remaining',
    '  Fuel      : ' + playerState.fuel + ' units',
    '',
  ].join('\n');
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

  return [
    '',
    '  ── SHIP STATUS ───────────────────────────────────────────────',
    '',
    '  Captain   : ' + playerState.captainName,
    '  Vessel    : ' + playerState.shipName + '  (' + playerState.ship + ')',
    '  Status    : ' + dockStatus,
    '',
    '  Scrip     : ' + playerState.credits + ' CR',
    '  Veydrite  : ' + playerState.veydrite + ' kg',
    '  Fuel      : ' + playerState.fuel + ' units',
    '',
    '  Hull      : ' + hullBar + '  ' + playerState.hull + '%',
    '  Jump drive: NOMINAL',
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
    '',
    '  ── LOCAL SURVEY ──────────────────────────────────────────────',
    '',
  ];

  if (stations.length > 0) {
    lines.push('  Stations : ' + stations.length + ' detected');
    stations.forEach(b => {
      const f = b.faction || FACTIONS.independent;
      lines.push('    — ' + b.stationName + '  [' + f.short + ']');
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
    lines.push('  Currently docked at: ' + playerState.dockedAt);
    lines.push('');
  }

  return lines.join('\n');
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
