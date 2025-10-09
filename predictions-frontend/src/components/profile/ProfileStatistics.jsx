import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChartIcon, 
  CalendarIcon, 
  TargetIcon,
  RocketIcon,
  LightningBoltIcon,
  MagicWandIcon,
  BadgeIcon,
  StarIcon
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { text } from "../../utils/themeUtils";
import { userAPI } from "../../services/api/userAPI";

const ProfileStatistics = () => {
  const { theme } = useContext(ThemeContext);
  
  // State for API data
  const [highlights, setHighlights] = useState(null);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [teamStats, setTeamStats] = useState(null);
  const [isLoadingTeamStats, setIsLoadingTeamStats] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [isLoadingMonthlyStats, setIsLoadingMonthlyStats] = useState(true);

  // Utility function to generate highlight descriptions
  const generateDescription = (type, data) => {
    switch (type) {
      case 'bestGameweek':
        return `${data.points} points scored`;
      case 'favoriteFixture':
        return `${data.accuracy}% prediction accuracy`;
      case 'mostActiveDay':
        return `${data.percentage}% of predictions made`;
      default:
        return '';
    }
  };

  // Load highlights data
  useEffect(() => {
    const loadHighlights = async () => {
      try {
        setIsLoadingHighlights(true);
        const response = await userAPI.getStatisticsHighlights();
        
        if (response.success) {
          // Add generated descriptions to the highlights data
          const highlightsWithDescriptions = {
            bestGameweek: {
              ...response.highlights.bestGameweek,
              description: generateDescription('bestGameweek', response.highlights.bestGameweek)
            },
            favoriteFixture: {
              ...response.highlights.favoriteFixture,
              description: generateDescription('favoriteFixture', response.highlights.favoriteFixture)
            },
            mostActiveDay: {
              ...response.highlights.mostActiveDay,
              description: generateDescription('mostActiveDay', response.highlights.mostActiveDay)
            }
          };
          
          setHighlights(highlightsWithDescriptions);
        }
      } catch (error) {
        console.error('Failed to load highlights:', error);
        // Keep highlights as null for fallback
      } finally {
        setIsLoadingHighlights(false);
      }
    };

    loadHighlights();
  }, []);

  // Load team performance data
  useEffect(() => {
    const loadTeamStats = async () => {
      try {
        setIsLoadingTeamStats(true);
        const response = await userAPI.getTeamPerformance();
        
        if (response.success) {
          setTeamStats(response.teamStats);
        }
      } catch (error) {
        console.error('Failed to load team stats:', error);
        // Keep teamStats as null for fallback
      } finally {
        setIsLoadingTeamStats(false);
      }
    };

    loadTeamStats();
  }, []);

  // Load monthly performance data
  useEffect(() => {
    const loadMonthlyStats = async () => {
      try {
        setIsLoadingMonthlyStats(true);
        const response = await userAPI.getMonthlyPerformance();
        
        if (response.success) {
          setMonthlyStats(response.monthlyStats);
        }
      } catch (error) {
        console.error('Failed to load monthly stats:', error);
        // Keep monthlyStats as null for fallback
      } finally {
        setIsLoadingMonthlyStats(false);
      }
    };

    loadMonthlyStats();
  }, []);

  // Sample detailed statistics (fallback data for competitions and streaks - still to be implemented)
  const detailedStats = {
    competitionStats: [
      { competition: "Premier League", predictions: 198, correct: 142, accuracy: 72, points: 1542 },
      { competition: "FA Cup", predictions: 12, correct: 9, accuracy: 75, points: 98 },
      { competition: "League Cup", predictions: 15, correct: 8, accuracy: 53, points: 87 },
      { competition: "Champions League", predictions: 12, correct: 7, accuracy: 58, points: 72 }
    ],
    streakHistory: [
      { type: "Current Streak", value: 3, description: "Weeks with correct predictions" },
      { type: "Longest Streak", value: 7, description: "Best consecutive correct predictions" },
      { type: "Perfect Gameweeks", value: 2, description: "Gameweeks with 100% accuracy" },
      { type: "Prediction Frequency", value: 94, description: "Percentage of available matches predicted" }
    ]
  };

  const getBarWidth = (value, max) => {
    return (value / max) * 100;
  };

  // Calculate max values from API data or fallback to 0
  const maxMonthlyPoints = monthlyStats ? Math.max(...monthlyStats.map(m => m.points)) : 0;
  const maxTeamPoints = teamStats ? Math.max(...teamStats.map(t => t.points)) : 0;

  return (
    <div className="space-y-6">
      {/* Performance Highlights */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-6 border`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <MagicWandIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-lg`}>
            Performance Highlights
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Gameweek */}
          <div className={`p-4 rounded-lg ${
            theme === "dark"
              ? "bg-slate-700/20 border-slate-600/20"
              : "bg-slate-50/50 border-slate-200/50"
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <BadgeIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-amber-400" : "text-amber-600"
              }`} />
              <span className={`${text.primary[theme]} font-outfit font-medium text-sm`}>
                Best Gameweek
              </span>
            </div>
            {isLoadingHighlights ? (
              <div className="animate-pulse">
                <div className={`h-8 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded mb-2`}></div>
                <div className={`h-3 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-3/4`}></div>
              </div>
            ) : (
              <>
                <p className={`${text.primary[theme]} font-dmSerif text-2xl font-bold`}>
                  {highlights?.bestGameweek?.gameweek || 'N/A'}
                </p>
                <p className={`${text.muted[theme]} font-outfit text-xs`}>
                  {highlights?.bestGameweek?.description || 'No data available'}
                </p>
              </>
            )}
          </div>
          
          {/* Favorite Fixture */}
          <div className={`p-4 rounded-lg ${
            theme === "dark"
              ? "bg-slate-700/20 border-slate-600/20"
              : "bg-slate-50/50 border-slate-200/50"
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <StarIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`} />
              <span className={`${text.primary[theme]} font-outfit font-medium text-sm`}>
                Favorite Fixture
              </span>
            </div>
            {isLoadingHighlights ? (
              <div className="animate-pulse">
                <div className={`h-6 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded mb-2`}></div>
                <div className={`h-3 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-3/4`}></div>
              </div>
            ) : (
              <>
                <p className={`${text.primary[theme]} font-dmSerif text-lg font-bold`}>
                  {highlights?.favoriteFixture?.fixture || 'N/A'}
                </p>
                <p className={`${text.muted[theme]} font-outfit text-xs`}>
                  {highlights?.favoriteFixture?.description || 'No data available'}
                </p>
              </>
            )}
          </div>
          
          {/* Most Active Day */}
          <div className={`p-4 rounded-lg ${
            theme === "dark"
              ? "bg-slate-700/20 border-slate-600/20"
              : "bg-slate-50/50 border-slate-200/50"
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              }`} />
              <span className={`${text.primary[theme]} font-outfit font-medium text-sm`}>
                Most Active Day
              </span>
            </div>
            {isLoadingHighlights ? (
              <div className="animate-pulse">
                <div className={`h-6 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded mb-2`}></div>
                <div className={`h-3 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-3/4`}></div>
              </div>
            ) : (
              <>
                <p className={`${text.primary[theme]} font-dmSerif text-lg font-bold`}>
                  {highlights?.mostActiveDay?.day || 'N/A'}
                </p>
                <p className={`${text.muted[theme]} font-outfit text-xs`}>
                  {highlights?.mostActiveDay?.description || 'No data available'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-6 border`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <BarChartIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-lg`}>
            Monthly Performance
          </h3>
        </div>

        <div className="space-y-4">
          {isLoadingMonthlyStats ? (
            // Loading skeleton for monthly performance
            Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8">
                  <div className={`h-4 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded animate-pulse`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`h-4 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-48 animate-pulse`}></div>
                    <div className={`h-4 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-12 animate-pulse`}></div>
                  </div>
                  <div className={`w-full h-2 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"} animate-pulse`}></div>
                </div>
              </div>
            ))
          ) : monthlyStats && monthlyStats.length > 0 ? (
            monthlyStats.map((month, index) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-8 text-sm font-medium">
                  <span className={`${text.primary[theme]} font-outfit`}>
                    {month.month}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${text.muted[theme]} font-outfit text-sm`}>
                      {month.points} pts • {month.predictions} predictions • {month.accuracy}% accuracy
                    </span>
                    <span className={`${text.primary[theme]} font-outfit text-sm font-medium`}>
                      {month.points}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getBarWidth(month.points, maxMonthlyPoints)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        theme === "dark" 
                          ? "from-teal-500 to-indigo-500" 
                          : "from-teal-600 to-indigo-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${text.muted[theme]} font-outfit text-sm text-center py-4`}>
              No monthly performance data available
            </div>
          )}
        </div>
      </div>

      {/* Team Performance */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-6 border`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <TargetIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-lg`}>
            Performance by Team
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingTeamStats ? (
            // Loading skeleton for team performance
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                theme === "dark"
                  ? "bg-slate-700/20 border-slate-600/20"
                  : "bg-slate-50/50 border-slate-200/50"
              } border`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-5 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-24 animate-pulse`}></div>
                  <div className={`h-6 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-12 animate-pulse`}></div>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className={`h-4 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-16 animate-pulse`}></div>
                      <div className={`h-4 ${theme === "dark" ? "bg-slate-600" : "bg-slate-200"} rounded w-8 animate-pulse`}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : teamStats && teamStats.length > 0 ? (
            teamStats.map((team, index) => (
              <div key={team.team} className={`p-4 rounded-lg ${
                theme === "dark"
                  ? "bg-slate-700/20 border-slate-600/20"
                  : "bg-slate-50/50 border-slate-200/50"
              } border`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`${text.primary[theme]} font-outfit font-medium`}>
                    {team.team}
                  </h4>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    team.accuracy >= 80
                      ? theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                      : team.accuracy >= 70
                      ? theme === "dark" ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                      : theme === "dark" ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
                  }`}>
                    {team.accuracy}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${text.muted[theme]} text-sm font-outfit`}>Predictions</span>
                    <span className={`${text.primary[theme]} text-sm font-outfit font-medium`}>
                      {team.predictions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${text.muted[theme]} text-sm font-outfit`}>Correct</span>
                    <span className={`${text.primary[theme]} text-sm font-outfit font-medium`}>
                      {team.correct}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${text.muted[theme]} text-sm font-outfit`}>Total Points</span>
                    <span className={`${text.primary[theme]} text-sm font-outfit font-medium`}>
                      {team.points}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${text.muted[theme]} font-outfit text-sm text-center py-4 col-span-full`}>
              No team performance data available
            </div>
          )}
        </div>
      </div>

      {/* Competition Statistics */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-6 border`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <RocketIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-lg`}>
            Competition Breakdown
          </h3>
        </div>

        <div className="space-y-4">
          {detailedStats.competitionStats.map((comp, index) => (
            <div key={comp.competition} className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-slate-700/20 border-slate-600/20"
                : "bg-slate-50/50 border-slate-200/50"
            } border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`${text.primary[theme]} font-outfit font-medium`}>
                  {comp.competition}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`${text.primary[theme]} font-outfit font-bold`}>
                    {comp.points} pts
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    comp.accuracy >= 70
                      ? theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                      : comp.accuracy >= 60
                      ? theme === "dark" ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                      : theme === "dark" ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
                  }`}>
                    {comp.accuracy}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${text.muted[theme]} font-outfit`}>
                  {comp.correct}/{comp.predictions} predictions correct
                </span>
                <span className={`${text.muted[theme]} font-outfit`}>
                  {(comp.points / comp.predictions).toFixed(1)} pts/prediction
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak & Consistency */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-6 border`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <LightningBoltIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-lg`}>
            Streaks & Consistency
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detailedStats.streakHistory.map((streak, index) => (
            <div key={streak.type} className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-slate-700/20 border-slate-600/20"
                : "bg-slate-50/50 border-slate-200/50"
            } border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`${text.primary[theme]} font-outfit font-medium text-sm`}>
                  {streak.type}
                </h4>
                <span className={`${text.primary[theme]} font-dmSerif text-2xl font-bold`}>
                  {streak.value}
                </span>
              </div>
              <p className={`${text.muted[theme]} font-outfit text-xs`}>
                {streak.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileStatistics;
