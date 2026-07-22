"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/Footer";

import { placeOrder } from "@/lib/order-service";
import { getCartItems } from "@/lib/cart-service";

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

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<CartItem[]>([]);

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    const data = await getCartItems();
    setItems(data as CartItem[]);
  }

  function update(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity,
      0
    );
  }, [items]);

  const shipping = 0;

  const total = subtotal + shipping;

  async function handlePlaceOrder() {
    try {
      setLoading(true);

      const order = await placeOrder(form);

      router.push(`/order-success?id=${order.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">

        <h1 className="mb-12 text-5xl font-light">
          Checkout
        </h1>

        <div className="grid gap-10 lg:grid-cols-3">

          {/* Customer Details */}

          <div className="space-y-6 rounded-3xl border p-8 shadow-sm lg:col-span-2">

            <h2 className="text-3xl font-light">
              Customer Details
            </h2>

            <input
              name="customer_name"
              placeholder="Full Name"
              value={form.customer_name}
              onChange={update}
              className="w-full rounded-xl border p-4"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={update}
              className="w-full rounded-xl border p-4"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={update}
              className="w-full rounded-xl border p-4"
            />

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={update}
              className="w-full rounded-xl border p-4"
            />

            <div className="grid gap-4 md:grid-cols-3">

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={update}
                className="rounded-xl border p-4"
              />

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={update}
                className="rounded-xl border p-4"
              />

              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={update}
                className="rounded-xl border p-4"
              />

            </div>

          </div>

          {/* Order Summary */}

          <div className="h-fit rounded-3xl border p-8 shadow-sm lg:sticky lg:top-24">

            <h2 className="mb-8 text-3xl font-light">
              Order Summary
            </h2>

            <div className="mb-6 flex justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>

            <div className="mb-4 flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mb-4 flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">
                FREE
              </span>
            </div>

            <hr className="my-6" />

            <div className="mb-8 flex justify-between text-2xl font-semibold">

              <span>Total</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>

            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-full bg-black py-4 text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading
                ? "Placing Order..."
                : "Place Order"}
            </button>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}