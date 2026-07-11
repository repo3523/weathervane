import { supabase } from "./supabase.js";

// Set once when the parent authenticates; enables cloud sync in all modules.
// Exported as a live binding — importers always see the latest value.
export let activeChildId = null;

export function setActiveChildId(id) {
  activeChildId = id;
}

// Pull stories and custom themes from Supabase into localStorage.
// Stories are account-wide: fetched for all children in the account.
// Themes are per-child: fetched only for the active child.
// Merge-only (adds missing items); deletion sync is out of scope for v0.
export async function pullFromSupabase(childId, allChildIds = null) {
  if (!supabase || !childId) return;

  const STORIES_KEY = "wv_stories";
  const THEMES_KEY  = "wv_themes";

  // Fetch stories for all children so they're shared across the account.
  const storyIds = allChildIds?.length ? allChildIds : [childId];
  try {
    const { data } = await supabase
      .from("stories")
      .select("data")
      .in("child_id", storyIds);

    if (data?.length) {
      const local = JSON.parse(localStorage.getItem(STORIES_KEY) || "[]");
      const seen  = new Set(local.map(s => s.id));
      const fresh = data.map(r => r.data).filter(s => s && !seen.has(s.id));
      if (fresh.length) localStorage.setItem(STORIES_KEY, JSON.stringify([...local, ...fresh]));
    }
  } catch {}

  try {
    const { data } = await supabase
      .from("themes")
      .select("child_id, data")
      .in("child_id", storyIds);

    // Group by child and replace each child's cache (full replacement, no merge).
    const byChild = {};
    data?.forEach(r => {
      if (r.data?.id && r.child_id) {
        (byChild[r.child_id] ??= []).push(r.data);
      }
    });
    storyIds.forEach(cid => {
      localStorage.setItem(`wv_themes_${cid}`, JSON.stringify(byChild[cid] ?? []));
    });
  } catch {}
}
