import { motion, AnimatePresence } from "framer-motion";
import PredictionsByMember from "./PredictionsByMember";
import PredictionGrid from "./PredictionGrid";
import PredictionCarousel from "./PredictionCarousel";
import PredictionTable from "./PredictionTable";
import LeaguePredictionsStack from "./LeaguePredictionsStack";
import LeaguePredictionsCalendar from "./LeaguePredictionsCalendar";

const LeaguePredictionContentView = ({ 
  viewMode, 
  predictions, 
  onPredictionSelect, 
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
          <PredictionsByMember
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
            currentGameweek={currentGameweek}
            mode="league"
            searchQuery={searchQuery}
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
          <PredictionGrid
            mode="league"
            predictions={filteredPredictions}
            onPredictionSelect={onPredictionSelect}
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
          <PredictionCarousel
            mode="league"
            predictions={filteredPredictions}
            currentGameweek={currentGameweek}
            onPredictionSelect={onPredictionSelect}
            isReadOnly={true}
            searchQuery={searchQuery}
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
            searchQuery={searchQuery}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaguePredictionContentView;
