import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import PrintsCarousel from "@/components/PrintsCarousel";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedBanner from "@/components/FeaturedBanner";
import NewArrivals from "@/components/NewArrivalsFixed";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#302d27]">
      <Navbar />
      <HeroCarousel />
      <PrintsCarousel />
      <CollectionGrid />
      <FeaturedBanner />
      <NewArrivals />

      <section className="border-y border-[#e5ddd0] bg-[#fffdf8] px-4 py-8 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-[1200px] gap-6 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {[
            ["Free shipping", "On orders above ₹1999"],
            ["Easy returns", "Simple, stress-free returns"],
            ["Secure payments", "Protected checkout"],
            ["Quality promise", "Thoughtful fabrics & finish"],
          ].map(([title, description], index) => (
            <div key={title} className={`px-5 ${index > 1 ? "lg:border-l lg:border-[#e5ddd0]" : ""}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#4f583e]">{title}</p>
              <p className="mt-1.5 text-xs text-[#817a70]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
