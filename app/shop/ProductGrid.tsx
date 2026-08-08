"use client";

import ProductCard from "@/components/ProductCard";

import {
  type StoreProduct,
} from "@/lib/store-products";

type Props = {
  products: StoreProduct[];
};

export default function ProductGrid({
  products,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-[32px] bg-white p-20 text-center shadow-sm">

        <h2 className="text-3xl font-light">
          No Products Found
        </h2>

        <p className="mt-3 text-gray-500">
          Try changing your filters.
        </p>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

      {products.map((product) => (
          <ProductCard
         key={product.id}
         id={product.id}
         slug={product.slug}
          image={product.image}
          name={product.name}
          price={product.price}
        />
      ))}

    </div>
  );
}