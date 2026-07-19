import { useEffect, useRef, useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { say } from "../lib/speech.js";
import { chimeSoft } from "../lib/fx.js";
import { pick, ANIMAL_FACTS } from "../lib/content.js";
import { useTheme } from "../lib/ThemeContext.jsx";

const SWING_SECONDS = 5 * 60;
const RING = 326.7; // circumference of r=52 circle

/* X1 — Swing break: the app sends him to the real swing and waits. */
export function SwingBreak({ onBack }) {
  const t = useTheme();
  const [left, setLeft] = useState(SWING_SECONDS);

  useEffect(() => {
    const name = t.character.name[0].toUpperCase() + t.character.name.slice(1);
    say(`Time to swing! ${name} will wait for you.`);
    const iv = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(iv);
  }, [t.character.name]);

  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");

  return (
    <div className="screen fade-in">
      <Wolf />
      <h1>Time to swing!</h1>
      <p className="sub">{t.character.name[0].toUpperCase() + t.character.name.slice(1)} will wait for you</p>
      <svg className="timer-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5ddcf" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="52" fill="none" stroke="#7fb069" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={RING}
          strokeDashoffset={RING * (1 - left / SWING_SECONDS)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="68" textAnchor="middle" fontSize="26" fontWeight="800" fill="#3d3a34">
          {m}:{s}
        </text>
      </svg>
      <div className="row">
        <BigButton className="primary" onClick={() => { say("Welcome back, friend!"); onBack(); }}>
          🐾 I'm back!
        </BigButton>
      </div>
    </div>
  );
}

/* X2 — Den time: no goals, no score, exit anytime. */
export function DenTime({ onDone }) {
  const [bubbles, setBubbles] = useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    say("Den time. Nice and calm.");
    const iv = setInterval(() => {
      setBubbles((bs) => {
        if (bs.length > 6) return bs;
        const id = nextId.current++;
        setTimeout(() => setBubbles((cur) => cur.filter((b) => b.id !== id)), 7000);
        return [...bs, {
          id,
          em: pick(["🫧", "✨", "🌙", "💧", "🍃"]),
          size: 50 + Math.random() * 50,
          left: 5 + Math.random() * 82,
          top: 15 + Math.random() * 60,
        }];
      });
    }, 900);
    return () => clearInterval(iv);
  }, []);

  function popBubble(id) {
    chimeSoft();
    setBubbles((bs) => bs.filter((b) => b.id !== id));
  }

  return (
    <div className="screen fade-in">
      <h1>Den time</h1>
      <p className="sub">Pop bubbles, or just watch. Tap 🌙 when done.</p>
      <div className="bubblezone">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="bubble"
            style={{ width: b.size, height: b.size, left: b.left + "%", top: b.top + "%" }}
            onPointerDown={() => popBubble(b.id)}
          >
            {b.em}
          </div>
        ))}
      </div>
      <div className="row bottom-row">
        <BigButton className="small" onClick={onDone}>🌙 Done</BigButton>
      </div>
    </div>
  );
}

const MAX_ANIMAL_SEARCHES = 4;

/* X3 — Animal photos: real photos of an animal he picks, several at once so he
   can see it from different angles — his own Google-Images habit, on a leash.
   No score, no wrong answers, exit anytime. Search count is capped (see
   MAX_ANIMAL_SEARCHES) so open-ended photo browsing doesn't turn into the kind
   of perseverative loop the validation plan watches for. */
export function AnimalPhotos({ onComplete }) {
  const t = useTheme();
  const [typed, setTyped] = useState("");
  const [current, setCurrent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty | error
  const [viewerIndex, setViewerIndex] = useState(null);
  const searched = useRef([]);
  const cache = useRef({});

  useEffect(() => { say("Let's look at animal photos! Type an animal you like."); }, []);

  const doneSearching = searched.current.length >= MAX_ANIMAL_SEARCHES;

  async function pickAnimal(name) {
    if (!name) return;
    setTyped("");
    setViewerIndex(null);
    setCurrent(name);

    if (cache.current[name]) {
      setPhotos(cache.current[name]);
      setStatus(cache.current[name].length ? "ready" : "empty");
      if (cache.current[name].length && ANIMAL_FACTS[name]) say(ANIMAL_FACTS[name]);
      return;
    }

    setStatus("loading");
    try {
      const r = await fetch("/api/search-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animal: name }),
      });
      const data = await r.json();
      const found = r.ok ? (data.photos ?? []) : [];
      cache.current[name] = found;
      setPhotos(found);
      setStatus(found.length ? "ready" : "empty");
      // Only count searches that actually turned up something — a mistyped
      // or unlisted animal shouldn't eat into his search budget.
      if (found.length) {
        searched.current = [...new Set([...searched.current, name])];
        if (ANIMAL_FACTS[name]) say(ANIMAL_FACTS[name]);
      }
    } catch {
      setStatus("error");
    }
  }

  function submitSearch() {
    pickAnimal(typed.trim().toLowerCase());
  }

  function dropPhoto(bad) {
    setPhotos((ps) => ps.filter((p) => p.full !== bad.full));
  }

  function finish() {
    onComplete({ animals: searched.current });
  }

  return (
    <div className="screen fade-in">
      <Wolf face={t.character.emoji} size="sm" avatarUrl={t.character.avatarUrl} />
      <h1>Animal photos</h1>

      {!doneSearching && status !== "loading" && (
        <>
          <p className="sub">Type an animal to see pictures</p>
          <div className="searchbox">
            🔍
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              placeholder="Type here…"
              autoComplete="off"
              autoCapitalize="off"
              autoFocus
            />
          </div>
          <div className="row">
            <BigButton className="small" onClick={submitSearch}>🔍 Search</BigButton>
          </div>
        </>
      )}

      {status === "loading" && <p className="sub">Looking for {current} photos…</p>}
      {status === "error" && <p className="sub">Photos aren't working right now. Try another animal!</p>}
      {status === "empty" && <p className="sub">No photos found. Try another animal!</p>}
      {doneSearching && status !== "loading" && <p className="sub">Great looking! All done for now.</p>}

      {status === "ready" && ANIMAL_FACTS[current] && (
        <>
          <p className="sub">{ANIMAL_FACTS[current]}</p>
          <div className="row">
            <BigButton className="small" onClick={() => say(ANIMAL_FACTS[current])}>🔊 Hear it</BigButton>
          </div>
        </>
      )}

      {status === "ready" && (
        <div className="photogrid">
          {photos.map((p) => (
            <button
              key={p.full}
              className="photocard"
              onClick={() => setViewerIndex(photos.indexOf(p))}
            >
              <img src={p.thumbnail} alt="" loading="lazy" onError={() => dropPhoto(p)} />
            </button>
          ))}
        </div>
      )}

      {viewerIndex !== null && photos[viewerIndex] && (
        <div className="photoviewer" onClick={() => setViewerIndex(null)}>
          <img
            src={photos[viewerIndex].full}
            alt=""
            onClick={(e) => e.stopPropagation()}
            onError={() => setViewerIndex((i) => (i + 1 < photos.length ? i + 1 : null))}
          />
          <div className="row" onClick={(e) => e.stopPropagation()}>
            <BigButton className="small" onClick={() => setViewerIndex((i) => (i - 1 + photos.length) % photos.length)}>⬅️</BigButton>
            <BigButton className="small" onClick={() => setViewerIndex((i) => (i + 1) % photos.length)}>➡️</BigButton>
            <BigButton className="small" onClick={() => setViewerIndex(null)}>✕ Close</BigButton>
          </div>
        </div>
      )}

      <div className="row bottom-row">
        <BigButton className="small" onClick={finish}>🌙 Done</BigButton>
      </div>
    </div>
  );
}
