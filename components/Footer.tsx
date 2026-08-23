"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories, type AdminCategory } from "@/lib/admin-categories";

export default function Footer() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <footer className="mt-0 border-t border-[#ded6ca] bg-[#eee8dd]">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
          <div>
            <h2 className="mausam-serif text-4xl tracking-[8px] text-[#3c3a30] sm:text-5xl">MAUSAM</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#716a60]">
              A wardrobe inspired by the changing sky, earth and seasons. Thoughtful silhouettes, considered colours and quiet luxury for every story.
            </p>
            <p className="mt-6 text-[10px] font-medium uppercase tracking-[3px] text-[#697354]">Every season. A new mood.</p>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#49453d]">Shop</h3>
            <ul className="space-y-3 text-sm text-[#6f685e]">
              <li><Link href="/" className="transition hover:text-[#697354]">New Arrivals</Link></li>
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link href={`/categories/${category.slug}`} className="transition hover:text-[#697354]">{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#49453d]">Customer care</h3>
            <ul className="space-y-3 text-sm text-[#6f685e]">
              <li><Link href="/shipping-policy" className="transition hover:text-[#697354]">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="transition hover:text-[#697354]">Return Policy</Link></li>
              <li><Link href="/privacy-policy" className="transition hover:text-[#697354]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-[#697354]">Terms &amp; Conditions</Link></li>
              <li><Link href="/contact" className="transition hover:text-[#697354]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#49453d]">Contact</h3>
            <div className="space-y-4 break-words text-sm text-[#6f685e]">
              <a href="mailto:mausamfes@gmail.com" className="block transition hover:text-[#697354]">mausamfes@gmail.com</a>
              <a href="https://wa.me/919913558866" target="_blank" rel="noopener noreferrer" className="block transition hover:text-[#697354]">WhatsApp</a>
              <a href="#" className="block transition hover:text-[#697354]">Mausam Designer&apos;s</a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#d9d0c3] pt-7 text-center text-xs text-[#827a6e] sm:mt-14">
          © MAUSAM. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
