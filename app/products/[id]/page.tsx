"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import Footer from "@/components/Footer";
type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
};

export default function ProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
const [selectedSize, setSelectedSize] = useState("M");
const [quantity, setQuantity] = useState(1);
const sizes = ["XS", "S", "M", "L", "XL"];

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return;

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", data.id)
      .order("sort_order");

    const imageList =
      images?.map((img) => img.image_url) ?? [];

    setProduct({
      ...data,
      images: imageList,
    });

    if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }

  if (!product) {
    return (
      <div className="py-40 text-center">
        Loading...
      </div>
    );
  }

  return (
   <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <div>

          <img
            src={
              selectedImage ||
              "/images/placeholder.png"
            }
            alt={product.name}
className="h-[420px] w-full rounded-3xl object-cover md:h-auto"
          />

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x md:mt-6 md:gap-4">

            {product.images.map((image) => (

              <button
                key={image}
                onClick={() =>
                  setSelectedImage(image)
                }
                className="overflow-hidden rounded-xl border"
              >

                <img
                  src={image}
                  alt=""
                 className="h-20 w-20 rounded-lg object-cover md:h-24 md:w-24"
                />

              </button>

            ))}

          </div>

        </div>

        <div>

          <h1 className="text-3xl font-light md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-6 text-3xl">
            ₹{product.price}
          </p>

          {product.sale_price && (
            <p className="mt-2 text-xl text-red-600">
              Sale ₹{product.sale_price}
            </p>
          )}

          <p className="mt-6 text-gray-600">
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </p>

<div className="mt-8">

  <p className="mb-3 text-sm font-medium">
    Select Size
  </p>

  <div className="flex flex-wrap gap-3">

    {sizes.map((size) => (

      <button
        key={size}
        onClick={() => setSelectedSize(size)}
        className={`h-12 w-12 rounded-full border transition ${
          selectedSize === size
            ? "bg-black text-white"
            : "bg-white"
        }`}
      >
        {size}
      </button>

    ))}

  </div>

</div>

          <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:gap-6">

  <div className="flex items-center overflow-hidden rounded-full border">

    <button
      onClick={() =>
        setQuantity((q) => Math.max(1, q - 1))
      }
      className="px-5 py-3 text-xl"
    >
      −
    </button>

    <span className="w-12 text-center">
      {quantity}
    </span>

    <button
      onClick={() => setQuantity((q) => q + 1)}
      className="px-5 py-3 text-xl"
    >
      +
    </button>

  </div>

 <button
  onClick={async () => {
    try {
      await addToCart(
        product!.id,
        quantity,
        selectedSize
      );

      alert("Added to cart!");
    } catch (err: any) {
      alert(err.message);
    }
  }}
 className="w-full rounded-full bg-black px-10 py-4 text-white transition hover:bg-gray-800 md:w-auto"
>
  Add to Cart
</button>

</div>
        </div>

      </div>
<Footer />
    </main>
  );
}

