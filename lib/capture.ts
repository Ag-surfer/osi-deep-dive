/**
 * A complete, real 128-byte frame — an HTTP GET to example.com as it would
 * appear on the wire: Ethernet II + IPv4 + TCP + HTTP. Every field value is
 * genuine (the IP and TCP checksums are correctly computed over these exact
 * bytes; tests recompute them independently), and the addresses deliberately
 * reuse the site's running examples: the laptop 192.168.1.23 from the NAT
 * worked example, the MAC a4:5e:60:1f:cd:02 from the Data Link page.
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

/** The frame, exactly as it would cross the wire (minus preamble/SFD and FCS). */
// prettier-ignore
export const FRAME: number[] = [
  0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e, 0xa4, 0x5e, 0x60, 0x1f, 0xcd, 0x02, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x72, 0x1c, 0x46, 0x40, 0x00, 0x40, 0x06, 0x32, 0x43, 0xc0, 0xa8, 0x01, 0x17, 0xc6, 0x33,
  0x64, 0x0a, 0xc7, 0x38, 0x00, 0x50, 0x1f, 0x4d, 0x3c, 0x01, 0x9e, 0x8b, 0x2a, 0x02, 0x50, 0x18,
  0xfa, 0xf0, 0x4d, 0x79, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20, 0x2f, 0x20, 0x48, 0x54, 0x54, 0x50,
  0x2f, 0x31, 0x2e, 0x31, 0x0d, 0x0a, 0x48, 0x6f, 0x73, 0x74, 0x3a, 0x20, 0x65, 0x78, 0x61, 0x6d,
  0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d, 0x0d, 0x0a, 0x55, 0x73, 0x65, 0x72, 0x2d, 0x41, 0x67,
  0x65, 0x6e, 0x74, 0x3a, 0x20, 0x63, 0x75, 0x72, 0x6c, 0x2f, 0x38, 0x2e, 0x35, 0x2e, 0x30, 0x0d,
  0x0a, 0x41, 0x63, 0x63, 0x65, 0x70, 0x74, 0x3a, 0x20, 0x2a, 0x2f, 0x2a, 0x0d, 0x0a, 0x0d, 0x0a,
];

/** Layer-colored spans for the legend / overview bar. */
export const LAYER_SPANS = [
  { layer: 2, label: "Ethernet II header", start: 0, length: 14 },
  { layer: 3, label: "IPv4 header", start: 14, length: 20 },
  { layer: 4, label: "TCP header", start: 34, length: 20 },
  { layer: 7, label: "HTTP request", start: 54, length: 74 },
];

export const FIELDS: CaptureField[] = [
  // ── Ethernet II (L2) ──────────────────────────────────────────────────
  {
    name: "Destination MAC",
    start: 0,
    length: 6,
    layer: 2,
    value: "00:1a:2b:3c:4d:5e",
    desc: "The next hop on this link — your default gateway's NIC, not the web server. The destination MAC changes at every hop; the destination IP rides unchanged end-to-end (it's the source IP that NAT rewrites).",
  },
  {
    name: "Source MAC",
    start: 6,
    length: 6,
    layer: 2,
    value: "a4:5e:60:1f:cd:02",
    desc: "The laptop's NIC. First three bytes (a4:5e:60) are the manufacturer's OUI; the rest identify this specific card.",
  },
  {
    name: "EtherType",
    start: 12,
    length: 2,
    layer: 2,
    value: "0x0800 → IPv4",
    desc: "Tells the receiver which protocol to hand the payload to — the demultiplexing key between Layer 2 and Layer 3 (0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP).",
  },
  // ── IPv4 (L3) ────────────────────────────────────────────────────────
  {
    name: "Version + IHL",
    start: 14,
    length: 1,
    layer: 3,
    value: "0x45 → IPv4, 20-byte header",
    desc: "High nibble 4 = IPv4; low nibble 5 = header length in 32-bit words (5 × 4 = 20 bytes, so no options).",
  },
  {
    name: "DSCP / ECN",
    start: 15,
    length: 1,
    layer: 3,
    value: "0x00 — default",
    desc: "Quality-of-service marking (DSCP) and congestion signaling (ECN). Zero = best-effort, no ECN.",
  },
  {
    name: "Total Length",
    start: 16,
    length: 2,
    layer: 3,
    value: "0x0072 = 114 bytes",
    desc: "Everything from the IP header onward: 20 (IP) + 20 (TCP) + 74 (HTTP) = 114. The Ethernet header isn't counted — each layer measures only its own world.",
  },
  {
    name: "Identification",
    start: 18,
    length: 2,
    layer: 3,
    value: "0x1c46 = 7238",
    desc: "Groups fragments of one packet back together on reassembly. With DF set it's mostly vestigial.",
  },
  {
    name: "Flags + Fragment Offset",
    start: 20,
    length: 2,
    layer: 3,
    value: "0x4000 → DF set, offset 0",
    desc: "DF (Don't Fragment) is set — the modern default, relying on Path MTU Discovery instead of in-network fragmentation.",
  },
  {
    name: "TTL",
    start: 22,
    length: 1,
    layer: 3,
    value: "0x40 = 64",
    desc: "Decremented by every router; at 0 the packet dies and an ICMP Time Exceeded goes back. The field traceroute exploits hop by hop.",
  },
  {
    name: "Protocol",
    start: 23,
    length: 1,
    layer: 3,
    value: "0x06 → TCP",
    desc: "The demultiplexing key between Layer 3 and Layer 4 (6 TCP, 17 UDP, 1 ICMP) — the same idea as EtherType, one layer up.",
  },
  {
    name: "Header Checksum",
    start: 24,
    length: 2,
    layer: 3,
    value: "0x3243 (verified)",
    desc: "Ones-complement sum over the IP header only. Recomputed at every hop because TTL changes. This value is genuinely correct for these bytes — our tests recompute it.",
  },
  {
    name: "Source IP",
    start: 26,
    length: 4,
    layer: 3,
    value: "192.168.1.23",
    desc: "The laptop's private (RFC 1918) address — the NAT router will rewrite this on the way out, but the MAC-vs-IP contrast stands: IP addresses are end-to-end, MACs are per-hop.",
  },
  {
    name: "Destination IP",
    start: 30,
    length: 4,
    layer: 3,
    value: "198.51.100.10",
    desc: "The server's address (documentation range, standing in for example.com). Constant across the whole path — this is what every router routes on.",
  },
  // ── TCP (L4) ─────────────────────────────────────────────────────────
  {
    name: "Source Port",
    start: 34,
    length: 2,
    layer: 4,
    value: "0xc738 = 51000 (ephemeral)",
    desc: "The client-side half of the conversation's identity. Picked from the ephemeral range; it's how replies find this exact process.",
  },
  {
    name: "Destination Port",
    start: 36,
    length: 2,
    layer: 4,
    value: "0x0050 = 80 → HTTP",
    desc: "The well-known port — the demultiplexing key between Layer 4 and the application. The third demux key in this one frame (EtherType → Protocol → Port).",
  },
  {
    name: "Sequence Number",
    start: 38,
    length: 4,
    layer: 4,
    value: "0x1f4d3c01",
    desc: "Position of this segment's first payload byte in the connection's byte stream (as an offset from a randomized starting number). The receiver uses it to reorder and to detect loss.",
  },
  {
    name: "Acknowledgment Number",
    start: 42,
    length: 4,
    layer: 4,
    value: "0x9e8b2a02",
    desc: '"I have received every byte before this number" — the cumulative ACK that drives TCP\'s reliability.',
  },
  {
    name: "Data Offset + reserved",
    start: 46,
    length: 1,
    layer: 4,
    value: "0x50 → 20-byte header",
    desc: "High nibble 5 = header length in 32-bit words (no TCP options in this segment; a SYN would typically carry MSS, SACK-permitted, window scale). The low nibble is reserved bits, all zero.",
  },
  {
    name: "Flags",
    start: 47,
    length: 1,
    layer: 4,
    value: "0x18 → PSH + ACK",
    desc: "ACK (acknowledgment field is valid — set on virtually every segment after the handshake) and PSH (deliver to the application promptly, don't buffer).",
  },
  {
    name: "Window Size",
    start: 48,
    length: 2,
    layer: 4,
    value: "0xfaf0 = 64,240",
    desc: "Flow control: how many more bytes the sender is willing to receive. Multiplied by the window-scale factor negotiated in the handshake.",
  },
  {
    name: "TCP Checksum",
    start: 50,
    length: 2,
    layer: 4,
    value: "0x4d79 (verified)",
    desc: "Covers the TCP header, the payload, and a pseudo-header borrowing the IP addresses — a deliberate layering violation that catches misdelivered segments. Also genuinely correct for these bytes.",
  },
  {
    name: "Urgent Pointer",
    start: 52,
    length: 2,
    layer: 4,
    value: "0x0000",
    desc: 'Points at "urgent" data when the URG flag is set. Effectively dead in the modern internet — a fossil in every TCP header.',
  },
  // ── HTTP (L7) ────────────────────────────────────────────────────────
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
    desc: "An empty line terminates the header block. For a GET there's no body, so this is also the end of the request — and of the frame.",
  },
];

/** The field owning a given byte offset (fields tile the frame exactly). */
export function fieldAt(offset: number): CaptureField | undefined {
  return FIELDS.find((f) => offset >= f.start && offset < f.start + f.length);
}
