import { useState } from "react";
import { BigButton, EmojiImg } from "./ui.jsx";
import { INTEREST_PACKS, generateThemeContent } from "../lib/themes.js";

const SOUND_CHIPS = [
  { label: "Roars",   verb: "roars",    verbPast: "roared",    exclaim: "Roaar"     },
  { label: "Zooms",   verb: "zooms",    verbPast: "zoomed",    exclaim: "Whoosh"    },
  { label: "Flies",   verb: "flies",    verbPast: "flew",      exclaim: "Whoosh"    },
  { label: "Swims",   verb: "swims",    verbPast: "swam",      exclaim: "Splash"    },
  { label: "Growls",  verb: "growls",   verbPast: "growled",   exclaim: "Grr"       },
  { label: "Hops",    verb: "hops",     verbPast: "hopped",    exclaim: "Hop hop"   },
  { label: "Plays",   verb: "plays",    verbPast: "played",    exclaim: "Yay"       },
  { label: "Meows",   verb: "meows",    verbPast: "meowed",    exclaim: "Meow"      },
];

function genId() {
  return crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

/* ── Content review + inline edit ── */
function ContentReview({ content, char, onContentChange }) {
  const [tab, setTab] = useState("rhymes");
  const [editIdx, setEditIdx] = useState(null);

  function updateRhyme(i, field, val) {
    const updated = content.rhymes.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onContentChange({ ...content, rhymes: updated });
  }

  function updateWord(i, field, val) {
    const updated = content.words.map((w, idx) => idx === i ? { ...w, [field]: val } : w);
    onContentChange({ ...content, words: updated });
  }

  function updateSearch(i, field, val) {
    const updated = content.searches.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onContentChange({ ...content, searches: updated });
  }

  const tabs = [
    { id: "rhymes", label: `Rhymes (${content.rhymes.length})` },
    { id: "words",  label: `Words (${content.words.length})` },
    { id: "search", label: `Search (${content.searches.length})` },
  ];

  return (
    <div className="review-panel">
      <div className="review-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`review-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); setEditIdx(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="review-items">
        {tab === "rhymes" && content.rhymes.map((r, i) => (
          <div key={i} className={`review-card ${editIdx === i ? "editing" : ""}`}>
            {editIdx === i ? (
              <>
                <label className="review-field-label">Line 1</label>
                <input className="wizard-text-input full" value={r.line1} onChange={e => updateRhyme(i, "line1", e.target.value)} />
                <label className="review-field-label">Line 2 (leads to blank)</label>
                <input className="wizard-text-input full" value={r.line2} onChange={e => updateRhyme(i, "line2", e.target.value)} />
                <label className="review-field-label">Answer</label>
                <input className="wizard-text-input full" value={r.answer} onChange={e => updateRhyme(i, "answer", e.target.value)} />
                <button className="review-done-btn" onClick={() => setEditIdx(null)}>Done ✓</button>
              </>
            ) : (
              <>
                <p className="review-card-text">{r.line1}<br /><em>{r.line2}</em> <span className="blank">__{r.answer}__</span></p>
                <button className="review-edit-btn" onClick={() => setEditIdx(i)}>✏️ Edit</button>
              </>
            )}
          </div>
        ))}

        {tab === "words" && content.words.map((w, i) => (
          <div key={i} className={`review-card ${editIdx === i ? "editing" : ""}`}>
            {editIdx === i ? (
              <>
                <label className="review-field-label">Word</label>
                <input className="wizard-text-input full" value={w.word} onChange={e => updateWord(i, "word", e.target.value)} />
                <button className="review-done-btn" onClick={() => setEditIdx(null)}>Done ✓</button>
              </>
            ) : (
              <>
                <p className="review-card-text"><span style={{ fontSize: 24 }}>{w.emoji}</span> <strong>{w.word}</strong></p>
                <button className="review-edit-btn" onClick={() => setEditIdx(i)}>✏️ Edit</button>
              </>
            )}
          </div>
        ))}

        {tab === "search" && content.searches.map((s, i) => (
          <div key={i} className={`review-card ${editIdx === i ? "editing" : ""}`}>
            {editIdx === i ? (
              <>
                <label className="review-field-label">Clue</label>
                <input className="wizard-text-input full" value={s.clue} onChange={e => updateSearch(i, "clue", e.target.value)} />
                <label className="review-field-label">Answer word</label>
                <input className="wizard-text-input full" value={s.answer} onChange={e => updateSearch(i, "answer", e.target.value)} />
                <button className="review-done-btn" onClick={() => setEditIdx(null)}>Done ✓</button>
              </>
            ) : (
              <>
                <p className="review-card-text">{s.clue} → <strong>{s.answer} {s.emoji}</strong></p>
                <button className="review-edit-btn" onClick={() => setEditIdx(i)}>✏️ Edit</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Wizard ── */
// Custom path flow: custom_avatar → custom_sound → custom_name → review
export function ThemeWizard({ onSave, onCancel }) {
  const [step, setStep] = useState("pack");
  const [char, setChar] = useState({ name: "", emoji: "⭐", verb: "", verbPast: "", exclaim: "" });
  const [nameInput,   setNameInput]   = useState("");
  const [emojiInput,  setEmojiInput]  = useState("");
  const [editContent, setEditContent] = useState(null);
  const [isCustom,    setIsCustom]    = useState(false);

  // Avatar generation state
  const [avatarDescription, setAvatarDescription] = useState("");
  const [avatarPreview,     setAvatarPreview]     = useState(null);
  const [avatarLoading,     setAvatarLoading]     = useState(false);
  const [avatarError,       setAvatarError]       = useState("");

  /* ── Preset interest pack ── */
  function pickPack(pack) {
    setIsCustom(false);
    setChar(pack.character);
    setEditContent({ rhymes: pack.rhymes, words: pack.words, searches: pack.searches, feelings: pack.feelings, says: pack.says });
    setStep("review");
  }

  function startCustom() {
    setIsCustom(true);
    setChar({ name: "", emoji: "⭐", verb: "", verbPast: "", exclaim: "" });
    setNameInput("");
    setEmojiInput("");
    setAvatarDescription("");
    setAvatarPreview(null);
    setAvatarError("");
    setStep("custom_avatar");
  }

  /* ── Avatar step ── */
  async function generateAvatar() {
    if (!avatarDescription.trim()) return;
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const r = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: avatarDescription.trim() }),
      });
      const d = r.ok ? await r.json() : null;
      if (d?.imageUrl) setAvatarPreview(d.imageUrl);
      else setAvatarError("Generation failed — try again or skip.");
    } catch {
      setAvatarError("Generation failed — try again or skip.");
    }
    setAvatarLoading(false);
  }

  function useAvatar() {
    setChar(prev => ({ ...prev, avatarUrl: avatarPreview, visualDescription: avatarDescription.trim() }));
    setStep("custom_sound");
  }

  /* ── Sound step ── */
  function pickSound(chip) {
    setChar(prev => ({ ...prev, verb: chip.verb, verbPast: chip.verbPast, exclaim: chip.exclaim }));
    setStep("custom_name");
  }

  /* ── Name step (last) ── */
  function submitCustomName() {
    const name = nameInput.trim().toLowerCase();
    if (!name) return;
    const emoji = emojiInput.trim() || "⭐";
    const c = { ...char, name, emoji };
    setChar(c);
    const content = generateThemeContent(c);
    setEditContent(content);
    setStep("review");
  }

  /* ── Save ── */
  function save() {
    const theme = {
      id: genId(),
      name: char.name[0].toUpperCase() + char.name.slice(1),
      createdAt: new Date().toISOString(),
      character: char,
      ...editContent,
    };
    onSave(theme);
  }

  /* ── Step: pack selection ── */
  if (step === "pack") {
    return (
      <div className="parentview">
        <h2>What does your child love?</h2>
        <p className="pv-note">Pick an interest pack below. The rhymes, words, and search clues will all be built around that theme — you can review and edit every item before saving.</p>
        <div className="pack-grid">
          {INTEREST_PACKS.map(p => (
            <button key={p.id} className="pack-card" onClick={() => pickPack(p)}>
              <EmojiImg emoji={p.character.emoji} size={72} />
              <span className="pack-name">{p.name}</span>
              <span className="pack-preview">"{p.preview.slice(0, 40)}…"</span>
            </button>
          ))}
          <button className="pack-card pack-custom" onClick={startCustom}>
            <span className="pack-em">✏️</span>
            <span className="pack-name">Build your own</span>
            <span className="pack-preview">Generate a custom character</span>
          </button>
        </div>
        <div className="pv-row" style={{ marginTop: 20 }}>
          <button onClick={onCancel}>← Cancel</button>
        </div>
      </div>
    );
  }

  /* ── Step: content review ── */
  if (step === "review" && editContent) {
    return (
      <div className="parentview">
        {isCustom && <p className="wizard-step-counter">Step 4 of 4</p>}
        <h2>
          {char.avatarUrl
            ? <img src={char.avatarUrl} alt={char.name} className="review-avatar-chip" />
            : char.emoji + " "
          }
          {char.name[0].toUpperCase() + char.name.slice(1)} — Review content
        </h2>
        <p className="pv-note">Tap ✏️ to edit any item. Everything is optional — save as-is if it looks good.</p>
        <ContentReview content={editContent} char={char} onContentChange={setEditContent} />
        <div className="pv-row" style={{ marginTop: 16 }}>
          <button onClick={() => setStep("pack")}>← Back</button>
          <BigButton className="primary" onClick={save}>Save theme ✓</BigButton>
        </div>
      </div>
    );
  }

  /* ── Step: custom avatar (FIRST in custom path) ── */
  if (step === "custom_avatar") {
    return (
      <div className="parentview">
        <p className="wizard-step-counter">Step 1 of 4</p>
        <h2>Create a character</h2>
        <p className="pv-note">Describe what your character looks like — colours, style, anything. The generated image becomes the avatar throughout the app.</p>
        <div className="wizard-custom-row">
          <input
            className="wizard-text-input"
            style={{ maxWidth: "100%", flex: 1 }}
            autoFocus
            value={avatarDescription}
            onChange={e => { setAvatarDescription(e.target.value); setAvatarPreview(null); }}
            onKeyDown={e => e.key === "Enter" && !avatarLoading && generateAvatar()}
            placeholder="e.g. a purple dragon with round glasses, a red rocket with big eyes…"
            disabled={avatarLoading}
          />
        </div>
        <div className="pv-row">
          <BigButton
            className="small primary"
            onClick={generateAvatar}
            disabled={avatarLoading || !avatarDescription.trim()}
          >
            {avatarLoading ? "Generating…" : "Generate image"}
          </BigButton>
        </div>
        {avatarError && <p className="story-error" style={{ marginTop: 8 }}>{avatarError}</p>}
        {avatarPreview && (
          <div className="avatar-preview-wrap">
            <img src={avatarPreview} alt="Character preview" className="avatar-preview" />
            <div className="pv-row" style={{ gap: 8, marginTop: 4 }}>
              <BigButton className="small primary" onClick={useAvatar}>Use this ✓</BigButton>
              <BigButton className="small" onClick={() => setAvatarPreview(null)}>Try again</BigButton>
            </div>
          </div>
        )}
        <div className="pv-row" style={{ marginTop: 16 }}>
          <button onClick={() => setStep("pack")}>← Back</button>
          {!avatarPreview && (
            <button
              onClick={() => setStep("custom_sound")}
              style={{ color: "var(--soft)" }}
            >
              Skip → choose sound
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Step: custom sound ── */
  if (step === "custom_sound") {
    return (
      <div className="parentview">
        <p className="wizard-step-counter">Step 2 of 4</p>
        <h2>What does your character do?</h2>
        <p className="pv-note">Tap the best match — this shapes the rhymes and search clues.</p>
        {char.avatarUrl && (
          <img src={char.avatarUrl} alt="character" className="avatar-preview" style={{ marginBottom: 8, borderColor: "transparent" }} />
        )}
        <div className="chip-grid">
          {SOUND_CHIPS.map(chip => (
            <button key={chip.verb} className="chip" onClick={() => pickSound(chip)}>
              <span className="chip-label">{chip.label}</span>
              <span className="chip-sub">{chip.exclaim}</span>
            </button>
          ))}
        </div>
        <div className="pv-row" style={{ marginTop: 24 }}>
          <button onClick={() => setStep("custom_avatar")}>← Back</button>
        </div>
      </div>
    );
  }

  /* ── Step: custom name (LAST in custom path) ── */
  if (step === "custom_name") {
    return (
      <div className="parentview">
        <p className="wizard-step-counter">Step 3 of 4</p>
        <h2>What's it called?</h2>
        <p className="pv-note">Give your character a name. Add an emoji too — it appears in rhyme decorations and on the theme button.</p>
        {char.avatarUrl && (
          <img src={char.avatarUrl} alt="character" className="avatar-preview" style={{ marginBottom: 8, borderColor: "transparent" }} />
        )}
        <div className="wizard-custom-row">
          <input
            className="wizard-text-input"
            autoFocus
            placeholder="e.g. Sparkle, Blaze, Cosmo…"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitCustomName()}
          />
          <BigButton className="small primary" onClick={submitCustomName}>Next →</BigButton>
        </div>
        <div className="wizard-custom-row" style={{ marginTop: 4 }}>
          <input
            className="wizard-text-input"
            style={{ maxWidth: 90 }}
            placeholder="🐉 emoji"
            value={emojiInput}
            onChange={e => setEmojiInput(e.target.value)}
          />
          <span className="pv-note" style={{ margin: 0 }}>Optional — paste one emoji for rhymes</span>
        </div>
        <div className="pv-row" style={{ marginTop: 20 }}>
          <button onClick={() => setStep("custom_sound")}>← Back</button>
        </div>
      </div>
    );
  }

  return null;
}
