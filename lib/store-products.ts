import { supabase } from "./supabase";

export type StoreProduct = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  featured: boolean;
  new_arrival: boolean;
  category_id: string;
  image: string;
};

export async function getStoreProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !products) {
    return [];
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("*");

  return products.map((product) => {
    const firstImage = images?.find(
      (img) => img.product_id === product.id
    );

    return {
      ...product,
      image: firstImage?.image_url ?? "/images/placeholder.png",
    };
  });
}