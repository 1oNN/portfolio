import { describe, it, expect } from "vitest";
import {
  chipCounts,
  fold,
  matchesChips,
  matchesQuery,
  parseChipParam,
  toggleChip,
} from "./listing-filter";

describe("fold", () => {
  it("strips accents so a plain keyboard can reach every tag", () => {
    expect(fold("Bundesagentur für Arbeit")).toBe("bundesagentur fur arbeit");
  });

  it("collapses whitespace rather than preserving layout", () => {
    expect(fold("  Full-text   Search ")).toBe("full-text search");
  });
});

describe("matchesQuery", () => {
  it("matches everything on an empty or blank query", () => {
    expect(matchesQuery("anything", "")).toBe(true);
    expect(matchesQuery("anything", "   ")).toBe(true);
  });

  it("requires every term, not just one", () => {
    const haystack = "Ranking is the product PostgreSQL Full-text Search";
    expect(matchesQuery(haystack, "ranking postgres")).toBe(true);
    expect(matchesQuery(haystack, "ranking mongodb")).toBe(false);
  });

  it("matches mid-word so results narrow while you are still typing", () => {
    expect(matchesQuery("PostgreSQL", "postg")).toBe(true);
  });

  it("ignores case and accents on both sides", () => {
    expect(matchesQuery("Café Ingest", "cafe")).toBe(true);
  });

  it("does not let terms match across the gaps between them", () => {
    // "post grad" must not be satisfied by "PostgreSQL" alone.
    expect(matchesQuery("PostgreSQL notes", "post grad")).toBe(false);
  });
});

describe("toggleChip", () => {
  it("appends an unselected chip in click order", () => {
    expect(toggleChip(["FastAPI"], "AsyncIO")).toEqual(["FastAPI", "AsyncIO"]);
  });

  it("removes a chip that is already on", () => {
    expect(toggleChip(["FastAPI", "AsyncIO"], "FastAPI")).toEqual(["AsyncIO"]);
  });

  it("does not mutate the array it was given", () => {
    const selected = ["FastAPI"];
    toggleChip(selected, "AsyncIO");
    expect(selected).toEqual(["FastAPI"]);
  });
});

describe("matchesChips", () => {
  it("passes everything when nothing is selected", () => {
    expect(matchesChips(["FastAPI"], [])).toBe(true);
  });

  it("requires all selected chips, not any", () => {
    expect(matchesChips(["FastAPI", "AsyncIO"], ["FastAPI", "AsyncIO"])).toBe(true);
    expect(matchesChips(["FastAPI"], ["FastAPI", "AsyncIO"])).toBe(false);
  });

  it("compares folded, so a chip from the URL still matches its tag", () => {
    expect(matchesChips(["Full-text Search"], ["full-text search"])).toBe(true);
  });
});

describe("chipCounts", () => {
  it("orders by frequency, then alphabetically", () => {
    const counts = chipCounts([
      ["PostgreSQL", "FastAPI"],
      ["PostgreSQL", "SSE"],
      ["PostgreSQL"],
      ["FastAPI"],
    ]);
    expect(counts).toEqual([
      { value: "PostgreSQL", count: 3 },
      { value: "FastAPI", count: 2 },
      { value: "SSE", count: 1 },
    ]);
  });

  it("counts one item once even if it repeats a tag", () => {
    expect(chipCounts([["RAG", "rag"]])).toEqual([{ value: "RAG", count: 1 }]);
  });

  it("returns an empty row rather than throwing on no items", () => {
    expect(chipCounts([])).toEqual([]);
  });
});

describe("parseChipParam", () => {
  it("reads a comma-joined param and drops the blanks", () => {
    expect(parseChipParam("FastAPI,,AsyncIO")).toEqual(["FastAPI", "AsyncIO"]);
  });

  it("trims and de-duplicates a hand-edited URL", () => {
    expect(parseChipParam(" FastAPI , FastAPI ")).toEqual(["FastAPI"]);
  });

  it("treats a missing param as no selection", () => {
    expect(parseChipParam(null)).toEqual([]);
    expect(parseChipParam("")).toEqual([]);
  });
});
