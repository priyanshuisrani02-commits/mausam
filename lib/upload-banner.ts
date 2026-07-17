import { supabase } from "./supabase";

export async function uploadBanner(image: File) {
  const fileName = `${Date.now()}-${image.name}`;

  const { error } = await supabase.storage
    .from("banners")
    .upload(fileName, image);

  if (error) throw error;

  const { data } = supabase.storage
    .from("banners")
    .getPublicUrl(fileName);

  return data.publicUrl;
}