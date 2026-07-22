"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    loadOrders();
  }, [user, authLoading]);

  async function loadOrders() {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("id,total,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setOrders(data ?? []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] px-6 py-20 text-center">
          <p className="text-gray-500">
            Loading your orders...
          </p>
        </main>

        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl font-light">
              My Orders
            </h1>

            <p className="mt-4 text-gray-500">
              Please log in to view your orders.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
            >
              Login
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 md:px-8 md:py-20">
        <h1 className="mb-10 text-4xl font-light md:text-5xl">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-3xl border px-6 py-20 text-center">
            <div className="text-5xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-light">
              No orders yet
            </h2>

            <p className="mt-3 text-gray-500">
              Your orders will appear here after you place one.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border p-6 md:p-8"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order
                    </p>

                    <p className="mt-1 break-all font-medium">
                      {order.id}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5">
                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm">
                      {order.status || "Pending"}
                    </span>

                    <span className="text-xl font-medium">
                      ₹
                      {Number(
                        order.total
                      ).toLocaleString("en-IN")}
                    </span>

                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-full border border-black px-5 py-2 transition hover:bg-black hover:text-white"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}