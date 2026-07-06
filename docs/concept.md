# Weathervane — Concept Doc
*Working name. A state-aware learning companion for autistic kids, starting with one 8-year-old.*

## One-liner

A short daily tablet session that first reads how the child is doing *right now*, then serves learning, social practice, or calming play matched to that capacity — with all content re-skinned around his current interests.

## The core insight

An autistic child's capacity isn't fixed; it swings with regulation state, sleep, sensory load, and time of day. Products built for "the average Tuesday" create demand pressure on hard days (meltdowns, avoidance) and under-challenge on good days. Weathervane's bet: **adapt to the kid's state, not just his skill level.** Skill-adaptive learning exists everywhere; state-adaptive learning basically doesn't.

## Design principles

1. **Never punish a hard day.** No streaks, no lost points, no "you didn't finish." A red-day session that ends in 3 minutes of calming play is a *successful* session.
2. **Predictable structure, variable content.** The session shape never changes (check-in → activities → close). What fills it changes daily. Sameness where he needs it, novelty where he can enjoy it.
3. **Low-demand entry.** The first 30 seconds ask nothing hard. Opening the app should never feel like the start of work.
4. **Interests are the fuel, not a gimmick.** Content templates get re-skinned with whatever he loves this month.
5. **Parent sees everything, kid feels no surveillance.** Logging is invisible and framed as his private world.

## How a session works (~10–15 min)

**Step 1 — Weather check (30–60s).** He picks his "inner weather" (sunny / cloudy / stormy icons) and plays one tiny mini-game (e.g., pop bubbles in sequence). The app quietly measures tap latency, accuracy, and hesitation. Self-report + behavioral signal together pick the track. If the two disagree, trust the behavioral signal downward (never upward).

**Step 2 — Track selection.**

| Track | When | Session content |
|---|---|---|
| ☀️ Stretch | Regulated, responsive | 1 academic micro-lesson (new material) + 1 social micro-practice |
| ⛅ Steady | Okay but not great | Familiar, high-success activities; review, not new material |
| 🌧️ Reset | Dysregulated, slow, avoidant | No demands. Sensory play, favorite-interest content, calm music. Soft exit anytime |

**Step 3 — Activities (2–3 blocks, ~4 min each).** Each block is a template filled by the interest engine. Examples: math-facts race skinned as his favorite characters; "what is this face feeling?" using stills from a show he likes; a 4-panel choose-your-own social scenario ("Your friend took your toy. What next?").

**Step 4 — Gentle close.** Fixed goodbye ritual (same every time — predictability). One-tap "how was it?" from him. Session auto-ends softly with a 2-minute warning to avoid perseveration battles; the app itself says goodbye so the parent isn't the one ending screen time.

## The interest engine

Parent maintains a short list of current interests ("Minecraft, ocean animals, Beat Saber"). An LLM fills vetted activity templates with interest-flavored content: template = pedagogy and difficulty (fixed, human-designed); skin = characters, names, images, story framing (generated). When an interest fades, update the list and every activity refreshes — this is exactly where static apps die and moderate/shifting interests are actually an advantage.

## MVP scope (4–6 weeks, evenings-and-weekends realistic)

**In:** Web app on a tablet, single user, no accounts. Check-in v0 (self-report icons + one latency mini-game). Three tracks with hand-tuned selection rules. One academic skill at his current level (pick one: math facts *or* reading comprehension). One social skill (emotion labeling from images). One reset activity (sensory pop/draw toy). Interest engine v0: you edit a JSON list; content generated ahead of time, not live. Parent view: a plain log — date, track, minutes, completion, his one-tap rating.

**Out (deliberately):** Voice/AI companion, AAC features, live LLM generation, ML on check-in data, multi-child, rewards economy, anything school-facing.

## Validation plan (n=1, ~4 weeks)

The only question that matters first: **does he come back voluntarily?**

- **Week 1–2 — Adoption.** Offer the session daily, never require it. Track: initiations without prompting, sessions completed vs. abandoned, resistance level vs. his current activities. Kill signal: if it becomes a demand you have to enforce, the design has failed regardless of learning outcomes.
- **Week 2–3 — Does the weather check work?** Each session, you independently note your read of his state before seeing the app's track choice. Target: app matches your judgment ≥70% of the time. If self-report alone matches you, the mini-game telemetry can wait.
- **Week 3–4 — Does interest-skinning matter?** Alternate days: identical activities, interest-skinned vs. neutral. Compare time-on-task and completion. This validates the content engine before you invest in it.

Throughout: does the reset track actually calm him, or does screen = more arousal? (Honest possibility — watch for it.)

## Risks and watchouts

**Novelty effect.** Weeks 1–2 will look great no matter what; only week 4+ data counts. **Perseveration on the app itself.** The soft auto-close and fixed ritual are load-bearing; if exits become battles, that's a redesign trigger. **Rigidity risk.** If he insists sessions happen at exact times/ways, build in planned small variations early. **You're both dad and researcher.** Keep observation notes lightweight (2 min/day) or you'll stop taking them. **Data privacy.** Fine at n=1; the moment other families join, behavioral data on autistic children is sensitive-category data — design storage for that from day one of the pilot.

## Extrapolation path

1. **n=1 (now):** Validate voluntary engagement + weather-check accuracy with your son.
2. **n=5–10 (month 3–4):** Families from local support groups/school. Tests whether check-in calibration generalizes or needs per-kid tuning — the key technical risk.
3. **Parent layer (month 5+):** The logs become the second product: weekly pattern insights ("engagement drops after 4pm; social practice lands best post-exercise"), shareable with therapists. This matches your stated roadmap — kid first, parents second — and by then it's earned with real data.

## Open questions for you

Which academic skill first — math facts or reading? What are his current top 3 interests? What time of day is he most regulated (that's when to introduce it)? And does he currently use any visual schedule or Zones-of-Regulation-style vocabulary at school we should stay consistent with?
