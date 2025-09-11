import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isValid } from "date-fns";
import {
  ArrowLeftIcon,
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  GearIcon,
  StarIcon,
  ClockIcon,
  Pencil2Icon,
  BarChartIcon,
  StackIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

import { showToast } from "../../services/notificationService";
import { ThemeContext } from "../../context/ThemeContext";
import { backgrounds, text, buttons } from "../../utils/themeUtils";
import leagueAPI from "../../services/api/leagueAPI";

const LeagueDetailView = ({ leagueId, league, onBack, onManage }) => {
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Get theme context
  const { theme } = useContext(ThemeContext);

  // Use the passed league object, with fallback to loading state
  if (!league) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-12"
      >
        <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-teal-400' : 'border-teal-600'} border-t-transparent rounded-full animate-spin`}></div>
      </motion.div>
    );
  }

  // Safe date formatter that handles invalid dates
  const formatSafeDate = (dateValue, formatString) => {
    try {
      if (!dateValue) return "N/A";

      // Handle string dates by parsing them first
      const date =
        typeof dateValue === "string"
          ? parseISO(dateValue)
          : new Date(dateValue);

      // Check if date is valid before formatting
      if (!isValid(date)) return "N/A";

      return format(date, formatString);
    } catch (error) {
      console.warn(`Error formatting date: ${error.message}`);
      return "N/A";
    }
  };

  // Handle sharing league
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("League link copied to clipboard!", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        {" "}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400 hover:text-white"
              : "text-slate-600 hover:text-slate-800"
          } transition-colors group font-outfit`}
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Leagues</span>
        </button>
        <div className="flex items-center gap-3">
          {" "}
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-3 py-2 ${
              theme === "dark"
                ? "bg-slate-700/60 hover:bg-slate-700/80 border-slate-600/40 text-slate-300 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-800"
            } border rounded-lg text-sm transition-all duration-200 font-outfit`}
          >
            Share
          </button>
          {league.isAdmin && (
            <button
              onClick={() => onManage(league.id)}
              className={`flex items-center gap-2 px-3 py-2 ${
                theme === "dark"
                  ? "bg-teal-600/20 hover:bg-teal-600/30 border-teal-500/30 text-teal-400 hover:text-teal-300"
                  : "bg-teal-100 hover:bg-teal-200 border-teal-200 text-teal-600 hover:text-teal-700"
              } border rounded-lg text-sm transition-all duration-200 font-outfit`}
            >
              <GearIcon className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>
      </motion.div>

      {/* League Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl ${
          theme === "dark"
            ? "bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-slate-600/30"
            : "bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200 shadow-sm"
        } border backdrop-blur-sm`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-teal-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-teal-500/5 to-indigo-500/5"
          }`}
        />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shrink-0">
                  <TrophyIcon className="w-8 h-8 text-teal-400" />
                </div> */}
                <div className="min-w-0">
                  {" "}
                  <div className="flex items-center gap-3 mb-2">
                    <h1
                      className={`text-2xl lg:text-3xl font-bold ${text.primary[theme]} font-outfit`}
                    >
                      {league.name}
                    </h1>
                    {league.isAdmin && (
                      <span
                        className={`px-2 py-1 ${
                          theme === "dark"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-600"
                        } border rounded-lg text-xs font-medium font-outfit`}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                  <p
                    className={`${text.secondary[theme]} max-w-2xl leading-relaxed font-outfit`}
                  >
                    {league.description}
                  </p>
                  <div
                    className={`flex items-center gap-4 mt-3 text-sm ${text.muted[theme]} font-outfit`}
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Created {formatSafeDate(league.createdAt, "MMM d, yyyy")}
                      </span>
                    </div>
                    <span
                      className={`w-1 h-1 ${
                        theme === "dark" ? "bg-slate-500" : "bg-slate-400"
                      } rounded-full`}
                    />
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{league.type}</span> League
                    </div>
                    {league.joinCode && (
                      <>
                        <span
                          className={`w-1 h-1 ${
                            theme === "dark" ? "bg-slate-500" : "bg-slate-400"
                          } rounded-full`}
                        />
                        <div className="flex items-center gap-1">
                          <span>Code: {league.joinCode}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* League Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <PersonIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    {league.members}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Members
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChartIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    #{league.position}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Your Rank
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <StarIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    {league.points}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Your Points
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TargetIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    {league.pointsLeader}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Leader Points
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`flex ${
          theme === "dark"
            ? "bg-slate-800/50 border-slate-700/30"
            : "bg-slate-100 border-slate-200"
        } rounded-2xl p-1 border`}
      >
        {[
          { id: "leaderboard", label: "Leaderboard", icon: TargetIcon },
          { id: "predictions", label: "Predictions", icon: StackIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium font-outfit transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-teal-600 text-white shadow-lg ${
                    theme === "dark"
                      ? "shadow-teal-600/20"
                      : "shadow-teal-600/10"
                  }`
                : `${
                    theme === "dark"
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                  }`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {" "}
          {activeTab === "leaderboard" && (
            <LeaderboardContent
              leaderboard={league.leaderboard}
              formatSafeDate={formatSafeDate}
            />
          )}
          {activeTab === "predictions" && (
            <PredictionsContent leagueId={leagueId} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Leaderboard Content Component
const LeaderboardContent = ({ leaderboard, formatSafeDate }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${
        theme === "dark"
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-white border-slate-200"
      } backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm`}
    >
      <div
        className={`p-6 border-b ${
          theme === "dark" ? "border-slate-700/50" : "border-slate-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2
              className={`text-xl font-semibold ${text.primary[theme]} mb-1 font-outfit`}
            >
              Leaderboard
            </h2>
            <p className={`${text.muted[theme]} text-sm font-outfit`}>
              {leaderboard && leaderboard.length > 0
                ? `${leaderboard.length} members competing`
                : "No rankings yet"}
            </p>
          </div>
        </div>
      </div>

      {leaderboard && leaderboard.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  theme === "dark" ? "border-slate-700/30" : "border-slate-200"
                }`}
              >
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Rank
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Player
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Joined
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Predictions
                </th>
                <th
                  className={`px-6 py-4 text-right text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Points
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark" ? "divide-slate-700/20" : "divide-slate-200"
              }`}
            >
              {leaderboard.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    theme === "dark"
                      ? "hover:bg-slate-700/20"
                      : "hover:bg-slate-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-outfit ${
                        index === 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : index === 1
                          ? "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          : index === 2
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : theme === "dark"
                          ? "bg-slate-700/50 text-slate-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          className={`${text.primary[theme]} font-medium font-outfit`}
                        >
                          {player.name}
                        </div>
                        <div
                          className={`${text.muted[theme]} text-sm font-outfit`}
                        >
                          {index === 0
                            ? "🏆 Champion"
                            : index === 1
                            ? "🥈 Runner-up"
                            : index === 2
                            ? "🥉 Third place"
                            : "Competitor"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${text.secondary[theme]}`}>
                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className={`w-4 h-4 ${text.muted[theme]}`}
                      />
                      <span className="font-outfit">
                        {formatSafeDate(player.joinedDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`${text.primary[theme]} font-medium font-outfit`}
                    >
                      {player.predictions || 0}
                    </div>
                    <div className={`${text.muted[theme]} text-sm font-outfit`}>
                      predictions made
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`text-lg font-bold ${text.primary[theme]} font-outfit`}
                    >
                      {player.points}
                    </div>
                    <div className={`text-sm ${text.muted[theme]} font-outfit`}>
                      points
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <TargetIcon
            className={`w-12 h-12 ${text.muted[theme]} mx-auto mb-4`}
          />
          <h3
            className={`text-lg font-semibold ${text.primary[theme]} mb-2 font-outfit`}
          >
            No Rankings Yet
          </h3>
          <p className={`${text.muted[theme]} font-outfit`}>
            Start making predictions to see the leaderboard!
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Predictions Content Component
const PredictionsContent = ({ leagueId }) => {
  const { theme } = useContext(ThemeContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const data = await leagueAPI.getLeaguePredictions(leagueId);
        setPredictions(data);
      } catch (err) {
        console.error('Failed to fetch league predictions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchPredictions();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center py-12"
      >
        <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-teal-400' : 'border-teal-600'} border-t-transparent rounded-full animate-spin`}></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className={`text-red-500 mb-4`}>
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="font-outfit">Failed to load predictions</p>
        </div>
      </motion.div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <TargetIcon className={`w-12 h-12 ${text.muted[theme]} mx-auto mb-4`} />
        <h3
          className={`text-lg font-semibold ${text.primary[theme]} mb-2 font-outfit`}
        >
          No Predictions Yet
        </h3>
        <p className={`${text.muted[theme]} font-outfit`}>
          League members will appear here once they start making predictions
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {predictions.map((prediction, index) => (
        <motion.div
          key={prediction.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${
            theme === "dark"
              ? "bg-slate-800/30 border-slate-700/50"
              : "bg-white border-slate-200"
          } backdrop-blur-sm border rounded-xl p-6 shadow-sm`}
        >
          {/* Prediction Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${text.primary[theme]} font-outfit`}>
                {prediction.fixture.homeTeam} vs {prediction.fixture.awayTeam}
              </h3>
              <p className={`text-sm ${text.muted[theme]} font-outfit`}>
                {new Date(prediction.fixture.date).toLocaleDateString()} • 
                {prediction.user.username}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium font-outfit ${
              prediction.status === 'scored' 
                ? theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                : theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              {prediction.status === 'scored' ? 'Scored' : 'Pending'}
            </div>
          </div>

          {/* Score Prediction */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}>
                {prediction.homeScore}
              </div>
              <div className={`text-sm ${text.muted[theme]} font-outfit`}>
                {prediction.fixture.homeTeam}
              </div>
            </div>
            <div className="text-center flex items-center justify-center">
              <span className={`${text.muted[theme]} font-outfit`}>-</span>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}>
                {prediction.awayScore}
              </div>
              <div className={`text-sm ${text.muted[theme]} font-outfit`}>
                {prediction.fixture.awayTeam}
              </div>
            </div>
          </div>

          {/* Goalscorers */}
          {prediction.goalscorers && prediction.goalscorers.length > 0 && (
            <div className="mb-4">
              <h4 className={`text-sm font-medium ${text.primary[theme]} mb-2 font-outfit`}>
                Predicted Goalscorers
              </h4>
              <div className="flex flex-wrap gap-2">
                {prediction.goalscorers.map((scorer, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium font-outfit ${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {scorer.player} ({scorer.team})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Active Chips */}
          {prediction.chips && prediction.chips.length > 0 && (
            <div className="mb-4">
              <h4 className={`text-sm font-medium ${text.primary[theme]} mb-2 font-outfit`}>
                Active Chips
              </h4>
              <div className="flex flex-wrap gap-2">
                {prediction.chips.map((chip, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium font-outfit ${
                      chip === 'doubleDown' 
                        ? theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                        : chip === 'wildcard'
                        ? theme === 'dark' ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                        : chip === 'opportunist'
                        ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                        : chip === 'scorerFocus'
                        ? theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        : theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {chip === 'doubleDown' ? 'Double Down' :
                     chip === 'wildcard' ? 'Wildcard' :
                     chip === 'opportunist' ? 'Opportunist' :
                     chip === 'scorerFocus' ? 'Scorer Focus' : chip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Points Breakdown */}
          {prediction.points && (
            <div className="border-t pt-4" style={{ borderColor: theme === 'dark' ? 'rgb(51 65 85 / 0.3)' : 'rgb(226 232 240)' }}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${text.primary[theme]} font-outfit`}>
                  Total Points
                </span>
                <span className={`text-lg font-bold ${text.primary[theme]} font-outfit`}>
                  {prediction.points.total}
                </span>
              </div>
              {prediction.points.breakdown && (
                <div className="mt-2 space-y-1">
                  {Object.entries(prediction.points.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className={`${text.muted[theme]} font-outfit capitalize`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`${text.muted[theme]} font-outfit`}>
                        +{value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default LeagueDetailView;
