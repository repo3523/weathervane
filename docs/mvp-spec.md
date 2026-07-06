# Weathervane MVP — Build Spec
*Personalized to your son's profile. Companion to the concept doc.*

## What his profile tells us

His three interests aren't just content skins — each one is a design signal:

**Wolves & animals** → the content skin. Every reading passage, character, and reward image is animal-first, with a wolf "guide" character who hosts the session. Wolves also give you a built-in narrative for the weather check: *"How's your wolf feeling today?"* — externalizing his state onto the wolf lowers the demand of self-reporting.

**Hickory-dickory-dock videos** → the bigger signal is *rhythm, rhyme, and repetition*. He seeks predictable musical structure. This is a pedagogical gift for reading-first: rhyme builds phonological awareness, which is the foundation of decoding. Reading activities should be chant-able, rhythmic, and repeat their structure exactly — like a nursery rhyme with swappable words.

**Swinging** → he's a vestibular seeker. Two implications: (1) the best time to run a session is likely *right after* swinging, when he's regulated — worth testing explicitly; (2) the Reset track's best move may be off-screen: a "swing break" card that sends him to the swing and welcomes him back after. The app orchestrating real-world regulation instead of more screen is both better for him and a differentiator.

**Visual schedule at school** → the session itself should render as a mini visual schedule (icon strip across the top: check-in → activity → activity → goodbye, each checked off as done). When you share the school's exact vocabulary/symbols later, we align labels so home and school feel like one system.

## The wolf guide

A single consistent character (a friendly cartoon wolf — name it with him, ownership matters). It appears in every session, speaks in short predictable phrases, hosts every activity, and does the goodbye ritual. On Reset days the wolf models regulation: *"Wolf is stormy today. Wolf is going to rest in his den."*

## Session flow (concrete)

1. **Weather check (~45s).** "How's your wolf today?" — pick sunny/cloudy/stormy den scene. Then one mini-game: moss bubbles pop in rhythm (measures tap latency + rhythm-matching accuracy). Track chosen; behavioral signal can only downgrade, never upgrade.
2. **Visual schedule strip appears** showing exactly what's in today's session.
3. **Activity blocks** (2 on Stretch, 2 easier on Steady, 1 on Reset — see templates below).
4. **Goodbye ritual** — identical every time: wolf howls goodnight, den door closes, 2-minute warning before. His one-tap rating: wolf happy / wolf okay / wolf grumpy.

## Activity templates (MVP set)

**Reading (primary):**
- **R1 — Rhyme swap.** Hickory-dickory-dock structure with animal words swapped in: *"Hickory dickory dee, the wolf ran up the tree."* He reads/chants along (audio support toggleable), then picks the rhyming word to complete the next verse from 3 choices. Same tune, infinite verses. This is his exact preferred media, made interactive.
- **R2 — Wolf story pages.** 3–5 sentence decodable passage about a wolf/animal, followed by 2 picture-answer comprehension questions ("Where did the wolf hide?"). Difficulty = sentence length + word complexity, hand-tuned to start.
- **R3 — Word den (Steady-track review).** Sight-word matching: word ↔ animal picture. Familiar words only, high success rate.
- **R4 — Search the den.** Wolf asks "Find the animal that howls at the moon!" — a search box appears, he types the first letters, and picks from autocomplete suggestions (with pictures). This reuses an interaction he has already mastered on iPad/phone search bars, so zero learning curve — and it stealth-drills spelling and word recognition. Also becomes the standard answer mechanic across other activities where typing beats tapping choices.

**Reading calibration (from parent):** strong on nouns, ~60% of sight words, functional typing with autocomplete. So: R2 passages are noun-heavy with sight words as connective tissue; R3 reviews known sight words; R1 rhymes introduce the missing 40% of sight words inside chant structure, where rhythm carries the decoding load. Track sight-word coverage as the primary reading metric.

**Social (secondary):**
- **S1 — How does the animal feel?** Photo of an expressive animal → choose the feeling (happy/scared/angry/sad). Progresses to human children's faces in week 3+ — animals are the low-demand on-ramp to face-reading, not the destination.

**Reset:**
- **X1 — Swing break card.** Wolf says "Time to swing!" with a 5-minute visual timer; app waits; wolf welcomes him back. Optionally re-runs the weather check after — if stormy→cloudy, you've just measured that swinging regulates him, with data.
- **X2 — Den time.** On-screen fallback: slow rhythmic bubble-popping to a soft hickory-dickory melody, no goals, no score. Exit anytime.

## Tech (deliberately boring)

Single-page React web app, Tailwind, runs fullscreen on a tablet browser. No backend, no accounts: content lives in JSON files; session logs write to a local file/IndexedDB you export weekly. Audio: pre-generated TTS or your own recorded voice (worth testing which he responds to). Content generation: I generate rhyme-swap verses, wolf stories, and comprehension questions in batches ahead of time — you review every item before it ships to him. No live LLM in the kid loop for the MVP.

## Build plan

- **Week 1:** Session shell — weather check (self-report only), visual schedule strip, goodbye ritual, logging. Wolf character v0 (static images fine).
- **Week 2:** R1 rhyme swap + X2 den time. First supervised sessions with him — watch, don't measure yet.
- **Week 3:** R2 stories, S1 feelings, X1 swing break. Add the rhythm mini-game to the check-in.
- **Week 4:** Track-selection rules tuned from weeks 2–3 observations. Start the formal validation protocol from the concept doc.

## Session timing (locked)

**Daily at ~7 PM** — after snacks and two hours of free play (school/ABA ends at 5), before dinner. This slot works structurally: he arrives regulated from free play, and dinner provides a natural, non-negotiable session end — the wolf's goodbye ritual hands off to "dinner time," so the app never competes with an open-ended evening. Watch for one risk: pre-dinner hunger dragging Stretch-track performance. If week 2–3 logs show late-session errors climbing, test moving the demanding block earlier in the session.

## Still need from you

**School's visual schedule symbols/vocabulary** — whenever you can, even a photo of his schedule board. Everything else is now locked.
