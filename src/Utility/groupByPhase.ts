export interface PhaseGroup<T> {
  phase: string;
  items: T[];
}

// Groups items by their `phase` field, preserving first-seen source order (not alphabetical).
// Items with no phase (or a blank/whitespace-only one) are grouped together under phase "".
// Items sharing a phase are merged into one group even if they aren't contiguous in the input.
export function groupByPhase<T extends { phase?: string }>(items: T[]): PhaseGroup<T>[] {
  const groups: PhaseGroup<T>[] = [];
  const indexByPhase = new Map<string, number>();

  for (const item of items) {
    const phase = item.phase?.trim() ?? "";
    let idx = indexByPhase.get(phase);
    if (idx === undefined) {
      idx = groups.length;
      indexByPhase.set(phase, idx);
      groups.push({ phase, items: [] });
    }
    groups[idx].items.push(item);
  }

  return groups;
}
