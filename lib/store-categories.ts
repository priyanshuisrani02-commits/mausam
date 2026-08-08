import { supabase } from "./supabase";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  show_on_homepage: boolean;
  sort_order: number;
};

export async function getStoreCategories(): Promise<
  StoreCategory[]
> {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      image,
      show_on_homepage,
      sort_order
    `)
    .order("sort_order", {
      ascending: true,
    });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data;
}