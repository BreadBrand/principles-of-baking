import { groupByPhase } from "./groupByPhase";

type Item = { name: string; phase?: string };

describe("groupByPhase", () => {
  it("puts all items with no phase into a single group with phase ''", () => {
    const items: Item[] = [{ name: "flour" }, { name: "water" }, { name: "salt" }];
    const groups = groupByPhase(items);
    expect(groups).toEqual([{ phase: "", items }]);
  });

  it("groups items by phase, preserving first-seen source order (not alphabetical)", () => {
    const items: Item[] = [
      { name: "sourdough starter", phase: "Stiff Sweet Starter" },
      { name: "bread flour", phase: "Stiff Sweet Starter" },
      { name: "bread flour", phase: "Tangzhong" },
      { name: "whole milk", phase: "Tangzhong" },
      { name: "high-protein bread flour", phase: "Main Dough" },
    ];
    const groups = groupByPhase(items);
    expect(groups.map(g => g.phase)).toEqual(["Stiff Sweet Starter", "Tangzhong", "Main Dough"]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(2);
    expect(groups[2].items).toHaveLength(1);
  });

  it("merges items of the same phase even if they aren't contiguous in the source array", () => {
    const items: Item[] = [
      { name: "a", phase: "X" },
      { name: "b", phase: "Y" },
      { name: "c", phase: "X" },
    ];
    const groups = groupByPhase(items);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual({ phase: "X", items: [items[0], items[2]] });
    expect(groups[1]).toEqual({ phase: "Y", items: [items[1]] });
  });

  it("treats an empty/whitespace phase the same as no phase", () => {
    const items: Item[] = [{ name: "a", phase: "" }, { name: "b", phase: "  " }, { name: "c" }];
    const groups = groupByPhase(items);
    expect(groups).toEqual([{ phase: "", items }]);
  });

  it("returns an empty array for an empty input", () => {
    expect(groupByPhase([])).toEqual([]);
  });
});
