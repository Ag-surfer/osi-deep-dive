import { describe, expect, it } from "vitest";
import { subnetInfo } from "./subnet";

describe("subnetInfo", () => {
  it("computes a /26 correctly", () => {
    const s = subnetInfo("192.168.1.10/26");
    expect(s.valid).toBe(true);
    expect(s.network).toBe("192.168.1.0");
    expect(s.broadcast).toBe("192.168.1.63");
    expect(s.firstHost).toBe("192.168.1.1");
    expect(s.lastHost).toBe("192.168.1.62");
    expect(s.usableHosts).toBe(62);
    expect(s.totalAddresses).toBe(64);
    expect(s.mask).toBe("255.255.255.192");
    expect(s.wildcard).toBe("0.0.0.63");
    expect(s.ipClass).toBe("C");
    expect(s.isPrivate).toBe(true);
  });

  it("computes a large /8", () => {
    const s = subnetInfo("10.1.2.3/8");
    expect(s.network).toBe("10.0.0.0");
    expect(s.broadcast).toBe("10.255.255.255");
    expect(s.totalAddresses).toBe(16777216);
    expect(s.usableHosts).toBe(16777214);
    expect(s.ipClass).toBe("A");
    expect(s.isPrivate).toBe(true);
  });

  it("special-cases /31 (RFC 3021 point-to-point: 2 usable)", () => {
    const s = subnetInfo("192.0.2.0/31");
    expect(s.usableHosts).toBe(2);
    expect(s.firstHost).toBe("192.0.2.0");
    expect(s.lastHost).toBe("192.0.2.1");
  });

  it("special-cases /32 (single host)", () => {
    const s = subnetInfo("8.8.8.8/32");
    expect(s.usableHosts).toBe(1);
    expect(s.firstHost).toBe("8.8.8.8");
    expect(s.lastHost).toBe("8.8.8.8");
    expect(s.isPrivate).toBe(false);
  });

  it("renders the binary with network bits derivable from the prefix", () => {
    const s = subnetInfo("192.0.2.0/24");
    expect(s.maskBinary).toBe("11111111.11111111.11111111.00000000");
    expect(s.ipBinary).toBe("11000000.00000000.00000010.00000000");
  });

  it("flags link-local and loopback ranges", () => {
    expect(subnetInfo("169.254.5.5/16").note).toContain("Link-local");
    expect(subnetInfo("127.0.0.1/8").note).toContain("Loopback");
  });

  it("rejects malformed input", () => {
    expect(subnetInfo("999.1.1.1/24").valid).toBe(false);
    expect(subnetInfo("1.2.3.4/33").valid).toBe(false);
    expect(subnetInfo("not an ip").valid).toBe(false);
    expect(subnetInfo("1.2.3/24").valid).toBe(false);
  });
});
