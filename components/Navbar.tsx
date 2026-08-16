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
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const router = useRouter();

  const { cart } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const cartCount = cart.reduce(
    (total: number, item: { quantity: number }) => total + item.quantity,
    0
  );

  const wishlistCount = wishlist.length;

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-8">
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="mb-4 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="shrink-0 text-3xl font-light uppercase tracking-[8px] text-black lg:text-5xl lg:tracking-[18px]"
            >
              MAUSAM
            </Link>

            <form onSubmit={handleSearch} className="w-full max-w-md">
              <input
                type="search"
                placeholder="Search for products..."
                aria-label="Search for products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-full border px-4 py-2 text-black outline-none transition focus:border-black"
              />
            </form>

            <div className="flex shrink-0 items-center gap-6">
              <AccountMenu />

              <Link href="/wishlist" className="whitespace-nowrap hover:underline">
                ❤️ Wishlist ({wishlistCount})
              </Link>

              <Link href="/cart" className="whitespace-nowrap hover:underline">
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <Link
              href="/"
              className="min-w-0 shrink text-xl font-light uppercase tracking-[4px] text-black sm:text-2xl sm:tracking-[6px]"
            >
              MAUSAM
            </Link>

            <div className="flex shrink-0 items-center gap-2 text-xs sm:gap-3 sm:text-sm">
              <div className="max-w-[84px] truncate sm:max-w-[120px]">
                <AccountMenu />
              </div>

              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-full px-1"
              >
                <span aria-hidden="true">♡</span>
                <span className="ml-0.5">{wishlistCount}</span>
              </Link>

              <Link
                href="/cart"
                aria-label={`Shopping cart, ${cartCount} items`}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-full px-1"
              >
                <span aria-hidden="true">🛒</span>
                <span className="ml-0.5">{cartCount}</span>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-3 sm:mt-4">
            <input
              type="search"
              placeholder="Search for products..."
              aria-label="Search for products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-full border px-4 text-sm text-black outline-none transition focus:border-black sm:h-11"
            />
          </form>
        </div>
      </div>

      <nav
        aria-label="Product categories"
        className="flex gap-5 overflow-x-auto border-t px-3 py-2.5 text-sm text-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 sm:px-4 sm:py-3 md:justify-center md:overflow-visible"
      >
        <Link href="/" className="shrink-0 py-1">
          Home
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="shrink-0 py-1"
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
