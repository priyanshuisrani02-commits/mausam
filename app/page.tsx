import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedBanner from "@/components/FeaturedBanner";
import NewArrivals from "@/components/NewArrivalsFixed";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <Navbar />
      <HeroCarousel />
      <CollectionGrid />
      <FeaturedBanner />
      <NewArrivals />
      <Footer />
    </main>
  );
}
