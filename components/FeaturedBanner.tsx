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
      try {
        const data = await getActiveBanner();
        setBanner(data);
      } catch (error) {
        console.error("Featured banner fetch failed:", error);
      }
    }

    loadBanner();
  }, []);

  if (!banner) return null;

  return (
    <section className="mx-auto my-10 max-w-7xl px-3 sm:my-14 sm:px-4 md:my-24 md:px-8">
      <div className="relative h-[400px] overflow-hidden rounded-2xl sm:h-[460px] sm:rounded-3xl md:h-[500px]">
        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition duration-700 hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white sm:px-8 md:px-10">
          {banner.subtitle && (
            <p className="text-[10px] uppercase tracking-[3px] sm:text-xs sm:tracking-[4px] md:text-sm md:tracking-[8px]">
              {banner.subtitle}
            </p>
          )}

          <h2 className="mt-2 max-w-[18rem] text-3xl font-extralight leading-[1.1] sm:max-w-xl sm:text-4xl md:mt-4 md:text-6xl">
            {banner.title}
          </h2>

          <p className="mt-4 max-w-[18rem] text-xs leading-5 sm:mt-5 sm:max-w-md sm:text-sm sm:leading-6 md:mt-8 md:max-w-xl md:text-lg">
            {banner.description}
          </p>

          <Link
            href={banner.button_link || "/"}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white px-6 py-2.5 text-xs transition hover:bg-white hover:text-black sm:mt-6 sm:px-8 sm:text-sm md:mt-10 md:px-10 md:py-4 md:text-base"
          >
            {banner.button_text}
          </Link>
        </div>
      </div>
    </section>
  );
}
