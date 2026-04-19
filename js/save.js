// ============================================
//  APHELION — Save / Load System
//  save.js
//  Stage 10: Persistence
// ============================================

const SAVE_KEY     = 'aphelion_save';
const SAVE_VERSION = 3;

// ── Defaults ──────────────────────────────────
// Used when loading an old save missing new fields

const SAVE_DEFAULTS = {
  version:    SAVE_VERSION,
  savedAt:    null,
  captain: {
    name:     'Unknown',
  },
  ship: {
    name:     'The Unspoken',
    class:    'Wayward-class Prospector',
    hull:     80,
    fuel:     60,
    jumpDrive: 'NOMINAL',
    upgrades:  [],         // future: installed upgrades
  },
  location: {
    quadrantIndex: 0,
    clusterName:   null,
    systemName:    null,
  },
  economy: {
    credits:  200,
    veydrite: 0,
    cargo:    [],          // future: typed cargo [{type, amount, origin, value}]
  },
  reputation: {},          // factionKey: score
  contracts: {
    active:    null,
    history:   [],         // future: completed/failed contract records
    available: [],
  },
  logs:  [],               // recovered beacons and ruin fragments
  flags: {},               // future: story flags, xeno events, discoveries
  stats: {                 // future: lifetime statistics
    jumps:      0,
    salvages:   0,
    daysSurvived: 0,
    creditsEarned: 0,
  },
  currentDay: 0,
};

// ── Save ──────────────────────────────────────

function saveGame(playerState, reputationData, contractData) {
  try {
    const data = {
      version: SAVE_VERSION,
      savedAt: Date.now(),

      captain: {
        name: playerState.captainName,
      },

      ship: {
        name:      playerState.shipName,
        class:     playerState.ship,
        hull:      playerState.hull,
        fuel:      playerState.fuel,
        jumpDrive: 'NOMINAL',
        upgrades:  [],
      },

      location: {
        quadrantIndex: playerState.location.quadrantIndex,
        clusterName:   playerState.location.clusterName,
        systemName:    playerState.location.systemName,
      },

      economy: {
        credits:  playerState.credits,
        veydrite: playerState.veydrite,
        cargo:    playerState.cargo || [],
      },

      reputation: reputationData || {},

      contracts: {
        active:    contractData.active    || null,
        history:   contractData.history   || [],
        available: contractData.available || [],
      },

      logs:  playerState.logs  || [],
      flags: playerState.flags || {},

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

    // Merge with defaults so missing fields get safe values
    const save = deepMerge(SAVE_DEFAULTS, data);
    return save;

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
// Merges saved data over defaults.
// Missing keys in save get default values.
// Extra keys in save are preserved for forward compat.

function deepMerge(defaults, saved) {
  const result = Object.assign({}, defaults);
  for (const key of Object.keys(saved)) {
    if (
      saved[key] !== null &&
      typeof saved[key] === 'object' &&
      !Array.isArray(saved[key]) &&
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
  playerState.shipName    = save.ship.name;
  playerState.ship        = save.ship.class;
  playerState.hull        = save.ship.hull;
  playerState.fuel        = save.ship.fuel;

  // Economy
  playerState.credits  = save.economy.credits;
  playerState.veydrite = save.economy.veydrite;
  playerState.cargo    = save.economy.cargo || [];

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

  // Stats
  playerState.stats = save.stats || {};

  // Reputation — copy into the live reputation object
  Object.keys(save.reputation).forEach(key => {
    reputationObj[key] = save.reputation[key];
  });

  // Contracts
  if (save.contracts.active) {
    activeContractsArr.push(save.contracts.active);
  }
}

// ── Save summary for display ──────────────────

function renderSaveSummary(save) {
  const date    = save.savedAt ? new Date(save.savedAt) : null;
  const dateStr = date
    ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    : 'unknown';

  return [
    '',
    '  ── SAVE FILE DETECTED ────────────────────────────────────────',
    '',
    '  Captain  : ' + save.captain.name,
    '  Vessel   : ' + save.ship.name + '  (' + save.ship.class + ')',
    '  Day      : ' + (save.currentDay || 0),
    '  Location : ' + (save.location.systemName || 'unknown'),
    '  Scrip    : ' + save.economy.credits + ' CR',
    '  Saved    : ' + dateStr,
    '',
  ].join('\n');
}
