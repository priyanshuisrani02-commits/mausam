"use client";

import AccountMenu from "@/components/AccountMenu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCategories, type AdminCategory } from "@/lib/admin-categories";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e0d4] bg-[#fffdf8]/95 shadow-[0_4px_24px_rgba(73,65,48,0.06)] backdrop-blur-md">
      <div className="bg-[#697354] px-3 py-1.5 text-center text-[8px] font-medium uppercase tracking-[2px] text-white sm:text-[10px] sm:tracking-[4px]">
        Inspired by every season · Made for every story
      </div>

      <div className="mx-auto max-w-[1440px] px-3 py-2.5 sm:px-6 sm:py-4 lg:px-10">
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
            <Link href="/" className="mausam-serif text-[31px] font-normal uppercase tracking-[10px] text-[#3c3a30] transition hover:text-[#697354] lg:text-[36px]">MAUSAM</Link>
            <nav className="flex items-center justify-center gap-7 text-[11px] font-medium uppercase tracking-[2.2px] text-[#504b42] lg:gap-9">
              <Link href="/">Home</Link>
              {categories.slice(0, 5).map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="whitespace-nowrap">{category.name}</Link>)}
            </nav>
            <div className="flex items-center justify-end gap-5 text-[#4f4a42]">
              <form onSubmit={handleSearch} className="hidden xl:block"><div className="flex items-center border-b border-[#bdb5a8] pb-1"><span className="mr-2 text-base">⌕</span><input type="search" placeholder="Search" aria-label="Search for products" value={query} onChange={(event) => setQuery(event.target.value)} className="w-24 bg-transparent text-xs outline-none placeholder:text-[#80796d]" /></div></form>
              <AccountMenu />
              <Link href="/wishlist" className="relative text-sm" aria-label={`Wishlist, ${wishlistCount} items`}>♡{wishlistCount > 0 && <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a45b3f] px-1 text-[8px] text-white">{wishlistCount}</span>}</Link>
              <Link href="/cart" className="relative text-sm uppercase tracking-[1px]" aria-label={`Shopping cart, ${cartCount} items`}>Bag{cartCount > 0 && <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#697354] px-1 text-[8px] text-white">{cartCount}</span>}</Link>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="mausam-serif shrink-0 text-[21px] uppercase tracking-[4px] text-[#3c3a30] sm:text-[25px] sm:tracking-[6px]">MAUSAM</Link>
            <div className="flex items-center gap-0.5 text-[#4f4a42]">
              <div className="max-w-[72px] truncate"><AccountMenu /></div>
              <Link href="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className="flex h-9 min-w-9 items-center justify-center text-base">♡<span className="ml-0.5 text-[9px]">{wishlistCount}</span></Link>
              <Link href="/cart" aria-label={`Shopping bag, ${cartCount} items`} className="flex h-9 min-w-9 items-center justify-center text-[9px] font-medium uppercase tracking-[.7px]">Bag<span className="ml-0.5">{cartCount}</span></Link>
            </div>
          </div>
          <form onSubmit={handleSearch} className="mt-2.5">
            <div className="flex items-center rounded-full border border-[#d9d1c4] bg-[#f8f5ee] px-3">
              <span className="mr-2 text-base text-[#6f6a61]">⌕</span>
              <input type="search" placeholder="Search your next favourite..." aria-label="Search for products" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full bg-transparent text-xs text-[#302d27] outline-none placeholder:text-[#8b8478]" />
            </div>
          </form>
        </div>
      </div>

      <nav aria-label="Product categories" className="flex gap-5 overflow-x-auto border-t border-[#eee8de] px-3 py-2 text-[9px] font-medium uppercase tracking-[1.4px] text-[#625d54] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="shrink-0 py-1">{category.name}</Link>)}
      </nav>
    </header>
  );
}
