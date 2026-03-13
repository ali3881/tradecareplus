"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-[28px] shadow-xl">
        <img
          src={images[activeIndex]}
          alt={`${title} image ${activeIndex + 1}`}
          className="h-[260px] w-full object-cover md:h-[480px]"
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous project image"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next project image"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <>
          <div className="mt-5 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to project image ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? "w-8 bg-yellow-500" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={`${image}-thumb-${index}`}
                type="button"
                onClick={() => goTo(index)}
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  activeIndex === index ? "border-yellow-500" : "border-transparent hover:border-yellow-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-28 w-full object-cover md:h-36"
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
