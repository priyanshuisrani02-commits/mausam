"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "@/components/admin/AdminLayout";

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

      console.log("Uploading image...");

const imageUrl = await uploadHeroImage(image);

console.log("Image uploaded:", imageUrl);

console.log("Saving to database...");

await saveHeroSlide({
  imageUrl,
  link,
  sortOrder,
  active,
});

console.log("Database save complete.");

      alert("Hero slide created.");

      router.push("/admin/homepage/hero-slider");
      router.refresh();
    } catch (err: any) {
  console.log("Full error:", err);
  console.log("Message:", err.message);
  console.log("Details:", err.details);
  console.log("Hint:", err.hint);
  console.log("Code:", err.code);

  alert(JSON.stringify(err, null, 2));
} finally {
  setSaving(false);
}
  }

  return (
    <AdminLayout>
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
                alt=""
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
              className="w-full rounded-xl border border-gray-300 bg-white p-4"
              style={{ color: "black" }}
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
              className="w-full rounded-xl border border-gray-300 bg-white p-4"
              style={{ color: "black" }}
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
    </AdminLayout>
  );
}