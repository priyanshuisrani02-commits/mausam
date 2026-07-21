"use client";

import AccountMenu from "@/components/AccountMenu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import {
  getCategories,
  type AdminCategory,
} from "@/lib/admin-categories";

export default function Navbar() {
  const [query, setQuery] = useState("");

  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

  const router = useRouter();

  const { cart } = useCart();

  const { wishlist } = useWishlist();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCategories();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (query.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(query)}`
      );
    }
  }

  const cartCount = cart.reduce(
    (total: number, item: any) =>
      total + item.quantity,
    0
  );

  const wishlistCount = wishlist.length;

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">

        {/* Desktop */}

        <div className="hidden md:block">

          <div className="mb-4 flex items-center justify-between">

            <Link
              href="/"
              className="text-3xl font-light tracking-[8px] uppercase text-black md:text-5xl md:tracking-[18px]"
            >
              MAUSAM
            </Link>

            <form
              onSubmit={handleSearch}
              className="w-auto"
            >
              <input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                className="w-80 rounded-full border px-4 py-2 text-black outline-none lg:w-96"
              />
            </form>

            <div className="flex items-center gap-6">

              <AccountMenu />

              <Link
                href="/wishlist"
                className="hover:underline"
              >
                ❤️ Wishlist ({wishlistCount})
              </Link>

              <Link
                href="/cart"
                className="hover:underline"
              >
                Cart ({cartCount})
              </Link>

            </div>

          </div>

        </div>

        {/* Mobile */}

        <div className="md:hidden">

          <div className="flex items-center justify-between">

            <Link
              href="/"
              className="text-2xl font-light tracking-[6px] uppercase text-black"
            >
              MAUSAM
            </Link>

            <div className="flex items-center gap-4">

              <Link
                href="/wishlist"
              >
                ❤️ {wishlistCount}
              </Link>

              <Link
                href="/cart"
              >
                🛒 {cartCount}
              </Link>

            </div>

          </div>

          <form
            onSubmit={handleSearch}
            className="mt-4"
          >

            <input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="w-full rounded-full border px-4 py-2 text-black outline-none"
            />

          </form>

        </div>

      </div>

      <nav className="flex gap-6 overflow-x-auto whitespace-nowrap border-t px-4 py-3 text-black md:justify-center md:overflow-visible">

        <Link href="/">
          Home
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
          >
            {category.name}
          </Link>
        ))}

      </nav>

    </header>
  );
}