"use client";

import { useEffect, useState } from "react";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const data = await getStoreProducts();
      setProducts(data);
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">

      <section className="mx-auto max-w-7xl px-8 py-20">

        <h1 className="mb-12 text-center text-5xl font-light">
          SHOP
        </h1>

        {products.length === 0 ? (

          <p className="text-center text-gray-500">
            No products found.
          </p>

        ) : (

          <div className="grid grid-cols-4 gap-8">

            {products.map((product) => (

              <ProductCard
                key={product.id}
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