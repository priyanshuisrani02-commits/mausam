"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  getActiveBanner,
  saveBanner,
  updateBanner,
  deleteBanner,
} from "@/lib/banner-service";

import { uploadBanner } from "@/lib/upload-banner";

type FeaturedBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  button_text: string;
  button_link: string | null;
  image_url: string;
  active: boolean;
  created_at?: string;
};

export default function EditFeaturedBannerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [bannerId, setBannerId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      try {
        const banner =
          (await getActiveBanner()) as FeaturedBanner | null;

        if (banner) {
          setBannerId(banner.id);
          setTitle(banner.title);
          setDescription(banner.description);
          setButtonText(banner.button_text);
          setButtonLink(banner.button_link ?? "");
          setImageUrl(banner.image_url);
          setActive(banner.active);
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load banner.");
      } finally {
        setLoading(false);
      }
    }

    loadBanner();
  }, []);

  async function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const url = await uploadBanner(file);

      setImageUrl(url);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    if (!description.trim()) {
      alert("Description is required.");
      return;
    }

    if (!buttonText.trim()) {
      alert("Button text is required.");
      return;
    }

    if (!imageUrl) {
      alert("Please upload an image.");
      return;
    }

    try {
      setSaving(true);

      if (bannerId) {
        await updateBanner(bannerId, {
          title,
          description,
          buttonText,
          buttonLink,
          imageUrl,
          active,
        });
      } else {
        await saveBanner({
          title,
          description,
          buttonText,
          buttonLink,
          imageUrl,
          active,
        });
      }

      router.push("/admin/homepage/featured-banner");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save banner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!bannerId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    try {
      await deleteBanner(bannerId);

      router.push("/admin/homepage/featured-banner");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete banner.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">
          {bannerId ? "Edit Banner" : "Create Banner"}
        </h1>

        <p className="mt-2 text-stone-600">
          Manage the homepage featured banner.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-stone-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium text-stone-700">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-stone-700">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-stone-700">
            Button Text
          </label>

          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-stone-700">
            Button Link
          </label>

          <input
            type="text"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-black"
            placeholder="/collections"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-stone-700">
            Banner Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full rounded-lg border border-stone-300 px-4 py-3"
          />

          {uploading && (
            <p className="mt-3 text-sm text-stone-500">
              Uploading image...
            </p>
          )}

          {imageUrl && (
            <div className="relative mt-6 h-64 overflow-hidden rounded-lg border border-stone-200">
              <Image
                src={imageUrl}
                alt="Banner Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-5 w-5"
          />

          <label
            htmlFor="active"
            className="font-medium text-stone-700"
          >
            Active Banner
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {bannerId && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
            >
              Delete Banner
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/homepage/featured-banner"
              )
            }
            className="rounded-lg border border-stone-300 px-6 py-3 font-medium hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}