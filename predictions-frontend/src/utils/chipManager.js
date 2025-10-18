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
    description: "Double all points earned from one selected match",
    icon: "2x",
    color: "teal",
    cooldown: 0, // Available every gameweek - no cooldown
    seasonLimit: null, // Unlimited uses
    scope: "match" // Applied per match
  },
  wildcard: {
    id: "wildcard",
    name: "Wildcard",
    type: "match",
    description: "Triple all points earned from one selected match",
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
    description: "Change all predictions up to 30 minutes before each match kicks off",
    icon: "⏱️",
    color: "amber",
    cooldown: 0, // No cooldown
    seasonLimit: 2, // Can only use 2 times per season
    scope: "gameweek", // Applied to entire gameweek
    behavior: "rolling_deadline" // Can change predictions before each match individually
  },
  scorerFocus: {
    id: "scorerFocus",
    name: "Scorer Focus",
    type: "match",
    description: "Doubles all points from goalscorer predictions in one match",
    icon: "⚽",
    color: "green",
    cooldown: 5, // Can't use for 5 gameweeks after usage
    seasonLimit: null,
    scope: "match"
  },
  defensePlusPlus: {
    id: "defensePlusPlus",
    name: "Defense++",
    type: "gameweek",
    description: "Earn 10 bonus points if you correctly predict clean sheets across all matches where you predicted them",
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
    description: "Doubles the entire gameweek score (including deductions)",
    icon: "🎯",
    color: "red",
    cooldown: 0, // No cooldown
    seasonLimit: 4, // Can only use 4 times per season
    scope: "gameweek"
  }
};

import { chipAPI } from '../services/api/chipAPI';

/**
 * ChipManager Class - Backend-driven chip state management
 * NOW A THIN WRAPPER around chipAPI.js
 */
export class ChipManager {
  constructor(userId) {
    this.userId = userId;
    this.cachedState = null; // Local cache of backend state
    this.lastFetch = null; // Timestamp of last fetch
    this.cacheTimeout = 30000; // 30 seconds
  }

  /**
   * Fetch chip state from backend
   * @returns {Promise<Object>} Chip state from server
   */
  async fetchState() {
    const now = Date.now();
    
    // Return cached state if still valid
    if (this.cachedState && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      return this.cachedState;
    }

    try {
      const result = await chipAPI.getChipStatus();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch chip state');
      }

      this.cachedState = result.data;
      this.lastFetch = now;
      
      return this.cachedState;
    } catch (error) {
      console.error('❌ Failed to fetch chip state:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache to force fresh fetch
   */
  invalidateCache() {
    this.cachedState = null;
    this.lastFetch = null;
    console.log('🔄 Chip cache invalidated');
  }

  /**
   * Clear chip state (for logout)
   */
  clearState() {
    this.invalidateCache();
    console.log('🗑️ Chip state cleared');
  }

  /**
   * Get chip availability for a specific gameweek
   * @param {string} chipId - Chip identifier
   * @param {number} currentGameweek - Current gameweek number (optional - uses backend's current GW)
   * @returns {Promise<Object>} Availability status with reason
   */
  async getChipAvailability(chipId, currentGameweek = null) {
    try {
      const state = await this.fetchState();
      const chip = state.chips.find(c => c.chipId === chipId);
      
      if (!chip) {
        return { available: false, reason: 'Unknown chip' };
      }

      return {
        available: chip.available,
        reason: chip.available ? 'Available' : chip.reason || 'Unavailable',
        usageCount: chip.usageCount,
        seasonLimit: chip.seasonLimit,
        remainingUses: chip.remainingUses,
        cooldownExpires: chip.cooldownExpires,
        remainingGameweeks: chip.remainingGameweeks
      };
    } catch (error) {
      console.error('❌ getChipAvailability error:', error);
      return { available: false, reason: 'Error fetching chip data' };
    }
  }

  /**
   * Use a chip - records usage via backend
   * @deprecated Backend now handles chip validation and recording automatically.
   * Use the prediction submission API with chipIds in the payload instead.
   * @param {string} chipId - Chip identifier
   * @param {number} gameweek - Gameweek where chip is used
   * @param {string} matchId - Match identifier (for match-scoped chips)
   * @param {string} predictionId - Prediction ID from backend
   * @returns {Promise<Object>} Success status with updated availability
   */
  async useChip(chipId, gameweek, matchId = null, predictionId) {
    console.warn('⚠️ chipManager.useChip() is deprecated. Backend handles chip recording automatically.');
    console.warn('   Include chipIds in prediction submission payload instead.');
    
    return {
      success: false,
      reason: 'This method is deprecated. Backend handles chip recording automatically.',
      deprecated: true
    };

    /* DEPRECATED CODE - Backend now handles validation and recording
    try {
      // Validate chips first
      const validation = await chipAPI.validateChips([chipId], gameweek, matchId);
      
      if (!validation.success || !validation.data.valid) {
        return {
          success: false,
          reason: validation.data?.conflicts?.[0]?.message || 'Chip validation failed',
          conflicts: validation.data?.conflicts
        };
      }

      // Record usage
      const result = await chipAPI.recordChipUsage(predictionId, [chipId], gameweek, matchId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to record chip usage');
      }

      // Invalidate cache to force refresh
      this.invalidateCache();

      console.log(`✅ Chip used: ${chipId} (GW${gameweek})`, result.data);

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ useChip error:', error);
      return {
        success: false,
        reason: error.message
      };
    }
    */
  }

  /**
   * Undo chip usage (for prediction cancellation)
   * @deprecated Backend handles this when prediction is deleted
   * @param {string} chipId - Chip identifier
   * @param {number} gameweek - Gameweek where chip was used
   */
  async undoChipUsage(chipId, gameweek) {
    console.warn('⚠️ undoChipUsage is deprecated. Backend handles this when prediction is deleted.');
    this.invalidateCache();
  }

  /**
   * Get all available chips for a gameweek
   * @param {number} currentGameweek - Current gameweek number (optional)
   * @param {string} scope - Filter by scope: 'match' or 'gameweek'
   * @returns {Promise<Array>} Array of available chip objects with availability info
   */
  async getAvailableChips(currentGameweek = null, scope = null) {
    try {
      const state = await this.fetchState();
      
      let chips = state.chips || [];
      
      // Filter by scope if specified
      if (scope) {
        chips = chips.filter(chip => chip.scope === scope);
      }
      
      return chips;
    } catch (error) {
      console.error('❌ getAvailableChips error:', error);
      return [];
    }
  }

  /**
   * Get chip usage statistics
   * @deprecated Backend returns usage stats in /chips/status response
   * @returns {Promise<Object>} Usage statistics from backend
   */
  async getUsageStats() {
    console.warn('⚠️ getUsageStats is deprecated. Use chip.seasonUsageCount from /chips/status instead.');
    
    return {
      totalChipsUsed: 0,
      chipBreakdown: {},
      deprecated: true
    };

    /* DEPRECATED CODE - Backend includes usage in status endpoint
    try {
      const history = await chipAPI.getChipHistory();
      
      if (!history.success) {
        throw new Error('Failed to fetch chip history');
      }

      const usageData = history.data.usage || [];
      const totalChipsUsed = usageData.reduce((sum, chip) => sum + chip.usageCount, 0);
      
      // Find most used chip
      let mostUsedChip = null;
      if (usageData.length > 0) {
        const sorted = [...usageData].sort((a, b) => b.usageCount - a.usageCount);
        mostUsedChip = {
          chipId: sorted[0].chipId,
          name: sorted[0].chipId, // Backend should return chip name
          count: sorted[0].usageCount
        };
      }

      return {
        totalChipsUsed,
        chipsOnCooldown: history.data.cooldowns?.length || 0,
        seasonUsage: usageData.reduce((acc, chip) => {
          acc[chip.chipId] = chip.usageCount;
          return acc;
        }, {}),
        mostUsedChip,
        recentHistory: history.data.history?.slice(-10) || []
      };
    } catch (error) {
      console.error('❌ getUsageStats error:', error);
      return {
        totalChipsUsed: 0,
        chipsOnCooldown: 0,
        seasonUsage: {},
        mostUsedChip: null,
        recentHistory: []
      };
    }
    */
  }

  /**
   * Get most used chip
   * @deprecated Use chip.seasonUsageCount from /chips/status instead
   * @returns {Promise<Object>} Most used chip with count
   */
  async getMostUsedChip() {
    console.warn('⚠️ getMostUsedChip is deprecated. Use chip.seasonUsageCount from /chips/status instead.');
    return null;
  }

  /**
   * Check if specific chips can be used together
   * @deprecated Backend validates compatibility automatically
   * Use checkChipCompatibilityLocal() for frontend-only validation
   * @param {Array} chipIds - Array of chip IDs to check
   * @param {number} gameweek - Target gameweek
   * @param {string} matchId - Match ID (for match-scoped chips)
   * @returns {Promise<Object>} Compatibility check result from backend
   */
  async checkChipCompatibility(chipIds, gameweek, matchId = null) {
    console.warn('⚠️ checkChipCompatibility is deprecated. Backend validates automatically on submission.');
    console.warn('   Use checkChipCompatibilityLocal() for frontend-only validation.');
    
    // Fall back to local validation
    return this.checkChipCompatibilityLocal(chipIds);

    /* DEPRECATED CODE - Backend handles validation
    try {
      const result = await chipAPI.validateChips(chipIds, gameweek, matchId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Validation failed');
      }

      return {
        compatible: result.data.valid,
        reason: result.data.valid ? 'Chips can be used together' : 'Validation failed',
        conflicts: result.data.conflicts || [],
        strictMode: true // Backend always enforces rules
      };
    } catch (error) {
      console.error('❌ checkChipCompatibility error:', error);
      return {
        compatible: false,
        reason: error.message,
        conflicts: [],
        strictMode: true
      };
    }
    */
  }

  /**
   * Local compatibility check (frontend-only validation)
   * Used for UI feedback before submission
   * @param {Array} chipIds - Array of chip IDs to check
   * @returns {Object} Compatibility check result
   */
  checkChipCompatibilityLocal(chipIds) {
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
  /**
   * Simulate chip usage to see what would happen
   * @deprecated Backend validates automatically on submission
   * @param {Array} chipIds - Chips to simulate
   * @param {number} gameweek - Target gameweek
   * @param {string} matchId - Match ID (for match-scoped chips)
   * @returns {Promise<Object>} Simulation results from backend
   */
  async simulateChipUsage(chipIds, gameweek, matchId = null) {
    console.warn('⚠️ simulateChipUsage is deprecated. Use checkChipCompatibilityLocal() for frontend validation.');
    
    // Use local compatibility check
    const compatibility = this.checkChipCompatibilityLocal(chipIds);
    
    return {
      chips: chipIds.map(chipId => ({
        chipId,
        name: CHIP_CONFIG[chipId]?.name || chipId,
        available: true,
        reason: 'Check /chips/status for availability'
      })),
      compatibility,
      allAvailable: compatibility.compatible
    };

    /* DEPRECATED CODE - Backend validates on submission
    try {
      const [statusResult, validationResult] = await Promise.all([
        this.fetchState(),
        chipAPI.validateChips(chipIds, gameweek, matchId)
      ]);

      const results = chipIds.map(chipId => {
        const chip = statusResult.chips.find(c => c.chipId === chipId);
        return {
          chipId,
          name: chip?.name || chipId,
          available: chip?.available || false,
          reason: chip?.reason || 'Unknown'
        };
      });

      const compatibility = {
        compatible: validationResult.data?.valid || false,
        conflicts: validationResult.data?.conflicts || []
      };

      return {
        chips: results,
        compatibility,
        allAvailable: results.every(r => r.available) && compatibility.compatible
      };
    } catch (error) {
      console.error('❌ simulateChipUsage error:', error);
      return {
        chips: [],
        compatibility: { compatible: false, conflicts: [] },
        allAvailable: false
      };
    }
    */
  }

  /**
   * Reset chips for new season (admin only)
   * @deprecated Backend should provide admin endpoint for this
   * @returns {Promise<Object>} Reset result
   */
  async resetChips() {
    console.warn('⚠️ resetChips is deprecated. Use backend admin endpoint for season resets.');
    
    return {
      success: false,
      reason: 'This method is deprecated. Use backend admin endpoint.',
      deprecated: true
    };

    /* DEPRECATED CODE - Backend should handle admin functions
    try {
      const result = await chipAPI.resetChips();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reset chips');
      }

      this.invalidateCache();
      console.log('♻️ Chips reset for new season');
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ resetChips error:', error);
      return { success: false, reason: error.message };
    }
    */
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
