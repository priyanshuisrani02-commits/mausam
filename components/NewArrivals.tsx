"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  getStoreProducts,
  type StoreProduct,
} from "@/lib/store-products";

export default function NewArrivals() {
  const [products, setProducts] = useState<
    StoreProduct[]
  >([]);

  useEffect(() => {
    async function loadProducts() {
      const data = await getStoreProducts();
      setProducts(data);
    }

    loadProducts();
  }, []);

  return (
    <section className="bg-white py-24">
      <h2 className="mb-16 text-center text-5xl font-light">
        NEW ARRIVALS
      </h2>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl grid-cols-4 gap-8 px-8 md:grid">
        {products.length === 0 ? (
          <p className="col-span-4 text-center text-gray-500">
            No new arrivals found.
          </p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              slug={product.slug}
            />
          ))
        )}
      </div>

      {/* Mobile Carousel */}
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 md:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {products.length === 0 ? (
          <p className="w-full py-10 text-center text-gray-500">
            No new arrivals found.
          </p>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="w-[84vw] shrink-0 snap-center"
            >
              <div className="overflow-hidden rounded-xl bg-white">
                <div className="relative">
                  <img
                    src={
                      product.image ||
                      "/images/products/product1.png"
                    }
                    alt={product.name}
                    className="h-[420px] w-full object-cover"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium tracking-widest text-white">
                    NEW
                  </span>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-light text-black">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-base text-gray-700">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}