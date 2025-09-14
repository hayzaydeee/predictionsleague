import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { 
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";

const LeaguePredictionsTable = ({
  predictions,
  onPredictionSelect,
  teamLogos = {},
  searchQuery = ""
}) => {
  const { theme } = useContext(ThemeContext);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

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

  // Sort predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'member':
        aValue = a.userDisplayName;
        bValue = b.userDisplayName;
        break;
      case 'match':
        aValue = `${a.homeTeam} vs ${a.awayTeam}`;
        bValue = `${b.homeTeam} vs ${b.awayTeam}`;
        break;
      case 'prediction':
        aValue = `${a.homeScore}-${a.awayScore}`;
        bValue = `${b.homeScore}-${b.awayScore}`;
        break;
      case 'gameweek':
        aValue = a.gameweek || 0;
        bValue = b.gameweek || 0;
        break;
      case 'points':
        aValue = a.points || 0;
        bValue = b.points || 0;
        break;
      case 'date':
      default:
        aValue = new Date(a.date || a.predictedAt);
        bValue = new Date(b.date || b.predictedAt);
        break;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpIcon className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4" />
      : <ChevronDownIcon className="w-4 h-4" />;
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Table Header */}
      <div className={`${
        theme === 'dark'
          ? 'text-slate-300'
          : 'text-slate-600'
      } text-sm font-medium`}>
        {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} found
      </div>

      {/* Table */}
      <div className={`${
        theme === 'dark'
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-white border-slate-200'
      } rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${
              theme === 'dark'
                ? 'bg-slate-900/50 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            } border-b`}>
              <tr>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('member')}
                >
                  <div className="flex items-center gap-2">
                    <PersonIcon className="w-4 h-4" />
                    <span className="font-medium">Member</span>
                    <SortIcon columnKey="member" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('match')}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Match</span>
                    <SortIcon columnKey="match" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('prediction')}
                >
                  <div className="flex items-center gap-2">
                    <TargetIcon className="w-4 h-4" />
                    <span className="font-medium">Prediction</span>
                    <SortIcon columnKey="prediction" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('gameweek')}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">GW</span>
                    <SortIcon columnKey="gameweek" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-medium">Date</span>
                    <SortIcon columnKey="date" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSort('points')}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Points</span>
                    <SortIcon columnKey="points" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPredictions.map((prediction, index) => (
                <motion.tr
                  key={`${prediction.userId}-${prediction.fixtureId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`${
                    theme === 'dark'
                      ? 'border-slate-700 hover:bg-slate-800/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  } border-b cursor-pointer transition-colors`}
                  onClick={() => onPredictionSelect?.(prediction)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${
                        theme === 'dark' ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
                      } flex items-center justify-center text-sm font-medium`}>
                        {prediction.userDisplayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        {prediction.userDisplayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getTeamLogo(prediction.homeTeam) && (
                          <img 
                            src={getTeamLogo(prediction.homeTeam)} 
                            alt={prediction.homeTeam} 
                            className="w-5 h-5"
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
                      <div className="flex items-center gap-2">
                        {getTeamLogo(prediction.awayTeam) && (
                          <img 
                            src={getTeamLogo(prediction.awayTeam)} 
                            alt={prediction.awayTeam} 
                            className="w-5 h-5"
                          />
                        )}
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {prediction.awayTeam}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`}>
                      {formatPrediction(prediction)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {prediction.gameweek || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {prediction.date ? format(parseISO(prediction.date), "MMM d, yyyy") : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prediction)}`}>
                      {getPointsDisplay(prediction)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPredictions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
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
      )}
    </motion.div>
  );
};

export default LeaguePredictionsTable;
