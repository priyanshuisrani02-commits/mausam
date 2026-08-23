"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import PrintsCarousel from "@/components/PrintsCarousel";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedBanner from "@/components/FeaturedBanner";
import NewArrivals from "@/components/NewArrivalsFixed";
import Footer from "@/components/Footer";
import { getHomepageBenefits, type HomepageBenefit } from "@/lib/homepage-benefits";

export default function Home() {
  const [benefits, setBenefits] = useState<HomepageBenefit[]>([]);

  useEffect(() => {
    getHomepageBenefits().then(setBenefits).catch((error) => console.error("Homepage benefits fetch failed:", error));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#302d27]">
      <Navbar />
      <HeroCarousel />
      <PrintsCarousel />
      <CollectionGrid />
      <FeaturedBanner />
      <NewArrivals />

      {benefits.length > 0 && (
        <section className="border-y border-[#e5ddd0] bg-[#fffdf8] px-4 py-8 sm:px-6 md:px-10">
          <div className="mx-auto grid max-w-[1200px] gap-6 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {benefits.map((benefit, index) => (
              <div key={benefit.id} className={`px-5 ${index > 1 ? "lg:border-l lg:border-[#e5ddd0]" : ""}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#4f583e]">{benefit.title}</p>
                <p className="mt-1.5 text-xs text-[#817a70]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
