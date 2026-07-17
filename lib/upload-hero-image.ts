import { supabase } from "./supabase";

export async function uploadHeroImage(
  image: File
) {
  const fileName = `${Date.now()}-${image.name}`;

  const { error } = await supabase.storage
    .from("hero-slides")
    .upload(fileName, image);

  if (error) throw error;

  const { data } = supabase.storage
    .from("hero-slides")
    .getPublicUrl(fileName);

  return data.publicUrl;
}