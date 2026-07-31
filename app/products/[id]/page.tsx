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
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;

  description: string | null;
  material: string |null;
  fit: string | null;
  pattern: string | null;
  neckline: string | null;
  sleeves: string | null;
  occasion: string | null;
  care_instructions: string | null;
  available_sizes: string[] | null;
  size_fit_note: string | null;
  model_size: string | null;
  images: string[];
};

type ProductReview = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
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
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [copied, setCopied] =
    useState(false);

  const [
    productInfoExpanded,
    setProductInfoExpanded,
  ] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [reviews, setReviews] =
    useState<ProductReview[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

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

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadReviews();
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

  async function loadReviews() {
    try {
      setReviewsLoading(true);

      const { data, error } = await supabase
        .from("product_reviews")
        .select(
          "id, customer_name, rating, review_text, created_at"
        )
        .eq("product_id", productId)
        .eq("approved", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setReviews(data ?? []);
    } catch (err) {
      console.error(
        "Unable to load reviews:",
        err
      );
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

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
`
id,
name,
price,
sale_price,
stock,
stock_quantity,
low_stock_threshold,
track_inventory,
description,
material,
fit,
pattern,
neckline,
sleeves,
occasion,
care_instructions,
available_sizes,
size_fit_note,
model_size
`
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

      const productSizes =
        Array.isArray(data.available_sizes)
          ? data.available_sizes
          : [];

      setSelectedSize(
        productSizes[0] ?? ""
      );

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

    if (
      product.available_sizes &&
      product.available_sizes.length > 0 &&
      !selectedSize
    ) {
      alert("Please select a size.");
      return;
    }

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

  async function handleSubmitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!product) return;

    setReviewMessage("");
    setReviewError("");

    const customerName = reviewName.trim();
    const customerReview = reviewText.trim();

    if (!customerName) {
      setReviewError("Please enter your name.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please choose a star rating.");
      return;
    }

    if (!customerReview) {
      setReviewError("Please write your review.");
      return;
    }

    try {
      setReviewSubmitting(true);

      const { error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: product.id,
          customer_name: customerName,
          rating: reviewRating,
          review_text: customerReview,
          approved: false,
        });

      if (error) throw error;

      setReviewName("");
      setReviewRating(0);
      setReviewText("");
      setReviewMessage(
        "Thank you! Your review has been submitted successfully."
      );
    } catch (err: any) {
      console.error("Unable to submit review:", err);
      setReviewError(
        err?.message || "Unable to submit your review right now."
      );
    } finally {
      setReviewSubmitting(false);
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

const inventoryTracked =
  product.track_inventory;

const availableStock =
  inventoryTracked
    ? product.stock_quantity
    : product.stock;

const lowStock =
  inventoryTracked &&
  availableStock <= product.low_stock_threshold &&
  availableStock > 0;

const outOfStock =
  inventoryTracked
    ? availableStock <= 0
    : product.stock <= 0;

  const productDetails = [
    {
      label: "Fabric / Material",
      value: product.material,
    },
    {
      label: "Fit",
      value: product.fit,
    },
    {
      label: "Pattern / Design",
      value: product.pattern,
    },
    {
      label: "Neckline",
      value: product.neckline,
    },
    {
      label: "Sleeves",
      value: product.sleeves,
    },
    {
      label: "Occasion",
      value: product.occasion,
    },
  ].filter(
    (detail) =>
      detail.value &&
      detail.value.trim().length > 0
  );

  const hasProductInformation =
    Boolean(product.description?.trim()) ||
    productDetails.length > 0 ||
    Boolean(
      product.care_instructions?.trim()
    );

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce(
          (total, review) =>
            total + review.rating,
          0
        ) / reviewCount
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(
    (rating) => {
      const count = reviews.filter(
        (review) =>
          review.rating === rating
      ).length;

      return {
        rating,
        count,
        percentage:
          reviewCount > 0
            ? (count / reviewCount) * 100
            : 0,
      };
    }
  );

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
  {!inventoryTracked && (
    <>In Stock</>
  )}

  {inventoryTracked &&
    !outOfStock &&
    !lowStock && (
      <>In Stock ({availableStock})</>
    )}

  {inventoryTracked &&
    lowStock && (
      <span className="text-yellow-600">
        Only {availableStock} left
      </span>
    )}

  {outOfStock && (
    <span className="text-red-600">
      Out of Stock
    </span>
  )}
</p>
            {/* Sizes */}

            {product.available_sizes &&
              product.available_sizes.length > 0 && (
                <div className="mt-8">

                  <p className="mb-3 text-sm font-medium">
                    Select Size
                  </p>

                  <div className="flex flex-wrap gap-3">

                    {product.available_sizes.map(
                      (size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() =>
                            setSelectedSize(
                              size
                            )
                          }
                          className={`h-12 min-w-12 rounded-full border px-3 transition ${
                            selectedSize ===
                            size
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white text-black hover:border-black"
                          }`}
                        >
                          {size}
                        </button>
                      )
                    )}

                  </div>

                  {(product.size_fit_note?.trim() ||
                    product.model_size?.trim()) && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      {product.size_fit_note?.trim() && (
                        <p>
                          {product.size_fit_note}
                        </p>
                      )}

                      {product.model_size?.trim() && (
                        <p>
                          {product.model_size}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              )}

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
  setQuantity((q) =>
    Math.min(
      availableStock,
      q + 1
    )
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
               disabled={outOfStock}
                className="w-full rounded-full bg-black px-10 py-4 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
              >
             {outOfStock
  ? "Out of Stock"
  : "Add to Cart"}
              </button>

            </div>


        {hasProductInformation && (
          <section className="mt-10 border-t border-black/10 pt-8">
            <div className="overflow-hidden rounded-[24px] bg-[#f7f4ef] px-5 py-6 md:rounded-[28px] md:px-6 md:py-7">

              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-light tracking-wide md:text-2xl">
                  Product Information
                </h2>

                <span className="text-xl font-light">
                  {productInfoExpanded
                    ? "−"
                    : "+"}
                </span>
              </div>

              {product.description?.trim() && (
                <p
                  className={`mt-5 whitespace-pre-line leading-7 text-gray-700 ${
                    productInfoExpanded
                      ? ""
                      : "line-clamp-3"
                  }`}
                >
                  {product.description}
                </p>
              )}

              <div className="mt-6 grid gap-y-0">
                {productDetails
                  .slice(
                    0,
                    productInfoExpanded
                      ? productDetails.length
                      : 4
                  )
                  .map((detail) => (
                    <div
                      key={detail.label}
                      className="grid grid-cols-[minmax(120px,0.8fr)_1.2fr] gap-4 border-b border-black/10 py-4"
                    >
                      <p className="text-sm text-gray-500">
                        {detail.label}
                      </p>

                      <p className="text-sm font-medium text-black">
                        {detail.value}
                      </p>
                    </div>
                  ))}
              </div>

              {productInfoExpanded &&
                product.care_instructions?.trim() && (
                  <div className="mt-8 border-t border-black/10 pt-6">
                    <p className="text-sm text-gray-500">
                      Care Instructions
                    </p>

                    <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
                      {product.care_instructions}
                    </p>
                  </div>
                )}

              <button
                type="button"
                onClick={() =>
                  setProductInfoExpanded(
                    (current) => !current
                  )
                }
                className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-medium transition-opacity hover:opacity-60"
              >
                {productInfoExpanded
                  ? "Show Less"
                  : "Read More"}

                <span
                  className={`transition-transform duration-300 ${
                    productInfoExpanded
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ↓
                </span>
              </button>

            </div>
          </section>
        )}

        {/* CUSTOMER REVIEWS */}

        <section className="mt-8 border-t border-black/10 pt-8">
          <div className="rounded-[24px] bg-[#f7f4ef] p-5 md:rounded-[28px] md:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Customer Reviews
                </p>

                <h2 className="mt-2 text-xl font-light tracking-wide md:text-2xl">
                  What Customers Say
                </h2>
              </div>

              {reviewCount > 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-light">
                    {averageRating.toFixed(1)}
                  </p>

                  <p className="mt-1 text-sm tracking-[0.12em]">
                    {"★".repeat(
                      Math.round(
                        averageRating
                      )
                    )}
                    <span className="text-gray-300">
                      {"★".repeat(
                        5 -
                          Math.round(
                            averageRating
                          )
                      )}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {reviewCount}{" "}
                    {reviewCount === 1
                      ? "review"
                      : "reviews"}
                  </p>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <p className="mt-6 text-sm text-gray-500">
                Loading reviews...
              </p>
            ) : reviewCount === 0 ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white px-5 py-6">
                <p className="text-sm font-medium">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Be the first to share your experience with this product.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-7 space-y-2">
                  {ratingBreakdown.map(
                    (item) => (
                      <div
                        key={
                          item.rating
                        }
                        className="grid grid-cols-[38px_1fr_28px] items-center gap-3 text-xs"
                      >
                        <span>
                          {item.rating} ★
                        </span>

                        <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-black transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="text-right text-gray-500">
                          {item.count}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-8 divide-y divide-black/10 border-t border-black/10">
                  {reviews.map(
                    (review) => (
                      <article
                        key={review.id}
                        className="py-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {
                                review.customer_name
                              }
                            </p>

                            <p className="mt-1 text-sm tracking-[0.12em]">
                              {"★".repeat(
                                review.rating
                              )}
                              <span className="text-gray-300">
                                {"★".repeat(
                                  5 -
                                    review.rating
                                )}
                              </span>
                            </p>
                          </div>

                          <time className="shrink-0 text-xs text-gray-400">
                            {new Intl.DateTimeFormat(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            ).format(
                              new Date(
                                review.created_at
                              )
                            )}
                          </time>
                        </div>

                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                          {
                            review.review_text
                          }
                        </p>
                      </article>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* WRITE A REVIEW */}

        <section className="mt-8 border-t border-black/10 pt-8">
          <div className="rounded-[24px] border border-black/10 bg-white p-5 md:rounded-[28px] md:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Customer Reviews
            </p>

            <h2 className="mt-2 text-xl font-light tracking-wide md:text-2xl">
              Write a Review
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Share your experience with this product.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Your Rating
                </label>

                <div className="flex w-fit items-center gap-1" aria-label="Choose a rating from 1 to 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1 text-3xl leading-none transition duration-200 hover:-translate-y-0.5 ${
                        star <= reviewRating ? "text-black" : "text-gray-300"
                      }`}
                      aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                      aria-pressed={reviewRating === star}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {reviewRating > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {reviewRating} out of 5
                  </p>
                )}
              </div>
 
              <div>
                <label htmlFor="review-name" className="mb-2 block text-sm font-medium">
                  Your Name
                </label>

                <input
                  id="review-name"
                  type="text"
                  value={reviewName}
                  onChange={(event) => setReviewName(event.target.value)}
                  maxLength={80}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
                  Your Review
                </label>

                <textarea
                  id="review-text"
                  rows={5}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  maxLength={1500}
                  placeholder="What did you think of this product?"
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
                />

                <p className="mt-2 text-right text-xs text-gray-400">
                  {reviewText.length}/1500
                </p>
              </div>

              {reviewError && (
                <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              {reviewMessage && (
                <div role="status" className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
                  {reviewMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </section>


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