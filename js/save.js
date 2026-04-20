// ============================================
//  APHELION — Save / Load System
//  save.js
//  Stage 10 + System B: Full ship object
// ============================================

const SAVE_KEY     = 'aphelion_save';
const SAVE_VERSION = 4;

function slotKey(slot) { return 'aphelion_save_' + slot; }

function saveGameToSlot(slot, playerState, reputationData, contractData) {
  const result = saveGame(playerState, reputationData, contractData);
  if (result.success) {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) localStorage.setItem(slotKey(slot), raw);
  }
  return result;
}

function loadGameFromSlot(slot) {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return deepMerge(SAVE_DEFAULTS, data);
  } catch (e) {
    console.warn('Slot load failed:', e);
    return null;
  }
}

function hasSlotSave(slot) {
  return localStorage.getItem(slotKey(slot)) !== null;
}

function deleteSlotSave(slot) {
  localStorage.removeItem(slotKey(slot));
}

function getAllSlots() {
  return [1, 2, 3].map(slot => ({
    slot,
    save: loadGameFromSlot(slot),
  }));
}

// ── Defaults ──────────────────────────────────

const SAVE_DEFAULTS = {
  version:    SAVE_VERSION,
  savedAt:    null,
  galaxySeed: '4471-KETH-NULL',

  captain: {
    name: 'Unknown',
  },

  ship: {
    name:        'The Unspoken',
    class:       'surveyor',
    size:        'light',
    designation: 'Light Surveyor',
    hull:        100,
    hullMax:     100,
    armorBase:   10,
    powerCore: {
      current:            350,
      max:                500,
      recharge:           3,
      rechargeActive:     8,
      emergencyThreshold: 10,
    },
    fuel:        60,
    fuelMax:     100,
    ammoBayMax:  200,
    ammoBayUsed: 5,
    crewMax:     4,
    crewCurrent: 1,
    subsystems: {
      hull_core:     { name: 'Hull Core',     hp: 100, hpMax: 100, arm: 20, sta: 100, staMax: 100 },
      power_core:    { name: 'Power Core',    hp:  80, hpMax:  80, arm: 15, sta:  80, staMax:  80 },
      drive:         { name: 'Drive',         hp:  80, hpMax:  80, arm: 10, sta:  80, staMax:  80 },
      weapons_array: { name: 'Weapons Array', hp:  60, hpMax:  60, arm: 15, sta:  60, staMax:  60 },
      sensor_suite:  { name: 'Sensor Suite',  hp:  40, hpMax:  40, arm:  5, sta:  40, staMax:  40 },
      cargo_hold:    { name: 'Cargo Hold',    hp:  70, hpMax:  70, arm:  5, sta:  70, staMax:  70 },
      life_support:  { name: 'Life Support',  hp:  50, hpMax:  50, arm:  5, sta:  50, staMax:  50 },
      crew_quarters: { name: 'Crew Quarters', hp:  40, hpMax:  40, arm:  0, sta:  40, staMax:  40 },
      galley:        { name: 'Galley',        hp:  30, hpMax:  30, arm:  0, sta:  30, staMax:  30 },
    },
    weaponSlots: [
      {
        id: 1, name: 'PDT-4 Point Defense Turret',
        type: 'autoturret', condition: 80, conditionMax: 100,
        active: true, ammo: { AP: 50 }, activeAmmo: 'AP',
        massPerRound: { AP: 0.1 }, burstMin: 4, burstMax: 8, powerPerBurst: 5,
      },
      {
        id: 2, name: null, type: null, condition: null,
        conditionMax: null, active: false, ammo: {}, activeAmmo: null, massPerRound: {},
      },
    ],
    utilitySlots: [
      {
        id: 1, name: 'Harrow-7 Salvage Head', type: 'salvage_cutter',
        condition: 100, conditionMax: 100, active: true, powerCost: 30,
      },
    ],
  },

  location: {
    quadrantIndex: 0,
    clusterName:   null,
    systemName:    null,
  },

  economy: {
    credits:         200,
    veydrite:        0,
    cargo:           [],
    foldCells:       3,
    reserveVeydrite: 0,
  },
  
  reputation: {},

  contracts: {
    active:    null,
    history:   [],
    available: [],
  },

  logs:  [],
  flags: {},
  salvagedSystems: [],
  astrographics:   [],
  scannedSystems:  {},
  achievements:    [],

  stats: {
    jumps:         0,
    salvages:      0,
    daysSurvived:  0,
    creditsEarned: 0,
  },

  currentDay: 0,
};

// ── Save ──────────────────────────────────────

function saveGame(playerState, reputationData, contractData) {
  try {
    const ship = playerState.ship || {};

    const data = {
      version:    SAVE_VERSION,
      savedAt:    Date.now(),
      galaxySeed: playerState.galaxySeed || '4471-KETH-NULL',

      captain: {
        name: playerState.captainName,
      },

      ship: {
        name:        ship.name        || 'The Unspoken',
        class:       ship.class       || 'surveyor',
        size:        ship.size        || 'light',
        designation: ship.designation || 'Light Surveyor',
        hull:        ship.hull        ?? 100,
        hullMax:     ship.hullMax     ?? 100,
        armorBase:   ship.armorBase   ?? 10,
        powerCore:   ship.powerCore   || SAVE_DEFAULTS.ship.powerCore,
        fuel:        ship.fuel        ?? 60,
        fuelMax:     ship.fuelMax     ?? 100,
        ammoBayMax:  ship.ammoBayMax  ?? 200,
        ammoBayUsed: ship.ammoBayUsed ?? 0,
        crewMax:     ship.crewMax     ?? 4,
        crewCurrent: ship.crewCurrent ?? 1,
        subsystems:  ship.subsystems  || SAVE_DEFAULTS.ship.subsystems,
        weaponSlots: ship.weaponSlots || SAVE_DEFAULTS.ship.weaponSlots,
        utilitySlots: ship.utilitySlots || SAVE_DEFAULTS.ship.utilitySlots,
      },

      location: {
        quadrantIndex: playerState.location.quadrantIndex,
        clusterName:   playerState.location.clusterName,
        systemName:    playerState.location.systemName,
      },

      economy: {
        credits:         playerState.credits,
        veydrite:        playerState.veydrite,
        cargo:           playerState.cargo           || [],
        foldCells:       playerState.foldCells       ?? 3,
        reserveVeydrite: playerState.reserveVeydrite ?? 0,
        oreHold:         playerState.oreHold         || {},
        refinedHold:     playerState.refinedHold     || {},
        orePods:         playerState.orePods         || { solid: 0, liquid: 0 },
      },

      reputation: reputationData || {},

      contracts: {
        active:    contractData.active  || null,
        history:   contractData.history || [],
        available: [],
      },

      logs:  playerState.logs  || [],
      flags: playerState.flags || {},
      salvagedSystems: playerState.salvagedSystems || [],
      astrographics:    playerState.astrographics   || [],
      scannedSystems:   playerState.scannedSystems  || {},
      achievements:     playerState.achievements    || [],
      foldCells:        playerState.foldCells       ?? 3,
      reserveVeydrite:  playerState.reserveVeydrite ?? 0,
      galaxyConnections:   (typeof galaxy !== 'undefined' && galaxy) ? galaxy.connections    : [],
      galaxyKnownCorridors:(typeof galaxy !== 'undefined' && galaxy) ? galaxy.knownCorridors : [],


      stats: {
        jumps:         playerState.stats ? playerState.stats.jumps        : 0,
        salvages:      playerState.stats ? playerState.stats.salvages     : 0,
        daysSurvived:  playerState.currentDay,
        creditsEarned: playerState.stats ? playerState.stats.creditsEarned : 0,
      },

      currentDay: playerState.currentDay,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return { success: true, savedAt: data.savedAt };

  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Load ──────────────────────────────────────

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return deepMerge(SAVE_DEFAULTS, data);
  } catch (e) {
    console.warn('Save load failed:', e);
    return null;
  }
}

function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ── Deep merge ────────────────────────────────

function deepMerge(defaults, saved) {
  const result = Object.assign({}, defaults);
  for (const key of Object.keys(saved)) {
    if (
      saved[key] !== null &&
      typeof saved[key] === 'object' &&
      !Array.isArray(saved[key]) &&
      defaults[key] !== null &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key] || {}, saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}

// ── Apply save to playerState ─────────────────

function applySave(save, playerState, reputationObj, activeContractsArr) {
  // Identity
  playerState.captainName = save.captain.name;
  playerState.galaxySeed  = save.galaxySeed || '4471-KETH-NULL';

  // Ship — full object
  playerState.ship = save.ship;

  // Backwards compat — old saves had flat hull/fuel
  if (!playerState.ship && save.economy) {
    playerState.ship = createStartingShip(save.captain.name);
  }

  // Economy
  playerState.credits         = save.economy.credits;
  playerState.veydrite        = save.economy.veydrite;
  playerState.cargo           = save.economy.cargo           || [];
  playerState.foldCells       = save.economy.foldCells       ?? 3;
  playerState.reserveVeydrite = save.economy.reserveVeydrite ?? 0;
  playerState.oreHold         = save.economy.oreHold         || {};
  playerState.refinedHold     = save.economy.refinedHold     || {};
  playerState.orePods         = save.economy.orePods         || { solid: 0, liquid: 0 };

  // Location
  playerState.location = {
    quadrantIndex: save.location.quadrantIndex,
    clusterName:   save.location.clusterName,
    systemName:    save.location.systemName,
  };

  // Time
  playerState.currentDay = save.currentDay || 0;

  // Logs and flags
  playerState.logs  = save.logs  || [];
  playerState.flags = save.flags || {};
  playerState.salvagedSystems = save.salvagedSystems || [];
  playerState.astrographics   = save.astrographics   || [];
  playerState.scannedSystems  = save.scannedSystems  || {};
  playerState.achievements    = save.achievements    || [];
  playerState.foldCells       = save.foldCells       ?? 3;
  playerState.reserveVeydrite = save.reserveVeydrite ?? 0;
  if (save.galaxyConnections && save.galaxyConnections.length > 0 && typeof galaxy !== 'undefined' && galaxy) {
    galaxy.connections    = save.galaxyConnections;
    galaxy.knownCorridors = save.galaxyKnownCorridors || [];
  }
  playerState.stats = save.stats || {};

  // Reputation
  Object.keys(save.reputation).forEach(key => {
    reputationObj[key] = save.reputation[key];
  });

  // Contracts
  if (save.contracts.active) {
    activeContractsArr.push(save.contracts.active);
  }
}

// ── Save summary ──────────────────────────────

function renderSaveSummary(save) {
  const date    = save.savedAt ? new Date(save.savedAt) : null;
  const dateStr = date
    ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    : 'unknown';

  const ship = save.ship || {};

  return [
    '',
    '  ── SAVE FILE DETECTED ────────────────────────────────────────',
    '',
    '  Captain  : ' + save.captain.name,
    '  Vessel   : ' + (ship.name || 'Unknown') + '  (' + (ship.designation || 'Unknown class') + ')',
    '  Hull     : ' + (ship.hull || '?') + '/' + (ship.hullMax || '?'),
    '  Day      : ' + (save.currentDay || 0),
    '  Location : ' + (save.location.systemName || 'unknown'),
    '  Scrip    : ' + save.economy.credits + ' CR',
    '  Saved    : ' + dateStr,
    '',
  ].join('\n');
}
