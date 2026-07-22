"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  slug,
}: ProductCardProps) {
  const router = useRouter();

  const { user } = useAuth();

  const {
    loading,
    isWishlisted,
    toggle,
  } = useWishlist();

  const wishlisted = isWishlisted(id);

  async function handleWishlist(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await toggle(id);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
   <Link href={`/products/${id}`}>
      <div className="group cursor-pointer">

        <div className="relative overflow-hidden rounded-3xl">

          <img
            src={
              image ||
              "/images/products/product1.png"
            }
            alt={name}
            className="h-[450px] w-full object-cover transition duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />

          <div className="absolute left-4 top-4 rounded-full bg-white px-4 py-1 text-sm font-medium">
            NEW
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleWishlist}
            aria-label={
              wishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg transition duration-300 ${
              wishlisted
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </button>

          <button
            type="button"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-6 rounded-full bg-white px-6 py-3 text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add to Cart
          </button>

        </div>

        <h3 className="mt-5 text-xl font-medium">
          {name}
        </h3>

        <p className="mt-2 text-gray-500">
          ₹{price.toLocaleString("en-IN")}
        </p>

      </div>
    </Link>
  );
}