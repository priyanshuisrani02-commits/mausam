"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import { uploadCategoryImage } from "@/lib/upload-category-image";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  show_on_homepage: boolean;
  sort_order: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [showOnHomepage, setShowOnHomepage] =
    useState(true);

  const [sortOrder, setSortOrder] =
    useState(0);

  useEffect(() => {
    loadCategory();
  }, []);

  async function loadCategory() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Category not found.");
      router.push("/admin/categories");
      return;
    }

    setName(data.name);
    setSlug(data.slug);
    setPreview(data.image_url || "");
    setShowOnHomepage(data.show_on_homepage);
    setSortOrder(data.sort_order ?? 0);

    setLoading(false);
  }

  async function handleSave() {
    if (!name.trim() || !slug.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const supabase = createClient();
      let imageUrl = preview;

      if (image) {
        imageUrl = await uploadCategoryImage(image);
      }

      const { error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
          slug: slug.trim(),
          image_url: imageUrl,
          show_on_homepage: showOnHomepage,
          sort_order: sortOrder,
        })
        .eq("id", id);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Category updated successfully.");

      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-lg">
        Loading category...
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-10 text-5xl font-light">
        Edit Category
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
          className="mb-6 w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
          placeholder="Category name"
        />

        <label className="mb-2 block font-medium">
          URL Slug
        </label>

        <input
          value={slug}
          onChange={(e) =>
            setSlug(slugify(e.target.value))
          }
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
              alt="Category Preview"
              width={800}
              height={500}
              className="h-72 w-full rounded-2xl border object-cover"
            />
          </div>
        )}

        <label className="mb-6 flex items-center gap-3">
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

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Category"}
          </button>

          <button
            onClick={() =>
              router.push("/admin/categories")
            }
            className="rounded-full border border-gray-300 px-8 py-3 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}