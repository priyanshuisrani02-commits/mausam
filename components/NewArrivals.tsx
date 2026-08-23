"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";

export default function NewArrivals() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    getStoreProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <section className="bg-[#fffdf8] px-0 py-12 sm:py-16 md:py-24">
      <div className="mb-8 px-4 sm:mb-12 md:mb-16">
        <p className="mb-2 text-center text-[9px] font-medium uppercase tracking-[2.5px] text-[#7b756b]">Fresh from the season</p>
        <h2 className="mausam-serif text-center text-[30px] font-normal text-[#39362f] sm:text-4xl md:text-5xl">New Arrivals</h2>
      </div>

      <div className="mx-auto hidden max-w-7xl grid-cols-4 gap-8 px-8 md:grid">
        {products.length === 0 ? <p className="col-span-4 text-center text-gray-500">No new arrivals found.</p> : products.map((product) => (
          <ProductCard key={product.id} id={product.id} name={product.name} price={product.price} image={product.image} slug={product.id} />
        ))}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {products.length === 0 ? <p className="w-full py-10 text-center text-gray-500">No new arrivals found.</p> : products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="w-[69vw] max-w-[285px] shrink-0 snap-start">
            <div className="overflow-hidden rounded-[18px] border border-[#e8e0d4] bg-white shadow-[0_5px_18px_rgba(70,61,45,0.05)]">
              <div className="relative aspect-[4/5] bg-[#eee8dd]">
                <img src={product.image || "/images/products/product1.png"} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#697354] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[1.5px] text-white">New</span>
              </div>
              <div className="px-3.5 py-3.5">
                <h3 className="mausam-serif truncate text-[17px] leading-tight text-[#39362f]">{product.name}</h3>
                <p className="mt-1.5 text-xs font-medium text-[#625d54]">₹{product.price.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
