"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

        {/* Brand */}
        <div className="mb-14 text-center">
          <h2 className="text-5xl md:text-6xlfont-light tracking-[10px] text-black md:text-5xl md:tracking-[14px]">
            MAUSAM
          </h2>

          <p className="mt-5 text-gray-500">
            Timeless elegance.
            <br className="md:hidden" />
            {" "}Crafted for every season.
          </p>
        </div>

        {/* Links */}
        <div className="grid gap-16 border-y py-12 md:grid-cols-3">

          {/* Shop */}
          <div>
            <h3 className="mb-5 text-base font-semibold tracking-wide tracking-wide text-black">
              SHOP
            </h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-black"
                >
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/kurtis"
                  className="transition hover:text-black"
                >
                  Kurtis
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/co-ords"
                  className="transition hover:text-black"
                >
                  Co-ords
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/dresses"
                  className="transition hover:text-black"
                >
                  Dresses
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/tops"
                  className="transition hover:text-black"
                >
                  Tops
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-5 text-lg font-medium tracking-wide text-black">
              CUSTOMER CARE
            </h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <Link
                  href="/shipping-policy"
                  className="transition hover:text-black"
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/return-policy"
                  className="transition hover:text-black"
                >
                  Return Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="transition hover:text-black"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="transition hover:text-black"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-black"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-medium tracking-wide text-black">
              CONTACT
            </h3>

            <div className="space-y-4 text-gray-600">

              <a
                href="mailto:mausamfes@gmail.com"
                className="block transition hover:text-black"
              >
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

              <a
                href="#"
                className="block transition hover:text-black"
              >
                📷 Mausam Designer's
              </a>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 text-center text-sm text-gray-500">
          © MAUSAM. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
} 