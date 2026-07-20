"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("id,name")
      .order("name");

    if (data) {
      setCategories(data);
    }
  }

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setProductName(data.name);
    setPrice(String(data.price));
    setSalePrice(
      data.sale_price ? String(data.sale_price) : ""
    );
    setSku(data.sku);
    setStock(String(data.stock));
    setCategoryId(data.category_id);
  }

  async function handleSave() {
    const { error } = await supabase
      .from("products")
      .update({
        name: productName,
        category_id: categoryId,
        price: Number(price),
        sale_price: salePrice
          ? Number(salePrice)
          : null,
        sku,
        stock: Number(stock),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product Updated!");

    router.push("/admin/products");
  }

  return (
    <>
      <h1 className="mb-10 text-5xl font-light">
        Edit Product
      </h1>

      <div className="rounded-[32px] bg-white p-10 shadow">
        <div className="grid gap-6">
          <input
            value={productName}
            onChange={(e) =>
              setProductName(e.target.value)
            }
            placeholder="Product Name"
            className="rounded-xl border p-4 text-black"
          />

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            className="rounded-xl border p-4 text-black"
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <input
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            placeholder="Price"
            className="rounded-xl border p-4 text-black"
          />

          <input
            value={salePrice}
            onChange={(e) =>
              setSalePrice(e.target.value)
            }
            placeholder="Sale Price"
            className="rounded-xl border p-4 text-black"
          />

          <input
            value={sku}
            onChange={(e) =>
              setSku(e.target.value)
            }
            placeholder="SKU"
            className="rounded-xl border p-4 text-black"
          />

          <input
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            placeholder="Stock"
            className="rounded-xl border p-4 text-black"
          />

          <button
            onClick={handleSave}
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}