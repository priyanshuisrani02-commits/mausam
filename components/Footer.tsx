"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white sm:mt-20 md:mt-24">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 md:px-8 md:py-24">
        {/* Brand */}
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-3xl font-light tracking-[7px] text-black sm:text-5xl sm:tracking-[10px] md:text-5xl md:tracking-[14px]">
            MAUSAM
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-500 sm:mt-5">
            Timeless elegance.
            <br className="sm:hidden" /> {" "}
            Crafted for every season.
          </p>
        </div>

        {/* Links */}
        <div className="grid gap-10 border-y py-10 sm:gap-12 sm:py-12 md:grid-cols-3 md:gap-16">
          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-black sm:mb-5 sm:text-base">
              SHOP
            </h3>

            <ul className="space-y-3 text-sm text-gray-600 sm:text-base">
              <li><Link href="/" className="transition hover:text-black">New Arrivals</Link></li>
              <li><Link href="/categories/kurtis" className="transition hover:text-black">Kurtis</Link></li>
              <li><Link href="/categories/co-ords" className="transition hover:text-black">Co-ords</Link></li>
              <li><Link href="/categories/dresses" className="transition hover:text-black">Dresses</Link></li>
              <li><Link href="/categories/tops" className="transition hover:text-black">Tops</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-black sm:mb-5 sm:text-base">
              CUSTOMER CARE
            </h3>

            <ul className="space-y-3 text-sm text-gray-600 sm:text-base">
              <li><Link href="/shipping-policy" className="transition hover:text-black">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="transition hover:text-black">Return Policy</Link></li>
              <li><Link href="/privacy-policy" className="transition hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-black">Terms &amp; Conditions</Link></li>
              <li><Link href="/contact" className="transition hover:text-black">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-black sm:mb-5 sm:text-base">
              CONTACT
            </h3>

            <div className="space-y-4 break-words text-sm text-gray-600 sm:text-base">
              <a href="mailto:mausamfes@gmail.com" className="block transition hover:text-black">
                📧 mausamfes@gmail.com
              </a>

              <a
                href="https://wa.me/919913558866"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-black"
              >
                📱 WhatsApp
              </a>

              <a href="#" className="block transition hover:text-black">
                📷 Mausam Designer&apos;s
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-7 text-center text-xs text-gray-500 sm:pt-8 sm:text-sm">
          © MAUSAM. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
