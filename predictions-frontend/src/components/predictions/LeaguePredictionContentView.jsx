import { motion, AnimatePresence } from "framer-motion";
import LeaguePredictionsByMember from "./LeaguePredictionsByMember";
import LeaguePredictionsList from "./LeaguePredictionsList";
import GameweekPredictionsCarousel from "./GameweekPredictionsCarousel";
// Import future components as they're created
// import LeaguePredictionsTable from "./LeaguePredictionsTable";
// import LeaguePredictionsStack from "./LeaguePredictionsStack";
// import LeaguePredictionsCalendar from "./LeaguePredictionsCalendar";
// import LeaguePredictionsTimeline from "./LeaguePredictionsTimeline";

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

      {/* Placeholder for future view modes */}
      {viewMode === "table" && (
        <motion.div
          key="table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">Table View Coming Soon</h3>
            <p className="text-sm text-gray-600">This view is under development</p>
          </div>
        </motion.div>
      )}

      {viewMode === "stack" && (
        <motion.div
          key="stack"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">Stack View Coming Soon</h3>
            <p className="text-sm text-gray-600">This view is under development</p>
          </div>
        </motion.div>
      )}

      {viewMode === "calendar" && (
        <motion.div
          key="calendar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">Calendar View Coming Soon</h3>
            <p className="text-sm text-gray-600">This view is under development</p>
          </div>
        </motion.div>
      )}

      {viewMode === "timeline" && (
        <motion.div
          key="timeline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">Timeline View Coming Soon</h3>
            <p className="text-sm text-gray-600">This view is under development</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaguePredictionContentView;
