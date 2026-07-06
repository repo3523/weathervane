import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { description } = req.body ?? {};
  if (!description) return res.status(400).json({ error: "description required" });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
  }

  const prompt = `Children's storybook character portrait: ${description.slice(0, 300)}. Full body, plain white background, soft warm pastel colors, friendly rounded shapes, cute storybook illustration style. No text, no words.`;

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
    console.error("generate-character error:", msg);
    return res.status(500).json({ error: "image generation failed", detail: msg });
  }
}
