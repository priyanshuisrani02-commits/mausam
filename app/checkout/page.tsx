"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { placeOrder } from "@/lib/order-service-atomic";
import { getCartItems } from "@/lib/cart-service";

type CartItem = {
  id: string;
  quantity: number;
  selectedSize: string;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image: string;
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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
    loadCheckout();
  }, []);

  async function loadCheckout() {
    try {
      setPageLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [cartData, profileResult] = await Promise.all([
        getCartItems(),
        supabase
          .from("profiles")
          .select("full_name, phone, address, city, state, pincode")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (profileResult.error) throw profileResult.error;

      setItems(cartData as CartItem[]);
      const profile = profileResult.data;
      setForm({
        customer_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
        address: profile?.address ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
        pincode: profile?.pincode ?? "",
      });
    } catch (err) {
      console.error("Failed to load checkout:", err);
    } finally {
      setPageLoading(false);
    }
  }

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product.sale_price ?? item.product.price) * item.quantity, 0),
    [items]
  );
  const shipping = 0;
  const total = subtotal + shipping;
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  async function handlePlaceOrder() {
    const normalized = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    ) as typeof form;

    if (Object.values(normalized).some((value) => !value)) {
      alert("Please complete all delivery details.");
      return;
    }

    if (normalized.pincode.length < 4 || normalized.pincode.length > 10) {
      alert("Please enter a valid pincode.");
      return;
    }

    if (normalized.phone.length < 7 || normalized.phone.length > 20) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      const order = await placeOrder(normalized);
      router.push(`/order-success?id=${order.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to place your order.");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center"><p className="text-gray-500">Loading checkout...</p></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10 pb-32 md:px-8 md:py-20">
        <h1 className="mb-12 text-4xl font-light md:text-5xl">Checkout</h1>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 rounded-3xl border p-6 shadow-sm md:p-8 lg:col-span-2">
            <div>
              <h2 className="text-3xl font-light">Customer Details</h2>
              <p className="mt-2 text-sm text-gray-500">Your saved account details have been filled in automatically.</p>
            </div>

            <input name="customer_name" placeholder="Full Name" value={form.customer_name} onChange={update} className="w-full rounded-xl border p-4 outline-none focus:border-black" />
            <input name="email" type="email" placeholder="Email" value={form.email} readOnly aria-readonly="true" className="w-full rounded-xl border bg-gray-50 p-4 outline-none" />
            <input name="phone" type="tel" placeholder="Phone" value={form.phone} onChange={update} className="w-full rounded-xl border p-4 outline-none focus:border-black" />
            <input name="address" placeholder="Address" value={form.address} onChange={update} className="w-full rounded-xl border p-4 outline-none focus:border-black" />

            <div className="grid gap-4 md:grid-cols-3">
              <input name="city" placeholder="City" value={form.city} onChange={update} className="rounded-xl border p-4 outline-none focus:border-black" />
              <input name="state" placeholder="State" value={form.state} onChange={update} className="rounded-xl border p-4 outline-none focus:border-black" />
              <input name="pincode" inputMode="numeric" placeholder="Pincode" value={form.pincode} onChange={update} className="rounded-xl border p-4 outline-none focus:border-black" />
            </div>
          </div>

          <div className="h-fit rounded-3xl border p-6 shadow-sm md:p-8 lg:sticky lg:top-24">
            <h2 className="mb-8 text-3xl font-light">Order Summary</h2>
            <div className="mb-6 flex justify-between"><span>Items</span><span>{itemCount}</span></div>
            <div className="mb-4 flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="mb-4 flex justify-between"><span>Shipping</span><span className="text-green-600">FREE</span></div>
            <div className="mb-6 rounded-2xl border border-[#e5ddd0] bg-[#fffaf1] p-4">
              <p className="text-sm font-medium text-[#39362f]">Payment</p>
              <p className="mt-1 text-sm text-[#746e63]">Cash on Delivery</p>
            </div>
            <hr className="my-6" />
            <div className="mb-8 flex justify-between text-2xl font-semibold"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            <button type="button" onClick={handlePlaceOrder} disabled={loading || items.length === 0} className="w-full rounded-full bg-black py-4 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Placing Order..." : items.length === 0 ? "Cart is Empty" : "Place Order"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
