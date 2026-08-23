"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, type AdminCategory } from "@/lib/admin-categories";

const accents = [
  { bg: "#e7eadc", text: "#4f583e", line: "#c9cfb8" },
  { bg: "#f5e5cf", text: "#8a5b25", line: "#e4c79c" },
  { bg: "#e9d8d7", text: "#875955", line: "#d8b8b5" },
  { bg: "#dfe7ec", text: "#526a7b", line: "#c1d0da" },
  { bg: "#ead9ca", text: "#82462f", line: "#d8b39d" },
  { bg: "#e4dfd2", text: "#665c48", line: "#cfc7b5" },
];

export default function CollectionGrid() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  useEffect(() => {
    getCategories()
      .then((all) =>
        setCategories(
          (all ?? [])
            .filter((category) => category.show_on_homepage)
            .sort((a, b) => a.sort_order - b.sort_order)
        )
      )
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[2.5px] text-[#7b756b] sm:text-[10px] sm:tracking-[3px]">
              The MAUSAM Edit
            </p>
            <h2 className="mausam-serif text-[30px] font-normal leading-tight tracking-[0.5px] text-[#39362f] sm:text-4xl md:text-5xl">
              Four seasons. Endless stories.
            </h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-[#746e63] sm:text-sm sm:leading-6 md:text-right">
            Discover silhouettes and colours chosen to move with your mood, your moments and every season in between.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => {
            const accent = accents[index % accents.length];

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[18px] border border-[#e5ddd0] bg-[#fffdf8] shadow-[0_5px_18px_rgba(70,61,45,0.055)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(70,61,45,0.10)] sm:rounded-[22px]"
              >
                {/*
                  Category artwork is intentionally shown in its entirety.
                  Several MAUSAM category artworks contain their own typography,
                  so object-cover was cropping the left/right edges on narrow cards.
                */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#eee8dd]">
                  <img
                    src={category.image_url ?? "/images/placeholder.png"}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-contain object-center transition duration-700 group-hover:scale-[1.01]"
                  />
                  <span
                    className="absolute left-2.5 top-2.5 rounded-full border px-2 py-1 text-[7px] font-medium uppercase tracking-[1.2px] backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[9px] sm:tracking-[2px]"
                    style={{
                      backgroundColor: `${accent.bg}e8`,
                      borderColor: accent.line,
                      color: accent.text,
                    }}
                  >
                    Seasonal edit
                  </span>
                </div>

                {/* The title lives outside the artwork so it can never be cropped. */}
                <div className="px-3 py-3 sm:px-5 sm:py-4" style={{ backgroundColor: accent.bg }}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="mausam-serif min-w-0 break-words text-[17px] leading-[1.08] text-[#39362f] sm:text-[22px]">
                      {category.name}
                    </h3>
                    <span
                      className="mt-0.5 shrink-0 text-base leading-none sm:text-lg"
                      style={{ color: accent.text }}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                  <span className="mt-2 block text-[7px] font-medium uppercase tracking-[1.3px] text-[#655f55] sm:text-[9px] sm:tracking-[1.8px]">
                    Explore collection
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
