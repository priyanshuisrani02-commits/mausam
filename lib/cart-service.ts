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

export async function getCartItems() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      selected_size,
      products (
        id,
        name,
        price,
        sale_price,
        stock_quantity,
        track_inventory
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  const normalizedItems = (data ?? [])
    .map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      selectedSize: item.selected_size,
      product: Array.isArray(item.products)
        ? item.products[0] ?? null
        : item.products,
    }))
    .filter((item) => item.product?.id);

  if (normalizedItems.length === 0) {
    return [];
  }

  const productIds = normalizedItems.map(
    (item) => item.product.id
  );

  const { data: images, error: imageError } = await supabase
    .from("product_images")
    .select("product_id,image_url,sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (imageError) {
    console.error("Failed to load cart images:", imageError);
  }

  const firstImageByProduct = new Map<string, string>();

  for (const image of images ?? []) {
    if (!firstImageByProduct.has(image.product_id)) {
      firstImageByProduct.set(image.product_id, image.image_url);
    }
  }

  return normalizedItems.map((item) => ({
    ...item,
    product: {
      ...item.product,
      image:
        firstImageByProduct.get(item.product.id) ??
        "/images/products/product1.png",
    },
  }));
}
