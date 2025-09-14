import { motion, AnimatePresence } from "framer-motion";
import LeaguePredictionsByMember from "./LeaguePredictionsByMember";
import LeaguePredictionsList from "./LeaguePredictionsList";
import GameweekPredictionsCarousel from "./GameweekPredictionsCarousel";
import LeaguePredictionsTable from "./LeaguePredictionsTable";
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
  return (
    <AnimatePresence mode="wait">
      {viewMode === "members" && (
        <motion.div
          key="members"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LeaguePredictionsByMember
            predictions={predictions}
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
            predictions={predictions}
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
            predictions={predictions}
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
          <LeaguePredictionsTable
            predictions={predictions}
            onPredictionSelect={onPredictionSelect}
            teamLogos={teamLogos}
            searchQuery={searchQuery}
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
            predictions={predictions}
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
            predictions={predictions}
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
            predictions={predictions}
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
