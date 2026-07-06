# CLAUDE.md — Weathervane

## What this is

A state-aware learning companion web app for Prabhat's 8-year-old son, who is on the autism spectrum. Built for him first (n=1); designed to extrapolate to other autistic kids later. Full background in `docs/concept.md` and `docs/mvp-spec.md` — read those before making product decisions.

## The core product insight

His capacity varies by regulation state, not just skill. Every session starts with a "weather check" (self-report + tap-latency mini-game) that routes to one of three tracks: **stretch** (new material), **steady** (familiar review), **reset** (no demands — calming only). Skill-adaptive learning exists everywhere; state-adaptive doesn't. That's the bet.

## The child's profile (drives all content/design decisions)

- Mixed/situational verbal ability — varies with regulation state
- Reading: strong on nouns, ~60% of Dolch sight words; rhymes carry new sight words
- Mastered skill: typing a few letters + picking from autocomplete suggestions (search bars) — reused as the SearchDen answer mechanic
- Interests: animals (wolves especially), hickory-dickory-dock nursery-rhyme videos ("Caspo" on YouTube), swinging (vestibular seeker)
- Session time: daily ~7 PM, after free play, before dinner (dinner = natural session end)
- Uses a visual schedule at school — the in-app schedule strip mirrors that; school's exact symbols/vocabulary TBD (Prabhat will supply — align labels when he does)
- Academic priority: reading first, then math (math activities not yet built)

## Non-negotiable design rules

1. **Never punish a hard day.** No streaks, no lost progress. A 3-minute reset session is a success.
2. **Behavioral signal only downgrades, and only by ONE step.** Self-report is respected (see `chooseTrack` in `src/lib/storage.js` — has this exact bug history; keep the test cases passing).
3. **Stormy self-report skips the mini-game.** No demands on hard days, not even playful ones.
4. **Goodbye ritual is identical every session.** Predictable endings; the app ends the session, not the parent.
5. **Errorless learning.** Wrong answers never block progress; only first-try answers count in logs.
6. **Predictable structure, variable content.** Session shape never changes; content skins do.
7. **Sounds stay gentle.** No jarring/punitive audio, ever.

## Architecture

React 18 + Vite. No backend, no accounts (deliberate for v0).

- `src/lib/content.js` — ALL child-facing content. To refresh around a new interest, edit only this file.
- `src/lib/storage.js` — storage adapter (localStorage + JSON export) and `chooseTrack()`. The adapter is async-shaped so Supabase can drop in later without UI changes. Logs are per-device + per-URL.
- `src/lib/speech.js` — wolf voice via device TTS; replaceable with recorded audio.
- `src/App.jsx` — session flow state machine. Views: start → weather → bubbles → activities → bye → night, with reset branch (resetChoice → swing/den → recheck).
- `src/hooks/useQuestions.js` — shared question runner.
- Parent view: hold ⚙︎ button 2s. Export JSON, sound toggle, clear data.

## Current validation plan (n=1, ~4 weeks)

Primary metric: **does he initiate sessions voluntarily?** If it becomes an enforced demand, the design has failed regardless of learning outcomes. Week 2–3: does the weather check match Prabhat's independent read of his state (target ≥70%)? Week 3–4: interest-skinned vs. neutral content A/B on time-on-task. Watch: novelty effect (only week 4+ counts), app perseveration (soft auto-close is load-bearing), whether reset track actually calms vs. arouses.

## Roadmap

1. Now: n=1 with his son; supervised first sessions, always optional
2. Next: math activities; recorded parent voice; school-schedule symbol alignment; content generation pipeline (LLM fills templates, parent reviews every item before it ships to the child)
3. Later: Supabase log sync → parent pattern insights ("engagement drops after 4pm") → pilot with 5–10 families (behavioral data on autistic children = sensitive-category data; design storage accordingly from day one of the pilot)

## Sensory design rules (check every UI change against these)

Palette ("forest at dusk") — defined in `src/styles.css`:

- Base is warm cream (#F4EFE6), cards off-white (#FDFBF6), text warm charcoal (#3D3A34). Never pure white backgrounds (glare) or pure black text (contrast fatigue).
- Moss green (#7FB069) is the ONLY saturated action color — reserved for "touch this next." Eye-catching comes from uniqueness, not brightness.
- Dusty blue (#6D9DC5) for reading/focus elements; wolf gray (#8B8FA3) for character chrome.
- Soft amber (#E6B455) appears at reward moments ONLY. If it's everywhere it stops being a signal.
- Wrong/retry states use soft clay (#F5E3D7 bg / #8A5A3C text) — NEVER red. Red overstimulates and reads as punishment.
- Correct states: pale green (#EAF3E2) + charcoal, no flash.
- Weather tints shift the whole background with his check-in: sunny #F7EFDC, cloudy #E9EBEC, stormy #D9E0EA. Background transitions stay slow (~1.2s ease) — never fast color changes.
- Color = meaning, consistently (green = go, blue = reading, amber = celebration). Never reassign; predictable color-coding is itself a support.
- No flashing, strobing, parallax, or rapid movement. Animations are slow and few (bounce, breathe, gentle fade). No saturated red or yellow fields anywhere.
- Rationale: muted/low-arousal palettes suit many autistic kids, but variation is individual — the palette is a tested hypothesis, not dogma. If his engagement data says otherwise, the data wins.

## Working conventions

- Session data may include real observations about a real child — never commit exported logs to git.
- Test `chooseTrack` after touching it: sunny/800→stretch, sunny/3000→steady, sunny/5000→steady (one-step max), cloudy/4500→reset, stormy/null→reset.
- Verify `npm run build` passes before considering any change done.
- Keep all child-facing copy short, literal, and concrete. No idioms, no sarcasm, no time pressure.
