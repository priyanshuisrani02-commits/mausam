"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  getWishlist,
  removeFromWishlist,
  type WishlistProduct,
} from "@/lib/wishlist";


export default function WishlistPage() {
  const [items, setItems] = useState<
    WishlistProduct[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
  const data = await getWishlist();

setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(
    productId: string
  ) {
    await removeFromWishlist(productId);

    setItems((prev) =>
      prev.filter(
        (item) => item.product_id !== productId
      )
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white px-6 py-12 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <h1 className="mb-12 text-5xl font-light">
            My Wishlist
          </h1>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <div className="py-24 text-center">

              <div className="text-6xl">
                ♡
              </div>

              <h2 className="mt-6 text-3xl font-light">
                Your wishlist is empty
              </h2>

              <Link
                href="/"
                className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
              >
                Continue Shopping
              </Link>

            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

              {items.map((item) => {
               const product = item.products;

if (!product) return null;
                return (
                  <div
                    key={item.product_id}
                    className="group"
                  >
                    <Link
                      href={`/products/${product.id}`}
                    >
                      <div className="relative overflow-hidden rounded-3xl bg-gray-100">

                       <img
  src={product.image}
  alt={product.name}
  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
/>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemove(
                              item.product_id
                            );
                          }}
                          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                        >
                          ♥
                        </button>

                      </div>

                      <h2 className="mt-5 text-xl font-medium">
                        {product.name}
                      </h2>

                      <p className="mt-2 text-gray-500">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </Link>
                  </div>
                );
              })}

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}