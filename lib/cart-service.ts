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
        price
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id,image_url");

  return (data ?? []).map((item: any) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    return {
      id: item.id,
      quantity: item.quantity,
      selectedSize: item.selected_size,
      product: {
        ...product,
        image:
          images?.find(
            (img) => img.product_id === product.id
          )?.image_url ??
          "/images/placeholder.png",
      },
    };
  });
}