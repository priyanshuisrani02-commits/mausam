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
    <section className="bg-[#f3ede2] px-3 py-10 sm:px-5 sm:py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-[#e3d9ca] bg-[#e8ddcf] shadow-[0_14px_42px_rgba(73,62,44,0.09)] md:rounded-[34px]">
        <div className="grid min-h-[460px] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[300px] overflow-hidden md:min-h-[520px]">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition duration-700 hover:scale-[1.02]"
            />
          </div>

          <div className="flex items-center bg-[#fffaf1] px-7 py-12 sm:px-12 sm:py-14 md:px-14 lg:px-20">
            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-3 text-[#697354]">
                <span className="h-px w-10 bg-[#9da58c]" />
                <span className="text-[9px] font-medium uppercase tracking-[3px]">MAUSAM seasonal story</span>
              </div>

              {banner.subtitle && (
                <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#8b7564] sm:text-xs sm:tracking-[4px]">
                  {banner.subtitle}
                </p>
              )}

              <h2 className="mausam-serif mt-3 text-4xl leading-[1.05] text-[#39362f] sm:text-5xl lg:text-6xl">
                {banner.title}
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#6d675d] sm:text-base sm:leading-8">
                {banner.description}
              </p>

              <Link
                href={banner.button_link || "/"}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#596246] px-7 py-3 text-[10px] font-medium uppercase tracking-[2.5px] text-white shadow-[0_7px_18px_rgba(79,88,62,0.18)] transition hover:bg-[#465034] sm:px-9"
              >
                {banner.button_text}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
