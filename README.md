# Weathervane

A state-aware learning companion for one 8-year-old wolf fan. React + Vite.

## Run locally

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

## Deploy free (pick one)

**Easiest — Netlify Drop (no account tools needed):**

```bash
npm run build      # produces dist/
```

Then drag the `dist` folder onto https://app.netlify.com/drop → you get a URL instantly. Open that URL on the iPad in Safari → Share → **Add to Home Screen** → it launches fullscreen like an app.

**Vercel:** `npx vercel` from the project root, accept defaults.

**GitHub Pages:** push the repo, enable Pages on the `dist` output via any vite-gh-pages action.

## Project structure

```
src/
  lib/
    content.js      ← ALL child-facing content (rhymes, words, feelings). Edit here to refresh interests.
    storage.js      ← storage adapter (localStorage now; swap in Supabase later without touching UI)
    speech.js       ← wolf voice (device TTS; replaceable with recorded audio)
    fx.js           ← confetti + gentle chimes
  hooks/useQuestions.js  ← shared question runner (errorless-learning style)
  components/
    screens.jsx     ← start, weather check, bubble mini-game, reset choice, goodbye, night
    activities.jsx  ← RhymeSwap (R1), WordDen (R3), SearchDen (R4), Feelings (S1)
    reset.jsx       ← SwingBreak (X1), DenTime (X2)
    ParentView.jsx  ← hidden log view (hold ⚙︎ 2s), export, sound toggle
  App.jsx           ← session flow state machine + track selection
```

## Design rules encoded in this app

- Behavioral signal (tap latency) can only *downgrade* the track, and only by one step — his self-report is respected.
- Stormy self-report skips the mini-game entirely: no demands on hard days.
- Goodbye ritual is identical every session.
- Wrong answers never block progress (errorless learning); only first-try answers count in the log.
- Data stays on-device; export JSON from parent view.

## Data note

Session logs live in the browser's localStorage *per device + per URL*. If you redeploy to a new URL, old logs don't follow — export first. Next step when ready: swap `src/lib/storage.js` for a Supabase-backed adapter to sync logs to your phone/laptop.
