import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getChipManager, 
  CHIP_CONFIG, 
  COMPATIBILITY_RULES,
  setStrictMode,
  enablePremiumRestrictions,
  disablePremiumRestrictions 
} from '../utils/chipManager';
import { useAuth } from './AuthContext';
import { useFixtures } from '../hooks/useFixtures';
import { useChips } from '../hooks/useChips'; // NEW: React Query hook

const ChipManagementContext = createContext(null);

/**
 * ChipManagementProvider - NOW BACKEND-DRIVEN with React Query
 */
export function ChipManagementProvider({ children }) {
  const authContext = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = authContext;
  const [chipManager, setChipManager] = useState(null);
  const [manualGameweek, setManualGameweek] = useState(null);
  
  // NEW: Use React Query hook for chip data
  const {
    chips: availableChips,
    currentGameweek: backendGameweek,
    isLoading: chipsLoading,
    error: chipsError,
    validateChips,
    recordChipUsage,
    refresh: refreshChips,
    isValidating,
    isRecording
  } = useChips();
  
  // DEBUG: Log chip data from React Query
  useEffect(() => {
    console.log('🔍 ChipManagementContext - Chip Data Updated:', {
      availableChips,
      availableChipsCount: availableChips?.length || 0,
      availableChipsType: Array.isArray(availableChips) ? 'array' : typeof availableChips,
      backendGameweek,
      chipsLoading,
      chipsError,
      hasError: !!chipsError
    });
    
    if (availableChips && availableChips.length > 0) {
      console.log('📊 Available Chips Breakdown:', availableChips.map(chip => ({
        chipId: chip.chipId,
        available: chip.available,
        scope: chip.scope
      })));
    }
  }, [availableChips, backendGameweek, chipsLoading, chipsError]);
  
  // Determine current gameweek (prefer backend, fallback to manual override)
  const currentGameweek = useMemo(() => {
    if (manualGameweek !== null) return manualGameweek;
    return backendGameweek || 1;
  }, [backendGameweek, manualGameweek]);

  // Initialize chip manager when user changes
  useEffect(() => {
    const userId = user?.id || user?.username;
    
    console.log('👤 ChipManagementContext: User changed', {
      userId,
      userName: user?.username,
      isAuthenticated,
      authLoading
    });
    
    if (authLoading) {
      console.log('⏳ Waiting for authentication to complete...');
      return;
    }
    
    if (userId && isAuthenticated) {
      const manager = getChipManager(userId);
      console.log('🎯 ChipManager initialized (backend wrapper) for user:', userId);
      setChipManager(manager);
    } else {
      console.log('❌ No user or not authenticated, clearing chip manager');
      setChipManager(null);
    }
  }, [user?.id, user?.username, isAuthenticated, authLoading]);

  /**
   * Check if chip can be used (sync wrapper around availableChips data)
   */
  const canUseChip = useCallback((chipId) => {
    const chip = availableChips.find(c => c.chipId === chipId);
    return chip?.available || false;
  }, [availableChips]);

  /**
   * Get chip availability info (sync wrapper around availableChips data)
   */
  const getChipInfo = useCallback((chipId) => {
    const chip = availableChips.find(c => c.chipId === chipId);
    if (!chip) return null;
    
    const config = CHIP_CONFIG[chipId];
    return {
      ...config,
      ...chip
    };
  }, [availableChips]);

  /**
   * Use chip (async - called AFTER prediction is submitted to backend)
   * @param {string} chipId - Chip to use
   * @param {number} gameweek - Gameweek number
   * @param {string} matchId - Match ID
   * @param {string} predictionId - Prediction ID from backend response
   * @returns {Promise<Object>} Result with success/error
   */
  const useChip = useCallback(async (chipId, gameweek, matchId, predictionId) => {
    if (!chipManager) {
      return { success: false, reason: 'Chip manager not initialized' };
    }

    try {
      const result = await chipManager.useChip(chipId, gameweek, matchId, predictionId);
      
      if (result.success) {
        // React Query will auto-invalidate and refresh
        console.log('✅ Chip recorded:', chipId);
      }
      
      return result;
    } catch (error) {
      console.error('❌ useChip error:', error);
      return { success: false, reason: error.message };
    }
  }, [chipManager]);

  /**
   * Use multiple chips at once (async - called AFTER prediction submission)
   * @param {Array} chipIds - Chips to use
   * @param {number} gameweek - Gameweek number
   * @param {string} matchId - Match ID
   * @param {string} predictionId - Prediction ID from backend
   * @returns {Promise<Object>} Result with success/error
   */
  const useMultipleChips = useCallback(async (chipIds, gameweek, matchId, predictionId) => {
    if (!chipManager) {
      return { success: false, reason: 'Chip manager not initialized' };
    }

    if (!chipIds || chipIds.length === 0) {
      return { success: true, reason: 'No chips to record' };
    }

    try {
      // Record all chips in one call to backend
      const result = await recordChipUsage({
        predictionId,
        chipIds,
        gameweek,
        matchId
      });

      console.log('✅ Multiple chips recorded:', chipIds);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ useMultipleChips error:', error);
      return { success: false, reason: error.message };
    }
  }, [chipManager, recordChipUsage]);

  /**
   * Undo chip usage - NOW HANDLED BY BACKEND
   * When a prediction is deleted, backend automatically releases chips
   * Frontend just needs to refresh the chip status
   */
  const undoChipUsage = useCallback(async (chipId, gameweek) => {
    console.warn('⚠️ undoChipUsage: Backend should handle this when prediction is deleted');
    // Just refresh chip status from backend
    await refreshChips();
  }, [refreshChips]);

  /**
   * Undo multiple chips - NOW HANDLED BY BACKEND
   */
  const undoChipsUsage = useCallback(async (chipIds, gameweek) => {
    console.warn('⚠️ undoChipsUsage: Backend should handle this when prediction is deleted');
    // Just refresh chip status from backend
    await refreshChips();
  }, [refreshChips]);

  /**
   * Get chips filtered by scope (match or gameweek)
   */
  const getChipsByScope = useCallback((scope) => {
    console.log('🔍 getChipsByScope called:', {
      scope,
      availableChips,
      availableChipsCount: availableChips?.length || 0,
      isArray: Array.isArray(availableChips)
    });
    
    if (!availableChips || !Array.isArray(availableChips)) {
      console.warn('⚠️ availableChips is not an array:', {
        availableChips,
        type: typeof availableChips
      });
      return [];
    }
    
    const filtered = availableChips.filter(chip => chip.scope === scope);
    console.log(`📊 Filtered ${scope} chips:`, {
      count: filtered.length,
      chips: filtered.map(c => ({ chipId: c.chipId, available: c.available }))
    });
    
    return filtered;
  }, [availableChips]);

  /**
   * Get match-scoped chips (for prediction modal)
   */
  const getMatchChips = useCallback(() => {
    console.log('🎯 getMatchChips called');
    return getChipsByScope('match');
  }, [getChipsByScope]);

  /**
   * Get gameweek-scoped chips
   */
  const getGameweekChips = useCallback(() => {
    console.log('🏆 getGameweekChips called');
    return getChipsByScope('gameweek');
  }, [getChipsByScope]);

  /**
   * Check if chips can be used together (async - validates with backend)
   */
  const checkCompatibility = useCallback(async (chipIds, gameweek, matchId = null) => {
    if (!chipManager) {
      return { compatible: false, reason: 'Chip manager not initialized' };
    }
    
    try {
      return await chipManager.checkChipCompatibility(chipIds, gameweek, matchId);
    } catch (error) {
      console.error('❌ checkCompatibility error:', error);
      return { compatible: false, reason: error.message };
    }
  }, [chipManager]);

  /**
   * Simulate chip usage (async - validates with backend)
   */
  const simulateUsage = useCallback(async (chipIds, gameweek = currentGameweek, matchId = null) => {
    if (!chipManager) return null;
    
    try {
      return await chipManager.simulateChipUsage(chipIds, gameweek, matchId);
    } catch (error) {
      console.error('❌ simulateUsage error:', error);
      return null;
    }
  }, [chipManager, currentGameweek]);

  /**
   * Get usage statistics (async - fetches from backend)
   */
  const getUsageStats = useCallback(async () => {
    if (!chipManager) return null;
    
    try {
      return await chipManager.getUsageStats();
    } catch (error) {
      console.error('❌ getUsageStats error:', error);
      return null;
    }
  }, [chipManager]);

  /**
   * Reset chip state (async - calls backend reset endpoint)
   */
  const resetChipsState = useCallback(async () => {
    if (!chipManager) return;
    
    try {
      await chipManager.resetChips();
      console.log('🔄 All chips reset (backend)');
    } catch (error) {
      console.error('❌ resetChips error:', error);
    }
  }, [chipManager]);

  /**
   * Update current gameweek (manual override)
   */
  const updateGameweek = useCallback((gameweek) => {
    console.log('📅 Manually updating gameweek to:', gameweek);
    setManualGameweek(gameweek);
  }, []);

  const value = {
    // State (from React Query)
    availableChips,
    currentGameweek,
    chipManager,
    compatibilityRules: COMPATIBILITY_RULES,
    
    // Loading states
    isLoading: chipsLoading || authLoading,
    isValidating,
    isRecording,
    error: chipsError,
    
    // Chip availability checks (sync - uses cached data)
    canUseChip,
    getChipInfo,
    
    // Chip filtering (sync)
    getMatchChips,
    getGameweekChips,
    getChipsByScope,
    
    // Validation (async - calls backend)
    checkCompatibility,
    simulateUsage,
    validateChips, // Direct access to React Query mutation
    
    // Chip usage (async - records to backend AFTER prediction submission)
    useChip,
    useMultipleChips,
    recordChipUsage, // Direct access to React Query mutation
    undoChipUsage, // Deprecated - backend handles this
    undoChipsUsage, // Deprecated - backend handles this
    
    // Statistics and management (async)
    getUsageStats,
    resetChips: resetChipsState,
    updateGameweek,
    refreshChips, // Manual refresh trigger
    
    // Premium/Paywall features (local config)
    setStrictMode,
    enablePremiumRestrictions,
    disablePremiumRestrictions,
    isStrictMode: () => COMPATIBILITY_RULES.STRICT_MODE
  };

  return (
    <ChipManagementContext.Provider value={value}>
      {children}
    </ChipManagementContext.Provider>
  );
}

/**
 * Hook to use chip management
 */
export function useChipManagement() {
  const context = useContext(ChipManagementContext);
  
  if (!context) {
    throw new Error('useChipManagement must be used within ChipManagementProvider');
  }
  
  return context;
}

export default ChipManagementContext;
