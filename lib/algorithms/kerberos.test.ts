import { describe, expect, it } from "vitest";
import { kerberosSteps } from "./kerberos";

describe("kerberosSteps", () => {
  it("models the four actors: client, AS, TGS, and service", () => {
    const { actors } = kerberosSteps();
    expect(actors.map((a) => a.id)).toEqual(["client", "as", "tgs", "service"]);
  });

  it("runs the three round trips (AS, TGS, AP) in order", () => {
    const { steps } = kerberosSteps();
    expect(steps).toHaveLength(6);
    expect(steps[0]).toMatchObject({ from: "client", to: "as", kind: "request" });
    expect(steps[1]).toMatchObject({ from: "as", to: "client", kind: "grant" });
    expect(steps[2]).toMatchObject({ from: "client", to: "tgs", kind: "present" });
    expect(steps[3]).toMatchObject({ from: "tgs", to: "client", kind: "grant" });
    expect(steps[4]).toMatchObject({ from: "client", to: "service", kind: "present" });
    expect(steps[5]).toMatchObject({ from: "service", to: "client", kind: "confirm" });
  });

  it("never sends the password over the network", () => {
    const joined = kerberosSteps()
      .steps.map((s) => s.label + s.narration)
      .join(" ")
      .toLowerCase();
    // The narration explicitly states the password is not sent; no step carries it.
    expect(kerberosSteps().steps.some((s) => /password/i.test(s.label))).toBe(false);
    expect(joined).toContain("not sent");
  });

  it("substitutes the user and service names", () => {
    const { actors, steps } = kerberosSteps("bob", "printserver");
    expect(actors.find((a) => a.id === "client")?.sub).toContain("bob");
    expect(actors.find((a) => a.id === "service")?.sub).toContain("printserver");
    expect(steps.some((s) => s.label.includes("printserver"))).toBe(true);
  });
});
