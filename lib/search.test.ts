import { describe, expect, it } from "vitest";
import { searchRecords } from "./search";
import { buildSearchRecords } from "./searchIndex";

const records = buildSearchRecords();

describe("searchRecords", () => {
  it("returns nothing for an empty or whitespace query", () => {
    expect(searchRecords(records, "")).toEqual([]);
    expect(searchRecords(records, "   ")).toEqual([]);
  });

  it("ranks an exact glossary title match first", () => {
    const results = searchRecords(records, "NAT");
    expect(results[0]!.title).toBe("NAT");
  });

  it("finds layers by protocol names in the body", () => {
    const results = searchRecords(records, "OSPF");
    expect(results.some((r) => r.href === "/layers/network/")).toBe(true);
  });

  it("requires every token to match (AND semantics)", () => {
    const results = searchRecords(records, "congestion zzzz");
    expect(results).toEqual([]);
  });

  it("multi-word queries find the right section", () => {
    const results = searchRecords(records, "broadcast storm");
    expect(results.some((r) => r.href.includes("/layers/data-link/"))).toBe(true);
  });

  it("finds interview questions", () => {
    const results = searchRecords(records, "TIME_WAIT");
    expect(results.some((r) => r.type === "question" && r.href === "/interview/#time-wait")).toBe(
      true,
    );
  });

  it("caps results", () => {
    expect(searchRecords(records, "the").length).toBeLessThanOrEqual(12);
  });
});
