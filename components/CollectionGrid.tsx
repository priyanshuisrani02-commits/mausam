"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCategories,
  type AdminCategory,
} from "@/lib/admin-categories";

export default function CollectionGrid() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const all = await getCategories();

        const homepageCategories = (all ?? [])
          .filter((category) => category.show_on_homepage)
          .sort((a, b) => a.sort_order - b.sort_order);

        setCategories(homepageCategories);
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-stone-50 py-12 sm:py-16 md:py-24">
      <h2 className="mb-8 px-4 text-center text-2xl font-light tracking-[2px] sm:mb-12 sm:text-3xl md:mb-16 md:text-5xl">
        SHOP BY COLLECTION
      </h2>

      {/* Desktop Grid */}
      <div className="mx-auto hidden max-w-7xl grid-cols-2 gap-6 px-6 md:grid md:gap-8 md:px-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-3xl"
          >
            <div className="relative h-[420px] overflow-hidden">
              <img
                src={category.image_url ?? "/images/placeholder.png"}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />

              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-3xl font-light text-white md:text-4xl">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative w-[84vw] max-w-[360px] shrink-0 snap-center overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={category.image_url ?? "/images/placeholder.png"}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-light text-white sm:text-3xl">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
