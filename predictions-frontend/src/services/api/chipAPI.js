/**
 * Chip API Service
 * Handles all chip-related backend communication
 * 
 * Backend endpoints to implement:
 * - GET  /chips/status
 * - POST /chips/validate
 * - POST /chips/use
 * - GET  /chips/history
 * - POST /chips/reset
 */

import { apiCall } from './baseAPI';

/**
 * Chip API Service
 */
export const chipAPI = {
  /**
   * Get current chip status for the user
   * Returns availability, cooldowns, usage counts, etc.
   * 
   * Backend should return:
   * {
   *   chips: [
   *     {
   *       chipId: "wildcard",
   *       available: true/false,
   *       reason: "On cooldown" / "Available" / "Season limit reached",
   *       remainingGameweeks: 3, // For cooldowns
   *       seasonUsageCount: 2,
   *       seasonLimit: null,
   *       lastUsedGameweek: 5,
   *       config: { ... chip config ... }
   *     }
   *   ],
   *   currentGameweek: 8,
   *   currentSeason: "2025"
   * }
   */
  async getChipStatus() {
    try {
      const response = await apiCall({
        method: 'GET',
        url: '/chips/status'
      });

      console.log('✅ Chip status fetched successfully', {
        chipsCount: response.data?.chips?.length || 0,
        currentGameweek: response.data?.currentGameweek
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to fetch chip status', {
        error: error.message
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'CHIP_STATUS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Validate chip usage before prediction submission
   * Checks if chips can be used for this gameweek/match
   * 
   * Backend should validate:
   * - Chip availability
   * - Cooldown status
   * - Season limits
   * - Compatibility rules
   * 
   * Backend should return:
   * {
   *   valid: true/false,
   *   invalidChips: ["chipId1", "chipId2"],
   *   errors: [
   *     { chipId: "wildcard", reason: "On cooldown until GW12" }
   *   ]
   * }
   */
  async validateChips(chipIds, gameweek, matchId = null) {
    if (!chipIds || chipIds.length === 0) {
      return {
        success: true,
        data: { valid: true, invalidChips: [], errors: [] },
        error: null
      };
    }

    try {
      const response = await apiCall({
        method: 'POST',
        url: '/chips/validate',
        data: {
          chipIds,
          gameweek,
          matchId
        }
      });

      console.log('✅ Chips validated', {
        chipIds,
        valid: response.data?.valid,
        invalidChips: response.data?.invalidChips
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to validate chips', {
        error: error.message,
        chipIds
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'CHIP_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Record chip usage after successful prediction submission
   * This creates the chip usage records and cooldowns in the database
   * 
   * Backend should:
   * - Create chip_usage records
   * - Create/update chip_cooldowns
   * - Link chips to prediction
   * - Validate no duplicate usage
   * 
   * Backend should return:
   * {
   *   success: true,
   *   chipsRecorded: ["wildcard", "scorerFocus"],
   *   cooldownsCreated: {
   *     wildcard: { activeFrom: 8, expiresAt: 15 }
   *   },
   *   seasonUsageUpdated: {
   *     wildcard: 3 // New total usage count
   *   }
   * }
   */
  async recordChipUsage(predictionId, chipIds, gameweek, matchId = null) {
    if (!chipIds || chipIds.length === 0) {
      return {
        success: true,
        data: { chipsRecorded: [] },
        error: null
      };
    }

    try {
      const response = await apiCall({
        method: 'POST',
        url: '/chips/use',
        data: {
          predictionId,
          chipIds,
          gameweek,
          matchId
        }
      });

      console.log('✅ Chip usage recorded', {
        predictionId,
        chipIds,
        chipsRecorded: response.data?.chipsRecorded
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to record chip usage', {
        error: error.message,
        predictionId,
        chipIds
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'CHIP_USAGE_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get chip usage history for the user
   * 
   * Backend should return:
   * {
   *   history: [
   *     {
   *       id: 123,
   *       chipId: "wildcard",
   *       chipName: "Wildcard",
   *       gameweek: 5,
   *       matchId: 12345,
   *       match: "Arsenal vs Chelsea",
   *       homeTeam: "Arsenal",
   *       awayTeam: "Chelsea",
   *       predictionId: 789,
   *       usedAt: "2025-09-15T15:00:00Z",
   *       pointsEarned: 45, // Points from that prediction
   *       pointsWithChip: 135 // After chip multiplier
   *     }
   *   ],
   *   season: "2025",
   *   totalChipsUsed: 12
   * }
   */
  async getChipHistory(season = null) {
    try {
      const params = season ? { season } : {};
      
      const response = await apiCall({
        method: 'GET',
        url: '/chips/history',
        params
      });

      console.log('✅ Chip history fetched', {
        count: response.data?.history?.length || 0,
        season: response.data?.season
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to fetch chip history', {
        error: error.message
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'CHIP_HISTORY_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Reset all chips for a new season (admin only)
   * Clears all usage, cooldowns, and history
   * 
   * Backend should:
   * - Clear chip_usage for user/season
   * - Clear chip_cooldowns for user/season
   * - Optionally archive old data
   */
  async resetChips() {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/chips/reset'
      });

      console.log('✅ Chips reset successfully');

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to reset chips', {
        error: error.message
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'CHIP_RESET_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get chips available for a specific gameweek
   * Useful for planning ahead
   */
  async getChipsForGameweek(gameweek) {
    try {
      const response = await apiCall({
        method: 'GET',
        url: `/chips/gameweek/${gameweek}`
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to fetch gameweek chips', {
        error: error.message,
        gameweek
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'GAMEWEEK_CHIPS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};

export default chipAPI;
