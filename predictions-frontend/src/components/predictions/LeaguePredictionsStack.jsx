import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculatePoints } from "../../utils/pointsCalculation";
import { 
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotIcon
} from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";
import TeamLogo from "../ui/TeamLogo";
import { LOGO_SIZES } from "../../utils/teamLogos";

const LeaguePredictionsStack = ({
  predictions,
  onPredictionSelect,
  teamLogos = {},
  searchQuery = ""
}) => {
  const { theme } = useContext(ThemeContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter predictions based on search query
  const filteredPredictions = predictions.filter(prediction => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      prediction.userDisplayName?.toLowerCase().includes(searchLower) ||
      prediction.homeTeam.toLowerCase().includes(searchLower) ||
      prediction.awayTeam.toLowerCase().includes(searchLower) ||
      `${prediction.homeTeam} vs ${prediction.awayTeam}`.toLowerCase().includes(searchLower)
    );
  });

  // Sort by most recent prediction first
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    return new Date(b.predictedAt || b.date) - new Date(a.predictedAt || a.date);
  });



  const formatPrediction = (prediction) => {
    if (prediction.homeScore !== null && prediction.awayScore !== null) {
      return `${prediction.homeScore}-${prediction.awayScore}`;
    }
    return "No prediction";
  };

  const getStatusColor = (prediction) => {
    const points = calculatePoints(prediction);
    if (points !== null && points !== undefined) {
      return theme === 'dark' 
        ? 'text-green-400 bg-green-500/10 border-green-500/20'
        : 'text-green-700 bg-green-50 border-green-200';
    }
    return theme === 'dark'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getPointsDisplay = (prediction) => {
    const points = calculatePoints(prediction);
    if (points !== null && points !== undefined) {
      return `${points} pts`;
    }
    return "Pending";
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : sortedPredictions.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < sortedPredictions.length - 1 ? prev + 1 : 0);
  };

  const handleCardClick = (prediction) => {
    onPredictionSelect?.(prediction);
  };

  if (sortedPredictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎴</div>
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

  // Get the visible predictions (current and adjacent)
  const getVisiblePredictions = () => {
    const total = sortedPredictions.length;
    if (total === 1) return [{ prediction: sortedPredictions[0], position: 0 }];
    
    const visible = [];
    
    // Previous prediction
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : total - 1;
    visible.push({ prediction: sortedPredictions[prevIndex], position: -1 });
    
    // Current prediction
    visible.push({ prediction: sortedPredictions[currentIndex], position: 0 });
    
    // Next prediction
    const nextIndex = currentIndex < total - 1 ? currentIndex + 1 : 0;
    visible.push({ prediction: sortedPredictions[nextIndex], position: 1 });
    
    return visible;
  };

  const visiblePredictions = getVisiblePredictions();

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
      } text-sm font-medium text-center`}>
        {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} • {currentIndex + 1} of {sortedPredictions.length}
      </div>

      {/* Stack Container */}
      <div className="relative h-96 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {visiblePredictions.map(({ prediction, position }) => (
            <motion.div
              key={`${prediction.userId}-${prediction.fixtureId}-${position}`}
              initial={{ 
                opacity: position === 0 ? 0 : 0.3,
                scale: position === 0 ? 0.8 : 0.7,
                x: position * 100,
                z: -Math.abs(position) * 10
              }}
              animate={{ 
                opacity: position === 0 ? 1 : 0.3,
                scale: position === 0 ? 1 : 0.85,
                x: position * 30,
                z: -Math.abs(position) * 10
              }}
              exit={{ 
                opacity: 0,
                scale: 0.7,
                x: position * 100
              }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className={`absolute w-80 cursor-pointer ${
                position === 0 ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              style={{ 
                zIndex: 10 - Math.abs(position),
                transform: `translateX(${position * 30}px) scale(${position === 0 ? 1 : 0.85})`
              }}
              onClick={() => position === 0 && handleCardClick(prediction)}
            >
              <div className={`${
                theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 shadow-2xl'
                  : 'bg-white border-slate-200 shadow-lg'
              } rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
                position === 0 ? 'hover:scale-105' : ''
              }`}>
                {/* Member Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${
                    theme === 'dark' ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
                  } flex items-center justify-center text-sm font-medium`}>
                    {prediction.userDisplayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {prediction.userDisplayName}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {prediction.date ? format(parseISO(prediction.date), "MMM d, yyyy") : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Match Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo
                        teamName={prediction.homeTeam}
                        size={LOGO_SIZES.sm}
                        theme={theme}
                      />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {prediction.homeTeam}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`}>
                      {prediction.homeScore !== null ? prediction.homeScore : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      VS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo
                        teamName={prediction.awayTeam}
                        size={LOGO_SIZES.sm}
                        theme={theme}
                      />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {prediction.awayTeam}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`}>
                      {prediction.awayScore !== null ? prediction.awayScore : '-'}
                    </span>
                  </div>
                </div>

                {/* Prediction Details */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      GW {prediction.gameweek || '-'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prediction)}`}>
                    {getPointsDisplay(prediction)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {sortedPredictions.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              } border shadow-lg transition-all duration-200 hover:scale-110 z-20`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              } border shadow-lg transition-all duration-200 hover:scale-110 z-20`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {sortedPredictions.length > 1 && (
        <div className="flex justify-center gap-1">
          {sortedPredictions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'
                  : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LeaguePredictionsStack;
