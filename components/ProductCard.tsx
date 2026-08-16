"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { addToCart } from "@/lib/cart";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  slug: string;
  newArrival?: boolean;
  availableSizes?: string[] | null;
}

export default function ProductCard({
  id,
  name,
  price,
  salePrice = null,
  image,
  newArrival = false,
  availableSizes = null,
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { loading, isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(id);
  const displayPrice = salePrice ?? price;

  async function handleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await toggle(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to update wishlist.");
    }
  }

  async function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    const selectedSize = availableSizes?.[0] ?? "One Size";

    try {
      await addToCart(id, 1, selectedSize);
      alert(
        availableSizes && availableSizes.length > 1
          ? `Added to cart in ${selectedSize}. You can change the size from the product page.`
          : "Added to cart."
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to add to cart.");
    }
  }

  return (
    <Link href={`/products/${id}`} className="block">
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <img
            src={image || "/images/products/product1.png"}
            alt={name}
            loading="lazy"
            className="aspect-[4/5] h-auto w-full object-cover transition duration-500 md:aspect-auto md:h-[450px] md:group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/0 transition duration-500 md:group-hover:bg-black/20" />

          {newArrival && (
            <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-medium tracking-[2px] sm:left-4 sm:top-4 sm:px-4 sm:text-sm">
              NEW
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg transition duration-300 sm:right-4 sm:top-4 ${
              wishlisted ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-4 py-2.5 text-xs font-medium text-black shadow-md transition-all duration-300 sm:bottom-6 sm:px-6 sm:py-3 sm:text-sm md:translate-y-6 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            Add to Cart
          </button>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-medium sm:mt-5 sm:text-xl">
          {name}
        </h3>

        <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">
          <span className={salePrice != null ? "font-medium text-black" : ""}>
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {salePrice != null && (
            <span className="ml-2 text-xs text-gray-400 line-through sm:text-sm">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
