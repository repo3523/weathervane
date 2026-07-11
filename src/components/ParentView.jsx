import { useEffect, useState } from "react";
import { storage } from "../lib/storage.js";
import { soundOn, setSound } from "../lib/speech.js";
import { loadThemes, loadThemesForChild, saveTheme, deleteTheme, getActiveThemeId, setActiveThemeId } from "../lib/themes.js";
import { loadStories, saveStory, deleteStory } from "../lib/stories.js";
import { supabase } from "../lib/supabase.js";
import { ThemeWizard } from "./ThemeWizard.jsx";
import { StoryBuilder } from "./StoryBuilder.jsx";

export function ParentView({ onClose, onThemeChange, profiles = [], activeChildId = null, onSwitchChild, onAddChild }) {
  const [page, setPage] = useState("settings"); // "settings" | "sessions"
  const [log, setLog] = useState([]);
  const [sound, setSoundState] = useState(soundOn());
  const [themes, setThemes] = useState(() => loadThemes());
  const [activeId, setActiveId] = useState(() => getActiveThemeId());
  const [showWizard, setShowWizard] = useState(false);
  const [showThemeGuide, setShowThemeGuide] = useState(false);
  const [showStoryBuilder, setShowStoryBuilder] = useState(false);
  const [editStory, setEditStory] = useState(null);
  const [stories, setStories] = useState(() => loadStories());

  // Add-child inline form
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [addChildError, setAddChildError] = useState("");

  useEffect(() => { storage.loadSessions().then(setLog); }, []);

  function toggleSound() {
    setSound(!sound);
    setSoundState(!sound);
  }

  async function clearAll() {
    if (window.confirm("Delete all session data?")) {
      await storage.clearAll();
      setLog([]);
    }
  }

  async function handleAddChild() {
    const name = newChildName.trim();
    if (!name) return;
    setAddingChild(true);
    setAddChildError("");
    try {
      await onAddChild(name);
      setNewChildName("");
      setShowAddChild(false);
    } catch {
      setAddChildError("Could not add child. Try again.");
    }
    setAddingChild(false);
  }

  function activateTheme(id) {
    setActiveThemeId(id);
    setActiveId(id);
    onThemeChange();
  }

  function handleDeleteTheme(id) {
    deleteTheme(id);
    const updated = loadThemes();
    setThemes(updated);
    const newActiveId = getActiveThemeId();
    setActiveId(newActiveId);
    if (id === activeId) onThemeChange();
  }

  async function handleSaveTheme(theme) {
    const saved = await saveTheme(theme);
    setThemes(loadThemes());
    activateTheme(saved.id);
    setShowWizard(false);
  }

  function actLabel(a) {
    if (a.total != null) return `${a.type} ${a.correct}/${a.total}`;
    if (a.weatherAfter) return `recheck→${a.weatherAfter}`;
    return a.type;
  }

  const activeTheme = themes.find(t => t.id === activeId) || themes[0];
  const activeChildName = profiles.find(p => p.id === activeChildId)?.name ?? null;

  if (showWizard) {
    return <ThemeWizard onSave={handleSaveTheme} onCancel={() => setShowWizard(false)} />;
  }

  if (showStoryBuilder || editStory) {
    return (
      <StoryBuilder
        character={activeTheme.character}
        story={editStory}
        childName={activeChildName}
        onSave={s => { saveStory(s); setStories(loadStories()); setShowStoryBuilder(false); setEditStory(null); }}
        onCancel={() => { setShowStoryBuilder(false); setEditStory(null); }}
      />
    );
  }

  return (
    <div className="parentview">
      {/* Top bar */}
      <div className="pv-topbar">
        <button className="pv-back-btn" onClick={onClose}>
          ← {activeTheme?.character.name || "wolf"}
        </button>
        <div className="pv-tabs">
          <button
            className={`pv-tab ${page === "settings" ? "active" : ""}`}
            onClick={() => setPage("settings")}
          >
            Settings
          </button>
          <button
            className={`pv-tab ${page === "sessions" ? "active" : ""}`}
            onClick={() => setPage("sessions")}
          >
            Sessions {log.length > 0 && <span className="pv-tab-badge">{log.length}</span>}
          </button>
        </div>
        <div className="pv-actions">
          <button onClick={toggleSound} title={`Sound: ${sound ? "ON" : "OFF"}`} className="pv-icon-btn">
            {sound ? "🔊" : "🔇"}
          </button>
          <button onClick={() => storage.exportJson()} title="Export JSON" className="pv-icon-btn">⬇</button>
          {supabase && (
            <button onClick={() => supabase.auth.signOut()} title="Sign out" className="pv-icon-btn" style={{ color: "#b3542e" }}>↪</button>
          )}
        </div>
      </div>

      {/* ── SETTINGS PAGE ── */}
      {page === "settings" && (
        <div className="pv-page">

          {/* Combined children + themes table */}
          <section className="pv-section">
            <div className="pv-section-header">
              <h3 className="pv-section-title">{supabase ? "Children & Themes" : "Themes"}</h3>
              <button className="pv-help-link" onClick={() => setShowThemeGuide(g => !g)}>
                {showThemeGuide ? "✕ close" : "? how themes work"}
              </button>
            </div>
            <table className="pv-table">
              <thead>
                <tr>
                  {supabase && <th>Child</th>}
                  <th>Themes</th>
                </tr>
              </thead>
              <tbody>
                {supabase ? (
                  <>
                    {profiles.map(p => {
                      const isActive = p.id === activeChildId;
                      const rowThemes = isActive ? themes : loadThemesForChild(p.id);
                      return (
                        <tr key={p.id} className={isActive ? "pv-table-active-row" : ""}>
                          <td className="pv-child-cell">
                            {isActive
                              ? <><span className="pv-child-dot" /><span className="pv-child-name">{p.name}</span></>
                              : <button className="pv-child-switch-btn" onClick={() => onSwitchChild?.(p)}>{p.name}</button>
                            }
                          </td>
                          <td className="pv-themes-cell">
                            <div className="pv-theme-chips">
                              {rowThemes.map(t => (
                                <div key={t.id} className="pv-chip-wrap">
                                  <button
                                    className={`pv-theme-chip ${isActive && t.id === activeId ? "active" : ""} ${!isActive ? "pv-chip-readonly" : ""}`}
                                    onClick={isActive ? () => activateTheme(t.id) : undefined}
                                  >
                                    {t.character.avatarUrl
                                      ? <img src={t.character.avatarUrl} alt="" className="pv-chip-avatar" />
                                      : <span>{t.character.emoji}</span>}
                                    {t.name}
                                  </button>
                                  {isActive && (
                                    <button
                                      className="pv-chip-del"
                                      title={`Remove ${t.name}`}
                                      onClick={() => handleDeleteTheme(t.id)}
                                    >×</button>
                                  )}
                                </div>
                              ))}
                              {isActive && (
                                <button className="pv-theme-chip pv-chip-new" onClick={() => setShowWizard(true)}>
                                  + New
                                </button>
                              )}
                              {!isActive && rowThemes.length === 0 && (
                                <span className="pv-chip-empty">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="pv-table-add-row">
                      <td colSpan="2">
                        {!showAddChild
                          ? <button className="pv-table-add-btn" onClick={() => { setShowAddChild(true); setAddChildError(""); }}>+ Add child</button>
                          : (
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <input
                                className="wizard-text-input"
                                style={{ maxWidth: 150 }}
                                autoFocus
                                placeholder="Child's name"
                                value={newChildName}
                                onChange={e => setNewChildName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddChild()}
                                disabled={addingChild}
                              />
                              <button className="review-done-btn" onClick={handleAddChild} disabled={addingChild || !newChildName.trim()}>
                                {addingChild ? "Adding…" : "Add"}
                              </button>
                              <button className="pv-table-btn" onClick={() => { setShowAddChild(false); setNewChildName(""); }}>Cancel</button>
                            </div>
                          )
                        }
                        {addChildError && <p className="story-error" style={{ marginTop: 4 }}>{addChildError}</p>}
                      </td>
                    </tr>
                  </>
                ) : (
                  /* No Supabase — single child, just themes */
                  <tr>
                    <td className="pv-themes-cell">
                      <div className="pv-theme-chips">
                        {themes.map(t => (
                          <div key={t.id} className="pv-chip-wrap">
                            <button
                              className={`pv-theme-chip ${t.id === activeId ? "active" : ""}`}
                              onClick={() => activateTheme(t.id)}
                            >
                              {t.character.avatarUrl
                                ? <img src={t.character.avatarUrl} alt="" className="pv-chip-avatar" />
                                : <span>{t.character.emoji}</span>}
                              {t.name}
                            </button>
                            <button
                              className="pv-chip-del"
                              title={`Remove ${t.name}`}
                              onClick={() => handleDeleteTheme(t.id)}
                            >×</button>
                          </div>
                        ))}
                        <button className="pv-theme-chip pv-chip-new" onClick={() => setShowWizard(true)}>
                          + New
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {showThemeGuide && (
              <div className="theme-guide">
                <div className="theme-guide-item">
                  <strong>What a theme does</strong>
                  <p>Swaps the character, rhymes, words, and search clues your child sees during a session. The structure — weather check, activities, goodbye ritual — never changes. Only the content skin does.</p>
                </div>
                <div className="theme-guide-item">
                  <strong>Why it matters</strong>
                  <p>Kids often engage more when learning is wrapped in something they are currently obsessed with. If wolf is fading and trains are the new thing, switching themes makes the same session feel completely fresh.</p>
                </div>
                <div className="theme-guide-item">
                  <strong>When to switch</strong>
                  <p>Any time you notice the child losing interest, or when a strong new interest emerges. Old session data is preserved — the log shows which theme was active each day so you can spot what works.</p>
                </div>
                <div className="theme-guide-item">
                  <strong>How to set one up</strong>
                  <p>Tap <strong>+ New theme</strong> → pick an interest pack → review and edit any content → Save. Then tap the theme to activate before the next session.</p>
                </div>
              </div>
            )}
          </section>

          {/* Stories */}
          <section className="pv-section">
            <div className="pv-section-header">
              <h3 className="pv-section-title">Stories</h3>
              <button className="active-theme-btn new-theme-btn pv-inline-action" onClick={() => setShowStoryBuilder(true)}>
                + New story
              </button>
            </div>
            {stories.length === 0
              ? <p className="pv-note">No stories yet. Tap + New story to create one.</p>
              : (
                <div className="story-mgmt-list">
                  {stories.map(s => (
                    <div key={s.id} className="story-mgmt-item">
                      <div className="story-mgmt-thumb">
                        {s.steps[0]?.imageUrl
                          ? <img src={s.steps[0].imageUrl} alt="" className="story-mgmt-img" />
                          : <span className="story-mgmt-emoji">{s.steps[0]?.sceneEmoji ?? "📖"}</span>}
                      </div>
                      <div className="story-mgmt-info">
                        <span className="story-mgmt-title">{s.title}</span>
                        <span className="story-mgmt-meta">
                          {s.steps.length} steps · {s.steps.filter(st => st.imageUrl).length} images
                          {s.forChild && <> · <span className="story-for-child">for {s.forChild}</span></>}
                        </span>
                      </div>
                      <button className="story-mgmt-btn" onClick={() => setEditStory(s)} title="Edit">✏️</button>
                      <button
                        className="story-mgmt-btn story-mgmt-del"
                        onClick={() => { if (window.confirm(`Delete "${s.title}"?`)) { deleteStory(s.id); setStories(loadStories()); } }}
                        title="Delete"
                      >×</button>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

          {/* Danger zone */}
          <section className="pv-section pv-danger">
            <button onClick={clearAll} className="pv-danger-btn">🗑 Clear all session data</button>
          </section>
        </div>
      )}

      {/* ── SESSIONS PAGE ── */}
      {page === "sessions" && (
        <div className="pv-page">
          <p className="pv-note" style={{ marginBottom: 12 }}>
            {log.length} session{log.length !== 1 ? "s" : ""} logged
            {supabase ? " and synced to your profile." : ". Data lives only on this device — export weekly."}
          </p>
          <table>
            <thead>
              <tr>
                <th>When</th><th>Theme</th><th>Weather</th><th>Track</th><th>Latency</th>
                <th>Activities</th><th>Rating</th><th>Time</th>
              </tr>
            </thead>
            <tbody>
              {log.length === 0 && (
                <tr><td colSpan="8" style={{ color: "var(--soft)" }}>No sessions yet.</td></tr>
              )}
              {log.slice().reverse().map((s, i) => (
                <tr key={i}>
                  <td>{new Date(s.date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td>{s.themeId || "wolf"}</td>
                  <td>{s.weather || ""}</td>
                  <td>{s.track || ""}</td>
                  <td>{s.avgLatencyMs ?? "—"}</td>
                  <td>{(s.activities || []).map(actLabel).join(", ")}</td>
                  <td>{s.rating || ""}</td>
                  <td>{Math.round((s.durationSec || 0) / 60)}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
