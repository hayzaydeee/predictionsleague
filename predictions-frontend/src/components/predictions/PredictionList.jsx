import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { 
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  ClockIcon
} from "@radix-ui/react-icons";
import { filterPredictionsByQuery } from "../../utils/predictionUtils";
import EmptyState from "../common/EmptyState";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";

const PredictionList = ({
  predictions,
  onPredictionSelect,
  onEditClick,
  teamLogos = {},
  searchQuery = "",
  mode = "personal" // "personal" or "league"
}) => {
  const { theme } = useContext(ThemeContext);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Filter predictions based on search query
  const filteredPredictions = mode === "personal" 
    ? filterPredictionsByQuery(predictions, searchQuery)
    : predictions.filter(prediction => {
        if (!searchQuery) return true;
        
        const searchLower = searchQuery.toLowerCase();
        return (
          prediction.userDisplayName?.toLowerCase().includes(searchLower) ||
          prediction.homeTeam.toLowerCase().includes(searchLower) ||
          prediction.awayTeam.toLowerCase().includes(searchLower) ||
          `${prediction.homeTeam} vs ${prediction.awayTeam}`.toLowerCase().includes(searchLower)
        );
      });

  // Handle selection
  const handlePredictionClick = (prediction) => {
    setSelectedPrediction(prediction);
    if (onPredictionSelect) {
      onPredictionSelect(prediction);
    }
  };

  // Helper function for goal counts (league mode)
  const getGoalCounts = (scorers) => {
    if (!scorers || scorers.length === 0) return {};
    return scorers.reduce((counts, scorer) => {
      counts[scorer] = (counts[scorer] || 0) + 1;
      return counts;
    }, {});
  };

  // Sort predictions - league by most recent, personal by date
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (mode === "personal") {
      return new Date(a.date) - new Date(b.date); // Chronological for personal
    } else {
      return new Date(b.predictedAt || b.date) - new Date(a.predictedAt || a.date); // Most recent first for league
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {sortedPredictions.length === 0 ? (
        <div className={`text-center py-12 ${
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        }`}>
          <TargetIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium font-outfit">No predictions found</p>
          <p className="text-sm mt-2">
            {searchQuery ? "Try adjusting your search terms." : "Member predictions will appear here."}
          </p>
        </div>
      ) : (
        sortedPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onPredictionSelect?.(prediction)}
            className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
              theme === "dark"
                ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
                : "bg-white border-slate-200 hover:shadow-md hover:border-slate-300"
            } backdrop-blur-sm`}
          >
            {/* Header with Member/Match Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {mode === "league" ? (
                  <>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      theme === "dark" ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"
                    }`}>
                      {prediction.userDisplayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      } font-outfit`}>
                        {prediction.userDisplayName || 'Unknown User'}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <CalendarIcon className={`w-3 h-3 ${
                          theme === "dark" ? "text-slate-500" : "text-slate-500"
                        }`} />
                        <span className={`${
                          theme === "dark" ? "text-slate-500" : "text-slate-500"
                        } font-outfit`}>
                          GW{prediction.gameweek} • {format(parseISO(prediction.predictedAt || prediction.date), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      theme === "dark" ? "bg-teal-900/30 text-teal-300" : "bg-teal-100 text-teal-700"
                    }`}>
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      } font-outfit`}>
                        {format(parseISO(prediction.date), 'EEEE, MMMM do')}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <ClockIcon className={`w-3 h-3 ${
                          theme === "dark" ? "text-slate-500" : "text-slate-500"
                        }`} />
                        <span className={`${
                          theme === "dark" ? "text-slate-500" : "text-slate-500"
                        } font-outfit`}>
                          GW{prediction.gameweek} • {format(parseISO(prediction.date), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-right">
                {mode === "league" ? (
                  <>
                    <div className={`text-lg font-bold ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    } font-outfit`}>
                      {prediction.points !== null ? `${prediction.points}pts` : '—'}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      prediction.status === 'pending'
                        ? theme === "dark"
                          ? "bg-amber-900/30 text-amber-400"
                          : "bg-amber-100 text-amber-700"
                        : theme === "dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-700"
                    } font-outfit font-medium`}>
                      {prediction.status}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-lg font-bold ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    } font-outfit`}>
                      {prediction.homeScore}-{prediction.awayScore}
                    </div>
                    {onEditClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(prediction);
                        }}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          theme === "dark"
                            ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        } font-outfit font-medium`}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Match Details */}
            <div className={`p-4 rounded-lg mb-4 ${
              theme === "dark"
                ? "bg-slate-700/30 border-slate-600/30"
                : "bg-slate-50 border-slate-200"
            } border`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <img
                    src={teamLogos[prediction.homeTeam] || `https://via.placeholder.com/32?text=${prediction.homeTeam.substring(0, 3)}`}
                    alt={prediction.homeTeam}
                    className="w-8 h-8 rounded"
                  />
                  <span className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  } font-outfit`}>
                    {prediction.homeTeam}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                } font-outfit`}>
                  {prediction.homeScore}
                </div>
              </div>
              
              <div className="flex items-center justify-center my-2">
                <div className={`text-sm font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                } font-outfit`}>
                  VS
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={teamLogos[prediction.awayTeam] || `https://via.placeholder.com/32?text=${prediction.awayTeam.substring(0, 3)}`}
                    alt={prediction.awayTeam}
                    className="w-8 h-8 rounded"
                  />
                  <span className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  } font-outfit`}>
                    {prediction.awayTeam}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                } font-outfit`}>
                  {prediction.awayScore}
                </div>
              </div>
            </div>

            {/* Predicted Scorers */}
            {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
              <div className={`p-3 rounded-lg mb-4 ${
                theme === "dark"
                  ? "bg-slate-700/20 border-slate-600/20"
                  : "bg-slate-50/50 border-slate-200/50"
              } border`}>
                <div className={`text-xs font-medium mb-2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                } font-outfit`}>
                  Predicted Scorers
                </div>
                
                <div className="space-y-2">
                  {prediction.homeScorers?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(getGoalCounts(prediction.homeScorers)).map(([scorer, count]) => (
                        <span
                          key={scorer}
                          className={`relative text-xs px-2 py-1 rounded-full font-medium ${
                            theme === "dark"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-blue-100 text-blue-700"
                          } font-outfit`}
                        >
                          {scorer}
                          {count > 1 && (
                            <span className="ml-1 text-xs opacity-75">x{count}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {prediction.awayScorers?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(getGoalCounts(prediction.awayScorers)).map(([scorer, count]) => (
                        <span
                          key={scorer}
                          className={`relative text-xs px-2 py-1 rounded-full font-medium ${
                            theme === "dark"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-red-100 text-red-700"
                          } font-outfit`}
                        >
                          {scorer}
                          {count > 1 && (
                            <span className="ml-1 text-xs opacity-75">x{count}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chips */}
            {prediction.chips?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {prediction.chips.map((chip, chipIndex) => (
                  <span
                    key={chipIndex}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      theme === "dark"
                        ? "bg-teal-900/30 text-teal-400"
                        : "bg-teal-100 text-teal-700"
                    } font-outfit`}
                  >
                    {chip.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default PredictionList;
