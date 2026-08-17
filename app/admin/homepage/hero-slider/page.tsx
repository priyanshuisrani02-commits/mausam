"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getHeroSlides,
  deleteHeroSlide,
  type HeroSlide,
} from "@/lib/admin-hero";

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSlides() {
    try {
      setLoading(true);
      const data = await getHeroSlides();
      setSlides(data);
    } catch (error) {
      console.error("Failed to load hero slides:", error);
      alert("Failed to load hero slides.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this hero slide? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteHeroSlide(id);
      await loadSlides();
    } catch (error: any) {
      console.error("Failed to delete hero slide:", error);
      alert(error?.message || "Failed to delete hero slide.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
            Homepage Management
          </p>
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            Hero Slider
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Add, edit, reorder, activate, or remove the images displayed in the homepage hero slider.
          </p>
        </div>

        <Link
          href="/admin/homepage/new-slide"
          className="w-fit rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-stone-800"
        >
          + Add Hero Slide
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
              Your Hero Slides
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Slides are shown in ascending sort order.
            </p>
          </div>

          {!loading && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
              {slides.length} {slides.length === 1 ? "slide" : "slides"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-10 text-center text-stone-500">
            Loading hero slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
            <h3 className="text-xl font-semibold text-stone-900">
              No hero slides yet
            </h3>
            <p className="mt-2 text-stone-500">
              Add your first homepage hero image to get started.
            </p>
            <Link
              href="/admin/homepage/new-slide"
              className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-stone-800"
            >
              Add Hero Slide
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="grid lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="grid gap-5 p-4 sm:grid-cols-[240px_minmax(0,1fr)] sm:p-5">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-stone-100">
                      <img
                        src={slide.image_url}
                        alt={`Hero slide ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                          Slide {index + 1}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                          Order {slide.sort_order}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            slide.active
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {slide.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                        Destination
                      </p>
                      <p className="mt-1 break-all text-sm text-stone-700">
                        {slide.link || "No destination link"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50 p-4 sm:flex-row lg:border-l lg:border-t-0 lg:flex-col lg:justify-center lg:p-5">
                    <Link
                      href={`/admin/homepage/hero-slider/edit/${slide.id}`}
                      className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-center font-medium text-stone-800 transition hover:bg-stone-100"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id)}
                      disabled={deletingId === slide.id}
                      className="rounded-lg border border-red-200 bg-white px-5 py-2.5 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === slide.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
