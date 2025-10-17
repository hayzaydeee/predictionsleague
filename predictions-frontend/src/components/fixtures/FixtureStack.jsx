import React, { useState, useEffect, useRef, useContext } from "react";
import { parseISO } from "date-fns";
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
import { textScale, spacing } from "../../utils/mobileScaleUtils";

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
                    {/* Use FixtureCard directly as the stack item */}
                    <FixtureCard
                      fixture={fixture}
                      selected={selectedFixture && selectedFixture.id === fixture.id}
                      onClick={handleFixtureClick}
                    />
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
