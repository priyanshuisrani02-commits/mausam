"use client";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
};

export default function CategoryChips({
  categories,
  selectedCategory,
  setSelectedCategory,
}: Props) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">

      <button
        type="button"
        onClick={() => setSelectedCategory("")}
        className={`rounded-full border px-5 py-2 text-sm transition ${
          selectedCategory === ""
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white hover:border-black"
        }`}
      >
        All
      </button>

      {categories.map((category) => {
        const active =
          selectedCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              setSelectedCategory(category.id)
            }
            className={`rounded-full border px-5 py-2 text-sm transition ${
              active
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white hover:border-black"
            }`}
          >
            {category.name}
          </button>
        );
      })}

    </div>
  );
}