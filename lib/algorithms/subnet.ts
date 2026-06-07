/**
 * IPv4 subnet math for the interactive subnet calculator. Given a CIDR string
 * like "192.168.1.10/26", compute the network/broadcast/usable range, masks, the
 * binary breakdown, and address classification — all from the prefix length. This
 * is a fully *manipulable* tool (recomputed live as the user edits), not a stepped
 * walkthrough.
 *
 * Pure and deterministic so it is unit tested. All address math is done on
 * unsigned 32-bit integers (`>>> 0`).
 */

export interface SubnetInfo {
  valid: boolean;
  error?: string;
  /** Echo of the parsed address (dotted). */
  ip: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  /** 2^(32 − prefix). */
  totalAddresses: number;
  /** Usable hosts (total − 2, with /31 and /32 special-cased). */
  usableHosts: number;
  /** 32-bit binary of the address, grouped per octet (dotted). */
  ipBinary: string;
  /** 32-bit binary of the mask, grouped per octet (dotted). */
  maskBinary: string;
  /** Legacy class (A–E) of the address. */
  ipClass: string;
  /** True if in an RFC 1918 private range. */
  isPrivate: boolean;
  /** A human note for special ranges (loopback, link-local, …), if any. */
  note?: string;
}

const toOctets = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const toDotted = (n: number) => toOctets(n).join(".");
const toBinary = (n: number) =>
  toOctets(n)
    .map((o) => o.toString(2).padStart(8, "0"))
    .join(".");

function classify(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (multicast)";
  return "E (reserved)";
}

function specialNote(ip: number, firstOctet: number): { isPrivate: boolean; note?: string } {
  const inRange = (a: string, p: number) => {
    const base = parseDotted(a)!;
    const m = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
    return (ip & m) >>> 0 === (base & m) >>> 0;
  };
  if (firstOctet === 127) return { isPrivate: false, note: "Loopback (127.0.0.0/8)" };
  if (inRange("169.254.0.0", 16))
    return { isPrivate: false, note: "Link-local / APIPA (169.254.0.0/16)" };
  if (inRange("10.0.0.0", 8) || inRange("172.16.0.0", 12) || inRange("192.168.0.0", 16)) {
    return { isPrivate: true, note: "Private (RFC 1918)" };
  }
  return { isPrivate: false };
}

function parseDotted(s: string): number | null {
  const parts = s.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const o = Number(p);
    if (o > 255) return null;
    n = (n << 8) | o;
  }
  return n >>> 0;
}

const invalid = (error: string): SubnetInfo => ({
  valid: false,
  error,
  ip: "",
  prefix: 0,
  mask: "",
  wildcard: "",
  network: "",
  broadcast: "",
  firstHost: "",
  lastHost: "",
  totalAddresses: 0,
  usableHosts: 0,
  ipBinary: "",
  maskBinary: "",
  ipClass: "",
  isPrivate: false,
});

/** Parse and analyze a CIDR string (e.g. "192.0.2.10/26"). */
export function subnetInfo(input: string): SubnetInfo {
  const m = input.trim().match(/^([\d.]+)\s*\/\s*(\d{1,2})$/);
  if (!m) return invalid("Enter an address and prefix, e.g. 192.168.1.10/26");
  const ip = parseDotted(m[1]!);
  if (ip === null) return invalid("Invalid IPv4 address (each octet must be 0–255)");
  const prefix = Number(m[2]);
  if (prefix > 32) return invalid("Prefix must be between 0 and 32");

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let firstHost: number;
  let lastHost: number;
  let usableHosts: number;
  if (prefix === 32) {
    firstHost = lastHost = ip;
    usableHosts = 1; // a single host route
  } else if (prefix === 31) {
    firstHost = network;
    lastHost = broadcast; // RFC 3021: both addresses usable on a point-to-point link
    usableHosts = 2;
  } else {
    firstHost = (network + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
    usableHosts = totalAddresses - 2;
  }

  const firstOctet = toOctets(ip)[0]!;
  const { isPrivate, note } = specialNote(ip, firstOctet);

  return {
    valid: true,
    ip: toDotted(ip),
    prefix,
    mask: toDotted(mask),
    wildcard: toDotted(wildcard),
    network: toDotted(network),
    broadcast: toDotted(broadcast),
    firstHost: toDotted(firstHost),
    lastHost: toDotted(lastHost),
    totalAddresses,
    usableHosts,
    ipBinary: toBinary(ip),
    maskBinary: toBinary(mask),
    ipClass: classify(firstOctet),
    isPrivate,
    note,
  };
}
