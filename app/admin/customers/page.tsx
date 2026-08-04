"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  total: number;
  created_at: string;
};

type Customer = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id,user_id,customer_name,email,phone,total,created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      const map = new Map<string, Customer>();

      (data as Order[]).forEach((order) => {
        const key =
          order.user_id ||
          order.email ||
          order.id;

        const existing = map.get(key);

        if (!existing) {
          map.set(key, {
            id: key,
            customer_name:
              order.customer_name,
            email: order.email,
            phone: order.phone,
            totalOrders: 1,
            totalSpent: Number(
              order.total
            ),
            lastOrder:
              order.created_at,
          });

          return;
        }

        existing.totalOrders++;

        existing.totalSpent += Number(
          order.total
        );

        if (
          new Date(
            order.created_at
          ) >
          new Date(
            existing.lastOrder
          )
        ) {
          existing.lastOrder =
            order.created_at;
        }
      });

      setCustomers(
        Array.from(
          map.values()
        ).sort(
          (a, b) =>
            b.totalSpent -
            a.totalSpent
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers =
    useMemo(() => {
      const value =
        search.toLowerCase();

      return customers.filter(
        (customer) =>
          customer.customer_name
            .toLowerCase()
            .includes(value) ||
          customer.email
            .toLowerCase()
            .includes(value) ||
          customer.phone
            .toLowerCase()
            .includes(value)
      );
    }, [customers, search]);

  const totalRevenue =
    customers.reduce(
      (sum, customer) =>
        sum +
        customer.totalSpent,
      0
    );

  const totalOrders =
    customers.reduce(
      (sum, customer) =>
        sum +
        customer.totalOrders,
      0
    );

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
          Loading customers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
        <h2 className="text-2xl font-light">
          Unable to load customers
        </h2>

        <p className="mt-3 text-red-500">
          {error}
        </p>

        <button
          onClick={
            loadCustomers
          }
          className="mt-6 rounded-full bg-black px-6 py-3 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-light">
            Customers
          </h1>

          <p className="mt-3 text-gray-500">
            Manage your
            customer base.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Customers
          </p>

          <h2 className="mt-2 text-4xl font-light">
            {
              customers.length
            }
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Orders
          </p>

          <h2 className="mt-2 text-4xl font-light">
            {totalOrders}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Revenue
          </p>

          <h2 className="mt-2 text-4xl font-light">
            ₹
            {totalRevenue.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>
      </div>

      <div className="mb-8">
        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search customers..."
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-black"
        />
      </div>
            {filteredCustomers.length === 0 ? (
        <div className="rounded-[32px] bg-white px-6 py-20 text-center shadow-sm">
          <div className="text-5xl">
            👥
          </div>

          <h2 className="mt-5 text-2xl font-light">
            No customers found
          </h2>

          <p className="mt-2 text-gray-500">
            Customers will appear here after they place an order.
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
                      Contact
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Orders
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Total Spent
                    </th>

                    <th className="p-6 text-left text-sm font-medium">
                      Last Order
                    </th>

                    <th className="p-6 text-right text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="p-6">
                        <div>
                          <p className="font-medium">
                            {customer.customer_name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </td>

                      <td className="p-6">
                        <span className="text-gray-600">
                          {customer.phone || "—"}
                        </span>
                      </td>

                      <td className="p-6">
                        {customer.totalOrders}
                      </td>

                      <td className="p-6 font-medium">
                        ₹
                        {customer.totalSpent.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-6 text-gray-600">
                        {formatDate(
                          customer.lastOrder
                        )}
                      </td>

                      <td className="p-6 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
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
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {customer.customer_name}
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {customer.email}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {customer.phone || "—"}
                    </p>
                  </div>

                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="rounded-full border border-black px-4 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">
                      Orders
                    </p>

                    <p className="mt-1 font-medium">
                      {customer.totalOrders}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Spent
                    </p>

                    <p className="mt-1 font-medium">
                      ₹
                      {customer.totalSpent.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Last
                    </p>

                    <p className="mt-1 text-sm">
                      {formatDate(
                        customer.lastOrder
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}