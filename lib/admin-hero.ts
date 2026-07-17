import { supabase } from "./supabase";

export type HeroSlide = {
  id: string;
  image_url: string;
  link: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
};

export async function getHeroSlides() {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function saveHeroSlide(data: {
  imageUrl: string;
  link: string;
  sortOrder: number;
  active: boolean;
}) {
  console.log("Saving hero slide:", data);

  const { data: inserted, error } = await supabase
    .from("hero_slides")
    .insert({
      image_url: data.imageUrl,
      link: data.link,
      sort_order: data.sortOrder,
      active: data.active,
    })
    .select();

  console.log("Inserted:", inserted);
  console.log("Insert error:", error);

  if (error) throw error;
}
export async function updateHeroSlide(
  id: string,
  data: {
    imageUrl: string;
    link: string;
    sortOrder: number;
    active: boolean;
  }
) {
  const { error } = await supabase
    .from("hero_slides")
    .update({
      image_url: data.imageUrl,
      link: data.link,
      sort_order: data.sortOrder,
      active: data.active,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteHeroSlide(id: string) {
  const { error } = await supabase
    .from("hero_slides")
    .delete()
    .eq("id", id);

  if (error) throw error;
}