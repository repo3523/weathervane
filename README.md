# Weathervane

A state-aware learning companion for autistic kids, built first for one 8-year-old wolf fan. React 18 + Vite, with a few Vercel serverless functions and optional Supabase sync.

Every session starts with a **weather check** (how he feels + a short bubble-tap game), which routes to one of three tracks:

| Track | When | What happens |
|---|---|---|
| **Stretch** | Sunny, quick taps | New material |
| **Steady** | Sunny but slow, or cloudy | Familiar review |
| **Reset** | Stormy (skips the game), or cloudy + slow | No demands: swing, den time or animal photos, then goodbye |

Skill-adaptive learning is common. Adapting to regulation state is the idea being tested here. See [docs/concept.md](docs/concept.md) and [docs/mvp-spec.md](docs/mvp-spec.md) for the background.

## Run locally

```bash
npm install
npm run dev          # UI only, http://localhost:5173
```

`npm run dev` serves the React app, but the `/api/*` routes don't exist under plain Vite. The core session works without them (weather check, activities, swing, den, goodbye). Story generation, character art and animal photos need the functions, so run them through the Vercel CLI instead:

```bash
vercel link          # once
vercel env pull .env.local
vercel dev           # UI + /api functions, http://localhost:3000
```

Build check (run it before calling any change done):

```bash
npm run build
```

## Environment variables

All of these are optional. Each one you leave out disables only the feature that uses it.

| Variable | Used by | Enables |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser | Parent sign-in (email magic link), child profiles, cloud sync of stories/themes/sessions. Without them the app runs localStorage-only with no login. |
| `ANTHROPIC_API_KEY` | `api/generate-story.js` | Social Story text generation (Claude Haiku) |
| `OPENAI_API_KEY` | `api/generate-image.js`, `api/generate-character.js` | Story page illustrations and custom theme character art |
| `PIXABAY_API_KEY` | `api/search-images.js` | Animal photos in the reset track (safe-search on, whitelisted animals only) |

Keep secrets in `.env.local` (gitignored). Only `VITE_`-prefixed vars reach the browser, so never give an API key that prefix.

## Deploy

The app is set up for **Vercel**, since the `/api` folder deploys as Vercel Functions:

```bash
vercel               # preview
vercel --prod        # production
```

Set the env vars above in the Vercel project settings. On the iPad, open the URL in Safari → Share → **Add to Home Screen** so it launches fullscreen like an app.

A static host (Netlify Drop, GitHub Pages) with `dist/` also works, but only for the core session. The API-backed features won't work there.

## Supabase setup (optional)

1. Create a Supabase project and run [supabase/schema.sql](supabase/schema.sql) in the SQL editor. This creates the `child_profiles`, `themes`, `stories` and `sessions` tables with row-level security scoped to the signed-in parent, plus a storage bucket for generated images.
2. Enable email (magic link) auth and add your deployed URL to the allowed redirect URLs.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Sync merges only: it adds missing items and doesn't propagate deletions yet.

## Project structure

```
api/                       Vercel Functions (server-side keys live here)
  generate-story.js        Social Story text (Anthropic)
  generate-image.js        Story page illustrations (OpenAI gpt-image-1)
  generate-character.js    Custom theme character portrait (OpenAI)
  search-images.js         Animal photos (Pixabay, whitelist from content.js)
  health.js                Diagnostic: reports whether keys are set. Remove once confirmed.
supabase/schema.sql        Tables, RLS policies, storage bucket
public/lottie/             Character animations
docs/                      Concept doc and MVP spec
src/
  App.jsx                  Session state machine + auth/profile gating
  lib/
    content.js             ALL child-facing content (rhymes, words, feelings, animal whitelist)
    storage.js             Session log adapter + chooseTrack()
    themes.js              Interest packs & custom themes (reskins content around a character)
    stories.js             Social Story storage + sync
    speech.js              Character voice via device TTS
    supabase.js, sync.js, profile.js   Optional cloud layer
    fx.js, animations.js, fluent.js    Chimes, Lottie, Fluent 3D emoji
  hooks/useQuestions.js    Shared errorless question runner
  components/
    screens.jsx            Start, weather check, bubble game, reset choice, goodbye, night
    activities.jsx         RhymeSwap, WordDen, SearchDen, Feelings
    reset.jsx              SwingBreak, DenTime, AnimalPhotos
    StoryBuilder.jsx, StoryReader.jsx   Parent-authored Social Stories
    ThemeWizard.jsx        Build a theme around a new interest
    ParentView.jsx         Hidden parent panel
    AuthGate.jsx, ProfileSetup.jsx      Sign-in and child profile setup
```

## Session flow

```
start → weather ─┬─ stormy ───────────────────────────→ resetChoice
                 └─ sunny/cloudy → bubbles → chooseTrack ┬─ stretch/steady → activities → bye → night
                                                         └─ reset → resetChoice
resetChoice ┬─ swing → recheck → bye
            └─ den | photos ───→ bye
```

## Parent view

**Hold the ⚙︎ button for 2 seconds.** From there you can see session logs, export them as JSON, toggle sound, pick the voice, manage themes and stories, and clear data.

## Design rules

These are enforced in code. Please don't break them:

1. **Never punish a hard day.** No streaks and no lost progress. A 3-minute reset session counts as a success.
2. **Tap speed can only downgrade the track, and by one step at most.** His self-report is respected. `chooseTrack` in [src/lib/storage.js](src/lib/storage.js) must still pass these cases after any change: sunny/800→stretch, sunny/3000→steady, sunny/5000→steady, cloudy/4500→reset, stormy/null→reset.
3. **A stormy check-in skips the bubble game.** No demands on hard days, not even playful ones.
4. **The goodbye ritual is the same every session.** The app ends the session, not the parent.
5. **Errorless learning.** Wrong answers never block progress, and only first-try answers are logged.
6. **Predictable structure, variable content.** The session shape never changes. Only the content skins do.
7. **Gentle sounds, muted "forest at dusk" palette.** No red, no flashing, and amber only at reward moments. The full sensory rules are in [CLAUDE.md](CLAUDE.md).

To refresh the content around a new interest, edit only [src/lib/content.js](src/lib/content.js) or use the Theme Wizard.

## Data & privacy

- Without Supabase, session logs stay in the browser's localStorage, **per device and per URL**. Export before changing the deploy URL, or the old logs won't follow.
- Logs can contain real observations about a real child. **Never commit exported logs** (`weathervane-log-*.json` is gitignored).
- Generated story text and images go through third-party APIs. Don't put identifying details in story prompts.
