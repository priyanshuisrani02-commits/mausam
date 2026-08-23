import { supabase } from "./supabase";

export type HomepageBenefit = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getHomepageBenefits(options?: { includeInactive?: boolean }) {
  let query = supabase
    .from("homepage_benefits")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as HomepageBenefit[];
}

export async function createHomepageBenefit(input: Omit<HomepageBenefit, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("homepage_benefits").insert(input).select().single();
  if (error) throw error;
  return data as HomepageBenefit;
}

export async function updateHomepageBenefit(
  id: string,
  input: Partial<Omit<HomepageBenefit, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase.from("homepage_benefits").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as HomepageBenefit;
}

export async function deleteHomepageBenefit(id: string) {
  const { error } = await supabase.from("homepage_benefits").delete().eq("id", id);
  if (error) throw error;
}
