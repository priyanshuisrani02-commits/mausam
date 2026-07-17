"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/lib/order-service";
import Footer from "@/components/Footer";
export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  function update(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

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
    <main className="mx-auto max-w-3xl px-4 py-10 pb-32 md:px-8 md:py-20">
      <h1 className="mb-8 text-3xl font-light md:mb-12 md:text-5xl">
        Checkout
      </h1>

      <div className="space-y-6 rounded-3xl border p-6 shadow-sm md:p-10">
        <input
          name="customer_name"
          placeholder="Full Name"
          value={form.customer_name}
          onChange={update}
          className="w-full rounded-xl border p-3 text-base md:p-4"
        />
  
        <input
          name="email"
          placeholder="Email"
          type="email"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
         className="w-full rounded-full bg-black py-4 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 md:py-5"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
      <Footer />
    </main>
  );
}
