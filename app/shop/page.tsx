"use client";

import { useEffect, useMemo, useState } from "react";
import MobileFilters from "@/app/shop/MobileFilters";
import ShopToolbar from "@/app/shop/ShopToolbar";
import ShopFilters from "@/app/shop/ShopFilters";
import CategoryChips from "@/app/shop/CategoryChips";
import ProductGrid from "@/app/shop/ProductGrid";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";
import { getStoreCategories, type StoreCategory } from "@/lib/store-categories";

export default function ShopPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
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
        const [loadedProducts, loadedCategories] = await Promise.all([
          getStoreProducts(),
          getStoreCategories(),
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load shop data:", error);
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
      list = list.filter((product) => product.category_id === selectedCategory);
    }

    if (selectedSize) {
      list = list.filter((product) => product.available_sizes?.includes(selectedSize));
    }

    if (inStockOnly) {
      list = list.filter((product) => !product.track_inventory || product.stock_quantity > 0);
    }

    if (minPrice !== "") {
      const minimum = Number(minPrice);
      if (!Number.isNaN(minimum)) {
        list = list.filter((product) => (product.sale_price ?? product.price) >= minimum);
      }
    }

    if (maxPrice !== "") {
      const maximum = Number(maxPrice);
      if (!Number.isNaN(maximum)) {
        list = list.filter((product) => (product.sale_price ?? product.price) <= maximum);
      }
    }

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case "price-high":
        list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [products, selectedCategory, selectedSize, inStockOnly, minPrice, maxPrice, sortBy]);

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="mb-10 text-5xl font-light">Shop</h1>

        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="lg:hidden">
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 rounded-full border border-black bg-white py-3 text-sm font-medium"
            >
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        <ShopToolbar productCount={filteredProducts.length} sortBy={sortBy} setSortBy={setSortBy} />

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
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
              <div className="rounded-[32px] bg-white p-20 text-center shadow-sm">
                <p className="text-lg text-gray-500">Loading products...</p>
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
    </main>
  );
}
