"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  show_on_homepage: boolean;
  sort_order: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }

    setLoading(false);
  }

  async function deleteCategory(category: Category) {
    const confirmed = confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadCategories();
  }

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light">
          Categories
        </h1>

        <Link
          href="/admin/categories/new"
          className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
        >
          + Add Category
        </Link>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow">

        {loading ? (

          <p className="text-gray-500">
            Loading categories...
          </p>

        ) : categories.length === 0 ? (

          <p className="text-gray-500">
            No categories found.
          </p>

        ) : (

          <div className="space-y-5">

            {categories.map((category) => (

              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 p-5"
              >

                <div className="flex items-center gap-5">

                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-gray-100">

                    {category.image_url ? (

                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />

                    ) : (

                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No Image
                      </div>

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-medium text-black">
                      {category.name}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      /{category.slug}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      {category.show_on_homepage && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          Homepage
                        </span>
                      )}

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Sort: {category.sort_order}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="flex gap-3">

                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="rounded-lg border border-gray-300 px-5 py-2 transition hover:bg-gray-100"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteCategory(category)}
                    className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </AdminLayout>
  );
}