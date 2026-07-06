import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { situation, character } = req.body ?? {};
  if (!situation?.trim()) {
    return res.status(400).json({ error: "situation is required" });
  }

  const charName = character?.name ?? "friend";
  const charEmoji = character?.emoji ?? "🌟";

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Create a Social Story for an autistic child aged 6–10.

Situation: ${situation}
Character: ${charName} ${charEmoji}

Generate exactly 6 steps. Rules:
- One sentence per step, maximum 10 words
- Simple, literal, concrete language — no idioms or figures of speech
- Use "${charName}" as the subject (not "I")
- Clear sequence: preparation → action steps → completion → positive feeling
- End with a calm, positive outcome
- Pick one relevant scene emoji per step (single emoji only)

Return ONLY a valid JSON object, no explanation:
{"steps":[{"text":"...","sceneEmoji":"..."},...]}`
      }]
    });

    const raw = message.content[0].text.trim();
    // Strip markdown code fences if the model wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const data = JSON.parse(cleaned);

    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      return res.status(500).json({ error: "unexpected response shape" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("generate-story error:", err);
    return res.status(500).json({ error: "generation failed" });
  }
}
