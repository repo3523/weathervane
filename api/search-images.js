import { ANIMAL_SEARCHES } from "../src/lib/content.js";

const ALLOWED = new Set(ANIMAL_SEARCHES.map((a) => a.name));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { animal } = req.body ?? {};
  const query = String(animal ?? "").trim().toLowerCase();

  // Never trust the client — only ever search terms from the shared whitelist,
  // even though the UI autocomplete already restricts to it.
  if (!ALLOWED.has(query)) {
    return res.status(400).json({ error: "animal not allowed" });
  }

  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) {
    console.error("search-images: GOOGLE_CSE_API_KEY/GOOGLE_CSE_CX not configured");
    return res.status(500).json({ error: "search not configured" });
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", `${query} animal`);
  url.searchParams.set("searchType", "image");
  url.searchParams.set("safe", "active");
  url.searchParams.set("imgSize", "large");
  url.searchParams.set("num", "8");

  try {
    const r = await fetch(url);
    if (!r.ok) {
      console.error("search-images: Google CSE error", r.status, await r.text());
      return res.status(502).json({ error: "search failed" });
    }
    const data = await r.json();
    const photos = (data.items ?? [])
      .filter((item) => item.link && item.image?.thumbnailLink)
      .map((item) => ({
        full: item.link,
        thumbnail: item.image.thumbnailLink,
        title: item.title ?? query,
      }));
    return res.status(200).json({ photos });
  } catch (err) {
    console.error("search-images error:", err?.message ?? err);
    return res.status(500).json({ error: "search failed" });
  }
}
