import { supabase } from "./supabase";

type CartItem = {
  id: string;
  quantity: number;
  selected_size: string | null;
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
  };
};

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
  const {
    data: cartItems,
    error: cartError,
  } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      selected_size,
      products (
        id,
        name,
        price,
        stock,
        stock_quantity,
        low_stock_threshold,
        track_inventory
      )
    `)
    .eq("user_id", userId);

  if (cartError) throw cartError;

  const items: CartItem[] = (cartItems ?? []).map((item: any) => ({
  ...item,
  products: Array.isArray(item.products)
    ? item.products[0]
    : item.products,
}));

  if (items.length === 0) {
    throw new Error("Cart is empty.");
  }

  // Validate inventory before creating the order
  for (const item of items) {
    const product = item.products;

    if (!product.track_inventory) {
      continue;
    }

    if (item.quantity > product.stock_quantity) {
      throw new Error(
        `${product.name} only has ${product.stock_quantity} item(s) left in stock.`
      );
    }
  }

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.products.price) * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  // Create order
  const {
    data: order,
    error: orderError,
  } = await supabase
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
  const orderItems = items.map((item) => ({
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

  // Deduct inventory
  for (const item of items) {
    const product = item.products;

    if (!product.track_inventory) {
      continue;
    }

    const remainingStock =
      product.stock_quantity - item.quantity;

    const { error } = await supabase
      .from("products")
      .update({
        stock_quantity: remainingStock,
        stock: remainingStock,
      })
      .eq("id", product.id);

    if (error) {
      throw error;
    }
  }

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