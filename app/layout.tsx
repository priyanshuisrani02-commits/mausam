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
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://mausamdesigner.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MAUSAM | Seasonal Indian Fashion",
    template: "%s | MAUSAM",
  },
  description:
    "MAUSAM — thoughtfully designed women's fashion inspired by the colours, moods and stories of every season.",
  keywords: [
    "MAUSAM",
    "women's fashion",
    "Kurtis",
    "Salwar Set Suits",
    "Dresses",
    "Indian fashion",
    "ethnic wear",
    "seasonal fashion",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MAUSAM",
    title: "MAUSAM | Seasonal Indian Fashion",
    description:
      "Indian fashion shaped by the colours, moods and stories of every season.",
    images: [
      {
        url: "/images/hero1.png",
        width: 1920,
        height: 1080,
        alt: "MAUSAM seasonal fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAUSAM | Seasonal Indian Fashion",
    description:
      "Indian fashion shaped by the colours, moods and stories of every season.",
    images: ["/images/hero1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
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
