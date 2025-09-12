/**
 * Utilities for handling prediction chips
 */

// Chip definitions
export const predictionChips = {
  doubleDown: {
    id: "doubleDown",
    name: "Double Down",
    type: "match",
    description: "Double all points earned from this match",
    icon: "2x",
  },
  wildcard: {
    id: "wildcard",
    name: "Wildcard",
    type: "match",
    description: "Triple all points earned from this match",
    icon: "3x",
  },
  opportunist: {
    id: "opportunist",
    name: "Opportunist",
    type: "match",
    description: "Change predictions up to 30 min before kickoff",
    icon: "⏱️",
  },
  scorerFocus: {
    id: "scorerFocus",
    name: "Scorer Focus",
    type: "match",
    description: "Double all points from goalscorer predictions",
    icon: "⚽",
  },
  defensePlusPlus: {
    id: "defensePlusPlus",
    name: "Defense++",
    type: "gameweek",
    description:
      "Earn +10 bonus points for each match where you correctly predict a clean sheet.",
    icon: "🛡️",
  },
  allInWeek: {
    id: "allInWeek",
    name: "All-In Week",
    type: "gameweek",
    description: "Double all points earned from this week's matches",
    icon: "🎯",
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
    // Base points calculation
    const outcomePoints = 5;
    const exactScorePoints = 10;
    const baseGoalScorerPoints = (prediction.homeScore + prediction.awayScore) * 2;
    
    // Calculate clean sheet bonus
    const isCleanSheet = prediction.homeScore === 0 || prediction.awayScore === 0;
    const defensePlusBonus = prediction.chips.includes("defensePlusPlus") && isCleanSheet ? 10 : 0;
    
    // Calculate scorer focus bonus
    const scorerFocusBonus = prediction.chips.includes("scorerFocus") ? baseGoalScorerPoints : 0;
    
    // Calculate base points before multipliers
    const pointsBeforeMultiplier = outcomePoints + exactScorePoints + baseGoalScorerPoints + 
                                  defensePlusBonus + scorerFocusBonus;
    
    // Apply multipliers (Wild card has precedence over Double Down and All-In Week)
    let finalPoints = pointsBeforeMultiplier;
    if (prediction.chips.includes("wildcard")) {
      finalPoints = pointsBeforeMultiplier * 3;
    } else if (prediction.chips.includes("doubleDown") || prediction.chips.includes("allInWeek")) {
      finalPoints = pointsBeforeMultiplier * 2;
    }
    
    return {
      outcomePoints,
      exactScorePoints,
      baseGoalScorerPoints,
      defensePlusBonus,
      scorerFocusBonus,
      pointsBeforeMultiplier,
      finalPoints,
      hasWildcard: prediction.chips.includes("wildcard"),
      hasDoubleDown: prediction.chips.includes("doubleDown"),
      hasAllInWeek: prediction.chips.includes("allInWeek"),
    };
  }
  
  return {
    finalPoints: prediction.points || 0
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
  
  // Calculate points for each match
  predictions.forEach(prediction => {
    const matchResult = calculatePredictionPoints(prediction);
    matchPoints.push({
      matchId: prediction.matchId,
      points: matchResult.finalPoints,
      breakdown: matchResult
    });
    totalPoints += matchResult.finalPoints;
  });
  
  // Apply All-In Week multiplier if present
  const hasAllInWeek = gameweekChips.includes("allInWeek");
  if (hasAllInWeek) {
    totalPoints *= 2;
    matchPoints = matchPoints.map(match => ({
      ...match,
      points: match.points * 2
    }));
  }
  
  return {
    totalPoints,
    matchPoints,
    hasAllInWeek,
    gameweekChips
  };
};