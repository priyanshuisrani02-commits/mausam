"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveHeroSlide } from "@/lib/admin-hero";
import { uploadHeroImage } from "@/lib/upload-hero-image";

export default function NewHeroSlidePage() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      setSaving(true);

      const imageUrl = await uploadHeroImage(image);

      await saveHeroSlide({
        imageUrl,
        link,
        sortOrder,
        active,
      });

      alert("Hero slide created.");

      router.push("/admin/homepage/hero-slider");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create hero slide:", err);

      alert(
        err?.message || "Failed to create hero slide."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light">
          Add Hero Slide
        </h1>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Slide"}
        </button>
      </div>

      <div className="rounded-[32px] bg-white p-10 shadow">
        <div className="grid gap-8">
          <div>
            <label className="mb-2 block font-medium">
              Hero Image
            </label>

            {preview && (
              <img
                src={preview}
                alt="Hero slide preview"
                className="mb-5 h-64 w-full rounded-2xl object-cover"
              />
            )}

            <input
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-gray-300 bg-white p-4"
              onChange={(e) => {
                if (!e.target.files?.length) return;

                const file = e.target.files[0];

                setImage(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Link
            </label>

            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/categories/sarees"
              className="w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Sort Order
            </label>

            <input
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(Number(e.target.value))
              }
              className="w-full rounded-xl border border-gray-300 bg-white p-4 text-black"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) =>
                setActive(e.target.checked)
              }
            />

            Active Slide
          </label>
        </div>
      </div>
    </>
  );
}