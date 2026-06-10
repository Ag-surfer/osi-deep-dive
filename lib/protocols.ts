/**
 * The protocol deep-dive registry — single source of truth for the
 * /protocols/ library, mirroring how lib/layers.ts drives the layer pages.
 * Each entry has a matching content/protocols/<slug>.mdx (enforced by tests),
 * and the index page, layer-page deep-dive boxes, routing, sitemap, and
 * search index all derive from this list.
 */

export interface ProtocolMeta {
  /** URL slug, e.g. "bgp". */
  slug: string;
  /** Display name, e.g. "BGP". */
  name: string;
  /** Full name, e.g. "Border Gateway Protocol". */
  fullName: string;
  /** The OSI layer it's filed under, 1–7. */
  layer: number;
  /** Primary standard, e.g. "RFC 4271" or "IEEE 802.1Q". */
  standard: string;
  /** One-line essence. */
  tagline: string;
}

export const PROTOCOLS: ProtocolMeta[] = [
  // ── Layer 1 ──────────────────────────────────────────────────────────
  {
    slug: "ethernet-phy",
    name: "Ethernet PHY",
    fullName: "Ethernet Physical Layers, 10BASE-T to 800G",
    layer: 1,
    standard: "IEEE 802.3",
    tagline: "Five decades of squeezing more bits through copper and glass.",
  },
  {
    slug: "fiber-dwdm",
    name: "Fiber & DWDM",
    fullName: "Optical Fiber and Dense Wavelength-Division Multiplexing",
    layer: 1,
    standard: "ITU-T G.652 / G.694.1",
    tagline: "The glass threads carrying essentially all intercontinental traffic.",
  },
  {
    slug: "wifi-phy",
    name: "Wi-Fi PHY",
    fullName: "The 802.11 Physical Layer: OFDM, Channels, and MIMO",
    layer: 1,
    standard: "IEEE 802.11",
    tagline: "How radio waves became a 10-gigabit LAN cable.",
  },
  // ── Layer 2 ──────────────────────────────────────────────────────────
  {
    slug: "ethernet-switching",
    name: "Ethernet & Switching",
    fullName: "Ethernet Frames and the Learning Switch",
    layer: 2,
    standard: "IEEE 802.3 / 802.1D",
    tagline: "The protocol that outlived all its rivals, and the device that made it scale.",
  },
  {
    slug: "stp",
    name: "STP / RSTP",
    fullName: "Spanning Tree Protocol",
    layer: 2,
    standard: "IEEE 802.1D / 802.1w",
    tagline: "The algorithm that lets you build loops without melting the LAN.",
  },
  {
    slug: "arp",
    name: "ARP",
    fullName: "Address Resolution Protocol",
    layer: 2,
    standard: "RFC 826",
    tagline: "The four-message glue between IP addresses and MAC addresses.",
  },
  {
    slug: "vlan",
    name: "VLANs",
    fullName: "Virtual LANs and 802.1Q Tagging",
    layer: 2,
    standard: "IEEE 802.1Q",
    tagline: "Slicing one switch into many networks with four bytes per frame.",
  },
  // ── Layer 3 ──────────────────────────────────────────────────────────
  {
    slug: "bgp",
    name: "BGP",
    fullName: "Border Gateway Protocol",
    layer: 3,
    standard: "RFC 4271",
    tagline: "The internet's routing protocol — where engineering meets economics.",
  },
  {
    slug: "ospf",
    name: "OSPF",
    fullName: "Open Shortest Path First",
    layer: 3,
    standard: "RFC 2328",
    tagline: "Link-state routing inside the organization: flood the map, run Dijkstra.",
  },
  {
    slug: "ipv6",
    name: "IPv6",
    fullName: "Internet Protocol version 6",
    layer: 3,
    standard: "RFC 8200",
    tagline: "The addressing do-over: 128 bits, no NAT required, still arriving.",
  },
  {
    slug: "icmp",
    name: "ICMP",
    fullName: "Internet Control Message Protocol",
    layer: 3,
    standard: "RFC 792",
    tagline: "The network's error channel — and the protocol behind ping and traceroute.",
  },
  // ── Layer 4 ──────────────────────────────────────────────────────────
  {
    slug: "tcp",
    name: "TCP",
    fullName: "Transmission Control Protocol",
    layer: 4,
    standard: "RFC 9293",
    tagline: "Reliable byte streams over an unreliable network — the internet's workhorse.",
  },
  {
    slug: "udp",
    name: "UDP",
    fullName: "User Datagram Protocol",
    layer: 4,
    standard: "RFC 768",
    tagline: "Eight bytes of header and no promises — and why that's exactly right.",
  },
  {
    slug: "quic",
    name: "QUIC",
    fullName: "QUIC: A UDP-Based Multiplexed and Secure Transport",
    layer: 4,
    standard: "RFC 9000",
    tagline: "TCP's lessons rebuilt in user space, with TLS inside.",
  },
  // ── Layer 5 ──────────────────────────────────────────────────────────
  {
    slug: "websocket",
    name: "WebSocket",
    fullName: "The WebSocket Protocol",
    layer: 5,
    standard: "RFC 6455",
    tagline: "Full-duplex dialogues for a request/response web.",
  },
  {
    slug: "grpc",
    name: "gRPC",
    fullName: "gRPC Remote Procedure Calls",
    layer: 5,
    standard: "CNCF / HTTP/2",
    tagline: "Typed function calls across machines — RPC done with modern plumbing.",
  },
  {
    slug: "sip",
    name: "SIP",
    fullName: "Session Initiation Protocol",
    layer: 5,
    standard: "RFC 3261",
    tagline: "The protocol that sets up (and tears down) the world's calls.",
  },
  // ── Layer 6 ──────────────────────────────────────────────────────────
  {
    slug: "tls",
    name: "TLS",
    fullName: "Transport Layer Security",
    layer: 6,
    standard: "RFC 8446",
    tagline: "The encryption layer the modern internet stands on.",
  },
  {
    slug: "serialization",
    name: "Serialization",
    fullName: "Serialization Formats: JSON, Protocol Buffers, and Friends",
    layer: 6,
    standard: "RFC 8259 / protobuf",
    tagline: "How structured data becomes bytes — and why the choice matters.",
  },
  {
    slug: "compression",
    name: "Compression",
    fullName: "Compression on the Wire: DEFLATE, Brotli, Zstandard",
    layer: 6,
    standard: "RFC 1951 / 7932 / 8878",
    tagline: "Two old ideas — dictionaries and entropy codes — carrying the web.",
  },
  // ── Layer 7 ──────────────────────────────────────────────────────────
  {
    slug: "http",
    name: "HTTP",
    fullName: "Hypertext Transfer Protocol",
    layer: 7,
    standard: "RFC 9110–9114",
    tagline: "The application protocol that ate the application layer.",
  },
  {
    slug: "dns",
    name: "DNS",
    fullName: "The Domain Name System",
    layer: 7,
    standard: "RFC 1034/1035",
    tagline: "A distributed, delegated, cached database disguised as a phone book.",
  },
  {
    slug: "ssh",
    name: "SSH",
    fullName: "The Secure Shell Protocol",
    layer: 7,
    standard: "RFC 4251–4254",
    tagline: "The encrypted channel operations runs on — login, tunnels, git, and all.",
  },
  {
    slug: "smtp",
    name: "SMTP & Email",
    fullName: "SMTP and the Email Protocol Family",
    layer: 7,
    standard: "RFC 5321",
    tagline: "Store-and-forward federation that still moves the world's mail.",
  },
];

/** Lookup by slug. */
export function getProtocol(slug: string): ProtocolMeta | undefined {
  return PROTOCOLS.find((p) => p.slug === slug);
}

/** Protocols filed under a given layer, in registry order. */
export function protocolsForLayer(layer: number): ProtocolMeta[] {
  return PROTOCOLS.filter((p) => p.layer === layer);
}
