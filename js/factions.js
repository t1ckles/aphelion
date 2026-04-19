// ============================================
//  APHELION — Faction & Reputation Engine
//  factions.js
//  Stage 7: Memory, Contracts, Standing
// ============================================

// ── Faction Registry ──────────────────────────

const FACTION_REGISTRY = {
  guild: {
    name:      'The Assayer\'s Guild',
    short:     'GUILD',
    color:     'neutral',
    contracts: true,
    bulletin:  'Guild Survey Board',
  },
  pelk: {
    name:      'Pelk Logistics',
    short:     'PELK',
    color:     'commercial',
    contracts: true,
    bulletin:  'Pelk Contract Terminal',
  },
colonial: {
    name:      'Colonial Colonies Command',
    short:     'CCC',
    color:     'military',
    contracts: true,
    bulletin:  'CCC Dispatch',
  },
  feral: {
    name:      'Feral Settlement',
    short:     'FERAL',
    color:     'hostile',
    contracts: true,
    bulletin:  'Feral Board',
  },
  independent: {
    name:      'Independent',
    short:     'INDP',
    color:     'neutral',
    contracts: false,
    bulletin:  null,
  },
  forbidden: {
    name:      'Unknown Authority',
    short:     '????',
    color:     'unknown',
    contracts: false,
    bulletin:  null,
  },
};

// ── Reputation Tiers ──────────────────────────

function repTier(score) {
  if (score > 60)  return 'TRUSTED';
  if (score > 0)   return 'KNOWN';
  if (score > -61) return 'WATCHED';
  return 'HOSTILE';
}

function repBar(score) {
  // 20 char bar centered at 0
  // positive fills right, negative fills left
  const normalized = Math.round((score + 100) / 10); // 0-20
  const filled     = Math.max(0, Math.min(20, normalized));
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

// ── Reputation Engine ─────────────────────────

const reputation = {};

function getRep(factionKey) {
  if (reputation[factionKey] === undefined) return null; // never met
  return reputation[factionKey];
}

function hasMet(factionKey) {
  return reputation[factionKey] !== undefined;
}

function meetFaction(factionKey) {
  if (!hasMet(factionKey)) {
    reputation[factionKey] = 0;
  }
}

function adjustRep(factionKey, delta, reason) {
  meetFaction(factionKey);
  const before = reputation[factionKey];
  reputation[factionKey] = Math.max(-100, Math.min(100, before + delta));
  const after  = reputation[factionKey];
  const change = delta > 0 ? '+' + delta : '' + delta;

  // Check for tier change
  const tierBefore = repTier(before);
  const tierAfter  = repTier(after);
  const tierChange = tierBefore !== tierAfter
    ? '  [REP] Standing with ' + FACTION_REGISTRY[factionKey].short + ' changed: ' + tierBefore + ' → ' + tierAfter
    : null;

  return {
    factionKey,
    change,
    after,
    reason,
    tierChange,
  };
}

function renderRepChange(result) {
  if (!result) return '';
  const lines = [];
  const faction = FACTION_REGISTRY[result.factionKey];
  if (!faction) return '';
  lines.push('  [REP] ' + faction.name + '  ' + result.change + '  (' + result.after + ')  — ' + result.reason);
  if (result.tierChange) lines.push(result.tierChange);
  return lines.join('\n');
}

// ── Reputation Display ────────────────────────

function renderRep(currentSystem) {
  const lines = [];
  lines.push('');
  lines.push('  ── FACTION STANDING ──────────────────────────────────────────');
  lines.push('');

  const keys = Object.keys(FACTION_REGISTRY);
  let anyMet = false;

  keys.forEach(key => {
    const faction = FACTION_REGISTRY[key];
    if (!hasMet(key)) {
      lines.push('  ' + faction.name.padEnd(28) + ' UNKNOWN    ---   ' + '░'.repeat(20));
    } else {
      const score = reputation[key];
      const tier  = repTier(score).padEnd(10);
      const score_str = (score >= 0 ? '+' : '') + score;
      lines.push('  ' + faction.name.padEnd(28) + ' ' + tier + ' ' + score_str.padEnd(5) + '  ' + repBar(score));
      anyMet = true;
    }
  });

  if (!anyMet) {
    lines.push('  No faction contacts established.');
    lines.push('  Dock at a station to begin building standing.');
  }

  lines.push('');

  // Show local faction if in a system with stations
  if (currentSystem) {
    const localFactions = currentSystem.bodies
      .filter(b => b.hasStation && b.factionKey)
      .map(b => b.factionKey);
    if (localFactions.length > 0) {
      lines.push('  ── LOCAL FACTIONS ────────────────────────────────────────────');
      lines.push('');
      localFactions.forEach(key => {
        const faction = FACTION_REGISTRY[key];
        const score   = getRep(key);
        const tier    = score === null ? 'UNKNOWN' : repTier(score);
        lines.push('  ' + faction.name + '  [' + tier + ']');
      });
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Contract Engine ───────────────────────────

const CONTRACT_TEMPLATES = [

  // ── Guild contracts ──────────────────────────
  {
    faction:      'guild',
    type:         'survey_basic',
    title:        'Cartographic Survey',
    description:  'Conduct a basic sensor sweep of [TARGET] and return chart data to this office.',
    payment:      180,
    repReward:    8,
    timeLimitBase: 6,
    difficulty:   1,
    requiresDeepscan: false,
    requiresStation:  false,
  },
  {
    faction:      'guild',
    type:         'survey_deep',
    title:        'Deep Survey Contract',
    description:  'Conduct a full astrographic survey of [TARGET]. Deep scan required. Return data to this office.',
    payment:      340,
    repReward:    14,
    timeLimitBase: 10,
    difficulty:   2,
    requiresDeepscan: true,
    requiresStation:  false,
  },
  {
    faction:      'guild',
    type:         'survey_deep',
    title:        'Ruin Assessment',
    description:  'Survey ruins at [TARGET] and file a full condition report. Deep scan required.',
    payment:      420,
    repReward:    16,
    timeLimitBase: 12,
    difficulty:   2,
    requiresDeepscan: true,
    requiresStation:  false,
    requiresRuin:     true,
  },
  {
    faction:      'guild',
    type:         'recovery',
    title:        'Beacon Recovery',
    description:  'A distress beacon has been detected at [TARGET]. Investigate and file a salvage report.',
    payment:      300,
    repReward:    12,
    timeLimitBase: 8,
    difficulty:   2,
    requiresDeepscan: false,
    requiresStation:  false,
    requiresBeacon:   true,
  },

  // ── Pelk contracts ───────────────────────────
  {
    faction:      'pelk',
    type:         'delivery',
    title:        'Fuel Cell Delivery',
    description:  'Deliver a consignment of fuel cells to [TARGET]. Standard handling.',
    payment:      340,
    repReward:    10,
    timeLimitBase: 10,
    difficulty:   1,
    requiresStation: true,
  },
  {
    faction:      'pelk',
    type:         'delivery',
    title:        'Sealed Cargo Run',
    description:  'Transport sealed cargo to [TARGET]. Contents are proprietary. Do not open.',
    payment:      480,
    repReward:    14,
    timeLimitBase: 12,
    difficulty:   2,
    requiresStation: true,
  },
  {
    faction:      'pelk',
    type:         'delivery',
    title:        'Priority Shipment',
    description:  'Time-sensitive delivery to [TARGET]. Speed bonus applies. Pelk rates guaranteed.',
    payment:      560,
    repReward:    18,
    timeLimitBase: 5,
    difficulty:   3,
    requiresStation: true,
  },
  {
    faction:      'pelk',
    type:         'interdiction',
    title:        'Targeted Neutralization',
    description:  'A vessel operating in [TARGET] has been deemed hostile to Pelk interests. Remove it.',
    payment:      800,
    repReward:    20,
    timeLimitBase: 14,
    difficulty:   3,
    requiresStation: false,
    morallyGrey: true,
  },

  // ── CCC contracts ────────────────────────────
  {
    faction:      'colonial',
    type:         'elimination',
    title:        'Elimination Order',
    description:  'A hostile vessel has been flagged in [TARGET]. Neutralize and confirm destruction.',
    payment:      900,
    repReward:    22,
    timeLimitBase: 14,
    difficulty:   3,
    requiresStation: false,
  },
  {
    faction:      'colonial',
    type:         'escort',
    title:        'Escort Duty',
    description:  'Escort a CCC transport from here to [TARGET]. Vessel must arrive intact.',
    payment:      620,
    repReward:    18,
    timeLimitBase: 10,
    difficulty:   2,
    requiresStation: true,
  },
  {
    faction:      'colonial',
    type:         'survey_deep',
    title:        'Strategic Survey',
    description:  'Conduct a full astrographic survey of [TARGET] for CCC strategic planning.',
    payment:      500,
    repReward:    16,
    timeLimitBase: 12,
    difficulty:   2,
    requiresDeepscan: true,
    requiresStation:  false,
  },

  // ── Feral contracts ──────────────────────────
  {
    faction:      'feral',
    type:         'removal',
    title:        'Removal',
    description:  'Someone needs to not be in [TARGET] anymore. Details on arrival. Ask for Harrow.',
    payment:      700,
    repReward:    15,
    timeLimitBase: 12,
    difficulty:   3,
    requiresStation: false,
    morallyGrey: true,
  },
  {
    faction:      'feral',
    type:         'extraction',
    title:        'Extraction Run',
    description:  'Retrieve a package from [TARGET]. No questions. Deliver here. No questions.',
    payment:      650,
    repReward:    14,
    timeLimitBase: 10,
    difficulty:   3,
    requiresStation: false,
  },
];

// Active contracts
let activeContracts   = [];
let contractIdCounter = 1;

// ── Jump distance estimator ───────────────────

function estimateJumps(fromQuadrantIndex, toQuadrantIndex) {
  if (fromQuadrantIndex === toQuadrantIndex) return 3;
  const diff = Math.abs(fromQuadrantIndex - toQuadrantIndex);
  if (diff <= 2) return 5;
  return 9;
}

function estimateDeadline(template, fromQuadrantIndex, toQuadrantIndex) {
  const jumpsOut  = estimateJumps(fromQuadrantIndex, toQuadrantIndex);
  const jumpsBack = jumpsOut;
  const scanDays  = template.requiresDeepscan ? 1 : 0;
  const travel    = jumpsOut + jumpsBack + scanDays;
  const margin    = 1.2;
  return Math.max(template.timeLimitBase, Math.ceil(travel * margin));
}

// ── Payment scaling ───────────────────────────

function scalePayment(basePayment, fromQuadrantIndex, toQuadrantIndex, targetState) {
  const distMod  = fromQuadrantIndex === toQuadrantIndex ? 1.0
                 : Math.abs(fromQuadrantIndex - toQuadrantIndex) <= 2 ? 1.3
                 : 1.7;
  const stateMod = {
    Established: 1.0, Contested: 1.15, Declining: 1.3,
    Collapsed: 1.6,   Isolated:  1.4,  Forbidden: 2.0,
  }[targetState] || 1.0;
  return Math.round(basePayment * distMod * stateMod);
}

// ── Contract generation ───────────────────────

function generateContracts(factionKey, galaxy, currentLocation) {
  const templates = CONTRACT_TEMPLATES.filter(t => t.faction === factionKey);
  if (templates.length === 0) return [];

  const count     = 1 + Math.floor(Math.random() * 3);
  const contracts = [];
  const fromIdx   = currentLocation.quadrantIndex;

  for (let i = 0; i < count; i++) {
    // Shuffle templates and pick one we haven't used yet this batch
    const available = templates.filter(t =>
      !contracts.some(c => c.type === t.type && c.title === t.title)
    );
    if (available.length === 0) break;
    const template = available[Math.floor(Math.random() * available.length)];

    // Pick target system
    const targetSystem = pickTargetSystem(galaxy, currentLocation, template);
    if (!targetSystem) continue;

    // Find target quadrant index
    let toIdx = fromIdx;
    galaxy.quadrants.forEach((q, qi) => {
      q.clusters.forEach(c => {
        if (c.systems.some(s => s.name === targetSystem.name)) toIdx = qi;
      });
    });

    const targetState = galaxy.quadrants[toIdx].state;
    const deadline    = estimateDeadline(template, fromIdx, toIdx);
    const payment     = scalePayment(template.payment, fromIdx, toIdx, targetState);
    const repReward   = template.repReward + (toIdx !== fromIdx ? 4 : 0);

    // Build contract title with faction voice
    const title = buildTitle(template, factionKey);

    contracts.push({
      id:               contractIdCounter++,
      faction:          factionKey,
      type:             template.type,
      title,
      description:      template.description.replace('[TARGET]', targetSystem.name),
      target:           targetSystem.name,
      targetQuadrant:   toIdx,
      payment,
      repReward,
      timeLimitDays:    deadline,
      difficulty:       template.difficulty,
      requiresDeepscan: template.requiresDeepscan || false,
      morallyGrey:      template.morallyGrey      || false,
      issuedDay:        null,
      accepted:         false,
      completed:        false,
      failed:           false,
    });
  }

  return contracts;
}

function buildTitle(template, factionKey) {
  // Elimination-type contracts use faction voice
  if (template.type === 'elimination') {
    const titles = {
      colonial: 'Elimination Order',
      pelk:     'Targeted Neutralization',
      feral:    'Removal',
    };
    return titles[factionKey] || template.title;
  }
  return template.title;
}

function pickTargetSystem(galaxy, currentLocation, template) {
  const allSystems = [];

  galaxy.quadrants.forEach((q, qi) => {
    q.clusters.forEach(cluster => {
      cluster.systems.forEach(sys => {
        if (sys.name === currentLocation.systemName) return;
        if (template.requiresStation && !sys.bodies.some(b => b.hasStation)) return;
        if (template.requiresRuin    && !sys.bodies.some(b => b.hasRuin))    return;
        if (template.requiresBeacon  && !sys.hasBeacon)                       return;
        allSystems.push({ sys, quadrantIndex: qi, state: q.state });
      });
    });
  });

  if (allSystems.length === 0) return null;
  return allSystems[Math.floor(Math.random() * allSystems.length)].sys;
}

// ── Bulletin render ───────────────────────────

function renderBulletin(factionKey, contracts) {
  const faction = FACTION_REGISTRY[factionKey];
  const lines   = [];

  lines.push('');
  lines.push('  ── ' + (faction.bulletin || 'CONTRACT BOARD') + ' ────────────────────────────────');
  lines.push('');

  if (contracts.length === 0) {
    lines.push('  No contracts available at this time.');
    lines.push('');
    return lines.join('\n');
  }

  contracts.forEach((c, i) => {
    const diff    = '★'.repeat(c.difficulty) + '☆'.repeat(3 - c.difficulty);
    const grey    = c.morallyGrey ? '  [GREY]' : '';
    const dscan   = c.requiresDeepscan ? '  [DEEPSCAN]' : '';
    lines.push('  [' + (i + 1) + '] ' + c.title + '  ' + diff + grey + dscan);
    lines.push('      ' + c.description);
    lines.push('      Payment: ' + c.payment + ' CR  |  Deadline: ' + c.timeLimitDays + ' days  |  Rep: +' + c.repReward);
    lines.push('');
  });

  lines.push('  Type "accept <number>" to take a contract.');
  lines.push('');

  return lines.join('\n');
}

// ── Accept ────────────────────────────────────

function acceptContract(index, contracts, currentDay) {
  const contract = contracts[index];
  if (!contract) return { error: 'Invalid contract number.' };

  const existing = activeContracts.find(c => !c.completed && !c.failed);
  if (existing) {
    return { error: 'You already have an active contract. Complete or abandon it first.' };
  }

  contract.accepted  = true;
  contract.issuedDay = currentDay;
  activeContracts.push(contract);

  return { contract };
}

// ── Contract status ───────────────────────────

function checkContractStatus(contract, currentDay, currentSystemName) {
  if (!contract || contract.completed || contract.failed) return null;

  const daysElapsed = currentDay - contract.issuedDay;
  const daysLeft    = contract.timeLimitDays - daysElapsed;

  if (daysLeft <= 0) {
    contract.failed = true;
    return { status: 'failed', reason: 'Time limit exceeded.' };
  }

  if (currentSystemName === contract.target) {
    return { status: 'ready', daysLeft, daysElapsed };
  }

  return { status: 'active', daysLeft, daysElapsed };
}

// ── Complete ──────────────────────────────────

function completeContract(contract, daysElapsed, playerState) {
  contract.completed = true;

  const onTime    = daysElapsed <= contract.timeLimitDays;
  const fast      = daysElapsed <= Math.floor(contract.timeLimitDays * 0.6);
  const repEarned = fast ? contract.repReward + 3 : contract.repReward;
  const bonus     = fast ? Math.round(contract.payment * 0.1) : 0;
  const total     = contract.payment + bonus;

  playerState.credits += total;

  // Rep hit on opposing faction for elimination/removal/interdiction
  let opposingRepResult = null;
  if (contract.type === 'elimination' || contract.type === 'removal' || contract.type === 'interdiction') {
    const opposing = contract.faction === 'colonial' ? 'feral'
                   : contract.faction === 'pelk'     ? 'independent'
                   : contract.faction === 'feral'    ? 'colonial'
                   : null;
    if (opposing) {
      opposingRepResult = adjustRep(opposing, -10,
        'Contracted action against affiliated vessel');
    }
  }

  const repResult = adjustRep(contract.faction, repEarned,
    fast ? 'Contract completed ahead of schedule' : 'Contract completed');

  return { total, bonus, repEarned, fast, repResult, opposingRepResult };
}

// ── Fail ─────────────────────────────────────

function failContract(contract) {
  contract.failed = true;
  const repResult = adjustRep(contract.faction, -15, 'Contract failed');
  return { repResult };
}

// ── Active contract render ────────────────────

function renderActiveContract(contract, currentDay) {
  if (!contract) return '  No active contract.';

  const daysElapsed = currentDay - contract.issuedDay;
  const daysLeft    = contract.timeLimitDays - daysElapsed;
  const faction     = FACTION_REGISTRY[contract.faction];
  const diff        = '★'.repeat(contract.difficulty) + '☆'.repeat(3 - contract.difficulty);
  const urgent      = daysLeft <= 2 ? '  [!] URGENT' : '';
  const grey        = contract.morallyGrey ? '  [MORALLY GREY]' : '';
  const dscan       = contract.requiresDeepscan ? '  [DEEPSCAN REQUIRED]' : '';

  return [
    '',
    '  ── ACTIVE CONTRACT ───────────────────────────────────────────',
    '',
    '  ' + contract.title + '  ' + diff + '  [' + faction.short + ']' + grey,
    '  ' + contract.description,
    '',
    '  Target      : ' + contract.target,
    '  Payment     : ' + contract.payment + ' CR  +  Rep: ' + contract.repReward,
    '  Days left   : ' + daysLeft + ' / ' + contract.timeLimitDays + urgent,
    dscan ? ('  Note        : ' + dscan.trim()) : '',
    '',
  ].filter(l => l !== null).join('\n');
}
