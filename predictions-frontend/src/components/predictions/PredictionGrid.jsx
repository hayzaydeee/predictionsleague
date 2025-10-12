import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { 
  TargetIcon,
  CalendarIcon
} from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { filterPredictionsByQuery } from "../../utils/predictionUtils";
import { ThemeContext } from "../../context/ThemeContext";
import TeamLogo from "../ui/TeamLogo";
import { LOGO_SIZES } from "../../utils/teamLogos";

// Rich Prediction Card Component (consistent with teams/carousel views)
const RichPredictionCard = ({ prediction, onSelect, onEdit, teamLogos, theme }) => {
  const getGoalCounts = (scorers) => {
    if (!scorers || scorers.length === 0) return {};
    return scorers.reduce((counts, scorer) => {
      counts[scorer] = (counts[scorer] || 0) + 1;
      return counts;
    }, {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-6 transition-all cursor-pointer ${
        theme === "dark"
          ? "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      }`}
      onClick={() => onSelect?.(prediction)}
    >
      {/* Prediction Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            theme === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
          }`}>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <p className={`font-semibold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            } font-outfit`}>
              {prediction.homeTeam} vs {prediction.awayTeam}
            </p>
            <p className={`text-xs ${
              theme === "dark" ? "text-slate-500" : "text-slate-500"
            } font-outfit`}>
              GW{prediction.gameweek} • {format(parseISO(prediction.date), 'MMM dd, HH:mm')}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold font-outfit ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            {prediction.points !== null && prediction.points !== undefined ? prediction.points : '—'}
            {prediction.points !== null && prediction.points !== undefined && (
              <span className="text-xs font-medium ml-0.5">pts</span>
            )}
          </div>
          <div className={`text-xs font-medium font-outfit ${
            prediction.status === 'pending'
              ? theme === "dark" ? "text-amber-400" : "text-amber-600"
              : theme === "dark" ? "text-green-400" : "text-green-600"
          }`}>
            {prediction.status === 'pending' ? 'Pending' : 'Complete'}
          </div>
        </div>
      </div>

      {/* Score Prediction */}
      <div className={`p-4 rounded-lg mb-4 ${
        theme === "dark"
          ? "bg-slate-800/50 border-slate-600/30"
          : "bg-white border-slate-200"
      } border`}>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center flex-1">
            <div className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            } font-outfit`}>
              {prediction.homeScore}
            </div>
            <div className={`text-xs ${
              theme === "dark" ? "text-slate-500" : "text-slate-500"
            } font-outfit mt-1 truncate`}>
              {prediction.homeTeam}
            </div>
          </div>
          
          <div className={`text-lg font-bold ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          } font-outfit`}>
            —
          </div>
          
          <div className="text-center flex-1">
            <div className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            } font-outfit`}>
              {prediction.awayScore}
            </div>
            <div className={`text-xs ${
              theme === "dark" ? "text-slate-500" : "text-slate-500"
            } font-outfit mt-1 truncate`}>
              {prediction.awayTeam}
            </div>
          </div>
        </div>
      </div>

      {/* Predicted Scorers */}
      {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
        <div className={`p-4 rounded-lg mb-4 ${
          theme === "dark"
            ? "bg-slate-800/50 border-slate-600/30"
            : "bg-white border-slate-200"
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
                <div className="flex items-center gap-2 mb-2">
                  <TeamLogo 
                    teamName={prediction.homeTeam} 
                    size={LOGO_SIZES.xs}
                    className="flex-shrink-0"
                  />
                  <div className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-500" : "text-slate-500"
                  } font-outfit`}>
                    {prediction.homeTeam}
                  </div>
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
                <div className="flex items-center gap-2 mb-2">
                  <TeamLogo 
                    teamName={prediction.awayTeam} 
                    size={LOGO_SIZES.xs}
                    className="flex-shrink-0"
                  />
                  <div className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-500" : "text-slate-500"
                  } font-outfit`}>
                    {prediction.awayTeam}
                  </div>
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
  );
};

const PredictionGrid = ({
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPredictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <RichPredictionCard
                prediction={prediction}
                onSelect={handlePredictionClick}
                onEdit={onEditClick}
                teamLogos={teamLogos}
                theme={theme}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PredictionGrid;
