import { useEffect, useMemo, useState } from "react";
import { useQuestions } from "../hooks/useQuestions.js";
import { Wolf, BigButton, Dots } from "./ui.jsx";
import { say } from "../lib/speech.js";
import { confetti, chimeCorrect } from "../lib/fx.js";
import { pick, shuffle } from "../lib/content.js";
import { useTheme } from "../lib/ThemeContext.jsx";

/* Shared choice-buttons block: handles correct/wrong visual states,
   praise, chime, and the pause before advancing. */
function Choices({ options, isCorrect, onAdvance, render }) {
  const theme = useTheme();
  const [wrong, setWrong] = useState([]);
  const [correctKey, setCorrectKey] = useState(null);

  useEffect(() => { setWrong([]); setCorrectKey(null); }, [options]);

  function tap(key) {
    if (correctKey) return;
    if (isCorrect(key)) {
      setCorrectKey(key);
      chimeCorrect();
      say(pick(theme.says.goodJob));
      setTimeout(() => onAdvance(wrong.length === 0), 1000);
    } else if (!wrong.includes(key)) {
      setWrong((w) => [...w, key]);
      say(pick(theme.says.tryAgain));
    }
  }

  return (
    <div className="row">
      {options.map((opt) => {
        const key = typeof opt === "string" ? opt : opt.key;
        const state = key === correctKey ? "correct" : wrong.includes(key) ? "wrong" : "";
        return (
          <BigButton key={key} state={state} onClick={() => tap(key)} disabled={wrong.includes(key)}>
            {render(opt)}
          </BigButton>
        );
      })}
    </div>
  );
}

function useActivity(source, n, type, onComplete) {
  const items = useMemo(() => shuffle(source).slice(0, n), [source, n]);
  const q = useQuestions(items, type, (result) => {
    confetti();
    setTimeout(() => onComplete(result), 900);
  });
  return q;
}

/* R1 — Rhyme swap: his hickory-dickory-dock videos, made interactive. */
export function RhymeSwap({ onComplete }) {
  const theme = useTheme();
  const { item, index, total, submit } = useActivity(theme.rhymes, 4, "rhyme", onComplete);
  const options = useMemo(() => shuffle(item.choices), [item]);

  useEffect(() => { say(`${item.line1} ${item.line2}... hmm!`); }, [item]);

  return (
    <div className="screen fade-in" key={index}>
      <Wolf face={item.emoji} size="md" />
      <div className="verse">
        {item.line1}<br />
        {item.line2} <span className="blank">____</span> !
      </div>
      <Choices
        options={options}
        isCorrect={(c) => c === item.answer}
        onAdvance={(firstTry) => { say(`${item.line1} ${item.line2} ${item.answer}!`); submit(firstTry); if (!firstTry) submit(true); }}
        render={(c) => c}
      />
      <div className="row">
        <BigButton className="small" onClick={() => say(`${item.line1} ${item.line2}... hmm!`)}>🔊 Hear it</BigButton>
      </div>
      <Dots index={index} total={total} />
    </div>
  );
}

/* R3 — Word den: sight/noun word ↔ picture matching. */
export function WordDen({ onComplete }) {
  const theme = useTheme();
  const { item, index, total, submit } = useActivity(theme.words, 5, "words", onComplete);
  const options = useMemo(() => shuffle(item.choices), [item]);

  useEffect(() => { say("Which word matches?"); }, [item]);

  return (
    <div className="screen fade-in" key={index}>
      <h1>Word Den</h1>
      <p className="sub">Which word matches?</p>
      <Wolf face={item.emoji} size="md" />
      <Choices
        options={options}
        isCorrect={(c) => c === item.word}
        onAdvance={(firstTry) => { submit(firstTry); if (!firstTry) submit(true); }}
        render={(c) => c}
      />
      <Dots index={index} total={total} />
    </div>
  );
}

/* R4 — Search the den: reuses his mastered search-bar-with-autocomplete skill. */
export function SearchDen({ onComplete }) {
  const theme = useTheme();
  const { item, index, total, submit } = useActivity(theme.searches, 3, "search", onComplete);
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState([]);
  const [won, setWon] = useState(false);

  const options = useMemo(
    () => shuffle([
      { w: item.answer, e: item.emoji, ok: true },
      ...item.decoys.map((d) => ({ w: d.w, e: d.e, ok: false })),
    ]),
    [item]
  );

  useEffect(() => { setTyped(""); setWrong([]); setWon(false); say(item.clue); }, [item]);

  const matches = typed.trim()
    ? options.filter((o) => o.w.startsWith(typed.trim().toLowerCase()))
    : [];

  function choose(o) {
    if (won) return;
    if (o.ok) {
      setWon(true);
      chimeCorrect();
      say(pick(theme.says.goodJob));
      const firstTry = wrong.length === 0;
      setTimeout(() => { submit(firstTry); if (!firstTry) submit(true); }, 1000);
    } else if (!wrong.includes(o.w)) {
      setWrong((w) => [...w, o.w]);
      say(pick(theme.says.tryAgain));
    }
  }

  return (
    <div className="screen fade-in" key={index}>
      <Wolf size="md" />
      <h1 className="clue">{item.clue}</h1>
      <div className="searchbox">
        🔍
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type here…"
          autoComplete="off"
          autoCapitalize="off"
          autoFocus
        />
      </div>
      <div className="sugg">
        {matches.map((o) => (
          <button
            key={o.w}
            className={won && o.ok ? "correct" : wrong.includes(o.w) ? "wrong" : ""}
            onClick={() => choose(o)}
          >
            <span style={{ fontSize: 30 }}>{o.e}</span> {o.w}
          </button>
        ))}
      </div>
      <Dots index={index} total={total} />
    </div>
  );
}

/* S1 — Feelings: emotion labeling; animal scenes as the low-demand on-ramp. */
export function Feelings({ onComplete }) {
  const theme = useTheme();
  const { item, index, total, submit } = useActivity(theme.feelings, 4, "feelings", onComplete);
  const options = useMemo(() => shuffle(item.choices).map(([w, e]) => ({ key: w, em: e })), [item]);

  useEffect(() => { say(`${item.text} ... How does it feel?`); }, [item]);

  return (
    <div className="screen fade-in" key={index}>
      <Wolf face={item.scene} size="md" />
      <div className="verse small-verse">{item.text}</div>
      <p className="sub" style={{ marginTop: 14 }}>How does it feel?</p>
      <Choices
        options={options}
        isCorrect={(k) => k === item.answer}
        onAdvance={(firstTry) => { submit(firstTry); if (!firstTry) submit(true); }}
        render={(o) => (<><span className="em">{o.em}</span>{o.key}</>)}
      />
      <Dots index={index} total={total} />
    </div>
  );
}
