 "use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
const [featured, setFeatured] = useState(false);
const [newArrival, setNewArrival] = useState(false);
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
async function handleSave() {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: productName,
        category_id: categoryId,
        price: Number(price),
        sale_price: salePrice
          ? Number(salePrice)
          : null,
        sku,
        stock: Number(stock),
        featured,
        new_arrival: newArrival,
      },
    ])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  try {
    await uploadProductImages(
      data.id,
      images
    );

   alert("Product Saved!");
router.push("/admin/products");

  } catch (err: any) {
    alert(err.message);
  }
}
  return (
    <AdminLayout>

      <div className="mb-10 flex items-center justify-between">

        <h1 className="text-5xl font-light">
          Add Product
        </h1>

        <button
  onClick={handleSave}
  className="rounded-full bg-black px-6 py-3 text-white"
>
  Save Product
</button>

      </div>

      <div className="rounded-[32px] bg-white p-10 shadow">

        <div className="grid gap-6">

          <div>

            <label className="mb-2 block font-medium">
              Product Name
            </label>

            <input
              value={productName}
              onChange={(e) =>
                setProductName(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white p-4"
              style={{ color: "black" }}
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
              className="w-full rounded-xl border border-gray-300 bg-white p-4"
              style={{ color: "black" }}
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

          <div className="grid grid-cols-2 gap-6">
<div>

  <label className="mb-2 block font-medium">
    Product Images
  </label>
{images.length > 0 && (

  <div className="grid grid-cols-5 gap-4">

    {images.map((image, index) => (

      <img
        key={index}
        src={URL.createObjectURL(image)}
        alt=""
        className="h-32 w-full rounded-xl border object-cover"
      />

    ))}

  </div>

)}
  <input
    type="file"
    multiple
    accept="image/*"
    className="mb-6 w-full rounded-xl border border-gray-300 bg-white p-4"
    onChange={(e) => {
      if (!e.target.files) return;

      setImages(Array.from(e.target.files));
    }}
  />

</div>
            <div>

              <label className="mb-2 block font-medium">
                Price
              </label>

              <input
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-4"
                style={{ color: "black" }}
              />

            </div>

            <div>

              <label className="mb-2 block font-medium">
                Sale Price
              </label>

              <input
                value={salePrice}
                onChange={(e) =>
                  setSalePrice(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-4"
                style={{ color: "black" }}
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="mb-2 block font-medium">
                SKU
              </label>

              <input
                value={sku}
                onChange={(e) =>
                  setSku(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-4"
                style={{ color: "black" }}
              />

            </div>

            <div>

              <label className="mb-2 block font-medium">
                Stock
              </label>

              <input
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-4"
                style={{ color: "black" }}
              />

            </div>
<div className="flex gap-8">

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={featured}
      onChange={(e) => setFeatured(e.target.checked)}
    />
    Featured Product
  </label>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={newArrival}
      onChange={(e) => setNewArrival(e.target.checked)}
    />
    New Arrival
  </label>

</div>
          </div>

        </div>

      </div>

    </AdminLayout>
  );
}