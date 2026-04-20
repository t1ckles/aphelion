// ============================================
//  APHELION — Economy Engine
//  economy.js
//  Stage 5 + System B: Veydrite, Trade,
//  Salvage, Fuel, Ship-aware damage
// ============================================

// ── Base Veydrite Rates ───────────────────────

const VEYDRITE_BASE_RATE = 120;

const STATE_PRICE_MODIFIER = {
  Established: 0.7,
  Contested:   1.0,
  Declining:   1.2,
  Collapsed:   1.6,
  Isolated:    1.4,
  Forbidden:   1.8,
};

function veydritePrice(quadrantState) {
  const mod = STATE_PRICE_MODIFIER[quadrantState] || 1.0;
  return Math.round(VEYDRITE_BASE_RATE * mod);
}

// ── Fuel Pricing ──────────────────────────────

const FUEL_BASE_RATE = 40;

const FUEL_PRICE_MODIFIER = {
  Established: 0.8,
  Contested:   1.1,
  Declining:   1.3,
  Collapsed:   2.0,
  Isolated:    1.6,
  Forbidden:   2.5,
};

function fuelPrice(quadrantState) {
  const mod = FUEL_PRICE_MODIFIER[quadrantState] || 1.0;
  return Math.round(FUEL_BASE_RATE * mod);
}

// ── Docking Fees ──────────────────────────────

const DOCK_FEE = {
  guild:       50,
  pelk:        35,
  colonial:    20,
  feral:        0,
  independent: 25,
  forbidden:    0,
};

function dockingFee(factionKey) {
  return DOCK_FEE[factionKey] ?? 25;
}

// ── Salvage Engine ────────────────────────────

function rollSalvage(sys, quadrantState) {
  const hasRuin  = sys.bodies.some(b => b.hasRuin);
  const hasVeyd  = sys.bodies.some(b => b.veydrite);
  const hazard   = sys.hazard || 1;

  const baseYield  = hasVeyd ? 15 : 3;
  const stateBonus = {
    Collapsed:   2.0, Declining: 1.5, Contested: 1.2,
    Established: 0.8, Isolated:  1.3, Forbidden: 1.6,
  };
  const bonus = stateBonus[quadrantState] || 1.0;

  const variance      = hazard * 4;
  const veydriteFound = Math.max(0, Math.round(
    (baseYield * bonus) + (Math.random() * variance) - (variance / 2)
  ));

  const scrapValue = hasRuin
    ? Math.round(20 + Math.random() * 80)
    : Math.round(5  + Math.random() * 20);

  const hazardRoll      = Math.random();
  const hazardThreshold = hazard * 0.08;
  const rareFindRoll    = Math.random();
  const rareFindChance  = hasRuin ? 0.12 : 0.04;

  return {
    veydriteFound,
    scrapValue,
    incident:        hazardRoll < hazardThreshold,
    rareFindRoll,
    rareFindChance,
    hasRuin,
    hasVeyd,
    xenoTainted:     sys.xenoTainted || false,
  };
}

// ── Rare Finds ────────────────────────────────

const RARE_FINDS = [
  'A sealed data core. Guild pays well for these.',
  'Intact navigation charts — pre-collapse era.',
  'A personal log. The last entry is unfinished.',
  'Emergency rations, still sealed. Sell or keep.',
  'A ship registry plate from a vessel not on record.',
  'A cargo manifest with a destination that no longer exists.',
];

const XENO_RARE_FINDS = [
  'A sealed container. No markings. No seam. No obvious way to open it. It is lighter than it should be.',
  'Hull plating from an unknown vessel class. The alloy composition does not match any registered manufacturer.',
  'A navigation crystal, intact. When powered, it displays coordinates. The coordinates are inside this planet.',
  'A personal recorder. The audio is intact. The language is not on record. It sounds almost familiar.',
  'Something that was a tool. The grip is wrong for a human hand. Not wrong enough to be comforting.',
  'A data core. Encrypted. The encryption standard does not exist in Guild records. It is not old.',
  'A fragment of hull plating with writing on the interior. The writing is in Standard. It says: do not look for us.',
  'Biological material, preserved. It is close to human. It is not human.',
];

function rareFind(xenoTainted) {
  if (xenoTainted && Math.random() < 0.6) {
    return XENO_RARE_FINDS[Math.floor(Math.random() * XENO_RARE_FINDS.length)];
  }
  return RARE_FINDS[Math.floor(Math.random() * RARE_FINDS.length)];
}

// ── Incident Table ────────────────────────────

const INCIDENTS = [
  { description: 'Hull scrape on debris. Minor damage.',         hullDamage: 5,  fuelLoss: 0  },
  { description: 'Radiation spike. Brief exposure.',             hullDamage: 0,  fuelLoss: 0  },
  { description: 'Salvage arm malfunction. Lost some time.',     hullDamage: 0,  fuelLoss: 0  },
  { description: 'Something moved in the ruin. You left quickly.', hullDamage: 0, fuelLoss: 0 },
  { description: 'Fuel cell punctured by microdebris.',          hullDamage: 0,  fuelLoss: 5  },
  { description: 'Structural collapse in the salvage zone.',     hullDamage: 10, fuelLoss: 0  },
];

function rollIncident() {
  return INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
}

// ── Salvage Result Renderer ───────────────────
// Now ship-aware — applies damage to ship object

function renderSalvageResult(result, playerState) {
  const lines = [];
  const ship  = playerState.ship;

  lines.push('');
  lines.push('  ── SALVAGE OPERATION ─────────────────────────────────────────');
  lines.push('');

  if (result.incident) {
    const inc = rollIncident();
    lines.push('  [!] INCIDENT: ' + inc.description);

    if (inc.hullDamage > 0 && ship) {
      ship.hull = Math.max(0, ship.hull - inc.hullDamage);
      lines.push('  Hull damage: -' + inc.hullDamage + '  Hull: ' + ship.hull + '/' + ship.hullMax);

      // Check subsystem cascade
      const hullSub = ship.subsystems && ship.subsystems.hull_core;
      if (hullSub) {
        hullSub.hp  = Math.max(0, hullSub.hp  - inc.hullDamage);
        hullSub.sta = Math.max(0, hullSub.sta - inc.hullDamage);
      }
    }

    if (inc.fuelLoss > 0 && ship) {
      ship.fuel = Math.max(0, ship.fuel - inc.fuelLoss);
      lines.push('  Fuel loss: -' + inc.fuelLoss + ' units.  Fuel: ' + ship.fuel + '/' + ship.fuelMax);
    }

    lines.push('');
  }

if (result.veydriteFound > 0) {
    const reserveSpace = 15 - (playerState.reserveVeydrite || 0);
    const toReserve    = Math.min(result.veydriteFound, reserveSpace);
    const toCargo      = result.veydriteFound - toReserve;

    if (toReserve > 0) {
      playerState.reserveVeydrite = (playerState.reserveVeydrite || 0) + toReserve;
    }
    if (toCargo > 0) {
      playerState.veydrite += toCargo;
    }

    lines.push('  Veydrite recovered : ' + result.veydriteFound + ' kg');
    if (toReserve > 0) {
      lines.push('  Reserve topped up  : +' + toReserve + ' kg  (' + playerState.reserveVeydrite.toFixed(1) + ' / 15 kg)');
    }
    if (toCargo > 0) {
      lines.push('  Hold total         : ' + playerState.veydrite + ' kg');
    }
  } else {
    lines.push('  Veydrite recovered : none');
  }

  if (result.scrapValue > 0) {
    playerState.credits += result.scrapValue;
    lines.push('  Scrap value        : ' + result.scrapValue + ' CR  (auto-liquidated)');
  }

  if (result.rareFindRoll < result.rareFindChance) {
    const find = rareFind(result.xenoTainted);
    lines.push('');
    lines.push('  [RARE FIND] ' + find);
  }

  lines.push('');
  lines.push('  Operation complete. Running total:');

  if (ship) {
    lines.push('  Scrip: ' + playerState.credits + ' CR  |  Veydrite: ' + playerState.veydrite + ' kg  |  Fuel: ' + ship.fuel + '/' + ship.fuelMax + '  |  Hull: ' + ship.hull + '/' + ship.hullMax);
  } else {
    lines.push('  Scrip: ' + playerState.credits + ' CR  |  Veydrite: ' + playerState.veydrite + ' kg');
  }

  lines.push('');
  return lines.join('\n');
}

// ── Trade Menu Builder ────────────────────────

function buildTradeMenu(playerState, factionKey, quadrantState) {
  const ship   = playerState.ship;
  const vPrice = veydritePrice(quadrantState);
  const fPrice = fuelPrice(quadrantState);
  const lines  = [];

  lines.push('');
  lines.push('  ── TRADE TERMINAL ────────────────────────────────────────────');
  lines.push('');
  lines.push('  Your scrip    : ' + playerState.credits + ' CR');
  lines.push('  Your veydrite : ' + playerState.veydrite + ' kg');
  lines.push('  Fuel reserve  : ' + (ship ? ship.fuel + '/' + ship.fuelMax : '—') + ' units');
  lines.push('  Hull          : ' + (ship ? ship.hull + '/' + ship.hullMax : '—'));
  lines.push('  Power Core    : ' + (ship ? ship.powerCore.current + '/' + ship.powerCore.max : '—') + '  [shore power — fully charged]');
  lines.push('');
  lines.push('  ── MARKET RATES ──────────────────────────────────────────────');
  lines.push('');
  lines.push('  Veydrite      : ' + vPrice + ' CR/kg  (Guild posted rate)');
  lines.push('  Fuel          : ' + fPrice + ' CR/unit');
  lines.push('');
  lines.push('  ── COMMANDS ──────────────────────────────────────────────────');
  lines.push('');

  if (playerState.veydrite > 0) {
    lines.push('  sell veydrite <amount>   — sell veydrite at posted rate');
    lines.push('  sell veydrite all        — sell entire hold');
  } else {
    lines.push('  sell veydrite            — nothing to sell');
  }

  lines.push('  buy fuel <amount>        — purchase fuel units');
  lines.push('  repair hull full         — full hull repair');
  lines.push('  repair hull <amount>     — partial hull repair');
  lines.push('  trade exit               — close trade terminal');
  lines.push('');

  return lines.join('\n');
}

// ── Distress Beacons ──────────────────────────

const BEACON_NORMAL = [
  { age: 'recent',  text: 'MAYDAY — vessel Harrow\'s End, drive failure, crew of four. Transmitting position. No response on Guild freq. Day 12.' },
  { age: 'recent',  text: 'This is Free Trader Sullen Light. We have hull breach on decks two and three. Cargo is secure. Crew is not. Please respond.' },
  { age: 'old',     text: 'AUTOMATED BEACON — Pelk Logistics waystation 7-Keth. Station decommissioned 2291. Beacon deactivation order not received. Disregard.' },
  { age: 'old',     text: 'This is the Colonial survey vessel Endurance. We are grounded on body three. Awaiting extraction. Beacon set to auto. — Commander Reyes, Day 1.' },
  { age: 'old',     text: 'AUTOMATED EMERGENCY BEACON — origin vessel: Margin Call. Class: light freighter. Last crew manifest: 2. Beacon active since 2287.' },
  { age: 'recent',  text: 'To anyone on this frequency. We found something in the ruins on body two. We are leaving. Do not come here. Do not respond to this beacon.' },
  { age: 'old',     text: 'Guild Survey Team Kappa-9. We have completed our survey. Beacon left active per protocol. All personnel extracted. Nothing to report.' },
  { age: 'recent',  text: 'This is Captain Idris Maren, vessel Iron Patience. We are not in distress. Repeat, not in distress. Someone else activated this beacon. We are investigating.' },
];

const BEACON_XENO = [
  { age: 'unknown', text: 'BEACON ORIGIN: UNKNOWN — signal structure matches standard distress protocol. Content does not match any known language. Repeating on all frequencies since [DATE CORRUPTED].' },
  { age: 'unknown', text: 'This is — [CORRUPTED] — we found — [CORRUPTED] — do not — [CORRUPTED] — it is still — [CORRUPTED] — please do not —' },
  { age: 'old',     text: 'Guild Survey Team Omicron-3. Survey complete. All personnel — [SIGNAL LOOPS] — Survey complete. All personnel — [SIGNAL LOOPS] — Survey complete.' },
  { age: 'unknown', text: 'AUTOMATED BEACON — vessel class not on record. Crew manifest: [NULL]. Cargo manifest: [NULL]. Destination: [NULL]. Beacon active since [NULL].' },
  { age: 'recent',  text: 'We are returning the beacon to its original location. We should not have moved it. We understand that now. Please do not move it again.' },
];

function rollBeacon(sys) {
  if (!sys.hasBeacon) return null;
  if (sys.xenoTainted && Math.random() < 0.55) {
    return BEACON_XENO[Math.floor(Math.random() * BEACON_XENO.length)];
  }
  return BEACON_NORMAL[Math.floor(Math.random() * BEACON_NORMAL.length)];
}

// ── Ruin Logs ─────────────────────────────────

const RUIN_LOGS = [
  'CREW LOG — Day 34. The extraction equipment failed again. Harmon says we can fix it. Harmon has been saying that for eleven days. We have enough food for nine more.',
  'MANIFEST — Cargo: medical supplies, 40 units. Fuel cells, 120 units. Colonist personal effects, 847 crates. Destination: New Kethara Station. Departure: 14 March 2271. [ARRIVAL NOT LOGGED]',
  'STATION LOG — 2289.07.12. Guild inspector completed review. Station rated: COMPLIANT. Inspector note: recommend expanded capacity. Management note: budget does not allow. Inspector note: understood.',
  'PERSONAL LOG — I don\'t know who will find this. I left it here because I couldn\'t take it with me. Her name was Sana Voss. She was the best navigator I ever flew with. She deserved better than this place.',
  'TRANSMISSION LOG — outbound — 2278.03.01 — TO: Pelk Regional HQ — FROM: Station Commander Dren Alcott — RE: Anomaly Report — Sir, I am filing this report for the record. I do not expect a response. The readings are attached. I recommend evacuation.',
  'MAINTENANCE LOG — Entry 1,847. Replaced atmospheric filter bank C. Entry 1,848. Filter bank C failed again. Entry 1,849. Replaced atmospheric filter bank C. Entry 1,850. Something is wrong with the air.',
  'CREW LOG — Day 1. We arrived. The ruins are exactly as described in the survey report. Day 2. The ruins are not exactly as described. Day 3. We are not sure the survey team came here.',
  'CARGO MANIFEST — Sealed container, 1 unit. Origin: [REDACTED]. Destination: Guild Assessment Bureau, Solace Reach. Contents: [REDACTED]. Priority: IMMEDIATE. Authorization: Director Hael Contis. Note: do not scan.',
  'STATION CLOSURE NOTICE — 2291.11.30. By order of Colonial Colonies Command, this station is hereby decommissioned. All personnel to evacuate within 30 days. Reason for closure: [CLASSIFIED]. Appeal process: none.',
  'PERSONAL LOG — I keep thinking about what Rand said before he left. He said the planet wasn\'t always this size. I told him that was impossible. He said he knew.',
];

const RUIN_LOGS_XENO = [
  'CREW LOG — Day 19. We have stopped trying to map the lower levels. The maps are always wrong by morning. Not wrong in a random way. Wrong in the same way. Something is correcting them.',
  'SURVEY REPORT — BODY THREE — Structure identified: non-colonial, non-pre-collapse. Materials: partially unclassified. Age: instrument error. Recommend: immediate Guild notification. Personal note: do not send Guild. Do not send anyone.',
  'TRANSMISSION — outbound — recipient unknown — content: WE ARE LEAVING THE THIRD LEVEL ALONE. WE UNDERSTAND. WE ARE LEAVING IT ALONE. — [no response on record]',
  'MANIFEST — Items recovered from lower ruin level: 0. Items brought to lower ruin level: 7. Personnel who entered lower ruin level: 4. Personnel who exited lower ruin level: 4. Discrepancy note: they are not the same 4.',
  'FINAL LOG — I am leaving this where someone will find it. Do not go below level two. It is not that the lower levels are dangerous. It is that they are interested. There is a difference. I understood that too late.',
];

function rollRuinLog(sys) {
  if (sys.xenoTainted && Math.random() < 0.5) {
    return RUIN_LOGS_XENO[Math.floor(Math.random() * RUIN_LOGS_XENO.length)];
  }
  return RUIN_LOGS[Math.floor(Math.random() * RUIN_LOGS.length)];
}

// ── Astrographic Pricing ──────────────────────

const ASTRO_BASE_RATE = {
  Established: 6,
  Contested:   9,
  Declining:   12,
  Collapsed:   18,
  Isolated:    14,
  Forbidden:   24,
};

const ASTRO_QUALITY_MOD = {
  basic: 0.3,
  deep:  1.0,
};

function astrographicValue(entry, currentDay, repScore) {
  const base    = ASTRO_BASE_RATE[entry.data.state] || 8;
  const quality = ASTRO_QUALITY_MOD[entry.quality]  || 0.3;

  // Decay — 1% per 10 days, floored at 50%
  const age      = Math.max(0, currentDay - entry.scannedDay);
  const decay    = Math.max(0.5, 1 - (age / 1000));

  // Rep modifier
  let repMod = 1.0;
  if (repScore !== null) {
    if (repScore > 60)  repMod = 1.15;
    if (repScore < -60) repMod = 0.75;
  }

  const unitValue = Math.round(base * quality * decay * repMod);
  const total     = unitValue * entry.units;
  const aging     = decay < 0.85;

  return { unitValue, total, aging, decay };
}

function astrographicYield(sys, quality, quadrantState) {
  // Base units by quality
  const base = quality === 'deep'
    ? { Established: 8, Contested: 11, Declining: 14, Collapsed: 20, Isolated: 16, Forbidden: 26 }[quadrantState] || 10
    : Math.floor(Math.random() * 3) + 1;  // basic: 1-3 units

  if (quality === 'basic') return base;

  // Deep scan bonuses
  const hasRuin    = sys.bodies.some(b => b.hasRuin);
  const hasStation = sys.bodies.some(b => b.hasStation);
  const hasVeyd    = sys.bodies.some(b => b.veydrite);

  const ruinBonus    = hasRuin    ? Math.floor(Math.random() * 6) + 5  : 0;
  const stationBonus = hasStation ? Math.floor(Math.random() * 3) + 3  : 0;
  const veydBonus    = hasVeyd    ? Math.floor(Math.random() * 3) + 2  : 0;

  // Variance ±20%
  const variance = Math.round(base * (0.8 + Math.random() * 0.4));

  return variance + ruinBonus + stationBonus + veydBonus;
}

// ── Fold cell pricing ─────────────────────────

function foldCellPrice(factionKey, repTier) {
  const base = {
    guild:       45,
    pelk:        55,
    colonial:    40,
    independent: 65,
    feral:       80,
  }[factionKey] || 65;

  // CCC requires KNOWN standing or better
  if (factionKey === 'colonial' && repTier === 'WATCHED' || repTier === 'HOSTILE') {
    return null; // refused
  }

  // Feral stations may not have stock — 40% chance empty
  if (factionKey === 'feral') {
    return { price: base, noStock: Math.random() < 0.4 };
  }

  // Guild standing discount/penalty
  const modifier = {
    TRUSTED:  0.85,
    KNOWN:    1.00,
    WATCHED:  1.15,
    HOSTILE:  null,
  }[repTier];

  if (modifier === null) return null; // refused

  return { price: Math.round(base * modifier), noStock: false };
}

// ── Raw veydrite emergency feed ───────────────

function rawVeydriteToCell(kg) {
  // 10kg = 1 cell equivalent
  // Returns number of cells that can be generated
  return Math.floor(kg / 10);
}

function feedRawVeydrite(playerState, cells) {
  // Feed raw veydrite into drive — 10kg per cell
  // 15% chance of minor drive wear per cell fed
  const kgNeeded = cells * 10;
  if (playerState.reserveVeydrite < kgNeeded) {
    return { success: false, reason: 'Insufficient reserve veydrite.' };
  }
  playerState.reserveVeydrite -= kgNeeded;
  playerState.foldCells       += cells;

  const wearRolls = [];
  for (let i = 0; i < cells; i++) {
    if (Math.random() < 0.15) wearRolls.push(i);
  }

  return {
    success:    true,
    cellsAdded: cells,
    kgConsumed: kgNeeded,
    driveWear:  wearRolls.length > 0,
    wearCount:  wearRolls.length,
  };
}

// ============================================
//  MINING SYSTEM
// ============================================

// ── Ore definitions ───────────────────────────

const ORE_DEFS = {
  // Common
  ferrite:    { name: 'Ferrite',           refinesTo: 'iron',             grade: 'common',   units: 1.0 },
  copperite:  { name: 'Copperite',         refinesTo: 'copper',           grade: 'common',   units: 1.0 },
  stannite:   { name: 'Stannite',          refinesTo: 'tin',              grade: 'common',   units: 1.0 },
  nickeline:  { name: 'Nickeline',         refinesTo: 'nickel',           grade: 'common',   units: 1.0 },
  silicate:   { name: 'Silicate',          refinesTo: 'polysilicon',      grade: 'common',   units: 1.0 },
  cobaltite:  { name: 'Cobaltite',         refinesTo: 'cobalt',           grade: 'common',   units: 1.0 },
  galena:     { name: 'Galena',            refinesTo: 'lead',             grade: 'common',   units: 1.0 },

  // Uncommon
  titanite:   { name: 'Titanite',          refinesTo: 'titanium',         grade: 'uncommon', units: 0.8 },
  chromite:   { name: 'Chromite',          refinesTo: 'chromium',         grade: 'uncommon', units: 0.8 },
  wolframite: { name: 'Wolframite',        refinesTo: 'tungsten',         grade: 'uncommon', units: 0.8 },
  uraninite:  { name: 'Uraninite',         refinesTo: 'enriched_uranium', grade: 'uncommon', units: 0.6 },
  malachite:  { name: 'Malachite',         refinesTo: 'manganese',        grade: 'uncommon', units: 0.8 },

  // Rare
  platinite:  { name: 'Platinite',         refinesTo: 'platinum',         grade: 'rare',     units: 0.5 },
  palladite:  { name: 'Palladite',         refinesTo: 'palladium',        grade: 'rare',     units: 0.5 },
  iridite:    { name: 'Iridite',           refinesTo: 'iridium',          grade: 'rare',     units: 0.4 },
  osmite:     { name: 'Osmite',            refinesTo: 'osmium',           grade: 'rare',     units: 0.4 },

  // Ice compounds
  water_ice:        { name: 'Water Ice',         refinesTo: 'purified_water',   grade: 'ice',      units: 1.2, liquid: true },
  ammonia_ice:      { name: 'Ammonia Ice',       refinesTo: 'liquid_ammonia',   grade: 'ice',      units: 1.0, liquid: true },
  methane_clathrate:{ name: 'Methane Clathrate', refinesTo: 'methane_gas',      grade: 'ice',      units: 0.9, liquid: true },
  helium3_ice:      { name: 'Helium-3 Ice',      refinesTo: 'helium3',          grade: 'ice_rare', units: 0.6, liquid: true },

  // Exotic
  veydritic_silicate: { name: 'Veydritic Silicate', refinesTo: 'fold_grade_silicon', grade: 'exotic', units: 0.5 },
  null_residue:       { name: 'Null Residue',        refinesTo: 'null_alloy',         grade: 'exotic', units: 0.3 },
  archaeoferrite:     { name: 'Archaeoferrite',      refinesTo: 'archaeosteel',       grade: 'exotic', units: 0.7 },

  // The Ash — contamination state, not a real ore
  ash_compactate: { name: 'Ash Compactate', refinesTo: null, grade: 'ash', units: 0, worthless: true },
};

// ── Refined metals ────────────────────────────

const REFINED_DEFS = {
  iron:              { name: 'Iron',              grade: 'common',   basePrice: 12  },
  copper:            { name: 'Copper',            grade: 'common',   basePrice: 18  },
  tin:               { name: 'Tin',               grade: 'common',   basePrice: 15  },
  nickel:            { name: 'Nickel',            grade: 'common',   basePrice: 14  },
  polysilicon:       { name: 'Polysilicon',       grade: 'common',   basePrice: 20  },
  cobalt:            { name: 'Cobalt',            grade: 'common',   basePrice: 22  },
  lead:              { name: 'Lead',              grade: 'common',   basePrice: 10  },
  titanium:          { name: 'Titanium',          grade: 'uncommon', basePrice: 45  },
  chromium:          { name: 'Chromium',          grade: 'uncommon', basePrice: 38  },
  tungsten:          { name: 'Tungsten',          grade: 'uncommon', basePrice: 42  },
  enriched_uranium:  { name: 'Enriched Uranium',  grade: 'uncommon', basePrice: 120 },
  manganese:         { name: 'Manganese',         grade: 'uncommon', basePrice: 28  },
  platinum:          { name: 'Platinum',          grade: 'rare',     basePrice: 180 },
  palladium:         { name: 'Palladium',         grade: 'rare',     basePrice: 160 },
  iridium:           { name: 'Iridium',           grade: 'rare',     basePrice: 220 },
  osmium:            { name: 'Osmium',            grade: 'rare',     basePrice: 200 },
  purified_water:    { name: 'Purified Water',    grade: 'ice',      basePrice: 8   },
  liquid_ammonia:    { name: 'Liquid Ammonia',    grade: 'ice',      basePrice: 25  },
  methane_gas:       { name: 'Methane Gas',       grade: 'ice',      basePrice: 30  },
  helium3:           { name: 'Helium-3',          grade: 'ice_rare', basePrice: 280 },
  fold_grade_silicon:{ name: 'Fold-Grade Silicon',grade: 'exotic',   basePrice: 350 },
  null_alloy:        { name: 'Null Alloy',        grade: 'exotic',   basePrice: 500 },
  archaeosteel:      { name: 'Archaeosteel',      grade: 'exotic',   basePrice: 420 },
};

// ── Body type ore tables ──────────────────────

const BODY_ORE_TABLE = {
  'Barren Rock': {
    common:   ['ferrite', 'copperite', 'silicate', 'galena'],
    uncommon: ['titanite'],
    rare:     [],
    exotic:   ['archaeoferrite'],
    ashChance: 0.005,
  },
  'Desert World': {
    common:   ['ferrite', 'silicate', 'copperite'],
    uncommon: ['malachite', 'galena'],
    rare:     [],
    exotic:   [],
    ashChance: 0.005,
  },
  'Ice Giant': {
    common:   [],
    uncommon: [],
    rare:     [],
    ice:      ['water_ice', 'ammonia_ice', 'methane_clathrate'],
    ice_rare: ['helium3_ice'],
    exotic:   [],
    ashChance: 0.002,
  },
  'Gas Giant': {
    common:   [],
    uncommon: [],
    rare:     [],
    ice:      ['methane_clathrate'],
    ice_rare: ['helium3_ice'],
    exotic:   [],
    ashChance: 0,
  },
  'Ocean World': {
    common:   [],
    uncommon: [],
    rare:     [],
    ice:      ['water_ice', 'ammonia_ice'],
    exotic:   [],
    ashChance: 0.001,
  },
  'Irradiated Hulk': {
    common:   ['nickeline', 'cobaltite'],
    uncommon: ['chromite', 'uraninite'],
    rare:     ['platinite', 'palladite'],
    exotic:   ['null_residue'],
    ashChance: 0.015,
  },
  'Dust Belt': {
    common:   ['ferrite', 'nickeline'],
    uncommon: [],
    rare:     ['palladite'],
    exotic:   ['veydritic_silicate'],
    ashChance: 0.008,
  },
  'Rogue Moon': {
    common:   ['ferrite', 'nickeline', 'cobaltite'],
    uncommon: ['titanite', 'wolframite'],
    rare:     ['osmite'],
    exotic:   ['archaeoferrite'],
    ashChance: 0.005,
  },
  'Shattered Planet': {
    common:   ['ferrite', 'copperite', 'stannite', 'nickeline', 'silicate', 'cobaltite'],
    uncommon: ['chromite', 'wolframite', 'malachite'],
    rare:     ['iridite', 'platinite'],
    exotic:   ['archaeoferrite', 'null_residue'],
    ashChance: 0.012,
  },
  'Debris Field': {
    common:   [],
    uncommon: [],
    rare:     [],
    exotic:   [],
    ashChance: 0,
    salvageOnly: true,
  },
};

// ── Ore generation for a body ─────────────────

function generateBodyOres(bodyType, rng, xenoTainted) {
  const table = BODY_ORE_TABLE[bodyType];
  if (!table || table.salvageOnly) return null;

  const ores = [];

  // Common — 2-4 types
  const commonPool = table.common || [];
  const commonCount = Math.min(commonPool.length, 1 + Math.floor(rng.next() * 3));
  const shuffledCommon = [...commonPool].sort(() => rng.next() - 0.5);
  shuffledCommon.slice(0, commonCount).forEach(ore => {
    ores.push({
      type:     ore,
      quantity: 40 + Math.floor(rng.next() * 60),
      quality:  rng.next() < 0.3 ? 'rich' : rng.next() < 0.6 ? 'standard' : 'depleted',
    });
  });

  // Uncommon — 0-2 types, 40% chance each
  (table.uncommon || []).forEach(ore => {
    if (rng.next() < 0.4) {
      ores.push({
        type:     ore,
        quantity: 20 + Math.floor(rng.next() * 30),
        quality:  rng.next() < 0.2 ? 'rich' : 'standard',
      });
    }
  });

  // Rare — 0-1 types, 15% chance each
  (table.rare || []).forEach(ore => {
    if (rng.next() < 0.15) {
      ores.push({
        type:     ore,
        quantity: 5 + Math.floor(rng.next() * 15),
        quality:  'standard',
      });
    }
  });

  // Ice — if applicable
  (table.ice || []).forEach(ore => {
    if (rng.next() < 0.7) {
      ores.push({
        type:     ore,
        quantity: 30 + Math.floor(rng.next() * 50),
        quality:  'standard',
        liquid:   true,
      });
    }
  });

  // Ice rare
  (table.ice_rare || []).forEach(ore => {
    if (rng.next() < 0.1) {
      ores.push({
        type:     ore,
        quantity: 5 + Math.floor(rng.next() * 10),
        quality:  'standard',
        liquid:   true,
      });
    }
  });

  // Exotic — 10% chance each, higher in xeno systems
  (table.exotic || []).forEach(ore => {
    const chance = xenoTainted && ore === 'null_residue' ? 0.35 : 0.1;
    if (rng.next() < chance) {
      ores.push({
        type:     ore,
        quantity: 3 + Math.floor(rng.next() * 10),
        quality:  'standard',
      });
    }
  });

  // The Ash — tiny chance, higher in xeno systems
  const ashBase = table.ashChance || 0;
  const ashChance = xenoTainted ? ashBase * 6 : ashBase;
  const hasAsh = rng.next() < ashChance;

  return {
    ores:        ores.length > 0 ? ores : null,
    ashFlag:     hasAsh,
    ashProgress: 0,
    surveyed:    false,
    mined:       false,
    nodeYield:   ores.reduce((n, o) => n + o.quantity, 0),
  };
}

// ── Refinery pricing ──────────────────────────

function refineryYieldShare(factionKey, rng) {
  const ranges = {
    guild:       [0.10, 0.16],
    pelk:        [0.12, 0.18],
    colonial:    [0.14, 0.20],
    independent: [0.18, 0.26],
    feral:       [0.25, 0.35],
  };
  const range = ranges[factionKey] || ranges.independent;
  return range[0] + rng.next() * (range[1] - range[0]);
}

function refineryScripFee(factionKey, quadrantState) {
  const base = {
    guild:       8,
    pelk:        6,
    colonial:    5,
    independent: 10,
    feral:       15,
  }[factionKey] || 10;

  const stateMod = {
    Established: 1.0,
    Contested:   1.2,
    Declining:   1.5,
    Collapsed:   2.0,
    Isolated:    1.7,
    Forbidden:   2.5,
  }[quadrantState] || 1.0;

  return Math.round(base * stateMod);
}

function hasRefinery(factionKey) {
  return ['guild', 'pelk', 'colonial', 'independent'].includes(factionKey);
}

function refineryGrade(factionKey) {
  return {
    guild:       'basic',
    pelk:        'standard',
    colonial:    'standard',
    independent: 'basic',
    feral:       'improvised',
  }[factionKey] || 'basic';
}

// ── Refining yield rates ──────────────────────

function refineYieldRate(oreGrade, refineryGradeStr, repTier) {
  const base = {
    common:   0.70,
    uncommon: 0.60,
    rare:     0.50,
    ice:      0.75,
    ice_rare: 0.55,
    exotic:   0.45,
  }[oreGrade] || 0.60;

  const gradeMod = {
    improvised: -0.15,
    basic:       0.00,
    standard:    0.08,
    advanced:    0.15,
  }[refineryGradeStr] || 0;

  const repMod = repTier === 'TRUSTED' ? 0.03 : repTier === 'HOSTILE' ? -0.10 : 0;

  return Math.min(0.95, Math.max(0.20, base + gradeMod + repMod));
}

// ── Ore market pricing ────────────────────────

function oreMarketPrice(oreKey, quadrantState) {
  const def = REFINED_DEFS[oreKey];
  if (!def) return 0;

  const stateMod = {
    Established: 0.8,
    Contested:   1.0,
    Declining:   1.2,
    Collapsed:   1.5,
    Isolated:    1.3,
    Forbidden:   1.8,
  }[quadrantState] || 1.0;

  return Math.round(def.basePrice * stateMod);
}
