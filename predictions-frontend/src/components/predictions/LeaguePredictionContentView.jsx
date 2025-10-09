import { motion, AnimatePresence } from "framer-motion";
import LeaguePredictionsByTeam from "./LeaguePredictionsByTeam";
import LeaguePredictionsList from "./LeaguePredictionsList";
import GameweekPredictionsCarousel from "./GameweekPredictionsCarousel";
import PredictionTable from "./PredictionTable";
import LeaguePredictionsStack from "./LeaguePredictionsStack";
import LeaguePredictionsCalendar from "./LeaguePredictionsCalendar";
import LeaguePredictionsTimeline from "./LeaguePredictionsTimeline";

const LeaguePredictionContentView = ({ 
  viewMode, 
  predictions, 
  onPredictionSelect, 
  teamLogos,
  searchQuery,
  currentGameweek
}) => {
  // Filter predictions based on search query if provided
  const filteredPredictions = searchQuery 
    ? predictions.filter(prediction => 
        prediction.userDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.homeTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.awayTeam?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : predictions;
  return (
    <AnimatePresence mode="wait">
      {viewMode === "teams" && (
        <motion.div
          key="teams"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsByTeam
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            currentGameweek={currentGameweek}
          />
        </motion.div>
      )}

      {viewMode === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsList
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
          />
        </motion.div>
      )}

      {viewMode === "carousel" && (
        <motion.div
          key="carousel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GameweekPredictionsCarousel
            predictions={filteredPredictions}
            currentGameweek={currentGameweek}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            isReadOnly={true}
          />
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <motion.div
          key="table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PredictionTable
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
            mode="league"
          />
        </motion.div>
      )}

      {/* Stack View */}
      {viewMode === "stack" && (
        <motion.div
          key="stack"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsStack
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
          />
        </motion.div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <motion.div
          key="calendar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsCalendar
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
          />
        </motion.div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <motion.div
          key="timeline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsTimeline
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaguePredictionContentView;
