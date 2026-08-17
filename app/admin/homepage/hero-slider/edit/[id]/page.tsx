"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import {
  getHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  type HeroSlide,
} from "@/lib/admin-hero";
import { uploadHeroImage } from "@/lib/upload-hero-image";

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadSlide() {
      try {
        setLoading(true);
        const data = await getHeroSlide(id);

        if (!data) {
          alert("Hero slide not found.");
          router.replace("/admin/homepage/hero-slider");
          return;
        }

        setSlide(data);
        setImageUrl(data.image_url);
        setLink(data.link ?? "");
        setSortOrder(data.sort_order);
        setActive(data.active);
      } catch (error) {
        console.error("Failed to load hero slide:", error);
        alert("Failed to load hero slide.");
        router.replace("/admin/homepage/hero-slider");
      } finally {
        setLoading(false);
      }
    }

    loadSlide();
  }, [id, router]);

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadHeroImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error("Failed to upload hero image:", error);
      alert("Failed to upload hero image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) return;

    if (!imageUrl) {
      alert("Please upload a hero image.");
      return;
    }

    if (sortOrder < 1) {
      alert("Sort order must be 1 or greater.");
      return;
    }

    try {
      setSaving(true);

      await updateHeroSlide(id, {
        imageUrl,
        link: link.trim(),
        sortOrder,
        active,
      });

      alert("Hero slide updated successfully.");
      router.push("/admin/homepage/hero-slider");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update hero slide:", error);
      alert(error?.message || "Failed to update hero slide.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !slide) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this hero slide? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteHeroSlide(id);
      router.push("/admin/homepage/hero-slider");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete hero slide:", error);
      alert(error?.message || "Failed to delete hero slide.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500 shadow-sm">
        Loading hero slide...
      </div>
    );
  }

  if (!slide) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
            Homepage / Hero Slider
          </p>
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            Edit Hero Slide
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Update the image, destination, display order, or visibility of this hero slide.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/homepage/hero-slider")}
          className="w-fit rounded-lg border border-stone-300 px-5 py-3 font-medium text-stone-800 transition hover:bg-stone-100"
        >
          Back to Hero Slider
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
      >
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-stone-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  Hero Image
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Use a high-resolution image suitable for the homepage hero.
                </p>
              </div>

              {active ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                  Inactive
                </span>
              )}
            </div>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Hero slide preview"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">
                  No image selected
                </div>
              )}
            </div>

            <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center transition hover:border-stone-500 hover:bg-stone-100">
              <span className="block font-medium text-stone-900">
                {uploading ? "Uploading image..." : "Replace hero image"}
              </span>
              <span className="mt-1 block text-sm text-stone-500">
                PNG, JPG, WEBP or other supported image formats
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || saving}
                className="sr-only"
              />
            </label>
          </div>

          <div className="p-6 lg:p-8">
            <div className="space-y-7">
              <div>
                <label className="mb-2 block font-medium text-stone-800">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="/categories/kurtis"
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Where visitors should go when they click this hero slide.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-medium text-stone-800">
                  Sort Order
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Lower numbers appear earlier in the hero slider.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="active"
                    type="checkbox"
                    checked={active}
                    onChange={(event) => setActive(event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-stone-300"
                  />
                  <span>
                    <span className="block font-medium text-stone-900">
                      Active Slide
                    </span>
                    <span className="mt-1 block text-sm text-stone-500">
                      Active slides can be displayed on the public homepage.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/homepage/hero-slider")}
                  disabled={saving || deleting}
                  className="rounded-lg border border-stone-300 px-6 py-3 font-medium text-stone-800 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                  className="w-full rounded-lg border border-red-200 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting Slide..." : "Delete Hero Slide"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
