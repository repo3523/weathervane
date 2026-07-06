import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { stepText, character } = req.body ?? {};
  if (!stepText || !character) return res.status(400).json({ error: "stepText and character required" });

  if (!process.env.OPENAI_API_KEY) {
    console.error("generate-image: OPENAI_API_KEY not set");
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
  }

  const charDesc = character.visualDescription
    ? character.visualDescription
    : character.name === "wolf" ? "a friendly cartoon wolf"
    : character.name === "train" ? "a friendly cartoon train character with a face"
    : `a friendly cartoon ${character.name}`;

  const prompt = `Child-friendly storybook illustration: ${charDesc} is ${stepText.toLowerCase().replace(/^[^a-z]*/i, "")}. Soft warm pastel colors, simple clean background, clear action, warm friendly style. No text, no words, no letters in the image.`;

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    });
    const imageUrl = response.data[0].url ?? `data:image/png;base64,${response.data[0].b64_json}`;
    return res.status(200).json({ imageUrl });
  } catch (err) {
    const msg = err?.message ?? "unknown error";
    console.error("generate-image error:", msg);
    return res.status(500).json({ error: "image generation failed", detail: msg });
  }
}
