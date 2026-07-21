import { supabase } from "@/lib/supabase";

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return user.id;
}

export async function getWishlist() {
  const userId = await getCurrentUserId();

  if (!userId) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      product_id,
      products (*)
    `)
    .eq("user_id", userId);

  if (error) throw error;

  return data ?? [];
}

export async function addToWishlist(
  productId: string
) {
  const userId = await getCurrentUserId();

  if (!userId)
    throw new Error("Please login first.");

  const { error } = await supabase
    .from("wishlists")
    .insert({
      user_id: userId,
      product_id: productId,
    });

  if (error) throw error;
}

export async function removeFromWishlist(
  productId: string
) {
  const userId = await getCurrentUserId();

  if (!userId) return;

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

export async function isWishlisted(
  productId: string
) {
  const userId = await getCurrentUserId();

  if (!userId) return false;

  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  return !!data;
}

export async function toggleWishlist(
  productId: string
) {
  const exists =
    await isWishlisted(productId);

  if (exists) {
    await removeFromWishlist(productId);
    return false;
  }

  await addToWishlist(productId);

  return true;
}