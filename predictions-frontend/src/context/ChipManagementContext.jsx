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

const ChipManagementContext = createContext(null);

/**
 * ChipManagementProvider - Provides chip state management throughout the app
 */
export function ChipManagementProvider({ children }) {
  const authContext = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = authContext;
  const [chipManager, setChipManager] = useState(null);
  const [availableChips, setAvailableChips] = useState([]);
  const [manualGameweek, setManualGameweek] = useState(null);
  
  // Get fixtures to determine current gameweek
  const { fixtures } = useFixtures({ fallbackToSample: false });
  
  // Calculate current gameweek from fixtures data or use manual override
  const currentGameweek = useMemo(() => {
    // Use manual gameweek if set
    if (manualGameweek !== null) return manualGameweek;
    
    if (!fixtures || fixtures.length === 0) return 1;
    
    // Get the earliest upcoming gameweek from fixtures
    const upcomingGameweeks = fixtures
      .map(fixture => fixture.gameweek)
      .filter(Boolean)
      .sort((a, b) => a - b);
    
    return upcomingGameweeks[0] || 1;
  }, [fixtures, manualGameweek]);

  /**
   * Refresh available chips list
   */
  const refreshAvailableChips = useCallback((manager, gameweek) => {
    if (!manager) {
      console.log('⚠️ refreshAvailableChips: No manager provided');
      return;
    }
    
    console.log('🔄 Refreshing chips for GW', gameweek);
    const chips = manager.getAvailableChips(gameweek);
    setAvailableChips(chips);
    
    console.log('🔄 Available chips refreshed for GW' + gameweek, {
      total: chips.length,
      available: chips.filter(c => c.available).length,
      onCooldown: chips.filter(c => !c.available && c.remainingGameweeks).length,
      chips: chips.map(c => ({ id: c.id, name: c.name, available: c.available }))
    });
  }, []);

  // Initialize chip manager when user changes
  useEffect(() => {
    // Use username as the unique identifier (backend may not provide 'id')
    const userId = user?.id || user?.username;
    
    console.log('👤 ChipManagementContext: User/Gameweek changed', {
      userId,
      userName: user?.username,
      userEmail: user?.email,
      currentGameweek,
      hasUser: !!userId,
      isAuthenticated,
      authLoading,
      fullUser: user
    });
    
    // Wait for auth to complete before initializing
    if (authLoading) {
      console.log('⏳ Waiting for authentication to complete...');
      return;
    }
    
    if (userId && isAuthenticated) {
      const manager = getChipManager(userId);
      console.log('🎯 ChipManager initialized for user:', userId, manager);
      setChipManager(manager);
      refreshAvailableChips(manager, currentGameweek);
    } else {
      console.log('❌ No user or not authenticated, clearing chip manager', {
        hasUserId: !!userId,
        isAuthenticated
      });
      setChipManager(null);
      setAvailableChips([]);
    }
  }, [user?.id, user?.username, currentGameweek, isAuthenticated, authLoading, refreshAvailableChips]);

  /**
   * Check if chip can be used
   */
  const canUseChip = useCallback((chipId, gameweek = currentGameweek) => {
    if (!chipManager) return false;
    
    const availability = chipManager.getChipAvailability(chipId, gameweek);
    return availability.available;
  }, [chipManager, currentGameweek]);

  /**
   * Get chip availability info
   */
  const getChipInfo = useCallback((chipId, gameweek = currentGameweek) => {
    if (!chipManager) return null;
    
    const availability = chipManager.getChipAvailability(chipId, gameweek);
    const config = CHIP_CONFIG[chipId];
    
    return {
      ...config,
      ...availability
    };
  }, [chipManager, currentGameweek]);

  /**
   * Use chip (called when prediction is submitted)
   */
  const useChip = useCallback((chipId, gameweek, matchId = null) => {
    if (!chipManager) {
      return { success: false, reason: 'Chip manager not initialized' };
    }

    const result = chipManager.useChip(chipId, gameweek, matchId);
    
    if (result.success) {
      // Refresh available chips
      refreshAvailableChips(chipManager, currentGameweek);
    }
    
    return result;
  }, [chipManager, currentGameweek, refreshAvailableChips]);

  /**
   * Use multiple chips at once (for predictions with multiple chips)
   */
  const useChips = useCallback((chipIds, gameweek, matchId = null) => {
    if (!chipManager) {
      return { success: false, reason: 'Chip manager not initialized' };
    }

    // Check compatibility first
    const compatibility = chipManager.checkChipCompatibility(chipIds);
    if (!compatibility.compatible) {
      return {
        success: false,
        reason: compatibility.reason,
        conflictingChips: compatibility.conflictingChips
      };
    }

    // Use all chips
    const results = [];
    let allSuccess = true;

    for (const chipId of chipIds) {
      const result = chipManager.useChip(chipId, gameweek, matchId);
      results.push({ chipId, ...result });
      
      if (!result.success) {
        allSuccess = false;
        // Rollback previous chips
        for (let i = 0; i < results.length - 1; i++) {
          chipManager.undoChipUsage(results[i].chipId, gameweek);
        }
        break;
      }
    }

    if (allSuccess) {
      refreshAvailableChips(chipManager, currentGameweek);
    }

    return {
      success: allSuccess,
      results,
      reason: allSuccess ? 'All chips used successfully' : 'Failed to use some chips'
    };
  }, [chipManager, currentGameweek, refreshAvailableChips]);

  /**
   * Undo chip usage (when prediction is cancelled/deleted)
   */
  const undoChipUsage = useCallback((chipId, gameweek) => {
    if (!chipManager) return;

    chipManager.undoChipUsage(chipId, gameweek);
    refreshAvailableChips(chipManager, currentGameweek);
    
    console.log(`↩️ Chip usage undone: ${chipId}`);
  }, [chipManager, currentGameweek, refreshAvailableChips]);

  /**
   * Undo multiple chips
   */
  const undoChipsUsage = useCallback((chipIds, gameweek) => {
    if (!chipManager) return;

    chipIds.forEach(chipId => {
      chipManager.undoChipUsage(chipId, gameweek);
    });
    
    refreshAvailableChips(chipManager, currentGameweek);
    
    console.log(`↩️ Multiple chips undone:`, chipIds);
  }, [chipManager, currentGameweek, refreshAvailableChips]);

  /**
   * Get chips filtered by scope (match or gameweek)
   */
  const getChipsByScope = useCallback((scope) => {
    return availableChips.filter(chip => chip.scope === scope);
  }, [availableChips]);

  /**
   * Get match-scoped chips (for prediction modal)
   */
  const getMatchChips = useCallback(() => {
    return getChipsByScope('match');
  }, [getChipsByScope]);

  /**
   * Get gameweek-scoped chips
   */
  const getGameweekChips = useCallback(() => {
    return getChipsByScope('gameweek');
  }, [getChipsByScope]);

  /**
   * Check if chips can be used together
   */
  const checkCompatibility = useCallback((chipIds) => {
    if (!chipManager) return { compatible: false, reason: 'Chip manager not initialized' };
    
    return chipManager.checkChipCompatibility(chipIds);
  }, [chipManager]);

  /**
   * Simulate chip usage (for preview without committing)
   */
  const simulateUsage = useCallback((chipIds, gameweek = currentGameweek) => {
    if (!chipManager) return null;
    
    return chipManager.simulateChipUsage(chipIds, gameweek);
  }, [chipManager, currentGameweek]);

  /**
   * Get usage statistics
   */
  const getUsageStats = useCallback(() => {
    if (!chipManager) return null;
    
    return chipManager.getUsageStats();
  }, [chipManager]);

  /**
   * Reset chip state (for new season or testing)
   */
  const resetChips = useCallback(() => {
    if (!chipManager) return;
    
    chipManager.resetState();
    refreshAvailableChips(chipManager, currentGameweek);
    
    console.log('🔄 All chips reset');
  }, [chipManager, currentGameweek, refreshAvailableChips]);

  /**
   * Update current gameweek (called when fixtures load)
   */
  const updateGameweek = useCallback((gameweek) => {
    console.log('📅 Manually updating gameweek to:', gameweek);
    setManualGameweek(gameweek);
    if (chipManager) {
      refreshAvailableChips(chipManager, gameweek);
    }
  }, [chipManager, refreshAvailableChips]);

  const value = {
    // State
    availableChips,
    currentGameweek,
    chipManager,
    compatibilityRules: COMPATIBILITY_RULES,
    
    // Chip availability checks
    canUseChip,
    getChipInfo,
    checkCompatibility,
    simulateUsage,
    
    // Chip filtering
    getMatchChips,
    getGameweekChips,
    getChipsByScope,
    
    // Chip usage (for prediction submission)
    useChip,
    useChips,
    undoChipUsage,
    undoChipsUsage,
    
    // Statistics and management
    getUsageStats,
    resetChips,
    updateGameweek,
    
    // Premium/Paywall features
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
