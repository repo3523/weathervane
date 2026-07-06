/* Wolf voice via the device's built-in TTS. Replaceable later with recorded audio. */

const SOUND_KEY = "wv_sound";

export function soundOn() {
  return (localStorage.getItem(SOUND_KEY) ?? "1") === "1";
}

export function setSound(on) {
  localStorage.setItem(SOUND_KEY, on ? "1" : "0");
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
    // cancel() is async in some engines — give it a tick before speaking
    setTimeout(() => synth.speak(u), 50);
  } catch {
    /* speech unavailable — stay silent */
  }
}
