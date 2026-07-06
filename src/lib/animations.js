/* Lottie animation map — one entry per character emoji.
   Steps to add an animation:
   1. Download a .json file from lottiefiles.com
   2. Drop it in /public/lottie/<name>.json
   3. Uncomment (or add) the matching line below.
   Missing files fall back to the Fluent 3D static image automatically. */

export const LOTTIE_MAP = {
  "🐺": "/lottie/wolf.json",
  // "🦕": "/lottie/dinosaur.json",
  "🚂": "/lottie/train.json",
  // "🐬": "/lottie/dolphin.json",
  // "🐉": "/lottie/dragon.json",
  // "🚀": "/lottie/rocket.json",
  // "🦋": "/lottie/butterfly.json",
  // "🐱": "/lottie/cat.json",
  // "🐻": "/lottie/bear.json",
  // "🐰": "/lottie/rabbit.json",
  // "🐠": "/lottie/fish.json",
  // "🦁": "/lottie/lion.json",
};

export function lottieUrl(emoji) {
  return LOTTIE_MAP[emoji] ?? null;
}
