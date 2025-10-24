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
  
  // Use React Query hook for chip data (only fetches status)
  const {
    chips: availableChips,
    currentGameweek: backendGameweek,
    activeGameweekChips,
    activeGameweekChipsDetailed,
    hasActiveGameweekChips,
    isChipActive,
    getActivationGameweek,
    getChipStatus,
    isLoading: chipsLoading,
    error: chipsError,
    refresh: refreshChips
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
   * DEPRECATED: Backend records chips automatically on prediction submission
   * Chips are included in prediction payload and validated/recorded server-side
   * Just refresh chip status after prediction created/updated/deleted
   */

  /**
   * Get chips filtered by scope (match or gameweek)
   */
  const getChipsByScope = useCallback((scope) => {
    console.log('🔍 getChipsByScope called:', {
      scope,
      availableChips,
      availableChipsCount: availableChips?.length || 0,
      isArray: Array.isArray(availableChips),
      firstChipStructure: availableChips?.[0] ? Object.keys(availableChips[0]) : [],
      firstChipFull: availableChips?.[0],
      allChipScopes: availableChips?.map(c => ({ chipId: c.chipId, scope: c.scope, hasScope: 'scope' in c }))
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
   * Check if a chip has already been used in a specific gameweek
   * @param {string} chipId - Chip to check
   * @param {number} gameweek - Gameweek to check
   * @param {Array} userPredictions - User's predictions for validation
   * @param {string} excludeMatchId - Match ID to exclude (when editing)
   * @returns {boolean} - True if chip is already used
   */
  const isChipUsedInGameweek = useCallback((chipId, gameweek, userPredictions = [], excludeMatchId = null) => {
    if (!userPredictions || userPredictions.length === 0) return false;
    
    const gameweekPredictions = userPredictions.filter(pred => 
      pred.gameweek === gameweek && 
      pred.matchId !== excludeMatchId // Exclude current match when editing
    );
    
    const usedInPrediction = gameweekPredictions.some(pred => 
      pred.chips && pred.chips.includes(chipId)
    );
    
    if (usedInPrediction) {
      console.log(`🚫 ${chipId} already used in gameweek ${gameweek}:`, {
        gameweekPredictions: gameweekPredictions.length,
        foundInPrediction: gameweekPredictions.find(p => p.chips?.includes(chipId))
      });
    }
    
    return usedInPrediction;
  }, []);

  /**
   * Check if chips can be used together (async - validates with backend)
   */
  const checkCompatibility = useCallback(async (chipIds, gameweek, matchId = null) => {
    if (!chipManager) {
      return { compatible: false, reason: 'Chip manager not initialized' };
    }
    
    try {
      // Use local validation only (backend validates on submission)
      return chipManager.checkChipCompatibilityLocal(chipIds);
    } catch (error) {
      console.error('❌ checkCompatibility error:', error);
      return { compatible: false, reason: error.message };
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
    // State (from React Query - backend-driven)
    availableChips,
    currentGameweek,
    chipManager,
    compatibilityRules: COMPATIBILITY_RULES,
    
    // Active chip state (derived from cooldown data)
    activeGameweekChips, // Array of chip IDs active this gameweek
    activeGameweekChipsDetailed, // Array with full chip details
    hasActiveGameweekChips, // Boolean for quick check
    
    // Loading states
    isLoading: chipsLoading || authLoading,
    error: chipsError,
    
    // Chip availability checks (sync - uses cached data)
    canUseChip,
    getChipInfo,
    
    // Chip filtering (sync)
    getMatchChips,
    getGameweekChips,
    getChipsByScope,
    
    // Chip activation tracking (derived from cooldown state)
    isChipActive, // Check if chip is active this gameweek
    getActivationGameweek, // Get gameweek when chip was activated
    getChipStatus, // Get full status with color/message
    
    // Chip usage validation (frontend - until backend implements)
    isChipUsedInGameweek,
    
    // Compatibility checking (local - frontend rules)
    checkCompatibility,
    
    // Management
    updateGameweek,
    refreshChips, // Manual refresh trigger (refetches /chips/status)
    
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
