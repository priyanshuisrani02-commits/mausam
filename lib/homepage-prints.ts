import { supabase } from "./supabase";

export type HomepagePrint = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link: string | null;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getHomepagePrints(options?: { includeInactive?: boolean }) {
  let query = supabase
    .from("homepage_prints")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as HomepagePrint[];
}

export async function getHomepagePrint(id: string) {
  const { data, error } = await supabase
    .from("homepage_prints")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as HomepagePrint | null;
}

export async function createHomepagePrint(input: Omit<HomepagePrint, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("homepage_prints")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as HomepagePrint;
}

export async function updateHomepagePrint(
  id: string,
  input: Partial<Omit<HomepagePrint, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("homepage_prints")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HomepagePrint;
}

export async function deleteHomepagePrint(id: string) {
  const { error } = await supabase.from("homepage_prints").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadHomepagePrintImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `homepage-prints/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("banners").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  return data.publicUrl;
}
