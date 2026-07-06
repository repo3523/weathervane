import { useRef, useState } from "react";

/* Generic question-set runner shared by all activities.
   First-try answers count as "correct"; retries always succeed eventually
   (errorless-learning style — the child is never stuck). */
export function useQuestions(items, type, onComplete) {
  const [index, setIndex] = useState(0);
  const right = useRef(0);
  const tries = useRef(0);
  const finished = useRef(false);

  function submit(isCorrect) {
    if (finished.current) return;
    if (!isCorrect) {
      tries.current += 1;
      return;
    }
    if (tries.current === 0) right.current += 1;
    tries.current = 0;
    if (index + 1 >= items.length) {
      finished.current = true;
      onComplete({ type, correct: right.current, total: items.length });
    } else {
      setIndex((i) => i + 1);
    }
  }

  return { item: items[index], index, total: items.length, submit };
}
