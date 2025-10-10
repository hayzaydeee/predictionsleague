import React, { useContext } from "react";
import { MagnifyingGlassIcon, BarChartIcon } from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";

const EmptyPredictionState = ({ searchQuery }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`border rounded-lg p-6 text-center max-w-lg mx-auto ${
      theme === 'dark'
        ? 'bg-primary-700/30 border-primary-600/30'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className={`rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-primary-600/30'
          : 'bg-gray-100'
      }`}>
        {searchQuery ? (
          <MagnifyingGlassIcon className={`w-6 h-6 ${
            theme === 'dark' ? 'text-teal-300/60' : 'text-gray-400'
          }`} />
        ) : (
          <BarChartIcon className={`w-6 h-6 ${
            theme === 'dark' ? 'text-teal-300/60' : 'text-gray-400'
          }`} />
        )}
      </div>
      <h3 className={`text-lg mb-2 ${
        theme === 'dark' ? 'text-teal-100' : 'text-gray-900'
      }`}>
        {searchQuery ? "No predictions found" : "No predictions available"}
      </h3>
      {searchQuery ? (
        <p className={`text-sm ${
          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
        }`}>
          No predictions match your search for "{searchQuery}". Try adjusting your search terms.
        </p>
      ) : (
        <p className={`text-sm ${
          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
        }`}>
          Predictions for Big Six teams will appear here once you start making predictions for their fixtures.
        </p>
      )}
      
      {searchQuery && (
        <button
          onClick={() => window.location.reload()}
          className={`mt-4 px-4 py-2 text-sm rounded-lg transition-colors ${
            theme === "dark"
              ? "bg-primary-700 hover:bg-primary-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default EmptyPredictionState;
