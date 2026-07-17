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
  // 1. Load cart
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      selected_size,
      products (
        id,
        name,
        price
      )
    `);

  if (cartError) throw cartError;

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  // 2. Calculate totals
  const subtotal = cartItems.reduce(
    (total: number, item: any) =>
      total + Number(item.products.price) * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  // 3. Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        ...customer,
        subtotal,
        shipping,
        total,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // 4. Create order items
  const orderItems = cartItems.map((item: any) => ({
    order_id: order.id,
    product_id: item.products.id,
    quantity: item.quantity,
    selected_size: item.selected_size,
    price: item.products.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // 5. Clear cart
  const cartIds = cartItems.map((item: any) => item.id);

  const { error: clearError } = await supabase
    .from("cart_items")
    .delete()
    .in("id", cartIds);

  if (clearError) throw clearError;

 return {
  id: order.id,
  subtotal,
  shipping,
  total,
  customer,
};
}