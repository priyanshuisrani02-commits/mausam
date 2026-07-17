import { supabase } from "./supabase";

export async function updateCartQuantity(
  id: string,
  quantity: number
) {
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", id);

  if (error) throw error;
}

export async function removeCartItem(
  id: string
) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}