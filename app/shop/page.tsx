"use client";

import { useEffect, useMemo, useState } from "react";
import MobileFilters from "@/app/shop/MobileFilters";
import ShopToolbar from "@/app/shop/ShopToolbar";
import ShopFilters from "@/app/shop/ShopFilters";
import CategoryChips from "@/app/shop/CategoryChips";
import ProductGrid from "@/app/shop/ProductGrid";
import Footer from "@/components/Footer";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";
import {
  getStoreCategories,
  type StoreCategory,
} from "@/lib/store-categories";

export default function ShopPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setError("");
        const [loadedProducts, loadedCategories] = await Promise.all([
          getStoreProducts(),
          getStoreCategories(),
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (loadError) {
        console.error("Failed to load shop data:", loadError);
        setError("We could not load the seasonal edit. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function clearFilters() {
    setSelectedCategory("");
    setSelectedSize("");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  }

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory) {
      list = list.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    if (selectedSize) {
      list = list.filter((product) =>
        product.available_sizes?.includes(selectedSize)
      );
    }

    if (inStockOnly) {
      list = list.filter(
        (product) =>
          !product.track_inventory || product.stock_quantity > 0
      );
    }

    if (minPrice !== "") {
      const minimum = Number(minPrice);
      if (!Number.isNaN(minimum)) {
        list = list.filter(
          (product) =>
            (product.sale_price ?? product.price) >= minimum
        );
      }
    }

    if (maxPrice !== "") {
      const maximum = Number(maxPrice);
      if (!Number.isNaN(maximum)) {
        list = list.filter(
          (product) =>
            (product.sale_price ?? product.price) <= maximum
        );
      }
    }

    switch (sortBy) {
      case "price-low":
        list.sort(
          (a, b) =>
            (a.sale_price ?? a.price) -
            (b.sale_price ?? b.price)
        );
        break;
      case "price-high":
        list.sort(
          (a, b) =>
            (b.sale_price ?? b.price) -
            (a.sale_price ?? a.price)
        );
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }

    return list;
  }, [
    products,
    selectedCategory,
    selectedSize,
    inStockOnly,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#302d27]">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-16">
        <div className="mb-8 md:mb-10">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8b806f]">
            The Seasonal Edit
          </p>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
            Shop
          </h1>
        </div>

        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="lg:hidden">
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 rounded-full border border-[#cfc6b8] bg-[#fffdf8] py-3 text-sm font-medium text-[#302d27]"
            >
              Filters
            </button>
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="min-w-0 flex-1 rounded-full border border-[#cfc6b8] bg-[#fffdf8] px-4 py-3 text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        <ShopToolbar
          productCount={filteredProducts.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="hidden lg:block">
            <ShopFilters
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              clearFilters={clearFilters}
            />
          </div>

          <div className="min-w-0">
            {loading ? (
              <div className="rounded-[28px] border border-[#e7e0d4] bg-[#fffdf8] p-16 text-center shadow-sm">
                <p className="mausam-serif text-2xl text-[#5f5a51]">
                  Preparing your seasonal edit…
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-[#e7e0d4] bg-[#fffdf8] p-12 text-center shadow-sm">
                <p className="text-sm text-[#756f64]">{error}</p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </section>

      <MobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        clearFilters={clearFilters}
      />

      <Footer />
    </main>
  );
}
