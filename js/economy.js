// ============================================
//  APHELION — Economy Engine
//  economy.js
//  Stage 5: Veydrite, Trade, Salvage, Fuel
// ============================================

// ── Base Veydrite Rates ───────────────────────
// Guild posts a base rate. Quadrant state
// modifies it. Established = low (oversupply).
// Collapsed = high (scarcity premium).

const VEYDRITE_BASE_RATE = 120; // CR per kg

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

const FUEL_BASE_RATE = 40; // CR per unit

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
  feral:        0,  // negotiated in person
  independent: 25,
  forbidden:    0,  // no formal authority
};

function dockingFee(factionKey) {
  return DOCK_FEE[factionKey] ?? 25;
}

// ── Salvage Engine ────────────────────────────
// Roll salvage results based on system properties.
// Returns an object describing what was found.

function rollSalvage(sys, quadrantState) {
  const hasRuin  = sys.bodies.some(b => b.hasRuin);
  const hasVeyd  = sys.bodies.some(b => b.veydrite);
  const hazard   = sys.hazard || 1;

  // Base veydrite yield
  const baseYield = hasVeyd ? 15 : 3;
  const stateBonus = { Collapsed: 2.0, Declining: 1.5, Contested: 1.2,
                        Established: 0.8, Isolated: 1.3, Forbidden: 1.6 };
  const bonus = stateBonus[quadrantState] || 1.0;

  // Randomize yield — hazard adds variance
  const variance  = hazard * 4;
  const veydriteFound = Math.max(0, Math.round(
    (baseYield * bonus) + (Math.random() * variance) - (variance / 2)
  ));

  // Scrip from scrap metal, salvaged parts
  const scrapValue = hasRuin
    ? Math.round(20 + Math.random() * 80)
    : Math.round(5 + Math.random() * 20);

  // Hazard roll — chance of something going wrong
  const hazardRoll = Math.random();
  const hazardThreshold = hazard * 0.08; // hazard 5 = 40% chance of incident

  // Rare find roll
  const rareFindRoll   = Math.random();
  const rareFindChance = hasRuin ? 0.12 : 0.04;

  return {
    veydriteFound,
    scrapValue,
    incident:     hazardRoll < hazardThreshold,
    rareFindRoll,
    rareFindChance,
    hasRuin,
    hasVeyd,
    xenoTainted:  sys.xenoTainted || false,
  };
}

// ── Rare Find Table ───────────────────────────

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
  { description: 'Hull scrape on debris. Minor damage.', hullDamage: 5 },
  { description: 'Radiation spike. Brief exposure.', hullDamage: 0 },
  { description: 'Salvage arm malfunction. Lost some time.', hullDamage: 0 },
  { description: 'Something moved in the ruin. You left quickly.', hullDamage: 0 },
  { description: 'Fuel cell punctured by microdebris.', hullDamage: 0, fuelLoss: 5 },
  { description: 'Structural collapse in the salvage zone. Close call.', hullDamage: 10 },
];

function rollIncident() {
  return INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
}

// ── Trade Menu Builder ────────────────────────

function buildTradeMenu(playerState, factionKey, quadrantState) {
  const vPrice = veydritePrice(quadrantState);
  const fPrice = fuelPrice(quadrantState);
  const lines  = [];

  lines.push('');
  lines.push('  ── TRADE TERMINAL ────────────────────────────────────────────');
  lines.push('');
  lines.push('  Your scrip    : ' + playerState.credits + ' CR');
  lines.push('  Your veydrite : ' + playerState.veydrite + ' kg');
  lines.push('  Fuel reserve  : ' + playerState.fuel + ' units');
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
  lines.push('  trade exit               — close trade terminal');
  lines.push('');

  return lines.join('\n');
}

// ── Salvage Result Renderer ───────────────────

function renderSalvageResult(result, playerState) {
  const lines = [];
  lines.push('');
  lines.push('  ── SALVAGE OPERATION ─────────────────────────────────────────');
  lines.push('');

  if (result.incident) {
    const inc = rollIncident();
    lines.push('  [!] INCIDENT: ' + inc.description);
    if (inc.hullDamage > 0) {
      playerState.hull = Math.max(0, playerState.hull - inc.hullDamage);
      lines.push('  Hull integrity reduced by ' + inc.hullDamage + '%. Now at ' + playerState.hull + '%.');
    }
    if (inc.fuelLoss > 0) {
      playerState.fuel = Math.max(0, playerState.fuel - inc.fuelLoss);
      lines.push('  Fuel reserve reduced by ' + inc.fuelLoss + ' units.');
    }
    lines.push('');
  }

  if (result.veydriteFound > 0) {
    playerState.veydrite += result.veydriteFound;
    lines.push('  Veydrite recovered : ' + result.veydriteFound + ' kg');
    lines.push('  Hold total         : ' + playerState.veydrite + ' kg');
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
  lines.push('  Scrip: ' + playerState.credits + ' CR  |  Veydrite: ' + playerState.veydrite + ' kg  |  Fuel: ' + playerState.fuel + ' units');
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
