// 자막 줄 나누기: 문장 끝에서 반드시 끊고, 긴 문장은 쉼표·접속사 앞에서 고르게 나눈다.
// scripts/lib.mjs의 chunkWords와 같은 알고리즘이다 — 한쪽을 고치면 다른 쪽도 맞출 것.

const BREAK_BEFORE = new Set(["and", "but", "so", "or", "because", "which", "that", "while", "when", "after", "before", "then", "with", "to", "for", "from", "of", "in", "on", "not"]);
const ABBREV = /^([A-Za-z]\.)+$|^(Mr|Mrs|Ms|Dr|St|vs|etc|Inc|Ltd|Jr|Sr)\.$/;

const endsSentence = (w: string) => /[.!?]["')\]]?$/.test(w) && !ABBREV.test(w);

/** Cost of ending a caption after `w` when `next` follows. Lower = more natural break. */
// A caption should not end on these (it leaves the reader hanging).
const NO_END = new Set(["the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "by", "from", "its", "their", "your", "my", "our", "his", "her", "that", "than", "is", "are", "was", "were"]);

const breakCost = (w: string, next: string | undefined) => {
  if (next === undefined) return 0;
  if (/[,;:]["')\]]?$|[—–-]$/.test(w)) return 0;
  if (NO_END.has(w.toLowerCase())) return 25;
  if (BREAK_BEFORE.has(next.toLowerCase().replace(/[^a-z]/g, ""))) return 1.5;
  return 5;
};

/** Splits one sentence into balanced chunks of at most `max` words (dynamic programming). */
const splitSentence = <T>(words: T[], text: (w: T) => string, max: number): T[][] => {
  const n = words.length;
  if (n <= max) return [words];
  const target = Math.min(max, Math.max(3, n / Math.ceil(n / max)));
  const best: number[] = [0];
  const prev: number[] = [0];
  for (let j = 1; j <= n; j++) {
    best[j] = Infinity;
    for (let i = Math.max(0, j - max); i <= j - 1; i++) {
      const size = j - i;
      if (best[i] === Infinity) continue;
      // Avoid one- and two-word leftovers unless the sentence itself is that short.
      const tiny = size < 3 ? 8 : 0;
      const cost = best[i]! + 2 + 0.6 * (size - target) ** 2 + tiny + breakCost(text(words[j - 1]!), j < n ? text(words[j]!) : undefined);
      if (cost < best[j]!) {
        best[j] = cost;
        prev[j] = i;
      }
    }
  }
  const out: T[][] = [];
  for (let j = n; j > 0; j = prev[j]!) out.unshift(words.slice(prev[j]!, j));
  return out;
};

/** Groups words into caption chunks: never across sentences, at most `max` words each. */
export const chunkWords = <T>(words: T[], text: (w: T) => string, max = 7): T[][] => {
  const out: T[][] = [];
  let sentence: T[] = [];
  words.forEach((w, i) => {
    sentence.push(w);
    if (endsSentence(text(w)) || i === words.length - 1) {
      out.push(...splitSentence(sentence, text, max));
      sentence = [];
    }
  });
  return out;
};
