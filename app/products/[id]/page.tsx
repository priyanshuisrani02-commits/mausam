"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
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
  const params = useParams();

  const productId =
    typeof params.id === "string"
      ? params.id
      : params.id?.[0] ?? "";

  const { refreshCart } = useCart();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedSize, setSelectedSize] =
    useState("M");

  const [quantity, setQuantity] =
    useState(1);

  const [copied, setCopied] =
    useState(false);

  // Full-screen gallery
  const [galleryOpen, setGalleryOpen] =
    useState(false);

  const [galleryIndex, setGalleryIndex] =
    useState(0);

  const [zoomed, setZoomed] =
    useState(false);

  const touchStartX =
    useRef<number | null>(null);

  const touchEndX =
    useRef<number | null>(null);

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
  ];

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (!galleryOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [galleryOpen, galleryIndex, product]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: productError,
      } = await supabase
        .from("products")
        .select(
          "id, name, price, sale_price, stock"
        )
        .eq("id", productId)
        .single();

      if (productError || !data) {
        throw new Error(
          "Product not found."
        );
      }

      const {
        data: images,
        error: imageError,
      } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", data.id)
        .order("sort_order");

      if (imageError) {
        throw imageError;
      }

      const imageList =
        images?.map(
          (image) => image.image_url
        ) ?? [];

      setProduct({
        ...data,
        images: imageList,
      });

      setSelectedImage(
        imageList[0] ??
          "/images/placeholder.png"
      );
    } catch (err: any) {
      console.error(
        "Unable to load product:",
        err
      );

      setProduct(null);

      setError(
        err.message ||
          "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }

  function openGallery(image: string) {
    if (!product) return;

    const index =
      product.images.indexOf(image);

    setGalleryIndex(
      index >= 0 ? index : 0
    );

    setZoomed(false);
    setGalleryOpen(true);
  }

  function closeGallery() {
    setGalleryOpen(false);
    setZoomed(false);
  }

  function previousImage() {
    if (
      !product ||
      product.images.length <= 1
    ) {
      return;
    }

    setGalleryIndex((current) =>
      current === 0
        ? product.images.length - 1
        : current - 1
    );

    setZoomed(false);
  }

  function nextImage() {
    if (
      !product ||
      product.images.length <= 1
    ) {
      return;
    }

    setGalleryIndex((current) =>
      current ===
      product.images.length - 1
        ? 0
        : current + 1
    );

    setZoomed(false);
  }

  function handleTouchStart(
    event: React.TouchEvent
  ) {
    touchStartX.current =
      event.targetTouches[0].clientX;

    touchEndX.current = null;
  }

  function handleTouchMove(
    event: React.TouchEvent
  ) {
    touchEndX.current =
      event.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current -
      touchEndX.current;

    const minimumSwipeDistance = 50;

    if (
      distance >
      minimumSwipeDistance
    ) {
      nextImage();
    }

    if (
      distance <
      -minimumSwipeDistance
    ) {
      previousImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  async function handleShare() {
    if (!product) return;

    const url =
      window.location.href;

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
      if (
        err?.name !== "AbortError"
      ) {
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

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-light">
            Product not found
          </h1>

          <p className="mt-3 text-gray-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  const galleryImages =
    product.images.length > 0
      ? product.images
      : ["/images/placeholder.png"];

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">

          {/* Images */}

          <div>

            <button
              type="button"
              onClick={() =>
                openGallery(
                  selectedImage
                )
              }
              className="group relative block w-full overflow-hidden rounded-3xl"
              aria-label="Open product image gallery"
            >
              <img
                src={
                  selectedImage ||
                  "/images/placeholder.png"
                }
                alt={product.name}
                className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-auto"
              />

              <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm text-black shadow-sm backdrop-blur">
                ⛶ View
              </span>
            </button>

            <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:mt-6 md:gap-4">

              {product.images.map(
                (image, index) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() =>
                      setSelectedImage(
                        image
                      )
                    }
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage ===
                      image
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    aria-label={`View product image ${
                      index + 1
                    }`}
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

            {product.sale_price !==
              null && (
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

      {/* Full-screen gallery */}

      {galleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image gallery`}
        >

          {/* Gallery header */}

          <div className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8">

            <div className="text-sm tracking-wide text-white/80">
              {galleryIndex + 1} /{" "}
              {galleryImages.length}
            </div>

            <button
              type="button"
              onClick={closeGallery}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20"
              aria-label="Close gallery"
            >
              ×
            </button>

          </div>

          {/* Main gallery image */}

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-20"
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
          >

            {galleryImages.length >
              1 && (
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-3 z-20 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl transition hover:bg-white/20 md:flex"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                setZoomed(
                  (current) =>
                    !current
                )
              }
              className={`flex h-full w-full items-center justify-center overflow-auto ${
                zoomed
                  ? "cursor-zoom-out"
                  : "cursor-zoom-in"
              }`}
              aria-label={
                zoomed
                  ? "Zoom out"
                  : "Zoom in"
              }
            >
              <img
                src={
                  galleryImages[
                    galleryIndex
                  ]
                }
                alt={`${product.name} ${
                  galleryIndex + 1
                }`}
                className={`select-none object-contain transition-transform duration-300 ${
                  zoomed
                    ? "max-h-none max-w-none scale-[1.7]"
                    : "max-h-full max-w-full"
                }`}
                draggable={false}
              />
            </button>

            {galleryImages.length >
              1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 z-20 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl transition hover:bg-white/20 md:flex"
                aria-label="Next image"
              >
                ›
              </button>
            )}

          </div>

          {/* Mobile swipe hint */}

          {galleryImages.length > 1 && (
            <p className="pb-3 text-center text-xs text-white/50 md:hidden">
              Swipe to view more
            </p>
          )}

          {/* Gallery thumbnails */}

          {galleryImages.length > 1 && (
            <div className="flex shrink-0 justify-start gap-3 overflow-x-auto px-4 pb-5 pt-2 md:justify-center md:px-8">

              {galleryImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => {
                      setGalleryIndex(
                        index
                      );

                      setZoomed(false);
                    }}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      galleryIndex ===
                      index
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Open image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-16 w-14 object-cover md:h-20 md:w-16"
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>
      )}
    </>
  );
}