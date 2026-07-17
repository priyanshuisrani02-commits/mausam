"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
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

    setProducts(data || []);
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

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light">Products</h1>

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
              <th className="p-6 text-left">Product</th>
              <th className="p-6 text-left">Price</th>
              <th className="p-6 text-left">Stock</th>
              <th className="p-6 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>

            ) : (

              products.map((product) => (

                <tr
                  key={product.id}
                  className="border-b"
                >
                  <td className="p-6">{product.name}</td>

                  <td className="p-6">
                    ₹{product.price}
                  </td>

                  <td className="p-6">
                    {product.stock}
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
    onClick={() => handleDelete(product.id)}
    className="rounded-full border border-red-500 px-4 py-2 text-red-500"
  >
    Delete
  </button>

</div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>
      </div>
    </AdminLayout>
  );
}