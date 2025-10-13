import React, { useContext, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { 
  TargetIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotIcon
} from "@radix-ui/react-icons";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
// Import required modules
import { EffectCards } from "swiper/modules";

import { ThemeContext } from "../../context/ThemeContext";
import PredictionCard from "./PredictionCard";
import EmptyState from "../common/EmptyState";

const LeaguePredictionsStack = ({
  predictions,
  onPredictionSelect,
  teamLogos = {},
  searchQuery = ""
}) => {
  const { theme } = useContext(ThemeContext);
  const [swiperInitialized, setSwiperInitialized] = useState(false);
  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);
  const swiperRef = useRef(null);

  // Filter predictions based on search query
  const filteredPredictions = React.useMemo(() => {
    return predictions.filter(prediction => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        prediction.userDisplayName?.toLowerCase().includes(searchLower) ||
        prediction.homeTeam.toLowerCase().includes(searchLower) ||
        prediction.awayTeam.toLowerCase().includes(searchLower) ||
        `${prediction.homeTeam} vs ${prediction.awayTeam}`.toLowerCase().includes(searchLower)
      );
    });
  }, [predictions, searchQuery]);

  // Group predictions by date
  const groupedPredictions = React.useMemo(() => {
    const groups = filteredPredictions.reduce((acc, prediction) => {
      const date = format(parseISO(prediction.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(prediction);
      return acc;
    }, {});

    // Convert to array format sorted by date
    return Object.keys(groups)
      .sort()
      .map(date => ({
        date,
        predictions: groups[date]
      }));
  }, [filteredPredictions]);


  // Handle swiper initialization
  const handleSwiperInit = (swiper) => {
    if (!swiper) return;
    swiperRef.current = swiper;
    setSwiperInitialized(true);
    setVisibleSlideIndex(swiper.activeIndex);
  };

  // Handle slide change
  const handleSlideChange = (swiper) => {
    if (!swiper || typeof swiper.activeIndex !== "number") return;
    setVisibleSlideIndex(swiper.activeIndex);
  };

  // Handle prediction selection
  const handlePredictionClick = (prediction) => {
    if (onPredictionSelect && typeof onPredictionSelect === 'function') {
      onPredictionSelect(prediction);
    }
  };

  const handleCardClick = (prediction) => {
    onPredictionSelect?.(prediction);
  };

  if (groupedPredictions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center py-12"
      >
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
      </motion.div>
    );
  }

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
        {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} • {visibleSlideIndex + 1} of {groupedPredictions.length} date{groupedPredictions.length !== 1 ? 's' : ''}
      </div>

      {/* Swiper Stack Container */}
      <div className="relative h-[400px] flex items-center justify-center">
        <Swiper
          effect="cards"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          loop={groupedPredictions.length > 1}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          className="w-full max-w-sm h-full"
          modules={[EffectCards]}
        >
          {groupedPredictions.map((group, groupIndex) => (
            <SwiperSlide key={group.date} className="flex flex-col">
              {/* Date Header */}
              <div className={`text-center mb-4 p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-800/50 text-slate-300'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <div className="text-sm font-medium">
                  {format(parseISO(group.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {group.predictions.length} prediction{group.predictions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Predictions for this date */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-80">
                {group.predictions.map((prediction) => (
                  <PredictionCard
                    key={`${prediction.userId}-${prediction.fixtureId}`}
                    prediction={prediction}
                    mode="league"
                    showMemberInfo={true}
                    onSelect={handlePredictionClick}
                    isReadonly={true}
                    size="compact"
                  />
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={groupedPredictions.length <= 1}
          className={`p-2 rounded-full transition-all ${
            groupedPredictions.length <= 1
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
          {groupedPredictions.slice(0, Math.min(5, groupedPredictions.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => swiperRef.current?.slideTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                visibleSlideIndex === index
                  ? 'bg-teal-500'
                  : theme === 'dark'
                  ? 'bg-slate-600 hover:bg-slate-500'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
          {groupedPredictions.length > 5 && (
            <DotIcon className={`w-4 h-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
          )}
        </div>
        
        <button
          onClick={() => swiperRef.current?.slideNext()}
          disabled={groupedPredictions.length <= 1}
          className={`p-2 rounded-full transition-all ${
            groupedPredictions.length <= 1
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
};

export default LeaguePredictionsStack;
