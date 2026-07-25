"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadProductImages(
  productId: string,
  images: File[]
) {
  if (images.length === 0) {
    return [];
  }

  const supabase = createClient();

  const {
    data: existingImages,
    error: existingImagesError,
  } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", {
      ascending: false,
    })
    .limit(1);

  if (existingImagesError) {
    throw existingImagesError;
  }

  const highestSortOrder =
    existingImages?.[0]?.sort_order ?? -1;

  const startingSortOrder =
    highestSortOrder + 1;

  const imageUrls: string[] = [];

  for (
    let i = 0;
    i < images.length;
    i++
  ) {
    const image = images[i];

    const safeFileName =
      image.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );

    const fileName =
      `${productId}/` +
      `${Date.now()}-${i}-${safeFileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("products")
        .upload(fileName, image);

    if (uploadError) {
      throw new Error(
        `STORAGE UPLOAD FAILED: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("products")
        .getPublicUrl(fileName);

    const imageUrl =
      publicUrlData.publicUrl;

    const { error: insertError } =
      await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: imageUrl,
          sort_order:
            startingSortOrder + i,
        });

    if (insertError) {
      await supabase.storage
        .from("products")
        .remove([fileName]);

      throw insertError;
    }

    imageUrls.push(imageUrl);
  }

  return imageUrls;
}