"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";

import {
  getHeroSlides,
  type HeroSlide,
} from "@/lib/admin-hero";

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    async function loadSlides() {
      try {
        const data = await getHeroSlides();
        const activeSlides = data.filter((slide) => slide.active);

        if (activeSlides.length > 0) {
          setSlides(activeSlides);
          return;
        }
      } catch (error) {
        console.error("Hero fetch failed:", error);
      }

      setSlides([
        {
          id: "1",
          image_url: "/images/hero1.png",
          link: "/collections/new-arrivals",
          sort_order: 1,
          active: true,
        },
        {
          id: "2",
          image_url: "/images/hero2.png",
          link: "/collections/ethnic",
          sort_order: 2,
          active: true,
        },
        {
          id: "3",
          image_url: "/images/hero3.png",
          link: "/collections/tops",
          sort_order: 3,
          active: true,
        },
      ]);
    }

    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    setCurrent((previous) => Math.min(previous, slides.length - 1));

    const interval = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [slides]);

  function goToSlide(index: number) {
    setCurrent((index + slides.length) % slides.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Only treat a clearly horizontal gesture as a carousel swipe.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      goToSlide(current + 1);
    } else {
      goToSlide(current - 1);
    }
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="MAUSAM featured collections"
      className="relative w-full overflow-hidden bg-stone-100 md:h-[80vh] lg:h-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[16/9] w-full md:h-full md:aspect-auto">
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            href={slide.link || "/"}
            aria-label={`View hero slide ${index + 1}`}
            aria-hidden={current !== index}
            tabIndex={current === index ? 0 : -1}
            className={`absolute inset-0 block transition-opacity duration-700 ease-out ${
              current === index
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
          >
            <Image
              src={slide.image_url}
              alt={`MAUSAM collection ${index + 1}`}
              fill
              priority={index === 0}
              draggable={false}
              className="object-contain md:object-cover"
              sizes="100vw"
              unoptimized
            />
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous hero slide"
            onClick={() => goToSlide(current - 1)}
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl leading-none text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white sm:left-3 sm:h-10 sm:w-10 md:left-6 md:h-12 md:w-12 md:text-4xl"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next hero slide"
            onClick={() => goToSlide(current + 1)}
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl leading-none text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white sm:right-3 sm:h-10 sm:w-10 md:right-6 md:h-12 md:w-12 md:text-4xl"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/10 px-3 py-2 backdrop-blur-sm sm:bottom-4 md:bottom-8 md:gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to hero slide ${index + 1}`}
                aria-current={current === index ? "true" : undefined}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 ${
                  current === index
                    ? "scale-125 bg-white"
                    : "bg-white/55 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
