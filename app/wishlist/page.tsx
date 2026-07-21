"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "@/lib/wishlist";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  function handleRemove(slug: string) {
    removeFromWishlist(slug);
    setItems(getWishlist());
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-10 text-4xl font-light md:text-5xl">
          My Wishlist
        </h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500">
              Your wishlist is empty.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.slug}>
                <div className="group relative overflow-hidden rounded-3xl">
                  <Link href={`/products/${item.slug}`}>
                    <img
                      src={
                        item.image ||
                        "/images/products/product1.png"
                      }
                      alt={item.name}
                      className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[450px]"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(item.slug)
                    }
                    aria-label="Remove from wishlist"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg"
                  >
                    ♥
                  </button>
                </div>

                <Link href={`/products/${item.slug}`}>
                  <h2 className="mt-5 text-lg font-medium md:text-xl">
                    {item.name}
                  </h2>
                </Link>

                <p className="mt-2 text-gray-500">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}