import { supabase } from "./supabase";

export async function addToCart(
  productId: string,
  quantity: number,
  selectedSize: string
) {
  const { error } = await supabase
    .from("cart_items")
    .insert([
      {
        product_id: productId,
        quantity,
        selected_size: selectedSize,
      },
    ]);

  if (error) {
    throw error;
  }
}