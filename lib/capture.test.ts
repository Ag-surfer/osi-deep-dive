import { describe, expect, it } from "vitest";
import { FIELDS, FRAME, LAYER_SPANS, fieldAt } from "./capture";

/** Independent ones-complement checksum (RFC 1071), big-endian 16-bit words. */
function inetChecksum(bytes: number[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    sum += (bytes[i]! << 8) + (bytes[i + 1] ?? 0);
  }
  while (sum > 0xffff) sum = (sum & 0xffff) + (sum >>> 16);
  return ~sum & 0xffff;
}

const ETH = FRAME.slice(0, 14);
const IP = FRAME.slice(14, 34);
const TCP = FRAME.slice(34, 54);
const PAYLOAD = FRAME.slice(54);

describe("the captured frame is genuinely well-formed", () => {
  it("is 128 bytes: 14 Ethernet + 20 IP + 20 TCP + 74 HTTP", () => {
    expect(FRAME).toHaveLength(128);
    expect(PAYLOAD).toHaveLength(74);
  });

  it("carries EtherType 0x0800 (IPv4)", () => {
    expect((ETH[12]! << 8) + ETH[13]!).toBe(0x0800);
  });

  it("has a valid IPv4 version/IHL and Total Length matching the actual bytes", () => {
    expect(IP[0]).toBe(0x45); // IPv4, 5-word header
    const totalLength = (IP[2]! << 8) + IP[3]!;
    expect(totalLength).toBe(IP.length + TCP.length + PAYLOAD.length); // 114
  });

  it("declares Protocol 6 (TCP) and TTL 64", () => {
    expect(IP[9]).toBe(6);
    expect(IP[8]).toBe(64);
  });

  it("has a correct IPv4 header checksum (recomputed independently)", () => {
    const zeroed = [...IP];
    zeroed[10] = 0;
    zeroed[11] = 0;
    expect(inetChecksum(zeroed)).toBe((IP[10]! << 8) + IP[11]!);
  });

  it("has a correct TCP checksum over the pseudo-header + header + payload", () => {
    const srcIP = IP.slice(12, 16);
    const dstIP = IP.slice(16, 20);
    const tcpLen = TCP.length + PAYLOAD.length;
    const pseudo = [...srcIP, ...dstIP, 0, 6, tcpLen >> 8, tcpLen & 0xff];
    const zeroed = [...TCP];
    zeroed[16] = 0;
    zeroed[17] = 0;
    expect(inetChecksum([...pseudo, ...zeroed, ...PAYLOAD])).toBe((TCP[16]! << 8) + TCP[17]!);
  });

  it("addresses match the site's running examples (192.168.1.23 → 198.51.100.10:80)", () => {
    expect(IP.slice(12, 16)).toEqual([192, 168, 1, 23]);
    expect(IP.slice(16, 20)).toEqual([198, 51, 100, 10]);
    expect((TCP[0]! << 8) + TCP[1]!).toBe(51000);
    expect((TCP[2]! << 8) + TCP[3]!).toBe(80);
  });

  it("sets PSH+ACK with a 20-byte TCP header", () => {
    expect(TCP[12]! >> 4).toBe(5);
    expect(TCP[13]).toBe(0x18);
  });

  it("decodes the payload to the exact HTTP request", () => {
    const text = String.fromCharCode(...PAYLOAD);
    expect(text).toBe(
      "GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: curl/8.5.0\r\nAccept: */*\r\n\r\n",
    );
  });
});

describe("field annotations tile the frame exactly", () => {
  it("covers every byte exactly once, in order, with no gaps or overlaps", () => {
    const sorted = [...FIELDS].sort((a, b) => a.start - b.start);
    let cursor = 0;
    for (const f of sorted) {
      expect(f.start).toBe(cursor);
      expect(f.length).toBeGreaterThan(0);
      cursor += f.length;
    }
    expect(cursor).toBe(FRAME.length);
  });

  it("assigns every field to a layer matching its span", () => {
    for (const f of FIELDS) {
      const span = LAYER_SPANS.find((s) => f.start >= s.start && f.start < s.start + s.length)!;
      expect(f.layer).toBe(span.layer);
      // Field must not cross a layer boundary.
      expect(f.start + f.length).toBeLessThanOrEqual(span.start + span.length);
    }
  });

  it("fieldAt finds the owning field for boundary offsets", () => {
    expect(fieldAt(0)?.name).toBe("Destination MAC");
    expect(fieldAt(22)?.name).toBe("TTL");
    expect(fieldAt(36)?.name).toBe("Destination Port");
    expect(fieldAt(127)?.name).toBe("End of headers");
    expect(fieldAt(128)).toBeUndefined();
  });

  it("layer spans cover the whole frame contiguously", () => {
    let cursor = 0;
    for (const s of LAYER_SPANS) {
      expect(s.start).toBe(cursor);
      cursor += s.length;
    }
    expect(cursor).toBe(FRAME.length);
  });
});
