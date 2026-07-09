import { useEffect, useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { say } from "../lib/speech.js";
import { confetti } from "../lib/fx.js";
import { CharacterCorner } from "./screens.jsx";

const ADVANCE_DELAY = 3000; // ms before forward tap is accepted

function BookPage({ step, character, dim = false, pageNum = null, titlePage = null }) {
  return (
    <div className={`book-page ${dim ? "book-page-dim" : ""}`}>
      {titlePage
        ? <div className="book-title-page">
            <span className="book-title-rule" />
            <p className="book-title-text">{titlePage}</p>
            <span className="book-title-rule" />
          </div>
        : <>
            {step?.imageUrl
              ? <img src={step.imageUrl} alt={step.text} className="book-page-img"
                  onError={e => { e.target.style.display = "none"; }} />
              : <div className="book-page-fallback">
                  <span className="book-scene-emoji">{step?.sceneEmoji ?? "📖"}</span>
                </div>
            }
            <p className="book-page-text">{step?.text}</p>
          </>
      }
      {pageNum != null && <span className="book-page-num">{pageNum}</span>}
    </div>
  );
}

export function StoryReader({ story, onDone }) {
  const [view, setView] = useState("cover"); // "cover" | "reading" | "done"
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const total = story.steps.length;
  const current = story.steps[page];
  const prev = page > 0 ? story.steps[page - 1] : null;

  // Preload all images when story opens
  useEffect(() => {
    story.steps.forEach(s => { if (s.imageUrl) { const img = new Image(); img.src = s.imageUrl; } });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (view !== "reading") return;
    setReady(false);
    // Announce "next page" when the delay clears
    const t = setTimeout(() => setReady(true), ADVANCE_DELAY);
    say(current.text);
    for (let ahead = 1; ahead <= 2; ahead++) {
      const next = story.steps[page + ahead];
      if (next?.imageUrl) { const img = new Image(); img.src = next.imageUrl; }
    }
    return () => clearTimeout(t);
  }, [page, view]); // eslint-disable-line

  function openBook() {
    setView("reading");
  }

  function advance(e) {
    if (view === "done") { if (ready) onDone(); return; }
    if (!ready) return;
    if (page < total - 1) {
      setPage(p => p + 1);
    } else {
      setView("done");
      confetti();
      say("Great job! The end.");
      setReady(false);
      setTimeout(() => setReady(true), 1200);
    }
  }

  function goBack(e) {
    e.stopPropagation();
    if (page > 0) setPage(p => p - 1);
    else setView("cover");
  }

  // ── Cover ──
  if (view === "cover") {
    const coverImg = story.steps[0]?.imageUrl;
    return (
      <div className="story-cover fade-in" onClick={openBook}>
        <div className="story-cover-book">
          {coverImg
            ? <img src={coverImg} alt={story.title} className="story-cover-book-img" />
            : <div className="story-cover-book-placeholder">
                <Wolf face={story.character.emoji} mood="happy" size="lg" avatarUrl={story.character.avatarUrl} />
              </div>
          }
          <div className="story-cover-book-label">
            <h2 className="story-cover-title">{story.title}</h2>
          </div>
        </div>
        <p className="story-cover-tap">Tap to open</p>
      </div>
    );
  }

  // ── Done ──
  if (view === "done") {
    return (
      <div className="story-reading fade-in" onClick={advance}>
        <Wolf face={story.character.emoji} mood="happy" size="lg" avatarUrl={story.character.avatarUrl} />
        <h1 style={{ color: "#f4e8c0", textAlign: "center", margin: 0 }}>Great job! 🌟</h1>
        <p style={{ color: "rgba(244,232,192,0.6)", fontSize: 14, margin: 0 }}>
          {ready ? "Tap to go back" : "…"}
        </p>
      </div>
    );
  }

  // ── Reading — open book spread ──
  return (
    <div className="story-reading fade-in" onClick={advance}>
      <CharacterCorner />
      <p className="story-reading-title">{story.title}</p>
      <div className="story-book">
        {/* Left page — previous step, or title page on step 0 */}
        <BookPage
          step={prev}
          character={story.character}
          dim
          pageNum={page > 0 ? page : null}
          titlePage={page === 0 ? story.title : null}
        />

        <div className="book-spine">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="book-coil" />
          ))}
        </div>

        {/* Right page — current step, animates in on each page change */}
        <BookPage
          key={page}
          step={current}
          character={story.character}
          pageNum={page + 1}
        />
      </div>

      {/* Controls below the book */}
      <div className="story-book-controls">
        <button
          className="book-nav-btn"
          onClick={goBack}
          title="Previous page"
        >
          ←
        </button>
        <div className="story-progress">
          {story.steps.map((_, i) => (
            <span key={i} className={`dot ${i < page ? "done" : i === page ? "now" : ""}`} />
          ))}
        </div>
        <p className={`story-sub book-sub ${ready ? "" : "story-sub-waiting"}`}>
          {ready ? "Next page →" : "…"}
        </p>
      </div>

      {!ready && (
        <div
          key={`timer-${page}`}
          className="story-page-timer"
          style={{ animationDuration: `${ADVANCE_DELAY}ms` }}
        />
      )}
    </div>
  );
}

/* Shelf shown on the start screen — lists saved stories. */
export function StoryShelf({ stories, onOpen, onClose }) {
  if (stories.length === 0) {
    return (
      <div className="screen fade-in">
        <h1>Stories</h1>
        <p style={{ color: "var(--soft)", textAlign: "center" }}>
          No stories yet. Ask a grown-up to make one!
        </p>
        <BigButton onClick={onClose}>← Back</BigButton>
      </div>
    );
  }

  return (
    <div className="screen fade-in">
      <h1>Stories</h1>
      <div className="story-shelf">
        {stories.map(s => (
          <button key={s.id} className="story-shelf-btn" onClick={() => onOpen(s)}>
            {s.steps[0]?.imageUrl
              ? <img src={s.steps[0].imageUrl} alt={s.title} className="story-shelf-thumb" onError={e => { e.target.style.display = "none"; }} />
              : <span className="story-shelf-emoji">{s.steps[0]?.sceneEmoji ?? "📖"}</span>}
            <span className="story-shelf-title">{s.title}</span>
          </button>
        ))}
      </div>
      <BigButton onClick={onClose} style={{ marginTop: 24 }}>← Back</BigButton>
    </div>
  );
}
