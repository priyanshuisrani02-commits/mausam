"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Order = {
  id: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  selected_size: string;
  price: number;
  products: {
    id: string;
    name: string;
  } | null;
};

const orderSteps = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
];

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [id, user, authLoading]);

  async function loadOrder() {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (orderError || !orderData) {
        setError("Order not found.");
        return;
      }

      setOrder(orderData);

      const {
        data: itemData,
        error: itemError,
      } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          selected_size,
          price,
          products (
            id,
            name
          )
        `)
        .eq("order_id", id);

      if (itemError) {
        throw itemError;
      }

      const normalizedItems =
        (itemData ?? []).map(
          (item: any) => ({
            ...item,
            products: Array.isArray(
              item.products
            )
              ? item.products[0] ?? null
              : item.products,
          })
        );

      setItems(normalizedItems);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load this order."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] py-20 text-center">
          Loading order...
        </main>

        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] px-6 py-20 text-center">
          <h1 className="text-4xl font-light">
            Please log in
          </h1>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
          >
            Login
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] px-6 py-20 text-center">
          <h1 className="text-4xl font-light">
            Order not found
          </h1>

          <Link
            href="/orders"
            className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white"
          >
            Back to Orders
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  const normalizedStatus =
    order.status?.toLowerCase() ??
    "pending";

  const currentStepIndex =
    orderSteps.findIndex(
      (step) =>
        step.toLowerCase() ===
        normalizedStatus
    );

  const activeStep =
    currentStepIndex >= 0
      ? currentStepIndex
      : 0;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-20">

        <Link
          href="/orders"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Orders
        </Link>

        {/* Header */}

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-4xl font-light md:text-5xl">
              Order Details
            </h1>

            <p className="mt-3 break-all text-sm text-gray-500">
              {order.id}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-5 py-2">
            {order.status || "Pending"}
          </span>

        </div>

        {/* Order Status Timeline */}

        <div className="mt-10 rounded-3xl border p-6 md:p-8">

          <h2 className="text-2xl font-medium">
            Order Status
          </h2>

          <div className="mt-8">

            {/* Desktop */}

            <div className="hidden md:flex">

              {orderSteps.map(
                (step, index) => {
                  const completed =
                    index <= activeStep;

                  return (
                    <div
                      key={step}
                      className="flex flex-1 items-start"
                    >
                      <div className="flex w-full items-center">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                            completed
                              ? "bg-black text-white"
                              : "border bg-white text-gray-400"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        {index <
                          orderSteps.length -
                            1 && (
                          <div
                            className={`h-[2px] flex-1 ${
                              index <
                              activeStep
                                ? "bg-black"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                      </div>
                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-3 hidden md:flex">

              {orderSteps.map((step) => (
                <div
                  key={step}
                  className="flex-1 text-sm font-medium"
                >
                  {step}
                </div>
              ))}

            </div>

            {/* Mobile */}

            <div className="space-y-0 md:hidden">

              {orderSteps.map(
                (step, index) => {
                  const completed =
                    index <= activeStep;

                  return (
                    <div
                      key={step}
                      className="flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm ${
                            completed
                              ? "bg-black text-white"
                              : "border text-gray-400"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        {index <
                          orderSteps.length -
                            1 && (
                          <div
                            className={`h-10 w-[2px] ${
                              index <
                              activeStep
                                ? "bg-black"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                      </div>

                      <p
                        className={`pt-2 ${
                          completed
                            ? "font-medium text-black"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

        {/* Order Content */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            {/* Products */}

            <div className="rounded-3xl border p-6 md:p-8">

              <h2 className="mb-6 text-2xl font-medium">
                Products
              </h2>

              <div className="divide-y">

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-6 py-5"
                  >

                    <div>

                      <p className="font-medium">
                        {item.products?.name ??
                          "Product"}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Size:{" "}
                        {item.selected_size}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity:{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <p className="font-medium">
                      ₹
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>
                ))}

              </div>

            </div>

            {/* Address */}

            <div className="rounded-3xl border p-6 md:p-8">

              <h2 className="mb-5 text-2xl font-medium">
                Delivery Address
              </h2>

              <p>
                {order.customer_name}
              </p>

              <p className="mt-2 text-gray-600">
                {order.address}
              </p>

              <p className="text-gray-600">
                {order.city},{" "}
                {order.state}{" "}
                {order.pincode}
              </p>

            </div>

          </div>

          {/* Summary */}

          <div className="h-fit rounded-3xl border p-6 md:p-8">

            <h2 className="mb-6 text-2xl font-medium">
              Summary
            </h2>

            <div className="flex justify-between">

              <span>Subtotal</span>

              <span>
                ₹
                {Number(
                  order.subtotal
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            <div className="mt-4 flex justify-between">

              <span>Shipping</span>

              <span>
                {Number(
                  order.shipping
                ) === 0
                  ? "FREE"
                  : `₹${Number(
                      order.shipping
                    ).toLocaleString(
                      "en-IN"
                    )}`}
              </span>

            </div>

            <hr className="my-6" />

            <div className="flex justify-between text-xl font-semibold">

              <span>Total</span>

              <span>
                ₹
                {Number(
                  order.total
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            <p className="mt-6 text-sm text-gray-500">
              Ordered on{" "}
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

        </div>

      </main>

      <Footer />
    </>
  );
}