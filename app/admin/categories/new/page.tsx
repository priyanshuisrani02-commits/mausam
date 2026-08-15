"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import { uploadCategoryImage } from "@/lib/upload-category-image";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !slug.trim()) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      const supabase = createClient();
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadCategoryImage(image);
      }

      const { error } = await supabase.from("categories").insert([
        {
          name: name.trim(),
          slug: slug.trim(),
          image_url: imageUrl,
          show_on_homepage: showOnHomepage,
          sort_order: sortOrder,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Category saved successfully!");

      router.push("/admin/categories");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="mb-10 text-5xl font-light">
        Add Category
      </h1>

      <div className="rounded-[32px] bg-white p-10 shadow">
        <label className="mb-2 block font-medium">
          Category Name
        </label>

        <input
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            setSlug(slugify(value));
          }}
          placeholder="Dresses"
          className="mb-6 w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
        />

        <label className="mb-2 block font-medium">
          URL Slug
        </label>

        <input
          value={slug}
          onChange={(e) =>
            setSlug(slugify(e.target.value))
          }
          placeholder="dresses"
          className="mb-6 w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
        />

        <label className="mb-2 block font-medium">
          Category Image
        </label>

        <input
          type="file"
          accept="image/*"
          className="mb-6 w-full rounded-xl border border-gray-300 bg-white p-4"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        {preview && (
          <div className="mb-6">
            <Image
              src={preview}
              alt="Preview"
              width={500}
              height={300}
              className="h-64 w-full rounded-2xl border object-cover"
            />
          </div>
        )}

        <label className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={showOnHomepage}
            onChange={(e) =>
              setShowOnHomepage(e.target.checked)
            }
          />

          Show on Homepage
        </label>

        <label className="mb-2 block font-medium">
          Sort Order
        </label>

        <input
          type="number"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(Number(e.target.value))
          }
          className="mb-8 w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Category"}
        </button>
      </div>
    </>
  );
}