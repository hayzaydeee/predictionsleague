import React, { useState, useEffect, useRef, useContext } from "react";
import { format, parseISO } from "date-fns";
import { ClockIcon, CalendarIcon } from "@radix-ui/react-icons";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
// Import required modules
import { EffectCards } from "swiper/modules";

import EmptyFixtureState from "./EmptyFixtureState";
import FixtureCard from "./FixtureCardOption2";
import { ThemeContext } from "../../context/ThemeContext";
import { padding, textScale, spacing } from "../../utils/mobileScaleUtils";

export default function FixtureStack({
  fixtures,
  onFixtureSelect,
  searchQuery = "",
  onClearSearch,
}) {
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const [swiperInitialized, setSwiperInitialized] = useState(false);

  // Get theme context
  const { theme } = useContext(ThemeContext);

  // Filter fixtures based on search query
  const filteredFixtures = React.useMemo(() => {
    return fixtures.filter((fixture) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        fixture.homeTeam.toLowerCase().includes(query) ||
        fixture.awayTeam.toLowerCase().includes(query) ||
        fixture.venue?.toLowerCase().includes(query) ||
        fixture.competition?.toLowerCase().includes(query)
      );
    });
  }, [fixtures, searchQuery]);

  // Initialize to today's first fixture or closest upcoming
  const initializationDone = useRef(false);

  useEffect(() => {
    if (initializationDone.current || filteredFixtures.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find first fixture today or upcoming
    const upcomingIndex = filteredFixtures.findIndex((fixture) => {
      const fixtureDate = parseISO(fixture.date);
      return fixtureDate >= today;
    });

    const targetIndex = upcomingIndex !== -1 ? upcomingIndex : 0;

    if (targetIndex !== 0) {
      setActiveIndex(targetIndex);
    }

    initializationDone.current = true;
  }, [filteredFixtures]);

  // Swiper initialization handler
  const handleSwiperInit = (swiper) => {
    if (!swiper) return;
    swiperRef.current = swiper;
    setSwiperInitialized(true);
  };

  // Slide change handler
  const handleSlideChange = (swiper) => {
    if (!swiper || typeof swiper.activeIndex !== "number") return;
    
    if (swiper.activeIndex !== activeIndex && swiper.activeIndex < filteredFixtures.length) {
      setActiveIndex(swiper.activeIndex);
    }
  };

  // Handle fixture selection
  const handleFixtureClick = (fixture) => {
    setSelectedFixture(fixture);
    if (onFixtureSelect) {
      onFixtureSelect(fixture);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!swiperRef.current?.swiper) return;

      let newIndex = activeIndex;

      if (e.key === "ArrowLeft" && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (e.key === "ArrowRight" && activeIndex < filteredFixtures.length - 1) {
        newIndex = activeIndex + 1;
      } else {
        return;
      }

      if (newIndex !== activeIndex) {
        swiperRef.current.swiper.slideTo(newIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredFixtures.length]);

  // Reset activeIndex if it exceeds filtered fixtures length
  useEffect(() => {
    if (filteredFixtures.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= filteredFixtures.length) {
      setActiveIndex(0);
    }
  }, [filteredFixtures.length, activeIndex]);

  return (
    <div
      className={`relative backdrop-blur-md rounded-lg ${padding.cardCompact} ${
        theme === "dark"
          ? "bg-slate-900/60 border border-slate-700/50"
          : "bg-white/80 border border-slate-200 shadow-sm"
      }`}
    >
      <div className="mb-4 sm:mb-6">
        {filteredFixtures.length === 0 ? (
          <EmptyFixtureState searchQuery={searchQuery} />
        ) : (
          <div className="relative">
            {/* Stack of individual fixture cards using Swiper */}
            <div className="fixture-swiper-container">
              <Swiper
                effect={"cards"}
                grabCursor={true}
                modules={[EffectCards]}
                className="fixture-stack-swiper"
                onSlideChange={handleSlideChange}
                onSwiper={handleSwiperInit}
                cardsEffect={{
                  slideShadows: true,
                  perSlideRotate: 5,
                  perSlideOffset: 12,
                  rotate: true,
                }}
                speed={600}
                initialSlide={activeIndex}
                preventInteractionOnTransition={true}
                allowTouchMove={true}
                watchSlidesProgress={true}
                observer={true}
                observeParents={true}
                resistanceRatio={0.85}
                watchOverflow={true}
                touchStartPreventDefault={false}
              >
                {filteredFixtures.map((fixture, index) => (
                  <SwiperSlide key={fixture.id} className="fixture-stack-slide">
                    <div
                      className={`backdrop-blur-md rounded-xl border ${padding.cardCompact} h-full flex flex-col ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-600/50"
                          : "bg-white border-slate-300 shadow-sm"
                      }`}
                    >
                      {/* Fixture metadata header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-700/30">
                        <div className="flex items-center gap-2">
                          {/* Date badge */}
                          <div
                            className={`text-2xs sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-md flex items-center ${
                              theme === "dark"
                                ? "bg-teal-900/40 text-teal-300"
                                : "bg-teal-100 text-teal-700 border border-teal-200"
                            }`}
                          >
                            <CalendarIcon className="mr-1 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">
                              {format(parseISO(fixture.date), "EEE, MMM d")}
                            </span>
                            <span className="sm:hidden">
                              {format(parseISO(fixture.date), "MMM d")}
                            </span>
                          </div>

                          {/* Time badge */}
                          <div
                            className={`text-2xs sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md flex items-center ${
                              theme === "dark"
                                ? "bg-slate-800/50 text-slate-400"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <ClockIcon className="mr-1 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {format(parseISO(fixture.date), "h:mm a")}
                          </div>

                          {/* Gameweek badge */}
                          {fixture.gameweek && (
                            <div
                              className={`text-2xs sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                                theme === "dark"
                                  ? "text-white/50 bg-primary-700/40"
                                  : "text-slate-600 bg-slate-100"
                              }`}
                            >
                              GW {fixture.gameweek}
                            </div>
                          )}
                        </div>

                        {/* Position indicator */}
                        <div
                          className={`text-2xs sm:text-xs font-medium ${
                            theme === "dark" ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          <span className="hidden sm:inline">
                            Fixture {index + 1} of {filteredFixtures.length}
                          </span>
                          <span className="sm:hidden">
                            {index + 1}/{filteredFixtures.length}
                          </span>
                        </div>
                      </div>

                      {/* Main fixture card */}
                      <div className="flex-grow flex items-center justify-center">
                        <FixtureCard
                          fixture={fixture}
                          selected={selectedFixture && selectedFixture.id === fixture.id}
                          onClick={handleFixtureClick}
                        />
                      </div>

                      {/* Swipe hint */}
                      <div
                        className={`text-center mt-3 text-2xs sm:text-xs ${
                          theme === "dark" ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        {index < filteredFixtures.length - 1 ? (
                          <span>← Swipe for next fixture →</span>
                        ) : (
                          <span>Last fixture</span>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicators */}
      {filteredFixtures.length > 0 && (
        <div className="flex flex-col items-center mt-4 gap-2">
          {/* Numeric indicator for large lists */}
          {filteredFixtures.length > 10 && (
            <div
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                theme === "dark"
                  ? "bg-slate-800/50 text-slate-400"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {activeIndex + 1} / {filteredFixtures.length}
            </div>
          )}

          {/* Dot indicators for smaller lists */}
          {filteredFixtures.length <= 10 && (
            <div className="flex space-x-1">
              {filteredFixtures.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? theme === "dark"
                        ? "bg-teal-400 scale-125"
                        : "bg-teal-500 scale-125"
                      : theme === "dark"
                      ? "bg-white/30"
                      : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
