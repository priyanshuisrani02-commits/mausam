import { supabase } from "./supabase";

export async function uploadProductImages(
  productId: string,
  images: File[]
) {
  const imageUrls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    const fileName = `${productId}/${Date.now()}-${i}-${image.name}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (error) throw error;

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    imageUrls.push(data.publicUrl);

    await supabase.from("product_images").insert({
      product_id: productId,
      image_url: data.publicUrl,
      sort_order: i,
    });
  }

  return imageUrls;
}