"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";

import {
  getHeroSlides,
  deleteHeroSlide,
  type HeroSlide,
} from "@/lib/admin-hero";

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSlides() {
    setLoading(true);

    try {
      const data = await getHeroSlides();

      setSlides(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this hero slide?"
    );

    if (!confirmed) return;

    await deleteHeroSlide(id);

    await loadSlides();
  }

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light text-black">
          Hero Slider
        </h1>

        <Link
          href="/admin/homepage/new-slide"
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          + Add Hero Slide
        </Link>
      </div>

      <div className="rounded-[32px] bg-white p-10 shadow">
        <h2 className="mb-8 text-3xl font-light">
          Hero Slides
        </h2>

        {loading ? (
          <p className="text-gray-500">
            Loading...
          </p>
        ) : slides.length === 0 ? (
          <p className="text-gray-500">
            No hero slides yet.
          </p>
        ) : (
          <div className="grid gap-6">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div>
                  <img
                    src={slide.image_url}
                    alt="Hero Slide"
                    className="mb-3 h-28 w-48 rounded-xl object-cover"
                  />

                  <p className="text-sm text-gray-500">
                    {slide.link}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Sort Order: {slide.sort_order}
                  </p>

                  {slide.active && (
                    <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      Active
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleDelete(slide.id)
                  }
                  className="rounded-full border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 