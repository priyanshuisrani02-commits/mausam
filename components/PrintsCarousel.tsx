"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getHomepagePrints, type HomepagePrint } from "@/lib/homepage-prints";

export default function PrintsCarousel() {
  const [items, setItems] = useState<HomepagePrint[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHomepagePrints()
      .then(setItems)
      .catch((error) => console.error("Prints carousel fetch failed:", error))
      .finally(() => setLoading(false));
  }, []);

  function scrollByAmount(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (loading || items.length === 0) return null;

  return (
    <section className="bg-[#fffdf8] px-4 py-9 sm:px-6 sm:py-12 md:px-10 md:py-16" aria-label="MAUSAM prints and craft">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex items-end justify-between gap-5 sm:mb-8">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[2.8px] text-[#8a5b25] sm:text-[10px] sm:tracking-[3.5px]">Threads of MAUSAM</p>
            <h2 className="mausam-serif text-[29px] leading-none text-[#39362f] sm:text-4xl md:text-5xl">Prints, patterns &amp; craft</h2>
            <p className="mt-2.5 max-w-xl text-xs leading-5 text-[#746e63] sm:text-sm sm:leading-6">A closer look at the colours, textures and details that shape each seasonal story.</p>
          </div>

          {items.length > 3 && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button type="button" onClick={() => scrollByAmount(-330)} aria-label="Previous prints" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cdbb] bg-[#fffaf1] text-lg text-[#5b6046] transition hover:bg-[#eee7d8]">←</button>
              <button type="button" onClick={() => scrollByAmount(330)} aria-label="Next prints" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cdbb] bg-[#fffaf1] text-lg text-[#5b6046] transition hover:bg-[#eee7d8]">→</button>
            </div>
          )}
        </div>

        <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 scrollbar-none sm:gap-7" style={{ scrollbarWidth: "none" }}>
          {items.map((item) => {
            const content = (
              <div className="group flex w-[132px] shrink-0 snap-start flex-col items-center text-center sm:w-[154px] md:w-[174px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-full border-[6px] border-[#f4eee3] bg-[#eee7da] shadow-[0_8px_24px_rgba(73,62,44,0.10)] ring-1 ring-[#dfd4c3] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_14px_32px_rgba(73,62,44,0.15)]">
                  <Image src={item.image_url} alt={item.title} fill sizes="174px" unoptimized className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                </div>
                <h3 className="mausam-serif mt-3 text-[17px] leading-tight text-[#403b33] sm:text-lg">{item.title}</h3>
                {item.description && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#81796d] sm:text-[11px]">{item.description}</p>}
              </div>
            );

            return item.link ? <Link key={item.id} href={item.link} aria-label={item.title}>{content}</Link> : <div key={item.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
