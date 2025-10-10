import { useContext } from "react";
import { motion } from "framer-motion";
import { format, addMinutes, parseISO } from "date-fns";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles, backgrounds, text, buttons, status } from "../../../utils/themeUtils";
import { Cross2Icon, CalendarIcon, ClockIcon } from "@radix-ui/react-icons";

export default function ModalHeader({ fixture, onClose, isEditing = false }) {
  const { theme } = useContext(ThemeContext);
  
  const modalTitle = isEditing ? "Edit Prediction" : "Make Prediction";
  const matchDate = parseISO(fixture.date);
  const formattedDate = format(matchDate, "MMM dd, HH:mm");
  const deadlineTime = addMinutes(matchDate, -45);

  return (
    <div className="p-6 border-b border-slate-700/60">
      {/* Close button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
        aria-label="Close"
      >
        <Cross2Icon className="w-4 h-4" />
      </motion.button>

      {/* Rich Card Style Header */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-300">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 font-outfit">
                {fixture.homeTeam} vs {fixture.awayTeam}
              </p>
              <p className="text-xs text-slate-500 font-outfit">
                GW{fixture.gameweek} • {formattedDate}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold font-outfit text-slate-200">
              {modalTitle}
            </div>
            <div className="text-xs font-medium font-outfit text-blue-400">
              {isEditing ? 'Updating' : 'Creating'}
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center">
          <ClockIcon className="mr-2 w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-xs font-outfit">
            Prediction deadline: {format(deadlineTime, "MMM d, h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}
