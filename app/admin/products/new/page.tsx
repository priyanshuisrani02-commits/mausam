"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadProductImages } from "@/lib/upload-product-images";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export default function NewProductPage() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
const [trackInventory, setTrackInventory] = useState(true);

const [stockQuantity, setStockQuantity] = useState("0");

const [lowStockThreshold, setLowStockThreshold] =
  useState("5");

  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [fit, setFit] = useState("");
  const [pattern, setPattern] = useState("");
  const [neckline, setNeckline] = useState("");
  const [sleeves, setSleeves] = useState("");
  const [occasion, setOccasion] = useState("");
  const [careInstructions, setCareInstructions] = useState("");

  const [availableSizes, setAvailableSizes] =
    useState<string[]>([]);

  const [sizeFitNote, setSizeFitNote] =
    useState("");

  const [modelSize, setModelSize] =
    useState("");

  const [images, setImages] = useState<File[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);

  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id,name")
        .order("name");

      if (data) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  function removeImage(index: number) {
    setImages((current) =>
      current.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  }

  function moveImage(
    index: number,
    direction: "left" | "right"
  ) {
    const targetIndex =
      direction === "left"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= images.length
    ) {
      return;
    }

    const reordered = [...images];

    const currentImage = reordered[index];

    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = currentImage;

    setImages(reordered);
  }

  function makeMainImage(index: number) {
    if (index === 0) return;

    const reordered = [...images];

    const [selectedImage] =
      reordered.splice(index, 1);

    reordered.unshift(selectedImage);

    setImages(reordered);
  }

  const sizeOptions = ["XS", "S", "M", "L", "XL"];

  function toggleSize(size: string) {
    setAvailableSizes((current) =>
      current.includes(size)
        ? current.filter(
            (currentSize) =>
              currentSize !== size
          )
        : [...current, size]
    );
  }

  async function handleSave() {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!categoryId) {
      alert("Please select a category.");
      return;
    }

    if (!price) {
      alert("Please enter a price.");
      return;
    }

    if (images.length === 0) {
      alert("Please add at least one product image.");
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: productName.trim(),
            category_id: categoryId,
            price: Number(price),

            sale_price: salePrice
              ? Number(salePrice)
              : null,

            sku: sku.trim(),
           stock: Number(stockQuantity || 0),

stock_quantity: Number(stockQuantity || 0),

low_stock_threshold: Number(
  lowStockThreshold || 5
),

track_inventory: trackInventory,

            description:
              description.trim() || null,

            material:
              material.trim() || null,

            fit:
              fit.trim() || null,

            pattern:
              pattern.trim() || null,

            neckline:
              neckline.trim() || null,

            sleeves:
              sleeves.trim() || null,

            occasion:
              occasion.trim() || null,

            care_instructions:
              careInstructions.trim() || null,

            available_sizes:
              availableSizes.length > 0
                ? availableSizes
                : null,

            size_fit_note:
              sizeFitNote.trim() || null,

            model_size:
              modelSize.trim() || null,

            featured,
            new_arrival: newArrival,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await uploadProductImages(
        data.id,
        images
      );

      alert("Product Saved!");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white p-4 text-black";

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-light md:text-5xl">
          Add Product
        </h1>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Product"}
        </button>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow md:p-10">
        <div className="grid gap-6">

          {/* BASIC INFORMATION */}

          <div>
            <label className="mb-2 block font-medium">
              Product Name
            </label>

            <input
              value={productName}
              onChange={(e) =>
                setProductName(e.target.value)
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value)
              }
              className={inputClass}
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGES */}

          <div>
            <label className="mb-2 block font-medium">
              Product Images
            </label>

            <p className="mb-4 text-sm text-gray-500">
              The first image will be used as the
              main product image.
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              className={inputClass}
              onChange={(e) => {
                if (!e.target.files) return;

                const selected =
                  Array.from(e.target.files);

                setImages((current) => [
                  ...current,
                  ...selected,
                ]);

                e.target.value = "";
              }}
            />

            {images.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${image.lastModified}-${index}`}
                    className="overflow-hidden rounded-2xl border"
                  >
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product preview ${index + 1}`}
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
                      <p className="truncate text-sm text-gray-600">
                        {image.name}
                      </p>

                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            makeMainImage(index)
                          }
                          className="w-full rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Make Main
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={index === 0}
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
                            images.length - 1
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
                          removeImage(index)
                        }
                        className="w-full rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRICE */}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className={inputClass}
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
                  setSalePrice(e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

        {/* SKU */}

<div className="grid gap-6 md:grid-cols-2">
  <div>
    <label className="mb-2 block font-medium">
      SKU
    </label>

    <input
      value={sku}
      onChange={(e) => setSku(e.target.value)}
      className={inputClass}
    />
  </div>
</div>

{/* INVENTORY */}

<div className="mt-6 border-t pt-8">
  <h2 className="text-2xl font-light">
    Inventory
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage stock for this product.
  </p>
</div>

<label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={trackInventory}
    onChange={(e) =>
      setTrackInventory(e.target.checked)
    }
  />

  Track Inventory
</label>

<div className="grid gap-6 md:grid-cols-2">
  <div>
    <label className="mb-2 block font-medium">
      Stock Quantity
    </label>

    <input
      type="number"
      value={stockQuantity}
      disabled={!trackInventory}
      onChange={(e) =>
        setStockQuantity(e.target.value)
      }
      className={inputClass}
    />
  </div>

  <div>
    <label className="mb-2 block font-medium">
      Low Stock Threshold
    </label>

    <input
      type="number"
      value={lowStockThreshold}
      disabled={!trackInventory}
      onChange={(e) =>
        setLowStockThreshold(e.target.value)
      }
      className={inputClass}
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
                  setSku(e.target.value)
                }
                className={inputClass}
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
                  setStock(e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* PRODUCT INFORMATION */}

          <div className="mt-6 border-t pt-8">
            <h2 className="text-2xl font-light">
              Product Information
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add the details customers should know
              about this product.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe the product..."
              className={inputClass}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Fabric / Material
              </label>

              <input
                value={material}
                onChange={(e) =>
                  setMaterial(e.target.value)
                }
                placeholder="e.g. 100% Cotton"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Fit
              </label>

              <input
                value={fit}
                onChange={(e) =>
                  setFit(e.target.value)
                }
                placeholder="e.g. Relaxed Fit"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Pattern / Design
              </label>

              <input
                value={pattern}
                onChange={(e) =>
                  setPattern(e.target.value)
                }
                placeholder="e.g. Floral Print"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Neckline
              </label>

              <input
                value={neckline}
                onChange={(e) =>
                  setNeckline(e.target.value)
                }
                placeholder="e.g. Round Neck"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Sleeves
              </label>

              <input
                value={sleeves}
                onChange={(e) =>
                  setSleeves(e.target.value)
                }
                placeholder="e.g. Three-quarter Sleeves"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Occasion
              </label>

              <input
                value={occasion}
                onChange={(e) =>
                  setOccasion(e.target.value)
                }
                placeholder="e.g. Casual, Festive"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Care Instructions
            </label>

            <textarea
              rows={4}
              value={careInstructions}
              onChange={(e) =>
                setCareInstructions(
                  e.target.value
                )
              }
              placeholder="e.g. Gentle machine wash. Wash dark colours separately."
              className={inputClass}
            />
          </div>

          {/* SIZE & FIT */}

          <div className="mt-6 border-t pt-8">
            <h2 className="text-2xl font-light">
              Size & Fit
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose the sizes available for this
              product and add optional fit guidance.
            </p>
          </div>

          <div>
            <label className="mb-3 block font-medium">
              Available Sizes
            </label>

            <div className="flex flex-wrap gap-3">
              {sizeOptions.map((size) => {
                const selected =
                  availableSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      toggleSize(size)
                    }
                    className={`h-12 min-w-12 rounded-full border px-4 transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Only selected sizes will be offered
              to customers on the product page.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Size & Fit Note
            </label>

            <textarea
              rows={4}
              value={sizeFitNote}
              onChange={(e) =>
                setSizeFitNote(
                  e.target.value
                )
              }
              placeholder="e.g. Relaxed fit. We recommend choosing your usual size."
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Model Size
            </label>

            <input
              value={modelSize}
              onChange={(e) =>
                setModelSize(
                  e.target.value
                )
              }
              placeholder="e.g. Model is wearing size S"
              className={inputClass}
            />
          </div>

          {/* FLAGS */}

          <div className="flex flex-wrap gap-8 border-t pt-8">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) =>
                  setFeatured(e.target.checked)
                }
              />

              Featured Product
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) =>
                  setNewArrival(e.target.checked)
                }
              />

              New Arrival
            </label>
          </div>

        </div>
      </div>
    </>
  );
}