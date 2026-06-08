import { describe, expect, it } from "vitest";
import { dnsSteps } from "./dnsResolution";

describe("dnsSteps", () => {
  it("derives the TLD and authoritative actors from the domain", () => {
    const { actors } = dnsSteps("www.example.com");
    const tld = actors.find((a) => a.id === "tld");
    const auth = actors.find((a) => a.id === "auth");
    expect(tld?.sub).toContain(".com");
    expect(auth?.sub).toContain("example.com");
  });

  it("walks stub → resolver → root → TLD → authoritative and back", () => {
    const { steps } = dnsSteps("www.example.com");
    expect(steps).toHaveLength(8);
    expect(steps[0]).toMatchObject({ from: "stub", to: "resolver", kind: "query" });
    expect(steps[1]).toMatchObject({ from: "resolver", to: "root" });
    expect(steps[2]).toMatchObject({ from: "root", to: "resolver", kind: "referral" });
    expect(steps[4]).toMatchObject({ from: "tld", to: "resolver", kind: "referral" });
    expect(steps[6]).toMatchObject({ from: "auth", to: "resolver", kind: "answer" });
    expect(steps.at(-1)).toMatchObject({ from: "resolver", to: "stub", kind: "deliver" });
  });

  it("the root and TLD give referrals, not answers", () => {
    const { steps } = dnsSteps("www.example.com");
    const referrals = steps.filter((s) => s.kind === "referral");
    expect(referrals).toHaveLength(2); // root → .com, .com → example.com
    expect(steps.filter((s) => s.kind === "answer")).toHaveLength(1); // only the authoritative
  });

  it("respects the requested record type", () => {
    const { steps } = dnsSteps("mail.example.org", "MX");
    expect(steps[0]?.label).toContain("MX?");
    expect(dnsSteps("www.example.org").actors.find((a) => a.id === "tld")?.sub).toContain(".org");
  });

  it("rejects a bare TLD or empty input", () => {
    expect(() => dnsSteps("com")).toThrow();
    expect(() => dnsSteps("")).toThrow();
  });
});
