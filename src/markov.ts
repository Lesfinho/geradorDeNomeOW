const MAX_LEN = 12;
const MIN_LEN = 3;
const ORDER = 2;

// --- Markov Chain ---
function buildChain(names: string[]): Map<string, string[]> {
  const chain = new Map<string, string[]>();
  for (const name of names) {
    const padded = "^".repeat(ORDER) + name.toLowerCase() + "$";
    for (let i = 0; i < padded.length - ORDER; i++) {
      const key = padded.slice(i, i + ORDER);
      const next = padded[i + ORDER];
      if (!chain.has(key)) chain.set(key, []);
      chain.get(key)!.push(next);
    }
  }
  return chain;
}

function markovGenerate(chain: Map<string, string[]>): string | null {
  let current = "^".repeat(ORDER);
  let result = "";
  for (let i = 0; i < MAX_LEN; i++) {
    const options = chain.get(current);
    if (!options || options.length === 0) break;
    const next = options[Math.floor(Math.random() * options.length)];
    if (next === "$") break;
    result += next;
    current = current.slice(1) + next;
  }
  return result.length >= MIN_LEN ? result : null;
}

// --- Prefix/Suffix detection ---
function findAffixes(names: string[], minLen: number = 3): { prefixes: string[]; suffixes: string[] } {
  const prefixCount = new Map<string, number>();
  const suffixCount = new Map<string, number>();

  for (const name of names) {
    const lower = name.toLowerCase();
    for (let len = minLen; len <= Math.min(lower.length - 1, 6); len++) {
      const prefix = lower.slice(0, len);
      const suffix = lower.slice(-len);
      prefixCount.set(prefix, (prefixCount.get(prefix) || 0) + 1);
      suffixCount.set(suffix, (suffixCount.get(suffix) || 0) + 1);
    }
  }

  // Keep affixes that appear 2+ times
  const prefixes = [...prefixCount.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);

  const suffixes = [...suffixCount.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);

  return { prefixes, suffixes };
}

function affixGenerate(names: string[], prefixes: string[], suffixes: string[]): string | null {
  const lower = names.map((n) => n.toLowerCase());
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const coin = Math.random();

  if (coin < 0.4 && prefixes.length > 0) {
    // Known prefix + random suffix from a name
    const prefix = pick(prefixes);
    const donor = pick(lower);
    const cutPoint = MIN_LEN + Math.floor(Math.random() * (donor.length - MIN_LEN + 1));
    const result = prefix + donor.slice(cutPoint);
    if (result.length >= MIN_LEN && result.length <= MAX_LEN) return result;
  }

  if (coin < 0.8 && suffixes.length > 0) {
    // Random prefix from a name + known suffix
    const suffix = pick(suffixes);
    const donor = pick(lower);
    const cutPoint = Math.floor(Math.random() * (donor.length - MIN_LEN + 1)) + MIN_LEN;
    const result = donor.slice(0, cutPoint) + suffix;
    if (result.length >= MIN_LEN && result.length <= MAX_LEN) return result;
  }

  // Prefix + suffix combo
  if (prefixes.length > 0 && suffixes.length > 0) {
    const result = pick(prefixes) + pick(suffixes);
    if (result.length >= MIN_LEN && result.length <= MAX_LEN) return result;
  }

  return null;
}

// --- Couple name blender ---
function coupleGenerate(names: string[]): string | null {
  if (names.length < 2) return null;
  const lower = names.map((n) => n.toLowerCase());
  const a = lower[Math.floor(Math.random() * lower.length)];
  let b = lower[Math.floor(Math.random() * lower.length)];
  let attempts = 0;
  while (b === a && attempts++ < 10) {
    b = lower[Math.floor(Math.random() * lower.length)];
  }
  if (a === b) return null;

  const cutA = Math.max(1, Math.floor(Math.random() * a.length));
  const cutB = Math.max(1, Math.floor(Math.random() * b.length));

  // 50/50: first half of A + second half of B, or vice versa
  const result = Math.random() < 0.5
    ? a.slice(0, cutA) + b.slice(cutB)
    : b.slice(0, cutB) + a.slice(cutA);

  if (result.length >= MIN_LEN && result.length <= MAX_LEN) return result;
  return result.slice(0, MAX_LEN).length >= MIN_LEN ? result.slice(0, MAX_LEN) : null;
}

// --- Main entry ---
export function suggestNames(names: string[], count: number = 6): string[] {
  if (names.length < 10) return [];

  const chain = buildChain(names);
  const { prefixes, suffixes } = findAffixes(names);
  const existing = new Set(names.map((n) => n.toLowerCase()));
  const suggestions: string[] = [];
  const seen = new Set<string>();

  const strategies = [
    () => markovGenerate(chain),
    () => affixGenerate(names, prefixes, suffixes),
    () => coupleGenerate(names),
  ];

  for (let i = 0; i < count * 10 && suggestions.length < count; i++) {
    const strategy = strategies[i % strategies.length];
    const raw = strategy();
    if (!raw) continue;

    const name = raw.charAt(0).toUpperCase() + raw.slice(1);
    const key = name.toLowerCase();

    if (!existing.has(key) && !seen.has(key) && name.length <= MAX_LEN) {
      seen.add(key);
      suggestions.push(name);
    }
  }

  return suggestions;
}
