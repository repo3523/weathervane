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

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.error("search-images: PIXABAY_API_KEY not configured");
    return res.status(500).json({ error: "search not configured" });
  }

  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("image_type", "all"); // mixes in illustrations/vectors (cartoons) alongside real photos
  url.searchParams.set("category", "animals");
  url.searchParams.set("safesearch", "true"); // defaults to false — must set explicitly
  url.searchParams.set("per_page", "8");

  try {
    const r = await fetch(url);
    if (!r.ok) {
      console.error("search-images: Pixabay error", r.status, await r.text());
      return res.status(502).json({ error: "search failed" });
    }
    const data = await r.json();
    const photos = (data.hits ?? [])
      .filter((h) => h.largeImageURL && h.webformatURL)
      .map((h) => ({
        full: h.largeImageURL,
        thumbnail: h.webformatURL,
        title: h.tags || query,
      }));
    return res.status(200).json({ photos });
  } catch (err) {
    console.error("search-images error:", err?.message ?? err);
    return res.status(500).json({ error: "search failed" });
  }
}
