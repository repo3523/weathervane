import { lazy, Suspense, useEffect, useState } from "react";
import { ICONS } from "../lib/content.js";

// Lottie is large (~335KB) — load it only when an animation is actually needed
const Lottie = lazy(() => import("lottie-react"));
import { fluentUrl } from "../lib/fluent.js";
import { lottieUrl } from "../lib/animations.js";

/* Fetches a Lottie JSON file; returns null while loading or on error.
   Falling back to null means the Fluent 3D image shows until animation loads,
   and stays if the file is missing — no blank flash. */
function useLottieData(emoji) {
  const [data, setData] = useState(null);
  const path = lottieUrl(emoji);
  useEffect(() => {
    if (!path) return;
    setData(null);
    fetch(path)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {});
  }, [path]);
  return data;
}

/* Renders a Fluent Emoji 3D image when available, falls back to text emoji. */
export function EmojiImg({ emoji, size = 40, className = "" }) {
  const url = fluentUrl(emoji);
  if (!url) return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
  return (
    <img
      src={url} alt={emoji} width={size} height={size}
      style={{ objectFit: "contain", display: "block" }}
      className={className} draggable={false}
    />
  );
}

/* The character guide. Fallback chain: custom avatarUrl → Lottie animation → Fluent 3D image → text emoji.
   mood controls animation speed: happy = faster, sleepy = slower. */
export function Wolf({ face = "🐺", mood = "idle", size = "lg", avatarUrl = null }) {
  const firstEmoji = [...face][0];
  // Skip Lottie lookup when a custom avatar is provided — no unnecessary fetch.
  const lottieData = useLottieData(avatarUrl ? null : firstEmoji);
  const imgUrl = fluentUrl(firstEmoji);

  const speed = mood === "happy" ? 1.4 : mood === "sleepy" ? 0.5 : 1;

  return (
    <div className={`wolf wolf-${size} ${mood === "happy" ? "bounce" : ""} ${mood === "sleepy" ? "sleepy" : ""}`}>
      {avatarUrl
        ? <img src={avatarUrl} alt={face} className="wolf-img wolf-avatar" draggable={false} />
        : lottieData
          ? <Suspense fallback={imgUrl ? <img src={imgUrl} alt={firstEmoji} className="wolf-img" draggable={false} /> : face}>
              <Lottie
                animationData={lottieData}
                loop autoplay speed={speed}
                className="wolf-img"
                rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
              />
            </Suspense>
          : imgUrl
            ? <img src={imgUrl} alt={firstEmoji} className="wolf-img" draggable={false} />
            : face}
    </div>
  );
}

/* Visual schedule strip — mirrors the schedule boards he knows from school. */
export function ScheduleStrip({ plan, step }) {
  if (!plan || plan.length === 0 || step < 0) return <div className="schedule" />;
  return (
    <div className="schedule">
      {plan.map((p, i) => (
        <div key={i} className={`sched-item ${i < step ? "done" : i === step ? "now" : ""}`}>
          {ICONS[p] || "⬜"}
        </div>
      ))}
    </div>
  );
}

export function BigButton({ children, onClick, state = "", className = "", ...rest }) {
  return (
    <button className={`bigbtn ${state} ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

/* Progress dots inside an activity — shows "how much is left" without numbers. */
export function Dots({ index, total }) {
  return (
    <div className="dots">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i < index ? "done" : i === index ? "now" : ""}`} />
      ))}
    </div>
  );
}
