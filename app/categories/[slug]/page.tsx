"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";

type Category = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);

      const { data: categoryData, error } = await supabase
        .from("categories")
        .select("id,name,image_url")
        .eq("slug", slug)
        .single();

      if (error || !categoryData) {
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      try {
        const allProducts = await getStoreProducts();
        setProducts(allProducts.filter((product) => product.category_id === categoryData.id));
      } catch (productError) {
        console.error("Unable to load category products:", productError);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ee] text-[#5f5a51]">
        <p className="mausam-serif text-2xl">Preparing your seasonal edit…</p>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ee] px-4 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-[3px] text-[#7b756b]">MAUSAM</p>
          <h1 className="mausam-serif mt-3 text-4xl text-[#39362f]">Collection not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ee]">
      <Navbar />

      <section className="px-3 pb-10 pt-4 sm:px-5 sm:pb-14 md:px-10 md:pt-6">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-[#e1d8ca] bg-[#e9e1d5] shadow-[0_12px_38px_rgba(70,61,45,0.08)] md:rounded-[34px]">
          <div className="grid min-h-[300px] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex items-center px-7 py-12 sm:px-12 md:px-16 lg:px-20">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#697354]">The collection</p>
                <h1 className="mausam-serif mt-3 text-4xl leading-tight text-[#39362f] sm:text-5xl md:text-6xl">{category.name}</h1>
                <div className="mt-5 h-px w-14 bg-[#9da58c]" />
                <p className="mt-5 max-w-xl text-sm leading-7 text-[#6f685e] sm:text-base">
                  Thoughtfully chosen silhouettes, textures and colours for every season and every story.
                </p>
                <p className="mt-5 text-[10px] font-medium uppercase tracking-[2px] text-[#8b8377]">
                  {products.length} {products.length === 1 ? "piece" : "pieces"} in this edit
                </p>
              </div>
            </div>

            <div className="relative min-h-[280px] bg-[#ddd3c5] md:min-h-[360px]">
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-8 text-center text-[10px] uppercase tracking-[2px] text-[#8a8378]">Collection image unavailable</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e9e1d5]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-7 flex items-center justify-between border-b border-[#e5ddd0] pb-4">
            <p className="text-[10px] font-medium uppercase tracking-[2.5px] text-[#6f695f]">Shop the edit</p>
            <span className="text-xs text-[#8a8378]">{products.length} products</span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[24px] border border-[#e3dbcf] bg-[#fffdf8] px-6 py-16 text-center shadow-sm">
              <h2 className="mausam-serif text-3xl text-[#4a463e]">A new season is coming.</h2>
              <p className="mt-3 text-sm text-[#7c756a]">There are no pieces in this collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.sale_price}
                  image={product.image}
                  slug={product.slug}
                  newArrival={product.new_arrival}
                  availableSizes={product.available_sizes}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
