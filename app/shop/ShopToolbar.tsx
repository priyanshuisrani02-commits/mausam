"use client";

type Props = {
  productCount: number;
  sortBy: string;
  setSortBy: (value: string) => void;
};

export default function ShopToolbar({
  productCount,
  sortBy,
  setSortBy,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-light">
          Showing {productCount} Product
          {productCount === 1 ? "" : "s"}
        </h2>

        <p className="mt-2 text-gray-500">
          Discover the latest MAUSAM collection.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Sort By
        </span>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
        >
          <option value="newest">
            Newest
          </option>

          <option value="price-low">
            Price: Low → High
          </option>

          <option value="price-high">
            Price: High → Low
          </option>

          <option value="name">
            Name (A–Z)
          </option>
        </select>
      </div>
    </div>
  );
}