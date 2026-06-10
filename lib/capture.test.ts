import { describe, expect, it } from "vitest";
import { FRAMES, fieldAt, type CaptureFrame } from "./capture";

/** Independent ones-complement checksum (RFC 1071), big-endian 16-bit words. */
function inetChecksum(bytes: number[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    sum += (bytes[i]! << 8) + (bytes[i + 1] ?? 0);
  }
  while (sum > 0xffff) sum = (sum & 0xffff) + (sum >>> 16);
  return ~sum & 0xffff;
}

function rd16(b: number[], o: number): number {
  return (b[o]! << 8) + b[o + 1]!;
}
function rd32(b: number[], o: number): number {
  return rd16(b, o) * 0x10000 + rd16(b, o + 2);
}
function parts(f: CaptureFrame) {
  const b = f.bytes;
  const tcpLen = (b[46]! >> 4) * 4;
  return {
    b,
    eth: b.slice(0, 14),
    ip: b.slice(14, 34),
    tcp: b.slice(34, 34 + tcpLen),
    payload: b.slice(34 + tcpLen),
  };
}
const frame = (id: string) => FRAMES.find((f) => f.id === id)!;

describe.each(FRAMES.map((f) => [f.id, f] as const))("frame %s is well-formed", (_id, f) => {
  const { b, eth, ip, tcp, payload } = parts(f);

  it("carries EtherType 0x0800 and a valid IPv4 header", () => {
    expect(rd16(eth, 12)).toBe(0x0800);
    expect(ip[0]).toBe(0x45);
    expect(ip[9]).toBe(6); // TCP
  });

  it("declares a Total Length matching the actual bytes", () => {
    expect(rd16(ip, 2)).toBe(ip.length + tcp.length + payload.length);
    expect(b.length).toBe(14 + rd16(ip, 2));
  });

  it("has a correct IPv4 header checksum (recomputed independently)", () => {
    const zeroed = [...ip];
    zeroed[10] = 0;
    zeroed[11] = 0;
    expect(inetChecksum(zeroed)).toBe(rd16(ip, 10));
  });

  it("has a correct TCP checksum over the pseudo-header + header + payload", () => {
    const tcpLen = tcp.length + payload.length;
    const pseudo = [...ip.slice(12, 16), ...ip.slice(16, 20), 0, 6, tcpLen >> 8, tcpLen & 0xff];
    const zeroed = [...tcp];
    zeroed[16] = 0;
    zeroed[17] = 0;
    expect(inetChecksum([...pseudo, ...zeroed, ...payload])).toBe(rd16(tcp, 16));
  });

  it("annotates every byte exactly once, in order, without crossing layer boundaries", () => {
    const sorted = [...f.fields].sort((a, b2) => a.start - b2.start);
    let cursor = 0;
    for (const field of sorted) {
      expect(field.start).toBe(cursor);
      expect(field.length).toBeGreaterThan(0);
      cursor += field.length;
      const span = f.layerSpans.find(
        (s) => field.start >= s.start && field.start < s.start + s.length,
      )!;
      expect(field.layer).toBe(span.layer);
      expect(field.start + field.length).toBeLessThanOrEqual(span.start + span.length);
    }
    expect(cursor).toBe(b.length);
  });

  it("has layer spans covering the whole frame contiguously", () => {
    let cursor = 0;
    for (const s of f.layerSpans) {
      expect(s.start).toBe(cursor);
      cursor += s.length;
    }
    expect(cursor).toBe(b.length);
  });
});

describe("the five frames form one consistent conversation", () => {
  const syn = parts(frame("syn"));
  const synack = parts(frame("syn-ack"));
  const get = parts(frame("get"));
  const resp = parts(frame("response"));
  const fin = parts(frame("fin"));

  const clientISN = rd32(syn.tcp, 4);
  const serverISN = rd32(synack.tcp, 4);
  const GET_LEN = get.payload.length; // 74
  const RESP_LEN = resp.payload.length; // 96

  it("chains sequence/acknowledgment numbers exactly (SYN and FIN consume one number)", () => {
    expect(rd32(synack.tcp, 8)).toBe(clientISN + 1); // SYN-ACK acks client ISN+1
    expect(rd32(get.tcp, 4)).toBe(clientISN + 1); // GET data starts at ISN+1
    expect(rd32(get.tcp, 8)).toBe(serverISN + 1); // GET acks server ISN+1
    expect(rd32(resp.tcp, 4)).toBe(serverISN + 1); // response data starts at server ISN+1
    expect(rd32(resp.tcp, 8)).toBe(clientISN + 1 + GET_LEN); // response acks the whole GET
    expect(rd32(fin.tcp, 4)).toBe(clientISN + 1 + GET_LEN); // FIN continues client numbering
    expect(rd32(fin.tcp, 8)).toBe(serverISN + 1 + RESP_LEN); // FIN acks the whole response
  });

  it("sets the right flags on each frame", () => {
    expect(syn.tcp[13]).toBe(0x02); // SYN
    expect(synack.tcp[13]).toBe(0x12); // SYN+ACK
    expect(get.tcp[13]).toBe(0x18); // PSH+ACK
    expect(resp.tcp[13]).toBe(0x18); // PSH+ACK
    expect(fin.tcp[13]).toBe(0x11); // FIN+ACK
  });

  it("mirrors the 4-tuple and MAC addresses by direction", () => {
    for (const f of [syn, get, fin]) {
      expect(f.ip.slice(12, 16)).toEqual([192, 168, 1, 23]);
      expect(f.ip.slice(16, 20)).toEqual([198, 51, 100, 10]);
      expect(rd16(f.tcp, 0)).toBe(51000);
      expect(rd16(f.tcp, 2)).toBe(80);
      expect(f.eth.slice(6, 12)).toEqual(syn.eth.slice(6, 12)); // laptop is source MAC
    }
    for (const f of [synack, resp]) {
      expect(f.ip.slice(12, 16)).toEqual([198, 51, 100, 10]);
      expect(f.ip.slice(16, 20)).toEqual([192, 168, 1, 23]);
      expect(rd16(f.tcp, 0)).toBe(80);
      expect(rd16(f.tcp, 2)).toBe(51000);
      expect(f.eth.slice(0, 6)).toEqual(syn.eth.slice(6, 12)); // laptop is destination MAC
    }
  });

  it("uses TTL 64 outbound and 54 (64 minus 10 hops) inbound", () => {
    for (const f of [syn, get, fin]) expect(f.ip[8]).toBe(64);
    for (const f of [synack, resp]) expect(f.ip[8]).toBe(54);
  });

  it("carries handshake options only on SYN and SYN-ACK", () => {
    expect(syn.tcp).toHaveLength(32);
    expect(synack.tcp).toHaveLength(32);
    for (const f of [get, resp, fin]) expect(f.tcp).toHaveLength(20);
    // MSS 1460 in both handshake frames (kind 2, len 4, value).
    for (const f of [syn, synack]) {
      expect(f.tcp.slice(20, 24)).toEqual([2, 4, 0x05, 0xb4]);
    }
  });

  it("decodes the payloads to the exact HTTP request and response", () => {
    expect(String.fromCharCode(...get.payload)).toBe(
      "GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: curl/8.5.0\r\nAccept: */*\r\n\r\n",
    );
    const respText = String.fromCharCode(...resp.payload);
    expect(respText).toBe(
      "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 32\r\n\r\n<!doctype html><title>Hi</title>",
    );
    // Content-Length tells the truth.
    const body = respText.split("\r\n\r\n")[1]!;
    expect(body).toHaveLength(32);
  });
});

describe("window-size annotations match RFC 7323 scaling rules", () => {
  it("handshake frames say the raw value is never scaled; data frames cite the negotiated factor", () => {
    for (const f of FRAMES) {
      const win = f.fields.find((field) => field.name === "Window Size")!;
      if (f.id === "syn" || f.id === "syn-ack") {
        expect(win.desc).toMatch(/never scaled/);
      } else {
        expect(win.desc).toMatch(/scaled by the factor/);
      }
    }
  });
});

describe("fieldAt", () => {
  it("finds the owning field for boundary offsets in each frame", () => {
    const get = frame("get");
    expect(fieldAt(get, 0)?.name).toBe("Destination MAC");
    expect(fieldAt(get, 22)?.name).toBe("TTL");
    expect(fieldAt(get, 127)?.name).toBe("End of headers");
    expect(fieldAt(get, 128)).toBeUndefined();
    const syn = frame("syn");
    expect(fieldAt(syn, 54)?.name).toBe("Option: MSS");
    expect(fieldAt(syn, 65)?.name).toBe("Option: SACK permitted");
  });
});
