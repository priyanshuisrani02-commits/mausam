"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
};

type OrderItem = {
  quantity: number;
  selected_size: string;
  price: number;
  products: {
    name: string;
  };
};

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderData) {
      setOrder(orderData);
    }

    const { data: itemData } = await supabase
      .from("order_items")
      .select(`
        quantity,
        selected_size,
        price,
        products(name)
      `)
      .eq("order_id", id);

    if (itemData) {
      setItems(itemData as any);
    }
  }

  async function handleStatusChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    if (!order) return;

    const newStatus = e.target.value;

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", order.id);

    if (error) {
      alert(error.message);
      return;
    }

    setOrder({
      ...order,
      status: newStatus,
    });
  }

  if (!order) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <>
      <h1 className="mb-10 text-5xl font-light">
        Order Details
      </h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="rounded-3xl bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-medium">
            Customer
          </h2>

          <p>
            <strong>Name:</strong> {order.customer_name}
          </p>

          <p>
            <strong>Email:</strong> {order.email}
          </p>

          <p>
            <strong>Phone:</strong> {order.phone}
          </p>

          <div className="mt-6">
            <strong>Address</strong>
            <p>{order.address}</p>
            <p>{order.city}</p>
            <p>{order.state}</p>
            <p>{order.pincode}</p>
          </div>
        </div>

        <div className="col-span-2 rounded-3xl bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-medium">
            Products
          </h2>

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

                <th className="p-4 text-left">
                  Price
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b"
                >
                  <td className="p-4">
                    {item.products.name}
                  </td>

                  <td className="p-4">
                    {item.selected_size}
                  </td>

                  <td className="p-4">
                    {item.quantity}
                  </td>

                  <td className="p-4">
                    ₹{item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="my-8">
            <label className="mb-2 block font-medium">
              Order Status
            </label>

            <select
              value={order.status}
              onChange={handleStatusChange}
              className="w-full rounded-xl border p-3"
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>Shipping</span>
              <span>₹{order.shipping}</span>
            </div>

            <div className="mt-4 flex justify-between text-2xl font-semibold">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}