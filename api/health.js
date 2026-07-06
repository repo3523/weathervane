// Diagnostic endpoint — checks env var presence without exposing values.
// Remove this file once confirmed working.
export default function handler(req, res) {
  const openAIKey = process.env.OPENAI_API_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  return res.status(200).json({
    openai: {
      present: !!openAIKey,
      prefix: openAIKey ? openAIKey.slice(0, 7) + "…" : "MISSING",
    },
    anthropic: {
      present: !!anthropicKey,
      prefix: anthropicKey ? anthropicKey.slice(0, 7) + "…" : "MISSING",
    },
  });
}
