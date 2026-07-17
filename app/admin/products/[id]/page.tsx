"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProductById,
  updateProduct,
  type AdminProduct,
} from "@/lib/admin-products";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState<AdminProduct | null>(null);

  useEffect(() => {
    const found = getProductById(
      params.id as string
    );

    if (found) {
      setProduct(found);
    }
  }, [params.id]);

  function handleSave() {
    if (!product) return;

    updateProduct(product);

    alert("Product Updated!");

    router.push("/admin/products");
  }

  if (!product) {
    return (
      <main className="p-10 text-black">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 p-10 text-black">

      <div className="mb-10 flex items-center justify-between">

        <h1 className="text-5xl font-light">
          Edit Product
        </h1>

        <Link
          href="/admin/products"
          className="rounded-full border border-black px-6 py-3"
        >
          Back
        </Link>

      </div>

      <div className="rounded-[32px] bg-white p-10 shadow">

        <div className="grid gap-6">

          <input
            type="text"
            value={product.name}
            onChange={(e) =>
              setProduct({
                ...product,
                name: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <input
            type="text"
            value={product.slug}
            onChange={(e) =>
              setProduct({
                ...product,
                slug: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <input
            type="text"
            value={product.price}
            onChange={(e) =>
              setProduct({
                ...product,
                price: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <input
            type="text"
            value={product.category}
            onChange={(e) =>
              setProduct({
                ...product,
                category: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <input
            type="text"
            value={product.image}
            onChange={(e) =>
              setProduct({
                ...product,
                image: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <input
            type="number"
            value={product.stock}
            onChange={(e) =>
              setProduct({
                ...product,
                stock: Number(e.target.value),
              })
            }
            className="rounded-xl border p-4"
          />

          <textarea
            rows={6}
            value={product.description}
            onChange={(e) =>
              setProduct({
                ...product,
                description: e.target.value,
              })
            }
            className="rounded-xl border p-4"
          />

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={product.featured}
              onChange={(e) =>
                setProduct({
                  ...product,
                  featured: e.target.checked,
                })
              }
            />

            Featured Product

          </label>

          <button
            onClick={handleSave}
            className="rounded-full bg-black py-4 text-white"
          >
            Save Changes
          </button>

        </div>

      </div>

    </main>
  );
}