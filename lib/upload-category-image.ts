import { supabase } from "./supabase";

export async function uploadCategoryImage(
  image: File
) {
  const fileName = `${Date.now()}-${image.name}`;

  const { error } = await supabase.storage
    .from("categories")
    .upload(fileName, image);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("categories")
    .getPublicUrl(fileName);

  return publicUrl;
}