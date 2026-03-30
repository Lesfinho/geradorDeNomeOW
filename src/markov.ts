const MAX_LEN = 12;
const MIN_LEN = 3;
const ORDER = 2;

export type CoupleSuggestion = {
  name: string;
  pair: string;
};

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

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

// --- Couple by repeated affix (prefix OR suffix) ---
function buildWithRepeatedSuffix(donor: string, suffix: string): string | null {
  const lower = donor.toLowerCase();
  if (lower.length < MIN_LEN) return null;

  const maxCut = Math.max(1, lower.length - 1);
  const cutPoint = Math.min(maxCut, Math.max(1, Math.floor(Math.random() * maxCut) + 1));
  const base = lower.slice(0, cutPoint);
  const result = (base + suffix).slice(0, MAX_LEN);

  if (result.length < MIN_LEN) return null;
  return result;
}

function buildWithRepeatedPrefix(donor: string, prefix: string): string | null {
  const lower = donor.toLowerCase();
  if (lower.length < MIN_LEN) return null;

  const maxStart = Math.max(0, lower.length - MIN_LEN);
  const start = Math.floor(Math.random() * (maxStart + 1));
  const tail = lower.slice(start);
  const result = (prefix + tail).slice(0, MAX_LEN);

  if (result.length < MIN_LEN) return null;
  return result;
}

function coupleGenerateByAffix(names: string[], prefixes: string[], suffixes: string[]): CoupleSuggestion | null {
  if (names.length < 2) return null;

  const canUseSuffix = suffixes.length > 0;
  const canUsePrefix = prefixes.length > 0;
  if (!canUseSuffix && !canUsePrefix) return null;

  const useSuffix = canUseSuffix && (!canUsePrefix || Math.random() < 0.5);
  const donors = names.map((n) => n.toLowerCase());

  if (useSuffix) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const donorA = donors[Math.floor(Math.random() * donors.length)];
    const donorB = donors[Math.floor(Math.random() * donors.length)];
    const rawA = buildWithRepeatedSuffix(donorA, suffix);
    const rawB = buildWithRepeatedSuffix(donorB, suffix);
    if (!rawA || !rawB) return null;

    const first = capitalize(rawA);
    const second = capitalize(rawB);
    const pair = `${first} + ${second}`;
    return {
      name: pair,
      pair,
    };
  }

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const donorA = donors[Math.floor(Math.random() * donors.length)];
  const donorB = donors[Math.floor(Math.random() * donors.length)];
  const rawA = buildWithRepeatedPrefix(donorA, prefix);
  const rawB = buildWithRepeatedPrefix(donorB, prefix);
  if (!rawA || !rawB) return null;

  const first = capitalize(rawA);
  const second = capitalize(rawB);
  const pair = `${first} + ${second}`;
  return {
    name: pair,
    pair,
  };
}

export function suggestCoupleNames(names: string[], count: number = 6): CoupleSuggestion[] {
  if (names.length < 2) return [];

  const existing = new Set(names.map((n) => n.toLowerCase()));
  const { prefixes, suffixes } = findAffixes(names);
  const suggestions: CoupleSuggestion[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < count * 20 && suggestions.length < count; i++) {
    const candidate = coupleGenerateByAffix(names, prefixes, suffixes);
    if (!candidate) continue;

    const key = candidate.name.toLowerCase();
    const [firstPart = "", secondPart = ""] = candidate.pair
      .toLowerCase()
      .split("+")
      .map((part) => part.trim());

    if (
      seenNames.has(key) ||
      existing.has(firstPart) ||
      existing.has(secondPart)
    ) {
      continue;
    }

    seenNames.add(key);
    suggestions.push(candidate);
  }

  return suggestions;
}

// --- Main entry ---
export function suggestNames(names: string[], count: number = 6): string[] {
  if (names.length === 0) return [];

  const chain = buildChain(names);
  const { prefixes, suffixes } = findAffixes(names);
  const existing = new Set(names.map((n) => n.toLowerCase()));
  const suggestions: string[] = [];
  const seen = new Set<string>();

  const strategies = [
    () => markovGenerate(chain),
    () => affixGenerate(names, prefixes, suffixes),
  ];

  for (let i = 0; i < count * 10 && suggestions.length < count; i++) {
    const strategy = strategies[i % strategies.length];
    const raw = strategy();
    if (!raw) continue;

    const name = capitalize(raw);
    const key = name.toLowerCase();

    if (!existing.has(key) && !seen.has(key) && name.length <= MAX_LEN) {
      seen.add(key);
      suggestions.push(name);
    }
  }

  return suggestions;
}
