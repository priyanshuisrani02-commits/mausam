import { supabase } from "./supabase";

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login first.");
  }

  return user.id;
}

export async function placeOrder(customer: {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const userId = await getCurrentUserId();

  // Load current user's cart
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
    `)
    .eq("user_id", userId);

  if (cartError) throw cartError;

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total: number, item: any) =>
      total + Number(item.products.price) * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        ...customer,
        subtotal,
        shipping,
        total,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
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

  // Clear user's cart
  const { error: clearError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (clearError) throw clearError;

  return {
    id: order.id,
    subtotal,
    shipping,
    total,
    customer,
  };
}