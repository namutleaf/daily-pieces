// Pulls whole emoji out of free text typed on the system keyboard, so any
// emoji the phone offers — not just our presets — can become a sticker.
// A single emoji is often several code points (👨‍👩‍👧 joined by ZWJ, 👍🏽 with a
// skin tone, 🇰🇷 as two regional indicators, 1️⃣ as a keycap), so this groups
// them instead of splitting per code point. Hand-rolled because Intl.Segmenter
// and regex property escapes aren't reliably available on every RN runtime.

const ZWJ = 0x200d;
const KEYCAP = 0x20e3;

const isVariationSelector = (cp: number) => cp === 0xfe0e || cp === 0xfe0f;
const isSkinTone = (cp: number) => cp >= 0x1f3fb && cp <= 0x1f3ff;
const isTag = (cp: number) => cp >= 0xe0020 && cp <= 0xe007f;
const isRegionalIndicator = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;
const isKeycapBase = (cp: number) => (cp >= 0x30 && cp <= 0x39) || cp === 0x23 || cp === 0x2a;

function isPictographic(cp: number): boolean {
  return (
    (cp >= 0x1f000 && cp <= 0x1faff) ||
    (cp >= 0x2600 && cp <= 0x27bf) ||
    (cp >= 0x2300 && cp <= 0x23ff) ||
    (cp >= 0x2b00 && cp <= 0x2bff) ||
    (cp >= 0x2190 && cp <= 0x21ff) ||
    (cp >= 0x25a0 && cp <= 0x25ff) ||
    cp === 0x2934 ||
    cp === 0x2935 ||
    cp === 0x3030 ||
    cp === 0x303d ||
    cp === 0x3297 ||
    cp === 0x3299 ||
    cp === 0x00a9 ||
    cp === 0x00ae ||
    cp === 0x2122 ||
    cp === 0x203c ||
    cp === 0x2049
  );
}

export function extractEmojis(text: string): string[] {
  const cps = Array.from(text).map((ch) => ch.codePointAt(0)!);
  const result: string[] = [];
  let i = 0;
  while (i < cps.length) {
    const cp = cps[i];

    if (isRegionalIndicator(cp)) {
      if (i + 1 < cps.length && isRegionalIndicator(cps[i + 1])) {
        result.push(String.fromCodePoint(cp, cps[i + 1]));
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (isKeycapBase(cp)) {
      let j = i + 1;
      if (j < cps.length && isVariationSelector(cps[j])) j++;
      if (j < cps.length && cps[j] === KEYCAP) {
        result.push(String.fromCodePoint(...cps.slice(i, j + 1)));
        i = j + 1;
      } else {
        i += 1;
      }
      continue;
    }

    if (!isPictographic(cp)) {
      i += 1;
      continue;
    }

    let j = i + 1;
    while (j < cps.length) {
      const next = cps[j];
      if (isVariationSelector(next) || isSkinTone(next) || isTag(next) || next === KEYCAP) {
        j++;
      } else if (next === ZWJ && j + 1 < cps.length && isPictographic(cps[j + 1])) {
        j += 2;
      } else {
        break;
      }
    }
    result.push(String.fromCodePoint(...cps.slice(i, j)));
    i = j;
  }
  return result;
}
