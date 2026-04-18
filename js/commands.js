// ============================================
//  APHELION — Command Parser
//  commands.js
//  Stage 3: Stations, Factions, Docking
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

// ── Faction assignment by quadrant state ──────

function assignFaction(state, rng) {
  const pools = {
    Established: ['guild', 'pelk', 'colonial', 'pelk', 'guild'],
    Contested:   ['pelk', 'colonial', 'independent', 'feral', 'pelk'],
    Declining:   ['independent', 'pelk', 'feral', 'independent'],
    Collapsed:   ['feral', 'feral', 'independent', 'feral'],
    Isolated:    ['independent', 'independent', 'feral'],
    Forbidden:   ['forbidden', 'forbidden', 'unknown'],
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
  const pool = prefixes[factionKey] || prefixes.independent;
  const prefix = pool[Math.floor(Math.random() * pool.length)];
  // Use first word of system name for flavor
  const tag = systemName.split(' ')[0];
  return prefix + ' ' + tag;
}

// ── State ─────────────────────────────────────

let galaxy = null;
let playerState = {
  location:  null,
  cargo:     [],
  credits:   0,
  veydrite:  0,
  ship:      'Wayward-class Prospector',
  shipName:  'The Unspoken',
  docked:    false,
  dockedAt:  null,
};

// ── Init ──────────────────────────────────────

function initCommands(seed) {
  galaxy = generateGalaxy(seed, Naming);

  // Assign factions and station names to all systems
  galaxy.quadrants.forEach(q => {
    q.clusters.forEach(cluster => {
      cluster.systems.forEach(sys => {
        sys.bodies.forEach(body => {
          if (body.hasStation) {
            body.factionKey   = assignFaction(q.state);
            body.faction      = FACTIONS[body.factionKey] || FACTIONS.independent;
            body.stationName  = generateStationName(sys.name, body.factionKey);
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

  switch (cmd) {
    case 'help':   return cmdHelp();
    case 'galaxy': return renderGalaxyOverview(galaxy);
    case 'scan':   return cmdScan(args);
    case 'nav':    return cmdNav(args);
    case 'where':
    case 'look':   return cmdWhere();
    case 'dock':   return cmdDock();
    case 'undock': return cmdUndock();
    case 'status': return cmdStatus();
    case '':       return '';
    default:       return '  [UNKNOWN] "' + cmd + '" is not a recognized command. Type help.';
  }
}

// ── Commands ──────────────────────────────────

function cmdHelp() {
  return [
    '',
    '  ── TERMINAL COMMANDS ─────────────────────────────────────────',
    '',
    '  galaxy              — full quadrant index',
    '  scan <1-8>          — survey a quadrant in detail',
    '  where               — current system survey',
    '  nav <system name>   — navigate to a named system',
    '  dock                — dock at nearest station',
    '  undock              — undock and return to space',
    '  status              — ship and cargo readout',
    '',
    '  ── COMING SOON ───────────────────────────────────────────────',
    '',
    '  trade               — open trade interface',
    '  salvage             — begin salvage operation',
    '  jump                — jump to adjacent system',
    '',
  ].join('\n');
}

function cmdScan(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return renderGalaxyOverview(galaxy);

  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0 || index >= galaxy.quadrants.length) {
    return '  [ERROR] Invalid quadrant. Use scan <1-8>.';
  }
  return renderQuadrantDetail(galaxy, index);
}

function cmdNav(args) {
  if (!galaxy) return '  [ERROR] Galaxy not initialized.';
  if (args.length === 0) return '  [USAGE] nav <system name>';

  if (playerState.docked) {
    return '  [NAV] You are docked. Type "undock" first.';
  }

  const query = args.join(' ').toLowerCase();

  for (let qi = 0; qi < galaxy.quadrants.length; qi++) {
    const q = galaxy.quadrants[qi];
    for (let ci = 0; ci < q.clusters.length; ci++) {
      const cluster = q.clusters[ci];
      for (const sys of cluster.systems) {
        if (sys.name.toLowerCase().includes(query)) {
          playerState.location = {
            quadrantIndex: qi,
            clusterName:   cluster.name,
            systemName:    sys.name,
          };
          playerState.docked  = false;
          playerState.dockedAt = null;

          const days = 2 + Math.floor(Math.random() * 6);
          return [
            '',
            '  [NAV] Plotting course to ' + sys.name + '...',
            '',
            '  Quadrant : ' + q.name,
            '  Cluster  : ' + cluster.name,
            '  Star     : ' + sys.starClass + '-class',
            '  Bodies   : ' + sys.bodies.length,
            '  Hazard   : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard),
            '',
            '  Transit time: ' + days + ' standard days.',
            '  Drive nominal. Arrived.',
            '',
            '  Type "where" to survey this system.',
            '',
          ].join('\n');
        }
      }
    }
  }

  return '  [NAV] No system matching "' + args.join(' ') + '" found in catalog.';
}

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
      '  [DOCK] No station detected in ' + sys.name + '.',
      '  Nothing to dock with. The void offers no berth.',
      '',
    ].join('\n');
  }

  // Dock at first available station
  const body    = stationBodies[0];
  const faction = body.faction || FACTIONS.independent;

  playerState.docked   = true;
  playerState.dockedAt = body.stationName;

  return [
    '',
    '  [DOCK] Docking request acknowledged.',
    '',
    '  Station  : ' + body.stationName,
    '  Operator : ' + faction.name + '  [' + faction.short + ']',
    '  System   : ' + sys.name,
    '',
    '  ' + faction.dockGreeting,
    '',
    '  ── STATION SERVICES ──────────────────────────────────────────',
    '',
    stationServices(faction.attitude),
    '',
    '  Type "undock" to return to space.',
    '',
  ].join('\n');
}

function cmdUndock() {
  if (!playerState.docked) {
    return '  [UNDOCK] You are not currently docked.';
  }
  const name = playerState.dockedAt;
  playerState.docked   = false;
  playerState.dockedAt = null;
  return [
    '',
    '  [UNDOCK] Departing ' + name + '.',
    '  Thrusters nominal. You are in open space.',
    '',
  ].join('\n');
}

function cmdStatus() {
  const dockStatus = playerState.docked
    ? 'Docked at ' + playerState.dockedAt
    : 'In space';

  return [
    '',
    '  ── SHIP STATUS ───────────────────────────────────────────────',
    '',
    '  Vessel    : ' + playerState.shipName + '  (' + playerState.ship + ')',
    '  Status    : ' + dockStatus,
    '  Veydrite  : ' + playerState.veydrite + ' kg',
    '  Scrip     : ' + playerState.credits + ' CR  (unaffiliated)',
    '  Cargo     : ' + (playerState.cargo.length === 0 ? 'empty' : playerState.cargo.join(', ')),
    '',
    '  Hull integrity  : ████████░░  80%',
    '  Fuel reserve    : ██████░░░░  60%',
    '  Jump drive      : NOMINAL',
    '',
  ].join('\n');
}

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

// ── Station services by faction attitude ──────

function stationServices(attitude) {
  const services = {
    neutral:    '  Fuel exchange  |  Cargo hold  |  Assay terminal  |  Bulletin board',
    commercial: '  Fuel exchange  |  Cargo trading  |  Pelk contract board  |  Repair bay',
    military:   '  Fuel exchange  |  Restricted cargo only  |  CCC contract board',
    hostile:    '  Fuel (price negotiable)  |  No formal services  |  Watch your cargo',
    unknown:    '  Services unknown  |  Proceed with caution',
  };
  return services[attitude] || services.neutral;
}

// ── Flavor text ───────────────────────────────

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
