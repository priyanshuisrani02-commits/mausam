"use client";


import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
type Order = {
  id: string;
  total: number;
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!id) {
        setError("Order ID not found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Unable to load your order.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return (
     <main className="mx-auto max-w-3xl px-4 py-10 pb-32 md:px-8 md:py-20">
        <div className="text-center">
          <div className="mb-4 text-5xl">⏳</div>
          <h2 className="text-3xl font-light">
            Loading your order...
          </h2>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-8">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:rounded-[36px] md:p-10">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="mb-3 text-3xl font-light">
            Something went wrong
          </h2>

          <p className="text-gray-600">
            {error}
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white transition hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const whatsappMessage = `Hello MAUSAM,

I have placed an order.

Order ID: ${order.id}

Grand Total: ₹${Number(order.total).toLocaleString("en-IN")}

Please send me your payment details.`;

  const whatsappUrl = `https://wa.me/919913558866?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="mx-auto max-w-3xl px-8 py-20">
      <div className="rounded-[36px] border border-gray-200 bg-white p-10 shadow-sm">
        <div className="text-center">
          <div className="mb-5 text-5xl md:text-7xl">🎉</div>

          <h1>className="text-3xl font-light leading-tight md:text-5xl"
            Order Placed Successfully
          </h1>

          <p className="mt-5 text-lg text-gray-600">
            Thank you for shopping with MAUSAM.
            <br />
            Your order has been received successfully.
          </p>
        </div>

        <div className="mt-12 space-y-6 rounded-3xl bg-gray-50 p-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-gray-500">
              Order Number
            </span>

            <span className="font-medium text-black">
              {order.id}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-gray-500">
              Grand Total
            </span>

            <span className="text-2xl font-semibold">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Payment Status
            </span>

            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
              Pending
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 md:mt-10 md:p-8">
          <h2 className="mb-3 text-2xl font-medium">
            Payment Instructions
          </h2>

          <p className="leading-7 text-gray-700">
            Please contact us on WhatsApp to receive our
            UPI ID / bank details.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
           className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-4 text-base font-medium text-white transition hover:bg-green-700 md:px-8 md:text-lg"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
           className="inline-block w-full rounded-full bg-black px-8 py-4 text-white transition hover:bg-neutral-800 md:w-auto md:px-10"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-8 py-20">
          <div className="text-center">
            Loading...
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
