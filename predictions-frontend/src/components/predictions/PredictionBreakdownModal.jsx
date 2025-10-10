import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { 
  Cross2Icon, 
  CalendarIcon,
  TrophyIcon,
  PersonIcon,
  ClockIcon
} from '@radix-ui/react-icons';

const PredictionBreakdownModal = ({ 
  isOpen, 
  onClose, 
  prediction, 
  teamLogos = {} 
}) => {
  if (!prediction) return null;

  const getTeamLogo = (teamName) => {
    return `/src/assets/clubs/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
  };

  const formattedDate = format(parseISO(prediction.date), 'MMM dd, HH:mm');

  // Calculate goal counts for predicted scorers
  const getGoalCounts = (scorers) => {
    if (!scorers || scorers.length === 0) return {};
    const counts = {};
    scorers.forEach(scorer => {
      counts[scorer] = (counts[scorer] || 0) + 1;
    });
    return counts;
  };

  const homeGoalCounts = getGoalCounts(prediction.homeScorers);
  const awayGoalCounts = getGoalCounts(prediction.awayScorers);

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.75,
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.75,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/60">
              <h2 className="text-xl font-bold text-slate-200 font-outfit">
                Prediction Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Rich Card Header */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-300">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 font-outfit">
                        {prediction.homeTeam} vs {prediction.awayTeam}
                      </p>
                      <p className="text-xs text-slate-500 font-outfit">
                        GW{prediction.gameweek} • {formattedDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold font-outfit text-slate-200">
                      {prediction.points !== null && prediction.points !== undefined ? prediction.points : '—'}
                      {prediction.points !== null && prediction.points !== undefined && (
                        <span className="text-xs font-medium ml-0.5">pts</span>
                      )}
                    </div>
                    <div className={`text-xs font-medium font-outfit ${
                      prediction.status === 'pending'
                        ? "text-amber-400"
                        : "text-green-400"
                    }`}>
                      {prediction.status === 'pending' ? 'Pending' : 'Complete'}
                    </div>
                  </div>
                </div>

                {/* Score Prediction */}
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
                  <div className="text-xs font-medium mb-3 text-slate-400 font-outfit">
                    Predicted Score
                  </div>
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-slate-200 font-outfit">
                        {prediction.homeScore}
                      </div>
                      <div className="text-xs text-slate-500 font-outfit mt-1 truncate">
                        {prediction.homeTeam}
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-slate-400 font-outfit">
                      —
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-slate-200 font-outfit">
                        {prediction.awayScore}
                      </div>
                      <div className="text-xs text-slate-500 font-outfit mt-1 truncate">
                        {prediction.awayTeam}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actual Result if available */}
                {prediction.actualResult && (
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                    <div className="text-xs font-medium mb-3 text-slate-400 font-outfit">
                      Actual Result
                    </div>
                    <div className="flex items-center justify-center space-x-6">
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-emerald-300 font-outfit">
                          {prediction.actualResult.homeScore}
                        </div>
                        <div className="text-xs text-slate-500 font-outfit mt-1 truncate">
                          {prediction.homeTeam}
                        </div>
                      </div>
                      
                      <div className="text-lg font-bold text-slate-400 font-outfit">
                        —
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-emerald-300 font-outfit">
                          {prediction.actualResult.awayScore}
                        </div>
                        <div className="text-xs text-slate-500 font-outfit mt-1 truncate">
                          {prediction.awayTeam}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Predicted Scorers */}
              {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrophyIcon className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-200 font-outfit">
                      Predicted Scorers
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Team Scorers */}
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-3 font-outfit">
                        {prediction.homeTeam}
                      </div>
                      {prediction.homeScorers?.length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(homeGoalCounts).map(([scorer, count]) => (
                            <div key={scorer} className="flex items-center justify-between bg-slate-900/30 border border-slate-700/30 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2">
                                <PersonIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-200 text-sm font-outfit">{scorer}</span>
                              </div>
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full font-outfit">
                                {count} goal{count > 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm font-outfit italic">No scorers predicted</p>
                      )}
                    </div>

                    {/* Away Team Scorers */}
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-3 font-outfit">
                        {prediction.awayTeam}
                      </div>
                      {prediction.awayScorers?.length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(awayGoalCounts).map(([scorer, count]) => (
                            <div key={scorer} className="flex items-center justify-between bg-slate-900/30 border border-slate-700/30 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2">
                                <PersonIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-200 text-sm font-outfit">{scorer}</span>
                              </div>
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full font-outfit">
                                {count} goal{count > 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm font-outfit italic">No scorers predicted</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Chips Used */}
              {prediction.chipsUsed?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">★</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 font-outfit">
                      Chips Used
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {prediction.chipsUsed.map((chip, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-outfit"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Points Breakdown */}
              {prediction.pointsBreakdown && (
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 font-outfit">
                    Points Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    {Object.entries(prediction.pointsBreakdown).map(([category, points]) => (
                      <div key={category} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-b-0">
                        <span className="text-slate-300 text-sm font-outfit capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-slate-200 font-semibold font-outfit">
                          +{points}
                        </span>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-600/50">
                      <span className="text-slate-200 font-semibold font-outfit">
                        Total Points
                      </span>
                      <span className="text-lg font-bold text-green-400 font-outfit">
                        {prediction.points}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Info */}
              <div className="mt-6 pt-6 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-sm text-slate-500 font-outfit">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Prediction made: {format(parseISO(prediction.createdAt || prediction.date), 'MMM dd, yyyy • HH:mm')}</span>
                  </div>
                  {prediction.lastModified && (
                    <span>
                      Last modified: {format(parseISO(prediction.lastModified), 'MMM dd, yyyy • HH:mm')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PredictionBreakdownModal;
