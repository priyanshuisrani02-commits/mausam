import { supabase } from "./supabase";

export async function saveBanner(data: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  active: boolean;
}) {
  const { error } = await supabase
    .from("banners")
    .insert({
      title: data.title,
      subtitle: "",
      description: data.description,
      button_text: data.buttonText,
      button_link: data.buttonLink,
      image_url: data.imageUrl,
      active: data.active,
    });

  if (error) throw error;
}

export async function getActiveBanner() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function updateBanner(
  id: string,
  data: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    active: boolean;
  }
) {
  const { error } = await supabase
    .from("banners")
    .update({
      title: data.title,
      subtitle: "",
      description: data.description,
      button_text: data.buttonText,
      button_link: data.buttonLink,
      image_url: data.imageUrl,
      active: data.active,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (error) throw error;
}