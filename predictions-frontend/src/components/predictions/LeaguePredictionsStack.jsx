import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TargetIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotIcon
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import PredictionCard from "./PredictionCard";

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
              <PredictionCard
                prediction={prediction}
                mode="league"
                showMemberInfo={true}
                onSelect={handleCardClick}
                isReadonly={true}
                size="normal"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={goToPrevious}
          disabled={sortedPredictions.length <= 1}
          className={`p-2 rounded-full transition-all ${
            sortedPredictions.length <= 1
              ? 'opacity-30 cursor-not-allowed'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {sortedPredictions.slice(0, Math.min(5, sortedPredictions.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index
                  ? 'bg-teal-500'
                  : theme === 'dark'
                  ? 'bg-slate-600 hover:bg-slate-500'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
          {sortedPredictions.length > 5 && (
            <DotIcon className={`w-4 h-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
          )}
        </div>
        
        <button
          onClick={goToNext}
          disabled={sortedPredictions.length <= 1}
          className={`p-2 rounded-full transition-all ${
            sortedPredictions.length <= 1
              ? 'opacity-30 cursor-not-allowed'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  // No predictions found
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-12"
    >
      <TargetIcon className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
      }`} />
      <p className={`text-lg font-medium font-outfit ${
        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
      }`}>
        No predictions found
      </p>
      <p className={`text-sm mt-2 ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
      }`}>
        {searchQuery ? "Try adjusting your search terms." : "League predictions will appear here."}
      </p>
    </motion.div>
  );
};

export default LeaguePredictionsStack;
