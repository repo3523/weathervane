/* Fluent Emoji 3D — Microsoft open-source illustrated emoji (MIT-compatible).
   CDN: jsdelivr from github.com/microsoft/fluentui-emoji
   Only add entries that have been URL-verified. Unmapped emoji fall back to text. */

const B = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets";

export const FLUENT_3D = {
  // Interest pack characters (all URL-verified)
  "🐺": `${B}/Wolf/3D/wolf_3d.png`,
  "🦕": `${B}/Sauropod/3D/sauropod_3d.png`,
  "🚂": `${B}/Locomotive/3D/locomotive_3d.png`,
  "🐬": `${B}/Dolphin/3D/dolphin_3d.png`,
  "🐉": `${B}/Dragon/3D/dragon_3d.png`,
  "🚀": `${B}/Rocket/3D/rocket_3d.png`,
  "🦋": `${B}/Butterfly/3D/butterfly_3d.png`,
  "🐱": `${B}/Cat/3D/cat_3d.png`,
  "🐻": `${B}/Bear/3D/bear_3d.png`,
  "🐰": `${B}/Rabbit/3D/rabbit_3d.png`,
  "🐠": `${B}/Fish/3D/fish_3d.png`,
  "🦁": `${B}/Lion/3D/lion_3d.png`,
};

export function fluentUrl(emoji) {
  return FLUENT_3D[emoji] ?? null;
}
