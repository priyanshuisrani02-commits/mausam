import { supabase } from "@/lib/supabase";

export type WishlistProduct = {
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image: string;
  } | null;
};

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function getWishlist(): Promise<
  WishlistProduct[]
> {
  const userId = await getCurrentUserId();

  if (!userId) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      product_id,
      products (
        id,
        name,
        price,
        slug
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url");

  return (data ?? []).map((item: any) => {
    const product = Array.isArray(item.products)
      ? item.products[0] ?? null
      : item.products;

    if (!product) {
      return {
        product_id: item.product_id,
        products: null,
      };
    }

    const firstImage = images?.find(
      (img) => img.product_id === product.id
    );

    return {
      product_id: item.product_id,
      products: {
        ...product,
        image:
          firstImage?.image_url ??
          "/images/placeholder.png",
      },
    };
  });
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