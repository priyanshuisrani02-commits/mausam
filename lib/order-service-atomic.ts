import { supabase } from "./supabase";

export async function placeOrder(customer: {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  if (Object.values(customer).some((value) => !value?.trim())) {
    throw new Error("Please complete all delivery details.");
  }

  const { data, error } = await supabase.rpc("place_order_atomic", {
    order_customer: customer,
  });

  if (error) {
    throw new Error(error.message || "Unable to place your order.");
  }

  if (!data?.id) {
    throw new Error("Unable to create the order.");
  }

  return {
    id: data.id as string,
    subtotal: Number(data.subtotal ?? 0),
    shipping: Number(data.shipping ?? 0),
    total: Number(data.total ?? 0),
    customer,
  };
}
