import React, { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";
import { backgrounds, text, buttons } from "../../utils/themeUtils";

const GameweekPredictionsCarousel = ({
  predictions,
  currentGameweek = 15,
  onPredictionSelect,
  teamLogos = {},
  isReadOnly = true
}) => {
  const { theme } = useContext(ThemeContext);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const carouselRef = useRef(null);

  // Group predictions by match within the current gameweek
  const gameweekPredictions = predictions.filter(p => p.gameweek === currentGameweek);
  
  // Group by matchId to get all predictions for each match
  const predictionsByMatch = gameweekPredictions.reduce((groups, prediction) => {
    const matchKey = `${prediction.homeTeam}_vs_${prediction.awayTeam}`;
    if (!groups[matchKey]) {
      groups[matchKey] = {
        matchInfo: {
          homeTeam: prediction.homeTeam,
          awayTeam: prediction.awayTeam,
          date: prediction.date,
          gameweek: prediction.gameweek,
          matchId: prediction.matchId
        },
        predictions: []
      };
    }
    groups[matchKey].predictions.push(prediction);
    return groups;
  }, {});

  const matches = Object.values(predictionsByMatch);

  if (matches.length === 0) {
    return (
      <div className={`text-center py-12 ${text.secondary[theme]}`}>
        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Predictions Found</p>
        <p className="text-sm">No predictions available for Gameweek {currentGameweek}</p>
      </div>
    );
  }

  const currentMatch = matches[activeMatchIndex];

  // Navigation handlers
  const goToNext = () => {
    setActiveMatchIndex((prev) => (prev + 1) % matches.length);
  };

  const goToPrevious = () => {
    setActiveMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handlePredictionClick = (prediction) => {
    setSelectedPrediction(prediction);
    if (onPredictionSelect) {
      onPredictionSelect(prediction);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Navigation Tabs */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${text.primary[theme]}`}>
          Gameweek {currentGameweek} Predictions
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={matches.length <= 1}
            className={`p-2 rounded-lg transition-colors ${
              matches.length <= 1
                ? 'opacity-50 cursor-not-allowed'
                : `${buttons.secondary[theme]} hover:${buttons.secondaryHover[theme]}`
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className={`px-3 py-1 text-sm ${text.secondary[theme]}`}>
            {activeMatchIndex + 1} of {matches.length}
          </span>
          <button
            onClick={goToNext}
            disabled={matches.length <= 1}
            className={`p-2 rounded-lg transition-colors ${
              matches.length <= 1
                ? 'opacity-50 cursor-not-allowed'
                : `${buttons.secondary[theme]} hover:${buttons.secondaryHover[theme]}`
            }`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Match Tabs */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 min-w-max pb-2">
          {matches.map((match, index) => (
            <button
              key={`${match.matchInfo.homeTeam}_vs_${match.matchInfo.awayTeam}`}
              onClick={() => setActiveMatchIndex(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                index === activeMatchIndex
                  ? `${backgrounds.accent[theme]} text-white`
                  : `${backgrounds.secondary[theme]} ${text.secondary[theme]} hover:${backgrounds.hover[theme]}`
              }`}
            >
              {match.matchInfo.homeTeam} vs {match.matchInfo.awayTeam}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                index === activeMatchIndex
                  ? 'bg-white/20 text-white'
                  : `${backgrounds.accent[theme]} text-white`
              }`}>
                {match.predictions.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Match Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMatchIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`${backgrounds.secondary[theme]} rounded-xl p-6`}
        >
          {/* Match Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={teamLogos[currentMatch.matchInfo.homeTeam] || `https://via.placeholder.com/32?text=${currentMatch.matchInfo.homeTeam.substring(0, 3)}`}
                  alt={currentMatch.matchInfo.homeTeam}
                  className="w-8 h-8 rounded"
                />
                <span className={`font-semibold ${text.primary[theme]}`}>
                  {currentMatch.matchInfo.homeTeam}
                </span>
              </div>
              <span className={`text-lg font-bold ${text.secondary[theme]}`}>vs</span>
              <div className="flex items-center space-x-3">
                <span className={`font-semibold ${text.primary[theme]}`}>
                  {currentMatch.matchInfo.awayTeam}
                </span>
                <img
                  src={teamLogos[currentMatch.matchInfo.awayTeam] || `https://via.placeholder.com/32?text=${currentMatch.matchInfo.awayTeam.substring(0, 3)}`}
                  alt={currentMatch.matchInfo.awayTeam}
                  className="w-8 h-8 rounded"
                />
              </div>
            </div>
            <div className={`text-sm ${text.secondary[theme]}`}>
              {format(parseISO(currentMatch.matchInfo.date), 'MMM dd, HH:mm')}
            </div>
          </div>

          {/* Predictions Grid */}
          <div className="space-y-4">
            <h4 className={`font-medium ${text.primary[theme]} flex items-center`}>
              League Member Predictions
              <span className={`ml-2 px-2 py-1 rounded text-xs ${backgrounds.accent[theme]} text-white`}>
                {currentMatch.predictions.length} predictions
              </span>
            </h4>
            
            <div ref={carouselRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentMatch.predictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handlePredictionClick(prediction)}
                  className={`${backgrounds.primary[theme]} rounded-lg p-4 border cursor-pointer transition-all hover:shadow-lg ${
                    selectedPrediction?.id === prediction.id
                      ? `border-teal-500 shadow-lg shadow-teal-500/20`
                      : `border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600`
                  }`}
                >
                  {/* User Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={`font-medium ${text.primary[theme]}`}>
                        {prediction.userDisplayName}
                      </p>
                      <p className={`text-xs ${text.secondary[theme]}`}>
                        {format(parseISO(prediction.predictedAt || prediction.date), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <div className={`text-right ${prediction.correct === null ? text.secondary[theme] : prediction.correct ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="text-lg font-bold">
                        {prediction.points !== null ? `${prediction.points}pts` : '—'}
                      </p>
                      <p className="text-xs">
                        {prediction.status === 'pending' ? 'Pending' : prediction.correct ? 'Correct' : 'Incorrect'}
                      </p>
                    </div>
                  </div>

                  {/* Score Prediction */}
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${text.primary[theme]}`}>
                        {prediction.homeScore}
                      </p>
                      <p className={`text-xs ${text.secondary[theme]} truncate`}>
                        {currentMatch.matchInfo.homeTeam}
                      </p>
                    </div>
                    <span className={`text-lg ${text.secondary[theme]}`}>—</span>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${text.primary[theme]}`}>
                        {prediction.awayScore}
                      </p>
                      <p className={`text-xs ${text.secondary[theme]} truncate`}>
                        {currentMatch.matchInfo.awayTeam}
                      </p>
                    </div>
                  </div>

                  {/* Scorers Preview */}
                  {(prediction.homeScorers?.length > 0 || prediction.awayScorers?.length > 0) && (
                    <div className="border-t pt-3">
                      <p className={`text-xs ${text.secondary[theme]} mb-1`}>Predicted Scorers:</p>
                      <div className="flex justify-between text-xs">
                        <div className="flex-1">
                          {prediction.homeScorers?.slice(0, 2).map((scorer, i) => (
                            <span key={i} className={`${text.secondary[theme]} mr-1`}>
                              {scorer}{i < prediction.homeScorers.length - 1 ? ',' : ''}
                            </span>
                          ))}
                          {prediction.homeScorers?.length > 2 && (
                            <span className={`${text.secondary[theme]}`}>
                              +{prediction.homeScorers.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          {prediction.awayScorers?.slice(0, 2).map((scorer, i) => (
                            <span key={i} className={`${text.secondary[theme]} ml-1`}>
                              {scorer}{i < prediction.awayScorers.length - 1 ? ',' : ''}
                            </span>
                          ))}
                          {prediction.awayScorers?.length > 2 && (
                            <span className={`${text.secondary[theme]}`}>
                              +{prediction.awayScorers.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chips Used */}
                  {prediction.chips?.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {prediction.chips.map((chip, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
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
      </AnimatePresence>
    </div>
  );
};

export default GameweekPredictionsCarousel;
