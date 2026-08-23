"use client";

import { useEffect, useState } from "react";
import {
  createHomepageBenefit,
  deleteHomepageBenefit,
  getHomepageBenefits,
  updateHomepageBenefit,
  type HomepageBenefit,
} from "@/lib/homepage-benefits";

export default function HomepageSectionsPage() {
  const [items, setItems] = useState<HomepageBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    try {
      setLoading(true);
      setItems(await getHomepageBenefits({ includeInactive: true }));
    } catch (error) {
      console.error(error);
      alert("Unable to load homepage benefits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addBenefit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSaving(true);
      await createHomepageBenefit({
        title: title.trim(),
        description: description.trim(),
        sort_order: items.length + 1,
        active: true,
      });
      setTitle("");
      setDescription("");
      await load();
    } catch (error: any) {
      alert(error?.message || "Unable to add benefit.");
    } finally {
      setSaving(false);
    }
  }

  async function editBenefit(item: HomepageBenefit) {
    const nextTitle = window.prompt("Benefit title", item.title);
    if (nextTitle === null) return;
    const nextDescription = window.prompt("Benefit description", item.description);
    if (nextDescription === null) return;

    try {
      await updateHomepageBenefit(item.id, {
        title: nextTitle.trim(),
        description: nextDescription.trim(),
      });
      await load();
    } catch (error: any) {
      alert(error?.message || "Unable to update benefit.");
    }
  }

  async function toggleBenefit(item: HomepageBenefit) {
    try {
      await updateHomepageBenefit(item.id, { active: !item.active });
      await load();
    } catch (error: any) {
      alert(error?.message || "Unable to update benefit.");
    }
  }

  async function removeBenefit(item: HomepageBenefit) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try {
      await deleteHomepageBenefit(item.id);
      await load();
    } catch (error: any) {
      alert(error?.message || "Unable to delete benefit.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Homepage Management</p>
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">Homepage Sections</h1>
        <p className="mt-2 max-w-2xl text-stone-600">Manage the service-benefit strip shown near the bottom of the MAUSAM homepage.</p>
      </div>

      <form onSubmit={addBenefit} className="mb-8 grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1.5fr_auto] md:items-end">
        <label className="text-sm font-medium text-stone-700">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-stone-500" placeholder="Free shipping" />
        </label>
        <label className="text-sm font-medium text-stone-700">
          Description
          <input value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-stone-500" placeholder="On orders above ₹1999" />
        </label>
        <button disabled={saving} className="rounded-lg bg-black px-5 py-2.5 font-medium text-white disabled:opacity-50">{saving ? "Adding..." : "Add"}</button>
      </form>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        {loading ? (
          <p className="py-10 text-center text-stone-500">Loading homepage sections...</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-stone-500">No homepage benefits configured.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-stone-900">{item.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${item.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{item.active ? "Active" : "Hidden"}</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => editBenefit(item)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium">Edit</button>
                  <button onClick={() => toggleBenefit(item)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium">{item.active ? "Hide" : "Show"}</button>
                  <button onClick={() => removeBenefit(item)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
