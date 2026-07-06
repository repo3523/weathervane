import { useEffect, useRef, useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { say } from "../lib/speech.js";
import { chimeSoft } from "../lib/fx.js";
import { pick } from "../lib/content.js";
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
