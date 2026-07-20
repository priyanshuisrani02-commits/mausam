"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getActiveBanner,
  deleteBanner,
} from "@/lib/banner-service";

type FeaturedBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  button_text: string;
  button_link: string | null;
  image_url: string;
  active: boolean;
  created_at?: string;
};

export default function FeaturedBannerPage() {
  const [banner, setBanner] = useState<FeaturedBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function loadBanner() {
    try {
      setLoading(true);
      const data = await getActiveBanner();
      setBanner(data as FeaturedBanner | null);
    } catch (err) {
      console.error(err);
      alert("Failed to load banner.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanner();
  }, []);

  async function handleDelete() {
    if (!banner) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteBanner(banner.id);
      setBanner(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete banner.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">
            Featured Banner
          </h1>

          <p className="mt-2 text-stone-600">
            Manage the homepage featured banner.
          </p>
        </div>

        <Link
          href="/admin/homepage/featured-banner/edit"
          className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-stone-800"
        >
          + Add Banner
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
          Loading...
        </div>
      ) : !banner ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-stone-900">
            No featured banner yet.
          </h2>

          <p className="mt-3 text-stone-500">
            Create one to display on the homepage.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="relative h-64 w-full bg-stone-100">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="space-y-5 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-900">
                {banner.title}
              </h2>

              <span
                className={`rounded-full px-4 py-1 text-sm font-medium ${
                  banner.active
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {banner.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-stone-900">
                Description
              </h3>

              <p className="mt-2 text-stone-600">
                {banner.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-stone-900">
                Button Text
              </h3>

              <p className="mt-2 text-stone-600">
                {banner.button_text || "-"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-stone-900">
                Button Link
              </h3>

              <p className="mt-2 break-all text-stone-600">
                {banner.button_link || "-"}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/admin/homepage/featured-banner/edit"
                className="rounded-lg border border-stone-300 px-5 py-3 font-medium hover:bg-stone-100"
              >
                Edit
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}