const ORDER = 2; // bigram: looks at 2 chars to predict the next

export function buildChain(names: string[]): Map<string, string[]> {
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

export function generate(chain: Map<string, string[]>, existingNames: Set<string>): string | null {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let current = "^".repeat(ORDER);
    let result = "";

    for (let i = 0; i < 15; i++) {
      const options = chain.get(current);
      if (!options || options.length === 0) break;

      const next = options[Math.floor(Math.random() * options.length)];
      if (next === "$") break;

      result += next;
      current = current.slice(1) + next;
    }

    if (result.length >= 3 && !existingNames.has(result)) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }

  return null;
}

export function suggestNames(names: string[], count: number = 5): string[] {
  if (names.length < 10) return [];

  const chain = buildChain(names);
  const existing = new Set(names.map((n) => n.toLowerCase()));
  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count * 3 && suggestions.length < count; i++) {
    const name = generate(chain, existing);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      suggestions.push(name);
    }
  }

  return suggestions;
}
