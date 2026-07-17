"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getHeroSlides,
  type HeroSlide,
} from "@/lib/admin-hero";

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    async function loadSlides() {
      try {
        const data = await getHeroSlides();

        console.log("LIVE HERO SLIDES:", data);

        const activeSlides = data.filter(
          (slide) => slide.active
        );

        if (activeSlides.length > 0) {
          setSlides(activeSlides);
          return;
        }

        console.log("No active hero slides found.");
      } catch (err) {
        console.error("Hero fetch failed:", err);
      }

      console.log("Using fallback hero images.");

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

    const interval = setInterval(() => {
      setCurrent(
        (prev) => (prev + 1) % slides.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-screen w-full overflow-hidden">
      {slides.map((slide, index) => (
        <Link
          key={slide.id}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            current === index
              ? "opacity-100 z-10"
              : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image_url}
            alt={`Hero ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </Link>
      ))}

      <button
        onClick={() =>
          setCurrent(
            (current - 1 + slides.length) %
              slides.length
          )
        }
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl text-white backdrop-blur transition hover:bg-black/50 md:left-6 md:px-4 md:py-2 md:text-4xl"
      >
        ‹
      </button>

      <button
        onClick={() =>
          setCurrent(
            (current + 1) % slides.length
          )
        }
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl text-white backdrop-blur transition hover:bg-black/50 md:right-6 md:px-4 md:py-2 md:text-4xl"
      >
        ›
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-8 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 md:h-3 md:w-3 ${
              current === index
                ? "scale-125 bg-white"
                : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}