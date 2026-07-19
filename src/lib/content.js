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
   of truth so the client and the server-side guard never drift apart. There's no
   autocomplete hinting what's on this list (search is free-typed), so anything
   missing here just silently shows "no photos found" — add common animals liberally. */
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
  { name: "cat", emoji: "🐱" }, { name: "raccoon", emoji: "🦝" }, { name: "hippo", emoji: "🦛" },
  { name: "rhino", emoji: "🦏" }, { name: "crocodile", emoji: "🐊" }, { name: "snake", emoji: "🐍" },
  { name: "chicken", emoji: "🐔" }, { name: "duck", emoji: "🦆" }, { name: "cow", emoji: "🐮" },
  { name: "pig", emoji: "🐷" }, { name: "goat", emoji: "🐐" }, { name: "sheep", emoji: "🐑" },
  { name: "camel", emoji: "🐫" }, { name: "bat", emoji: "🦇" }, { name: "seal", emoji: "🦭" },
  { name: "llama", emoji: "🦙" }, { name: "sloth", emoji: "🦥" },
];

/* One short, literal, spoken-aloud fact per animal — see AnimalPhotos in reset.jsx.
   Keep every entry one simple sentence, no idioms, matching this app's copy rules. */
export const ANIMAL_FACTS = {
  wolf: "Wolves live together in a group called a pack.",
  fox: "A fox has a bushy tail and pointy ears.",
  lion: "A lion's roar can be heard from far away.",
  tiger: "Tigers have orange fur with black stripes.",
  zebra: "Every zebra has its own pattern of stripes.",
  giraffe: "A giraffe has a very long neck to reach leaves.",
  elephant: "Elephants use their trunk to drink and eat.",
  panda: "Pandas eat bamboo almost all day long.",
  koala: "Koalas sleep in trees most of the day.",
  kangaroo: "A kangaroo carries its baby in a pouch.",
  penguin: "Penguins cannot fly, but they are great swimmers.",
  owl: "Owls can turn their head almost all the way around.",
  eagle: "Eagles have very sharp eyes to spot food far away.",
  dolphin: "Dolphins talk to each other with clicks and whistles.",
  whale: "A whale is the biggest animal in the ocean.",
  shark: "Sharks have many rows of sharp teeth.",
  turtle: "A turtle carries its shell everywhere it goes.",
  rabbit: "Rabbits have long ears and strong back legs for hopping.",
  squirrel: "Squirrels bury nuts to eat later in winter.",
  deer: "Male deer grow antlers on their head.",
  bear: "Bears sleep for a long time in winter.",
  monkey: "Monkeys use their tails to help them climb.",
  gorilla: "Gorillas are very strong and gentle animals.",
  cheetah: "A cheetah is the fastest land animal.",
  hedgehog: "A hedgehog curls into a ball to stay safe.",
  otter: "Otters hold hands with each other while they sleep.",
  flamingo: "A flamingo stands on one leg to rest.",
  peacock: "A peacock spreads its colorful tail feathers.",
  parrot: "Some parrots can learn to copy words.",
  frog: "A frog uses its long tongue to catch bugs.",
  butterfly: "A butterfly starts its life as a caterpillar.",
  horse: "Horses can sleep while standing up.",
  dog: "Dogs wag their tail when they feel happy.",
  cat: "Cats use their whiskers to feel their way around.",
  raccoon: "Raccoons wash their food before they eat it.",
  hippo: "A hippo spends most of the day in the water.",
  rhino: "A rhino has a big horn on its nose.",
  crocodile: "A crocodile can stay very still to hide in water.",
  snake: "A snake moves without any legs at all.",
  chicken: "A chicken lays eggs almost every day.",
  duck: "Duck feathers keep water from soaking their skin.",
  cow: "A cow eats grass and chews it slowly.",
  pig: "Pigs are very smart and love to roll in mud.",
  goat: "Goats are great climbers and can jump high.",
  sheep: "A sheep's wool keeps growing all year.",
  camel: "A camel stores fat in its hump, not water.",
  bat: "Bats sleep upside down during the day.",
  seal: "Seals are fast swimmers but slow on land.",
  llama: "A llama can carry heavy loads on its back.",
  sloth: "A sloth moves very, very slowly.",
};

export const ICONS = {
  check: "🌤️", rhyme: "🎵", words: "🏠", search: "🔍",
  feelings: "💛", swing: "🛝", den: "🫧", photos: "📷", bye: "🌙",
};

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((v) => v[1]);
