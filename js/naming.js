// ============================================
//  APHELION — Naming System
//  naming.js
//
//  Generates all names in the galaxy.
//  Every name is deterministic — same seed,
//  same name, every time.
//
//  Depends on: rng.js
// ============================================

const NAMES = {

  // ── Personal names ───────────────────────
  first_masculine: [
    'James', 'Marcus', 'Thomas', 'Elias', 'David',
    'Stefan', 'Alan', 'Paul', 'Richard', 'Michael',
    'Karl', 'Viktor', 'Dren', 'Tomas', 'Hael',
    'Jonas', 'Piet', 'Rand', 'Caspar', 'Idris'
  ],

  first_feminine: [
    'Sarah', 'Lena', 'Rachel', 'Anna', 'Elena',
    'Maria', 'Claire', 'Sophia', 'Julia', 'Katherine',
    'Mira', 'Sela', 'Dara', 'Vera', 'Nadia',
    'Petra', 'Asha', 'Renne', 'Cassia', 'Idra'
  ],

  // Pre-built compound surnames — drawn 60% of the time
  surname_compound: [
    'Calder', 'Voss', 'Korr', 'Hale', 'Marek',
    'Draven', 'Solus', 'Vey', 'Tye', 'Rennick',
    'Thorne', 'Garrick', 'Aldric', 'Solen', 'Varke',
    'Hessen', 'Drade', 'Korvak', 'Maren', 'Pelk'
  ],

  // Roots for generated surnames — used 40% of the time
  surname_root: [
    'Voss', 'Cald', 'Korr', 'Hal', 'Mar',
    'Drav', 'Sol', 'Vey', 'Tye', 'Renn',
    'Thorn', 'Garr', 'Ald', 'Var', 'Hess'
  ],

  surname_suffix: [
    'ick', 'en', 'us', 'ak', 'ek',
    'an', 'is', 'or', 'ath', 'el'
  ],

  // ── Callsigns ────────────────────────────
  callsigns: [
    'Dutch', 'Brick', 'Chief', 'Wick', 'Rook',
    'Sparrow', 'Ghost', 'Sable', 'Crow', 'Flint',
    'Slow', 'Lucky', 'Dead', 'Seven', 'Patch',
    'Grim', 'Hollow', 'Rust', 'Pale', 'Null'
  ],

  // ── Ancient place name roots ─────────────
  // Pre-collapse. Multi-syllabic. Strange.
  ancient_root: [
    'Veydris', 'Korrath', 'Hiigara', 'Thal', 'Erebus',
    'Solus', 'Gyre', 'Vexis', 'Aethon', 'Keth',
    'Narr', 'Ossian', 'Vael', 'Dross', 'Ithek',
    'Caern', 'Ulvar', 'Sheth', 'Morvak', 'Pelian'
  ],

  // ── Modern place descriptors ─────────────
  // Harsh. Functional. Named by tired people.
  harsh_condition: [
    'Dust', 'Iron', 'Scar', 'Bone', 'Ash',
    'Void', 'Dead', 'Broken', 'Dark', 'Pale',
    'Rust', 'Slag', 'Cinder', 'Grim', 'Null'
  ],

  harsh_geo: [
    'Belt', 'Rock', 'Reach', 'Field', 'Veil',
    'Shore', 'Drift', 'Yard', 'Ridge', 'Shelf',
    'Basin', 'Flats', 'Point', 'Deep', 'Run'
  ],

  // ── Spatial descriptors ──────────────────
  // Appended to ancient roots for system/sector names
  spatial: [
    'Prime', 'Drift', 'Expanse', 'Veil', 'Cluster',
    'Passage', 'Reach', 'Corridor', 'Deep', 'Null',
    'Remnant', 'Threshold', 'Margin', 'Fringe', 'Scar'
  ],

  // ── Possession words ─────────────────────
  // For possessive place names: "Calder's World"
  possession: [
    'World', 'Station', 'Reach', 'Belt', 'Claim',
    'Rock', 'Drift', 'Landing', 'Hold', 'Point',
    'Rest', 'Watch', 'Gate', 'Run', 'Post'
  ],

  // ── Bureaucratic prefixes ────────────────
  // For numbered modern installations
  bureaucratic: [
    'Transfer', 'Outpost', 'Relay', 'Station', 'Depot',
    'Freeport', 'Platform', 'Node', 'Waypoint', 'Checkpoint'
  ],

  // ── Ship name components ─────────────────
  ship_aspiration: [
    'Pride', 'Horizon', 'Reach', 'Promise', 'Fortune',
    'Hope', 'Venture', 'Future', 'Dawn', 'Claim'
  ],

  ship_endurance: [
    'Bitter', 'Iron', 'Broken', 'Last', 'Far',
    'Dead', 'Heavy', 'Dark', 'Long', 'Cold'
  ],

  ship_endurance_noun: [
    'End', 'Run', 'Watch', 'Trade', 'Passage',
    'Crossing', 'Mile', 'Haul', 'Shift', 'Burn'
  ],

  ship_function: [
    'Long Haul', 'Last Shift', 'Deep Trade', 'Station Runner',
    'Far Burn', 'Ore Runner', 'Void Passage', 'Rim Run',
    'Dust Carrier', 'Hull Forward'
  ],

  ship_prefix: [
    'UEC', 'CFV', 'ISV', 'TCV', 'ICV', 'RAS', 'VHI'
  ],

  ship_virtue: [
    'Resolute', 'Dominion', 'Integrity', 'Vanguard', 'Endurance',
    'Steadfast', 'Reckoning', 'Vigilant', 'Relentless', 'Warrant'
  ],

  // ── Corp name components ─────────────────
  corp_industry: [
    'Mercantile', 'Industries', 'Logistics', 'Combine',
    'Resources', 'Holdings', 'Colonial', 'Extraction',
    'Transit', 'Arms', 'Heavy', 'Deep Survey'
  ],

  corp_scope: [
    'United', 'Inner', 'Outer', 'Free', 'Colonial',
    'Expeditionary', 'Reclamation', 'Joint', 'Combined', 'Allied'
  ],

  corp_domain: [
    'Systems', 'Traders', 'Colonies', 'Commerce',
    'Resource', 'Transit', 'Defense', 'Operations'
  ],

  corp_authority: [
    'Command', 'Authority', 'League', 'Union',
    'Compact', 'Assembly', 'Bureau', 'Commission'
  ],

  // ── Bar and establishment names ──────────
  establishment: [
    'The Cargo Hold', 'Last Shift', 'The Depot', 'The Anchor',
    'Dry Dock', 'The Forward Mess', 'Miner\'s Rest', 'The Gyre',
    'Transfer Lounge', 'The Narrows', 'Hel\'s Gate', 'The Drift',
    'Null Point', 'The Pale', 'Void & Sons'
  ]

};

// ============================================
//  The Naming Engine
//  Call these functions to generate names.
// ============================================

const Naming = {

  // Generate a full personal name
  // gender: 'masculine', 'feminine', or 'any'
  // withCallsign: true/false (only for spacers/military)
  person(rng, gender = 'any', withCallsign = false) {
    const g = gender === 'any'
      ? rng.pick(['masculine', 'feminine'])
      : gender;

    const firstName = g === 'masculine'
      ? rng.pick(NAMES.first_masculine)
      : rng.pick(NAMES.first_feminine);

    // 60% chance of compound surname, 40% generated
    let surname;
    if (rng.chance(0.6)) {
      surname = rng.pick(NAMES.surname_compound);
    } else {
      const root = rng.pick(NAMES.surname_root);
      const suffix = rng.chance(0.4)
        ? rng.pick(NAMES.surname_suffix)
        : '';
      surname = root + suffix;
    }

    // Callsign — only sometimes, only for certain types
    let callsign = '';
    if (withCallsign && rng.chance(0.3)) {
      callsign = ` "${rng.pick(NAMES.callsigns)}"`;
    }

    return `${firstName}${callsign} ${surname}`;
  },

  // Generate a star system name
  // era: 'ancient', 'transitional', 'modern'
  starSystem(rng, era = 'ancient') {
    if (era === 'ancient') {
      // Compound-epic: Ancient root + spatial descriptor
      const root = rng.pick(NAMES.ancient_root);
      const spatial = rng.pick(NAMES.spatial);
      return `${root} ${spatial}`;
    }

    if (era === 'transitional') {
      // Possessive: Surname + possession word
      const surname = rng.pick(NAMES.surname_compound);
      const possession = rng.pick(NAMES.possession);
      return `${surname}'s ${possession}`;
    }

    // Modern: Bureaucratic + number
    const prefix = rng.pick(NAMES.bureaucratic);
    const number = rng.int(2, 99);
    return `${prefix}-${number}`;
  },

  // Generate a station name
  station(rng, era = 'modern') {
    if (era === 'ancient') {
      const root = rng.pick(NAMES.ancient_root);
      const spatial = rng.pick(['Relay', 'Station', 'Anchorage',
                                 'Platform', 'Array', 'Null']);
      return `${root} ${spatial}`;
    }

    if (era === 'transitional') {
      const surname = rng.pick(NAMES.surname_compound);
      const type = rng.pick(['Dock', 'Station', 'Port',
                               'Depot', 'Anchorage']);
      return `${surname} ${type}`;
    }

    // Modern: Bureaucratic numbered
    const prefix = rng.pick(NAMES.bureaucratic);
    const number = rng.int(2, 99);
    return `${prefix} ${number}`;
  },

  // Generate a ship name
  // register: 'personal','aspiration','function','endurance','military'
  ship(rng, register = null) {
    // If no register specified, pick one with weights
    const reg = register || rng.weighted(
      ['personal', 'aspiration', 'function', 'endurance', 'military'],
      [20, 25, 25, 20, 10]
    );

    if (reg === 'personal') {
      // A full human name — named after someone
      return Naming.person(rng, 'any', false);
    }

    if (reg === 'aspiration') {
      const surname = rng.pick(NAMES.surname_compound);
      const word = rng.pick(NAMES.ship_aspiration);
      return rng.chance(0.5)
        ? `${surname}'s ${word}`
        : `${surname} ${word}`;
    }

    if (reg === 'function') {
      const base = rng.pick(NAMES.ship_function);
      const number = rng.chance(0.4) ? ` ${rng.int(2, 99)}` : '';
      return `${base}${number}`;
    }

    if (reg === 'endurance') {
      const adj = rng.pick(NAMES.ship_endurance);
      const noun = rng.pick(NAMES.ship_endurance_noun);
      return `${adj} ${noun}`;
    }

    if (reg === 'military') {
      const prefix = rng.pick(NAMES.ship_prefix);
      const virtue = rng.pick(NAMES.ship_virtue);
      return `${prefix} ${virtue}`;
    }
  },

  // Generate a corporation name
  // archetype: 'family' or 'institutional'
  corporation(rng, archetype = null) {
    const arch = archetype || rng.pick(['family', 'institutional']);

    if (arch === 'family') {
      const surname = rng.pick(NAMES.surname_compound);
      const industry = rng.pick(NAMES.corp_industry);
      return `${surname} ${industry}`;
    }

    // Institutional
    const scope = rng.pick(NAMES.corp_scope);
    const domain = rng.pick(NAMES.corp_domain);
    const authority = rng.pick(NAMES.corp_authority);
    return `${scope} ${domain} ${authority}`;
  },

  // Generate a harsh frontier world name
  harshWorld(rng) {
    const condition = rng.pick(NAMES.harsh_condition);
    const geo = rng.pick(NAMES.harsh_geo);
    return `${condition} ${geo}`;
  },

  // Generate a bar or establishment name
  establishment(rng) {
    return rng.pick(NAMES.establishment);
  }

};