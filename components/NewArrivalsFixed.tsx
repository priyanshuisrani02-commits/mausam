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
    <section className="bg-white py-12 sm:py-16 md:py-24">
      <h2 className="mb-8 px-4 text-center text-2xl font-light tracking-[2px] sm:mb-12 sm:text-3xl md:mb-16 md:text-5xl">
        NEW ARRIVALS
      </h2>

      <div className="mx-auto hidden max-w-7xl grid-cols-4 gap-6 px-6 md:grid md:gap-8 md:px-8">
        {products.length === 0 ? (
          <p className="col-span-4 py-10 text-center text-gray-500">
            No new arrivals found.
          </p>
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

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {products.length === 0 ? (
          <p className="w-full py-10 text-center text-gray-500">
            No new arrivals found.
          </p>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="w-[84vw] max-w-[360px] shrink-0 snap-center"
            >
              <div className="overflow-hidden rounded-2xl bg-white">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image || "/images/products/product1.png"}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-[2px] text-white sm:text-xs">
                    NEW
                  </span>
                </div>

                <div className="px-1 pt-3 pb-2 sm:pt-4">
                  <h3 className="line-clamp-2 text-base font-light text-black sm:text-lg">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-700 sm:mt-2 sm:text-base">
                    ₹{(product.sale_price ?? product.price).toLocaleString("en-IN")}
                    {product.sale_price != null && (
                      <span className="ml-2 text-xs text-gray-400 line-through sm:text-sm">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    )}
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
