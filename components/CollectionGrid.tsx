"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <section className="bg-stone-50 py-24">
      <h2 className="mb-16 text-center text-5xl font-light tracking-wide">
        SHOP BY COLLECTION
      </h2>

      {/* ===========================
          Desktop Grid
      =========================== */}
      <div className="mx-auto hidden max-w-7xl grid-cols-2 gap-8 px-8 md:grid">
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
  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-110"
/>

              <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />

              <div className="absolute bottom-10 left-10">
                <h3 className="text-4xl font-light text-white">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ===========================
          Mobile Carousel
      =========================== */}
      <div className="md:hidden">
        <div
          className="
            flex
            gap-4
            overflow-x-auto
            px-4
            snap-x
            snap-mandatory
            scroll-smooth
            pb-2
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="
                group
                relative
                w-[85vw]
                shrink-0
                snap-start
                overflow-hidden
                rounded-3xl
              "
            >
              <div className="relative h-[420px] overflow-hidden">
               <img
  src={category.image_url ?? "/images/placeholder.png"}
  alt={category.name}
  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-110"
/>

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-light text-white">
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