import React, { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  TargetIcon,
  ClockIcon
} from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";

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
  const [carouselIndex, setCarouselIndex] = useState(0);
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

  // Helper function to count goals per scorer
  const getGoalCounts = (scorers) => {
    if (!scorers || scorers.length === 0) return {};
    return scorers.reduce((counts, scorer) => {
      counts[scorer] = (counts[scorer] || 0) + 1;
      return counts;
    }, {});
  };

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center py-16 ${
          theme === "dark"
            ? "bg-slate-800/30 border-slate-700/50"
            : "bg-white border-slate-200"
        } backdrop-blur-sm border rounded-xl shadow-sm`}
      >
        <CalendarIcon className={`w-16 h-16 mx-auto mb-4 ${
          theme === "dark" ? "text-slate-500" : "text-slate-400"
        }`} />
        <h3 className={`text-xl font-semibold ${
          theme === "dark" ? "text-white" : "text-slate-900"
        } mb-2 font-outfit`}>
          No Predictions Found
        </h3>
        <p className={`${
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        } font-outfit`}>
          No predictions available for Gameweek {currentGameweek}
        </p>
      </motion.div>
    );
  }

  const currentMatch = matches[activeMatchIndex];
  const itemsPerView = 3;
  const totalItems = currentMatch.predictions.length;
  // Calculate how many "pages" we need (each page shows itemsPerView cards)
  const totalPages = Math.ceil(totalItems / itemsPerView);
  const maxCarouselIndex = Math.max(0, totalPages - 1);
  const canScrollLeft = carouselIndex > 0;
  const canScrollRight = carouselIndex < maxCarouselIndex;

  // Calculate the transform percentage to move by full viewport widths
  const getTransformX = () => {
    if (totalItems <= itemsPerView) return 0;
    
    // Move by full viewport widths (100% per page)
    return -(carouselIndex * 100);
  };

  const handlePredictionClick = (prediction) => {
    setSelectedPrediction(prediction);
    if (onPredictionSelect) {
      onPredictionSelect(prediction);
    }
  };

  const handleMatchChange = (matchIndex) => {
    setActiveMatchIndex(matchIndex);
    setSelectedPrediction(null);
    setCarouselIndex(0); // Reset carousel when changing matches
  };

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCarouselIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setCarouselIndex(prev => Math.min(maxCarouselIndex, prev + 1));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          theme === "dark" 
            ? "bg-slate-800/50 border-slate-700" 
            : "bg-slate-50 border-slate-200"
        } border`}>
          <TargetIcon className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          } font-outfit`}>
            Gameweek {currentGameweek}
          </h3>
          <p className={`text-sm ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          } font-outfit`}>
            League Predictions
          </p>
        </div>
      </div>

      {/* Match Selector Tabs */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 min-w-max pb-2">
          {matches.map((match, index) => (
            <button
              key={`${match.matchInfo.homeTeam}_vs_${match.matchInfo.awayTeam}`}
              onClick={() => handleMatchChange(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap font-outfit ${
                index === activeMatchIndex
                  ? "bg-teal-600 text-white"
                  : theme === "dark"
                  ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {match.matchInfo.homeTeam} vs {match.matchInfo.awayTeam}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                index === activeMatchIndex
                  ? "bg-white/20 text-white"
                  : "bg-teal-600 text-white"
              }`}>
                {match.predictions.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Match Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMatchIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`${
            theme === "dark"
              ? "bg-slate-800/30 border-slate-700/50"
              : "bg-white border-slate-200"
          } backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden`}
        >
          {/* Match Header */}
          <div className={`p-6 border-b ${
            theme === "dark" ? "border-slate-700/50" : "border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Home Team */}
                <div className="flex items-center space-x-3">
                  <img
                    src={teamLogos[currentMatch.matchInfo.homeTeam] || `https://via.placeholder.com/40?text=${currentMatch.matchInfo.homeTeam.substring(0, 3)}`}
                    alt={currentMatch.matchInfo.homeTeam}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <h4 className={`font-bold text-lg ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    } font-outfit`}>
                      {currentMatch.matchInfo.homeTeam}
                    </h4>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-slate-500" : "text-slate-500"
                    } font-outfit`}>
                      Home
                    </p>
                  </div>
                </div>
                
                {/* VS */}
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-bold ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  } font-outfit`}>
                    VS
                  </span>
                  <span className={`text-xs ${
                    theme === "dark" ? "text-slate-500" : "text-slate-500"
                  } font-outfit`}>
                    {format(parseISO(currentMatch.matchInfo.date), 'MMM dd')}
                  </span>
                </div>
                
                {/* Away Team */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <h4 className={`font-bold text-lg ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    } font-outfit`}>
                      {currentMatch.matchInfo.awayTeam}
                    </h4>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-slate-500" : "text-slate-500"
                    } font-outfit`}>
                      Away
                    </p>
                  </div>
                  <img
                    src={teamLogos[currentMatch.matchInfo.awayTeam] || `https://via.placeholder.com/40?text=${currentMatch.matchInfo.awayTeam.substring(0, 3)}`}
                    alt={currentMatch.matchInfo.awayTeam}
                    className="w-10 h-10 rounded-lg"
                  />
                </div>
              </div>

              {/* Match Time */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`w-4 h-4 ${
                    theme === "dark" ? "text-slate-500" : "text-slate-500"
                  }`} />
                  <span className={`text-sm font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  } font-outfit`}>
                    {format(parseISO(currentMatch.matchInfo.date), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictions Carousel */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className={`font-semibold text-lg ${
                theme === "dark" ? "text-white" : "text-slate-900"
              } font-outfit`}>
                Member Predictions
              </h4>
              
              {/* Carousel Controls */}
              {currentMatch.predictions.length > itemsPerView && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={`p-2 rounded-lg transition-colors ${
                      !canScrollLeft
                        ? "opacity-50 cursor-not-allowed"
                        : theme === "dark"
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <span className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  } font-outfit`}>
                    {(carouselIndex * itemsPerView) + 1}-{Math.min((carouselIndex + 1) * itemsPerView, currentMatch.predictions.length)} of {currentMatch.predictions.length}
                  </span>
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={`p-2 rounded-lg transition-colors ${
                      !canScrollRight
                        ? "opacity-50 cursor-not-allowed"
                        : theme === "dark"
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Predictions Cards Container */}
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-4"
                animate={{
                  x: `${getTransformX()}%`
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {currentMatch.predictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handlePredictionClick(prediction)}
                    className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
                        : "bg-white border-slate-200 hover:shadow-md"
                    } backdrop-blur-sm border rounded-xl p-5 ${
                      selectedPrediction?.id === prediction.id
                        ? "ring-2 ring-teal-500 shadow-lg"
                        : ""
                    }`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)`
                    }}
                  >
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          theme === "dark" ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"
                        }`}>
                          {prediction.userDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          } font-outfit`}>
                            {prediction.userDisplayName}
                          </p>
                          <p className={`text-xs ${
                            theme === "dark" ? "text-slate-500" : "text-slate-500"
                          } font-outfit`}>
                            {format(parseISO(prediction.predictedAt || prediction.date), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold font-outfit ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>
                          {prediction.points !== null ? prediction.points : '—'}
                          {prediction.points !== null && (
                            <span className="text-xs font-medium ml-0.5">pts</span>
                          )}
                        </div>
                        <div className={`text-xs font-medium font-outfit ${
                          prediction.status === 'pending'
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}>
                          {prediction.status === 'pending' ? 'Pending' : 'Complete'}
                        </div>
                      </div>
                    </div>

                    {/* Score Prediction */}
                    <div className={`p-4 rounded-lg mb-4 ${
                      theme === "dark"
                        ? "bg-slate-700/30 border-slate-600/30"
                        : "bg-slate-50 border-slate-200"
                    } border`}>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          } font-outfit`}>
                            {prediction.homeScore}
                          </div>
                          <div className={`text-xs ${
                            theme === "dark" ? "text-slate-500" : "text-slate-500"
                          } font-outfit mt-1 truncate`}>
                            {currentMatch.matchInfo.homeTeam}
                          </div>
                        </div>
                        
                        <div className={`text-lg font-bold ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        } font-outfit`}>
                          —
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          } font-outfit`}>
                            {prediction.awayScore}
                          </div>
                          <div className={`text-xs ${
                            theme === "dark" ? "text-slate-500" : "text-slate-500"
                          } font-outfit mt-1 truncate`}>
                            {currentMatch.matchInfo.awayTeam}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Predicted Scorers */}
                    {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        theme === "dark"
                          ? "bg-slate-700/30 border-slate-600/30"
                          : "bg-slate-50 border-slate-200"
                      } border`}>
                        <div className={`text-xs font-medium mb-3 ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        } font-outfit`}>
                          Predicted Scorers
                        </div>
                        
                        <div className="space-y-3">
                          {/* Home Team Scorers */}
                          {prediction.homeScorers?.length > 0 && (
                            <div>
                              <div className={`text-xs font-medium mb-2 ${
                                theme === "dark" ? "text-slate-500" : "text-slate-500"
                              } font-outfit`}>
                                {currentMatch.matchInfo.homeTeam}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(getGoalCounts(prediction.homeScorers)).map(([scorer, count]) => (
                                  <div
                                    key={scorer}
                                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium font-outfit ${
                                      theme === "dark"
                                        ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                                        : "bg-blue-100 text-blue-700 border border-blue-200"
                                    }`}
                                  >
                                    {scorer}
                                    {count > 1 && (
                                      <span className={`absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center font-bold ${
                                        theme === "dark"
                                          ? "bg-blue-600 text-white"
                                          : "bg-blue-600 text-white"
                                      }`}>
                                        {count}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Away Team Scorers */}
                          {prediction.awayScorers?.length > 0 && (
                            <div>
                              <div className={`text-xs font-medium mb-2 ${
                                theme === "dark" ? "text-slate-500" : "text-slate-500"
                              } font-outfit`}>
                                {currentMatch.matchInfo.awayTeam}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(getGoalCounts(prediction.awayScorers)).map(([scorer, count]) => (
                                  <div
                                    key={scorer}
                                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium font-outfit ${
                                      theme === "dark"
                                        ? "bg-red-900/30 text-red-400 border border-red-800/50"
                                        : "bg-red-100 text-red-700 border border-red-200"
                                    }`}
                                  >
                                    {scorer}
                                    {count > 1 && (
                                      <span className={`absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center font-bold ${
                                        theme === "dark"
                                          ? "bg-red-600 text-white"
                                          : "bg-red-600 text-white"
                                      }`}>
                                        {count}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* No Scorers Predicted */}
                          {(!prediction.homeScorers || prediction.homeScorers.length === 0) && 
                           (!prediction.awayScorers || prediction.awayScorers.length === 0) && (
                            <div className={`text-center py-2 text-xs ${
                              theme === "dark" ? "text-slate-500" : "text-slate-500"
                            } font-outfit`}>
                              No scorers predicted
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chips Used */}
                    {prediction.chips?.length > 0 && (
                      <div className={`border-t pt-3 ${
                        theme === "dark" ? "border-slate-700/50" : "border-slate-200"
                      }`}>
                        <p className={`text-xs ${
                          theme === "dark" ? "text-slate-500" : "text-slate-500"
                        } mb-2 font-outfit`}>
                          Chips Used:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.chips.map((chip, chipIndex) => (
                            <span
                              key={chipIndex}
                              className={`px-2 py-1 text-xs rounded-full font-medium font-outfit ${
                                theme === "dark"
                                  ? "bg-teal-900/30 text-teal-400"
                                  : "bg-teal-100 text-teal-700"
                              }`}
                            >
                              {chip.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GameweekPredictionsCarousel;
