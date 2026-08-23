"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createHomepagePrint,
  deleteHomepagePrint,
  getHomepagePrints,
  updateHomepagePrint,
  uploadHomepagePrintImage,
  type HomepagePrint,
} from "@/lib/homepage-prints";

const emptyForm = { title: "", description: "", image_url: "", link: "", sort_order: 0, active: true };
type FormState = typeof emptyForm;

export default function HomepagePrintsAdminPage() {
  const [items, setItems] = useState<HomepagePrint[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setItems(await getHomepagePrints({ includeInactive: true }));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to load prints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function edit(item: HomepagePrint) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description ?? "", image_url: item.image_url, link: item.link ?? "", sort_order: item.sort_order, active: item.active });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return alert("Please enter a title.");
    if (!form.image_url.trim() && !file) return alert("Please add an image.");

    try {
      setSaving(true);
      let imageUrl = form.image_url.trim();
      if (file) imageUrl = await uploadHomepagePrintImage(file);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: imageUrl,
        link: form.link.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        active: form.active,
      };

      if (editingId) await updateHomepagePrint(editingId, payload);
      else await createHomepagePrint(payload);

      reset();
      await load();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to save print.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this print/design from the carousel?")) return;
    try {
      await deleteHomepagePrint(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) reset();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete print.");
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[3px] text-stone-500">Homepage / Craft story</p>
          <h1 className="mt-2 text-4xl font-light text-stone-900">Prints &amp; Designs</h1>
          <p className="mt-2 max-w-2xl text-stone-600">Manage the circular MAUSAM carousel shown immediately below the hero. Add prints, embroidery details, textures, motifs and other design stories.</p>
        </div>
        <Link href="/admin/homepage" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm hover:bg-white">← Homepage</Link>
      </div>

      <form onSubmit={save} className="mb-10 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-medium text-stone-900">{editingId ? "Edit design" : "Add design"}</h2>
          {editingId && <button type="button" onClick={reset} className="text-sm text-stone-500 underline">Cancel edit</button>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className="text-sm font-medium text-stone-700">Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hand-block florals" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600" /></label>
          <label className="block"><span className="text-sm font-medium text-stone-700">Link (optional)</span><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/categories/kurtis" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600" /></label>
          <label className="block md:col-span-2"><span className="text-sm font-medium text-stone-700">Description (optional)</span><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Fine floral motifs inspired by summer gardens." className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600" /></label>
          <label className="block md:col-span-2"><span className="text-sm font-medium text-stone-700">Image URL</span><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600" /></label>
          <label className="block md:col-span-2"><span className="text-sm font-medium text-stone-700">Or upload an image</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-stone-300 p-3 text-sm" /></label>
          <label className="block"><span className="text-sm font-medium text-stone-700">Sort order</span><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3" /></label>
          <label className="flex items-center gap-3 self-end pb-3"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4" /><span className="text-sm text-stone-700">Visible on homepage</span></label>
        </div>

        <button disabled={saving} className="mt-7 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save changes" : "Add design"}</button>
      </form>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-medium text-stone-900">Carousel items</h2><span className="text-sm text-stone-500">{items.length} total</span></div>
        {loading ? <p className="py-10 text-center text-stone-500">Loading...</p> : items.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">No prints yet. Add your first design above.</p> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                <div className="relative aspect-square bg-stone-100"><Image src={item.image_url} alt={item.title} fill unoptimized className="object-cover" /></div>
                <div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-medium text-stone-900">{item.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] ${item.active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}>{item.active ? "Live" : "Hidden"}</span></div><p className="mt-1 text-xs text-stone-500">Order {item.sort_order}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => edit(item)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-white">Edit</button><button type="button" onClick={() => remove(item.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">Delete</button></div></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
