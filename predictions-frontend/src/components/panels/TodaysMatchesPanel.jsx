import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeUtils";
import { ClockIcon, CheckCircledIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import TeamLogo from "../ui/TeamLogo";
import { LOGO_SIZES } from "../../utils/teamLogos";

/**
 * TodaysMatchesPanel
 * Displays matches that are currently live or finished today
 * Only renders when there are matches to show
 */
const TodaysMatchesPanel = ({ matches = [], onViewAll, onViewPrediction }) => {
  const { theme } = useContext(ThemeContext);

  console.log('🎯 TodaysMatchesPanel render:', {
    matchesReceived: matches?.length || 0,
    matches: matches
  });

  if (!matches || matches.length === 0) {
    console.log('❌ TodaysMatchesPanel: No matches, not rendering');
    return null; // Don't render if no matches
  }

  // Categorize matches
  const liveMatches = matches.filter(m => {
    const statusLower = m.status?.toLowerCase() || '';
    return statusLower === 'live' || 
           statusLower === 'in_progress' || 
           statusLower === 'in_play' ||
           statusLower === 'playing';
  });
  
  const finishedMatches = matches.filter(m => {
    const statusLower = m.status?.toLowerCase() || '';
    return statusLower === 'completed' || 
           statusLower === 'finished' || 
           statusLower === 'ft' ||
           statusLower === 'full_time' ||
           statusLower === 'fulltime';
  });

  const hasLiveMatches = liveMatches.length > 0;
  const panelTitle = hasLiveMatches ? "Live Matches" : "Finished Today";
  const panelIcon = hasLiveMatches ? "🔴" : "✅";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border overflow-hidden font-outfit ${getThemeStyles(theme, {
        dark: 'bg-slate-800/40 border-slate-700/60',
        light: 'bg-white border-slate-200'
      })}`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${getThemeStyles(theme, {
        dark: 'border-slate-700/60 bg-slate-800/60',
        light: 'border-slate-200 bg-slate-50'
      })}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{panelIcon}</span>
          <div>
            <h3 className={`text-lg font-bold ${getThemeStyles(theme, {
              dark: 'text-slate-100',
              light: 'text-slate-900'
            })}`}>
              {panelTitle}
            </h3>
            <p className={`text-xs ${getThemeStyles(theme, {
              dark: 'text-slate-400',
              light: 'text-slate-600'
            })}`}>
              {hasLiveMatches ? `${liveMatches.length} match${liveMatches.length !== 1 ? 'es' : ''} in progress` 
                : `${finishedMatches.length} match${finishedMatches.length !== 1 ? 'es' : ''} completed today`}
            </p>
          </div>
        </div>
        
        {/* View All Button */}
        {onViewAll && (
          <button
            onClick={onViewAll}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${getThemeStyles(theme, {
              dark: 'text-teal-400 hover:bg-teal-900/20',
              light: 'text-teal-600 hover:bg-teal-50'
            })}`}
          >
            View All
          </button>
        )}
      </div>

      {/* Matches List */}
      <div className="divide-y divide-slate-700/40">
        {matches.map((match, index) => {
          const statusLower = match.status?.toLowerCase() || '';
          const isLive = statusLower === 'live' || 
                        statusLower === 'in_progress' || 
                        statusLower === 'in_play' ||
                        statusLower === 'playing';
          const isFinished = statusLower === 'completed' || 
                            statusLower === 'finished' || 
                            statusLower === 'ft' ||
                            statusLower === 'full_time' ||
                            statusLower === 'fulltime';
          const hasPrediction = match.predicted || match.userPrediction;

          return (
            <motion.div
              key={match.id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 ${getThemeStyles(theme, {
                dark: 'hover:bg-slate-700/20',
                light: 'hover:bg-slate-50'
              })} transition-colors`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isLive ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-400">LIVE</span>
                    </div>
                  ) : isFinished ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <CheckCircledIcon className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-bold text-green-400">FT</span>
                    </div>
                  ) : null}
                </div>

                {/* Teams */}
                <div className="flex-1 min-w-0">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 mb-1">
                    <TeamLogo 
                      teamName={match.homeTeam || match.home}
                      size={LOGO_SIZES.xs}
                      theme={theme}
                    />
                    <span className={`text-sm font-medium truncate ${getThemeStyles(theme, {
                      dark: 'text-slate-200',
                      light: 'text-slate-800'
                    })}`}>
                      {match.homeTeam || match.home}
                    </span>
                    {(isLive || isFinished) && match.homeScore !== undefined && (
                      <span className={`text-sm font-bold ml-auto ${getThemeStyles(theme, {
                        dark: 'text-slate-100',
                        light: 'text-slate-900'
                      })}`}>
                        {match.homeScore}
                      </span>
                    )}
                  </div>
                  
                  {/* Away Team */}
                  <div className="flex items-center gap-2">
                    <TeamLogo 
                      teamName={match.awayTeam || match.away}
                      size={LOGO_SIZES.xs}
                      theme={theme}
                    />
                    <span className={`text-sm font-medium truncate ${getThemeStyles(theme, {
                      dark: 'text-slate-200',
                      light: 'text-slate-800'
                    })}`}>
                      {match.awayTeam || match.away}
                    </span>
                    {(isLive || isFinished) && match.awayScore !== undefined && (
                      <span className={`text-sm font-bold ml-auto ${getThemeStyles(theme, {
                        dark: 'text-slate-100',
                        light: 'text-slate-900'
                      })}`}>
                        {match.awayScore}
                      </span>
                    )}
                  </div>

                  {/* Match Time */}
                  {!isLive && !isFinished && match.date && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${getThemeStyles(theme, {
                      dark: 'text-slate-400',
                      light: 'text-slate-600'
                    })}`}>
                      <ClockIcon className="w-3 h-3" />
                      {format(parseISO(match.date), 'HH:mm')}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {hasPrediction && onViewPrediction && (
                  <button
                    onClick={() => onViewPrediction(match.userPrediction || match.prediction)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${getThemeStyles(theme, {
                      dark: 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50 border border-indigo-700/30',
                      light: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    })}`}
                  >
                    <EyeOpenIcon className="w-3 h-3" />
                    View
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TodaysMatchesPanel;
