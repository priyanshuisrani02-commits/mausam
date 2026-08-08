"use client";

import ShopFilters from "@/app/shop/ShopFilters";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;

  minPrice: string;
  setMinPrice: (value: string) => void;

  maxPrice: string;
  setMaxPrice: (value: string) => void;

  selectedSize: string;
  setSelectedSize: (value: string) => void;

  clearFilters: () => void;
};

export default function MobileFilters({
  isOpen,
  onClose,
  inStockOnly,
  setInStockOnly,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedSize,
  setSelectedSize,
  clearFilters,
}: Props) {
  if (!isOpen) {
    return null;
  }

  function handleClearFilters() {
    clearFilters();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">

      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="absolute right-0 top-0 h-full w-[88%] max-w-md overflow-y-auto bg-stone-50 p-5 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-light">
            Filters
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-xl"
          >
            ×
          </button>

        </div>

        <ShopFilters
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          clearFilters={handleClearFilters}
        />

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-black py-4 text-sm font-medium text-white"
        >
          Show Results
        </button>

      </div>

    </div>
  );
}