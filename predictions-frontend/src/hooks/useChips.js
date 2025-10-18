/**
 * React Query Hooks for Chip Data
 * Provides cached, reactive chip state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chipAPI } from '../services/api/chipAPI';
import { CHIP_CONFIG } from '../utils/chipManager';

// Query keys
export const CHIP_QUERY_KEYS = {
  STATUS: 'chip-status',
  HISTORY: 'chip-history',
  GAMEWEEK: (gw) => ['chip-gameweek', gw]
};

/**
 * Hook to fetch and cache chip status
 * @param {Object} options - Query options
 * @returns {Object} Query result with chip data
 */
export const useChipStatus = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 30 * 1000, // 30 seconds
    cacheTime = 5 * 60 * 1000 // 5 minutes
  } = options;

  return useQuery({
    queryKey: [CHIP_QUERY_KEYS.STATUS],
    queryFn: async () => {
      console.log('🔄 useChipStatus: Fetching chip status...');
      const result = await chipAPI.getChipStatus();
      
      console.log('📦 useChipStatus: chipAPI result:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        chipsCount: result.data?.chips?.length || 0,
        error: result.error
      });
      
      if (!result.success) {
        console.error('❌ useChipStatus: Failed to fetch', result.error);
        throw new Error(result.error?.message || 'Failed to fetch chip status');
      }
      
      // 🔧 MERGE backend data with frontend CHIP_CONFIG to add missing fields (scope, etc.)
      const enhancedData = {
        ...result.data,
        chips: (result.data?.chips || []).map(backendChip => {
          // Try direct match first, then try various conversions
          let chipId = backendChip.chipId;
          let config = CHIP_CONFIG[chipId];
          
          // If not found, try converting from various backend formats
          if (!config && chipId) {
            // Convert UPPER_SNAKE_CASE or snake_case to camelCase
            // e.g., "WILDCARD" -> "wildcard"
            // e.g., "DEFENSE_PLUS_PLUS" -> "defensePlusPlus"
            // e.g., "defense_plus_plus" -> "defensePlusPlus"
            const normalized = chipId
              .toLowerCase() // Convert to lowercase first
              .replace(/_([a-z])/g, (g) => g[1].toUpperCase()); // Convert to camelCase
            
            config = CHIP_CONFIG[normalized];
            if (config) {
              console.log(`📝 Converted chip ID: ${backendChip.chipId} -> ${normalized}`);
              chipId = normalized;
            }
          }
          
          if (!config) {
            console.warn(`⚠️ Unknown chip from backend:`, {
              chipId: backendChip.chipId,
              availableConfigIds: Object.keys(CHIP_CONFIG),
              backendChip
            });
            // Return backend chip as-is but mark it
            return { ...backendChip, scope: 'unknown' };
          }
          
          // Merge backend state with frontend config
          return {
            ...config, // Frontend config (has scope, name, description, etc.)
            ...backendChip, // Backend state (has available, usageCount, cooldowns, etc.)
            id: chipId, // Use normalized chipId as id (for ChipSelector compatibility)
            chipId, // Also keep chipId
            // Ensure critical fields from config aren't overwritten
            scope: config.scope,
            name: config.name,
            description: config.description,
            icon: config.icon,
            color: config.color
          };
        })
      };
      
      // 🎯 ADD DOUBLE DOWN - Always available, no backend tracking needed
      const hasDoubleDown = enhancedData.chips.some(chip => 
        chip.chipId === 'doubleDown' || chip.id === 'doubleDown'
      );
      
      if (!hasDoubleDown) {
        const doubleDownConfig = CHIP_CONFIG.doubleDown;
        enhancedData.chips.push({
          ...doubleDownConfig,
          id: 'doubleDown',
          chipId: 'doubleDown',
          available: true, // Always available
          reason: 'Available',
          usageCount: 0, // Not tracked
          seasonLimit: null,
          remainingUses: null,
          cooldownExpires: null,
          remainingGameweeks: 0
        });
        console.log('✅ Added Double Down chip (always available, no backend tracking)');
      }
      
      console.log('✅ useChipStatus: Enhanced data with CHIP_CONFIG:', {
        originalChipsCount: result.data?.chips?.length || 0,
        enhancedChipsCount: enhancedData.chips?.length || 0,
        chipsWithScope: enhancedData.chips?.filter(c => c.scope).length || 0,
        scopeBreakdown: {
          match: enhancedData.chips?.filter(c => c.scope === 'match').length || 0,
          gameweek: enhancedData.chips?.filter(c => c.scope === 'gameweek').length || 0
        },
        enhancedChips: enhancedData.chips?.map(c => ({
          chipId: c.chipId,
          id: c.id,
          name: c.name,
          scope: c.scope,
          available: c.available
        }))
      });
      
      return enhancedData;
    },
    enabled,
    refetchInterval,
    staleTime,
    cacheTime,
    retry: 2,
    onError: (error) => {
      console.error('❌ useChipStatus error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useChipStatus success:', {
        hasChips: !!data?.chips,
        chipsCount: data?.chips?.length || 0,
        currentGameweek: data?.currentGameweek
      });
    }
  });
};

/**
 * Hook to fetch chip usage history
 * @param {string} season - Season to fetch (optional)
 * @param {Object} options - Query options
 * @returns {Object} Query result with history data
 */
export const useChipHistory = (season = null, options = {}) => {
  const {
    enabled = true,
    staleTime = 60 * 1000, // 1 minute
    cacheTime = 10 * 60 * 1000 // 10 minutes
  } = options;

  return useQuery({
    queryKey: [CHIP_QUERY_KEYS.HISTORY, season],
    queryFn: async () => {
      const result = await chipAPI.getChipHistory(season);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch chip history');
      }
      
      return result.data;
    },
    enabled,
    staleTime,
    cacheTime,
    retry: 2
  });
};

/**
 * Hook to validate chips before use
 * Returns a mutation function to call
 */
export const useValidateChips = () => {
  return useMutation({
    mutationFn: async ({ chipIds, gameweek, matchId }) => {
      const result = await chipAPI.validateChips(chipIds, gameweek, matchId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Chip validation failed');
      }
      
      return result.data;
    },
    onError: (error) => {
      console.error('Chip validation error:', error);
    }
  });
};

/**
 * Hook to record chip usage
 * Automatically invalidates chip status cache on success
 */
export const useRecordChipUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ predictionId, chipIds, gameweek, matchId }) => {
      const result = await chipAPI.recordChipUsage(predictionId, chipIds, gameweek, matchId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to record chip usage');
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Invalidate chip status to force refresh
      queryClient.invalidateQueries([CHIP_QUERY_KEYS.STATUS]);
      queryClient.invalidateQueries([CHIP_QUERY_KEYS.HISTORY]);
      
      console.log('✅ Chip status cache invalidated after usage');
    },
    onError: (error) => {
      console.error('Chip usage recording error:', error);
    }
  });
};

/**
 * Hook to reset chips (admin only)
 * Clears all cache on success
 */
export const useResetChips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await chipAPI.resetChips();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reset chips');
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Clear all chip-related cache
      queryClient.invalidateQueries([CHIP_QUERY_KEYS.STATUS]);
      queryClient.invalidateQueries([CHIP_QUERY_KEYS.HISTORY]);
      
      console.log('✅ All chip caches cleared after reset');
    },
    onError: (error) => {
      console.error('Chip reset error:', error);
    }
  });
};

/**
 * Hook to get chips for specific gameweek
 */
export const useGameweekChips = (gameweek, options = {}) => {
  const {
    enabled = true,
    staleTime = 60 * 1000
  } = options;

  return useQuery({
    queryKey: CHIP_QUERY_KEYS.GAMEWEEK(gameweek),
    queryFn: async () => {
      const result = await chipAPI.getChipsForGameweek(gameweek);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch gameweek chips');
      }
      
      return result.data;
    },
    enabled: enabled && !!gameweek,
    staleTime
  });
};

/**
 * Helper hook that combines status and provides computed values
 * @returns {Object} Enhanced chip data with helpers
 */
export const useChips = () => {
  const { data, isLoading, error, refetch } = useChipStatus();
  const recordUsage = useRecordChipUsage();
  const validate = useValidateChips();

  // DEBUG: Log data transformation
  console.log('🔍 useChips: Data transformation', {
    rawData: data,
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : [],
    chipsArray: data?.chips,
    chipsCount: data?.chips?.length || 0,
    isLoading,
    hasError: !!error
  });

  return {
    // Data
    chips: data?.chips || [],
    currentGameweek: data?.currentGameweek || 1,
    currentSeason: data?.currentSeason || '2025',
    
    // Helpers
    getChip: (chipId) => data?.chips?.find(c => c.chipId === chipId) || null,
    isAvailable: (chipId) => {
      const chip = data?.chips?.find(c => c.chipId === chipId);
      return chip?.available || false;
    },
    getAvailableChips: () => data?.chips?.filter(c => c.available) || [],
    getUnavailableChips: () => data?.chips?.filter(c => !c.available) || [],
    
    // Actions
    validateChips: validate.mutateAsync,
    recordChipUsage: recordUsage.mutateAsync,
    refresh: refetch,
    
    // State
    isLoading,
    error,
    isValidating: validate.isPending,
    isRecording: recordUsage.isPending
  };
};
