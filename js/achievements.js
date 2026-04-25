// ============================================
//  APHELION — Achievement Engine
//  achievements.js
// ============================================

// ── Definitions ───────────────────────────────

const ACHIEVEMENT_DEFS = {

  // ── Milestones ──────────────────────────────
  first_dock: {
    category: 'Operations',
    title:    'First Berth Secured',
    detail:   'Initial docking operation logged. Guild network access confirmed.',
  },
  first_salvage: {
    category: 'Operations',
    title:    'Salvage Operations Commenced',
    detail:   'First field salvage operation conducted. Harrow unit activated.',
  },
  first_contract: {
    category: 'Operations',
    title:    'Contract Registry Entry',
    detail:   'First contract accepted from a faction bulletin board.',
  },
  first_contract_complete: {
    category: 'Operations',
    title:    'Contract Fulfilled',
    detail:   'First contract completed and payment received.',
  },
  first_contract_speed: {
    category: 'Operations',
    title:    'Ahead of Schedule',
    detail:   'Contract completed within 60% of the allotted time. Speed bonus applied.',
  },
  contract_abandoned: {
    category: 'Operations',
    title:    'Contract Abandoned',
    detail:   'A contract was abandoned. Reputation penalty applied. Guild notation made.',
  },
  contracts_completed_5: {
    category: 'Operations',
    title:    'Five Contracts Fulfilled',
    detail:   'Cumulative contract record: 5 completed.',
  },
  contracts_completed_10: {
    category: 'Operations',
    title:    'Ten Contracts Fulfilled',
    detail:   'Cumulative contract record: 10 completed.',
  },
  contracts_completed_25: {
    category: 'Operations',
    title:    'Twenty-Five Contracts Fulfilled',
    detail:   'Cumulative contract record: 25 completed. Noted by the Guild.',
  },

  // ── Additional Milestones ──────────────────────────────
  first_refuel: {
    category: 'Operations',
    title:    'Fuel Transfer Logged',
    detail:   'First refueling operation completed. Fuel management protocols initialized.',
  },
  first_repair: {
    category: 'Operations',
    title:    'Repair Bay Entry',
    detail:   'First vessel repair conducted at a registered station facility.',
  },
  first_trade: {
    category: 'Operations',
    title:    'Cargo Exchange Initiated',
    detail:   'First cargo trade transaction processed. Merchant registry access confirmed.',
  },
  contracts_completed_50: {
    category: 'Operations',
    title:    'Fifty Contracts Fulfilled',
    detail:   'Cumulative contract record: 50 completed. Veteran operator status recognized.',
  },
  contracts_completed_100: {
    category: 'Operations',
    title:    'One Hundred Contracts Fulfilled',
    detail:   'Cumulative contract record: 100 completed. Elite contractor designation awarded.',
  },
  contract_perfect_streak_5: {
    category: 'Operations',
    title:    'Five Contracts — No Failures',
    detail:   'Five consecutive contracts completed without abandonment. Reliability noted.',
  },
  contract_perfect_streak_10: {
    category: 'Operations',
    title:    'Ten Contracts — No Failures',
    detail:   'Ten consecutive contracts completed without abandonment. Exemplary record.',
  },
  multi_contract_active: {
    category: 'Operations',
    title:    'Parallel Operations',
    detail:   'Multiple contracts accepted simultaneously. Resource management protocols active.',
  },
  first_undock: {
    category: 'Operations',
    title:    'Departure Clearance Granted',
    detail:   'First undocking maneuver completed. Navigation systems operational.',
  },

  // ── Exploration ─────────────────────────────
  first_deepscan: {
    category: 'Survey',
    title:    'Deep Survey Initiated',
    detail:   'First astrographic deep scan conducted. Data entered into memory matrix.',
  },
  first_cluster_sweep: {
    category: 'Survey',
    title:    'Cluster Survey Conducted',
    detail:   'First full cluster sweep completed. Multi-system astrographic record established.',
  },
  systems_charted_5: {
    category: 'Survey',
    title:    'Five Systems Charted',
    detail:   'Astrographic record: 5 systems surveyed to deep scan standard.',
  },
  systems_charted_10: {
    category: 'Survey',
    title:    'Ten Systems Charted',
    detail:   'Astrographic record: 10 systems surveyed to deep scan standard.',
  },
  systems_charted_25: {
    category: 'Survey',
    title:    'Twenty-Five Systems Charted',
    detail:   'Astrographic record: 25 systems. Guild data archive contribution noted.',
  },
  systems_charted_50: {
    category: 'Survey',
    title:    'Fifty Systems Charted',
    detail:   'Astrographic record: 50 systems. Significant cartographic contribution.',
  },
  first_astro_sale: {
    category: 'Survey',
    title:    'Astrographic Data Transferred',
    detail:   'First sale of astrographic data to the Assayer\'s Guild. Memory matrix partially cleared.',
  },
  xeno_system_visited: {
    category: 'Survey',
    title:    'Anomalous Reading Logged',
    detail:   'Vessel entered a system flagged for anomalous sensor returns. No further notation.',
  },
  
  // ── Additional Exploration ─────────────────────────
  systems_charted_75: {
    category: 'Survey',
    title:    'Seventy-Five Systems Charted',
    detail:   'Astrographic record: 75 systems. Extensive survey operations confirmed.',
  },
  systems_charted_100: {
    category: 'Survey',
    title:    'One Hundred Systems Charted',
    detail:   'Astrographic record: 100 systems. Master cartographer designation.',
  },
  first_moon_surveyed: {
    category: 'Survey',
    title:    'Lunar Body Scanned',
    detail:   'First planetary moon surveyed. Satellite formation data recorded.',
  },
  first_asteroid_scanned: {
    category: 'Survey',
    title:    'Asteroid Field Entry',
    detail:   'First asteroid belt body scanned. Dense field navigation logged.',
  },
  cluster_complete_survey: {
    category: 'Survey',
    title:    'Complete Cluster Mapping',
    detail:   'All systems within a cluster surveyed to deep scan standard. Comprehensive archive.',
  },
  rare_body_discovered: {
    category: 'Survey',
    title:    'Unusual Composition Detected',
    detail:   'Survey detected body with anomalous spectral signature. Data flagged for review.',
  },
  deep_space_survey: {
    category: 'Survey',
    title:    'Void Crossing Survey',
    detail:   'Astrographic data collected during extended inter-cluster transit.',
  },
  astro_sales_5: {
    category: 'Survey',
    title:    'Five Data Transfers',
    detail:   'Five astrographic data packages sold to Guild archives.',
  },
  astro_sales_25: {
    category: 'Survey',
    title:    'Twenty-Five Data Transfers',
    detail:   'Twenty-five astrographic data packages sold. Significant archive contributor.',
  },

  // ── Reputation ──────────────────────────────
  faction_trusted_guild: {
    category: 'Standing',
    title:    'Guild: Trusted',
    detail:   'Standing with the Assayer\'s Guild elevated to TRUSTED. Preferential rates apply.',
  },
  faction_trusted_pelk: {
    category: 'Standing',
    title:    'Pelk Logistics: Trusted',
    detail:   'Standing with Pelk Logistics elevated to TRUSTED.',
  },
  faction_trusted_colonial: {
    category: 'Standing',
    title:    'CCC: Trusted',
    detail:   'Standing with Colonial Colonies Command elevated to TRUSTED.',
  },
  faction_trusted_feral: {
    category: 'Standing',
    title:    'Feral Network: Trusted',
    detail:   'Standing with Feral settlements elevated to TRUSTED. This is not on record.',
  },
  faction_trusted_independent: {
    category: 'Standing',
    title:    'Independent Operators: Trusted',
    detail:   'Standing with Independent operators elevated to TRUSTED.',
  },
  faction_hostile_guild: {
    category: 'Standing',
    title:    'Guild: Hostile',
    detail:   'Standing with the Assayer\'s Guild degraded to HOSTILE. Docking refused at Guild stations.',
  },
  faction_hostile_pelk: {
    category: 'Standing',
    title:    'Pelk Logistics: Hostile',
    detail:   'Standing with Pelk Logistics degraded to HOSTILE.',
  },
  faction_hostile_colonial: {
    category: 'Standing',
    title:    'CCC: Hostile',
    detail:   'Standing with Colonial Colonies Command degraded to HOSTILE. Patrol vessels will engage.',
  },
  faction_hostile_feral: {
    category: 'Standing',
    title:    'Feral Network: Hostile',
    detail:   'Standing with Feral settlements degraded to HOSTILE.',
  },
  
  // ── Additional Reputation ──────────────────────────
  faction_allied_guild: {
    category: 'Standing',
    title:    'Guild: Allied',
    detail:   'Standing with the Assayer\\'s Guild elevated to ALLIED. Priority access granted.',
  },
  faction_allied_pelk: {
    category: 'Standing',
    title:    'Pelk Logistics: Allied',
    detail:   'Standing with Pelk Logistics elevated to ALLIED. Enhanced contract availability.',
  },
  faction_allied_colonial: {
    category: 'Standing',
    title:    'CCC: Allied',
    detail:   'Standing with Colonial Colonies Command elevated to ALLIED. Military cooperation authorized.',
  },
  faction_allied_feral: {
    category: 'Standing',
    title:    'Feral Network: Allied',
    detail:   'Standing with Feral settlements elevated to ALLIED. Deep network access confirmed.',
  },
  faction_allied_independent: {
    category: 'Standing',
    title:    'Independent Operators: Allied',
    detail:   'Standing with Independent operators elevated to ALLIED. Mutual aid protocols active.',
  },
  faction_neutral_restored: {
    category: 'Standing',
    title:    'Standing Restored',
    detail:   'Previously degraded faction standing returned to NEUTRAL status.',
  },
  reputation_balanced: {
    category: 'Standing',
    title:    'Diplomatic Balance',
    detail:   'Neutral or better standing maintained with all major factions simultaneously.',
  },
  reputation_pariah: {
    category: 'Standing',
    title:    'Marked Vessel',
    detail:   'Hostile standing with multiple factions. Safe harbor options severely limited.',
  },
  faction_rep_maxed: {
    category: 'Standing',
    title:    'Maximum Standing Achieved',
    detail:   'Reputation with a faction elevated to maximum possible level.',
  },

  // ── Combat ──────────────────────────────────
  first_kill: {
    category: 'Combat',
    title:    'First Vessel Destroyed',
    detail:   'First confirmed enemy vessel destruction on record.',
  },
  survived_critical_hull: {
    category: 'Combat',
    title:    'Hull Breach — Survived',
    detail:   'Vessel survived combat with hull integrity below 20%. Structural assessment recommended.',
  },
  survived_unknown: {
    category: 'Combat',
    title:    'Unknown Contact — Survived',
    detail:   'Vessel survived engagement with an unregistered contact of unknown classification.',
  },
  enemy_destroyed_feral: {
    category: 'Combat',
    title:    'Feral Vessel Destroyed',
    detail:   'Feral raider vessel confirmed destroyed.',
  },
  enemy_destroyed_pirate: {
    category: 'Combat',
    title:    'Pirate Vessel Destroyed',
    detail:   'Unregistered pirate vessel confirmed destroyed.',
  },
  enemy_destroyed_patrol: {
    category: 'Combat',
    title:    'Faction Patrol Destroyed',
    detail:   'Faction patrol vessel confirmed destroyed. Diplomatic consequences likely.',
  },
  enemy_destroyed_unknown: {
    category: 'Combat',
    title:    'Unknown Vessel Destroyed',
    detail:   'Unclassified contact confirmed destroyed. No registry match on record.',
  },

// ── Additional Combat ──────────────────────────────
  kills_5: {
    category: 'Combat',
    title:    'Five Confirmed Kills',
    detail:   'Five enemy vessels confirmed destroyed. Combat effectiveness noted.',
  },
  kills_10: {
    category: 'Combat',
    title:    'Ten Confirmed Kills',
    detail:   'Ten enemy vessels confirmed destroyed. Veteran combatant status.',
  },
  kills_25: {
    category: 'Combat',
    title:    'Twenty-Five Confirmed Kills',
    detail:   'Twenty-five enemy vessels confirmed destroyed. Ace designation considered.',
  },
  first_weapon_upgrade: {
    category: 'Combat',
    title:    'Arsenal Enhanced',
    detail:   'First weapons system upgrade installed. Offensive capability increased.',
  },
  survived_outnumbered: {
    category: 'Combat',
    title:    'Multiple Hostiles — Survived',
    detail:   'Vessel survived engagement against numerically superior enemy force.',
  },
  combat_no_damage: {
    category: 'Combat',
    title:    'Flawless Engagement',
    detail:   'Enemy vessel destroyed with zero hull damage sustained.',
  },
  combat_retreat: {
    category: 'Combat',
    title:    'Tactical Withdrawal',
    detail:   'Successfully escaped from hostile engagement. Discretion protocols engaged.',
  },
  ambush_survived: {
    category: 'Combat',
    title:    'Ambush — Survived',
    detail:   'Vessel survived surprise attack. Sensor protocols updated.',
  },
  weapon_system_destroyed: {
    category: 'Combat',
    title:    'Weapon System Critical Failure',
    detail:   'Primary weapons system destroyed in combat. Backup protocols engaged.',
  },

  // ── Economic ────────────────────────────────
  first_veydrite_sale: {
    category: 'Economic',
    title:    'Veydrite Sale Recorded',
    detail:   'First veydrite sale processed through Guild assessment terminal.',
  },
  scrip_1000: {
    category: 'Economic',
    title:    'Scrip Reserve: 1,000 CR',
    detail:   'Liquid scrip holdings reached 1,000 CR.',
  },
  scrip_5000: {
    category: 'Economic',
    title:    'Scrip Reserve: 5,000 CR',
    detail:   'Liquid scrip holdings reached 5,000 CR.',
  },
  scrip_10000: {
    category: 'Economic',
    title:    'Scrip Reserve: 10,000 CR',
    detail:   'Liquid scrip holdings reached 10,000 CR. Noted.',
  },
  veydrite_sold_100: {
    category: 'Economic',
    title:    'Veydrite Volume: 100 kg',
    detail:   'Cumulative veydrite sold: 100 kg.',
  },
  veydrite_sold_500: {
    category: 'Economic',
    title:    'Veydrite Volume: 500 kg',
    detail:   'Cumulative veydrite sold: 500 kg. Significant extraction record.',
  },

// ── Additional Economic ────────────────────────────
  scrip_25000: {
    category: 'Economic',
    title:    'Scrip Reserve: 25,000 CR',
    detail:   'Liquid scrip holdings reached 25,000 CR. Substantial capital reserves.',
  },
  scrip_50000: {
    category: 'Economic',
    title:    'Scrip Reserve: 50,000 CR',
    detail:   'Liquid scrip holdings reached 50,000 CR. Fleet expansion capital available.',
  },
  veydrite_sold_1000: {
    category: 'Economic',
    title:    'Veydrite Volume: 1,000 kg',
    detail:   'Cumulative veydrite sold: 1,000 kg. Major extraction operation confirmed.',
  },
  first_cargo_full: {
    category: 'Economic',
    title:    'Hold Capacity Reached',
    detail:   'Cargo hold filled to maximum capacity for first time.',
  },
  trade_profit_high: {
    category: 'Economic',
    title:    'Profitable Exchange',
    detail:   'Trade transaction completed with exceptional profit margin.',
  },
  equipment_purchased: {
    category: 'Economic',
    title:    'Equipment Acquisition',
    detail:   'First major equipment purchase made. Operational capability enhanced.',
  },
  hull_upgraded: {
    category: 'Economic',
    title:    'Hull Upgrade Installed',
    detail:   'Vessel hull class upgraded. Increased capacity and durability.',
  },
  went_bankrupt: {
    category: 'Economic',
    title:    'Financial Insolvency',
    detail:   'Scrip reserves depleted to zero. Emergency credit protocols initiated.',
  },
  resource_stockpile: {
    category: 'Economic',
    title:    'Resource Reserves Established',
    detail:   'Significant quantities of fuel and supplies stockpiled for extended operations.',
  },

  // ── Survival ────────────────────────────────
  days_survived_10: {
    category: 'Survival',
    title:    'Ten Days in the Field',
    detail:   'Vessel operational for 10 standard days.',
  },
  days_survived_25: {
    category: 'Survival',
    title:    'Twenty-Five Days in the Field',
    detail:   'Vessel operational for 25 standard days.',
  },
  days_survived_50: {
    category: 'Survival',
    title:    'Fifty Days in the Field',
    detail:   'Vessel operational for 50 standard days.',
  },
  days_survived_100: {
    category: 'Survival',
    title:    'One Hundred Days in the Field',
    detail:   'Vessel operational for 100 standard days. Long-haul record.',
  },
};

// ── Additional Survival ────────────────────────────
  days_survived_150: {
    category: 'Survival',
    title:    'One Hundred Fifty Days in the Field',
    detail:   'Vessel operational for 150 standard days. Extended deployment record.',
  },
  days_survived_200: {
    category: 'Survival',
    title:    'Two Hundred Days in the Field',
    detail:   'Vessel operational for 200 standard days. Endurance operations specialist.',
  },
  days_survived_365: {
    category: 'Survival',
    title:    'One Full Year Operational',
    detail:   'Vessel operational for 365 standard days. Annual operations milestone.',
  },
  hull_zero_survived: {
    category: 'Survival',
    title:    'Structural Failure — Survived',
    detail:   'Vessel hull integrity reached critical failure threshold but maintained cohesion.',
  },
  fuel_emergency: {
    category: 'Survival',
    title:    'Fuel Reserves Critical',
    detail:   'Fuel reserves depleted to emergency levels. Priority refueling conducted.',
  },
  long_drift: {
    category: 'Survival',
    title:    'Extended Drift Period',
    detail:   'Vessel remained in deep space without docking for extended period.',
  },
  death_avoided: {
    category: 'Survival',
    title:    'Near-Death Experience',
    detail:   'Pilot survived circumstances that would typically result in casualty.',
  },
  system_failure_survived: {
    category: 'Survival',
    title:    'Critical System Failure — Survived',
    detail:   'Major ship system failed but emergency protocols maintained vessel integrity.',
  },
  quarantine_survived: {
    category: 'Survival',
    title:    'Quarantine Period Completed',
    detail:   'Vessel completed mandatory quarantine period at frontier installation.',
  },

// ── Award function ────────────────────────────

function awardAchievement(id, playerState, extraDetail) {
  if (!playerState.achievements) playerState.achievements = [];

  // Don't award duplicates
  if (playerState.achievements.some(a => a.id === id)) return null;

  const def = ACHIEVEMENT_DEFS[id];
  if (!def) return null;

  const detail = extraDetail
    ? def.detail + ' ' + extraDetail
    : def.detail;

  const entry = {
    id,
    category:  def.category,
    title:     def.title,
    detail,
    day:       playerState.currentDay,
    timestamp: Date.now(),
  };

  playerState.achievements.push(entry);
  return entry;
}

// ── Check helpers ─────────────────────────────

function checkAchievements(playerState, context) {
  const awarded = [];

  function award(id, extra) {
    const result = awardAchievement(id, playerState, extra);
    if (result) awarded.push(result);
  }

  const achievements = playerState.achievements || [];
  const stats        = playerState.stats        || {};

  // Survival milestones
  const day = playerState.currentDay;
  if (day >= 10)  award('days_survived_10');
  if (day >= 25)  award('days_survived_25');
  if (day >= 50)  award('days_survived_50');
  if (day >= 100) award('days_survived_100');

  // Scrip milestones
  const cr = playerState.credits || 0;
  if (cr >= 1000)  award('scrip_1000');
  if (cr >= 5000)  award('scrip_5000');
  if (cr >= 10000) award('scrip_10000');

  // Charted systems
  const charted = (playerState.astrographics || []).filter(a => a.quality === 'deep').length;
  if (charted >= 5)  award('systems_charted_5');
  if (charted >= 10) award('systems_charted_10');
  if (charted >= 25) award('systems_charted_25');
  if (charted >= 50) award('systems_charted_50');

  // Contracts completed
  const completed = stats.contractsCompleted || 0;
  if (completed >= 5)  award('contracts_completed_5');
  if (completed >= 10) award('contracts_completed_10');
  if (completed >= 25) award('contracts_completed_25');

  // Context-specific checks
  if (context) {
    if (context.type === 'dock' && !achievements.some(a => a.id === 'first_dock')) {
      award('first_dock');
    }
    if (context.type === 'salvage' && !achievements.some(a => a.id === 'first_salvage')) {
      award('first_salvage');
    }
    if (context.type === 'contract_accepted' && !achievements.some(a => a.id === 'first_contract')) {
      award('first_contract');
    }
    if (context.type === 'contract_complete') {
      if (!achievements.some(a => a.id === 'first_contract_complete')) award('first_contract_complete');
      if (context.fast && !achievements.some(a => a.id === 'first_contract_speed')) award('first_contract_speed');
    }
    if (context.type === 'contract_abandoned') {
      award('contract_abandoned');
    }
    if (context.type === 'deepscan' && !achievements.some(a => a.id === 'first_deepscan')) {
      award('first_deepscan', 'System: ' + context.systemName + '.');
    }
    if (context.type === 'cluster_sweep' && !achievements.some(a => a.id === 'first_cluster_sweep')) {
      award('first_cluster_sweep', 'Cluster: ' + context.clusterName + '.');
    }
    if (context.type === 'astro_sale' && !achievements.some(a => a.id === 'first_astro_sale')) {
      award('first_astro_sale');
    }
    if (context.type === 'veydrite_sale') {
      if (!achievements.some(a => a.id === 'first_veydrite_sale')) award('first_veydrite_sale');
      const totalSold = (stats.veydriteSold || 0);
      if (totalSold >= 100) award('veydrite_sold_100');
      if (totalSold >= 500) award('veydrite_sold_500');
    }
    if (context.type === 'kill') {
      if (!achievements.some(a => a.id === 'first_kill')) {
        award('first_kill', 'Vessel class: ' + context.enemyClass + '.');
      }
      const killId = 'enemy_destroyed_' + context.attackerKey;
      if (ACHIEVEMENT_DEFS[killId]) award(killId);
    }
    if (context.type === 'survived_combat') {
      if (context.hullPct < 20) award('survived_critical_hull');
      if (context.attackerKey === 'unknown') award('survived_unknown');
    }
    if (context.type === 'rep_change') {
      const key    = context.factionKey;
      const tier   = context.tier;
      if (tier === 'TRUSTED') {
        const achId = 'faction_trusted_' + key;
        if (ACHIEVEMENT_DEFS[achId]) award(achId);
      }
      if (tier === 'HOSTILE') {
        const achId = 'faction_hostile_' + key;
        if (ACHIEVEMENT_DEFS[achId]) award(achId);
      }
    }
    if (context.type === 'xeno_system') {
      award('xeno_system_visited');
    }
  }

  return awarded;
}

// ── Render ────────────────────────────────────

function renderAchievements(playerState) {
  const achievements = playerState.achievements || [];

  if (achievements.length === 0) {
    return [
      '',
      '  ── GUILD RECORD ARCHIVE ──────────────────────────────────────',
      '',
      '  No entries on record.',
      '  The archive updates as operations are conducted.',
      '',
    ].join('\n');
  }

  // Group by category
  const grouped = {};
  achievements.forEach(a => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  const lines = [
    '',
    '  ── GUILD RECORD ARCHIVE ──────────────────────────────────────',
    '',
    '  ' + achievements.length + ' record(s) on file.',
    '',
  ];

  Object.keys(grouped).forEach(cat => {
    lines.push('  ── ' + cat.toUpperCase() + ' ' + '─'.repeat(Math.max(0, 52 - cat.length)));
    lines.push('');
    grouped[cat].forEach(a => {
      lines.push('  [Day ' + String(a.day).padEnd(4) + ']  ' + a.title);
      lines.push('           ' + a.detail);
      lines.push('');
    });
  });

  return lines.join('\n');
}
