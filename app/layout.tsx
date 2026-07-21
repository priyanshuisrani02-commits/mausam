import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";

import WhatsAppButton from "@/components/WhatsAppButton";
// import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MAUSAM",
    template: "%s | MAUSAM",
  },

  description:
    "Discover timeless women's fashion with MAUSAM. Elegant kurtis, co-ords, dresses, and everyday essentials crafted for every season.",

  keywords: [
    "MAUSAM",
    "Women's Fashion",
    "Kurtis",
    "Co-ords",
    "Dresses",
    "Indian Fashion",
    "Ethnic Wear",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <AuthProvider>

          <WishlistProvider>

            <CartProvider>

              {/* <CartDrawer /> */}

              {children}

              <WhatsAppButton />

            </CartProvider>

          </WishlistProvider>

        </AuthProvider>

      </body>
    </html>
  );
}