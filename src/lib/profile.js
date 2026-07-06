import { supabase } from "./supabase.js";

export async function getProfiles() {
  if (!supabase) return [];
  const { data } = await supabase
    .from("child_profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return data || [];
}

export async function createProfile(name) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("child_profiles")
    .insert({ name, parent_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
