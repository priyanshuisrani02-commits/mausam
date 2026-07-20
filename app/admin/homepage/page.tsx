"use client";

import Link from "next/link";

export default function HomepageAdminPage() {
  return (
    <>
      <h1 className="mb-10 text-5xl font-light text-black">
        Homepage
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <Link
          href="/admin/homepage/hero-slider"
          className="block rounded-[28px] bg-white p-8 shadow transition hover:shadow-lg"
        >
          <h2 className="text-3xl font-light">
            🖼 Hero Slider
          </h2>

          <p className="mt-3 text-gray-500">
            Manage hero slides.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="block rounded-[28px] bg-white p-8 shadow transition hover:shadow-lg"
        >
          <h2 className="text-3xl font-light">
            🏷️ Categories
          </h2>

          <p className="mt-3 text-gray-500">
            Manage homepage categories.
          </p>
        </Link>

        <Link
          href="/admin/homepage/featured-banner"
          className="block rounded-[28px] bg-white p-8 shadow transition hover:shadow-lg"
        >
          <h2 className="text-3xl font-light">
            ⭐ Featured Banner
          </h2>

          <p className="mt-3 text-gray-500">
            Manage featured banner.
          </p>
        </Link>

        <div className="rounded-[28px] bg-white p-8 shadow">
          <h2 className="text-3xl font-light">
            📢 Announcement Bar
          </h2>

          <p className="mt-3 text-gray-500">
            Manage announcement bar.
          </p>
        </div>
      </div>
    </>
  );
}