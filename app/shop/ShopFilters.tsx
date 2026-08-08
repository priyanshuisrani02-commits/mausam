"use client";

type Props = {
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

const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

export default function ShopFilters({
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
  return (
    <aside className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm">

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-light">
          Filters
        </h2>

        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 transition hover:text-black"
        >
          Clear
        </button>
      </div>

      <div className="space-y-8">

        <div>

          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Availability
          </h3>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) =>
                setInStockOnly(
                  e.target.checked
                )
              }
            />

            <span>
              In Stock Only
            </span>

          </label>

        </div>

        <div>

          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Price
          </h3>

          <div className="space-y-3">

            <input
              type="number"
              placeholder="Minimum"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              type="number"
              placeholder="Maximum"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

          </div>

        </div>

        <div>

          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Size
          </h3>

          <div className="flex flex-wrap gap-2">

            {sizes.map((size) => {
              const active =
                selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSelectedSize(
                      active ? "" : size
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}

          </div>

        </div>

      </div>

    </aside>
  );
} 