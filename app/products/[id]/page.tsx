"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
};

export default function ProductPage() {
  const { id } = useParams();
  const { refreshCart } = useCart();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedSize, setSelectedSize] =
    useState("M");

  const [quantity, setQuantity] =
    useState(1);

  const [copied, setCopied] =
    useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return;

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", data.id)
      .order("sort_order");

    const imageList =
      images?.map(
        (img) => img.image_url
      ) ?? [];

    setProduct({
      ...data,
      images: imageList,
    });

    if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }

  async function handleShare() {
    if (!product) return;

    const url = window.location.href;

    const shareData = {
      title: `${product.name} | MAUSAM`,
      text: `Check out ${product.name} from MAUSAM`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );

        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(
          "Unable to share:",
          err
        );
      }
    }
  }

  async function handleAddToCart() {
    if (!product) return;

    try {
      await addToCart(
        product.id,
        quantity,
        selectedSize
      );

      await refreshCart();

      alert("Added to cart!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (!product) {
    return (
      <div className="py-40 text-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">

        {/* Images */}

        <div>
          <img
            src={
              selectedImage ||
              "/images/placeholder.png"
            }
            alt={product.name}
            className="h-[420px] w-full rounded-3xl object-cover md:h-auto"
          />

          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:mt-6 md:gap-4">

            {product.images.map(
              (image) => (
                <button
                  type="button"
                  key={image}
                  onClick={() =>
                    setSelectedImage(
                      image
                    )
                  }
                  className="overflow-hidden rounded-xl border"
                >
                  <img
                    src={image}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover md:h-24 md:w-24"
                  />
                </button>
              )
            )}

          </div>
        </div>

        {/* Product information */}

        <div>

          <div className="flex items-start justify-between gap-5">

            <h1 className="text-3xl font-light md:text-5xl">
              {product.name}
            </h1>

            <button
              type="button"
              onClick={handleShare}
              className="flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm transition hover:bg-gray-50"
            >
              <span className="text-lg">
                ↗
              </span>

              {copied
                ? "Link Copied"
                : "Share"}
            </button>

          </div>

          <p className="mt-6 text-3xl">
            ₹
            {product.price.toLocaleString(
              "en-IN"
            )}
          </p>

          {product.sale_price && (
            <p className="mt-2 text-xl text-red-600">
              Sale ₹
              {product.sale_price.toLocaleString(
                "en-IN"
              )}
            </p>
          )}

          <p className="mt-6 text-gray-600">
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </p>

          {/* Sizes */}

          <div className="mt-8">

            <p className="mb-3 text-sm font-medium">
              Select Size
            </p>

            <div className="flex flex-wrap gap-3">

              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    setSelectedSize(
                      size
                    )
                  }
                  className={`h-12 w-12 rounded-full border transition ${
                    selectedSize ===
                    size
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}

            </div>
          </div>

          {/* Quantity + Cart */}

          <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:gap-6">

            <div className="flex w-fit items-center overflow-hidden rounded-full border">

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(
                      1,
                      q - 1
                    )
                  )
                }
                className="px-5 py-3 text-xl"
              >
                −
              </button>

              <span className="w-12 text-center">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (q) => q + 1
                  )
                }
                className="px-5 py-3 text-xl"
              >
                +
              </button>

            </div>

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                product.stock <= 0
              }
              className="w-full rounded-full bg-black px-10 py-4 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
            >
              {product.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}