import { useState } from "react";
import { BigButton } from "./ui.jsx";
import { makeStory, permanentizeImages } from "../lib/stories.js";

const PRESETS = [
  "Going to the potty",
  "Brushing teeth",
  "Washing hands",
  "Getting dressed",
  "Eating dinner",
  "Going to bed",
  "Waiting my turn",
  "Asking for help",
  "Leaving the playground",
  "Going to the doctor",
];

export function StoryBuilder({ character, story = null, onSave, onCancel, childName = null }) {
  const isEditing = !!story;

  const [step, setStep] = useState(isEditing ? "review" : "describe");
  const [situation, setSituation] = useState(story?.situation ?? "");
  const [title,     setTitle]     = useState(story?.title ?? "");
  const [steps,     setSteps]     = useState(story?.steps ?? []);
  const [imageUrls, setImageUrls] = useState(() => {
    if (!story) return {};
    return Object.fromEntries(
      story.steps.flatMap((s, i) => s.imageUrl ? [[i, s.imageUrl]] : [])
    );
  });
  const [imgLoading,  setImgLoading]  = useState({}); // index → bool
  const [editIdx,     setEditIdx]     = useState(null);
  const [error,       setError]       = useState("");
  const [saving,      setSaving]      = useState(false);

  async function generate(sit) {
    const trimmed = sit.trim();
    if (!trimmed) return;
    setSituation(trimmed);
    setTitle(trimmed);
    setError("");
    setImageUrls({});
    setImgLoading({});
    setStep("loading");

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: trimmed, character }),
      });
      if (!res.ok) throw new Error("story API error");
      const data = await res.json();
      setSteps(data.steps);
      setStep("review");
    } catch {
      setError("Generation failed — check your connection and try again.");
      setStep("describe");
    }
  }

  async function generateStepImage(i) {
    setImgLoading(prev => ({ ...prev, [i]: true }));
    try {
      const r = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepText: steps[i].text, character }),
      });
      const d = r.ok ? await r.json() : null;
      if (d?.imageUrl) setImageUrls(prev => ({ ...prev, [i]: d.imageUrl }));
    } catch {}
    setImgLoading(prev => ({ ...prev, [i]: false }));
  }

  function generateAllImages() {
    steps.forEach((_, i) => {
      if (!imageUrls[i] && !imgLoading[i]) generateStepImage(i);
    });
  }

  function updateStep(i, field, val) {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }

  async function save() {
    setSaving(true);
    const stepsWithImages = steps.map((s, i) => ({ ...s, imageUrl: imageUrls[i] ?? s.imageUrl ?? null }));
    const finalSteps = await permanentizeImages(stepsWithImages);
    const saved = makeStory({
      title: title.trim() || situation,
      situation,
      character,
      steps: finalSteps,
      id: story?.id,
      createdAt: story?.createdAt,
      forChild: story?.forChild ?? childName,
    });
    onSave(saved);
  }

  /* ── Step: describe ── */
  if (step === "describe") {
    return (
      <div className="parentview">
        <h2>New story</h2>
        <p className="pv-note">Describe a situation or routine. {character.emoji} {character.name} will be the character.</p>
        {error && <p className="story-error">{error}</p>}
        <div className="story-presets">
          {PRESETS.map(p => (
            <button key={p} className="story-preset-btn" onClick={() => generate(p)}>{p}</button>
          ))}
        </div>
        <p className="pv-note" style={{ marginTop: 16 }}>Or describe your own:</p>
        <div className="wizard-custom-row">
          <input
            className="wizard-text-input"
            placeholder="e.g. Going to a fire drill at school"
            value={situation}
            onChange={e => setSituation(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate(situation)}
            autoFocus
          />
          <BigButton className="small primary" onClick={() => generate(situation)}>Generate →</BigButton>
        </div>
        <div className="pv-row" style={{ marginTop: 20 }}>
          <button onClick={onCancel}>← Cancel</button>
        </div>
      </div>
    );
  }

  /* ── Step: loading ── */
  if (step === "loading") {
    return (
      <div className="parentview" style={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div className="story-spinner" />
        <p className="pv-note">Generating story for "{situation}"…</p>
      </div>
    );
  }

  /* ── Step: review ── */
  return (
    <div className="parentview">
      <h2>{isEditing ? "Edit story" : "Review story"}</h2>
      <div className="pv-row" style={{ marginBottom: 8, gap: 8 }}>
        <label className="review-field-label" style={{ alignSelf: "center" }}>Title</label>
        <input
          className="wizard-text-input full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <div className="pv-row" style={{ marginBottom: 4, gap: 8 }}>
        <p className="pv-note" style={{ margin: 0 }}>Tap ✏️ to edit text, 🎨 to generate image.</p>
        {steps.some((_, i) => !imageUrls[i]) && (
          <button className="story-gen-all-btn" onClick={generateAllImages}>🎨 Generate all</button>
        )}
      </div>
      <div className="review-items">
        {steps.map((s, i) => (
          <div key={i} className={`review-card story-review-card ${editIdx === i ? "editing" : ""}`}>
            <div className="story-thumb-wrap">
              {imageUrls[i]
                ? <img src={imageUrls[i]} alt={s.text} className="story-thumb" />
                : imgLoading[i]
                  ? <div className="story-thumb-spinner"><div className="story-spinner-sm" /></div>
                  : <button className="story-gen-img-btn" onClick={() => generateStepImage(i)} title="Generate image">🎨</button>}
            </div>
            {editIdx === i ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="review-field-label">Step text</label>
                <input className="wizard-text-input full" value={s.text} onChange={e => updateStep(i, "text", e.target.value)} />
                <button className="review-done-btn" onClick={() => setEditIdx(null)}>Done ✓</button>
              </div>
            ) : (
              <>
                <p className="review-card-text" style={{ flex: 1 }}>
                  <strong>{i + 1}.</strong> {s.text}
                </p>
                <button className="review-edit-btn" onClick={() => setEditIdx(i)}>✏️</button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="pv-row" style={{ marginTop: 16 }}>
        {!isEditing && (
          <button onClick={() => { setStep("describe"); setSteps([]); setImageUrls({}); setImgLoading({}); }}>← Regenerate</button>
        )}
        <button onClick={onCancel}>Cancel</button>
        <BigButton className="primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save story ✓"}
        </BigButton>
      </div>
    </div>
  );
}
