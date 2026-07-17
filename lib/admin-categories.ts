import { supabase } from "./supabase";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  show_on_homepage?: boolean;
  sort_order?: number;
};

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function addCategory(category: {
  name: string;
  slug: string;
  image_url?: string;
  show_on_homepage?: boolean;
}) {
  const { error } = await supabase
    .from("categories")
    .insert({
      ...category,
      sort_order: 0,
    });

  if (error) throw error;
}

export async function updateCategory(
  id: string,
  updates: Partial<AdminCategory>
) {
  const { error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}