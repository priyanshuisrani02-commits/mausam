"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, customer_name, email, total, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setOrders(data ?? []);
    } catch (err: any) {
      console.error(
        "Failed to load orders:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";

      case "shipped":
        return "bg-purple-100 text-purple-800";

      case "delivered":
        return "bg-green-100 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-light md:text-5xl">
          Orders
        </h1>

        <p className="mt-3 text-gray-500">
          Manage customer orders and delivery
          status.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-gray-500">
            Loading orders...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <h2 className="text-2xl font-light">
            Unable to load orders
          </h2>

          <p className="mt-3 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadOrders}
            className="mt-6 rounded-full bg-black px-6 py-3 text-white"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <div className="text-5xl">
            📦
          </div>

          <h2 className="mt-5 text-2xl font-light">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            New customer orders will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}

          <div className="hidden overflow-hidden rounded-[32px] bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead>
                  <tr className="border-b bg-gray-50">

                    <th className="p-6 text-left text-sm font-medium">
                      Customer
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Email
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Total
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Status
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Date
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
                        {order.customer_name}
                      </td>

                      <td className="p-6 text-gray-600">
                        {order.email}
                      </td>

                      <td className="p-6">
                        ₹
                        {Number(
                          order.total
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-6">
                        <span
                          className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status ||
                            "Pending"}
                        </span>
                      </td>

                      <td className="p-6 text-gray-600">
                        {new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="p-6 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-block rounded-full border border-black px-5 py-2 text-sm transition hover:bg-black hover:text-white"
                        >
                          View
                        </Link>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}

          <div className="space-y-4 md:hidden">

            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="font-medium">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {order.email}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status ||
                      "Pending"}
                  </span>

                </div>

                <div className="mt-6 flex items-end justify-between gap-5">

                  <div>
                    <p className="text-xl font-medium">
                      ₹
                      {Number(
                        order.total
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-full border border-black px-5 py-2 text-sm"
                  >
                    View
                  </Link>

                </div>

              </div>
            ))}

          </div>
        </>
      )}
    </>
  );
}