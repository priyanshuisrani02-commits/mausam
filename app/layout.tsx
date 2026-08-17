import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";

import WhatsAppButton from "@/components/WhatsAppButton";

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
    "MAUSAM — thoughtfully designed women's fashion inspired by the colours, moods and stories of every season.",
  keywords: [
    "MAUSAM",
    "Women's Fashion",
    "Kurtis",
    "Salwar Set Suits",
    "Dresses",
    "Indian Fashion",
    "Ethnic Wear",
    "Seasonal Fashion",
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
      <body className="min-h-full flex flex-col bg-[#f8f5ee] text-[#302d27]">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <WhatsAppButton />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
