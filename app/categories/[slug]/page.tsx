"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
  getStoreProducts,
  type StoreProduct,
} from "@/lib/store-products";

type Category = {
  id: string;
  name: string;
};

export default function CategoryPage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : params.slug?.[0] ?? "";

  const [loading, setLoading] = useState(true);
  const [category, setCategory] =
    useState<Category | null>(null);
  const [products, setProducts] = useState<
    StoreProduct[]
  >([]);

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);

      const { data: categoryData, error } =
        await supabase
          .from("categories")
          .select("id,name")
          .eq("slug", slug)
          .single();

      if (error || !categoryData) {
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      const allProducts =
        await getStoreProducts();

      const filteredProducts =
        allProducts.filter(
          (product) =>
            product.category_id ===
            categoryData.id
        );

      setProducts(filteredProducts);
      setLoading(false);
    }

    if (slug) {
      loadCategory();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-light">
          Loading...
        </h1>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-light">
          Category not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="mb-12 text-center text-5xl font-light">
          {category.name}
        </h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                slug={product.id}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}