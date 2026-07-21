import { supabase } from "./supabase";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  featured: boolean;
  new_arrival: boolean;
  category_id: string;
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
      featured,
      new_arrival,
      category_id
    `)
    .order("created_at", { ascending: false });

  if (error || !products) {
    console.error(error);
    return [];
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url");

  return products.map((product) => {
    const firstImage = images?.find(
      (img) => img.product_id === product.id
    );

    return {
      ...product,
      image:
        firstImage?.image_url ??
        "/images/placeholder.png",
    };
  });
}