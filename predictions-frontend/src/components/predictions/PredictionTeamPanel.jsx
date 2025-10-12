import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon, CalendarIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { getTeamPredictionStats } from "../../utils/predictionUtils";
import { normalizeTeamName, getTeamLogo } from "../../utils/teamUtils";
import { getLogoUrl } from "../../utils/logoCache";
import { ThemeContext } from "../../context/ThemeContext";

// Rich Prediction Card Component
const PredictionCard = ({ prediction, onSelect, onEdit, teamLogos, theme }) => {
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
              {format(parseISO(prediction.date), 'MMM dd, HH:mm')}
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
                <div className={`text-xs font-medium mb-2 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-500"
                } font-outfit`}>
                  {prediction.homeTeam}
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
                  {prediction.awayTeam}
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

const PredictionTeamPanel = ({
  team,
  predictions,
  isExpanded,
  onToggle,
  onPredictionSelect,
  onPredictionEdit,
}) => {
  const { theme } = useContext(ThemeContext);
  const stats = getTeamPredictionStats(predictions);

  // Handle team logo with better caching and fallbacks
  const getTeamLogoSrc = (teamName) => {
    // Use the getLogoUrl helper first to try all variants with context logos
    if (teamLogos) {
      const logoUrl = getLogoUrl(teamName, teamLogos, normalizeTeamName);

      // If we got a non-placeholder logo, use it
      if (!logoUrl.includes("placeholder")) {
        return logoUrl;
      }
    }

    // Fall back to the utility function which uses local assets
    const logo = getTeamLogo(teamName);

    // Debug logging
    if (logo.includes("placeholder")) {
      console.log(
        `No logo found for ${teamName} in either context or local assets`
      );
      if (teamLogos) {
        console.log(
          "Available logo team names:",
          Object.keys(teamLogos).sort().join(", ")
        );
      }
    }

    return logo;
  };

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        theme === "dark"
          ? "bg-slate-800/50 border-slate-600/50"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Team header - clickable */}
      <div
        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
          theme === "dark" ? "bg-slate-900/60" : "hover:bg-gray-50"
        }`}
        onClick={() => onToggle(team)}
      >
        <div className="flex items-center">
          <img
            src={getTeamLogoSrc(team)}
            alt={team}
            className="w-8 h-8 object-contain mr-3"
          />
          <div>
            <h3
              className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {team}
            </h3>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-white/60" : "text-gray-500"
              }`}
            >
              {predictions.length} prediction
              {predictions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Accuracy Progress Bar */}
          <div
            className={`w-20 rounded-full h-1.5 overflow-hidden ${
              theme === "dark" ? "bg-slate-800/60" : "bg-gray-200"
            }`}
          >
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${stats.accuracy}%` }}
            ></div>
          </div>
          
          {/* Stats Display */}
          <div className="flex flex-col items-end">
            <div
              className={`text-xs font-medium ${
                theme === "dark" ? "text-white/90" : "text-gray-800"
              }`}
            >
              {stats.accuracy}% accuracy
            </div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-white/60" : "text-gray-500"
              }`}
            >
              {stats.correct}/{stats.correct + stats.incorrect} correct
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <MinusIcon
              className={`w-4 h-4 ${theme === "dark" ? "text-white/60" : "text-gray-400"}`}
            />
          ) : (
            <PlusIcon
              className={`w-4 h-4 ${theme === "dark" ? "text-white/60" : "text-gray-400"}`}
            />
          )}
        </div>
      </div>

      {/* Team predictions - collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t overflow-hidden ${
              theme === "dark" ? "border-slate-600/50 bg-slate-900/60" : "border-gray-200"
            }`}
          >
            <div className="p-4">

              {/* Predictions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((prediction) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    onSelect={onPredictionSelect}
                    onEdit={onPredictionEdit}
                    teamLogos={teamLogos}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionTeamPanel;
