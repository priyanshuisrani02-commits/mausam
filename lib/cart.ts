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

export async function addToCart(
  productId: string,
  quantity: number,
  selectedSize: string
) {
  const userId = await getCurrentUserId();

  const { data: existingItem, error: fetchError } =
    await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("selected_size", selectedSize)
      .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity:
          existingItem.quantity + quantity,
      })
      .eq("id", existingItem.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .insert({
      user_id: userId,
      product_id: productId,
      quantity,
      selected_size: selectedSize,
    });

  if (error) {
    throw error;
  }
}