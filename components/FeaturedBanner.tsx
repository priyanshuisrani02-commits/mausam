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
    <section className="bg-[#f3ede2] px-3 py-9 sm:px-5 sm:py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[22px] border border-[#e3d9ca] bg-[#e8ddcf] shadow-[0_12px_35px_rgba(73,62,44,0.08)] sm:rounded-[28px] md:rounded-[32px]">
        <div className="grid md:grid-cols-[1.02fr_0.98fr]">
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#eee5d7] px-4 py-4 sm:min-h-[380px] sm:px-6 md:min-h-[470px] md:px-8">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 52vw"
              className="object-cover object-center p-0 transition duration-700 hover:scale-[1.015] sm:p-0"
            />
          </div>
          <div className="flex items-center justify-center bg-[#fffaf1] px-6 py-10 text-center sm:px-10 sm:py-12 md:px-12 lg:px-16">
            <div className="mx-auto max-w-xl">
              <div className="mb-4 flex items-center justify-center gap-2.5 text-[#697354] sm:mb-5 sm:gap-3"><span className="h-px w-7 bg-[#9da58c] sm:w-10" /><span className="text-[8px] font-medium uppercase tracking-[2px] sm:text-[9px] sm:tracking-[3px]">MAUSAM seasonal story</span><span className="h-px w-7 bg-[#9da58c] sm:w-10" /></div>
              {banner.subtitle && <p className="text-[9px] font-medium uppercase tracking-[2.5px] text-[#8b7564] sm:text-xs sm:tracking-[4px]">{banner.subtitle}</p>}
              <h2 className="mausam-serif mt-2.5 text-[30px] leading-[1.05] text-[#39362f] sm:text-5xl lg:text-[54px]">{banner.title}</h2>
              <p className="mx-auto mt-4 max-w-lg text-[13px] leading-6 text-[#6d675d] sm:mt-5 sm:text-base sm:leading-7">{banner.description}</p>
              <Link href={banner.button_link || "/"} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-[#596246] px-6 py-2.5 text-[9px] font-medium uppercase tracking-[2px] text-white shadow-[0_7px_18px_rgba(79,88,62,0.18)] transition hover:bg-[#465034] sm:mt-7 sm:min-h-11 sm:px-9 sm:py-3 sm:text-[10px]">{banner.button_text}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
