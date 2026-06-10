/**
 * A complete, real TCP conversation — five frames of an HTTP exchange as
 * they would appear on the wire at the client's NIC: SYN, SYN-ACK, the GET,
 * the 200 response, and the client's FIN. Every checksum is correctly
 * computed over these exact bytes, and the sequence/acknowledgment numbers
 * chain arithmetically across frames (tests verify both independently).
 * Addresses reuse the site's running examples: the laptop 192.168.1.23 from
 * the NAT worked example, the MAC a4:5e:60:1f:cd:02 from the Data Link page.
 *
 * Field *values* below are decoded from the bytes at build time, so the
 * annotations cannot drift from the data; only the teaching prose is
 * hand-written.
 */

export interface CaptureField {
  /** Field name as a protocol engineer would say it. */
  name: string;
  /** Byte offset within the frame. */
  start: number;
  /** Field length in bytes. */
  length: number;
  /** OSI layer that owns the field: 2, 3, 4, or 7. */
  layer: number;
  /** Decoded value, human-readable. */
  value: string;
  /** Teaching note. */
  desc: string;
}

export interface LayerSpan {
  layer: number;
  label: string;
  start: number;
  length: number;
}

export interface CaptureFrame {
  /** URL-safe id. */
  id: string;
  /** Tab label, e.g. "SYN". */
  label: string;
  direction: "client → server" | "server → client";
  /** One-line story of this frame's role in the conversation. */
  summary: string;
  bytes: number[];
  layerSpans: LayerSpan[];
  fields: CaptureField[];
}

// ── Byte decoding helpers (values derive from the data, not from prose) ──

function rd16(b: number[], o: number): number {
  return (b[o]! << 8) + b[o + 1]!;
}
function rd32(b: number[], o: number): number {
  return rd16(b, o) * 0x10000 + rd16(b, o + 2);
}
function hex(n: number, width: number): string {
  return "0x" + n.toString(16).padStart(width, "0");
}
function mac(b: number[], o: number): string {
  return b
    .slice(o, o + 6)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join(":");
}
function ip(b: number[], o: number): string {
  return b.slice(o, o + 4).join(".");
}

interface FrameProse {
  dstMacDesc: string;
  srcMacDesc: string;
  ttlDesc: string;
  srcIpDesc: string;
  dstIpDesc: string;
  srcPortDesc: string;
  dstPortDesc: string;
  seqDesc: string;
  ackDesc: string;
  dataOffsetDesc: string;
  flagsLabel: string;
  flagsDesc: string;
  windowDesc: string;
  /** Pre-positioned option fields (start at byte 54), if the header has options. */
  options?: CaptureField[];
  /** Pre-positioned payload fields, if the frame carries data. */
  payload?: CaptureField[];
}

/** Build the standard Ethernet+IPv4+TCP field annotations for one frame. */
function buildFields(b: number[], p: FrameProse): CaptureField[] {
  const tcpHeaderLen = (b[46]! >> 4) * 4;
  const fields: CaptureField[] = [
    // Ethernet II (L2)
    {
      name: "Destination MAC",
      start: 0,
      length: 6,
      layer: 2,
      value: mac(b, 0),
      desc: p.dstMacDesc,
    },
    { name: "Source MAC", start: 6, length: 6, layer: 2, value: mac(b, 6), desc: p.srcMacDesc },
    {
      name: "EtherType",
      start: 12,
      length: 2,
      layer: 2,
      value: `${hex(rd16(b, 12), 4)} → IPv4`,
      desc: "Tells the receiver which protocol to hand the payload to — the demultiplexing key between Layer 2 and Layer 3 (0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP).",
    },
    // IPv4 (L3)
    {
      name: "Version + IHL",
      start: 14,
      length: 1,
      layer: 3,
      value: `${hex(b[14]!, 2)} → IPv4, 20-byte header`,
      desc: "High nibble 4 = IPv4; low nibble 5 = header length in 32-bit words (5 × 4 = 20 bytes, so no IP options).",
    },
    {
      name: "DSCP / ECN",
      start: 15,
      length: 1,
      layer: 3,
      value: `${hex(b[15]!, 2)} — default`,
      desc: "Quality-of-service marking (DSCP) and congestion signaling (ECN). Zero = best-effort, no ECN.",
    },
    {
      name: "Total Length",
      start: 16,
      length: 2,
      layer: 3,
      value: `${hex(rd16(b, 16), 4)} = ${rd16(b, 16)} bytes`,
      desc: "Everything from the IP header onward. The Ethernet header isn't counted — each layer measures only its own world.",
    },
    {
      name: "Identification",
      start: 18,
      length: 2,
      layer: 3,
      value: `${hex(rd16(b, 18), 4)} = ${rd16(b, 18)}`,
      desc: "Groups fragments of one packet back together on reassembly. With DF set it's mostly vestigial.",
    },
    {
      name: "Flags + Fragment Offset",
      start: 20,
      length: 2,
      layer: 3,
      value: `${hex(rd16(b, 20), 4)} → DF set, offset 0`,
      desc: "DF (Don't Fragment) is set — the modern default, relying on Path MTU Discovery instead of in-network fragmentation.",
    },
    {
      name: "TTL",
      start: 22,
      length: 1,
      layer: 3,
      value: `${hex(b[22]!, 2)} = ${b[22]}`,
      desc: p.ttlDesc,
    },
    {
      name: "Protocol",
      start: 23,
      length: 1,
      layer: 3,
      value: `${hex(b[23]!, 2)} → TCP`,
      desc: "The demultiplexing key between Layer 3 and Layer 4 (6 TCP, 17 UDP, 1 ICMP) — the same idea as EtherType, one layer up.",
    },
    {
      name: "Header Checksum",
      start: 24,
      length: 2,
      layer: 3,
      value: `${hex(rd16(b, 24), 4)} (verified)`,
      desc: "Ones-complement sum over the IP header only — recomputed at every hop because TTL changes. Genuinely correct for these bytes; our tests recompute it.",
    },
    { name: "Source IP", start: 26, length: 4, layer: 3, value: ip(b, 26), desc: p.srcIpDesc },
    { name: "Destination IP", start: 30, length: 4, layer: 3, value: ip(b, 30), desc: p.dstIpDesc },
    // TCP (L4)
    {
      name: "Source Port",
      start: 34,
      length: 2,
      layer: 4,
      value: `${hex(rd16(b, 34), 4)} = ${rd16(b, 34)}`,
      desc: p.srcPortDesc,
    },
    {
      name: "Destination Port",
      start: 36,
      length: 2,
      layer: 4,
      value: `${hex(rd16(b, 36), 4)} = ${rd16(b, 36)}`,
      desc: p.dstPortDesc,
    },
    {
      name: "Sequence Number",
      start: 38,
      length: 4,
      layer: 4,
      value: hex(rd32(b, 38), 8),
      desc: p.seqDesc,
    },
    {
      name: "Acknowledgment Number",
      start: 42,
      length: 4,
      layer: 4,
      value: hex(rd32(b, 42), 8),
      desc: p.ackDesc,
    },
    {
      name: "Data Offset + reserved",
      start: 46,
      length: 1,
      layer: 4,
      value: `${hex(b[46]!, 2)} → ${tcpHeaderLen}-byte header`,
      desc: p.dataOffsetDesc,
    },
    {
      name: "Flags",
      start: 47,
      length: 1,
      layer: 4,
      value: `${hex(b[47]!, 2)} → ${p.flagsLabel}`,
      desc: p.flagsDesc,
    },
    {
      name: "Window Size",
      start: 48,
      length: 2,
      layer: 4,
      value: `${hex(rd16(b, 48), 4)} = ${rd16(b, 48).toLocaleString("en-US")}`,
      desc: p.windowDesc,
    },
    {
      name: "TCP Checksum",
      start: 50,
      length: 2,
      layer: 4,
      value: `${hex(rd16(b, 50), 4)} (verified)`,
      desc: "Covers the TCP header, the payload, and a pseudo-header borrowing the IP addresses — a deliberate layering violation that catches misdelivered segments. Also genuinely correct for these bytes.",
    },
    {
      name: "Urgent Pointer",
      start: 52,
      length: 2,
      layer: 4,
      value: hex(rd16(b, 52), 4),
      desc: 'Points at "urgent" data when the URG flag is set. Effectively dead in the modern internet — a fossil in every TCP header.',
    },
    ...(p.options ?? []),
    ...(p.payload ?? []),
  ];
  return fields;
}

/** Layer spans derive from the frame's own lengths. */
function buildSpans(b: number[]): LayerSpan[] {
  const tcpLen = (b[46]! >> 4) * 4;
  const spans: LayerSpan[] = [
    { layer: 2, label: "Ethernet II header", start: 0, length: 14 },
    { layer: 3, label: "IPv4 header", start: 14, length: 20 },
    { layer: 4, label: "TCP header", start: 34, length: tcpLen },
  ];
  const payloadLen = b.length - 34 - tcpLen;
  if (payloadLen > 0) {
    spans.push({ layer: 7, label: "HTTP", start: 34 + tcpLen, length: payloadLen });
  }
  return spans;
}

/** TCP options carried by the SYN and SYN-ACK (offsets 54–65). */
function handshakeOptionFields(who: "client" | "server"): CaptureField[] {
  return [
    {
      name: "Option: MSS",
      start: 54,
      length: 4,
      layer: 4,
      value: "kind 2, len 4 → MSS 1460",
      desc: `The largest segment ${who === "client" ? "the client" : "the server"} can receive: 1460 = 1500 (Ethernet MTU) − 20 (IP) − 20 (TCP). MSS may only appear on SYN segments — it's negotiated once, here.`,
    },
    {
      name: "Option: NOP (padding)",
      start: 58,
      length: 1,
      layer: 4,
      value: "kind 1",
      desc: "A one-byte no-op aligning the next option — option lists are padded to 32-bit boundaries.",
    },
    {
      name: "Option: Window Scale",
      start: 59,
      length: 3,
      layer: 4,
      value: "kind 3, len 3 → shift 7 (×128)",
      desc: "Multiplies the 16-bit window field by 2⁷ on every later segment — without this, 64 KB in flight would cap throughput on any long fat pipe. Both sides must offer it in the handshake for it to take effect.",
    },
    {
      name: "Options: NOP, NOP (padding)",
      start: 62,
      length: 2,
      layer: 4,
      value: "kind 1 ×2",
      desc: "Alignment padding before the final option.",
    },
    {
      name: "Option: SACK permitted",
      start: 64,
      length: 2,
      layer: 4,
      value: "kind 4, len 2",
      desc: "Agrees to selective acknowledgments (RFC 2018), so losses can be repaired selectively instead of Go-Back-N style. Negotiated here, used later.",
    },
  ];
}

// ── The five frames ──────────────────────────────────────────────────────

const GATEWAY_MAC_DESC_OUT =
  "The next hop on this link — your default gateway's NIC, not the web server. The destination MAC changes at every hop; the destination IP rides unchanged end-to-end (it's the source IP that NAT rewrites).";
const LAPTOP_MAC_DESC_SRC =
  "The laptop's NIC. First three bytes (a4:5e:60) are the manufacturer's OUI; the rest identify this specific card.";
const LAPTOP_MAC_DESC_DST =
  "Now the laptop's NIC is the destination — this frame is arriving. On the server's own LAN this frame left with different MACs; they were rewritten at every hop.";
const GATEWAY_MAC_DESC_SRC =
  "The gateway's NIC is the source — for inbound frames, the router is the last hop that re-framed the packet onto your LAN.";
const TTL_CLIENT =
  "Fresh from the client's stack: 64, the common Linux/macOS initial value. Decremented by every router; at 0 the packet dies and ICMP Time Exceeded goes back — the field traceroute exploits.";
const TTL_SERVER =
  "Arrived as 54: the server sent 64 and the packet crossed 10 routers to get here. Reading remaining TTL is a quick clue to path length (and to OS: Windows starts at 128).";
const SRC_IP_CLIENT =
  "The laptop's private (RFC 1918) address — the NAT router will rewrite this on the way out. IP addresses are end-to-end; MACs are per-hop.";
const DST_IP_SERVER =
  "The server's address (documentation range, standing in for example.com). Constant across the whole path — this is what every router routes on.";
const SRC_IP_SERVER =
  "The server's address — now the source, because this frame travels toward the laptop.";
const DST_IP_CLIENT =
  "The laptop's address as this frame crosses the LAN (beyond the NAT router, the wire carried the router's public address instead).";
const PORT_EPHEMERAL_SRC =
  "The client-side half of the conversation's identity, picked from the ephemeral range — it's how replies find this exact process.";
const PORT_HTTP_DST =
  "The well-known port — the demultiplexing key between Layer 4 and the application. The third demux key in the frame (EtherType → Protocol → Port).";
const PORT_HTTP_SRC =
  "Port 80 is now the source — in replies, the 4-tuple is mirrored. Sorting a capture by these four values is how Wireshark 'follows a stream'.";
const PORT_EPHEMERAL_DST =
  "The ephemeral port is now the destination: this is how the laptop's OS routes the reply to the right socket among hundreds.";
const WINDOW_DESC =
  "Flow control: how many more bytes this sender is willing to receive, scaled by the factor negotiated in the handshake.";
const HANDSHAKE_WINDOW_DESC =
  "Flow control: how many more bytes this sender is willing to receive. This is the raw, unscaled value — windows in SYN segments are never scaled (RFC 7323); the ×128 factor applies from frame 3 onward.";

const SYN_BYTES: number[] = [
  0, 26, 43, 60, 77, 94, 164, 94, 96, 31, 205, 2, 8, 0, 69, 0, 0, 52, 28, 68, 64, 0, 64, 6, 50, 131,
  192, 168, 1, 23, 198, 51, 100, 10, 199, 56, 0, 80, 31, 77, 60, 0, 0, 0, 0, 0, 128, 2, 250, 240,
  101, 77, 0, 0, 2, 4, 5, 180, 1, 3, 3, 7, 1, 1, 4, 2,
];

const SYNACK_BYTES: number[] = [
  164, 94, 96, 31, 205, 2, 0, 26, 43, 60, 77, 94, 8, 0, 69, 0, 0, 52, 0, 243, 64, 0, 54, 6, 87, 212,
  198, 51, 100, 10, 192, 168, 1, 23, 0, 80, 199, 56, 158, 139, 42, 1, 31, 77, 60, 1, 128, 18, 254,
  136, 153, 23, 0, 0, 2, 4, 5, 180, 1, 3, 3, 7, 1, 1, 4, 2,
];

// prettier-ignore
const GET_BYTES: number[] = [
  0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e, 0xa4, 0x5e, 0x60, 0x1f, 0xcd, 0x02, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x72, 0x1c, 0x45, 0x40, 0x00, 0x40, 0x06, 0x32, 0x44, 0xc0, 0xa8, 0x01, 0x17, 0xc6, 0x33,
  0x64, 0x0a, 0xc7, 0x38, 0x00, 0x50, 0x1f, 0x4d, 0x3c, 0x01, 0x9e, 0x8b, 0x2a, 0x02, 0x50, 0x18,
  0xfa, 0xf0, 0x4d, 0x79, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20, 0x2f, 0x20, 0x48, 0x54, 0x54, 0x50,
  0x2f, 0x31, 0x2e, 0x31, 0x0d, 0x0a, 0x48, 0x6f, 0x73, 0x74, 0x3a, 0x20, 0x65, 0x78, 0x61, 0x6d,
  0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d, 0x0d, 0x0a, 0x55, 0x73, 0x65, 0x72, 0x2d, 0x41, 0x67,
  0x65, 0x6e, 0x74, 0x3a, 0x20, 0x63, 0x75, 0x72, 0x6c, 0x2f, 0x38, 0x2e, 0x35, 0x2e, 0x30, 0x0d,
  0x0a, 0x41, 0x63, 0x63, 0x65, 0x70, 0x74, 0x3a, 0x20, 0x2a, 0x2f, 0x2a, 0x0d, 0x0a, 0x0d, 0x0a,
];

const RESP_BYTES: number[] = [
  164, 94, 96, 31, 205, 2, 0, 26, 43, 60, 77, 94, 8, 0, 69, 0, 0, 136, 0, 244, 64, 0, 54, 6, 87,
  127, 198, 51, 100, 10, 192, 168, 1, 23, 0, 80, 199, 56, 158, 139, 42, 2, 31, 77, 60, 75, 80, 24,
  254, 136, 132, 81, 0, 0, 72, 84, 84, 80, 47, 49, 46, 49, 32, 50, 48, 48, 32, 79, 75, 13, 10, 67,
  111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101, 58, 32, 116, 101, 120, 116, 47, 104, 116,
  109, 108, 13, 10, 67, 111, 110, 116, 101, 110, 116, 45, 76, 101, 110, 103, 116, 104, 58, 32, 51,
  50, 13, 10, 13, 10, 60, 33, 100, 111, 99, 116, 121, 112, 101, 32, 104, 116, 109, 108, 62, 60, 116,
  105, 116, 108, 101, 62, 72, 105, 60, 47, 116, 105, 116, 108, 101, 62,
];

const FIN_BYTES: number[] = [
  0, 26, 43, 60, 77, 94, 164, 94, 96, 31, 205, 2, 8, 0, 69, 0, 0, 40, 28, 70, 64, 0, 64, 6, 50, 141,
  192, 168, 1, 23, 198, 51, 100, 10, 199, 56, 0, 80, 31, 77, 60, 75, 158, 139, 42, 98, 80, 17, 250,
  166, 221, 32, 0, 0,
];

export const FRAMES: CaptureFrame[] = [
  {
    id: "syn",
    label: "SYN",
    direction: "client → server",
    summary:
      "Frame 1 — the opening move. No payload: just 'here is my starting sequence number, and here are the features I support.'",
    bytes: SYN_BYTES,
    layerSpans: buildSpans(SYN_BYTES),
    fields: buildFields(SYN_BYTES, {
      dstMacDesc: GATEWAY_MAC_DESC_OUT,
      srcMacDesc: LAPTOP_MAC_DESC_SRC,
      ttlDesc: TTL_CLIENT,
      srcIpDesc: SRC_IP_CLIENT,
      dstIpDesc: DST_IP_SERVER,
      srcPortDesc: PORT_EPHEMERAL_SRC,
      dstPortDesc: PORT_HTTP_DST,
      seqDesc:
        "The client's initial sequence number (ISN), chosen randomly to defeat off-path injection. Everything the client ever sends is numbered from here — and the SYN itself consumes one number.",
      ackDesc:
        "All zeros: the ACK flag isn't set, so this field is meaningless. The client hasn't heard the server's ISN yet — that's the point of the handshake.",
      dataOffsetDesc:
        "High nibble 8 → 32-byte header: 20 fixed + 12 bytes of options. In this capture, only the handshake segments are this long.",
      flagsLabel: "SYN",
      flagsDesc:
        "SYN alone — 'synchronize'. The only segment in a connection's life with SYN and no ACK (its mirror is the SYN-ACK).",
      windowDesc: HANDSHAKE_WINDOW_DESC,
      options: handshakeOptionFields("client"),
    }),
  },
  {
    id: "syn-ack",
    label: "SYN-ACK",
    direction: "server → client",
    summary:
      "Frame 2 — the server's half of the synchronization: its own ISN, plus the acknowledgment that the client's SYN arrived.",
    bytes: SYNACK_BYTES,
    layerSpans: buildSpans(SYNACK_BYTES),
    fields: buildFields(SYNACK_BYTES, {
      dstMacDesc: LAPTOP_MAC_DESC_DST,
      srcMacDesc: GATEWAY_MAC_DESC_SRC,
      ttlDesc: TTL_SERVER,
      srcIpDesc: SRC_IP_SERVER,
      dstIpDesc: DST_IP_CLIENT,
      srcPortDesc: PORT_HTTP_SRC,
      dstPortDesc: PORT_EPHEMERAL_DST,
      seqDesc:
        "The server's own ISN — also random, also consuming one sequence number. Each direction of a TCP connection is numbered independently.",
      ackDesc:
        "Client ISN + 1: 'I received your SYN.' The +1 is the SYN consuming a sequence number — the first arithmetic link in the conversation's chain.",
      dataOffsetDesc:
        "32-byte header again: the server answers with its own option list — agreement requires both sides to offer.",
      flagsLabel: "SYN + ACK",
      flagsDesc:
        "Both flags at once: synchronize my direction, acknowledge yours. Message two of three.",
      windowDesc: HANDSHAKE_WINDOW_DESC,
      options: handshakeOptionFields("server"),
    }),
  },
  {
    id: "get",
    label: "HTTP GET",
    direction: "client → server",
    summary:
      "Frame 3 — the request itself (the handshake's final ACK rides along: ACK is set on everything from here on). 74 readable bytes of HTTP.",
    bytes: GET_BYTES,
    layerSpans: buildSpans(GET_BYTES),
    fields: buildFields(GET_BYTES, {
      dstMacDesc: GATEWAY_MAC_DESC_OUT,
      srcMacDesc: LAPTOP_MAC_DESC_SRC,
      ttlDesc: TTL_CLIENT,
      srcIpDesc: SRC_IP_CLIENT,
      dstIpDesc: DST_IP_SERVER,
      srcPortDesc: PORT_EPHEMERAL_SRC,
      dstPortDesc: PORT_HTTP_DST,
      seqDesc:
        "Client ISN + 1 — the first data byte's number. The plain ACK that completed the handshake consumed no sequence number, so data starts here.",
      ackDesc:
        "Server ISN + 1: 'I have everything you've sent.' The cumulative ACK that drives TCP's reliability.",
      dataOffsetDesc:
        "Back to the 20-byte minimum — this conversation negotiated no per-segment options. (Real stacks usually carry a 12-byte timestamp option on every segment.)",
      flagsLabel: "PSH + ACK",
      flagsDesc:
        "ACK (valid acknowledgment — set on virtually every segment after the handshake) and PSH (deliver to the application promptly, don't buffer).",
      windowDesc: WINDOW_DESC,
      payload: [
        {
          name: "Request line",
          start: 54,
          length: 16,
          layer: 7,
          value: "GET / HTTP/1.1\\r\\n",
          desc: "Plain ASCII at last: method, path, version. Everything below this byte existed to deliver this line. Each line ends with CR LF (0x0d 0x0a).",
        },
        {
          name: "Host header",
          start: 70,
          length: 19,
          layer: 7,
          value: "Host: example.com\\r\\n",
          desc: "Required since HTTP/1.1 so one IP address can serve many sites (virtual hosting) — a one-line change that reshaped web economics.",
        },
        {
          name: "User-Agent header",
          start: 89,
          length: 24,
          layer: 7,
          value: "User-Agent: curl/8.5.0\\r\\n",
          desc: "Identifies the client software. Servers branch on it; analytics mine it; privacy people grumble about it.",
        },
        {
          name: "Accept header",
          start: 113,
          length: 13,
          layer: 7,
          value: "Accept: */*\\r\\n",
          desc: 'Content negotiation — the client says which representations it can handle. */* means "anything" (a Presentation-layer concern riding in an Application header).',
        },
        {
          name: "End of headers",
          start: 126,
          length: 2,
          layer: 7,
          value: "\\r\\n (blank line)",
          desc: "An empty line terminates the header block. For a GET there's no body, so this is also the end of the request.",
        },
      ],
    }),
  },
  {
    id: "response",
    label: "HTTP 200",
    direction: "server → client",
    summary:
      "Frame 4 — the answer. Note the acknowledgment number: client ISN + 1 + 74, precisely accounting for every byte of the GET.",
    bytes: RESP_BYTES,
    layerSpans: buildSpans(RESP_BYTES),
    fields: buildFields(RESP_BYTES, {
      dstMacDesc: LAPTOP_MAC_DESC_DST,
      srcMacDesc: GATEWAY_MAC_DESC_SRC,
      ttlDesc: TTL_SERVER,
      srcIpDesc: SRC_IP_SERVER,
      dstIpDesc: DST_IP_CLIENT,
      srcPortDesc: PORT_HTTP_SRC,
      dstPortDesc: PORT_EPHEMERAL_DST,
      seqDesc: "Server ISN + 1 — the server's first data byte, numbered from its own ISN.",
      ackDesc:
        "Client ISN + 1 + 74: the 74 payload bytes of the GET, acknowledged to the byte. Watch this number do the bookkeeping that makes reliability work.",
      dataOffsetDesc: "20-byte minimum — data segments carry no options.",
      flagsLabel: "PSH + ACK",
      flagsDesc: "Same flags as the request: acknowledge what arrived, deliver this promptly.",
      windowDesc: WINDOW_DESC,
      payload: [
        {
          name: "Status line",
          start: 54,
          length: 17,
          layer: 7,
          value: "HTTP/1.1 200 OK\\r\\n",
          desc: "The verdict: protocol version, status code, reason phrase. 200 = success; the codes' first digit is the category (4xx you, 5xx them).",
        },
        {
          name: "Content-Type header",
          start: 71,
          length: 25,
          layer: 7,
          value: "Content-Type: text/html\\r\\n",
          desc: "Tells the browser how to interpret the body bytes — a Presentation-layer declaration (compare the charset mojibake story).",
        },
        {
          name: "Content-Length header",
          start: 96,
          length: 20,
          layer: 7,
          value: "Content-Length: 32\\r\\n",
          desc: "Exactly 32 body bytes follow the blank line — count them. This is how the client knows where this response ends on a kept-alive connection.",
        },
        {
          name: "End of headers",
          start: 116,
          length: 2,
          layer: 7,
          value: "\\r\\n (blank line)",
          desc: "Headers end; body begins.",
        },
        {
          name: "Body (HTML)",
          start: 118,
          length: 32,
          layer: 7,
          value: "<!doctype html><title>Hi</title>",
          desc: "The 32 promised bytes — the actual web page. Real responses carry kilobytes and are usually gzip/Brotli-compressed (Content-Encoding), but the structure is exactly this.",
        },
      ],
    }),
  },
  {
    id: "fin",
    label: "FIN",
    direction: "client → server",
    summary:
      "Frame 5 — the client begins the close. Teardown is a four-message exchange (FIN/ACK each way); this sender now enters TIME_WAIT after the far side's FIN is acknowledged.",
    bytes: FIN_BYTES,
    layerSpans: buildSpans(FIN_BYTES),
    fields: buildFields(FIN_BYTES, {
      dstMacDesc: GATEWAY_MAC_DESC_OUT,
      srcMacDesc: LAPTOP_MAC_DESC_SRC,
      ttlDesc: TTL_CLIENT,
      srcIpDesc: SRC_IP_CLIENT,
      dstIpDesc: DST_IP_SERVER,
      srcPortDesc: PORT_EPHEMERAL_SRC,
      dstPortDesc: PORT_HTTP_DST,
      seqDesc:
        "Client ISN + 1 + 74 — right where the GET's payload ended. Like SYN, the FIN itself consumes one sequence number.",
      ackDesc:
        "Server ISN + 1 + 96: every byte of the response (64 header + 32 body) acknowledged before saying goodbye.",
      dataOffsetDesc: "20-byte minimum header, no payload — a pure control segment.",
      flagsLabel: "FIN + ACK",
      flagsDesc:
        "FIN: 'I have nothing more to send.' Each side closes its own direction independently — the server can keep sending until it FINs too (half-close).",
      windowDesc: WINDOW_DESC,
    }),
  },
];

/** The field owning a given byte offset within a frame (fields tile each frame exactly). */
export function fieldAt(frame: CaptureFrame, offset: number): CaptureField | undefined {
  return frame.fields.find((f) => offset >= f.start && offset < f.start + f.length);
}
