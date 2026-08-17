"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  material: string | null;
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

type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image: string;
};

const palettes = [
  {
    name: "Monsoon",
    wash: "#dce3df",
    ink: "#3e514b",
    accent: "#718596",
  },
  {
    name: "Mitti",
    wash: "#eadbc9",
    ink: "#5a4034",
    accent: "#a45b3f",
  },
  {
    name: "Gulabi",
    wash: "#ead7d4",
    ink: "#654b48",
    accent: "#c98f8b",
  },
  {
    name: "Dhoop",
    wash: "#eee2bd",
    ink: "#665334",
    accent: "#c99a4a",
  },
  {
    name: "Neem",
    wash: "#dfe3cd",
    ink: "#4d563c",
    accent: "#6f7858",
  },
];

export default function ProductPage() {
  const params = useParams();
  const productId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const { refreshCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [productInfoExpanded, setProductInfoExpanded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (!productId) return;
    void loadProduct();
    void loadReviews();
  }, [productId]);

  useEffect(() => {
    if (!galleryOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryOpen, galleryIndex, product]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError("");

      const { data, error: productError } = await supabase
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

      if (productError || !data) throw new Error("Product not found.");

      const { data: images, error: imageError } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", data.id)
        .order("sort_order");

      if (imageError) throw imageError;

      const imageList = images?.map((image) => image.image_url).filter(Boolean) ?? [];

      const nextProduct: Product = {
        ...data,
        images: imageList,
      };

      setProduct(nextProduct);
      setSelectedImage(imageList[0] ?? "/images/placeholder.png");

      const sizes = Array.isArray(data.available_sizes) ? data.available_sizes : [];
      setSelectedSize(sizes[0] ?? "");
      setQuantity(1);

      await loadRelatedProducts(data.id);
    } catch (err: any) {
      console.error("Unable to load product:", err);
      setProduct(null);
      setError(err?.message || "Unable to load this product.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedProducts(currentId: string) {
    try {
      const { data, error: relatedError } = await supabase
        .from("products")
        .select("id, name, price, sale_price")
        .neq("id", currentId)
        .order("created_at", { ascending: false })
        .limit(4);

      if (relatedError) throw relatedError;

      const withImages = await Promise.all(
        (data ?? []).map(async (item) => {
          const { data: imageRows } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", item.id)
            .order("sort_order")
            .limit(1);

          return {
            ...item,
            image: imageRows?.[0]?.image_url ?? "/images/placeholder.png",
          };
        })
      );

      setRelatedProducts(withImages);
    } catch (err) {
      console.error("Unable to load related products:", err);
      setRelatedProducts([]);
    }
  }

  async function loadReviews() {
    try {
      setReviewsLoading(true);
      const { data, error: reviewError } = await supabase
        .from("product_reviews")
        .select("id, customer_name, rating, review_text, created_at")
        .eq("product_id", productId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (reviewError) throw reviewError;
      setReviews(data ?? []);
    } catch (err) {
      console.error("Unable to load reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  function openGallery(image: string) {
    if (!product) return;
    const index = product.images.indexOf(image);
    setGalleryIndex(index >= 0 ? index : 0);
    setZoomed(false);
    setGalleryOpen(true);
  }

  function closeGallery() {
    setGalleryOpen(false);
    setZoomed(false);
  }

  function previousImage() {
    if (!product || product.images.length <= 1) return;
    setGalleryIndex((current) =>
      current === 0 ? product.images.length - 1 : current - 1
    );
    setZoomed(false);
  }

  function nextImage() {
    if (!product || product.images.length <= 1) return;
    setGalleryIndex((current) =>
      current === product.images.length - 1 ? 0 : current + 1
    );
    setZoomed(false);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.targetTouches[0].clientX;
    touchEndX.current = null;
  }

  function handleTouchMove(event: React.TouchEvent) {
    touchEndX.current = event.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextImage();
    if (distance < -50) previousImage();

    touchStartX.current = null;
    touchEndX.current = null;
  }

  async function handleShare() {
    if (!product) return;

    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${product.name} | MAUSAM`,
          text: `Discover ${product.name} from MAUSAM.`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Unable to share:", err);
    }
  }

  async function handleAddToCart() {
    if (!product || outOfStock) return;

    if (product.available_sizes?.length && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    try {
      await addToCart(product.id, quantity, selectedSize);
      await refreshCart();
      alert("Added to cart!");
    } catch (err: any) {
      alert(err?.message || "Unable to add this item to your cart.");
    }
  }

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;

    setReviewMessage("");
    setReviewError("");

    const customerName = reviewName.trim();
    const customerReview = reviewText.trim();

    if (!customerName) return setReviewError("Please enter your name.");
    if (reviewRating < 1 || reviewRating > 5) {
      return setReviewError("Please choose a star rating.");
    }
    if (!customerReview) return setReviewError("Please write your review.");

    try {
      setReviewSubmitting(true);
      const { error: insertError } = await supabase
        .from("product_reviews")
        .insert({
          product_id: product.id,
          customer_name: customerName,
          rating: reviewRating,
          review_text: customerReview,
          approved: false,
        });

      if (insertError) throw insertError;

      setReviewName("");
      setReviewRating(0);
      setReviewText("");
      setReviewMessage("Thank you! Your review has been submitted for approval.");
    } catch (err: any) {
      console.error("Unable to submit review:", err);
      setReviewError(err?.message || "Unable to submit your review right now.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const palette = useMemo(() => {
    if (!product) return palettes[0];
    const seed = product.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
    return palettes[seed % palettes.length];
  }, [product]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[var(--mausam-cream)] px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--mausam-muted)]">MAUSAM</p>
          <p className="mt-4 mausam-serif text-2xl italic text-[var(--mausam-ink)]">Preparing the edit…</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[var(--mausam-cream)] px-6">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--mausam-muted)]">MAUSAM</p>
          <h1 className="mt-5 mausam-serif text-4xl font-normal">This piece has moved on.</h1>
          <p className="mt-4 leading-7 text-[var(--mausam-muted)]">{error || "We could not find this product."}</p>
        </div>
      </main>
    );
  }

  const galleryImages = product.images.length ? product.images : ["/images/placeholder.png"];
  const inventoryTracked = product.track_inventory;
  const availableStock = inventoryTracked ? product.stock_quantity : product.stock;
  const lowStock = inventoryTracked && availableStock <= product.low_stock_threshold && availableStock > 0;
  const outOfStock = inventoryTracked ? availableStock <= 0 : product.stock <= 0;
  const displayPrice = product.sale_price ?? product.price;
  const hasSale = product.sale_price !== null && product.sale_price < product.price;

  const productDetails = [
    ["Fabric / Material", product.material],
    ["Fit", product.fit],
    ["Pattern / Design", product.pattern],
    ["Neckline", product.neckline],
    ["Sleeves", product.sleeves],
    ["Occasion", product.occasion],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]?.trim()));

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    return {
      rating,
      count,
      percentage: reviewCount ? (count / reviewCount) * 100 : 0,
    };
  });

  const story = product.description?.trim() ||
    "A considered piece from the MAUSAM wardrobe, designed to move easily through the season and remain beautiful beyond it.";

  return (
    <>
      <main className="overflow-hidden bg-[var(--mausam-cream)] pb-28 text-[var(--mausam-ink)] md:pb-10">
        {/* Editorial breadcrumb / season marker */}
        <div className="mx-auto max-w-[1500px] px-4 pt-6 md:px-8 md:pt-10">
          <div className="flex items-center justify-between gap-5 border-b border-[var(--mausam-line)] pb-5 text-[10px] uppercase tracking-[0.25em] text-[var(--mausam-muted)] md:text-xs">
            <p>MAUSAM / THE SEASONAL EDIT</p>
            <p className="hidden md:block">{palette.name} · 01 / 01</p>
          </div>
        </div>

        {/* Hero product composition */}
        <section className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:gap-14 xl:gap-20">
            <div className="min-w-0">
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                <button
                  type="button"
                  onClick={() => openGallery(galleryImages[0])}
                  className="group relative col-span-2 aspect-[4/5] overflow-hidden rounded-[28px] bg-[var(--mausam-paper)] text-left md:rounded-[36px]"
                  aria-label="Open product gallery"
                >
                  <img
                    src={galleryImages[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-[var(--mausam-paper)]/90 px-4 py-2 text-[10px] uppercase tracking-[0.22em] backdrop-blur md:left-7 md:top-7">
                    View piece
                  </span>
                  <span className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mausam-paper)]/90 text-lg backdrop-blur md:bottom-7 md:right-7">
                    ↗
                  </span>
                </button>

                {galleryImages.slice(1, 3).map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => openGallery(image)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[var(--mausam-paper)] md:rounded-[28px]"
                    aria-label={`Open product image ${index + 2}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} detail ${index + 2}`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}

                <div
                  className="relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[22px] p-6 md:rounded-[28px] md:p-8"
                  style={{ backgroundColor: palette.wash, color: palette.ink }}
                >
                  <span className="text-[10px] uppercase tracking-[0.25em]">A MAUSAM note</span>
                  <div>
                    <p className="mausam-serif text-2xl leading-tight md:text-3xl">
                      Made for the days that become memories.
                    </p>
                    <div className="mt-6 h-px w-16" style={{ backgroundColor: palette.accent }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky editorial purchase panel */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative overflow-hidden rounded-[30px] border border-[var(--mausam-line)] bg-[var(--mausam-paper)] p-6 shadow-[0_20px_60px_rgba(48,45,39,0.06)] md:rounded-[36px] md:p-9">
                <div
                  className="absolute right-0 top-0 h-28 w-28 rounded-bl-[70px] opacity-80"
                  style={{ backgroundColor: palette.wash }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="rounded-full px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em]"
                      style={{ backgroundColor: palette.wash, color: palette.ink }}
                    >
                      Seasonal piece
                    </span>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex h-10 items-center gap-2 rounded-full border border-[var(--mausam-line)] px-3 text-[10px] uppercase tracking-[0.15em] transition hover:bg-[var(--mausam-cream)]"
                    >
                      <span className="text-base">↗</span>
                      <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
                    </button>
                  </div>

                  <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-[var(--mausam-muted)]">The piece</p>
                  <h1 className="mt-3 max-w-lg mausam-serif text-4xl font-normal leading-[0.98] md:text-5xl xl:text-6xl">
                    {product.name}
                  </h1>

                  <div className="mt-7 flex flex-wrap items-end gap-3">
                    <p className="text-2xl font-medium tracking-tight md:text-3xl">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </p>
                    {hasSale && (
                      <p className="pb-1 text-sm text-[var(--mausam-muted)] line-through">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-[var(--mausam-muted)]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: outOfStock ? "#a45b3f" : palette.accent }} />
                    {!inventoryTracked && !outOfStock && "In stock"}
                    {inventoryTracked && !outOfStock && !lowStock && `${availableStock} available`}
                    {lowStock && `Only ${availableStock} left`}
                    {outOfStock && "Currently unavailable"}
                  </div>

                  <div className="my-8 h-px bg-[var(--mausam-line)]" />

                  {/* Short story */}
                  <p className="text-sm leading-7 text-[var(--mausam-muted)]">{story}</p>

                  {product.available_sizes?.length ? (
                    <div className="mt-8">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em]">Choose your size</p>
                        {product.size_fit_note?.trim() && (
                          <span className="text-[10px] text-[var(--mausam-muted)]">Fit note below</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {product.available_sizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className="h-12 rounded-xl border text-sm transition"
                            style={
                              selectedSize === size
                                ? { backgroundColor: palette.ink, borderColor: palette.ink, color: "#fff" }
                                : undefined
                            }
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {(product.size_fit_note?.trim() || product.model_size?.trim()) && (
                        <div className="mt-4 space-y-1 text-xs leading-5 text-[var(--mausam-muted)]">
                          {product.size_fit_note?.trim() && <p>{product.size_fit_note}</p>}
                          {product.model_size?.trim() && <p>{product.model_size}</p>}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="mt-8 flex gap-3">
                    <div className="flex h-14 shrink-0 items-center rounded-2xl border border-[var(--mausam-line)] bg-[var(--mausam-cream)]">
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        className="h-full w-11 text-lg"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.min(Math.max(availableStock, 1), current + 1))}
                        className="h-full w-11 text-lg"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={outOfStock}
                      className="h-14 flex-1 rounded-2xl px-5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ backgroundColor: palette.ink, color: "#fff" }}
                    >
                      {outOfStock ? "Unavailable" : "Add to Cart"}
                    </button>
                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[var(--mausam-line)] pt-6 text-center text-[9px] uppercase tracking-[0.14em] text-[var(--mausam-muted)]">
                    <span>Thoughtful<br />design</span>
                    <span>Easy<br />styling</span>
                    <span>Season-led<br />wardrobe</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Product story */}
        <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-16">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mausam-muted)]">01 / The story</p>
              <h2 className="mt-4 max-w-sm mausam-serif text-4xl font-normal leading-tight md:text-5xl">
                A piece with a point of view.
              </h2>
            </div>
            <div className="border-t border-[var(--mausam-line)] pt-6 md:pt-8">
              <p className="max-w-3xl whitespace-pre-line text-lg leading-8 text-[var(--mausam-muted)] md:text-xl md:leading-9">
                {story}
              </p>
              <button
                type="button"
                onClick={() => setProductInfoExpanded((current) => !current)}
                className="mt-7 inline-flex items-center gap-3 border-b border-[var(--mausam-ink)] pb-1 text-[10px] font-medium uppercase tracking-[0.2em]"
              >
                {productInfoExpanded ? "Close details" : "Explore details"}
                <span>{productInfoExpanded ? "↑" : "↓"}</span>
              </button>
            </div>
          </div>

          {productInfoExpanded && (
            <div className="mt-12 grid gap-8 border-t border-[var(--mausam-line)] pt-8 md:grid-cols-2 lg:grid-cols-3">
              {productDetails.map(([label, value]) => (
                <div key={label} className="rounded-[24px] bg-[var(--mausam-paper)] p-6">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[var(--mausam-muted)]">{label}</p>
                  <p className="mt-3 text-base leading-6">{value}</p>
                </div>
              ))}
              {product.care_instructions?.trim() && (
                <div className="rounded-[24px] p-6" style={{ backgroundColor: palette.wash, color: palette.ink }}>
                  <p className="text-[9px] uppercase tracking-[0.22em] opacity-70">Care instructions</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7">{product.care_instructions}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-16">
          <div className="rounded-[30px] bg-[var(--mausam-paper)] p-6 md:rounded-[38px] md:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.45fr_1fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mausam-muted)]">02 / From the wardrobe</p>
                <h2 className="mt-4 mausam-serif text-4xl font-normal">What customers say</h2>
                {reviewCount > 0 && (
                  <div className="mt-8">
                    <p className="text-5xl font-light">{averageRating.toFixed(1)}</p>
                    <p className="mt-2 tracking-[0.18em]">{"★".repeat(Math.round(averageRating))}<span className="text-[var(--mausam-line)]">{"★".repeat(5 - Math.round(averageRating))}</span></p>
                    <p className="mt-2 text-xs text-[var(--mausam-muted)]">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p>
                  </div>
                )}
              </div>

              <div>
                {reviewsLoading ? (
                  <p className="text-sm text-[var(--mausam-muted)]">Loading reviews…</p>
                ) : reviewCount === 0 ? (
                  <div className="rounded-[24px] border border-[var(--mausam-line)] p-7">
                    <p className="mausam-serif text-2xl">The first word is yours.</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--mausam-muted)]">Be the first to share your experience with this piece.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {ratingBreakdown.map((item) => (
                        <div key={item.rating} className="grid grid-cols-[35px_1fr_25px] items-center gap-3 text-xs">
                          <span>{item.rating} ★</span>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mausam-line)]">
                            <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: palette.accent }} />
                          </div>
                          <span className="text-right text-[var(--mausam-muted)]">{item.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 divide-y divide-[var(--mausam-line)] border-t border-[var(--mausam-line)]">
                      {reviews.map((review) => (
                        <article key={review.id} className="py-6">
                          <div className="flex items-start justify-between gap-5">
                            <div>
                              <p className="font-medium">{review.customer_name}</p>
                              <p className="mt-1 text-sm tracking-[0.12em]">{"★".repeat(review.rating)}<span className="text-[var(--mausam-line)]">{"★".repeat(5 - review.rating)}</span></p>
                            </div>
                            <time className="text-xs text-[var(--mausam-muted)]">
                              {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.created_at))}
                            </time>
                          </div>
                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--mausam-muted)]">{review.review_text}</p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Write review */}
        <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-16">
          <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mausam-muted)]">03 / Leave a note</p>
              <h2 className="mt-4 mausam-serif text-4xl font-normal">Tell us how it feels.</h2>
            </div>
            <form onSubmit={handleSubmitReview} className="space-y-5 rounded-[28px] border border-[var(--mausam-line)] bg-[var(--mausam-paper)] p-6 md:p-9">
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em]">Your rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-2xl transition hover:-translate-y-0.5"
                      style={{ color: star <= reviewRating ? palette.accent : "#d9d2c6" }}
                      aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-name" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em]">Your name</label>
                <input
                  id="review-name"
                  type="text"
                  value={reviewName}
                  onChange={(event) => setReviewName(event.target.value)}
                  maxLength={80}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-[var(--mausam-line)] bg-[var(--mausam-cream)] px-4 py-3.5 text-sm outline-none transition focus:border-[var(--mausam-ink)]"
                />
              </div>

              <div>
                <label htmlFor="review-text" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em]">Your review</label>
                <textarea
                  id="review-text"
                  rows={5}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  maxLength={1500}
                  placeholder="What did you think of this piece?"
                  className="w-full resize-none rounded-2xl border border-[var(--mausam-line)] bg-[var(--mausam-cream)] px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-[var(--mausam-ink)]"
                />
                <p className="mt-2 text-right text-[10px] text-[var(--mausam-muted)]">{reviewText.length}/1500</p>
              </div>

              {reviewError && <div role="alert" className="rounded-2xl bg-[#f4dfda] px-4 py-3 text-sm text-[#7d4032]">{reviewError}</div>}
              {reviewMessage && <div role="status" className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: palette.wash, color: palette.ink }}>{reviewMessage}</div>}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded-2xl px-6 py-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: palette.ink }}
              >
                {reviewSubmitting ? "Sending…" : "Submit review"}
              </button>
            </form>
          </div>
        </section>

        {/* Related edit */}
        {relatedProducts.length > 0 && (
          <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-16">
            <div className="flex items-end justify-between gap-6 border-b border-[var(--mausam-line)] pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mausam-muted)]">04 / Continue the edit</p>
                <h2 className="mt-3 mausam-serif text-4xl font-normal">Pieces to wear with it.</h2>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {relatedProducts.map((item, index) => {
                const itemPrice = item.sale_price ?? item.price;
                return (
                  <a
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[var(--mausam-paper)] md:rounded-[28px]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--mausam-paper)]/90 px-2.5 py-1 text-[8px] uppercase tracking-[0.18em] backdrop-blur md:left-4 md:top-4">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--mausam-muted)]">₹{itemPrice.toLocaleString("en-IN")}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <div className="mx-auto mt-8 max-w-[1500px] px-4 md:px-8">
          <Footer />
        </div>
      </main>

      {/* Mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--mausam-line)] bg-[var(--mausam-paper)]/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{product.name}</p>
            <p className="mt-0.5 text-sm">₹{displayPrice.toLocaleString("en-IN")}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="rounded-xl px-5 py-3 text-xs font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: palette.ink }}
          >
            {outOfStock ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Full-screen gallery */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#292722] text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image gallery`}
        >
          <div className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/50">MAUSAM / {palette.name}</p>
              <p className="mt-1 text-xs text-white/80">{galleryIndex + 1} / {galleryImages.length}</p>
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

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {galleryImages.length > 1 && (
              <button type="button" onClick={previousImage} className="absolute left-4 z-20 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl md:flex" aria-label="Previous image">‹</button>
            )}

            <button
              type="button"
              onClick={() => setZoomed((current) => !current)}
              className={`flex h-full w-full items-center justify-center overflow-auto ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
            >
              <img
                src={galleryImages[galleryIndex]}
                alt={`${product.name} ${galleryIndex + 1}`}
                className={`select-none object-contain transition-transform duration-300 ${zoomed ? "max-h-none max-w-none scale-[1.7]" : "max-h-full max-w-full"}`}
                draggable={false}
              />
            </button>

            {galleryImages.length > 1 && (
              <button type="button" onClick={nextImage} className="absolute right-4 z-20 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl md:flex" aria-label="Next image">›</button>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex shrink-0 justify-start gap-3 overflow-x-auto px-4 pb-5 pt-2 md:justify-center md:px-8">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => {
                    setGalleryIndex(index);
                    setZoomed(false);
                  }}
                  className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${galleryIndex === index ? "border-white" : "border-transparent opacity-50 hover:opacity-100"}`}
                  aria-label={`Open image ${index + 1}`}
                >
                  <img src={image} alt="" className="h-16 w-14 object-cover md:h-20 md:w-16" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
