import { RHYMES, WORDS, SEARCHES, FEELINGS, WOLF_SAYS } from "./content.js";
import { supabase } from "./supabase.js";
import { activeChildId } from "./sync.js";

const THEMES_KEY = "wv_themes";
const ACTIVE_KEY = "wv_active_theme";

/* Non-character-specific static content shared by all generated themes */
const STATIC_WORDS = [
  { word: "lion",     emoji: "🦁", choices: ["lion", "bear", "fish"] },
  { word: "swing",    emoji: "🛝", choices: ["swing", "slide", "ball"] },
  { word: "zebra",    emoji: "🦓", choices: ["zebra", "horse", "goat"] },
  { word: "rabbit",   emoji: "🐰", choices: ["rabbit", "mouse", "duck"] },
  { word: "turtle",   emoji: "🐢", choices: ["turtle", "snake", "frog"] },
  { word: "monkey",   emoji: "🐵", choices: ["monkey", "tiger", "sheep"] },
  { word: "elephant", emoji: "🐘", choices: ["elephant", "giraffe", "panda"] },
];

const STATIC_SEARCHES = [
  { clue: "Find the animal with a long neck!", answer: "giraffe", emoji: "🦒", decoys: [{ w: "goat", e: "🐐" }, { w: "gorilla", e: "🦍" }] },
  { clue: "Find the animal that says meow!", answer: "cat", emoji: "🐱", decoys: [{ w: "cow", e: "🐮" }, { w: "crab", e: "🦀" }] },
  { clue: "Find the animal that hops!", answer: "rabbit", emoji: "🐰", decoys: [{ w: "rat", e: "🐀" }, { w: "raccoon", e: "🦝" }] },
  { clue: "Find the animal with black and white stripes!", answer: "zebra", emoji: "🦓", decoys: [{ w: "zorse", e: "🐴" }, { w: "zoo", e: "🏛️" }] },
];

const STATIC_FEELINGS = [
  { scene: "🐶🦴", text: "The dog got a big bone!", answer: "happy", choices: [["happy", "😄"], ["sad", "😢"], ["angry", "😠"]] },
  { scene: "🐱⚡", text: "The cat heard loud thunder!", answer: "scared", choices: [["scared", "😨"], ["happy", "😄"], ["angry", "😠"]] },
  { scene: "🐵🍌", text: "The monkey found ten bananas!", answer: "happy", choices: [["happy", "😄"], ["sad", "😢"], ["scared", "😨"]] },
  { scene: "🐻🍯", text: "Someone took the bear's honey.", answer: "angry", choices: [["angry", "😠"], ["happy", "😄"], ["sad", "😢"]] },
];

/* Rhyme templates — index 1 is neutral (no character slot) */
const RHYME_TEMPLATES = [
  { line1: "Hickory dickory dee,",  line2F: c => `the ${c.name} ran up the`,          answer: "tree", choices: ["tree", "rock", "sun"],  emojiF: c => `${c.emoji}🌳` },
  { line1: "Hickory dickory dog,",  line2F: ()  => "the pup jumped on the",            answer: "log",  choices: ["log", "bed", "hat"],   emojiF: ()  => "🐶🪵" },
  { line1: "Hickory dickory dat,",  line2F: c => `the ${c.name} played with the`,      answer: "cat",  choices: ["cat", "fish", "cup"],  emojiF: c => `${c.emoji}🐱` },
  { line1: "Hickory dickory dee,",  line2F: c => `the ${c.name} sat by the`,           answer: "sea",  choices: ["sea", "mud", "box"],   emojiF: c => `${c.emoji}🌊` },
  { line1: "Hickory dickory doon,", line2F: c => `the ${c.name} ${c.verbPast} at the`, answer: "moon", choices: ["moon", "star", "car"], emojiF: c => `${c.emoji}🌙` },
  { line1: "Hickory dickory dig,",  line2F: c => `the ${c.name} met a big`,            answer: "pig",  choices: ["pig", "ant", "egg"],   emojiF: c => `${c.emoji}🐷` },
  { line1: "Hickory dickory dox,",  line2F: c => `the ${c.name} saw a red`,            answer: "fox",  choices: ["fox", "cow", "bug"],   emojiF: c => `${c.emoji}🦊` },
  { line1: "Hickory dickory dake,", line2F: c => `the ${c.name} swam in the`,          answer: "lake", choices: ["lake", "tree", "sky"], emojiF: c => `${c.emoji}🏞️` },
];

export function generateThemeContent(char) {
  const rhymes = RHYME_TEMPLATES.map(t => ({
    line1: t.line1,
    line2: t.line2F(char),
    answer: t.answer,
    choices: t.choices,
    emoji: t.emojiF(char),
  }));

  const words = [
    { word: char.name, emoji: char.emoji, choices: [char.name, "dog", "cat"] },
    ...STATIC_WORDS,
  ];

  const searches = [
    { clue: `Find the one that ${char.verb}!`, answer: char.name, emoji: char.emoji, decoys: [{ w: "whale", e: "🐋" }, { w: "worm", e: "🪱" }] },
    ...STATIC_SEARCHES,
  ];

  const feelings = [
    STATIC_FEELINGS[0],
    { scene: `${char.emoji}🌧️`, text: `The ${char.name} lost its ball.`, answer: "sad", choices: [["sad", "😢"], ["happy", "😄"], ["scared", "😨"]] },
    ...STATIC_FEELINGS.slice(1),
  ];

  const says = {
    hello:    [`Hi friend! I'm your ${char.name}!`, `${char.exclaim}! You're here!`],
    goodJob:  [`${char.exclaim}! Great job!`, "You did it!", "Super!", "Wow, nice one!"],
    tryAgain: ["Good try! Let's look again.", "Almost! One more try."],
    goodbye:  `${char.exclaim}! All done for today. See you tomorrow, friend!`,
  };

  return { rhymes, words, searches, feelings, says };
}

/* Wolf theme is built from existing content.js arrays — never templated */
export const WOLF_THEME = {
  id: "wolf",
  name: "Wolf",
  createdAt: "2024-01-01T00:00:00.000Z",
  character: { name: "wolf", emoji: "🐺", verb: "howls", verbPast: "howled", exclaim: "Awooo" },
  rhymes: RHYMES,
  words: WORDS,
  searches: SEARCHES,
  feelings: FEELINGS,
  says: WOLF_SAYS,
};

/* Preset characters for the one-tap path in the wizard */
export const PRESETS = [
  { label: "Dinosaur",   name: "dinosaur",   emoji: "🦕", verb: "roars",     verbPast: "roared",    exclaim: "Roaar"     },
  { label: "Train",      name: "train",      emoji: "🚂", verb: "zooms",     verbPast: "zoomed",    exclaim: "Choo choo" },
  { label: "Dolphin",    name: "dolphin",    emoji: "🐬", verb: "leaps",     verbPast: "leaped",    exclaim: "Splash"    },
  { label: "Dragon",     name: "dragon",     emoji: "🐉", verb: "flies",     verbPast: "flew",      exclaim: "Rawr"      },
  { label: "Rocket",     name: "rocket",     emoji: "🚀", verb: "zooms",     verbPast: "zoomed",    exclaim: "Whoosh"    },
  { label: "Butterfly",  name: "butterfly",  emoji: "🦋", verb: "flutters",  verbPast: "fluttered", exclaim: "Flutter"   },
  { label: "Cat",        name: "cat",        emoji: "🐱", verb: "meows",     verbPast: "meowed",    exclaim: "Meow"      },
  { label: "Bear",       name: "bear",       emoji: "🐻", verb: "roars",     verbPast: "roared",    exclaim: "Growl"     },
  { label: "Rabbit",     name: "rabbit",     emoji: "🐰", verb: "hops",      verbPast: "hopped",    exclaim: "Hop hop"   },
  { label: "Fish",       name: "fish",       emoji: "🐠", verb: "swims",     verbPast: "swam",      exclaim: "Splish"    },
];

/* ─── Interest packs ────────────────────────────────────────────────────── */

function makeSays(char) {
  return {
    hello:    [`Hi friend! I'm your ${char.name}!`, `${char.exclaim}! You're here!`],
    goodJob:  [`${char.exclaim}! Great job!`, "You did it!", "Super!", "Wow, nice one!"],
    tryAgain: ["Good try! Let's look again.", "Almost! One more try."],
    goodbye:  `${char.exclaim}! All done for today. See you tomorrow, friend!`,
  };
}

function charFeeling(char) {
  return { scene: `${char.emoji}🌧️`, text: `The ${char.name} lost its favourite toy.`, answer: "sad", choices: [["sad","😢"],["happy","😄"],["scared","😨"]] };
}

const BASE_FEELINGS_A = { scene: "🐶🦴", text: "The dog got a big bone!", answer: "happy", choices: [["happy","😄"],["sad","😢"],["angry","😠"]] };
const BASE_FEELINGS_B = { scene: "🐱⚡", text: "The cat heard loud thunder!", answer: "scared", choices: [["scared","😨"],["happy","😄"],["angry","😠"]] };
const BASE_FEELINGS_C = { scene: "🐵🍌", text: "The monkey found ten bananas!", answer: "happy", choices: [["happy","😄"],["sad","😢"],["scared","😨"]] };
const BASE_FEELINGS_D = { scene: "🐻🍯", text: "Someone took the bear's honey.", answer: "angry", choices: [["angry","😠"],["happy","😄"],["sad","😢"]] };

const BASE_SEARCHES_TAIL = [
  { clue: "Find the animal with a long neck!", answer: "giraffe", emoji: "🦒", decoys: [{ w: "goat", e: "🐐" }, { w: "gorilla", e: "🦍" }] },
  { clue: "Find the animal that says meow!", answer: "cat", emoji: "🐱", decoys: [{ w: "cow", e: "🐮" }, { w: "crab", e: "🦀" }] },
  { clue: "Find the animal that hops!", answer: "rabbit", emoji: "🐰", decoys: [{ w: "rat", e: "🐀" }, { w: "raccoon", e: "🦝" }] },
  { clue: "Find the animal with black and white stripes!", answer: "zebra", emoji: "🦓", decoys: [{ w: "zorse", e: "🐴" }, { w: "zoo", e: "🏛️" }] },
];

const TRAIN_CHAR = { name: "train", emoji: "🚂", verb: "zooms", verbPast: "zoomed", exclaim: "Choo choo" };
const TRAIN_PACK = {
  id: "trains", name: "Trains", character: TRAIN_CHAR, says: makeSays(TRAIN_CHAR),
  preview: "Clickety clack on the track, the train came rolling ___",
  rhymes: [
    { line1: "Clickety clack on the track,",   line2: "the train came rolling",          answer: "back",   choices: ["back","fast","past"],  emoji: "🚂🛤️" },
    { line1: "Puff puff puff up the hill,",     line2: "riding trains gives such a",      answer: "thrill", choices: ["thrill","rush","ride"], emoji: "🚂⛰️" },
    { line1: "Ding ding ding, don't be late,",  line2: "the train is at the",             answer: "gate",   choices: ["gate","stop","end"],   emoji: "🚂🔔" },
    { line1: "Chugga chugga all the day,",      line2: "the little train went on its",    answer: "way",    choices: ["way","route","path"],  emoji: "🚂🌤️" },
    { line1: "Toot toot toot in the night,",    line2: "the train's big lamp shone oh so",answer: "bright", choices: ["bright","wide","far"], emoji: "🚂🌙" },
    { line1: "Through the tunnel, dark and long,",line2: "the little train sang a happy", answer: "song",   choices: ["song","tune","note"],  emoji: "🚂🎵" },
    { line1: "On the rails shiny and new,",     line2: "the train was painted brightest", answer: "blue",   choices: ["blue","red","green"],  emoji: "🚂💙" },
    { line1: "Wheels go round, round and round,",line2: "the engine makes a rumbling",    answer: "sound",  choices: ["sound","noise","beat"], emoji: "🚂🎶" },
  ],
  words: [
    { word: "train",   emoji: "🚂", choices: ["train","car","bus"]       },
    { word: "track",   emoji: "🛤️", choices: ["track","road","path"]     },
    { word: "steam",   emoji: "💨", choices: ["steam","smoke","fog"]     },
    { word: "wheel",   emoji: "⚙️", choices: ["wheel","circle","ring"]   },
    { word: "bridge",  emoji: "🌉", choices: ["bridge","road","path"]    },
    { word: "tunnel",  emoji: "🕳️", choices: ["tunnel","cave","hole"]    },
    { word: "horn",    emoji: "📯", choices: ["horn","bell","drum"]      },
    { word: "station", emoji: "🏛️", choices: ["station","stop","place"]  },
  ],
  searches: [
    { clue: "Find the one that runs on tracks!", answer: "train", emoji: "🚂", decoys: [{ w: "truck", e: "🚛" }, { w: "tram", e: "🚋" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(TRAIN_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

const DINO_CHAR = { name: "dinosaur", emoji: "🦕", verb: "roars", verbPast: "roared", exclaim: "ROAR" };
const DINO_PACK = {
  id: "dinos", name: "Dinosaurs", character: DINO_CHAR, says: makeSays(DINO_CHAR),
  preview: "Stomp stomp stomp across the ground, the big dinosaur made a thundering ___",
  rhymes: [
    { line1: "Stomp stomp stomp across the ground,",  line2: "the big dinosaur made a thundering", answer: "sound",  choices: ["sound","crash","boom"],  emoji: "🦕🌍" },
    { line1: "Long long neck up in the sky,",          line2: "the dino watched the clouds go",     answer: "by",     choices: ["by","past","up"],        emoji: "🦕☁️" },
    { line1: "Sharp sharp claws begin to dig,",       line2: "the dinosaur was very very",          answer: "big",    choices: ["big","tall","strong"],   emoji: "🦕🌿" },
    { line1: "Millions of years, what a day,",        line2: "the dinosaurs would run and",         answer: "play",   choices: ["play","roam","stomp"],   emoji: "🦕🌋" },
    { line1: "ROAR ROAR ROAR across the land,",       line2: "the dino pack was really",            answer: "grand",  choices: ["grand","brave","loud"],  emoji: "🦕🏔️" },
    { line1: "Scales like jewels, green and gold,",   line2: "the dinosaur's story must be",        answer: "told",   choices: ["told","heard","known"],  emoji: "🦕✨" },
    { line1: "Tiny arms but fast to run,",            line2: "the T-Rex had a lot of",              answer: "fun",    choices: ["fun","speed","power"],   emoji: "🦕🏃" },
    { line1: "In the swamp so cool and deep,",        line2: "the big dino went to",                answer: "sleep",  choices: ["sleep","rest","hide"],   emoji: "🦕🌙" },
  ],
  words: [
    { word: "dino",   emoji: "🦕", choices: ["dino","lizard","dragon"]   },
    { word: "roar",   emoji: "🦁", choices: ["roar","growl","hiss"]      },
    { word: "bone",   emoji: "🦴", choices: ["bone","stick","rock"]      },
    { word: "nest",   emoji: "🪺", choices: ["nest","hole","cave"]       },
    { word: "egg",    emoji: "🥚", choices: ["egg","ball","stone"]       },
    { word: "stomp",  emoji: "👣", choices: ["stomp","jump","run"]       },
    { word: "scale",  emoji: "🐍", choices: ["scale","skin","shell"]     },
    { word: "claw",   emoji: "🦞", choices: ["claw","nail","spike"]      },
  ],
  searches: [
    { clue: "Find the one that stomped the earth long ago!", answer: "dinosaur", emoji: "🦕", decoys: [{ w: "deer", e: "🦌" }, { w: "duck", e: "🦆" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(DINO_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

const OCEAN_CHAR = { name: "dolphin", emoji: "🐬", verb: "leaps", verbPast: "leaped", exclaim: "Splash" };
const OCEAN_PACK = {
  id: "ocean", name: "Ocean", character: OCEAN_CHAR, says: makeSays(OCEAN_CHAR),
  preview: "Deep in the ocean, deep in the sea, the dolphin is happy and ___",
  rhymes: [
    { line1: "Deep in the ocean, deep in the sea,",  line2: "the dolphin is happy and",       answer: "free",   choices: ["free","glad","wild"],    emoji: "🐬🌊" },
    { line1: "Whoosh and splash, up in the air,",    line2: "the dolphin leaped way over",     answer: "there",  choices: ["there","here","by"],     emoji: "🐬💦" },
    { line1: "Shimmer shimmer, shiny bright,",       line2: "the fish scales glow with rainbow",answer: "light", choices: ["light","shine","glow"],  emoji: "🐠✨" },
    { line1: "Bubble bubble blub blub blub,",        line2: "the crab went swimming in the",   answer: "tub",    choices: ["tub","sea","pond"],      emoji: "🦀🫧" },
    { line1: "Under waves so cool and green,",       line2: "the turtle swam where fish are",  answer: "seen",   choices: ["seen","found","met"],    emoji: "🐢🌿" },
    { line1: "Splash splash splash upon the shore,", line2: "the waves come crashing more and",answer: "more",   choices: ["more","high","fast"],    emoji: "🌊🏖️" },
    { line1: "Starfish sitting on a stone,",         line2: "the little crab was all",         answer: "alone",  choices: ["alone","lost","still"],  emoji: "⭐🦀" },
    { line1: "Jellyfish so soft and blue,",          line2: "the ocean world is beautiful and",answer: "new",    choices: ["new","blue","true"],     emoji: "🪼🌊" },
  ],
  words: [
    { word: "ocean",   emoji: "🌊", choices: ["ocean","lake","river"]    },
    { word: "wave",    emoji: "🏄", choices: ["wave","splash","ripple"]  },
    { word: "fish",    emoji: "🐟", choices: ["fish","shark","crab"]     },
    { word: "shell",   emoji: "🐚", choices: ["shell","rock","pebble"]   },
    { word: "crab",    emoji: "🦀", choices: ["crab","shrimp","bug"]     },
    { word: "coral",   emoji: "🪸", choices: ["coral","rock","plant"]    },
    { word: "boat",    emoji: "⛵", choices: ["boat","ship","raft"]      },
    { word: "sand",    emoji: "🏖️", choices: ["sand","dirt","mud"]       },
  ],
  searches: [
    { clue: "Find the one that leaps through the waves!", answer: "dolphin", emoji: "🐬", decoys: [{ w: "duck", e: "🦆" }, { w: "deer", e: "🦌" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(OCEAN_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

const SPACE_CHAR = { name: "rocket", emoji: "🚀", verb: "zooms", verbPast: "zoomed", exclaim: "Whoosh" };
const SPACE_PACK = {
  id: "space", name: "Space", character: SPACE_CHAR, says: makeSays(SPACE_CHAR),
  preview: "Blast off, blast off, into the sky, the rocket zooms so very ___",
  rhymes: [
    { line1: "Blast off, blast off, into the sky,",  line2: "the rocket zooms so very",        answer: "high",   choices: ["high","fast","far"],     emoji: "🚀🌌" },
    { line1: "Twinkle twinkle little star,",          line2: "the rocket flies so very",        answer: "far",    choices: ["far","high","fast"],     emoji: "🚀⭐" },
    { line1: "Round and round the moon so bright,",  line2: "the astronaut floats through the", answer: "night",  choices: ["night","dark","sky"],    emoji: "🚀🌙" },
    { line1: "Countdown ten nine eight,",             line2: "the speedy rocket won't be",       answer: "late",   choices: ["late","slow","lost"],    emoji: "🚀🔢" },
    { line1: "Floating floating, light as air,",     line2: "the astronaut is floating",        answer: "there",  choices: ["there","here","free"],   emoji: "🧑‍🚀🌌" },
    { line1: "Saturn's rings shine left and right,", line2: "the planets glow so very",         answer: "bright", choices: ["bright","wide","clear"], emoji: "🪐✨" },
    { line1: "Up up up beyond the cloud,",           line2: "the rocket's engine roars so",     answer: "loud",   choices: ["loud","strong","big"],   emoji: "🚀☁️" },
    { line1: "Stars and moons and comets too,",      line2: "the sky in space is deepest",      answer: "blue",   choices: ["blue","black","dark"],   emoji: "🌌🌟" },
  ],
  words: [
    { word: "rocket",  emoji: "🚀", choices: ["rocket","plane","ship"]   },
    { word: "star",    emoji: "⭐", choices: ["star","dot","light"]      },
    { word: "moon",    emoji: "🌙", choices: ["moon","sun","cloud"]      },
    { word: "planet",  emoji: "🪐", choices: ["planet","world","ball"]   },
    { word: "space",   emoji: "🌌", choices: ["space","sky","dark"]      },
    { word: "orbit",   emoji: "🌍", choices: ["orbit","circle","spin"]   },
    { word: "comet",   emoji: "☄️", choices: ["comet","rock","ball"]     },
    { word: "alien",   emoji: "👽", choices: ["alien","robot","monster"]  },
  ],
  searches: [
    { clue: "Find the one that zooms to the stars!", answer: "rocket", emoji: "🚀", decoys: [{ w: "robot", e: "🤖" }, { w: "race car", e: "🏎️" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(SPACE_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

const ANIMAL_CHAR = { name: "lion", emoji: "🦁", verb: "roars", verbPast: "roared", exclaim: "Roar" };
const ANIMAL_PACK = {
  id: "animals", name: "Animals", character: ANIMAL_CHAR, says: makeSays(ANIMAL_CHAR),
  preview: "In the jungle hear the call, the lion is the king of ___",
  rhymes: [
    { line1: "In the jungle hear the call,",        line2: "the lion is the king of",         answer: "all",    choices: ["all","land","them"],     emoji: "🦁🌿" },
    { line1: "Prowl and pounce and leap and play,", line2: "the tiger hunts throughout the",  answer: "day",    choices: ["day","night","land"],    emoji: "🐯🌅" },
    { line1: "Tall tall trees in the forest green,",line2: "the monkey is the best I've",     answer: "seen",   choices: ["seen","found","met"],    emoji: "🐵🌳" },
    { line1: "Trumpet trumpet, stomp the ground,",  line2: "the elephant makes a rumbling",   answer: "sound",  choices: ["sound","boom","crash"],  emoji: "🐘🌍" },
    { line1: "Stripy stripes of black and white,",  line2: "the zebra runs from morning to",  answer: "night",  choices: ["night","dusk","dark"],   emoji: "🦓🌃" },
    { line1: "Long long neck up in the sky,",       line2: "the giraffe watches clouds go",   answer: "by",     choices: ["by","past","up"],        emoji: "🦒☁️" },
    { line1: "Hop hop hop across the land,",        line2: "the kangaroo thinks life is",     answer: "grand",  choices: ["grand","great","good"],  emoji: "🦘🌾" },
    { line1: "Slither slither in the grass,",       line2: "the snake lets all the others",   answer: "pass",   choices: ["pass","go","through"],   emoji: "🐍🌿" },
  ],
  words: [
    { word: "lion",    emoji: "🦁", choices: ["lion","tiger","bear"]      },
    { word: "paw",     emoji: "🐾", choices: ["paw","claw","foot"]        },
    { word: "mane",    emoji: "🦁", choices: ["mane","hair","fur"]        },
    { word: "den",     emoji: "🕳️", choices: ["den","cave","hole"]        },
    { word: "prey",    emoji: "🐾", choices: ["prey","food","meal"]       },
    { word: "roar",    emoji: "💬", choices: ["roar","growl","purr"]      },
    { word: "pride",   emoji: "🦁", choices: ["pride","pack","herd"]      },
    { word: "hunt",    emoji: "🏃", choices: ["hunt","run","chase"]       },
  ],
  searches: [
    { clue: "Find the king of the jungle!", answer: "lion", emoji: "🦁", decoys: [{ w: "leopard", e: "🐆" }, { w: "lizard", e: "🦎" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(ANIMAL_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

const FANTASY_CHAR = { name: "dragon", emoji: "🐉", verb: "flies", verbPast: "flew", exclaim: "Rawr" };
const FANTASY_PACK = {
  id: "fantasy", name: "Fantasy", character: FANTASY_CHAR, says: makeSays(FANTASY_CHAR),
  preview: "Up in the sky swooping high, the dragon loves to ___",
  rhymes: [
    { line1: "Up in the sky, swooping high,",        line2: "the dragon loves to",              answer: "fly",    choices: ["fly","soar","glide"],    emoji: "🐉🌤️" },
    { line1: "Breathe out fire, red and bright,",    line2: "the dragon glows throughout the",  answer: "night",  choices: ["night","dark","dusk"],   emoji: "🐉🔥" },
    { line1: "Through the clouds and past the rain,",line2: "the dragon loops and flies",       answer: "again",  choices: ["again","back","free"],   emoji: "🐉☁️" },
    { line1: "ROAR ROAR ROAR across the land,",      line2: "the dragon is the most",           answer: "grand",  choices: ["grand","brave","bold"],  emoji: "🐉🏔️" },
    { line1: "Scales like jewels, green and gold,",  line2: "the dragon's story must be",       answer: "told",   choices: ["told","heard","known"],  emoji: "🐉✨" },
    { line1: "In the cave so dark and deep,",        line2: "the dragon curls up fast",         answer: "asleep", choices: ["asleep","away","still"], emoji: "🐉🌙" },
    { line1: "Swooping low then soaring tall,",      line2: "the dragon never starts to",       answer: "fall",   choices: ["fall","drop","stop"],    emoji: "🐉🌟" },
    { line1: "Knights and wizards, one and all,",    line2: "they heard the mighty dragon's",   answer: "call",   choices: ["call","roar","cry"],     emoji: "🐉⚔️" },
  ],
  words: [
    { word: "dragon",  emoji: "🐉", choices: ["dragon","lizard","snake"]  },
    { word: "fire",    emoji: "🔥", choices: ["fire","flame","smoke"]     },
    { word: "wing",    emoji: "🪶", choices: ["wing","arm","fin"]         },
    { word: "magic",   emoji: "✨", choices: ["magic","trick","spell"]    },
    { word: "castle",  emoji: "🏰", choices: ["castle","house","tower"]   },
    { word: "knight",  emoji: "⚔️", choices: ["knight","soldier","guard"] },
    { word: "cave",    emoji: "🕳️", choices: ["cave","hole","den"]        },
    { word: "spell",   emoji: "🪄", choices: ["spell","trick","charm"]    },
  ],
  searches: [
    { clue: "Find the one that breathes fire!", answer: "dragon", emoji: "🐉", decoys: [{ w: "duck", e: "🦆" }, { w: "dog", e: "🐕" }] },
    ...BASE_SEARCHES_TAIL,
  ],
  feelings: [BASE_FEELINGS_A, charFeeling(FANTASY_CHAR), BASE_FEELINGS_B, BASE_FEELINGS_C, BASE_FEELINGS_D],
};

export const INTEREST_PACKS = [TRAIN_PACK, DINO_PACK, OCEAN_PACK, SPACE_PACK, ANIMAL_PACK, FANTASY_PACK];

/* Curated emoji for the custom emoji-picker step */
export const EMOJI_GRID = [
  "🦁","🐯","🐨","🐼","🐸","🐊","🐢","🦎","🐍","🦕",
  "🦖","🐙","🦑","🦈","🐬","🦢","🦚","🦜","🦋","🐝",
  "🦔","🦦","🦭","🐿️","🦌","🦙","🚂","🚀","🐉","🧸",
];

/* Upload a blob from a URL or data-URI to Supabase Storage; returns the permanent URL. */
async function toBlob(url) {
  if (url.startsWith("data:")) {
    const [meta, b64] = url.split(",");
    const mime = meta.split(":")[1].split(";")[0];
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.blob();
}

/* Theme storage API — synchronous because themes are needed at render time */
export function loadThemes() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEMES_KEY) || "[]");
    return [WOLF_THEME, ...saved];
  } catch {
    return [WOLF_THEME];
  }
}

export async function saveTheme(theme) {
  let out = theme;

  // If a character avatar exists and Supabase is available, upload it to permanent storage.
  if (supabase && theme.character?.avatarUrl) {
    const url = theme.character.avatarUrl;
    try {
      const blob = await toBlob(url);
      const ext = blob.type === "image/webp" ? "webp" : "png";
      const filename = `avatars/${theme.id}.${ext}`;
      const { error } = await supabase.storage
        .from("story-images")
        .upload(filename, blob, { contentType: blob.type, upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("story-images").getPublicUrl(filename);
        out = { ...theme, character: { ...theme.character, avatarUrl: publicUrl } };
      }
    } catch {}
  }

  const existing = loadThemes().filter(t => t.id !== "wolf" && t.id !== out.id);
  localStorage.setItem(THEMES_KEY, JSON.stringify([...existing, out]));

  if (supabase && activeChildId && out.id !== "wolf") {
    supabase.from("themes")
      .upsert({ id: out.id, child_id: activeChildId, data: out })
      .then().catch(() => {});
  }

  return out;
}

export function deleteTheme(id) {
  if (id === "wolf") return;
  const saved = loadThemes().filter(t => t.id !== "wolf" && t.id !== id);
  localStorage.setItem(THEMES_KEY, JSON.stringify(saved));
  if (getActiveThemeId() === id) setActiveThemeId("wolf");
  if (supabase && activeChildId) {
    supabase.from("themes").delete().eq("id", id).then().catch(() => {});
  }
}

export function getActiveThemeId() {
  return localStorage.getItem(ACTIVE_KEY) || "wolf";
}

export function setActiveThemeId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveTheme() {
  const id = getActiveThemeId();
  return loadThemes().find(t => t.id === id) || WOLF_THEME;
}
