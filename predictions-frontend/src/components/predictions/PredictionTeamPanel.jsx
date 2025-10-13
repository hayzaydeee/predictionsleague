import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from "@radix-ui/react-icons";
import { getTeamPredictionStats } from "../../utils/predictionUtils";
import { normalizeTeamName } from "../../utils/teamUtils";
import { ThemeContext } from "../../context/ThemeContext";
import TeamLogo from "../ui/TeamLogo";
import { LOGO_SIZES } from "../../utils/teamLogos";
import PredictionCard from "./PredictionCard";

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

  // Team logos now handled by TeamLogo component - no custom function needed
  const normalizedTeamName = normalizeTeamName(team);

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        theme === "dark"
          ? "bg-slate-800/50 border-slate-600/50"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Team Header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
          theme === "dark" ? "bg-slate-900/60 hover:bg-slate-800/60" : "hover:bg-gray-50"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          <TeamLogo 
            teamName={team} 
            size={LOGO_SIZES.md}
            className="mr-3"
          />
          <div>
            <h3 className={`font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {team}
            </h3>
            <div className={`text-sm ${
              theme === "dark" ? "text-white/60" : "text-gray-500"
            }`}>
              {stats.total} prediction{stats.total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats Display */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${
                theme === "dark" ? "text-teal-400" : "text-teal-600"
              }`}>
                {stats.totalPoints}
              </span>
              <span className={`text-sm font-medium ${
                theme === "dark" ? "text-teal-500" : "text-teal-500"
              }`}>
                pts
              </span>
            </div>
            <div className={`text-xs ${
              theme === "dark" ? "text-white/60" : "text-gray-500"
            }`}>
              {stats.completed}/{stats.total} complete
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <MinusIcon className={`w-5 h-5 ${theme === "dark" ? "text-white/60" : "text-gray-400"}`} />
          ) : (
            <PlusIcon className={`w-5 h-5 ${theme === "dark" ? "text-white/60" : "text-gray-400"}`} />
          )}
        </div>
      </div>

      {/* Team Predictions - Expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
                    mode="personal"
                    onSelect={onPredictionSelect}
                    onEdit={onPredictionEdit}
                    size="normal"
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

