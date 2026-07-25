"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import { uploadProductImages } from "@/lib/upload-product-images";

type Category = {
  id: string;
  name: string;
};

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string"
      ? params.id
      : params.id?.[0] ?? "";

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [productName, setProductName] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [salePrice, setSalePrice] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [featured, setFeatured] =
    useState(false);

  const [newArrival, setNewArrival] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [productImages, setProductImages] =
    useState<ProductImage[]>([]);

  const [newImages, setNewImages] =
    useState<File[]>([]);

  useEffect(() => {
    if (!productId) return;

    loadPage();
  }, [productId]);

  async function loadPage() {
    try {
      setLoading(true);

      await Promise.all([
        loadCategories(),
        loadProduct(),
        loadImages(),
      ]);
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const { data, error } =
      await supabase
        .from("categories")
        .select("id,name")
        .order("name");

    if (error) {
      throw error;
    }

    setCategories(data ?? []);
  }

  async function loadProduct() {
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

    if (error) {
      throw error;
    }

    setProductName(data.name ?? "");

    setPrice(
      data.price !== null &&
        data.price !== undefined
        ? String(data.price)
        : ""
    );

    setSalePrice(
      data.sale_price !== null &&
        data.sale_price !== undefined
        ? String(data.sale_price)
        : ""
    );

    setSku(data.sku ?? "");

    setStock(
      data.stock !== null &&
        data.stock !== undefined
        ? String(data.stock)
        : ""
    );

    setCategoryId(
      data.category_id ?? ""
    );

    setFeatured(
      Boolean(data.featured)
    );

    setNewArrival(
      Boolean(data.new_arrival)
    );
  }

  async function loadImages() {
    const { data, error } =
      await supabase
        .from("product_images")
        .select(
          "id,image_url,sort_order"
        )
        .eq("product_id", productId)
        .order("sort_order", {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    setProductImages(data ?? []);
  }

  async function handleSave() {
    if (!productName.trim()) {
      alert(
        "Please enter a product name."
      );
      return;
    }

    if (!categoryId) {
      alert(
        "Please select a category."
      );
      return;
    }

    if (!price) {
      alert(
        "Please enter a price."
      );
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await supabase
          .from("products")
          .update({
            name: productName.trim(),
            category_id: categoryId,
            price: Number(price),
            sale_price: salePrice
              ? Number(salePrice)
              : null,
            sku: sku.trim(),
            stock: Number(stock || 0),
            featured,
            new_arrival: newArrival,
          })
          .eq("id", productId);

      if (error) {
        throw error;
      }

      alert("Product Updated!");

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImages() {
    if (newImages.length === 0) {
      alert(
        "Please select at least one image."
      );
      return;
    }

    try {
      setUploading(true);

      await uploadProductImages(
        productId,
        newImages
      );

      setNewImages([]);

      await loadImages();

      alert("Images uploaded!");
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to upload images."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(
    image: ProductImage
  ) {
    const confirmed =
      window.confirm(
        "Delete this product image?"
      );

    if (!confirmed) return;

    try {
      const { error } =
        await supabase
          .from("product_images")
          .delete()
          .eq("id", image.id);

      if (error) {
        throw error;
      }

      const remainingImages =
        productImages.filter(
          (item) =>
            item.id !== image.id
        );

      await saveImageOrder(
        remainingImages
      );

      await loadImages();
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to delete image."
      );
    }
  }

  async function moveImage(
    index: number,
    direction: "left" | "right"
  ) {
    const targetIndex =
      direction === "left"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        productImages.length
    ) {
      return;
    }

    const reordered = [
      ...productImages,
    ];

    const current =
      reordered[index];

    reordered[index] =
      reordered[targetIndex];

    reordered[targetIndex] =
      current;

    setProductImages(
      reordered.map(
        (image, imageIndex) => ({
          ...image,
          sort_order: imageIndex,
        })
      )
    );

    try {
      await saveImageOrder(
        reordered
      );

      await loadImages();
    } catch (err: any) {
      await loadImages();

      alert(
        err.message ||
          "Unable to reorder images."
      );
    }
  }

  async function makeMainImage(
    index: number
  ) {
    if (index === 0) return;

    const reordered = [
      ...productImages,
    ];

    const [selectedImage] =
      reordered.splice(index, 1);

    reordered.unshift(
      selectedImage
    );

    setProductImages(
      reordered.map(
        (image, imageIndex) => ({
          ...image,
          sort_order: imageIndex,
        })
      )
    );

    try {
      await saveImageOrder(
        reordered
      );

      await loadImages();
    } catch (err: any) {
      await loadImages();

      alert(
        err.message ||
          "Unable to change main image."
      );
    }
  }

  async function saveImageOrder(
    images: ProductImage[]
  ) {
    for (
      let index = 0;
      index < images.length;
      index++
    ) {
      const { error } =
        await supabase
          .from("product_images")
          .update({
            sort_order: index,
          })
          .eq(
            "id",
            images[index].id
          );

      if (error) {
        throw error;
      }
    }
  }

  function removeSelectedImage(
    index: number
  ) {
    setNewImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading product...
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">

        <h1 className="text-4xl font-light md:text-5xl">
          Edit Product
        </h1>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

      <div className="space-y-8">

        {/* PRODUCT DETAILS */}

        <div className="rounded-[32px] bg-white p-6 shadow md:p-10">

          <h2 className="mb-8 text-2xl font-medium">
            Product Details
          </h2>

          <div className="grid gap-6">

            <div>
              <label className="mb-2 block font-medium">
                Product Name
              </label>

              <input
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border p-4 text-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border bg-white p-4 text-black"
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium">
                  Price
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border p-4 text-black"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Sale Price
                </label>

                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border p-4 text-black"
                />
              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium">
                  SKU
                </label>

                <input
                  value={sku}
                  onChange={(e) =>
                    setSku(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border p-4 text-black"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Stock
                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border p-4 text-black"
                />
              </div>

            </div>

            <div className="flex flex-wrap gap-8">

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) =>
                    setFeatured(
                      e.target.checked
                    )
                  }
                />

                Featured Product
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) =>
                    setNewArrival(
                      e.target.checked
                    )
                  }
                />

                New Arrival
              </label>

            </div>

          </div>
        </div>

        {/* EXISTING IMAGES */}

        <div className="rounded-[32px] bg-white p-6 shadow md:p-10">

          <div className="mb-8">

            <h2 className="text-2xl font-medium">
              Product Images
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              The first image is the main
              product image. Use the controls
              to reorder your images.
            </p>

          </div>

          {productImages.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">
              No product images uploaded yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {productImages.map(
                (image, index) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border bg-white"
                  >

                    <div className="relative">

                      <img
                        src={
                          image.image_url
                        }
                        alt={`Product image ${
                          index + 1
                        }`}
                        className="aspect-[4/5] w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                          MAIN
                        </span>
                      )}

                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs">
                        {index + 1}
                      </span>

                    </div>

                    <div className="space-y-3 p-4">

                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            makeMainImage(
                              index
                            )
                          }
                          className="w-full rounded-full border px-4 py-2 text-sm transition hover:bg-gray-50"
                        >
                          Make Main
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          disabled={
                            index === 0
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              "left"
                            )
                          }
                          className="rounded-full border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ← Left
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            productImages.length -
                              1
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              "right"
                            )
                          }
                          className="rounded-full border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Right →
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteImage(
                            image
                          )
                        }
                        className="w-full rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        Delete Image
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* UPLOAD MORE */}

        <div className="rounded-[32px] bg-white p-6 shadow md:p-10">

          <h2 className="text-2xl font-medium">
            Add More Images
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You can select multiple images at
            once.
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            className="mt-6 w-full rounded-xl border p-4"
            onChange={(e) => {
              if (!e.target.files) {
                return;
              }

              setNewImages(
                Array.from(
                  e.target.files
                )
              );

              e.target.value = "";
            }}
          />

          {newImages.length > 0 && (
            <div className="mt-6">

              <p className="mb-4 font-medium">
                Ready to upload (
                {newImages.length})
              </p>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                {newImages.map(
                  (image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="overflow-hidden rounded-2xl border"
                    >

                      <img
                        src={URL.createObjectURL(
                          image
                        )}
                        alt={`New image ${
                          index + 1
                        }`}
                        className="aspect-[4/5] w-full object-cover"
                      />

                      <div className="p-3">

                        <p className="truncate text-sm">
                          {image.name}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeSelectedImage(
                              index
                            )
                          }
                          className="mt-3 w-full rounded-full border px-3 py-2 text-sm"
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

              <button
                type="button"
                onClick={
                  handleUploadImages
                }
                disabled={uploading}
                className="mt-6 rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${newImages.length} Image${
                      newImages.length ===
                      1
                        ? ""
                        : "s"
                    }`}
              </button>

            </div>
          )}

        </div>

      </div>
    </>
  );
}