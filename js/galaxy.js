// js/galaxy.js
// Galaxy Hierarchy Generator — Stage 3
// Aphelion v0.3.0-dev
// 42 quadrants, connectivity graph, fold corridors, state propagation

const CIVILIZATION_STATES = [
  'Established', 'Contested', 'Declining',
  'Collapsed', 'Isolated', 'Forbidden',
];

const STAR_CLASSES = ['O','B','A','F','G','K','M'];
const STAR_CLASS_WEIGHT = [1, 3, 6, 12, 20, 25, 33];

const BODY_TYPES = [
  'Barren Rock', 'Desert World', 'Ice Giant', 'Gas Giant',
  'Ocean World', 'Irradiated Hulk', 'Dust Belt', 'Debris Field',
  'Rogue Moon', 'Shattered Planet'
];

// ── Weighted pick ─────────────────────────────

function weightedPick(rng, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ── System generation ─────────────────────────

function stationChance(state) {
  return { Established: 0.6, Contested: 0.4, Declining: 0.25,
           Collapsed: 0.05, Isolated: 0.15, Forbidden: 0.1 }[state] ?? 0.2;
}

function ruinChance(state) {
  return { Established: 0.05, Contested: 0.15, Declining: 0.3,
           Collapsed: 0.5, Isolated: 0.35, Forbidden: 0.4 }[state] ?? 0.2;
}

function veydriteChance(starClass) {
  return { O: 0.6, B: 0.5, A: 0.3, F: 0.2, G: 0.15, K: 0.12, M: 0.08 }[starClass] ?? 0.1;
}

function hazardLevel(state, rng) {
  const base = { Established: 1, Contested: 2, Declining: 3,
                 Collapsed: 4, Isolated: 3, Forbidden: 5 }[state] ?? 2;
  return Math.min(5, base + Math.floor((rng.next() - 0.5) * 2));
}

function trafficLevel(state, rng) {
  const base = { Established: 4, Contested: 3, Declining: 2,
                 Collapsed: 1, Isolated: 1, Forbidden: 0 }[state] ?? 2;
  return Math.min(5, Math.max(0, base + Math.floor((rng.next() - 0.5) * 2)));
}

function generateSystem(rng, quadrantState) {
  const starClass = weightedPick(rng, STAR_CLASSES, STAR_CLASS_WEIGHT);
  const bodyCount = 1 + Math.floor(rng.next() * 5);
  const bodies = [];
  for (let i = 0; i < bodyCount; i++) {
    bodies.push({
      type:       BODY_TYPES[Math.floor(rng.next() * BODY_TYPES.length)],
      hasStation: rng.next() < stationChance(quadrantState),
      hasRuin:    rng.next() < ruinChance(quadrantState),
      veydrite:   rng.next() < veydriteChance(starClass),
    });
  }
  const xenoChance = { Collapsed: 0.14, Forbidden: 0.12,
                       Isolated: 0.09, Declining: 0.07,
                       Contested: 0.05, Established: 0.02 }[quadrantState] ?? 0.06;
  const xenoTainted = rng.next() < xenoChance;
  const beaconChance = { Established: 0.04, Contested: 0.10, Declining: 0.18,
                         Collapsed: 0.25, Isolated: 0.15, Forbidden: 0.08 }[quadrantState] ?? 0.08;
  const hasBeacon = rng.next() < beaconChance;
  return {
    starClass, bodies,
    jumpPoints: 1 + Math.floor(rng.next() * 3),
    hazard:     hazardLevel(quadrantState, rng),
    traffic:    trafficLevel(quadrantState, rng),
    xenoTainted, hasBeacon,
  };
}

function generateCluster(rng, quadrantState, naming) {
  const systemCount = 2 + Math.floor(rng.next() * 4);
  const systems = [];
  for (let i = 0; i < systemCount; i++) {
    const sysName = naming.starSystem
      ? naming.starSystem(rng, 'ancient')
      : ('System-' + Math.floor(rng.next() * 9999));
    systems.push({ name: sysName, ...generateSystem(rng, quadrantState) });
  }
  const anchorIndex = systems.reduce((best, s, i) =>
    s.bodies.filter(b => b.hasStation).length >
    systems[best].bodies.filter(b => b.hasStation).length ? i : best, 0);
  systems[anchorIndex].isAnchor = true;
  return {
    name: naming.harshWorld ? naming.harshWorld(rng) : ('Cluster-' + Math.floor(rng.next() * 999)),
    systems,
    dominantFaction: null,
  };
}

function pickNotableFeature(rng, state) {
  const pool = {
    Established: ['Major trade hub', 'Guild assay station', 'Corp shipyard', 'Fuel depot network'],
    Contested:   ['Active conflict zone', 'Disputed relay station', 'Black market corridor', 'Mercenary staging area'],
    Declining:   ['Failing infrastructure grid', 'Abandoned colony chain', 'Debt-locked stations', 'Evacuation convoys'],
    Collapsed:   ['Mass ruin field', 'Derelict fleet graveyard', 'Feral settlement clusters', 'Xeno-adjacent silence'],
    Isolated:    ['Signal-dark region', 'Unknown cultural drift', 'Pre-contact colony', 'Self-sufficient enclave'],
    Forbidden:   ['Hard exclusion zone', 'Unknown enforcement presence', 'Sealed coordinates', 'Disappearance cluster'],
  };
  const features = pool[state] ?? pool['Declining'];
  return features[Math.floor(rng.next() * features.length)];
}

function computeControlScore(clusters) {
  const totalSystems     = clusters.reduce((n, c) => n + c.systems.length, 0);
  const stationedSystems = clusters.reduce((n, c) =>
    n + c.systems.filter(s => s.bodies.some(b => b.hasStation)).length, 0);
  return totalSystems > 0 ? stationedSystems / totalSystems : 0;
}

// ── State propagation ─────────────────────────

function propagateStates(quadrants, connections, rng) {
  const states    = quadrants.map(q => q.state);
  const newStates = [...states];
  connections.forEach(([a, b]) => {
    const sa = states[a];
    const sb = states[b];
    if (sa === 'Collapsed' && sb === 'Declining'  && rng.next() < 0.40) newStates[b] = 'Collapsed';
    if (sb === 'Collapsed' && sa === 'Declining'  && rng.next() < 0.40) newStates[a] = 'Collapsed';
    if (sa === 'Declining' && sb === 'Contested'  && rng.next() < 0.25) newStates[b] = 'Declining';
    if (sb === 'Declining' && sa === 'Contested'  && rng.next() < 0.25) newStates[a] = 'Declining';
  });
  quadrants.forEach((q, i) => { q.state = newStates[i]; });
}

// ── Quadrant generation ───────────────────────

function generateQuadrant(rng, name, naming) {
  const stateWeights = [15, 20, 25, 20, 12, 8];
  const state        = weightedPick(rng, CIVILIZATION_STATES, stateWeights);
  const clusterCount = 1 + Math.floor(rng.next() * 2);
  const clusters     = [];
  for (let i = 0; i < clusterCount; i++) {
    clusters.push(generateCluster(rng, state, naming));
  }
  return {
    name, state, clusters,
    notableFeature: pickNotableFeature(rng, state),
    factions:       [],
    controlScore:   computeControlScore(clusters),
  };
}

// ── Connectivity graph ────────────────────────

function generateConnectivity(quadrantCount, rng) {
  const connections = [];
  // Spanning tree — every quadrant gets at least one connection
  const connected   = [0];
  const unconnected = [];
  for (let i = 1; i < quadrantCount; i++) unconnected.push(i);
  while (unconnected.length > 0) {
    const from = connected[Math.floor(rng.next() * connected.length)];
    const toIdx = Math.floor(rng.next() * unconnected.length);
    const to    = unconnected[toIdx];
    connections.push([from, to, 'primary']);
    connected.push(to);
    unconnected.splice(toIdx, 1);
  }
  // Extra connections — ~40% additional
  const extraCount = Math.floor(quadrantCount * 0.4);
  for (let i = 0; i < extraCount; i++) {
    const a = Math.floor(rng.next() * quadrantCount);
    const b = Math.floor(rng.next() * quadrantCount);
    if (a === b) continue;
    const exists = connections.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (!exists) connections.push([a, b, 'secondary']);
  }
  // Highway corridors — 3-4 among primaries
  const primaries    = connections.filter(c => c[2] === 'primary');
  const highwayCount = 3 + Math.floor(rng.next() * 2);
  primaries.sort(() => rng.next() - 0.5);
  for (let i = 0; i < Math.min(highwayCount, primaries.length); i++) {
    primaries[i][2] = 'highway';
  }
  return connections;
}

// ── Player corridor knowledge ─────────────────

function initCorridorKnowledge(quadrantCount, connections, startQuadrant, rng) {
  const known = new Set();
  connections.forEach(([a, b], idx) => {
    if (a === startQuadrant || b === startQuadrant) {
      known.add(idx);
    } else if (rng.next() < 0.33) {
      known.add(idx);
    }
  });
  return Array.from(known);
}

// ── Galaxy entry point ────────────────────────

function generateGalaxy(seed, naming) {
  const rng           = new RNG(seed);
  const namePool      = NAMES.quadrant_names;
  const quadrantCount = 42;

  // Pick 42 unique quadrant names
  const usedNames = [];
  const nameRng   = new RNG(rng.next() * 999999 | 0);
  while (usedNames.length < quadrantCount) {
    const name = namePool[Math.floor(nameRng.next() * namePool.length)];
    if (!usedNames.includes(name)) usedNames.push(name);
  }

  // Generate quadrants
  const quadrants = usedNames.map(name =>
    generateQuadrant(new RNG(rng.next() * 999999 | 0), name, naming)
  );

  // Force starting quadrant to be survivable
  if (quadrants[0].state === 'Collapsed' || quadrants[0].state === 'Forbidden') {
    quadrants[0].state = 'Contested';
  }

  // Connectivity
  const connRng    = new RNG(rng.next() * 999999 | 0);
  const connections = generateConnectivity(quadrantCount, connRng);

  // State propagation
  const propRng = new RNG(rng.next() * 999999 | 0);
  propagateStates(quadrants, connections, propRng);

  // Player knowledge — starts in quadrant 0
  const knownRng      = new RNG(rng.next() * 999999 | 0);
  const knownCorridors = initCorridorKnowledge(quadrantCount, connections, 0, knownRng);

  // Meta
  const totalSystems = quadrants.reduce((n, q) =>
    n + q.clusters.reduce((m, c) => m + c.systems.length, 0), 0);
  const totalStations = quadrants.reduce((n, q) =>
    n + q.clusters.reduce((m, c) =>
      m + c.systems.reduce((k, s) =>
        k + s.bodies.filter(b => b.hasStation).length, 0), 0), 0);
  const totalRuins = quadrants.reduce((n, q) =>
    n + q.clusters.reduce((m, c) =>
      m + c.systems.reduce((k, s) =>
        k + s.bodies.filter(b => b.hasRuin).length, 0), 0), 0);

  return {
    seed, quadrants, connections, knownCorridors,
    meta: { totalSystems, totalStations, totalRuins, quadrantCount },
  };
}

// ── Corridor helpers ──────────────────────────

function getConnectedQuadrants(galaxy, quadrantIndex) {
  return galaxy.connections
    .map((conn, idx) => ({ conn, idx }))
    .filter(({ conn }) => conn[0] === quadrantIndex || conn[1] === quadrantIndex)
    .map(({ conn, idx }) => ({
      index:   conn[0] === quadrantIndex ? conn[1] : conn[0],
      type:    conn[2],
      known:   galaxy.knownCorridors.includes(idx),
      connIdx: idx,
    }));
}

function isConnected(galaxy, fromIndex, toIndex) {
  return galaxy.connections.some(([a, b]) =>
    (a === fromIndex && b === toIndex) || (a === toIndex && b === fromIndex)
  );
}

function getCorridorType(galaxy, fromIndex, toIndex) {
  const conn = galaxy.connections.find(([a, b]) =>
    (a === fromIndex && b === toIndex) || (a === toIndex && b === fromIndex)
  );
  return conn ? conn[2] : null;
}

function revealCorridor(galaxy, fromIndex, toIndex) {
  galaxy.connections.forEach(([a, b], idx) => {
    if ((a === fromIndex && b === toIndex) || (a === toIndex && b === fromIndex)) {
      if (!galaxy.knownCorridors.includes(idx)) {
        galaxy.knownCorridors.push(idx);
      }
    }
  });
}

function revealAllCorridorsFrom(galaxy, quadrantIndex) {
  galaxy.connections.forEach(([a, b], idx) => {
    if (a === quadrantIndex || b === quadrantIndex) {
      if (!galaxy.knownCorridors.includes(idx)) {
        galaxy.knownCorridors.push(idx);
      }
    }
  });
}

function foldCellCost(corridorType) {
  return { highway: 2, primary: 3, secondary: 4 }[corridorType] || 3;
}

// ── Galaxy overview ───────────────────────────

function renderGalaxyOverview(galaxy, playerQuadrantIndex) {
  const lines    = [];
  const idx      = playerQuadrantIndex ?? 0;

  // Build known quadrant set
  const knownSet = new Set([idx]);
  galaxy.knownCorridors.forEach(cidx => {
    knownSet.add(galaxy.connections[cidx][0]);
    knownSet.add(galaxy.connections[cidx][1]);
  });

  const bar = (n, max) => '█'.repeat(Math.round(n)) + '░'.repeat(max - Math.round(n));

  lines.push('');
  lines.push('  ── GUILD NETWORK — KNOWN SPACE ────────────────────────────');
  lines.push('');
  lines.push(
    '  Seed: ' + galaxy.seed +
    '  |  Known: ' + knownSet.size + ' / ' + galaxy.meta.quadrantCount + ' quadrants' +
    '  |  Systems on record: ' + galaxy.meta.totalSystems
  );
  lines.push('');
  lines.push('  ── KNOWN QUADRANTS ─────────────────────────────────────────');
  lines.push('');

  Array.from(knownSet).sort((a, b) => a - b).forEach(qi => {
    const q        = galaxy.quadrants[qi];
    const isCur    = qi === idx;
    const marker   = isCur ? '►' : ' ';
    const totalSys = q.clusters.reduce((n, c) => n + c.systems.length, 0);
    const ctrlBar  = bar(q.controlScore * 10, 10);
    const stateTag = q.state.toUpperCase().padEnd(12);
    lines.push('  ' + marker + ' [' + String(qi + 1).padStart(2) + '] ' + q.name.padEnd(32) + ' ' + stateTag + '  ' + ctrlBar);
    lines.push('        ' + q.notableFeature.padEnd(40) + totalSys + ' systems');
    lines.push('');
  });

  const unknownCount = galaxy.meta.quadrantCount - knownSet.size;
  if (unknownCount > 0) {
    lines.push('  ... ' + unknownCount + ' quadrant(s) lie beyond known corridors.');
    lines.push('');
  }

  lines.push('  ── COMMANDS ────────────────────────────────────────────────');
  lines.push('');
  lines.push('  scan <1-42>              — survey a quadrant');
  lines.push('  map                      — fold corridor map');
  lines.push('  fold <quadrant name>     — fold to connected quadrant');
  lines.push('  nav <system name>        — navigate within quadrant');
  lines.push('');
  return lines.join('\n');
}

// ── Fold corridor map ─────────────────────────

function renderFoldMap(galaxy, playerQuadrantIndex) {
  const lines   = [];
  const current = galaxy.quadrants[playerQuadrantIndex];

  lines.push('');
  lines.push('  ── FOLD CORRIDOR MAP ─────────────────────────────────────');
  lines.push('');
  lines.push('  ═══ highway [2 cells]   ─── primary [3 cells]   ··· secondary [4 cells]');
  lines.push('');
  lines.push('  Current: [' + String(playerQuadrantIndex + 1).padStart(2) + '] ' + current.name.toUpperCase());
  lines.push('  State  : ' + current.state);
  lines.push('');
  lines.push('  ── CORRIDORS FROM HERE ───────────────────────────────────');
  lines.push('');

  const connected = getConnectedQuadrants(galaxy, playerQuadrantIndex);
  if (connected.length === 0) {
    lines.push('  No corridors detected.');
  } else {
    connected.forEach(({ index, type, known }) => {
      if (!known) {
        const sig = NAMES.fold_signatures[index % NAMES.fold_signatures.length];
        lines.push('  ···  [??] ' + sig);
        return;
      }
      const dest = galaxy.quadrants[index];
      const sym  = type === 'highway' ? '═══' : type === 'primary' ? '───' : '···';
      const cost = type === 'highway' ? '[2 cells — highway]' : type === 'primary' ? '[3 cells]' : '[4 cells]';
      lines.push('  ' + sym + '  [' + String(index + 1).padStart(2) + '] ' +
        dest.name.padEnd(30) + dest.state.padEnd(14) + cost);
    });
  }

  lines.push('');
  lines.push('  ── ALL KNOWN QUADRANTS ───────────────────────────────────');
  lines.push('');

  const knownSet = new Set([playerQuadrantIndex]);
  galaxy.knownCorridors.forEach(idx => {
    const [a, b] = galaxy.connections[idx];
    knownSet.add(a);
    knownSet.add(b);
  });

  Array.from(knownSet).sort((a, b) => a - b).forEach(qi => {
    const q        = galaxy.quadrants[qi];
    const isCur    = qi === playerQuadrantIndex;
    const marker   = isCur ? '► ' : '  ';
    const totalSys = q.clusters.reduce((n, c) => n + c.systems.length, 0);
    lines.push(marker + '[' + String(qi + 1).padStart(2) + '] ' +
      q.name.padEnd(32) + q.state.padEnd(14) + totalSys + ' systems');
  });

  const unknownCount = galaxy.quadrants.length - knownSet.size;
  if (unknownCount > 0) {
    lines.push('');
    lines.push('  ... ' + unknownCount + ' quadrant(s) lie beyond known corridors.');
  }

  lines.push('');
  lines.push('  fold <quadrant name>   — fold to a connected quadrant');
  lines.push('  blindfold <quadrant>   — overdrive fold, any quadrant (12 cells, dangerous)');
  lines.push('');
  return lines.join('\n');
}

// ── Quadrant detail ───────────────────────────

function renderQuadrantDetail(galaxy, index, scannedSystems) {
  const q = galaxy.quadrants[index];
  if (!q) return '  [ERROR] Invalid quadrant index.';
  const known = scannedSystems || {};
  const lines = [];
  lines.push('');
  lines.push('  ── QUADRANT ' + (index + 1) + ': ' + q.name.toUpperCase() + ' ──────────────────────────────');
  lines.push('  Status: ' + q.state + '  |  ' + q.notableFeature);
  lines.push('');
  q.clusters.forEach(function(cluster) {
    lines.push('  ▸ ' + cluster.name + '  [' + cluster.systems.length + ' systems]');
    cluster.systems.forEach(function(sys) {
      const beacon  = sys.hasBeacon ? ' [BCN]' : '';
      const charted = known[sys.name] ? ' ◆' : '';
      lines.push('    ' + sys.name.padEnd(24) + ' ' + sys.starClass + '-class' + beacon + charted);
    });
    lines.push('');
  });
  return lines.join('\n');
}
