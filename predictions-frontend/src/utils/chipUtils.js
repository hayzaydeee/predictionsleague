/**
 * Utilities for handling prediction chips
 */

// Chip definitions (synchronized with chipManager.js)
export const predictionChips = {
  doubleDown: {
    id: "doubleDown",
    name: "Double Down",
    type: "match",
    description: "Double all points earned from one selected match",
    icon: "2x",
    cooldown: 0,
    seasonLimit: null,
  },
  wildcard: {
    id: "wildcard",
    name: "Wildcard",
    type: "match",
    description: "Triple all points earned from one selected match",
    icon: "3x",
    cooldown: 7,
    seasonLimit: null,
  },
  opportunist: {
    id: "opportunist",
    name: "Opportunist",
    type: "gameweek",
    description: "Change all predictions up to 30 minutes before each match kicks off",
    icon: "⏱️",
    cooldown: 0,
    seasonLimit: 2,
    behavior: "rolling_deadline"
  },
  scorerFocus: {
    id: "scorerFocus",
    name: "Scorer Focus",
    type: "match",
    description: "Doubles all points from goalscorer predictions in one match",
    icon: "⚽",
    cooldown: 5,
    seasonLimit: null,
  },
  defensePlusPlus: {
    id: "defensePlusPlus",
    name: "Defense++",
    type: "gameweek",
    description: "Earn 10 bonus points if you correctly predict clean sheets across all matches where you predicted them",
    icon: "🛡️",
    cooldown: 5,
    seasonLimit: null,
  },
  allInWeek: {
    id: "allInWeek",
    name: "All-In Week",
    type: "gameweek",
    description: "Doubles the entire gameweek score (including deductions)",
    icon: "🎯",
    cooldown: 0,
    seasonLimit: 4,
  },
};

/**
 * Get chip information by ID
 * @param {string} chipId - The chip identifier
 * @returns {Object} The chip information object
 */
export const getChipInfo = (chipId) => {
  return predictionChips[chipId] || { name: chipId, description: "" };
};

/**
 * Get chips by type
 * @param {string} type - The chip type ("match" or "gameweek")
 * @returns {Array} Array of chips of the specified type
 */
export const getChipsByType = (type) => {
  return Object.values(predictionChips).filter(chip => chip.type === type);
};

/**
 * Check if a chip is a gameweek-level multiplier
 * @param {string} chipId - The chip identifier
 * @returns {boolean} Whether the chip is a gameweek multiplier
 */
export const isGameweekMultiplier = (chipId) => {
  return chipId === "allInWeek";
};

/**
 * Check if a chip is a gameweek-level bonus chip
 * @param {string} chipId - The chip identifier
 * @returns {boolean} Whether the chip is a gameweek bonus chip
 */
export const isGameweekBonus = (chipId) => {
  return chipId === "defensePlusPlus";
};

/**
 * Check if a prediction correctly predicted a clean sheet
 * @param {Object} prediction - The prediction object
 * @returns {boolean} Whether a clean sheet was correctly predicted
 */
export const isCorrectCleanSheet = (prediction) => {
  const predictedCleanSheet = prediction.homeScore === 0 || prediction.awayScore === 0;
  const actualCleanSheet = prediction.actualHomeScore === 0 || prediction.actualAwayScore === 0;
  return predictedCleanSheet && actualCleanSheet && (prediction.status === "completed");
};

/**
 * Check if a scorer was correctly predicted
 * @param {string} scorer - The predicted scorer
 * @param {Array} actualScorers - Array of actual scorers
 * @returns {boolean} Whether the scorer was correctly predicted
 */
export const isCorrectScorer = (scorer, actualScorers) => {
  return actualScorers && actualScorers.includes(scorer);
};

/**
 * Calculate points from a prediction
 * @param {Object} prediction - The prediction object
 * @returns {Object} Breakdown of points and total
 */
export const calculatePredictionPoints = (prediction) => {
  if (prediction.status === "pending") {
    // For pending predictions, calculate potential maximum points
    
    // STEP 1: Base Points (only ONE of these applies)
    // We assume the best case: exact scoreline + all scorers correct
    let basePoints = 15; // Exact scoreline + all scorers = 15 points
    
    // STEP 2: Additional Points
    // Count predicted goalscorers (home + away)
    const homeScorers = prediction.homeScorers || [];
    const awayScorers = prediction.awayScorers || [];
    const totalPredictedScorers = homeScorers.length + awayScorers.length;
    
    // Calculate goalscorer points (2 points each)
    let goalscorerPoints = totalPredictedScorers * 2;
    
    // Apply Scorer Focus chip (doubles goalscorer points)
    if (prediction.chips?.includes("scorerFocus")) {
      goalscorerPoints *= 2;
    }
    
    // Own goal points (assume none for pending - can't predict max without knowing if predicted)
    const ownGoalPoints = 0;
    
    // No deductions for pending (we're calculating max potential)
    const deductionPoints = 0;
    
    // STEP 3: Subtotal before derby multiplier
    let subtotal = basePoints + goalscorerPoints + ownGoalPoints - deductionPoints;
    
    // STEP 4: Derby Match Multiplier (1.5x)
    // Check if this is a derby match (assume not for now - would need fixture data)
    const isDerby = prediction.isDerby || false;
    if (isDerby) {
      subtotal *= 1.5;
    }
    
    // STEP 5: Apply Match-Level Chip Multipliers
    let finalPoints = subtotal;
    if (prediction.chips?.includes("wildcard")) {
      finalPoints *= 3; // Wildcard: 3x
    } else if (prediction.chips?.includes("doubleDown")) {
      finalPoints *= 2; // Double Down: 2x
    }
    
    // Note: All-In Week is applied at gameweek level, not here
    
    return {
      basePoints,
      goalscorerPoints,
      ownGoalPoints,
      deductionPoints,
      subtotal,
      isDerby,
      derbyMultiplier: isDerby ? 1.5 : 1,
      pointsBeforeChipMultiplier: subtotal,
      finalPoints: Math.round(finalPoints), // Round to handle derby decimals
      hasWildcard: prediction.chips?.includes("wildcard") || false,
      hasDoubleDown: prediction.chips?.includes("doubleDown") || false,
      hasScorerFocus: prediction.chips?.includes("scorerFocus") || false,
      breakdown: {
        base: basePoints,
        scorers: goalscorerPoints,
        ownGoals: ownGoalPoints,
        deductions: deductionPoints,
        afterDerby: subtotal,
        chipMultiplier: prediction.chips?.includes("wildcard") ? 3 : 
                       prediction.chips?.includes("doubleDown") ? 2 : 1,
      }
    };
  }
  
  // For completed predictions, return actual points
  return {
    finalPoints: prediction.points || 0,
    completed: true
  };
};

/**
 * Calculate total gameweek points for a user, applying gameweek-level chips
 * @param {Array} predictions - Array of predictions for the gameweek
 * @param {Array} gameweekChips - Array of gameweek-level chips used
 * @returns {Object} Breakdown of gameweek points
 */
export const calculateGameweekPoints = (predictions, gameweekChips = []) => {
  let totalPoints = 0;
  let matchPoints = [];
  let defensePlusBonusPoints = 0;
  
  // Calculate points for each match
  predictions.forEach(prediction => {
    const matchResult = calculatePredictionPoints(prediction);
    matchPoints.push({
      matchId: prediction.matchId,
      points: matchResult.finalPoints,
      breakdown: matchResult
    });
    totalPoints += matchResult.finalPoints;
    
    // Calculate Defense++ bonus if chip is active
    // +10 for each correctly predicted clean sheet
    if (gameweekChips.includes("defensePlusPlus") && isCorrectCleanSheet(prediction)) {
      defensePlusBonusPoints += 10;
    }
  });
  
  // Add Defense++ bonus to total (before All-In Week multiplier)
  totalPoints += defensePlusBonusPoints;
  
  // Apply All-In Week multiplier if present (doubles everything including Defense++ bonus)
  const hasAllInWeek = gameweekChips.includes("allInWeek");
  if (hasAllInWeek) {
    totalPoints *= 2;
    defensePlusBonusPoints *= 2;
    matchPoints = matchPoints.map(match => ({
      ...match,
      points: match.points * 2
    }));
  }
  
  return {
    totalPoints,
    matchPoints,
    defensePlusBonusPoints,
    correctCleanSheets: predictions.filter(p => 
      gameweekChips.includes("defensePlusPlus") && isCorrectCleanSheet(p)
    ).length,
    hasAllInWeek,
    hasDefensePlusPlus: gameweekChips.includes("defensePlusPlus"),
    gameweekChips
  };
};