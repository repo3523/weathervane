import { useRef, useState, useEffect } from "react";
import { ScheduleStrip } from "./components/ui.jsx";
import { StartScreen, WeatherCheck, WeatherReaction, BubbleGame, ResetChoice, Goodbye, Night, CharacterCorner } from "./components/screens.jsx";
import { RhymeSwap, WordDen, SearchDen, Feelings } from "./components/activities.jsx";
import { SwingBreak, DenTime, AnimalPhotos } from "./components/reset.jsx";
import { ParentView } from "./components/ParentView.jsx";
import { StoryShelf, StoryReader } from "./components/StoryReader.jsx";
import { AuthGate } from "./components/AuthGate.jsx";
import { ProfileSetup } from "./components/ProfileSetup.jsx";
import { storage, chooseTrack } from "./lib/storage.js";
import { shuffle } from "./lib/content.js";
import { loadStories } from "./lib/stories.js";
import { ThemeContext } from "./lib/ThemeContext.jsx";
import { ProfileContext } from "./lib/ProfileContext.jsx";
import { getActiveTheme } from "./lib/themes.js";
import { supabase } from "./lib/supabase.js";
import { setActiveChildId, pullFromSupabase } from "./lib/sync.js";
import { getProfiles, createProfile } from "./lib/profile.js";

const ACTIVITIES = { rhyme: RhymeSwap, words: WordDen, search: SearchDen, feelings: Feelings };

function newSession() {
  return { startTime: Date.now(), weather: null, latencies: [], track: null, results: [] };
}

export default function App() {
  // Auth state: "loading" | "unauthenticated" | "no-profile" | "ready"
  const [authState, setAuthState] = useState(() => supabase ? "loading" : "ready");
  const [childId,   setChildId]   = useState(null);
  const [childName, setChildName] = useState(null);
  const [profiles,  setProfiles]  = useState([]);

  const [view, setView] = useState("start");
  const [plan, setPlan] = useState([]);
  const [step, setStep] = useState(-1);
  const [parentOpen, setParentOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());
  const [storyView, setStoryView] = useState(null); // null | "shelf" | story object
  const sess = useRef(newSession());
  const holdTimer = useRef(null);

  function refreshTheme() { setActiveTheme(getActiveTheme()); }

  async function switchChild(profile) {
    if (profile.id === childId) return;
    setActiveChildId(profile.id);
    // Clear per-child cache (themes, sessions) — stories are account-wide, keep them
    localStorage.removeItem("wv_sessions");
    // Pull new child's data BEFORE updating state so ParentView remounts with correct data
    await pullFromSupabase(profile.id, profiles.map(p => p.id));
    setChildId(profile.id);
    setChildName(profile.name);
    refreshTheme();
  }

  async function addChild(name) {
    const p = await createProfile(name);
    setProfiles(prev => [...prev, p]);
    await switchChild(p);
  }

  // Auth initialisation — runs once on mount when Supabase is configured
  useEffect(() => {
    if (!supabase) return;

    async function initSession(session) {
      if (!session) { setAuthState("unauthenticated"); return; }
      try {
        const allProfiles = await getProfiles();
        if (!allProfiles.length) { setAuthState("no-profile"); return; }
        setProfiles(allProfiles);
        const p = allProfiles[0];
        setChildId(p.id);
        setChildName(p.name);
        setActiveChildId(p.id);
        await pullFromSupabase(p.id, allProfiles.map(p2 => p2.id));
        refreshTheme();
        setAuthState("ready");
      } catch {
        setAuthState("ready"); // degrade gracefully if network fails
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => initSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { setChildId(null); setChildName(null); setAuthState("unauthenticated"); }
      else if (event === "SIGNED_IN") initSession(session);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- auth / profile gates ---------- */
  if (authState === "loading") {
    return (
      <div className="app" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div className="story-spinner" />
      </div>
    );
  }
  if (authState === "unauthenticated") {
    return <div className="app"><AuthGate /></div>;
  }
  if (authState === "no-profile") {
    return (
      <div className="app">
        <ProfileSetup onCreated={p => {
          setChildId(p.id);
          setChildName(p.name);
          setActiveChildId(p.id);
          setAuthState("ready");
        }} />
      </div>
    );
  }

  /* ---------- flow ---------- */
  function start() {
    sess.current = newSession();
    setView("weather");
  }

  function weatherPicked(w) {
    sess.current.weather = w;
    if (w === "stormy") {
      sess.current.track = "reset";
      setView("resetChoice");
    } else {
      setView("weatherReaction");
    }
  }

  function escapeToBreak() {
    sess.current.track = "reset";
    setView("resetChoice");
  }

  function bubblesDone(latencies) {
    sess.current.latencies = latencies;
    const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null;
    const track = chooseTrack(sess.current.weather, avg);
    sess.current.track = track;
    const pool = track === "stretch"
      ? shuffle(["rhyme", "search", "feelings"]).slice(0, 2)
      : shuffle(["words", "rhyme"]).slice(0, 2);
    const p = track === "reset" ? ["check", "den", "bye"] : ["check", ...pool, "bye"];
    setPlan(p);
    setStep(1);
    setView(p[1]);
  }

  function resetPicked(choice) {
    const p = ["check", choice, "bye"];
    setPlan(p);
    setStep(1);
    setView(choice);
  }

  function activityDone(result) {
    sess.current.results.push(result);
    advance();
  }

  function advance() {
    const next = step + 1;
    setStep(next);
    setView(plan[next] || "bye");
  }

  function swingDone() {
    sess.current.results.push({ type: "swing" });
    setView("recheck");
  }

  function recheckPicked(w) {
    sess.current.results.push({ type: "recheck", weatherAfter: w });
    const byeIdx = plan.indexOf("bye");
    setStep(byeIdx);
    setView("bye");
  }

  function denDone() {
    sess.current.results.push({ type: "den" });
    const byeIdx = plan.indexOf("bye");
    setStep(byeIdx);
    setView("bye");
  }

  function photosDone(result) {
    sess.current.results.push({ type: "photos", ...result });
    const byeIdx = plan.indexOf("bye");
    setStep(byeIdx);
    setView("bye");
  }

  async function rated(rating) {
    const s = sess.current;
    const avg = s.latencies.length ? Math.round(s.latencies.reduce((a, b) => a + b, 0) / s.latencies.length) : null;
    await storage.saveSession({
      date: new Date().toISOString(),
      themeId: activeTheme.id,
      weather: s.weather,
      avgLatencyMs: avg,
      track: s.track,
      activities: s.results,
      rating,
      durationSec: Math.round((Date.now() - s.startTime) / 1000),
    });
    setView("night");
    setTimeout(() => {
      setPlan([]);
      setStep(-1);
      setView("start");
    }, 2600);
  }

  /* ---------- parent access: press & hold 2s ---------- */
  function holdStart() { holdTimer.current = setTimeout(() => setParentOpen(true), 2000); }
  function holdEnd() { clearTimeout(holdTimer.current); }

  /* ---------- render ---------- */
  const ActivityComp = ACTIVITIES[view];
  const weatherClass = sess.current.weather && view !== "start" ? `wx-${sess.current.weather}` : "wx-none";
  const BREAK_VIEWS = new Set(["bubbles", "rhyme", "words", "search", "feelings"]);
  const showBreak = !storyView && BREAK_VIEWS.has(view);

  return (
    <ThemeContext.Provider value={activeTheme}>
      <ProfileContext.Provider value={{ childId, childName }}>
        <div className={`app ${weatherClass}`}>
          <ScheduleStrip plan={plan} step={step} />
          <div className="stage">
            {storyView === "shelf" && (
              <StoryShelf
                stories={loadStories()}
                onOpen={s => setStoryView(s)}
                onClose={() => setStoryView(null)}
              />
            )}
            {storyView && storyView !== "shelf" && (
              <StoryReader story={storyView} onDone={() => setStoryView(null)} />
            )}
            {!storyView && view === "start"       && <StartScreen onStart={start} onStories={() => setStoryView("shelf")} />}
            {!storyView && view === "weather"         && <WeatherCheck onPick={weatherPicked} />}
            {!storyView && view === "weatherReaction" && <WeatherReaction weather={sess.current.weather} onDone={() => setView("bubbles")} />}
            {!storyView && view === "bubbles"         && <BubbleGame onDone={bubblesDone} />}
            {!storyView && view === "resetChoice" && <ResetChoice onPick={resetPicked} />}
            {!storyView && ActivityComp           && <ActivityComp onComplete={activityDone} />}
            {!storyView && view === "swing"       && <SwingBreak onBack={swingDone} />}
            {!storyView && view === "den"         && <DenTime onDone={denDone} />}
            {!storyView && view === "photos"      && <AnimalPhotos onComplete={photosDone} />}
            {!storyView && view === "recheck"     && <WeatherCheck title={`How is your ${activeTheme.character.name} now?`} onPick={recheckPicked} />}
            {!storyView && view === "bye"         && <Goodbye onRate={rated} />}
            {!storyView && view === "night"       && <Night />}
          </div>
          {showBreak && <CharacterCorner />}
          {showBreak && (
            <button className="breakbtn" onClick={escapeToBreak} title="Take a break">
              🛝
            </button>
          )}
          <button
            className="parentbtn"
            title="Hold for grown-ups"
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerLeave={holdEnd}
          >
            ⚙︎
          </button>
          {parentOpen && (
            <ParentView
              key={childId}
              onClose={() => setParentOpen(false)}
              onThemeChange={refreshTheme}
              profiles={profiles}
              activeChildId={childId}
              onSwitchChild={switchChild}
              onAddChild={addChild}
            />
          )}
        </div>
      </ProfileContext.Provider>
    </ThemeContext.Provider>
  );
}
