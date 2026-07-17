"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveBanner } from "@/lib/banner-service";

type Banner = {
  title: string;
  subtitle: string | null;
  description: string;
  button_text: string;
  button_link: string | null;
  image_url: string;
};

export default function FeaturedBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    async function loadBanner() {
      const data = await getActiveBanner();
      setBanner(data);
    }

    loadBanner();
  }, []);

  if (!banner) return null;

  return (
    <section className="mx-auto my-12 max-w-7xl px-4 md:my-24 md:px-8">
      <div className="relative h-[340px] overflow-hidden rounded-3xl md:h-[500px]">

        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          unoptimized
          className="object-cover transition duration-700 hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white md:px-10">

          {banner.subtitle && (
            <p className="text-xs uppercase tracking-[4px] md:text-sm md:tracking-[8px]">
              {banner.subtitle}
            </p>
          )}

          <h2 className="mt-3 text-3xl font-extralight leading-tight md:mt-4 md:text-6xl">
            {banner.title}
          </h2>

          <p className="mt-5 max-w-xs text-sm leading-6 md:mt-8 md:max-w-xl md:text-lg">
            {banner.description}
          </p>

          <Link
            href={banner.button_link || "/"}
            className="mt-6 rounded-full border border-white px-6 py-3 text-sm transition hover:bg-white hover:text-black md:mt-10 md:px-10 md:py-4 md:text-base"
          >
            {banner.button_text}
          </Link>

        </div>

      </div>
    </section>
  );
}