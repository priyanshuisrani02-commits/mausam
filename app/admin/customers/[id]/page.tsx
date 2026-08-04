"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  status: string;
  created_at: string;
};

export default function CustomerDetailsPage() {
  const params = useParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", params.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setOrders((data ?? []) as Order[]);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ??
          "Unable to load customer."
      );
    } finally {
      setLoading(false);
    }
  }

  const customer = useMemo(() => {
    if (orders.length === 0) return null;

    return orders[0];
  }, [orders]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum + Number(order.total),
      0
    );
  }, [orders]);

  const averageOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;

    return Math.round(
      totalSpent / orders.length
    );
  }, [orders, totalSpent]);

  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
        <p className="text-gray-500">
          Loading customer...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
        <h2 className="text-2xl font-light">
          Unable to load customer
        </h2>

        <p className="mt-3 text-red-500">
          {error}
        </p>

        <button
          onClick={loadCustomer}
          className="mt-6 rounded-full bg-black px-6 py-3 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
        <h2 className="text-2xl font-light">
          Customer not found
        </h2>

        <Link
          href="/admin/customers"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-light">
            {customer.customer_name}
          </h1>

          <p className="mt-3 text-gray-500">
            Customer Profile
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="rounded-full border border-black px-6 py-3"
        >
          Back
        </Link>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Orders
          </p>

          <h2 className="mt-2 text-4xl font-light">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Lifetime Spend
          </p>

          <h2 className="mt-2 text-4xl font-light">
            ₹
            {totalSpent.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Average Order
          </p>

          <h2 className="mt-2 text-4xl font-light">
            ₹
            {averageOrderValue.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Last Order
          </p>

          <h2 className="mt-2 text-xl font-light">
            {formatDate(
              customer.created_at
            )}
          </h2>
        </div>
      </div>

      <div className="mb-8 rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-light">
          Customer Information
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1">
              {customer.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="mt-1">
              {customer.phone}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">
              Shipping Address
            </p>

            <p className="mt-1 leading-7">
              {customer.address}
              <br />
              {customer.city},{" "}
              {customer.state}
              <br />
              {customer.pincode}
            </p>
          </div>
        </div>
      </div>
            <div className="rounded-[32px] bg-white shadow-sm">

        <div className="border-b px-8 py-6">

          <h2 className="text-2xl font-light">
            Order History
          </h2>

          <p className="mt-2 text-gray-500">
            {orders.length} total order
            {orders.length === 1 ? "" : "s"}
          </p>

        </div>

        {/* Desktop */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full">

            <thead>

              <tr className="border-b bg-gray-50">

                <th className="p-6 text-left text-sm font-medium">
                  Order
                </th>

                <th className="p-6 text-left text-sm font-medium">
                  Date
                </th>

                <th className="p-6 text-left text-sm font-medium">
                  Status
                </th>

                <th className="p-6 text-left text-sm font-medium">
                  Total
                </th>

                <th className="p-6 text-right text-sm font-medium">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                  className="border-b last:border-b-0"
                >

                  <td className="p-6 font-medium">
                    #{order.id.slice(0, 8)}
                  </td>

                  <td className="p-6 text-gray-600">
                    {formatDate(order.created_at)}
                  </td>

                  <td className="p-6">

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>

                  </td>

                  <td className="p-6 font-medium">
                    ₹
                    {Number(
                      order.total
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="p-6 text-right">

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-block rounded-full border border-black px-5 py-2 text-sm transition hover:bg-black hover:text-white"
                    >
                      View Order
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Mobile */}

        <div className="space-y-4 p-5 md:hidden">

          {orders.map((order) => (

            <div
              key={order.id}
              className="rounded-3xl border p-5"
            >

              <div className="flex items-center justify-between">

                <h3 className="font-medium">
                  #{order.id.slice(0, 8)}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                {formatDate(order.created_at)}
              </p>

              <p className="mt-2 text-xl font-medium">
                ₹
                {Number(
                  order.total
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

              <Link
                href={`/admin/orders/${order.id}`}
                className="mt-5 inline-block rounded-full border border-black px-5 py-2 text-sm"
              >
                View Order
              </Link>

            </div>

          ))}

        </div>

      </div>

    </>
  );
} 