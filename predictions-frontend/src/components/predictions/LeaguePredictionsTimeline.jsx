import React, { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  ClockIcon,
  DotFilledIcon
} from "@radix-ui/react-icons";
import { format, parseISO, isSameDay, isToday, differenceInDays } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";

const LeaguePredictionsTimeline = ({
  predictions,
  onPredictionSelect,
  teamLogos = {},
  searchQuery = ""
}) => {
  const { theme } = useContext(ThemeContext);

  // Filter predictions based on search query
  const filteredPredictions = predictions.filter(prediction => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      prediction.userDisplayName.toLowerCase().includes(searchLower) ||
      prediction.homeTeam.toLowerCase().includes(searchLower) ||
      prediction.awayTeam.toLowerCase().includes(searchLower) ||
      `${prediction.homeTeam} vs ${prediction.awayTeam}`.toLowerCase().includes(searchLower)
    );
  });

  // Group predictions by date and sort chronologically
  const timelineData = useMemo(() => {
    const groups = {};
    
    filteredPredictions.forEach(prediction => {
      if (prediction.date) {
        const dateKey = format(parseISO(prediction.date), 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: parseISO(prediction.date),
            predictions: []
          };
        }
        groups[dateKey].predictions.push(prediction);
      }
    });

    // Convert to array and sort by date
    return Object.values(groups).sort((a, b) => a.date - b.date);
  }, [filteredPredictions]);

  const getTeamLogo = (teamName) => {
    const normalizedName = teamName?.toLowerCase().replace(/\s+/g, '');
    return teamLogos[normalizedName];
  };

  const formatPrediction = (prediction) => {
    if (prediction.homeScore !== null && prediction.awayScore !== null) {
      return `${prediction.homeScore}-${prediction.awayScore}`;
    }
    return "No prediction";
  };

  const getStatusColor = (prediction) => {
    if (prediction.points !== null && prediction.points !== undefined) {
      return theme === 'dark' 
        ? 'text-green-400 bg-green-500/10 border-green-500/20'
        : 'text-green-700 bg-green-50 border-green-200';
    }
    return theme === 'dark'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getPointsDisplay = (prediction) => {
    if (prediction.points !== null && prediction.points !== undefined) {
      return `${prediction.points} pts`;
    }
    return "Pending";
  };

  const getDateLabel = (date) => {
    if (isToday(date)) {
      return "Today";
    }
    
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff === 1) {
      return "Yesterday";
    } else if (daysDiff === -1) {
      return "Tomorrow";
    } else if (daysDiff > 0 && daysDiff <= 7) {
      return `${daysDiff} days ago`;
    } else if (daysDiff < 0 && daysDiff >= -7) {
      return `In ${Math.abs(daysDiff)} days`;
    }
    
    return format(date, 'MMMM d, yyyy');
  };

  if (filteredPredictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏱️</div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
        }`}>
          No predictions found
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
        }`}>
          {searchQuery ? 'Try adjusting your search criteria' : 'No predictions available'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${
        theme === 'dark'
          ? 'text-slate-300'
          : 'text-slate-600'
      } text-sm font-medium`}>
        {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} found
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
        }`} />

        <div className="space-y-8">
          {timelineData.map((group, groupIndex) => (
            <motion.div
              key={format(group.date, 'yyyy-MM-dd')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="relative"
            >
              {/* Date marker */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-4 h-4 rounded-full ${
                  isToday(group.date) ? (
                    theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'
                  ) : (
                    theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'
                  )
                } border-2 ${
                  theme === 'dark' ? 'border-slate-800' : 'border-white'
                } relative z-10`} />
                
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {getDateLabel(group.date)}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {format(group.date, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Predictions for this date */}
              <div className="ml-12 space-y-3">
                {group.predictions.map((prediction, predIndex) => (
                  <motion.div
                    key={`${prediction.userId}-${prediction.fixtureId}-${predIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (predIndex * 0.05) }}
                    className={`${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    } rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}
                    onClick={() => onPredictionSelect?.(prediction)}
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side: Member and match info */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full ${
                          theme === 'dark' ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
                        } flex items-center justify-center text-sm font-medium flex-shrink-0`}>
                          {prediction.userDisplayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {prediction.userDisplayName}
                          </p>
                          
                          {/* Match details */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {getTeamLogo(prediction.homeTeam) && (
                                <img 
                                  src={getTeamLogo(prediction.homeTeam)} 
                                  alt={prediction.homeTeam} 
                                  className="w-4 h-4"
                                />
                              )}
                              <span className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                {prediction.homeTeam}
                              </span>
                            </div>
                            <span className={`text-xs ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}>vs</span>
                            <div className="flex items-center gap-1">
                              {getTeamLogo(prediction.awayTeam) && (
                                <img 
                                  src={getTeamLogo(prediction.awayTeam)} 
                                  alt={prediction.awayTeam} 
                                  className="w-4 h-4"
                                />
                              )}
                              <span className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                {prediction.awayTeam}
                              </span>
                            </div>
                          </div>
                          
                          {/* Additional info */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                GW {prediction.gameweek || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3 text-slate-400" />
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {prediction.predictedAt ? format(parseISO(prediction.predictedAt), 'HH:mm') : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Prediction and points */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`text-lg font-bold ${
                          theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                        }`}>
                          {formatPrediction(prediction)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(prediction)} mt-1`}>
                          {getPointsDisplay(prediction)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaguePredictionsTimeline;
