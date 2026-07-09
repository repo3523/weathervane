import { useEffect, useRef, useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { say } from "../lib/speech.js";
import { chimeSoft, chimeGoodbye } from "../lib/fx.js";
import { pick } from "../lib/content.js";
import { useTheme } from "../lib/ThemeContext.jsx";
import { useProfile } from "../lib/ProfileContext.jsx";

export function StartScreen({ onStart, onStories }) {
  const t = useTheme();
  const { childName } = useProfile();
  return (
    <div className="screen fade-in">
      <Wolf face={t.character.emoji} mood="happy" avatarUrl={t.character.avatarUrl} />
      <h1>{childName ? `Hi, ${childName}! ` : "Hi! "}I'm your {t.character.name}.</h1>
      <p className="sub">Tap the paw to start</p>
      <div className="row">
        <BigButton className="primary" onClick={() => { say(pick(t.says.hello)); onStart(); }}>
          🐾 Start
        </BigButton>
        <BigButton onClick={onStories}>📖 Stories</BigButton>
      </div>
    </div>
  );
}

const WEATHERS = [
  ["sunny", "☀️", "Sunny"],
  ["cloudy", "⛅", "Cloudy"],
  ["stormy", "🌧️", "Stormy"],
];

export function WeatherCheck({ title, onPick }) {
  const t = useTheme();
  const resolvedTitle = title ?? `How is your ${t.character.name} today?`;
  useEffect(() => { say(resolvedTitle); }, [resolvedTitle]);
  return (
    <div className="screen fade-in">
      <Wolf face={t.character.emoji} avatarUrl={t.character.avatarUrl} />
      <h1>{resolvedTitle}</h1>
      <p className="sub">Tap your weather</p>
      <div className="row">
        {WEATHERS.map(([id, em, label]) => (
          <BigButton key={id} onClick={() => onPick(id)}>
            <span className="em">{em}</span>
            {label}
          </BigButton>
        ))}
      </div>
    </div>
  );
}

/* Brief character reaction after the child picks their weather. Auto-advances. */
export function WeatherReaction({ weather, onDone }) {
  const t = useTheme();
  const msg = weather === "sunny"
    ? pick(t.says.hello)
    : pick([`That's okay. ${t.character.name[0].toUpperCase() + t.character.name.slice(1)} is here.`, "A cloudy day is okay.", "We've got this."]);

  useEffect(() => {
    say(msg);
    const timer = setTimeout(onDone, 1800);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line

  return (
    <div className="screen fade-in" onClick={onDone}>
      <Wolf face={t.character.emoji} mood={weather === "sunny" ? "happy" : "idle"} avatarUrl={t.character.avatarUrl} />
      <h1>{msg}</h1>
    </div>
  );
}

/* Moss-bubble mini-game: 5 bubbles, one at a time. Measures tap latency
   quietly — to the child it's just popping bubbles. */
export function BubbleGame({ onDone }) {
  const [bubble, setBubble] = useState(null);
  const latencies = useRef([]);
  const count = useRef(0);
  const shownAt = useRef(0);

  useEffect(() => {
    say("Pop the bubbles!");
    const t = setTimeout(next, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function next() {
    if (count.current >= 5) {
      onDone(latencies.current);
      return;
    }
    count.current += 1;
    shownAt.current = performance.now();
    setBubble({
      id: count.current,
      em: pick(["🫧", "🍃", "🌿", "💧"]),
      size: 70 + Math.random() * 30,
      left: 8 + Math.random() * 74,
      top: 18 + Math.random() * 58,
    });
  }

  function popped() {
    latencies.current.push(performance.now() - shownAt.current);
    chimeSoft();
    setBubble(null);
    setTimeout(next, 320);
  }

  return (
    <div className="screen fade-in">
      <h1>Pop the bubbles!</h1>
      <p className="sub">Tap each one</p>
      <div className="bubblezone">
        {bubble && (
          <div
            key={bubble.id}
            className="bubble"
            style={{ width: bubble.size, height: bubble.size, left: bubble.left + "%", top: bubble.top + "%" }}
            onPointerDown={popped}
          >
            {bubble.em}
          </div>
        )}
      </div>
    </div>
  );
}

export function ResetChoice({ onPick }) {
  const t = useTheme();
  useEffect(() => { say(`${t.character.name} is stormy today. That's okay. Pick something calm.`); }, [t.character.name]);
  return (
    <div className="screen fade-in">
      <Wolf face={t.character.emoji} avatarUrl={t.character.avatarUrl} />
      <h1>{t.character.name[0].toUpperCase() + t.character.name.slice(1)} is stormy today.</h1>
      <p className="sub">That's okay. Pick something calm.</p>
      <div className="row">
        <BigButton onClick={() => onPick("swing")}><span className="em">🛝</span>Swing time</BigButton>
        <BigButton onClick={() => onPick("den")}><span className="em">🫧</span>Den time</BigButton>
      </div>
    </div>
  );
}

/* Goodbye ritual — identical every session. Predictable endings matter. */
export function Goodbye({ onRate }) {
  const t = useTheme();
  useEffect(() => { say(t.says.goodbye); chimeGoodbye(); }, [t.says.goodbye]);
  const RATINGS = [["good", "😄"], ["okay", "😐"], ["grumpy", "😾"]];
  return (
    <div className="screen fade-in">
      <Wolf face={`${t.character.emoji}🌙`} mood="happy" avatarUrl={t.character.avatarUrl} />
      <h1>Awooo! All done!</h1>
      <p className="sub">See you tomorrow, friend</p>
      <p className="sub" style={{ marginTop: 20 }}>How was it?</p>
      <div className="row">
        {RATINGS.map(([id, em]) => (
          <BigButton key={id} onClick={() => onRate(id)}><span className="em">{em}</span></BigButton>
        ))}
      </div>
    </div>
  );
}

/* Small character in bottom-right corner during activities, doing periodic tricks */
export function CharacterCorner() {
  const t = useTheme();
  return (
    <div className="char-corner">
      <Wolf face={t.character.emoji} mood="idle" size="sm" avatarUrl={t.character.avatarUrl} />
    </div>
  );
}

export function Night() {
  const t = useTheme();
  return (
    <div className="screen fade-in">
      <Wolf face="🌙" mood="sleepy" />
      <h1>Good night, {t.character.name} den.</h1>
    </div>
  );
}
