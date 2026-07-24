"use client";

import { useEffect, useState } from "react";

import {
  getStoreProducts,
  type StoreProduct,
} from "@/lib/store-products";

import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] =
    useState<StoreProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data =
          await getStoreProducts();

        setProducts(data);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">

        <h1 className="mb-12 text-center text-4xl font-light md:text-5xl">
          SHOP
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                slug={product.id}
              />
            ))}

          </div>
        )}

      </section>

    </main>
  );
}