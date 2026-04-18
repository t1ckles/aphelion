// ============================================
//  APHELION — Command Parser
//  commands.js
//  Stage 3: Local System Interaction
// ============================================

// ── State ────────────────────────────────────

let galaxy = null;
let playerState = {
  location: null,
  cargo: [],
  credits: 0,
  veydrite: 0,
  ship: 'Wayward-class Prospector',
  shipName: 'The Unspoken',
};

// ── Init ─────────────────────────────────────

function initCommands(seed) {
  galaxy = generateGalaxy(seed, Naming);

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
  const input     = raw.trim().toLowerCase();
  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd) {
    case 'help':   return cmdHelp();
    case 'galaxy': return renderGalaxyOverview(galaxy);
    case 'scan':   return cmdScan(args);
    case 'nav':    return cmdNav(args);
    case 'where':
    case 'look':   return cmdWhere();
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
    '  status              — ship and cargo readout',
    '',
    '  ── COMING SOON ───────────────────────────────────────────────',
    '',
    '  dock                — dock at nearest station',
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
  const anchor   = sys.isAnchor ? '  ◆ ANCHOR SYSTEM' : '';

  const lines = [
    '',
    '  ╔══ CURRENT POSITION ' + '═'.repeat(37) + '╗',
    '',
    '  System   : ' + sys.name + anchor,
    '  Cluster  : ' + cluster.name,
    '  Quadrant : ' + q.name + '  [' + q.state + ']',
    '  Star     : ' + sys.starClass + '-class  |  Bodies: ' + sys.bodies.length,
    '',
    '  ── LOCAL SURVEY ──────────────────────────────────────────────',
    '',
  ];

  // Stations
  if (stations.length > 0) {
    lines.push('  Stations detected: ' + stations.length);
    lines.push('  ' + stationDescription(q.state));
  } else {
    lines.push('  Stations: none detected');
  }

  lines.push('');

  // Ruins
  if (ruins.length > 0) {
    lines.push('  Ruin sites: ' + ruins.length + ' surveyed');
    lines.push('  ' + ruinDescription(q.state));
  } else {
    lines.push('  Ruin sites: none on record');
  }

  lines.push('');

  // Veydrite
  if (veydrite.length > 0) {
    lines.push('  Veydrite signature: POSITIVE — ' + veydrite.length + ' body/bodies');
    lines.push('  Assayer rating: ' + veydriteRating(sys.starClass));
  } else {
    lines.push('  Veydrite signature: negative');
  }

  lines.push('');
  lines.push('  Jump points : ' + sys.jumpPoints + ' outbound');
  lines.push('  Hazard      : ' + '▲'.repeat(sys.hazard) + '△'.repeat(5 - sys.hazard) + '  (' + sys.hazard + '/5)');
  lines.push('  Traffic     : ' + '◉'.repeat(sys.traffic) + '○'.repeat(5 - sys.traffic) + '  (' + sys.traffic + '/5)');
  lines.push('');

  // Flavor description
  lines.push('  ── FIELD NOTES ───────────────────────────────────────────────');
  lines.push('');
  lines.push('  ' + systemFlavor(sys, q.state));
  lines.push('');

  return lines.join('\n');
}

function cmdStatus() {
  return [
    '',
    '  ── SHIP STATUS ───────────────────────────────────────────────',
    '',
    '  Vessel    : ' + playerState.shipName + '  (' + playerState.ship + ')',
    '  Veydrite  : ' + playerState.veydrite + ' kg',
    '  Scrip     : ' + playerState.credits + ' CR  (unaffiliated)',
    '  Cargo     : ' + (playerState.cargo.length === 0 ? 'empty' : playerState.cargo.join(', ')),
    '',
    '  Hull integrity  : ████████░░  80%',
    '  Fuel reserve    : ██████░░░░  60%',
    '  Jump drive      : NOMINAL',
    '',
    '  [Stage 4 will activate full ship systems]',
    '',
  ].join('\n');
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
