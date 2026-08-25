"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getHomepagePrints, type HomepagePrint } from "@/lib/homepage-prints";

export default function PrintsCarousel() {
  const [items, setItems] = useState<HomepagePrint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getHomepagePrints()
      .then((data) => {
        if (!mounted) return;
        setItems(data);
        setActiveIndex(0);
      })
      .catch((fetchError) => {
        console.error("Prints carousel fetch failed:", fetchError);
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % items.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const visibleItems = useMemo(() => {
    if (!items.length) return [];

    // Keep a small circular stack. The active card opens to the front while
    // the following cards remain visibly tucked behind it.
    return Array.from({ length: Math.min(items.length, 5) }, (_, offset) => {
      const index = (activeIndex + offset) % items.length;
      return { item: items[index], offset };
    });
  }, [items, activeIndex]);

  function goNext() {
    if (items.length < 2) return;
    setDirection(1);
    setActiveIndex((current) => (current + 1) % items.length);
  }

  function goPrevious() {
    if (items.length < 2) return;
    setDirection(-1);
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  }

  return (
    <section
      className="overflow-hidden bg-[#fffdf8] px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-16"
      aria-label="MAUSAM prints and craft"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[2.8px] text-[#8a5b25] sm:text-[10px] sm:tracking-[3.5px]">
            Threads of MAUSAM
          </p>
          <h2 className="mausam-serif text-[30px] leading-tight text-[#39362f] sm:text-4xl md:text-5xl">
            Prints, patterns &amp; craft
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-xs leading-5 text-[#746e63] sm:text-sm sm:leading-6">
            A closer look at the colours, textures and details that shape each seasonal story.
          </p>
        </div>

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[390px]" aria-live="polite">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9cdbb] border-t-[#5b6046]" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-[#e5ddd0] bg-[#fffaf1] px-6 py-10 text-center text-sm text-[#746e63]">
            The seasonal stories are taking a moment to load. Please refresh the page.
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-[#e5ddd0] bg-[#fffaf1] px-6 py-10 text-center text-sm text-[#746e63]">
            Seasonal stories are coming soon.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="relative mx-auto flex min-h-[390px] max-w-[760px] items-center justify-center sm:min-h-[500px]">
            <div className="relative h-[285px] w-[285px] sm:h-[380px] sm:w-[380px]">
              {visibleItems.map(({ item, offset }) => {
                const isActive = offset === 0;
                const depth = offset;
                const scale = 1 - depth * 0.075;
                const translateX = depth * 30;
                const translateY = depth * 10;
                const rotate = depth * 2.5;
                const opacity = 1 - depth * 0.11;
                const zIndex = 20 - depth;

                const content = (
                  <div
                    className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      zIndex,
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                      opacity,
                    }}
                  >
                    <div
                      className={`relative h-full w-full overflow-hidden rounded-full border-[7px] border-[#f4eee3] bg-[#eee7da] shadow-[0_18px_45px_rgba(73,62,44,0.16)] ring-1 ring-[#dfd4c3] ${
                        isActive ? "" : "brightness-[0.93]"
                      }`}
                    >
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 285px, 380px"
                        unoptimized
                        priority={isActive}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                    </div>

                    {isActive && (
                      <div className="absolute -bottom-16 left-1/2 w-[250px] -translate-x-1/2 text-center sm:-bottom-20 sm:w-[340px]">
                        <h3 className="mausam-serif text-xl leading-tight text-[#403b33] sm:text-2xl">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mx-auto mt-1.5 max-w-[290px] text-[10px] leading-4 text-[#81796d] sm:text-xs sm:leading-5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );

                return item.link ? (
                  <Link
                    key={`${item.id}-${activeIndex}-${offset}`}
                    href={item.link}
                    aria-label={item.title}
                    className="absolute inset-0"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={`${item.id}-${activeIndex}-${offset}`}
                    type="button"
                    onClick={isActive ? goNext : undefined}
                    aria-label={isActive ? `Next: ${item.title}` : item.title}
                    className="absolute inset-0 text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>

            {items.length > 1 && (
              <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:bottom-1">
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label="Previous print"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cdbb] bg-[#fffaf1]/95 text-base text-[#5b6046] shadow-sm transition hover:bg-[#eee7d8] active:scale-95"
                >
                  ←
                </button>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {items.map((item, index) => (
                    <span
                      key={item.id}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === activeIndex ? "w-6 bg-[#5b6046]" : "w-1.5 bg-[#d9cdbb]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next print"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cdbb] bg-[#fffaf1]/95 text-base text-[#5b6046] shadow-sm transition hover:bg-[#eee7d8] active:scale-95"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
