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
    async function loadCategories() {
      try {
        const all = await getCategories();
        setCategories(
          (all ?? [])
            .filter((category) => category.show_on_homepage)
            .sort((a, b) => a.sort_order - b.sort_order)
        );
      } catch (error) {
        console.error(error);
      }
    }
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-[#fffdf8] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-[#7b756b]">The MAUSAM Edit</p>
            <h2 className="mausam-serif text-3xl font-normal tracking-[1px] text-[#39362f] sm:text-4xl md:text-5xl">Four seasons. Endless stories.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#746e63] md:text-right">
            Discover silhouettes and colours chosen to move with your mood, your moments and every season in between.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => {
            const accent = accents[index % accents.length];
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[22px] border border-[#e5ddd0] bg-[#fffdf8] shadow-[0_8px_28px_rgba(70,61,45,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(70,61,45,0.11)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eee8dd]">
                  <img
                    src={category.image_url ?? "/images/placeholder.png"}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#302d27]/45 via-transparent to-transparent opacity-70" />
                  <span className="absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[9px] font-medium uppercase tracking-[2px] backdrop-blur-sm" style={{ backgroundColor: `${accent.bg}dd`, borderColor: accent.line, color: accent.text }}>
                    Seasonal edit
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ backgroundColor: accent.bg }}>
                  <h3 className="mausam-serif text-xl text-[#3b372f] sm:text-2xl">{category.name}</h3>
                  <span className="text-lg" style={{ color: accent.text }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
