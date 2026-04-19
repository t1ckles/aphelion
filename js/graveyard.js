// ============================================
//  APHELION — Graveyard
//  graveyard.js
//  Records pilot deaths for future use
// ============================================

const GRAVEYARD_KEY = 'aphelion_graveyard';

function recordDeath(playerState, cause) {
  try {
    const raw      = localStorage.getItem(GRAVEYARD_KEY);
    const graveyard = raw ? JSON.parse(raw) : [];

    graveyard.push({
      captainName: playerState.captainName,
      shipName:    playerState.shipName,
      shipClass:   playerState.ship,
      diedAt:      playerState.location ? playerState.location.systemName : 'unknown',
      cause:       cause,
      day:         playerState.currentDay,
      credits:     playerState.credits,
      veydrite:    playerState.veydrite,
      seed:        playerState.galaxySeed,
      timestamp:   Date.now(),
    });

    localStorage.setItem(GRAVEYARD_KEY, JSON.stringify(graveyard));
  } catch(e) {
    console.warn('Graveyard write failed:', e);
  }
}

function getGraveyard() {
  try {
    const raw = localStorage.getItem(GRAVEYARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    return [];
  }
}
