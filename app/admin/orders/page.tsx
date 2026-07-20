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

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setOrders(data ?? []);
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-5xl font-light">
          Orders
        </h1>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-6 text-left">
                Customer
              </th>

              <th className="p-6 text-left">
                Email
              </th>

              <th className="p-6 text-left">
                Total
              </th>

              <th className="p-6 text-left">
                Status
              </th>

              <th className="p-6 text-left">
                Date
              </th>

              <th className="p-6 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-gray-500"
                >
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b"
                >
                  <td className="p-6">
                    {order.customer_name}
                  </td>

                  <td className="p-6">
                    {order.email}
                  </td>

                  <td className="p-6">
                    ₹{Number(order.total).toLocaleString()}
                  </td>

                  <td className="p-6">
                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm">
                      {order.status}
                    </span>
                  </td>

                  <td className="p-6">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-6">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-full border px-4 py-2 hover:bg-gray-100"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}