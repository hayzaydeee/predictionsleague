import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  ClockIcon
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import EmptyState from "../common/EmptyState";

const PredictionsByMember = ({
  predictions = [],
  onPredictionSelect,
  onEditClick,
  teamLogos = {},
  searchQuery = "",
  mode = "league", // "personal" | "league"
  currentGameweek
}) => {
  const { theme } = useContext(ThemeContext);
  const [expandedMembers, setExpandedMembers] = useState(new Set());

  // Determine component behavior based on mode
  const isLeagueMode = mode === "league";

  // Filter predictions based on search query
  const filteredPredictions = searchQuery 
    ? predictions.filter(prediction => 
        (isLeagueMode && prediction.userDisplayName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prediction.homeTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.awayTeam?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : predictions;

  // Group predictions by member/user
  const predictionsByMember = filteredPredictions.reduce((groups, prediction) => {
    const memberId = isLeagueMode ? prediction.userId : 'personal';
    if (!groups[memberId]) {
      groups[memberId] = {
        memberInfo: {
          id: memberId,
          name: isLeagueMode ? (prediction.userDisplayName || 'Unknown User') : 'Your Predictions',
          avatar: isLeagueMode ? prediction.userDisplayName?.charAt(0).toUpperCase() || '?' : 'Y'
        },
        predictions: []
      };
    }
    groups[memberId].predictions.push(prediction);
    return groups;
  }, {});

  const members = Object.values(predictionsByMember);

  const toggleMember = (memberId) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  const getMemberStats = (memberPredictions) => {
    const total = memberPredictions.length;
    const completed = memberPredictions.filter(p => p.status === 'completed').length;
    const pending = total - completed;
    const totalPoints = memberPredictions
      .filter(p => p.points !== null && p.points !== undefined)
      .reduce((sum, p) => sum + p.points, 0);
    
    return { total, completed, pending, totalPoints };
  };

  const getGoalCounts = (scorers) => {
    if (!scorers || scorers.length === 0) return {};
    return scorers.reduce((counts, scorer) => {
      counts[scorer] = (counts[scorer] || 0) + 1;
      return counts;
    }, {});
  };

  if (members.length === 0) {
    return (
      <EmptyState 
        icon={<PersonIcon className={`w-12 h-12 ${
          theme === "dark" ? "text-slate-500" : "text-slate-400"
        }`} />}
        title={isLeagueMode ? "No Member Predictions" : "No Predictions"}
        description={isLeagueMode 
          ? "Predictions will appear here once members start making them."
          : "Your predictions will appear here once you start making them."
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {members.map((member) => {
        const isExpanded = expandedMembers.has(member.memberInfo.id);
        const stats = getMemberStats(member.predictions);
        
        return (
          <motion.div
            key={member.memberInfo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
                : "bg-white border-slate-200 hover:shadow-md"
            } backdrop-blur-sm`}
          >
            {/* Member Header */}
            <button
              onClick={() => toggleMember(member.memberInfo.id)}
              className={`w-full p-6 text-left transition-colors ${
                theme === "dark" ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    theme === "dark" ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    {member.memberInfo.avatar}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    } font-outfit`}>
                      {member.memberInfo.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-sm ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      } font-outfit`}>
                        {stats.total} predictions
                      </span>
                      <span className={`text-sm font-medium ${
                        theme === "dark" ? "text-teal-400" : "text-teal-600"
                      } font-outfit`}>
                        {stats.totalPoints} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      } font-medium`}>
                        {stats.completed} complete
                      </span>
                      <span className={`${
                        theme === "dark" ? "text-amber-400" : "text-amber-600"
                      } font-medium`}>
                        {stats.pending} pending
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className={`w-5 h-5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`} />
                  ) : (
                    <ChevronRightIcon className={`w-5 h-5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`} />
                  )}
                </div>
              </div>
            </button>

            {/* Member Predictions - Expanded */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-t overflow-hidden ${
                    theme === "dark" ? "border-slate-700/50" : "border-slate-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {member.predictions.map((prediction) => (
                        <motion.div
                          key={prediction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`rounded-lg border p-6 transition-all cursor-pointer ${
                            theme === "dark"
                              ? "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                          onClick={() => onPredictionSelect?.(prediction)}
                        >
                        {/* Prediction Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {!isLeagueMode ? (
                              <>
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
                              </>
                            ) : (
                              <>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  theme === "dark" ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
                                }`}>
                                  {prediction.userDisplayName?.charAt(0).toUpperCase() || '?'}
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
                              </>
                            )}
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
                          <div className={`p-4 rounded-lg ${
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
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PredictionsByMember;