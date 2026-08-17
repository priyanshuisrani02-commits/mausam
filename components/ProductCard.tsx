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
    <Link href={`/products/${id}`} className="block h-full">
      <article className="group h-full overflow-hidden rounded-[22px] border border-[#e4ddd2] bg-[#fffdf8] shadow-[0_7px_25px_rgba(70,61,45,0.055)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(70,61,45,0.11)]">
        <div className="relative overflow-hidden bg-[#eee8dd]">
          <img
            src={image || "/images/products/product1.png"}
            alt={name}
            loading="lazy"
            className="aspect-[4/5] h-auto w-full object-cover transition duration-700 md:aspect-auto md:h-[430px] md:group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#302d27]/10 via-transparent to-transparent opacity-60" />

          {newArrival && (
            <div className="absolute left-3 top-3 rounded-full border border-[#d0d6c0] bg-[#e7eadc] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[2px] text-[#4f583e] sm:left-4 sm:top-4">
              New
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#fffdf8]/90 text-xl text-[#575248] shadow-sm backdrop-blur transition duration-300 sm:right-4 sm:top-4 ${wishlisted ? "text-[#a45b3f]" : "md:opacity-0 md:group-hover:opacity-100"}`}
          >
            {wishlisted ? "♥" : "♡"}
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#596246] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[1.8px] text-white shadow-lg transition-all duration-300 hover:bg-[#465034] sm:bottom-5 sm:px-6 sm:py-3 md:translate-y-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            Add to cart
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#3c3932] sm:text-base">{name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={salePrice != null ? "font-medium text-[#a45b3f]" : "font-medium text-[#4d493f]"}>
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            {salePrice != null && <span className="text-xs text-[#9a9287] line-through">₹{price.toLocaleString("en-IN")}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
