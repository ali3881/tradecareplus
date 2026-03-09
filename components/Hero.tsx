"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: string;
  bg: string;
  worker: string;
};

const slides: Slide[] = [
  {
    id: "slide-1",
    bg: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/slider1.jpg",
    worker: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/slider-man.png",
  },
  {
    id: "slide-2",
    bg: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/slider2.jpg",
    worker: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/slider-man2.png",
  },
];

const serviceItems = [
  {
    id: "plumbing",
    label: "PLUMBING",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon1.png",
    pos: "top-0 left-1/2 -translate-x-1/2",
    enterFrom: "-translate-y-10 translate-x-10",
  },
  {
    id: "right-top",
    label: "ELECTRICAL",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon2.png",
    pos: "top-[19%] right-0",
    enterFrom: "-translate-y-8 translate-x-10",
  },
  {
    id: "right-bottom",
    label: "FLOORING",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon3.png",
    pos: "bottom-[19%] right-0",
    enterFrom: "translate-y-8 translate-x-10",
  },

   {
    id: "painting",
    label: "PAINTING",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon4.png",
    pos: "bottom-0 left-1/2 -translate-x-1/2",
    enterFrom: "translate-y-10 translate-x-10",
  },
  {
    id: "left-bottom",
    label: "LIGHTING",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon5.png",
    pos: "bottom-[19%] left-0",
    enterFrom: "translate-y-8 -translate-x-10",
  },
    {
    id: "left-top",
    label: "FLOORING",
    image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon6.png",
    pos: "top-[19%] left-0",
    enterFrom: "-translate-y-8 -translate-x-10",
  },
];

const centerServiceItem = {
  id: "center",
  label: "RENOVATION",
  image: "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/icon7.png",
  pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_MS = 10000;
  const SLIDE_FADE_MS = 5000;
  const SERVICE_ZOOM_MS = 520;
  const SERVICE_IN_STAGGER_MS = 240;
  const SERVICE_IN_START_DELAY_MS = 300;
  const SERVICE_OUT_START_DELAY_MS = 100;

  const goToSlide = useCallback((targetIndex: number) => {
    if (targetIndex === activeSlide) return;
    setActiveSlide(targetIndex);
  }, [activeSlide]);

  const resetAuto = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      goToSlide((activeSlide + 1) % slides.length);
    }, AUTO_MS);
  }, [AUTO_MS, activeSlide, goToSlide]);

  useEffect(() => {
    const mountTimer = setTimeout(() => setHasMounted(true), 40);
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    resetAuto();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [activeSlide, resetAuto]);

  return (
    <section className="relative w-full h-[620px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {slides.map((slide, index) => {
        const isActive = activeSlide === index;
        const serviceIsIn = index === 0 && isActive && hasMounted;
        const serviceIsOut = index === 0 && !isActive;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ transitionDuration: `${SLIDE_FADE_MS}ms` }}
          >
            <img src={slide.bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#252730]/72" />
            <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-white/100 via-white/45 to-transparent" />

            <div className="relative h-full max-w-[1280px] mx-auto px-4 sm:px-6">
              <div
                className={`absolute top-[60px] md:top-[110px] lg:top-[125px] w-[480px] lg:w-[560px] h-[480px] lg:h-[560px] transition-opacity duration-[1200ms] ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="relative h-full w-full">
                  {index === 0 &&
                    serviceItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className={`absolute ${item.pos}`}
                      >
                        <div
                        className={`flex flex-col items-center transition-all duration-[1200ms] ease-out ${
                            serviceIsIn ? "opacity-100 scale-100" : "opacity-0 scale-75"
                          }`}
                          style={{
                            transitionDelay: serviceIsIn
                              ? `${SERVICE_IN_START_DELAY_MS + itemIndex * SERVICE_IN_STAGGER_MS}ms`
                              : serviceIsOut
                                ? `${SERVICE_OUT_START_DELAY_MS + (serviceItems.length - 1 - itemIndex) * SERVICE_IN_STAGGER_MS}ms`
                                : "0ms",
                            transitionDuration: `${SERVICE_ZOOM_MS}ms`,
                          }}
                        >
                          <div className="rounded-full flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.label}
                              className="h-[90%] w-[90%] sm:h-[90%] sm:w-[90%] lg:h-full lg:w-full object-contain"
                            />
                          </div>
                          <span className="mt-2 sm:mt-3 text-[11px] sm:text-xs lg:text-base text-white leading-none font-semibold font-alt">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    ))}

                  {index === 0 && (
                    <div
                      className={`absolute ${centerServiceItem.pos}`}
                    >
                      <div
                        className={`flex flex-col items-center transition-all duration-[1200ms] ease-out ${
                          serviceIsIn ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                        style={{
                          transitionDelay: serviceIsIn
                            ? `${SERVICE_IN_START_DELAY_MS + serviceItems.length * SERVICE_IN_STAGGER_MS + 120}ms`
                            : serviceIsOut
                              ? `${SERVICE_OUT_START_DELAY_MS + serviceItems.length * SERVICE_IN_STAGGER_MS + 120}ms`
                              : "0ms",
                          transitionDuration: `${SERVICE_ZOOM_MS}ms`,
                        }}
                      >
                        <div className="rounded-full flex items-center justify-center">
                          <img
                            src={centerServiceItem.image}
                            alt={centerServiceItem.label}
                            className="h-[90%] w-[90%] sm:h-[90%] sm:w-[90%] lg:h-full lg:w-full object-contain"
                          />
                        </div>
                        <span className="mt-2 sm:mt-3 text-[11px] sm:text-xs lg:text-base text-white leading-none font-semibold font-alt">
                          {centerServiceItem.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {index === 1 && (
                <div className="absolute right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 text-right">
                  <div
                    className={`transition-opacity duration-1000 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="font-alt text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                      We Take Care of
                    </p>
                    <h2 className="mt-4 font-alt text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[0.95] mt-2">
                      YOUR HOME!
                    </h2>
                  </div>

                  <div
                    className={`mt-8 transition-all duration-1000 ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                    style={{ transitionDelay: isActive ? "600ms" : "0ms" }}
                  >
                    <Link
                      href="/contact"
                      className="inline-flex text-sm items-center justify-center bg-yellow-400 px-8 py-3 rounded-md text-black shadow-lg"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => {
              goToSlide(index);
              resetAuto();
            }}
            className={`h-5 w-5 rounded-full transition-all duration-300 ${
              activeSlide === index
                ? "bg-[#F4B400] border-0 shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
                : "bg-white border-4 border-[#F4B400] shadow-none"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
