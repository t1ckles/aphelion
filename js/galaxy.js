// js/galaxy.js
// Galaxy Hierarchy Generator — Stage 2
// Aphelion v0.2.0-dev

// ── Quadrant names ───────────────────────
quadrant_names: [
    // Guild cartographic designations
    'Solace Reach',       'The Ashward',          'Crucible Expanse',     'Void Margin',
    'Keth Basin',         'The Pale Fringe',       'Sunken Arc',           'Drift Terminus',
    'The Ironveil',       'Cinder Margin',         'Null Approach',        'The Bleakward',
    'Ossian Deep',        'Vael Corridor',         'The Shattered Fringe', 'Dross Expanse',
    'Thal Remnant',       'The Gyre Passage',      'Erebus Reach',         'Solen Threshold',
    'Narr Corridor',      'Caern Margin',          'The Ulvar Fringe',     'Sheth Expanse',
    'Morval Basin',       'Pelian Reach',          'The Ardis Veil',       'Brenn Threshold',
    'Calyx Approach',     'The Davan Margin',      'Elvar Passage',        'Fhoss Deep',
    'The Greth Corridor', 'Havan Reach',           'Ireth Fringe',         'Jorvak Basin',
    'The Kaeln Expanse',  'Lorit Margin',          'Mavan Passage',        'Nessik Threshold',
    'The Orvak Veil',     'Preth Approach',        'Queln Corridor',       'Ravet Reach',
    'The Sovak Deep',     'Taliss Fringe',         'Uvet Margin',          'Vandis Expanse',
    'The Wethis Basin',   'Xaeln Passage',         'The Yovak Threshold',  'Zethis Veil',
    'The Akseth Approach','Balet Corridor',        'Cresit Reach',         'The Delvak Fringe',
  // Corporate administrative designations
    'Pelk Administrative Sector', 'Korveth Margin',          'The Reclamation Corridor',
    'Free Zone Epsilon',          'CCC Exclusion Sector',    'The Contested Passage',
    'Guild Survey District',      'Pelk Transit Zone',       'The Korvak Concession',
    'Colonial Mandate Seven',     'The Free Corridor',       'Voss Extraction Zone',
    'Hessen Administrative Reach','The Drade Concession',    'Pelk Outer Zone',
    'CCC Forward Sector',         'The Marek Margin',        'Guild Annex Fourteen',
    'The Brennan Corridor',       'Colonial Exclusion Zone', 'Voss Administrative Deep',
    'The Alcott Passage',         'Pelk Reclamation Sector', 'The Garrick Margin',
    'CCC Abandoned Sector',       'Free Zone Theta',         'The Contested Deep',
    'Guild Forward Survey',       'The Korveth Concession',  'Colonial Remnant Zone',
  ],

  // ── Fold corridor flavor ─────────────────
  fold_signatures: [
    'Fold signature detected — no astrographic data on file.',
    'Corridor signature present — destination uncharted.',
    'Veydric resonance detected — no Guild record found.',
    'Fold geometry signature acquired — destination unknown.',
    'Corridor present — no data. Proceed at risk.',
    'Resonance echo detected — uncharted space beyond.',
    'Fold signature on record — destination not in Guild network.',
    'Veydric trace detected — no astrographic survey on file.',
  ],

    // ── Fold sequence flavor lines ───────────
  fold_sequence: [
    'Spacetime compression: initializing',
    'Veydric resonance frequency: locking',
    'Fold tensor alignment: in progress',
    'Spacetime compression: nominal',
    'Corridor geometry: calculating',
    'Fold geometry: resolving',
    'Corridor signature: acquiring',
    'Tensor alignment: holding',
    'Veydric resonance: building',
    'Fold geometry: resolving',
    'Spacetime compression: critical',
    'Resonance lock: confirming',
    'Fold geometry: locked',
    'Drive housing: sealed',
    'Resonance chamber: pressurizing',
    'Fold cell: combusting',
    'Veydric matrix: expanding',
    'Corridor mouth: opening',
    'Spacetime membrane: thinning',
    'Transit window: opening',
  ],
};
  
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

function weightedPick(rng, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
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
  const bodyCount = 1 + Math.floor(rng.next() * 7);
  const bodies = [];
  for (let i = 0; i < bodyCount; i++) {
    bodies.push({
      type: BODY_TYPES[Math.floor(rng.next() * BODY_TYPES.length)],
      hasStation: rng.next() < stationChance(quadrantState),
      hasRuin: rng.next() < ruinChance(quadrantState),
      veydrite: rng.next() < veydriteChance(starClass),
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
    starClass,
    bodies,
    jumpPoints: 1 + Math.floor(rng.next() * 3),
    hazard: hazardLevel(quadrantState, rng),
    traffic: trafficLevel(quadrantState, rng),
    xenoTainted,
    hasBeacon,
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
    name: naming.harshWorld
      ? naming.harshWorld(rng)
      : ('Cluster-' + Math.floor(rng.next() * 999)),
    systems,
    dominantFaction: null,
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
  const totalSystems = clusters.reduce((n, c) => n + c.systems.length, 0);
  const stationedSystems = clusters.reduce((n, c) =>
    n + c.systems.filter(s => s.bodies.some(b => b.hasStation)).length, 0);
  return totalSystems > 0 ? stationedSystems / totalSystems : 0;
}

function generateQuadrant(rng, name, naming) {
  const stateIndex = Math.floor(rng.next() * CIVILIZATION_STATES.length);
  const state = CIVILIZATION_STATES[stateIndex];
  const clusterCount = 1 + Math.floor(rng.next() * 2);
  const clusters = [];
  for (let i = 0; i < clusterCount; i++) {
    clusters.push(generateCluster(rng, state, naming));
  }
  return {
    name,
    state,
    clusters,
    notableFeature: pickNotableFeature(rng, state),
    factions: [],
    controlScore: computeControlScore(clusters),
  };
}

function generateGalaxy(seed, naming) {
  const rng = new RNG(seed);
  const quadrants = QUADRANT_NAMES.map(name =>
    generateQuadrant(new RNG(rng.next() * 999999 | 0), name, naming)
  );
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
  return { seed, quadrants, meta: { totalSystems, totalStations, totalRuins } };
}

function renderGalaxyOverview(galaxy) {
  const lines = [];
  const bar = (n, max, char, empty) => {
    char = char || '█';
    empty = empty || '░';
    return char.repeat(Math.round(n)) + empty.repeat(max - Math.round(n));
  };
  lines.push('');
  lines.push('  ── DEEP SURVEY — GALAXY MANIFEST v0.2 ────────────────────');
  lines.push('');
  lines.push('  Seed: ' + galaxy.seed + '  |  Systems: ' + galaxy.meta.totalSystems + '  |  Stations: ' + galaxy.meta.totalStations + '  |  Ruins: ' + galaxy.meta.totalRuins);
  lines.push('');
  lines.push('  ── QUADRANT INDEX ──────────────────────────────────────────');
  lines.push('');
  galaxy.quadrants.forEach(function(q, i) {
    const totalSys = q.clusters.reduce(function(n, c) { return n + c.systems.length; }, 0);
    const controlPct = Math.round(q.controlScore * 100);
    const controlBar = bar(q.controlScore * 10, 10);
    const stateTag = q.state.toUpperCase().padEnd(12);
    lines.push('  [' + (i + 1) + '] ' + q.name.padEnd(20) + ' ' + stateTag + '  ' + controlBar + '  ' + controlPct + '% ctrl');
    lines.push('      ' + q.notableFeature.padEnd(35) + ' ' + totalSys + ' systems');
    lines.push('');
  });
  lines.push('  ── COMMANDS ────────────────────────────────────────────────');
  lines.push('');
  lines.push('  scan <1-8>          — survey a quadrant');
  lines.push('  nav <system name>   — navigate to a system');
  lines.push('  status              — ship and cargo status');
  lines.push('  help                — full command list');
  lines.push('');
  return lines.join('\n');
}

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
