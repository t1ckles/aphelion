// js/galaxy.js
// Galaxy Hierarchy Generator — Stage 2
// Aphelion v0.2.0-dev

// ─── Constants ───────────────────────────────────────────────────────────────

const QUADRANT_NAMES = [
  'Solace Reach',    'The Ashward',    'Crucible Expanse',  'Void Margin',
  'Kethara Basin',   'The Pale Fringe', 'Sunken Arc',        'Drift Terminus'
];

const CIVILIZATION_STATES = [
  'Established',   // Stable corp presence, functioning markets
  'Contested',     // Multiple factions competing
  'Declining',     // Infrastructure failing, population leaving
  'Collapsed',     // No functioning government, salvage economy
  'Isolated',      // Cut off — may have developed independently
  'Forbidden',     // Someone doesn't want you here
];

const STAR_CLASSES = ['O','B','A','F','G','K','M'];
const STAR_CLASS_WEIGHT = [1, 3, 6, 12, 20, 25, 33]; // M-class most common

const BODY_TYPES = [
  'Barren Rock', 'Desert World', 'Ice Giant', 'Gas Giant',
  'Ocean World', 'Irradiated Hulk', 'Dust Belt', 'Debris Field',
  'Rogue Moon', 'Shattered Planet'
];

// ─── Weighted Random ──────────────────────────────────────────────────────────

function weightedPick(rng, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Star System Generator ────────────────────────────────────────────────────

function generateSystem(rng, quadrantState) {
  const starClass = weightedPick(rng, STAR_CLASSES, STAR_CLASS_WEIGHT);
  const bodyCount = 1 + Math.floor(rng.next() * 7); // 1–7 bodies
  const bodies = [];

  for (let i = 0; i < bodyCount; i++) {
    bodies.push({
      type: BODY_TYPES[Math.floor(rng.next() * BODY_TYPES.length)],
      hasStation: rng.next() < stationChance(quadrantState),
      hasRuin: rng.next() < ruinChance(quadrantState),
      veydrite: rng.next() < veydriteChance(starClass),
    });
  }

  return {
    starClass,
    bodies,
    jumpPoints: 1 + Math.floor(rng.next() * 3), // outbound jump connections
    hazard: hazardLevel(quadrantState, rng),
    traffic: trafficLevel(quadrantState, rng),
  };
}

function stationChance(state) {
  return { Established: 0.6, Contested: 0.4, Declining: 0.25,
           Collapsed: 0.05, Isolated: 0.15, Forbidden: 0.1 }[state] ?? 0.2;
}

function ruinChance(state) {
  return { Established: 0.05, Contested: 0.15, Declining: 0.3,
           Collapsed: 0.5, Isolated: 0.35, Forbidden: 0.4 }[state] ?? 0.2;
}

function veydriteChance(starClass) {
  // O and B stars have higher veydrite deposits (stellar remnant theory)
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

// ─── Cluster Generator ────────────────────────────────────────────────────────

function generateCluster(rng, quadrantState, naming) {
  const systemCount = 2 + Math.floor(rng.next() * 6); // 2–7 systems
  const systems = [];

  for (let i = 0; i < systemCount; i++) {
    const sysName = naming.generateSystemName(rng);
    systems.push({ name: sysName, ...generateSystem(rng, quadrantState) });
  }

  // One system is the "anchor" — most likely to have infrastructure
  const anchorIndex = systems.reduce((best, s, i) =>
    s.bodies.filter(b => b.hasStation).length >
    systems[best].bodies.filter(b => b.hasStation).length ? i : best, 0);

  systems[anchorIndex].isAnchor = true;

  return {
    name: naming.generateClusterName(rng),
    systems,
    dominantFaction: null, // assigned later by faction pass
  };
}

// ─── Quadrant Generator ───────────────────────────────────────────────────────

function generateQuadrant(rng, name, naming) {
  // Each quadrant's civ state is seeded — same seed = same galaxy always
  const stateIndex = Math.floor(rng.next() * CIVILIZATION_STATES.length);
  const state = CIVILIZATION_STATES[stateIndex];
  const clusterCount = 2 + Math.floor(rng.next() * 4); // 2–5 clusters
  const clusters = [];

  for (let i = 0; i < clusterCount; i++) {
    clusters.push(generateCluster(rng, state, naming));
  }

  // Quadrant-level traits
  const notableFeature = pickNotableFeature(rng, state);

  return {
    name,
    state,
    clusters,
    notableFeature,
    factions: [], // assigned in faction pass
    controlScore: computeControlScore(clusters),
  };
}

function pickNotableFeature(rng, state) {
  const pool = {
    Established:  ['Major trade hub', 'Guild assay station', 'Corp shipyard', 'Fuel depot network'],
    Contested:    ['Active conflict zone', 'Disputed relay station', 'Black market corridor', 'Mercenary staging area'],
    Declining:    ['Failing infrastructure grid', 'Abandoned colony chain', 'Debt-locked stations', 'Evacuation convoys'],
    Collapsed:    ['Mass ruin field', 'Derelict fleet graveyard', 'Feral settlement clusters', 'Xeno-adjacent silence'],
    Isolated:     ['Signal-dark region', 'Unknown cultural drift', 'Pre-contact colony', 'Self-sufficient enclave'],
    Forbidden:    ['Hard exclusion zone', 'Unknown enforcement presence', 'Sealed coordinates', 'Disappearance cluster'],
  };
  const features = pool[state] ?? pool['Declining'];
  return features[Math.floor(rng.next() * features.length)];
}

function computeControlScore(clusters) {
  // 0.0–1.0: how "controlled" this quadrant is
  const totalSystems = clusters.reduce((n, c) => n + c.systems.length, 0);
  const stationedSystems = clusters.reduce((n, c) =>
    n + c.systems.filter(s => s.bodies.some(b => b.hasStation)).length, 0);
  return totalSystems > 0 ? stationedSystems / totalSystems : 0;
}

// ─── Galaxy Generator ─────────────────────────────────────────────────────────

function generateGalaxy(seed, naming) {
  const rng = new RNG(seed);

  const quadrants = QUADRANT_NAMES.map(name =>
    generateQuadrant(new RNG(rng.nextInt()), name, naming)
  );

  // Count totals for summary
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
    seed,
    quadrants,
    meta: { totalSystems, totalStations, totalRuins }
  };
}

// ─── Terminal Rendering ───────────────────────────────────────────────────────

function renderGalaxyOverview(galaxy) {
  const lines = [];
  const bar = (n, max, char = '█', empty = '░') =>
    char.repeat(Math.round(n)) + empty.repeat(max - Math.round(n));

  lines.push('');
  lines.push('  ╔══════════════════════════════════════════════════════════╗');
  lines.push('  ║          DEEP SURVEY — GALAXY MANIFEST v0.2              ║');
  lines.push('  ╚══════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  Seed: ${galaxy.seed}  |  Systems: ${galaxy.meta.totalSystems}  |  Stations: ${galaxy.meta.totalStations}  |  Ruin Sites: ${galaxy.meta.totalRuins}`);
  lines.p
