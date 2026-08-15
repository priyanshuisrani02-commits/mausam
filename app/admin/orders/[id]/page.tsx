"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
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
  quantity: number;
  selected_size: string;
  price: number;
  products: {
    name: string;
  } | null;
};

const statuses = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
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
        .single();

      if (orderError || !orderData) {
        throw (
          orderError ||
          new Error("Order not found.")
        );
      }

      const {
        data: itemData,
        error: itemError,
      } = await supabase
        .from("order_items")
        .select(`
          quantity,
          selected_size,
          price,
          products (
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

      setOrder(orderData);
      setItems(normalizedItems);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    if (!order) return;

    const previousStatus =
      order.status;

    const newStatus =
      e.target.value;

    setOrder({
      ...order,
      status: newStatus,
    });

    try {
      setUpdating(true);

      const { error } =
        await supabase
          .from("orders")
          .update({
            status: newStatus,
          })
          .eq("id", order.id);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setOrder({
        ...order,
        status: previousStatus,
      });

      alert(
        err.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-light">
          Unable to load order
        </h1>

        <p className="mt-3 text-gray-500">
          {error}
        </p>

        <Link
          href="/admin/orders"
          className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <Link
          href="/admin/orders"
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Orders
        </Link>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-light md:text-5xl">
              Order Details
            </h1>

            <p className="mt-3 break-all text-sm text-gray-500">
              {order.id}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Customer */}

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="mb-6 text-2xl font-medium">
            Customer
          </h2>

          <div className="space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="mt-1">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 break-all">
                {order.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="mt-1">
                {order.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Delivery Address
              </p>

              <div className="mt-1 leading-7">
                <p>{order.address}</p>

                <p>
                  {order.city},{" "}
                  {order.state}
                </p>

                <p>{order.pincode}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Order Date
              </p>

              <p className="mt-1">
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
        </div>

        {/* Products */}

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:col-span-2">

          <h2 className="mb-6 text-2xl font-medium">
            Products
          </h2>

          {/* Desktop table */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>
                <tr className="border-b">

                  <th className="p-4 text-left">
                    Product
                  </th>

                  <th className="p-4 text-left">
                    Size
                  </th>

                  <th className="p-4 text-left">
                    Qty
                  </th>

                  <th className="p-4 text-right">
                    Price
                  </th>

                </tr>
              </thead>

              <tbody>

                {items.map(
                  (item, index) => (
                    <tr
                      key={index}
                      className="border-b"
                    >
                      <td className="p-4">
                        {item.products
                          ?.name ??
                          "Product no longer available"}
                      </td>

                      <td className="p-4">
                        {item.selected_size}
                      </td>

                      <td className="p-4">
                        {item.quantity}
                      </td>

                      <td className="p-4 text-right">
                        ₹
                        {(
                          Number(
                            item.price
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* Mobile products */}

          <div className="divide-y md:hidden">

            {items.map(
              (item, index) => (
                <div
                  key={index}
                  className="py-5"
                >
                  <div className="flex justify-between gap-5">

                    <div>
                      <p className="font-medium">
                        {item.products
                          ?.name ??
                          "Product no longer available"}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Size:{" "}
                        {
                          item.selected_size
                        }
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity:{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium">
                      ₹
                      {(
                        Number(
                          item.price
                        ) *
                        item.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>
                </div>
              )
            )}

          </div>

          {/* Status */}

          <div className="my-8">

            <label className="mb-2 block font-medium">
              Order Status
            </label>

            <select
              value={order.status}
              onChange={
                handleStatusChange
              }
              disabled={updating}
              className="w-full rounded-xl border p-3 outline-none focus:border-black disabled:opacity-50"
            >
              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            {updating && (
              <p className="mt-2 text-sm text-gray-500">
                Updating status...
              </p>
            )}

          </div>

          {/* Totals */}

          <div className="border-t pt-6">

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

            <div className="mt-3 flex justify-between">
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

            <div className="mt-6 flex justify-between border-t pt-5 text-2xl font-semibold">

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

          </div>

        </div>

      </div>
    </>
  );
}
