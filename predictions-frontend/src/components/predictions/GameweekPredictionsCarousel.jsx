import React, { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  PersonIcon,
  TargetIcon,
  StarIcon,
  ClockIcon
} from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";
import { getThemeStyles, backgrounds, text, buttons } from "../../utils/themeUtils";

const GameweekPredictionsCarousel = ({
  predictions,
  currentGameweek = 15,
  onPredictionSelect,
  teamLogos = {},
  isReadOnly = true
}) => {
  const { theme } = useContext(ThemeContext);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const carouselRef = useRef(null);

  // Group predictions by match within the current gameweek
  const gameweekPredictions = predictions.filter(p => p.gameweek === currentGameweek);
  
  // Group by matchId to get all predictions for each match
  const predictionsByMatch = gameweekPredictions.reduce((groups, prediction) => {
    const matchKey = `${prediction.homeTeam}_vs_${prediction.awayTeam}`;
    if (!groups[matchKey]) {
      groups[matchKey] = {
        matchInfo: {
          homeTeam: prediction.homeTeam,
          awayTeam: prediction.awayTeam,
          date: prediction.date,
          gameweek: prediction.gameweek,
          matchId: prediction.matchId
        },
        predictions: []
      };
    }
    groups[matchKey].predictions.push(prediction);
    return groups;
  }, {});

  const matches = Object.values(predictionsByMatch);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center py-16 ${getThemeStyles(theme, backgrounds.secondary)} rounded-xl`}
      >
        <CalendarIcon className={`w-16 h-16 mx-auto mb-4 ${getThemeStyles(theme, text.muted)}`} />
        <h3 className={`text-xl font-semibold ${getThemeStyles(theme, text.primary)} mb-2 font-outfit`}>
          No Predictions Found
        </h3>
        <p className={`${getThemeStyles(theme, text.secondary)} font-outfit`}>
          No predictions available for Gameweek {currentGameweek}
        </p>
      </motion.div>
    );
  }

  const currentMatch = matches[activeMatchIndex];

  // Navigation handlers
  const goToNext = () => {
    setActiveMatchIndex((prev) => (prev + 1) % matches.length);
  };

  const goToPrevious = () => {
    setActiveMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handlePredictionClick = (prediction) => {
    setSelectedPrediction(prediction);
    if (onPredictionSelect) {
      onPredictionSelect(prediction);
    }
  };

  // Get chip color
  const getChipColor = (chip) => {
    switch (chip) {
      case 'DOUBLE_DOWN':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'WILDCARD':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'SCORER_FOCUS':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getThemeStyles(theme, backgrounds.secondary)}`}>
            <TargetIcon className={`w-5 h-5 ${getThemeStyles(theme, text.accent)}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${getThemeStyles(theme, text.primary)} font-outfit`}>
              Gameweek {currentGameweek}
            </h3>
            <p className={`text-sm ${getThemeStyles(theme, text.secondary)} font-outfit`}>
              League Predictions Overview
            </p>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={matches.length <= 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              matches.length <= 1
                ? 'opacity-30 cursor-not-allowed'
                : `${getThemeStyles(theme, buttons.secondary)} hover:scale-105 active:scale-95`
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getThemeStyles(theme, backgrounds.secondary)} ${getThemeStyles(theme, text.secondary)}`}>
            {activeMatchIndex + 1} of {matches.length}
          </div>
          
          <button
            onClick={goToNext}
            disabled={matches.length <= 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              matches.length <= 1
                ? 'opacity-30 cursor-not-allowed'
                : `${getThemeStyles(theme, buttons.secondary)} hover:scale-105 active:scale-95`
            }`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Match Tabs */}
      <motion.div variants={itemVariants} className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 min-w-max pb-1">
            {matches.map((match, index) => (
              <motion.button
                key={`${match.matchInfo.homeTeam}_vs_${match.matchInfo.awayTeam}`}
                onClick={() => setActiveMatchIndex(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  index === activeMatchIndex
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                    : `${getThemeStyles(theme, backgrounds.secondary)} ${getThemeStyles(theme, text.secondary)} hover:${getThemeStyles(theme, backgrounds.card)} hover:shadow-md`
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-outfit">
                    {match.matchInfo.homeTeam} vs {match.matchInfo.awayTeam}
                  </span>
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    index === activeMatchIndex
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  }`}>
                    <PersonIcon className="w-3 h-3" />
                    <span>{match.predictions.length}</span>
                  </div>
                </div>
                
                {/* Active indicator */}
                {index === activeMatchIndex && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Current Match Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMatchIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`${getThemeStyles(theme, backgrounds.secondary)} rounded-2xl overflow-hidden shadow-lg`}
        >
          {/* Match Header */}
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              {/* Teams */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={teamLogos[currentMatch.matchInfo.homeTeam] || `https://via.placeholder.com/40?text=${currentMatch.matchInfo.homeTeam.substring(0, 3)}`}
                      alt={currentMatch.matchInfo.homeTeam}
                      className="w-10 h-10 rounded-lg shadow-md"
                    />
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${getThemeStyles(theme, text.primary)} font-outfit`}>
                      {currentMatch.matchInfo.homeTeam}
                    </h4>
                    <p className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit`}>Home</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getThemeStyles(theme, backgrounds.card)} ${getThemeStyles(theme, text.secondary)}`}>
                    VS
                  </div>
                  <div className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit`}>
                    {format(parseISO(currentMatch.matchInfo.date), 'MMM dd')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className={`font-bold text-lg ${getThemeStyles(theme, text.primary)} font-outfit text-right`}>
                      {currentMatch.matchInfo.awayTeam}
                    </h4>
                    <p className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit text-right`}>Away</p>
                  </div>
                  <div className="relative">
                    <img
                      src={teamLogos[currentMatch.matchInfo.awayTeam] || `https://via.placeholder.com/40?text=${currentMatch.matchInfo.awayTeam.substring(0, 3)}`}
                      alt={currentMatch.matchInfo.awayTeam}
                      className="w-10 h-10 rounded-lg shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`w-4 h-4 ${getThemeStyles(theme, text.muted)}`} />
                  <span className={`text-sm font-medium ${getThemeStyles(theme, text.secondary)} font-outfit`}>
                    {format(parseISO(currentMatch.matchInfo.date), 'HH:mm')}
                  </span>
                </div>
                <p className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit mt-1`}>
                  Kick-off time
                </p>
              </div>
            </div>
          </div>

          {/* Predictions Grid */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className={`font-semibold text-lg ${getThemeStyles(theme, text.primary)} font-outfit flex items-center`}>
                Member Predictions
                <span className="ml-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                  {currentMatch.predictions.length} predictions
                </span>
              </h4>
            </div>
            
            <div ref={carouselRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentMatch.predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePredictionClick(prediction)}
                  className={`group relative ${getThemeStyles(theme, backgrounds.card)} rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    selectedPrediction?.id === prediction.id
                      ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20'
                      : 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5'
                  }`}
                >
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        prediction.correct === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        prediction.correct === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {prediction.userDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold ${getThemeStyles(theme, text.primary)} font-outfit`}>
                          {prediction.userDisplayName}
                        </p>
                        <p className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit flex items-center`}>
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {format(parseISO(prediction.predictedAt || prediction.date), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold font-outfit ${
                        prediction.correct === null ? getThemeStyles(theme, text.secondary) : 
                        prediction.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {prediction.points !== null ? `${prediction.points}` : '—'}
                        <span className="text-xs font-medium ml-0.5">pts</span>
                      </div>
                      <div className={`text-xs font-medium font-outfit ${
                        prediction.status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                        prediction.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {prediction.status === 'pending' ? 'Pending' : prediction.correct ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                  </div>

                  {/* Score Prediction */}
                  <div className={`relative p-4 rounded-lg mb-4 ${getThemeStyles(theme, backgrounds.secondary)}`}>
                    <div className="flex items-center justify-center space-x-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getThemeStyles(theme, text.primary)} font-outfit`}>
                          {prediction.homeScore}
                        </div>
                        <div className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit mt-1 truncate max-w-[60px]`}>
                          {currentMatch.matchInfo.homeTeam}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-0.5 ${getThemeStyles(theme, backgrounds.card)} mb-1`}></div>
                        <span className={`text-xs font-medium ${getThemeStyles(theme, text.muted)} font-outfit`}>VS</span>
                        <div className={`w-8 h-0.5 ${getThemeStyles(theme, backgrounds.card)} mt-1`}></div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getThemeStyles(theme, text.primary)} font-outfit`}>
                          {prediction.awayScore}
                        </div>
                        <div className={`text-xs ${getThemeStyles(theme, text.muted)} font-outfit mt-1 truncate max-w-[60px]`}>
                          {currentMatch.matchInfo.awayTeam}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scorers Preview */}
                  {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
                    <div className={`border-t pt-3 mb-3 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}>
                      <p className={`text-xs ${getThemeStyles(theme, text.muted)} mb-2 font-outfit flex items-center`}>
                        <StarIcon className="w-3 h-3 mr-1" />
                        Predicted Scorers
                      </p>
                      <div className="space-y-2">
                        {prediction.homeScorers?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {prediction.homeScorers.slice(0, 2).map((scorer, i) => (
                              <span key={i} className={`px-2 py-1 rounded-md text-xs font-medium ${getThemeStyles(theme, backgrounds.card)} ${getThemeStyles(theme, text.secondary)}`}>
                                {scorer}
                              </span>
                            ))}
                            {prediction.homeScorers.length > 2 && (
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getThemeStyles(theme, text.muted)}`}>
                                +{prediction.homeScorers.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {prediction.awayScorers?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {prediction.awayScorers.slice(0, 2).map((scorer, i) => (
                              <span key={i} className={`px-2 py-1 rounded-md text-xs font-medium ${getThemeStyles(theme, backgrounds.card)} ${getThemeStyles(theme, text.secondary)}`}>
                                {scorer}
                              </span>
                            ))}
                            {prediction.awayScorers.length > 2 && (
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getThemeStyles(theme, text.muted)}`}>
                                +{prediction.awayScorers.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chips Used */}
                  {prediction.chips?.length > 0 && (
                    <div className={`border-t pt-3 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'}`}>
                      <p className={`text-xs ${getThemeStyles(theme, text.muted)} mb-2 font-outfit`}>Chips Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.chips.map((chip, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full font-medium font-outfit ${getChipColor(chip)}`}
                          >
                            {chip.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selection indicator */}
                  {selectedPrediction?.id === prediction.id && (
                    <motion.div
                      layoutId="selectedCard"
                      className="absolute inset-0 rounded-xl ring-2 ring-teal-500 pointer-events-none"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GameweekPredictionsCarousel;
