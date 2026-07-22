"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCartItems } from "@/lib/cart-service";
import {
  updateCartQuantity,
  removeCartItem,
} from "@/lib/cart-actions";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

type CartItem = {
  id: string;
  quantity: number;
  selectedSize: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
const { refreshCart } = useCart();
  async function loadCart() {
    const data = await getCartItems();
    setItems(data as any);
  }

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [items]);

  return (
   <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">

      <h1 className="mb-8 text-3xl font-light md:mb-12 md:text-5xl">
        Shopping Bag
      </h1>

      {items.length === 0 ? (

        <div className="rounded-3xl border py-24 text-center">

          <h2 className="text-3xl font-light">
            Your bag is empty
          </h2>

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
          >
            Continue Shopping
          </Link>

        </div>

      ) : (

       <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">

          <div className="space-y-6 md:col-span-2">

            {items.map((item) => (

              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-3xl border p-5 md:flex-row md:gap-6 md:p-6"
              >

               <img
  src={item.product.image || "/images/placeholder.png"}
  alt={item.product.name}
  className="h-52 w-full rounded-2xl object-cover md:h-[180px] md:w-[140px]"
/>

                <div className="flex flex-1 flex-col justify-between">

                  <div>

                    <h2 className="text-2xl font-medium">
                      {item.product.name}
                    </h2>

                    <p className="mt-2 text-gray-500">
                      Size: {item.selectedSize}
                    </p>

                    <p className="mt-2 text-xl">
                      ₹{item.product.price}
                    </p>

                  </div>

                 <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={async () => {
                        if (item.quantity === 1) return;

                       await updateCartQuantity(
                         item.id,
                         item.quantity - 1
                                        );
                    await loadCart();
                    await refreshCart();
                      }}
                      className="h-10 w-10 rounded-full border"
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={async () => {
                       await updateCartQuantity(
  item.id,
  item.quantity + 1
);

await loadCart();
await refreshCart();
                      }}
                      className="h-10 w-10 rounded-full border"
                    >
                      +
                    </button>

                    <button
                      onClick={async () => {
                        await removeCartItem(item.id);

await loadCart();
await refreshCart();
                      }}
                     className="text-red-500 md:ml-6"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          <div className="h-fit rounded-3xl border p-6 md:sticky md:top-24 md:p-8">

            <h2 className="mb-8 text-3xl font-light">
              Order Summary
            </h2>

            <div className="mb-4 flex justify-between">

              <span>Subtotal</span>

              <span>
                ₹{subtotal.toLocaleString()}
              </span>

            </div>

            <div className="mb-4 flex justify-between">

              <span>Shipping</span>

              <span className="text-green-600">
                FREE
              </span>

            </div>

            <hr className="my-6" />

            <div className="mb-8 flex justify-between text-xl font-semibold">

              <span>Total</span>

              <span>
                ₹{subtotal.toLocaleString()}
              </span>

            </div>

            <Link
              href="/checkout"
              className="block rounded-full bg-black py-4 text-center text-white"
            >
              Proceed to Checkout
            </Link>

          </div>

        </div>

      )}
<Footer />
    </main>
  );
}
