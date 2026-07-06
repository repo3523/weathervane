import { supabase } from "./supabase.js";
import { activeChildId } from "./sync.js";

const KEY = "wv_stories";

function genId() {
  return crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

export function loadStories() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export function saveStory(story) {
  const stories = loadStories();
  const idx = stories.findIndex(s => s.id === story.id);
  if (idx >= 0) stories[idx] = story;
  else stories.push(story);
  localStorage.setItem(KEY, JSON.stringify(stories));
  // Fire-and-forget sync to Supabase
  if (supabase && activeChildId) {
    supabase.from("stories")
      .upsert({ id: story.id, child_id: activeChildId, data: story, created_at: story.createdAt })
      .then().catch(() => {});
  }
  return story;
}

export function deleteStory(id) {
  localStorage.setItem(KEY, JSON.stringify(loadStories().filter(s => s.id !== id)));
  if (supabase && activeChildId) {
    supabase.from("stories").delete().eq("id", id).then().catch(() => {});
  }
}

export function makeStory({ title, situation, character, steps, id, createdAt, forChild }) {
  return { id: id ?? genId(), title, situation, character, steps, createdAt: createdAt ?? new Date().toISOString(), forChild: forChild ?? null };
}

// Convert a URL or data-URI to a Blob for uploading.
async function toBlob(url) {
  if (url.startsWith("data:")) {
    const [meta, b64] = url.split(",");
    const mime = meta.split(":")[1].split(";")[0];
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.blob();
}

// Upload images to Supabase Storage at save time, returning permanent URLs.
// Handles both temporary https:// URLs and data: URIs (gpt-image-1 returns b64).
// Falls back to the original URL/data-URI on any error — the story still saves.
export async function permanentizeImages(steps) {
  if (!supabase) return steps;
  return Promise.all(steps.map(async (step, i) => {
    if (!step.imageUrl) return step;
    try {
      const blob = await toBlob(step.imageUrl);
      const ext = blob.type === "image/webp" ? "webp" : "png";
      const filename = `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("story-images")
        .upload(filename, blob, { contentType: blob.type, upsert: false });
      if (error) return step;
      const { data: { publicUrl } } = supabase.storage
        .from("story-images")
        .getPublicUrl(filename);
      return { ...step, imageUrl: publicUrl };
    } catch {
      return step;
    }
  }));
}
