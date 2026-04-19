// ============================================
//  APHELION — Weapons & Combat Engine
//  weapons.js
//  System B: Kinetic Combat, Power, Subsystems
// ============================================

// ── Ship Class Definitions ────────────────────

const SHIP_CLASSES = {
  surveyor_light: {
    designation:  'Light Surveyor',
    hullMax:      100,
    armorBase:    10,
    powerMax:     500,
    fuelMax:      100,
    ammoBayMax:   200,
    crewMax:      4,
    weaponSlots:  2,
    utilitySlots: 2,
    subsystems: {
      hull_core:     { name: 'Hull Core',     hpMax: 100, arm: 20, staMax: 100 },
      power_core:    { name: 'Power Core',    hpMax:  80, arm: 15, staMax:  80 },
      drive:         { name: 'Drive',         hpMax:  80, arm: 10, staMax:  80 },
      weapons_array: { name: 'Weapons Array', hpMax:  60, arm: 15, staMax:  60 },
      sensor_suite:  { name: 'Sensor Suite',  hpMax:  40, arm:  5, staMax:  40 },
      cargo_hold:    { name: 'Cargo Hold',    hpMax:  70, arm:  5, staMax:  70 },
      life_support:  { name: 'Life Support',  hpMax:  50, arm:  5, staMax:  50 },
      crew_quarters: { name: 'Crew Quarters', hpMax:  40, arm:  0, staMax:  40 },
      galley:        { name: 'Galley',        hpMax:  30, arm:  0, staMax:  30 },
    },
  },

  freighter_light: {
    designation:  'Light Freighter',
    hullMax:      140,
    armorBase:    15,
    powerMax:     600,
    fuelMax:      120,
    ammoBayMax:   400,
    crewMax:      6,
    weaponSlots:  3,
    utilitySlots: 2,
    subsystems: {
      hull_core:     { name: 'Hull Core',     hpMax: 140, arm: 25, staMax: 140 },
      power_core:    { name: 'Power Core',    hpMax: 100, arm: 15, staMax: 100 },
      drive:         { name: 'Drive',         hpMax: 100, arm: 10, staMax: 100 },
      weapons_array: { name: 'Weapons Array', hpMax:  80, arm: 15, staMax:  80 },
      sensor_suite:  { name: 'Sensor Suite',  hpMax:  50, arm:  5, staMax:  50 },
      cargo_hold:    { name: 'Cargo Hold',    hpMax: 120, arm: 10, staMax: 120 },
      life_support:  { name: 'Life Support',  hpMax:  60, arm:  5, staMax:  60 },
      crew_quarters: { name: 'Crew Quarters', hpMax:  50, arm:  0, staMax:  50 },
      galley:        { name: 'Galley',        hpMax:  40, arm:  0, staMax:  40 },
    },
  },
};

// ── Weapon Definitions ────────────────────────

const WEAPON_DEFS = {
  autoturret: {
    name:          'PDT-4 Point Defense Turret',
    category:      'kinetic',
    burstMin:      4,
    burstMax:      8,
    damagePerRound: 2,
    armorPen:      5,
    powerPerBurst: 5,
    conditionDecayPerBurst: 1,
    compatibleAmmo: ['AP', 'HE', 'Frag'],
    massPerRound:  { AP: 0.1, HE: 0.12, Frag: 0.08 },
    reloadTime:    0,   // days — autoturret is continuous
  },
  railgun_light: {
    name:          'LR-12 Light Railgun',
    category:      'kinetic',
    burstMin:      1,
    burstMax:      1,
    damagePerRound: 25,
    armorPen:      30,
    powerPerBurst: 0,
    conditionDecayPerBurst: 2,
    compatibleAmmo: ['AP', 'HE'],
    massPerRound:  { AP: 2.0, HE: 2.4 },
    reloadTime:    0,
  },
  railgun_heavy: {
    name:          'HR-7 Heavy Railgun',
    category:      'kinetic',
    burstMin:      1,
    burstMax:      1,
    damagePerRound: 55,
    armorPen:      60,
    powerPerBurst: 0,
    conditionDecayPerBurst: 3,
    compatibleAmmo: ['AP', 'HE'],
    massPerRound:  { AP: 5.0, HE: 6.0 },
    reloadTime:    0,
  },
  autocannon: {
    name:          'AC-20 Autocannon',
    category:      'kinetic',
    burstMin:      6,
    burstMax:      12,
    damagePerRound: 3,
    armorPen:      8,
    powerPerBurst: 0,
    conditionDecayPerBurst: 1.5,
    compatibleAmmo: ['AP', 'HE', 'Frag', 'Incendiary'],
    massPerRound:  { AP: 0.3, HE: 0.35, Frag: 0.25, Incendiary: 0.3 },
    reloadTime:    0,
  },
  missile_short: {
    name:          'Javelin-4 Short-Range Missile',
    category:      'guided',
    burstMin:      1,
    burstMax:      1,
    damagePerRound: 80,
    armorPen:      20,
    powerPerBurst: 15,
    conditionDecayPerBurst: 0.5,
    compatibleAmmo: ['missile_srm'],
    massPerRound:  { missile_srm: 15 },
    reloadTime:    0,
  },
  torpedo: {
    name:          'Mk.9 Torpedo Launcher',
    category:      'guided',
    burstMin:      1,
    burstMax:      1,
    damagePerRound: 200,
    armorPen:      50,
    powerPerBurst: 20,
    conditionDecayPerBurst: 1,
    compatibleAmmo: ['torpedo_mk9'],
    massPerRound:  { torpedo_mk9: 80 },
    reloadTime:    0,
  },
  dumbfire_rocket: {
    name:          'DF-6 Dumbfire Rocket Pod',
    category:      'unguided',
    burstMin:      1,
    burstMax:      3,
    damagePerRound: 45,
    armorPen:      15,
    powerPerBurst: 0,
    conditionDecayPerBurst: 2,
    compatibleAmmo: ['rocket_df'],
    massPerRound:  { rocket_df: 8 },
    reloadTime:    0,
  },
};

// ── Ammo Definitions ──────────────────────────

const AMMO_DEFS = {
  AP:            { name: 'Armor Piercing',    armorPenBonus: 10, damageBonus: 0,   systemsDamage: 0   },
  HE:            { name: 'High Explosive',    armorPenBonus:  0, damageBonus: 5,   systemsDamage: 10  },
  Frag:          { name: 'Fragmentation',     armorPenBonus: -5, damageBonus: -2,  systemsDamage: 5   },
  Incendiary:    { name: 'Incendiary',        armorPenBonus: -3, damageBonus: 2,   systemsDamage: 8   },
  missile_srm:   { name: 'SRM Warhead',       armorPenBonus: 20, damageBonus: 0,   systemsDamage: 20  },
  torpedo_mk9:   { name: 'Mk.9 Warhead',      armorPenBonus: 50, damageBonus: 0,   systemsDamage: 50  },
  rocket_df:     { name: 'Dumbfire Warhead',  armorPenBonus: 15, damageBonus: 0,   systemsDamage: 15  },
};

// ── Condition Thresholds ──────────────────────

function conditionRating(condition) {
  if (condition >= 70) return 'NOMINAL';
  if (condition >= 40) return 'WORN';
  if (condition >= 20) return 'DEGRADED';
  return 'CRITICAL';
}

function jamChance(condition) {
  if (condition >= 70) return 0.02;
  if (condition >= 40) return 0.10;
  if (condition >= 20) return 0.25;
  return 0.55;
}

// ── Power Core ────────────────────────────────

function initPowerCore(ship) {
  const pct     = 0.70 + Math.random() * 0.15;
  ship.powerCore.current = Math.round(ship.powerCore.max * pct);
}

function drainPower(ship, amount) {
  ship.powerCore.current = Math.max(0, ship.powerCore.current - amount);
  return ship.powerCore.current;
}

function rechargePower(ship, days, inCombat) {
  const rate = inCombat ? ship.powerCore.recharge : ship.powerCore.rechargeActive;
  ship.powerCore.current = Math.min(
    ship.powerCore.max,
    ship.powerCore.current + (rate * days)
  );
}

function isEmergencyPower(ship) {
  const threshold = ship.powerCore.emergencyThreshold || 10;
  return ship.powerCore.current <= threshold;
}

function isPowerDead(ship) {
  return ship.powerCore.current <= 0;
}

function powerStatus(ship) {
  const pct = Math.round((ship.powerCore.current / ship.powerCore.max) * 100);
  if (isPowerDead(ship))      return 'DEAD';
  if (isEmergencyPower(ship)) return 'EMERGENCY';
  if (pct < 25)               return 'LOW';
  if (pct < 60)               return 'NOMINAL';
  return 'FULL';
}

// ── Ammo Bay ──────────────────────────────────

function calcAmmoBayUsed(ship) {
  let used = 0;
  ship.weaponSlots.forEach(slot => {
    if (!slot.type) return;
    const def = WEAPON_DEFS[slot.type];
    if (!def) return;
    Object.keys(slot.ammo).forEach(ammoType => {
      const mass = def.massPerRound[ammoType] || 0;
      used += slot.ammo[ammoType] * mass;
    });
  });
  ship.ammoBayUsed = Math.round(used * 10) / 10;
  return ship.ammoBayUsed;
}

// ── Fire Resolution ───────────────────────────

function resolveShot(ship, slotId, targetSubsystem, targetArmor) {
  const slot = ship.weaponSlots.find(s => s.id === slotId);
  if (!slot || !slot.type) return { error: 'No weapon in slot ' + slotId };

  const def      = WEAPON_DEFS[slot.type];
  const ammoDef  = AMMO_DEFS[slot.activeAmmo];
  if (!def || !ammoDef) return { error: 'Weapon or ammo not found.' };

  // Check power
  if (def.powerPerBurst > 0) {
    if (ship.powerCore.current < def.powerPerBurst) {
      return { error: 'Insufficient power. Core at ' + ship.powerCore.current + '/' + ship.powerCore.max + '.' };
    }
    drainPower(ship, def.powerPerBurst);
  }

  // Check ammo
  const ammoCount = slot.ammo[slot.activeAmmo] || 0;
  if (ammoCount <= 0) return { error: 'No ' + slot.activeAmmo + ' rounds remaining.' };

  // Check weapons array subsystem
  const weaponsArray = ship.subsystems.weapons_array;
  if (weaponsArray && weaponsArray.hp <= 0) {
    return { error: 'Weapons array destroyed. Cannot fire.' };
  }

  // Jam check
  const jammed = Math.random() < jamChance(slot.condition);
  if (jammed) {
    slot.condition = Math.max(0, slot.condition - 1);
    return { jammed: true, weapon: def.name };
  }

  // Burst size
  const burst = def.burstMin + Math.floor(Math.random() * (def.burstMax - def.burstMin + 1));
  const actualBurst = Math.min(burst, ammoCount);

  // Consume ammo
  slot.ammo[slot.activeAmmo] -= actualBurst;
  calcAmmoBayUsed(ship);

  // Degrade condition
  slot.condition = Math.max(0, slot.condition - def.conditionDecayPerBurst);

  // Calculate damage
  const baseDamage    = def.damagePerRound * actualBurst;
  const armorPen      = def.armorPen + ammoDef.armorPenBonus;
  const effectiveArmor = Math.max(0, (targetArmor || 0) - armorPen);
  const hullDamage    = Math.max(1, baseDamage + ammoDef.damageBonus - effectiveArmor);
  const sysDamage     = ammoDef.systemsDamage;

  return {
    hit:          true,
    weapon:       def.name,
    ammoType:     slot.activeAmmo,
    burst:        actualBurst,
    hullDamage,
    sysDamage,
    targetSubsystem,
    conditionAfter: slot.condition,
    conditionRating: conditionRating(slot.condition),
  };
}

// ── Subsystem Damage ──────────────────────────

function applySubsystemDamage(ship, subsystemKey, damage) {
  const sub = ship.subsystems[subsystemKey];
  if (!sub) return null;

  const effective = Math.max(1, damage - sub.arm);
  sub.hp  = Math.max(0, sub.hp  - effective);
  sub.sta = Math.max(0, sub.sta - Math.round(effective * 1.5));

  return {
    subsystem:  sub.name,
    damage:     effective,
    hpAfter:    sub.hp,
    staAfter:   sub.sta,
    destroyed:  sub.hp <= 0,
    unstable:   sub.sta <= 0,
  };
}

function subsystemConsequence(subsystemKey, ship) {
  const sub = ship.subsystems[subsystemKey];
  if (!sub || sub.hp > 0) return null;

  const consequences = {
    hull_core:     'Hull Core destroyed. Ship lost.',
    power_core:    'Power Core destroyed. All systems failing.',
    drive:         'Drive destroyed. Nav and jump offline.',
    weapons_array: 'Weapons Array destroyed. Cannot fire.',
    sensor_suite:  'Sensor Suite destroyed. Auspex offline.',
    cargo_hold:    'Cargo Hold breached. Cargo at risk.',
    life_support:  'Life Support failing. Crew at risk.',
    crew_quarters: 'Crew Quarters destroyed.',
    galley:        'Galley destroyed.',
  };

  return consequences[subsystemKey] || null;
}

// ── Enemy Ship Generation ─────────────────────

const ENEMY_SHIP_CLASSES = {
  feral_light: {
    name:       'Feral Light Vessel',
    hullMax:    60,
    armor:      5,
    subsystems: {
      hull_core: { hp: 60,  arm:  5, sta: 60  },
      drive:     { hp: 40,  arm:  3, sta: 40  },
      weapons:   { hp: 30,  arm:  3, sta: 30  },
    },
    weapons:    ['autoturret'],
    damagePerRound: 3,
    accuracy:   0.6,
  },
  pirate_corvette: {
    name:       'Pirate Corvette',
    hullMax:    180,
    armor:      20,
    subsystems: {
      hull_core: { hp: 180, arm: 20, sta: 180 },
      drive:     { hp: 100, arm: 10, sta: 100 },
      weapons:   { hp:  80, arm: 15, sta:  80 },
    },
    weapons:    ['autocannon', 'railgun_light'],
    damagePerRound: 18,
    accuracy:   0.75,
  },
  faction_patrol: {
    name:       'Faction Patrol Corvette',
    hullMax:    220,
    armor:      30,
    subsystems: {
      hull_core: { hp: 220, arm: 30, sta: 220 },
      drive:     { hp: 120, arm: 15, sta: 120 },
      weapons:   { hp: 100, arm: 20, sta: 100 },
    },
    weapons:    ['railgun_light', 'autocannon'],
    damagePerRound: 25,
    accuracy:   0.85,
  },
  pirate_capital: {
    name:       'Pirate Capital Vessel',
    hullMax:    800,
    armor:      60,
    subsystems: {
      hull_core: { hp: 800, arm: 60, sta: 800 },
      drive:     { hp: 400, arm: 30, sta: 400 },
      weapons:   { hp: 300, arm: 40, sta: 300 },
    },
    weapons:    ['railgun_heavy', 'torpedo'],
    damagePerRound: 80,
    accuracy:   0.9,
  },
};

function spawnEnemy(attackerKey) {
  const classMap = {
    feral:            Math.random() < 0.8 ? 'feral_light' : 'pirate_corvette',
    pirate:           Math.random() < 0.05 ? 'pirate_capital' : 'pirate_corvette',
    hostile_faction:  'faction_patrol',
    unknown:          'feral_light',
  };

  const classKey  = classMap[attackerKey] || 'feral_light';
  const template  = ENEMY_SHIP_CLASSES[classKey];
  if (!template) return null;

  // Deep copy
  const enemy = JSON.parse(JSON.stringify(template));
  enemy.classKey  = classKey;
  enemy.hull      = enemy.hullMax;
  enemy.profiled  = false;
  enemy.siginted  = false;
  enemy.targeted  = null;

  return enemy;
}

function enemyAttack(enemy, playerShip) {
  if (!enemy || enemy.hull <= 0) return null;

  const hits    = Math.random() < enemy.accuracy;
  if (!hits) return { missed: true };

  const damage  = Math.round(
    enemy.damagePerRound * (0.8 + Math.random() * 0.4)
  );
  const armorPen = 10;
  const effective = Math.max(1, damage - Math.max(0, playerShip.armorBase - armorPen));

  return { hit: true, damage: effective };
}

// ── Combat State ──────────────────────────────

let combatState = null;

function initCombat(encounter, playerShip) {
  const enemy = spawnEnemy(encounter.attackerKey);
  combatState = {
    enemy,
    round:        1,
    playerTarget: 'hull_core',
    fled:         false,
    log:          [],
  };
  return combatState;
}

function getCombatState() { return combatState; }
function clearCombatState() { combatState = null; }

// ── Weapon Status Renderer ────────────────────

function renderWeaponStatus(ship) {
  const lines = [];
  lines.push('');
  lines.push('  ── WEAPON STATUS ─────────────────────────────────────────────');
  lines.push('');
  lines.push('  Ammo bay: ' + ship.ammoBayUsed + ' / ' + ship.ammoBayMax + ' kg');
  lines.push('  Power   : ' + ship.powerCore.current + ' / ' + ship.powerCore.max + '  [' + powerStatus(ship) + ']');
  lines.push('');

  ship.weaponSlots.forEach(slot => {
    if (!slot.type) {
      lines.push('  [' + slot.id + '] — empty slot');
      return;
    }
    const def    = WEAPON_DEFS[slot.type];
    const rating = conditionRating(slot.condition);
    lines.push('  [' + slot.id + '] ' + (def ? def.name : slot.name));
    lines.push('      Condition : ' + slot.condition + '/100  [' + rating + ']');
    lines.push('      Active ammo: ' + (slot.activeAmmo || 'none'));
    Object.keys(slot.ammo).forEach(ammoType => {
      const def2    = AMMO_DEFS[ammoType];
      const ammoName = def2 ? def2.name : ammoType;
      lines.push('      ' + ammoName + ': ' + slot.ammo[ammoType] + ' rds');
    });
    lines.push('');
  });

  lines.push('  ── UTILITY ───────────────────────────────────────────────────');
  lines.push('');
  ship.utilitySlots.forEach(slot => {
    const rating = conditionRating(slot.condition);
    lines.push('  [U' + slot.id + '] ' + slot.name);
    lines.push('      Condition : ' + slot.condition + '/100  [' + rating + ']');
    lines.push('      Power cost: ' + slot.powerCost + ' per operation');
    lines.push('');
  });

  return lines.join('\n');
}

function renderSubsystemStatus(ship) {
  const lines = [];
  lines.push('');
  lines.push('  ── SUBSYSTEM STATUS ──────────────────────────────────────────');
  lines.push('');
  lines.push('  ' + (ship.name || 'Unknown vessel') + '  —  ' + (ship.designation || ''));
  lines.push('');

  Object.keys(ship.subsystems).forEach(key => {
    const sub    = ship.subsystems[key];
    const hpPct  = Math.round((sub.hp  / sub.hpMax)  * 100);
    const staPct = Math.round((sub.sta / sub.staMax) * 100);

    const hpFilled  = Math.round(hpPct  / 10);
    const staFilled = Math.round(staPct / 10);

    const hpBar  = '█'.repeat(hpFilled)  + '░'.repeat(10 - hpFilled);
    const staBar = '█'.repeat(staFilled) + '░'.repeat(10 - staFilled);

    const status = sub.hp  <= 0  ? '  [DESTROYED]'
                 : sub.sta <= 0  ? '  [UNSTABLE]'
                 : hpPct   < 30  ? '  [CRITICAL]'
                 : hpPct   < 60  ? '  [DAMAGED]'
                 : '';

    const label = sub.name.padEnd(16);

    lines.push('  ' + label + ' HP ' + hpBar + ' ' + String(hpPct).padStart(3) + '%' + status);
    lines.push('  ' + ' '.repeat(16)  + ' ST ' + staBar + ' ' + String(staPct).padStart(3) + '%');
    lines.push('');
  });

  // Power core summary
  const powerPct = Math.round((ship.powerCore.current / ship.powerCore.max) * 100);
  const powerFilled = Math.round(powerPct / 10);
  const powerBar = '█'.repeat(powerFilled) + '░'.repeat(10 - powerFilled);
  const powerStat = powerStatus(ship);

  lines.push('  ── POWER CORE ────────────────────────────────────────────────');
  lines.push('');
  lines.push('  Charge          ' + powerBar + ' ' + String(powerPct).padStart(3) + '%  [' + powerStat + ']');
  lines.push('  ' + ship.powerCore.current + ' / ' + ship.powerCore.max + ' units');
  lines.push('  Recharge rate   ' + ship.powerCore.rechargeActive + ' units/day  (passive: ' + ship.powerCore.recharge + ')');
  lines.push('');

  return lines.join('\n');
}

function renderEnemyProfile(enemy) {
  const lines = [
    '',
    '  ── HULL SIGNATURE SCAN ───────────────────────────────────────',
    '',
    '  ' + enemy.name,
    '  Hull Core: ' + enemy.hull + ' / ' + enemy.hullMax,
    '',
  ];

  if (enemy.siginted) {
    lines.push('  ── SUBSYSTEMS ────────────────────────────────────────────────');
    lines.push('');
    Object.keys(enemy.subsystems).forEach(key => {
      const sub    = enemy.subsystems[key];
      const hpPct  = Math.round((sub.hp / (sub.hpMax || sub.hp)) * 100);
      lines.push('  ' + key.replace('_', ' ').toUpperCase().padEnd(16) + ' HP: ' + sub.hp + '  ARM: ' + sub.arm);
    });
    lines.push('');
  } else if (enemy.profiled) {
    lines.push('  Subsystems detected. Run "sigint" for full analysis.');
    lines.push('');
  }

  return lines.join('\n');
}
