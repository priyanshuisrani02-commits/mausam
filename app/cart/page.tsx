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
    sale_price?: number | null;
    image: string;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { refreshCart } = useCart();

  async function loadCart() {
    try {
      setLoading(true);
      const data = await getCartItems();
      setItems(data as CartItem[]);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          (item.product.sale_price ?? item.product.price) *
            item.quantity,
        0
      ),
    [items]
  );

  async function changeQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;

    try {
      setUpdatingId(item.id);
      await updateCartQuantity(item.id, quantity);
      await Promise.all([loadCart(), refreshCart()]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update your bag."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(item: CartItem) {
    try {
      setUpdatingId(item.id);
      await removeCartItem(item.id);
      await Promise.all([loadCart(), refreshCart()]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove this item."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24 sm:px-6 md:px-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8b806f]">
            The Seasonal Edit
          </p>
          <h1 className="text-3xl font-light tracking-tight text-[#302d27] sm:text-4xl md:text-5xl">
            Shopping Bag
          </h1>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] px-6 py-20 text-center text-[#756f64]">
            Loading your bag...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] px-6 py-20 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#a45b3f]">
              Nothing here yet
            </p>
            <h2 className="mt-3 text-2xl font-light text-[#302d27] sm:text-3xl">
              Your bag is empty
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756f64]">
              Discover the latest MAUSAM pieces and bring a little season into your wardrobe.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-[#596246] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#465034]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
            <div className="space-y-4">
              {items.map((item) => {
                const displayPrice =
                  item.product.sale_price ?? item.product.price;
                const isUpdating = updatingId === item.id;

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] p-4 sm:flex-row sm:p-5"
                  >
                    <img
                      src={
                        item.product.image ||
                        "/images/products/product1.png"
                      }
                      alt={item.product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-64 w-full rounded-2xl bg-[#eee8dd] object-cover sm:h-44 sm:w-36"
                    />

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-lg font-medium leading-6 text-[#302d27] sm:text-xl">
                            {item.product.name}
                          </h2>
                          <p className="shrink-0 font-medium text-[#4d493f]">
                            ₹{displayPrice.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-[#756f64]">
                          Size: {item.selectedSize || "One Size"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-[#ddd5c8] bg-[#f8f5ee]">
                          <button
                            type="button"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() =>
                              changeQuantity(
                                item,
                                item.quantity - 1
                              )
                            }
                            className="h-9 w-9 text-lg text-[#4d493f] disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              changeQuantity(
                                item,
                                item.quantity + 1
                              )
                            }
                            className="h-9 w-9 text-lg text-[#4d493f] disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => removeItem(item)}
                          className="rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#a45b3f] transition hover:bg-[#f5e7df] disabled:opacity-40"
                        >
                          {isUpdating ? "Updating" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-[#ddd5c8] bg-[#fffdf8] p-6 sm:p-7 lg:sticky lg:top-24">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8b806f]">
                Your order
              </p>
              <h2 className="mt-2 text-2xl font-light text-[#302d27]">
                Summary
              </h2>

              <div className="mt-7 space-y-4 text-sm">
                <div className="flex justify-between gap-4 text-[#756f64]">
                  <span>Subtotal</span>
                  <span className="text-[#302d27]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[#756f64]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#6f7858]">
                    FREE
                  </span>
                </div>
              </div>

              <div className="my-6 h-px bg-[#e7e0d4]" />

              <div className="flex justify-between gap-4 text-lg font-medium text-[#302d27]">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-7 block rounded-full bg-[#596246] py-4 text-center text-sm font-medium text-white transition hover:bg-[#465034]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="mt-3 block text-center text-xs font-medium uppercase tracking-[0.16em] text-[#756f64] hover:text-[#302d27]"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
