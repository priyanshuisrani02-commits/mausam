"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  createHomepageBenefit,
  deleteHomepageBenefit,
  getHomepageBenefits,
  updateHomepageBenefit,
  type HomepageBenefit,
} from "@/lib/homepage-benefits";

const emptyForm = {
  title: "",
  description: "",
  sort_order: 0,
  active: true,
};

type FormState = typeof emptyForm;

export default function HomepageBenefitsAdminPage() {
  const [items, setItems] = useState<HomepageBenefit[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setItems(await getHomepageBenefits({ includeInactive: true }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load benefits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(item: HomepageBenefit) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
      active: item.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return alert("Please enter a title.");

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        sort_order: Number(form.sort_order) || 0,
        active: form.active,
      };

      if (editingId) await updateHomepageBenefit(editingId, payload);
      else await createHomepageBenefit(payload);

      reset();
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save benefit.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this homepage benefit?")) return;
    try {
      await deleteHomepageBenefit(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) reset();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete benefit.");
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[3px] text-stone-500">Homepage / Benefits</p>
          <h1 className="mt-2 text-4xl font-light text-stone-900">Benefits Bar</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Manage the trust and service messages shown near the bottom of the homepage. Everything is stored in Supabase.
          </p>
        </div>
        <Link href="/admin/homepage" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm hover:bg-white">
          ← Homepage
        </Link>
      </div>

      <form onSubmit={save} className="mb-10 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-medium text-stone-900">{editingId ? "Edit benefit" : "Add benefit"}</h2>
          {editingId && (
            <button type="button" onClick={reset} className="text-sm text-stone-500 underline">
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Complimentary Shipping"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Sort order</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-stone-700">Description</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="On orders above ₹2,500"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-600"
            />
          </label>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm text-stone-700">Visible on homepage</span>
          </label>
        </div>

        <button
          disabled={saving}
          className="mt-7 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : editingId ? "Save changes" : "Add benefit"}
        </button>
      </form>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-stone-900">Homepage benefits</h2>
          <span className="text-sm text-stone-500">{items.length} total</span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-stone-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
            No benefits yet. Add your first one above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-stone-900">{item.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-[10px] ${item.active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}>
                    {item.active ? "Live" : "Hidden"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">{item.description}</p>
                <p className="mt-3 text-[11px] text-stone-400">Order {item.sort_order}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => edit(item)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-white">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(item.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
