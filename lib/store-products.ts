import { supabase } from "./supabase";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  stock_quantity: number;
  track_inventory: boolean;
  featured: boolean;
  new_arrival: boolean;
  category_id: string | null;
  available_sizes: string[] | null;
  created_at: string;
  image: string;
};

export async function getStoreProducts(options?: {
  newArrivalOnly?: boolean;
  limit?: number;
}): Promise<StoreProduct[]> {
  let query = supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      price,
      sale_price,
      stock,
      stock_quantity,
      track_inventory,
      featured,
      new_arrival,
      category_id,
      available_sizes,
      created_at,
      product_images(image_url, sort_order)
    `)
    .order("created_at", { ascending: false });

  if (options?.newArrivalOnly) query = query.eq("new_arrival", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data: products, error } = await query;

  if (error || !products) {
    console.error("Failed to load products:", error);
    return [];
  }

  return products.map((product: any) => {
    const images = Array.isArray(product.product_images) ? product.product_images : [];
    const firstImage = [...images]
      .filter((img) => Boolean(img.image_url))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    const { product_images: _productImages, ...productData } = product;

    return {
      ...productData,
      image: firstImage?.image_url ?? "",
    };
  });
}
