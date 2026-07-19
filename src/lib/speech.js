/* Wolf voice via the device's built-in TTS. Replaceable later with recorded audio. */

const SOUND_KEY = "wv_sound";
const VOICE_KEY = "wv_voice";

export function soundOn() {
  return (localStorage.getItem(SOUND_KEY) ?? "1") === "1";
}

export function setSound(on) {
  localStorage.setItem(SOUND_KEY, on ? "1" : "0");
}

export function getSelectedVoiceURI() {
  return localStorage.getItem(VOICE_KEY) || "";
}

export function setSelectedVoiceURI(uri) {
  if (uri) localStorage.setItem(VOICE_KEY, uri);
  else localStorage.removeItem(VOICE_KEY);
}

function scoreVoice(v) {
  const name = v.name.toLowerCase();
  let score = v.lang.toLowerCase() === "en-us" ? 2 : 0;
  if (/enhanced|premium|neural|natural/.test(name)) score += 5;
  if (/samantha|ava|allison|nicky/.test(name)) score += 3; // warm-sounding iOS/macOS voices
  if (/google/.test(name)) score += 2; // Chrome/Android's Google voices beat the default espeak-style one
  return score;
}

/* All English voices this device offers, best-sounding first — powers the picker in Parent View. */
export function getAvailableVoices() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith("en"))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

// Voice list loads asynchronously on most browsers — refresh our auto-pick whenever it changes.
let bestVoice = null;
function refreshVoice() {
  bestVoice = getAvailableVoices()[0] ?? null;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoice();
  window.speechSynthesis.onvoiceschanged = refreshVoice;
}

function pickVoice() {
  const uri = getSelectedVoiceURI();
  if (uri) {
    const match = getAvailableVoices().find((v) => v.voiceURI === uri);
    if (match) return match;
  }
  return bestVoice;
}

export function say(text) {
  if (!soundOn() || !window.speechSynthesis) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.15;
    u.lang = "en-US";
    const voice = pickVoice();
    if (voice) u.voice = voice;
    // cancel() is async in some engines — give it a tick before speaking
    setTimeout(() => synth.speak(u), 50);
  } catch {
    /* speech unavailable — stay silent */
  }
}

/* Speaks a fixed sample line in a specific voice — for previewing in Parent View.
   Pass "" to preview the current automatic pick instead of a saved selection. */
export function previewVoice(voiceURI) {
  if (!window.speechSynthesis) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance("Hi friend! I'm your wolf. Awoo!");
    u.rate = 0.92;
    u.pitch = 1.15;
    u.lang = "en-US";
    const voice = voiceURI ? getAvailableVoices().find((v) => v.voiceURI === voiceURI) : bestVoice;
    if (voice) u.voice = voice;
    setTimeout(() => synth.speak(u), 50);
  } catch {
    /* speech unavailable — stay silent */
  }
}
