/**
 * Client-Side Chip Management System
 * Handles chip cooldowns, usage limits, and availability tracking
 */

/**
 * Compatibility Rules Configuration
 * Set STRICT_MODE = true to enforce restrictions (potential paywall feature)
 * Set STRICT_MODE = false for permissive rules (free tier)
 */
export const COMPATIBILITY_RULES = {
  STRICT_MODE: false, // Set to true to enforce restrictions below
  
  // Strict mode restrictions (disabled by default):
  PREVENT_MULTIPLIER_STACKING: false,    // If true: Can't use Wildcard + Double Down
  PREVENT_MULTIPLE_GAMEWEEK_CHIPS: false, // If true: Only one gameweek chip at a time
  MAX_CHIPS_PER_PREDICTION: null,         // If set: Limit total chips (e.g., 2)
  
  // These would apply in strict mode:
  INCOMPATIBLE_PAIRS: [
    // ['wildcard', 'doubleDown'],  // Uncomment to prevent multiplier stacking
  ],
  
  INCOMPATIBLE_SCOPES: [
    // 'gameweek',  // Uncomment to prevent multiple gameweek chips
  ]
};

/**
 * Chip Configuration with cooldown and usage rules
 */
export const CHIP_CONFIG = {
  doubleDown: {
    id: "doubleDown",
    name: "Double Down",
    type: "match",
    description: "Double all points earned from this match",
    icon: "2x",
    color: "emerald",
    cooldown: 0, // Available every gameweek - no cooldown
    seasonLimit: null, // Unlimited uses
    scope: "match" // Applied per match
  },
  wildcard: {
    id: "wildcard",
    name: "Wildcard",
    type: "match",
    description: "Triple all points earned from this match",
    icon: "3x",
    color: "purple",
    cooldown: 7, // Can't use for 7 gameweeks after usage
    seasonLimit: null, // Unlimited uses (respecting cooldown)
    scope: "match"
  },
  opportunist: {
    id: "opportunist",
    name: "Opportunist",
    type: "gameweek",
    description: "Change all predictions up to 30 min before each match kickoff",
    icon: "⏱️",
    color: "amber",
    cooldown: 0, // No cooldown
    seasonLimit: 2, // Can only use 2 times per season
    scope: "gameweek", // Applied to entire gameweek
    behavior: "rolling_deadline"
  },
  scorerFocus: {
    id: "scorerFocus",
    name: "Scorer Focus",
    type: "match",
    description: "Double all points from goalscorer predictions",
    icon: "⚽",
    color: "cyan",
    cooldown: 5, // Can't use for 5 gameweeks after usage
    seasonLimit: null,
    scope: "match"
  },
  defensePlusPlus: {
    id: "defensePlusPlus",
    name: "Defense++",
    type: "gameweek",
    description: "Earn +10 bonus points for each match where you correctly predict a clean sheet",
    icon: "🛡️",
    color: "blue",
    cooldown: 5, // Can't use for 5 gameweeks after usage
    seasonLimit: null,
    scope: "gameweek"
  },
  allInWeek: {
    id: "allInWeek",
    name: "All-In Week",
    type: "gameweek",
    description: "Double all points earned from this week's matches",
    icon: "🎯",
    color: "rose",
    cooldown: 5, // Can't use for 5 gameweeks after usage
    seasonLimit: 2, // Can only use 2 times per season
    scope: "gameweek"
  }
};

/**
 * ChipManager Class - Manages chip state client-side
 */
export class ChipManager {
  constructor(userId) {
    this.userId = userId;
    this.storageKey = `chipState_${userId}`;
    this.state = this.loadState();
  }

  /**
   * Load chip state from localStorage
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Failed to load chip state:', error);
    }

    // Initialize default state
    return {
      seasonUsage: {}, // { chipId: usageCount }
      cooldowns: {}, // { chipId: { gameweek, expiresAt } }
      lastUsed: {}, // { chipId: gameweek }
      history: [] // Array of { chipId, gameweek, matchId, timestamp }
    };
  }

  /**
   * Save chip state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('❌ Failed to save chip state:', error);
    }
  }

  /**
   * Reset chip state (for new season or testing)
   */
  resetState() {
    this.state = {
      seasonUsage: {},
      cooldowns: {},
      lastUsed: {},
      history: []
    };
    this.saveState();
    console.log('🔄 Chip state reset');
  }

  /**
   * Get chip availability for a specific gameweek
   * @param {string} chipId - Chip identifier
   * @param {number} currentGameweek - Current gameweek number
   * @returns {Object} Availability status with reason
   */
  getChipAvailability(chipId, currentGameweek) {
    const config = CHIP_CONFIG[chipId];
    if (!config) {
      return { available: false, reason: 'Unknown chip' };
    }

    // Check season limit
    if (config.seasonLimit !== null) {
      const usageCount = this.state.seasonUsage[chipId] || 0;
      if (usageCount >= config.seasonLimit) {
        return {
          available: false,
          reason: `Season limit reached (${usageCount}/${config.seasonLimit})`,
          usageCount,
          seasonLimit: config.seasonLimit
        };
      }
    }

    // Check cooldown
    if (config.cooldown > 0) {
      const cooldownInfo = this.state.cooldowns[chipId];
      if (cooldownInfo && cooldownInfo.expiresAt >= currentGameweek) {
        const remainingGameweeks = cooldownInfo.expiresAt - currentGameweek + 1;
        return {
          available: false,
          reason: `On cooldown for ${remainingGameweeks} more GW`,
          remainingGameweeks,
          cooldownExpires: cooldownInfo.expiresAt
        };
      }
    }

    return {
      available: true,
      reason: 'Available',
      usageCount: this.state.seasonUsage[chipId] || 0,
      seasonLimit: config.seasonLimit,
      remainingUses: config.seasonLimit ? config.seasonLimit - (this.state.seasonUsage[chipId] || 0) : null
    };
  }

  /**
   * Use a chip - updates usage counts and cooldowns
   * @param {string} chipId - Chip identifier
   * @param {number} gameweek - Gameweek where chip is used
   * @param {string} matchId - Match identifier (for match-scoped chips)
   * @returns {Object} Success status with updated availability
   */
  useChip(chipId, gameweek, matchId = null) {
    const availability = this.getChipAvailability(chipId, gameweek);
    
    if (!availability.available) {
      return {
        success: false,
        reason: availability.reason,
        availability
      };
    }

    const config = CHIP_CONFIG[chipId];

    // Update season usage
    this.state.seasonUsage[chipId] = (this.state.seasonUsage[chipId] || 0) + 1;

    // Update cooldown
    if (config.cooldown > 0) {
      this.state.cooldowns[chipId] = {
        gameweek,
        expiresAt: gameweek + config.cooldown
      };
    }

    // Update last used
    this.state.lastUsed[chipId] = gameweek;

    // Add to history
    this.state.history.push({
      chipId,
      gameweek,
      matchId,
      timestamp: new Date().toISOString()
    });

    this.saveState();

    console.log(`✅ Chip used: ${config.name} (GW${gameweek})`, {
      usageCount: this.state.seasonUsage[chipId],
      cooldownExpires: this.state.cooldowns[chipId]?.expiresAt
    });

    return {
      success: true,
      availability: this.getChipAvailability(chipId, gameweek + 1)
    };
  }

  /**
   * Undo chip usage (for prediction cancellation)
   * @param {string} chipId - Chip identifier
   * @param {number} gameweek - Gameweek where chip was used
   */
  undoChipUsage(chipId, gameweek) {
    // Decrease usage count
    if (this.state.seasonUsage[chipId] > 0) {
      this.state.seasonUsage[chipId]--;
    }

    // Remove cooldown if it was set for this gameweek
    if (this.state.cooldowns[chipId]?.gameweek === gameweek) {
      delete this.state.cooldowns[chipId];
    }

    // Remove from history
    this.state.history = this.state.history.filter(
      entry => !(entry.chipId === chipId && entry.gameweek === gameweek)
    );

    this.saveState();

    console.log(`↩️ Chip usage undone: ${chipId} (GW${gameweek})`);
  }

  /**
   * Get all available chips for a gameweek
   * @param {number} currentGameweek - Current gameweek number
   * @param {string} scope - Filter by scope: 'match' or 'gameweek'
   * @returns {Array} Array of available chip objects with availability info
   */
  getAvailableChips(currentGameweek, scope = null) {
    const chips = Object.values(CHIP_CONFIG);
    
    return chips
      .filter(chip => scope === null || chip.scope === scope)
      .map(chip => {
        const availability = this.getChipAvailability(chip.id, currentGameweek);
        return {
          ...chip,
          ...availability
        };
      });
  }

  /**
   * Get chip usage statistics
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    const totalChipsUsed = Object.values(this.state.seasonUsage).reduce((sum, count) => sum + count, 0);
    const chipsOnCooldown = Object.keys(this.state.cooldowns).length;
    
    return {
      totalChipsUsed,
      chipsOnCooldown,
      seasonUsage: { ...this.state.seasonUsage },
      mostUsedChip: this.getMostUsedChip(),
      recentHistory: this.state.history.slice(-10)
    };
  }

  /**
   * Get most used chip
   * @returns {Object} Most used chip with count
   */
  getMostUsedChip() {
    let maxChip = null;
    let maxCount = 0;

    for (const [chipId, count] of Object.entries(this.state.seasonUsage)) {
      if (count > maxCount) {
        maxCount = count;
        maxChip = chipId;
      }
    }

    return maxChip ? {
      chipId: maxChip,
      name: CHIP_CONFIG[maxChip].name,
      count: maxCount
    } : null;
  }

  /**
   * Check if specific chips can be used together
   * @param {Array} chipIds - Array of chip IDs to check
   * @returns {Object} Compatibility check result
   */
  checkChipCompatibility(chipIds) {
    // If not in strict mode, allow all combinations
    if (!COMPATIBILITY_RULES.STRICT_MODE) {
      return {
        compatible: true,
        reason: 'All chip combinations allowed',
        strictMode: false
      };
    }

    // STRICT MODE CHECKS (for premium/paywall features)
    
    // Check max chips limit
    if (COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION !== null) {
      if (chipIds.length > COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION) {
        return {
          compatible: false,
          reason: `Maximum ${COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION} chips per prediction`,
          conflictingChips: chipIds,
          strictMode: true
        };
      }
    }

    // Check for incompatible pairs
    if (COMPATIBILITY_RULES.PREVENT_MULTIPLIER_STACKING) {
      if (chipIds.includes('wildcard') && chipIds.includes('doubleDown')) {
        return {
          compatible: false,
          reason: 'Wildcard and Double Down cannot be used together (Premium feature)',
          conflictingChips: ['wildcard', 'doubleDown'],
          strictMode: true,
          upgradeMessage: 'Upgrade to stack multipliers!'
        };
      }
    }

    // Check for multiple gameweek chips
    if (COMPATIBILITY_RULES.PREVENT_MULTIPLE_GAMEWEEK_CHIPS) {
      const gameweekChips = chipIds.filter(id => CHIP_CONFIG[id]?.scope === 'gameweek');
      if (gameweekChips.length > 1) {
        return {
          compatible: false,
          reason: 'Cannot use multiple gameweek chips together (Premium feature)',
          conflictingChips: gameweekChips,
          strictMode: true,
          upgradeMessage: 'Upgrade to use multiple gameweek chips!'
        };
      }
    }

    // Check explicit incompatible pairs
    for (const [chip1, chip2] of COMPATIBILITY_RULES.INCOMPATIBLE_PAIRS) {
      if (chipIds.includes(chip1) && chipIds.includes(chip2)) {
        return {
          compatible: false,
          reason: `${CHIP_CONFIG[chip1]?.name} and ${CHIP_CONFIG[chip2]?.name} cannot be used together`,
          conflictingChips: [chip1, chip2],
          strictMode: true
        };
      }
    }

    return {
      compatible: true,
      reason: 'Chips can be used together',
      strictMode: true
    };
  }

  /**
   * Simulate chip usage (for prediction preview without committing)
   * @param {Array} chipIds - Chips to simulate
   * @param {number} gameweek - Target gameweek
   * @returns {Object} Simulation results
   */
  simulateChipUsage(chipIds, gameweek) {
    const results = chipIds.map(chipId => {
      const availability = this.getChipAvailability(chipId, gameweek);
      return {
        chipId,
        name: CHIP_CONFIG[chipId].name,
        ...availability
      };
    });

    const compatibility = this.checkChipCompatibility(chipIds);

    return {
      chips: results,
      compatibility,
      allAvailable: results.every(r => r.available) && compatibility.compatible
    };
  }
}

/**
 * Get chip manager instance (singleton per user)
 */
const chipManagers = new Map();

export function getChipManager(userId) {
  if (!userId) {
    throw new Error('User ID required for chip manager');
  }

  if (!chipManagers.has(userId)) {
    chipManagers.set(userId, new ChipManager(userId));
  }

  return chipManagers.get(userId);
}

/**
 * Helper function to format chip cooldown display
 */
export function formatCooldownDisplay(cooldownInfo) {
  if (!cooldownInfo || !cooldownInfo.remainingGameweeks) {
    return null;
  }

  const gw = cooldownInfo.remainingGameweeks;
  return `${gw} GW${gw > 1 ? 's' : ''}`;
}

/**
 * Helper function to format season limit display
 */
export function formatSeasonLimitDisplay(chipId, usageCount) {
  const config = CHIP_CONFIG[chipId];
  if (!config || config.seasonLimit === null) {
    return null;
  }

  const remaining = config.seasonLimit - usageCount;
  return `${remaining}/${config.seasonLimit} left`;
}

/**
 * Toggle strict mode for chip compatibility
 * Use this for premium/paywall features
 * @param {boolean} enabled - Whether to enable strict mode
 */
export function setStrictMode(enabled) {
  COMPATIBILITY_RULES.STRICT_MODE = enabled;
  console.log(`🔒 Chip strict mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  
  if (enabled) {
    console.log('   Restrictions active:');
    if (COMPATIBILITY_RULES.PREVENT_MULTIPLIER_STACKING) {
      console.log('   - Cannot stack multipliers (Wildcard + Double Down)');
    }
    if (COMPATIBILITY_RULES.PREVENT_MULTIPLE_GAMEWEEK_CHIPS) {
      console.log('   - Only one gameweek chip at a time');
    }
    if (COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION) {
      console.log(`   - Max ${COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION} chips per prediction`);
    }
  } else {
    console.log('   ✅ All chip combinations allowed');
  }
}

/**
 * Enable premium chip restrictions (for paywall)
 */
export function enablePremiumRestrictions() {
  COMPATIBILITY_RULES.STRICT_MODE = true;
  COMPATIBILITY_RULES.PREVENT_MULTIPLIER_STACKING = true;
  COMPATIBILITY_RULES.PREVENT_MULTIPLE_GAMEWEEK_CHIPS = true;
  COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION = 2;
  
  console.log('💎 Premium chip restrictions enabled');
}

/**
 * Disable all restrictions (free tier)
 */
export function disablePremiumRestrictions() {
  COMPATIBILITY_RULES.STRICT_MODE = false;
  COMPATIBILITY_RULES.PREVENT_MULTIPLIER_STACKING = false;
  COMPATIBILITY_RULES.PREVENT_MULTIPLE_GAMEWEEK_CHIPS = false;
  COMPATIBILITY_RULES.MAX_CHIPS_PER_PREDICTION = null;
  
  console.log('🆓 Free tier - all chip combinations allowed');
}

/**
 * Export all chip IDs for convenience
 */
export const CHIP_IDS = Object.keys(CHIP_CONFIG);

export default ChipManager;
