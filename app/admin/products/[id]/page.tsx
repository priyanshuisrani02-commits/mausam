"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductById, updateProduct, type AdminProduct } from "@/lib/admin-products";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProduct() {
      setLoading(true);
      try {
        const found = await getProductById(params.id as string);
        if (!cancelled) setProduct(found);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProduct();
    return () => { cancelled = true; };
  }, [params.id]);

  async function handleSave() {
    if (!product || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProduct(product);
      alert("Product updated successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="p-10 text-black">Loading...</main>;

  if (!product) {
    return (
      <main className="p-10 text-black">
        <p className="mb-4">Product not found.</p>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <Link href="/admin/products" className="underline">Back to products</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 p-10 text-black">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light">Edit Product</h1>
        <Link href="/admin/products" className="rounded-full border border-black px-6 py-3">Back</Link>
      </div>
      <div className="rounded-[32px] bg-white p-10 shadow">
        <div className="grid gap-6">
          {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
          <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="rounded-xl border p-4" placeholder="Product name" />
          <input type="text" value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="rounded-xl border p-4" placeholder="Slug" />
          <input type="number" min="0" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="rounded-xl border p-4" placeholder="Price" />
          <input type="number" min="0" value={product.sale_price ?? ""} onChange={(e) => setProduct({ ...product, sale_price: e.target.value })} className="rounded-xl border p-4" placeholder="Sale price (optional)" />
          <input type="text" value={product.category} readOnly className="rounded-xl border bg-gray-50 p-4" placeholder="Category" />
          <input type="text" value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} className="rounded-xl border p-4" placeholder="Primary image URL" />
          <input type="number" min="0" value={product.stock_quantity ?? product.stock} onChange={(e) => { const stock = Number(e.target.value); setProduct({ ...product, stock, stock_quantity: stock }); }} className="rounded-xl border p-4" placeholder="Stock" />
          <textarea rows={6} value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="rounded-xl border p-4" placeholder="Description" />
          <label className="flex items-center gap-3"><input type="checkbox" checked={product.featured} onChange={(e) => setProduct({ ...product, featured: e.target.checked })} /> Featured Product</label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={product.new_arrival ?? false} onChange={(e) => setProduct({ ...product, new_arrival: e.target.checked })} /> New Arrival</label>
          <button onClick={handleSave} disabled={saving} className="rounded-full bg-black py-4 text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </main>
  );
}
