/**
 * React Query Hooks for Chip Data
 * Provides cached, reactive chip state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chipAPI } from '../services/api/chipAPI';

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
      const result = await chipAPI.getChipStatus();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch chip status');
      }
      
      return result.data;
    },
    enabled,
    refetchInterval,
    staleTime,
    cacheTime,
    retry: 2,
    onError: (error) => {
      console.error('useChipStatus error:', error);
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
