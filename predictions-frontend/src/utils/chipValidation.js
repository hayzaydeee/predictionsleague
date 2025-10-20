/**
 * Chip Validation Utilities
 * Validates that predictions have all active gameweek chips applied
 */

import { CHIP_CONFIG } from './chipManager';

/**
 * Check if a single prediction is missing any active gameweek chips
 * @param {Object} prediction - Prediction object
 * @param {Array<string>} activeGameweekChips - Array of active chip IDs (camelCase)
 * @param {number} currentGameweek - Current gameweek number
 * @returns {Object|null} - Validation result or null if prediction is valid
 */
export function validatePredictionChips(prediction, activeGameweekChips, currentGameweek) {
  // Only validate pending predictions
  if (prediction.status !== 'pending') {
    return null;
  }
  
  // Only validate predictions in the current gameweek
  if (prediction.gameweek !== currentGameweek) {
    return null;
  }
  
  // Get chips applied to this prediction (already in frontend format)
  const predictionChips = prediction.chips || [];
  
  // Find which active chips are missing from this prediction
  const missingChips = activeGameweekChips.filter(
    chipId => !predictionChips.includes(chipId)
  );
  
  // If no chips are missing, prediction is valid
  if (missingChips.length === 0) {
    return null;
  }
  
  // Return validation failure details
  return {
    predictionId: prediction.id,
    matchId: prediction.matchId,
    fixture: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
    homeTeam: prediction.homeTeam,
    awayTeam: prediction.awayTeam,
    gameweek: prediction.gameweek,
    currentChips: predictionChips,
    missingChips,
    missingChipNames: missingChips.map(id => CHIP_CONFIG[id]?.name || id),
    prediction // Include full prediction for sync
  };
}

/**
 * Find all predictions that are missing active gameweek chips
 * @param {Array} predictions - Array of prediction objects
 * @param {Array<string>} activeGameweekChips - Array of active chip IDs
 * @param {number} currentGameweek - Current gameweek number
 * @returns {Array} - Array of predictions needing sync
 */
export function findPredictionsMissingActiveChips(predictions, activeGameweekChips, currentGameweek) {
  if (!predictions || predictions.length === 0) {
    return [];
  }
  
  if (!activeGameweekChips || activeGameweekChips.length === 0) {
    return [];
  }
  
  console.log('🔍 [CHIP VALIDATION] Analyzing predictions:', {
    totalPredictions: predictions.length,
    activeChips: activeGameweekChips,
    currentGameweek,
    chipNames: activeGameweekChips.map(id => CHIP_CONFIG[id]?.name)
  });
  
  // Filter and validate each prediction
  const missingChipsPredictions = predictions
    .map(pred => validatePredictionChips(pred, activeGameweekChips, currentGameweek))
    .filter(Boolean); // Remove null entries (valid predictions)
  
  console.log('📊 [CHIP VALIDATION] Analysis complete:', {
    totalChecked: predictions.length,
    pendingInGameweek: predictions.filter(p => 
      p.status === 'pending' && p.gameweek === currentGameweek
    ).length,
    needingSync: missingChipsPredictions.length,
    details: missingChipsPredictions.map(p => ({
      fixture: p.fixture,
      missing: p.missingChipNames
    }))
  });
  
  return missingChipsPredictions;
}

/**
 * Validate all predictions and return comprehensive validation state
 * @param {Array} predictions - Array of prediction objects
 * @param {Array<string>} activeGameweekChips - Array of active chip IDs
 * @param {number} currentGameweek - Current gameweek number
 * @returns {Object} - Validation state object
 */
export function validatePredictionsWithActiveChips(predictions, activeGameweekChips, currentGameweek) {
  const missingChipsPredictions = findPredictionsMissingActiveChips(
    predictions,
    activeGameweekChips,
    currentGameweek
  );
  
  const needsSync = missingChipsPredictions.length > 0;
  
  const validationState = {
    needsSync,
    count: missingChipsPredictions.length,
    predictions: missingChipsPredictions,
    activeChips: activeGameweekChips,
    activeChipNames: activeGameweekChips.map(id => CHIP_CONFIG[id]?.name || id),
    currentGameweek,
    summary: needsSync 
      ? `${missingChipsPredictions.length} prediction${missingChipsPredictions.length === 1 ? '' : 's'} missing ${activeGameweekChips.map(id => CHIP_CONFIG[id]?.name).join(', ')}`
      : 'All predictions up to date'
  };
  
  if (needsSync) {
    console.log('⚠️ [CHIP VALIDATION] Sync needed:', validationState.summary);
  } else {
    console.log('✅ [CHIP VALIDATION] All predictions synchronized');
  }
  
  return validationState;
}

/**
 * Generate a session storage key for dismissal tracking
 * @param {number} currentGameweek - Current gameweek
 * @param {Array<string>} activeChips - Active chip IDs
 * @returns {string} - Storage key
 */
export function getDismissalKey(currentGameweek, activeChips) {
  const chipKey = activeChips.sort().join('-');
  return `chipSync_dismissed_gw${currentGameweek}_${chipKey}`;
}

/**
 * Check if user has dismissed the sync notification for this gameweek/chips combo
 * @param {number} currentGameweek - Current gameweek
 * @param {Array<string>} activeChips - Active chip IDs
 * @returns {boolean} - True if dismissed
 */
export function isDismissed(currentGameweek, activeChips) {
  if (!activeChips || activeChips.length === 0) return false;
  
  const key = getDismissalKey(currentGameweek, activeChips);
  return sessionStorage.getItem(key) === 'true';
}

/**
 * Mark sync notification as dismissed for this session
 * @param {number} currentGameweek - Current gameweek
 * @param {Array<string>} activeChips - Active chip IDs
 */
export function markDismissed(currentGameweek, activeChips) {
  const key = getDismissalKey(currentGameweek, activeChips);
  sessionStorage.setItem(key, 'true');
  console.log('🔕 [CHIP VALIDATION] Sync notification dismissed for this session');
}

/**
 * Clear dismissal (useful after successful sync)
 * @param {number} currentGameweek - Current gameweek
 * @param {Array<string>} activeChips - Active chip IDs
 */
export function clearDismissal(currentGameweek, activeChips) {
  const key = getDismissalKey(currentGameweek, activeChips);
  sessionStorage.removeItem(key);
}

/**
 * Sync predictions with active chips (updates via API)
 * @param {Array} predictionsToSync - Predictions needing sync
 * @param {Array<string>} activeChips - Active chip IDs to add
 * @param {Function} makePredictionFn - API function to update predictions
 * @returns {Promise<Object>} - Sync results
 */
export async function syncPredictionsWithActiveChips(predictionsToSync, activeChips, makePredictionFn) {
  const results = {
    total: predictionsToSync.length,
    successful: 0,
    failed: 0,
    errors: [],
    synced: []
  };
  
  console.log('🔄 [CHIP SYNC] Starting sync:', {
    predictionsCount: predictionsToSync.length,
    chipsToAdd: activeChips.map(id => CHIP_CONFIG[id]?.name)
  });
  
  for (const item of predictionsToSync) {
    const prediction = item.prediction;
    
    try {
      // Merge existing chips with active chips (remove duplicates)
      const mergedChips = [...new Set([
        ...(prediction.chips || []),
        ...activeChips
      ])];
      
      console.log(`🔄 [CHIP SYNC] Syncing: ${item.fixture}`, {
        before: prediction.chips || [],
        after: mergedChips
      });
      
      // Create fixture object for API call
      const fixture = {
        id: prediction.matchId,
        homeTeam: prediction.homeTeam,
        awayTeam: prediction.awayTeam,
        gameweek: prediction.gameweek,
        date: prediction.date || prediction.matchDate,
        homePlayers: [],
        awayPlayers: []
      };
      
      // Update prediction with merged chips
      const response = await makePredictionFn(
        {
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
          homeScorers: prediction.homeScorers || [],
          awayScorers: prediction.awayScorers || [],
          chips: mergedChips
        },
        fixture,
        true // isEditing
      );
      
      if (response.success) {
        results.successful++;
        results.synced.push(item.fixture);
        console.log(`✅ [CHIP SYNC] Success: ${item.fixture}`);
      } else {
        results.failed++;
        results.errors.push({ 
          fixture: item.fixture, 
          error: response.error?.message || 'Unknown error' 
        });
        console.error(`❌ [CHIP SYNC] Failed: ${item.fixture}`, response.error);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ 
        fixture: item.fixture, 
        error: error.message 
      });
      console.error(`❌ [CHIP SYNC] Error: ${item.fixture}`, error);
    }
  }
  
  console.log('✅ [CHIP SYNC] Complete:', {
    successful: results.successful,
    failed: results.failed,
    total: results.total
  });
  
  return results;
}
