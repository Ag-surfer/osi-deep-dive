import { describe, expect, it } from "vitest";
import { INTERVIEW_QUESTIONS, QUESTION_LAYERS, URL_JOURNEY } from "./interview";
import { LAYERS } from "./layers";

/** Every internal route the site actually serves. */
const VALID_ROUTES = new Set([
  "/",
  "/journey/",
  "/anatomy/",
  "/glossary/",
  "/quiz/",
  "/interview/",
  "/cheat-sheet/",
  "/troubleshoot/",
  "/models/",
  "/modern/",
  ...LAYERS.map((l) => `/layers/${l.slug}/`),
]);

describe("INTERVIEW_QUESTIONS data integrity", () => {
  it("has a substantial question bank", () => {
    expect(INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(18);
  });

  it("has unique, url-safe ids", () => {
    const ids = INTERVIEW_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("tags every question with a valid layer (0–7)", () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(q.layer).toBeGreaterThanOrEqual(0);
      expect(q.layer).toBeLessThanOrEqual(7);
    }
  });

  it("covers every layer 1–7 plus cross-layer", () => {
    expect(QUESTION_LAYERS).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("gives every question a substantive answer and at least one follow-up and link", () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.answer.length).toBeGreaterThan(120);
      expect(q.followUps.length).toBeGreaterThanOrEqual(1);
      expect(q.links.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("links only to routes that exist", () => {
    for (const q of INTERVIEW_QUESTIONS) {
      for (const link of q.links) {
        expect(VALID_ROUTES, `${q.id} → ${link.href}`).toContain(link.href);
      }
    }
  });
});

describe("URL_JOURNEY data integrity", () => {
  it("tells the whole story in 8–12 steps", () => {
    expect(URL_JOURNEY.length).toBeGreaterThanOrEqual(8);
    expect(URL_JOURNEY.length).toBeLessThanOrEqual(12);
  });

  it("uses valid layers and real routes on every step", () => {
    for (const s of URL_JOURNEY) {
      expect(s.layers.length).toBeGreaterThanOrEqual(1);
      for (const l of s.layers) {
        expect(l).toBeGreaterThanOrEqual(1);
        expect(l).toBeLessThanOrEqual(7);
      }
      expect(VALID_ROUTES, `${s.title} → ${s.href}`).toContain(s.href);
    }
  });

  it("touches every group of the stack across the journey", () => {
    const layers = new Set(URL_JOURNEY.flatMap((s) => s.layers));
    // Application, transport, network, link layers must all appear.
    for (const required of [2, 3, 4, 7]) expect(layers).toContain(required);
  });
});
