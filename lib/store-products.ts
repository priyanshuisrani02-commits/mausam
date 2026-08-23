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

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const { data: products, error } = await supabase
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
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error || !products) {
    console.error("Failed to load products:", error);
    return [];
  }

  const { data: images, error: imageError } = await supabase
    .from("product_images")
    .select("product_id, image_url")
    .order("sort_order", { ascending: true });

  if (imageError) {
    console.error("Failed to load product images:", imageError);
  }

  return products.map((product) => {
    const firstImage = images?.find(
      (img) => img.product_id === product.id && Boolean(img.image_url)
    );

    return {
      ...product,
      image: firstImage?.image_url ?? "",
    };
  });
}
