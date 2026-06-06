import type { HeaderField } from "@/components/HeaderDiagram";

/**
 * Canonical bit-level header specs — the single source of truth for every
 * `<HeaderDiagram>` on the site. Centralizing them here makes the layouts
 * **testable**: `headers.test.ts` asserts the fixed (non-variable) fields of
 * each header sum to its documented size. Edit a header here, not in MDX.
 */
export interface HeaderSpec {
  title: string;
  /** Sum of the non-variable field bits — the documented header size. */
  expectedBits: number;
  fields: HeaderField[];
}

export const HEADERS = {
  ipv4: {
    title: "IPv4 header (RFC 791) — 20 bytes minimum",
    expectedBits: 160,
    fields: [
      { name: "Version", bits: 4, desc: "IP version number — 4 for IPv4." },
      {
        name: "IHL",
        bits: 4,
        desc: "Internet Header Length, in 32-bit words. Minimum 5 (=20 bytes); larger when Options are present.",
      },
      {
        name: "DSCP/ECN",
        bits: 8,
        desc: "Type of Service: 6 bits of Differentiated Services Code Point (QoS class) plus 2 bits of Explicit Congestion Notification.",
      },
      {
        name: "Total Length",
        bits: 16,
        desc: "Entire packet size (header + data) in bytes. Max 65,535.",
      },
      {
        name: "Identification",
        bits: 16,
        desc: "Groups fragments of one original datagram so the receiver can reassemble them.",
      },
      {
        name: "Flags",
        bits: 3,
        desc: "Bit 0 reserved; DF = Don't Fragment; MF = More Fragments (set on all but the last fragment).",
      },
      {
        name: "Fragment Offset",
        bits: 13,
        desc: "Position of this fragment in the original datagram, in 8-byte units.",
      },
      {
        name: "TTL",
        bits: 8,
        desc: "Time To Live: decremented by each router; at 0 the packet is dropped and an ICMP Time Exceeded is returned. Prevents loops.",
      },
      {
        name: "Protocol",
        bits: 8,
        desc: "Identifies the encapsulated payload: 6 = TCP, 17 = UDP, 1 = ICMP.",
      },
      {
        name: "Header Checksum",
        bits: 16,
        desc: "Covers the header only; recomputed at every hop because TTL changes.",
      },
      { name: "Source Address", bits: 32, desc: "32-bit IPv4 address of the sender." },
      {
        name: "Destination Address",
        bits: 32,
        desc: "32-bit IPv4 address of the intended recipient.",
      },
      {
        name: "Options",
        bits: 32,
        variable: true,
        desc: "Optional, variable-length (rarely used): record route, timestamp, etc. Padded to a 32-bit boundary.",
      },
    ],
  },
  ipv6: {
    title: "IPv6 header (RFC 8200) — 40 bytes fixed",
    expectedBits: 320,
    fields: [
      { name: "Version", bits: 4, desc: "6 for IPv6." },
      {
        name: "Traffic Class",
        bits: 8,
        desc: "QoS / DiffServ + ECN, analogous to IPv4's DSCP/ECN byte.",
      },
      {
        name: "Flow Label",
        bits: 20,
        desc: "Labels a flow of related packets so routers can give them consistent handling without deep inspection.",
      },
      {
        name: "Payload Length",
        bits: 16,
        desc: "Length of the data following this header, in bytes (the fixed header is not counted).",
      },
      {
        name: "Next Header",
        bits: 8,
        desc: "Type of the next header — an upper-layer protocol (TCP/UDP) or an IPv6 extension header.",
      },
      { name: "Hop Limit", bits: 8, desc: "IPv6's TTL: decremented per hop, dropped at 0." },
      { name: "Source Address", bits: 128, desc: "128-bit IPv6 address of the sender." },
      { name: "Destination Address", bits: 128, desc: "128-bit IPv6 address of the recipient." },
    ],
  },
  tcp: {
    title: "TCP segment header (RFC 9293) — 20 bytes minimum",
    expectedBits: 160,
    fields: [
      { name: "Source Port", bits: 16, desc: "Sending process's port." },
      { name: "Destination Port", bits: 16, desc: "Receiving process's port." },
      {
        name: "Sequence Number",
        bits: 32,
        desc: "Byte-offset of this segment's first data byte in the stream. How TCP orders data and detects loss.",
      },
      {
        name: "Acknowledgment Number",
        bits: 32,
        desc: "Next byte the sender expects to receive — cumulative acknowledgment of everything before it.",
      },
      {
        name: "Data Offset",
        bits: 4,
        desc: "Header length in 32-bit words (≥5); tells where data begins after any options.",
      },
      {
        name: "Reserved",
        bits: 4,
        desc: "Reserved bits, sent as zero. (Originally 6 bits; two were reallocated to the CWR/ECE flags.)",
      },
      {
        name: "Flags",
        bits: 8,
        desc: "Control bits: SYN (open), ACK (acknowledgment valid), FIN (close), RST (reset/abort), PSH (push to app), URG, plus ECE/CWR for ECN.",
      },
      {
        name: "Window Size",
        bits: 16,
        desc: "Flow control: how many more bytes the receiver can buffer right now. The advertised receive window.",
      },
      {
        name: "Checksum",
        bits: 16,
        desc: "Covers header, data, and a pseudo-header of IP fields — detects corruption end to end.",
      },
      {
        name: "Urgent Pointer",
        bits: 16,
        desc: "With URG set, marks the end of urgent data. Rarely used.",
      },
      {
        name: "Options",
        bits: 32,
        variable: true,
        desc: "MSS, window scaling, SACK, timestamps — negotiated in the handshake. Variable length, padded to 32 bits.",
      },
    ],
  },
  udp: {
    title: "UDP header (RFC 768) — 8 bytes",
    expectedBits: 64,
    fields: [
      { name: "Source Port", bits: 16, desc: "Sending port (optional in UDP; may be 0)." },
      { name: "Destination Port", bits: 16, desc: "Receiving port." },
      { name: "Length", bits: 16, desc: "Length of header + data in bytes." },
      {
        name: "Checksum",
        bits: 16,
        desc: "Optional in IPv4, mandatory in IPv6; covers header, data, and IP pseudo-header.",
      },
    ],
  },
  ethernet: {
    title: "Ethernet II frame (IEEE 802.3) — header + trailer around the payload",
    expectedBits: 144, // fixed framing overhead (header + FCS); the payload is variable
    fields: [
      {
        name: "Destination MAC",
        bits: 48,
        desc: "Hardware address of the receiving NIC on this segment (or broadcast/multicast).",
      },
      { name: "Source MAC", bits: 48, desc: "Hardware address of the sending NIC." },
      {
        name: "EtherType / Length",
        bits: 16,
        desc: "≥ 0x0600 (1536) names the upper protocol — 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6. ≤ 1500 instead means payload length (802.3).",
      },
      {
        name: "Payload",
        bits: 160,
        variable: true,
        desc: "The encapsulated packet, 46–1500 bytes. Below 46 it is padded so the frame meets the 64-byte minimum.",
      },
      {
        name: "FCS",
        bits: 32,
        desc: "Frame Check Sequence: a CRC-32 over the frame. If it doesn't match on receipt, the frame is silently dropped — the Data Link layer detects errors but does not correct them.",
      },
    ],
  },
  dns: {
    title: "DNS message header (RFC 1035) — 12 bytes",
    expectedBits: 96,
    fields: [
      { name: "ID", bits: 16, desc: "Transaction ID matching a reply to its query." },
      { name: "QR", bits: 1, desc: "0 = query, 1 = response." },
      { name: "Opcode", bits: 4, desc: "Query type — standard, inverse, status." },
      { name: "AA", bits: 1, desc: "Authoritative Answer — the responder owns this zone." },
      { name: "TC", bits: 1, desc: "Truncated — answer too big for UDP; retry over TCP." },
      { name: "RD", bits: 1, desc: "Recursion Desired — please resolve fully on my behalf." },
      { name: "RA", bits: 1, desc: "Recursion Available — this server will recurse." },
      { name: "Z", bits: 1, desc: "Reserved; must be zero." },
      {
        name: "AD",
        bits: 1,
        desc: "Authentic Data (DNSSEC) — the resolver verified the answer's signatures.",
      },
      {
        name: "CD",
        bits: 1,
        desc: "Checking Disabled (DNSSEC) — the client will do its own validation; don't fail on bad signatures.",
      },
      {
        name: "RCODE",
        bits: 4,
        desc: "Response code — 0 = no error, 3 = NXDOMAIN (name doesn't exist).",
      },
      { name: "QDCOUNT", bits: 16, desc: "Number of questions." },
      { name: "ANCOUNT", bits: 16, desc: "Number of answer records." },
      { name: "NSCOUNT", bits: 16, desc: "Number of authority (name server) records." },
      { name: "ARCOUNT", bits: 16, desc: "Number of additional records." },
    ],
  },
} satisfies Record<string, HeaderSpec>;

export type HeaderId = keyof typeof HEADERS;
