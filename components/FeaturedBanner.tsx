"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveBanner } from "@/lib/banner-service";

type Banner = { title: string; subtitle: string | null; description: string; button_text: string; button_link: string | null; image_url: string };

export default function FeaturedBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    getActiveBanner().then(setBanner).catch((error) => console.error("Featured banner fetch failed:", error));
  }, []);

  if (!banner) return null;

  return (
    <section className="bg-[#f3ede2] px-3 py-9 sm:px-5 sm:py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[22px] border border-[#e3d9ca] bg-[#e8ddcf] shadow-[0_12px_35px_rgba(73,62,44,0.08)] sm:rounded-[28px] md:rounded-[34px]">
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-[4/3.15] overflow-hidden sm:aspect-[4/3] md:aspect-auto md:min-h-[520px]">
            <Image src={banner.image_url} alt={banner.title} fill unoptimized sizes="(max-width: 768px) 100vw, 55vw" className="object-cover object-center transition duration-700 hover:scale-[1.02]" />
          </div>
          <div className="flex items-center bg-[#fffaf1] px-6 py-9 sm:px-10 sm:py-12 md:px-14 lg:px-20">
            <div className="max-w-xl">
              <div className="mb-4 flex items-center gap-2.5 text-[#697354] sm:mb-5 sm:gap-3"><span className="h-px w-7 bg-[#9da58c] sm:w-10" /><span className="text-[8px] font-medium uppercase tracking-[2px] sm:text-[9px] sm:tracking-[3px]">MAUSAM seasonal story</span></div>
              {banner.subtitle && <p className="text-[9px] font-medium uppercase tracking-[2.5px] text-[#8b7564] sm:text-xs sm:tracking-[4px]">{banner.subtitle}</p>}
              <h2 className="mausam-serif mt-2.5 text-[32px] leading-[1.05] text-[#39362f] sm:text-5xl lg:text-6xl">{banner.title}</h2>
              <p className="mt-4 text-[13px] leading-6 text-[#6d675d] sm:mt-5 sm:text-base sm:leading-8">{banner.description}</p>
              <Link href={banner.button_link || "/"} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-[#596246] px-6 py-2.5 text-[9px] font-medium uppercase tracking-[2px] text-white shadow-[0_7px_18px_rgba(79,88,62,0.18)] transition hover:bg-[#465034] sm:mt-7 sm:min-h-11 sm:px-9 sm:py-3 sm:text-[10px]">{banner.button_text}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
