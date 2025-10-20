/**
 * React Query Hooks for Chip Data
 * Provides cached, reactive chip state management
 * 
 * Note: Only uses GET /chips/status endpoint.
 * Backend handles validation and recording internally when predictions are submitted.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chipAPI } from '../services/api/chipAPI';
import { CHIP_CONFIG } from '../utils/chipManager';

// Query keys
export const CHIP_QUERY_KEYS = {
  STATUS: 'chip-status'
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
              // Silently converted - removed verbose logging
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
 * Helper hook that combines status and provides computed values
 * This is the main hook used throughout the app
 * 
 * @returns {Object} Enhanced chip data with helpers
 */
export const useChips = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useChipStatus();

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

  /**
   * Manually refresh chip status
   * Use this after prediction submission to update chip availability
   */
  const refresh = () => {
    queryClient.invalidateQueries([CHIP_QUERY_KEYS.STATUS]);
    return refetch();
  };

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
    refresh,
    
    // State
    isLoading,
    error
  };
};
