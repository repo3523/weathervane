/* Small sensory rewards: confetti + gentle WebAudio chimes.
   Kept soft and predictable on purpose — no jarring sounds. */

import { soundOn } from "./speech.js";
import { pick } from "./content.js";

export function confetti() {
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = pick(["⭐", "🎉", "✨", "🐾"]);
    c.style.left = 10 + Math.random() * 80 + "vw";
    c.style.top = "10vh";
    c.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }
}

let ctx = null;
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

function tone(freq, start, dur, gainPeak = 0.12) {
  const ac = audioCtx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.05);
}

export function chimeCorrect() {
  if (!soundOn()) return;
  tone(523.25, 0, 0.25);      // C5
  tone(783.99, 0.12, 0.35);   // G5
}

export function chimeSoft() {
  if (!soundOn()) return;
  tone(392.0, 0, 0.3, 0.07);  // gentle G4 — used for pops, never punitive
}

export function chimeGoodbye() {
  if (!soundOn()) return;
  tone(659.25, 0, 0.3);
  tone(523.25, 0.2, 0.35);
  tone(392.0, 0.4, 0.5);
}
