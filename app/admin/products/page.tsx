"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  track_inventory: boolean | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((data ?? []) as Product[]);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function getInventoryStatus(product: Product) {
    if (!product.track_inventory) {
      return {
        label: "Not Tracked",
        className: "bg-gray-100 text-gray-700",
      };
    }

    const stock = product.stock_quantity ?? 0;
    const threshold = product.low_stock_threshold ?? 5;

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (stock <= threshold) {
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    };
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light">
          Products
        </h1>

        <Link
          href="/admin/products/new"
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-6 text-left">
                Product
              </th>

              <th className="p-6 text-left">
                Price
              </th>

              <th className="p-6 text-left">
                Stock
              </th>

              <th className="p-6 text-left">
                Status
              </th>

              <th className="p-6 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const status = getInventoryStatus(product);

                return (
                  <tr
                    key={product.id}
                    className="border-b"
                  >
                    <td className="p-6">
                      {product.name}
                    </td>

                    <td className="p-6">
                      ₹{product.price}
                    </td>

                    <td className="p-6">
                      {product.track_inventory
                        ? (product.stock_quantity ?? 0)
                        : "—"}
                    </td>

                    <td className="p-6">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="p-6">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="rounded-full border px-4 py-2"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="rounded-full border border-red-500 px-4 py-2 text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}