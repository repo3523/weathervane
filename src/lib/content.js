/* All child-facing content lives here.
   Templates are hand-designed; skins (animals, verses) are swappable.
   To refresh content around a new interest, edit these arrays only. */

export const RHYMES = [
  { line1: "Hickory dickory dee,", line2: "the wolf ran up the", answer: "tree", choices: ["tree", "rock", "sun"], emoji: "🐺🌳" },
  { line1: "Hickory dickory dog,", line2: "the pup jumped on the", answer: "log", choices: ["log", "bed", "hat"], emoji: "🐶🪵" },
  { line1: "Hickory dickory dat,", line2: "the wolf played with the", answer: "cat", choices: ["cat", "fish", "cup"], emoji: "🐺🐱" },
  { line1: "Hickory dickory dee,", line2: "the wolf sat by the", answer: "sea", choices: ["sea", "mud", "box"], emoji: "🐺🌊" },
  { line1: "Hickory dickory doon,", line2: "the wolf howled at the", answer: "moon", choices: ["moon", "star", "car"], emoji: "🐺🌙" },
  { line1: "Hickory dickory dig,", line2: "the wolf met a big", answer: "pig", choices: ["pig", "ant", "egg"], emoji: "🐺🐷" },
  { line1: "Hickory dickory dox,", line2: "the wolf saw a red", answer: "fox", choices: ["fox", "cow", "bug"], emoji: "🐺🦊" },
  { line1: "Hickory dickory dake,", line2: "the wolf swam in the", answer: "lake", choices: ["lake", "tree", "sky"], emoji: "🐺🏞️" },
];

export const WORDS = [
  { word: "wolf", emoji: "🐺", choices: ["wolf", "dog", "cat"] },
  { word: "lion", emoji: "🦁", choices: ["lion", "bear", "fish"] },
  { word: "swing", emoji: "🛝", choices: ["swing", "slide", "ball"] },
  { word: "zebra", emoji: "🦓", choices: ["zebra", "horse", "goat"] },
  { word: "rabbit", emoji: "🐰", choices: ["rabbit", "mouse", "duck"] },
  { word: "turtle", emoji: "🐢", choices: ["turtle", "snake", "frog"] },
  { word: "monkey", emoji: "🐵", choices: ["monkey", "tiger", "sheep"] },
  { word: "elephant", emoji: "🐘", choices: ["elephant", "giraffe", "panda"] },
];

export const SEARCHES = [
  { clue: "Find the animal that howls at the moon!", answer: "wolf", emoji: "🐺", decoys: [{ w: "whale", e: "🐋" }, { w: "worm", e: "🪱" }] },
  { clue: "Find the animal with a long neck!", answer: "giraffe", emoji: "🦒", decoys: [{ w: "goat", e: "🐐" }, { w: "gorilla", e: "🦍" }] },
  { clue: "Find the animal that says meow!", answer: "cat", emoji: "🐱", decoys: [{ w: "cow", e: "🐮" }, { w: "crab", e: "🦀" }] },
  { clue: "Find the animal that hops!", answer: "rabbit", emoji: "🐰", decoys: [{ w: "rat", e: "🐀" }, { w: "raccoon", e: "🦝" }] },
  { clue: "Find the animal with black and white stripes!", answer: "zebra", emoji: "🦓", decoys: [{ w: "zorse", e: "🐴" }, { w: "zoo", e: "🏛️" }] },
];

export const FEELINGS = [
  { scene: "🐶🦴", text: "The dog got a big bone!", answer: "happy", choices: [["happy", "😄"], ["sad", "😢"], ["angry", "😠"]] },
  { scene: "🐺🌧️", text: "The wolf lost his ball.", answer: "sad", choices: [["sad", "😢"], ["happy", "😄"], ["scared", "😨"]] },
  { scene: "🐱⚡", text: "The cat heard loud thunder!", answer: "scared", choices: [["scared", "😨"], ["happy", "😄"], ["angry", "😠"]] },
  { scene: "🐵🍌", text: "The monkey found ten bananas!", answer: "happy", choices: [["happy", "😄"], ["sad", "😢"], ["scared", "😨"]] },
  { scene: "🐻🍯", text: "Someone took the bear's honey.", answer: "angry", choices: [["angry", "😠"], ["happy", "😄"], ["sad", "😢"]] },
];

export const WOLF_SAYS = {
  hello: ["Hi friend! I'm your wolf!", "Awooo! You're here!"],
  goodJob: ["Awooo! Great job!", "You did it!", "Super!", "Wow, nice one!"],
  tryAgain: ["Good try! Let's look again.", "Almost! One more try."],
  goodbye: "Awooo! All done for today. See you tomorrow, friend!",
};

/* Whitelist for the animal photo search (X3 / AnimalPhotos in reset.jsx).
   Also imported server-side by api/search-images.js — keep this the single source
   of truth so the client autocomplete and the server-side guard never drift apart. */
export const ANIMAL_SEARCHES = [
  { name: "wolf", emoji: "🐺" }, { name: "fox", emoji: "🦊" }, { name: "lion", emoji: "🦁" },
  { name: "tiger", emoji: "🐯" }, { name: "zebra", emoji: "🦓" }, { name: "giraffe", emoji: "🦒" },
  { name: "elephant", emoji: "🐘" }, { name: "panda", emoji: "🐼" }, { name: "koala", emoji: "🐨" },
  { name: "kangaroo", emoji: "🦘" }, { name: "penguin", emoji: "🐧" }, { name: "owl", emoji: "🦉" },
  { name: "eagle", emoji: "🦅" }, { name: "dolphin", emoji: "🐬" }, { name: "whale", emoji: "🐋" },
  { name: "shark", emoji: "🦈" }, { name: "turtle", emoji: "🐢" }, { name: "rabbit", emoji: "🐰" },
  { name: "squirrel", emoji: "🐿️" }, { name: "deer", emoji: "🦌" }, { name: "bear", emoji: "🐻" },
  { name: "monkey", emoji: "🐵" }, { name: "gorilla", emoji: "🦍" }, { name: "cheetah", emoji: "🐆" },
  { name: "hedgehog", emoji: "🦔" }, { name: "otter", emoji: "🦦" }, { name: "flamingo", emoji: "🦩" },
  { name: "peacock", emoji: "🦚" }, { name: "parrot", emoji: "🦜" }, { name: "frog", emoji: "🐸" },
  { name: "butterfly", emoji: "🦋" }, { name: "horse", emoji: "🐴" }, { name: "dog", emoji: "🐶" },
  { name: "cat", emoji: "🐱" },
];

export const ICONS = {
  check: "🌤️", rhyme: "🎵", words: "🏠", search: "🔍",
  feelings: "💛", swing: "🛝", den: "🫧", photos: "📷", bye: "🌙",
};

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((v) => v[1]);
