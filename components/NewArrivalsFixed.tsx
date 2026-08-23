"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";

export default function NewArrivalsFixed() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getStoreProducts();
        setProducts(data.filter((product) => product.new_arrival));
      } catch (error) {
        console.error(error);
      }
    }
    loadProducts();
  }, []);

  return (
    <section className="bg-[#f8f5ee] px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-[#7a746a]">Freshly arrived</p>
            <h2 className="mausam-serif text-3xl text-[#39362f] sm:text-4xl md:text-5xl">New arrivals</h2>
          </div>
          <Link href="/" className="hidden text-[10px] font-medium uppercase tracking-[2px] text-[#697354] transition hover:text-[#a45b3f] sm:block">
            View all →
          </Link>
        </div>

        <div className="hidden grid-cols-4 gap-5 md:grid lg:gap-6">
          {products.length === 0 ? (
            <p className="col-span-4 rounded-2xl border border-[#e5ddd0] bg-[#fffdf8] py-12 text-center text-sm text-[#817a6f]">No new arrivals found.</p>
          ) : (
            products.slice(0, 4).map((product) => (
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
            ))
          )}
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
          {products.length === 0 ? (
            <p className="w-full rounded-2xl border border-[#e5ddd0] bg-[#fffdf8] py-12 text-center text-sm text-[#817a6f]">No new arrivals found.</p>
          ) : (
            products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="w-[82vw] max-w-[350px] shrink-0 snap-center">
                <div className="overflow-hidden rounded-[22px] border border-[#e3dbcf] bg-[#fffdf8] shadow-[0_7px_24px_rgba(70,61,45,0.06)]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#eee8dd]">
                    {product.image ? (
                      <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-6 text-center text-[10px] uppercase tracking-[2px] text-[#8a8378]">Image unavailable</div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-[#697354] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[2px] text-white">New</span>
                  </div>
                  <div className="px-5 py-4">
                    <h3 className="line-clamp-2 text-base font-medium text-[#3d3932]">{product.name}</h3>
                    <p className="mt-1.5 text-sm text-[#625c53]">
                      ₹{(product.sale_price ?? product.price).toLocaleString("en-IN")}
                      {product.sale_price != null && <span className="ml-2 text-xs text-[#9a9287] line-through">₹{product.price.toLocaleString("en-IN")}</span>}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
