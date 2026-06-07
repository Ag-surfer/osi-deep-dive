/**
 * The OSI layer registry — the single source of truth for the whole site.
 * Drives the sidebar nav, the home stack diagram, prev/next navigation, and
 * `generateStaticParams` for the dynamic layer route. Per-page deep content
 * lives in `content/layers/<slug>.mdx`; this file holds the structured metadata.
 */

/**
 * A deep-dive sub-topic that lives *under* a layer — e.g. the OSPF page under
 * the Network layer. Content lives in `content/layers/<layerSlug>/<slug>.mdx`.
 * Every topic listed here MUST have a matching MDX file: the nested route uses
 * `dynamicParams = false`, so a missing file fails the static-export build.
 */
export interface TopicMeta {
  /** URL slug under the layer, e.g. "ospf" → /layers/network/ospf/. */
  slug: string;
  /** Display title, e.g. "OSPF". */
  title: string;
  /** One-line essence, shown on the topic card and hero. */
  tagline: string;
  /** 1–2 sentence summary for cards, the hero, and page metadata. */
  summary: string;
  /** Grouping label for the topic index, e.g. "Routing protocols". */
  category: string;
}

export interface LayerMeta {
  /** Layer number, 1 (Physical) … 7 (Application). */
  number: number;
  /** URL slug, e.g. "network". */
  slug: string;
  /** Display name, e.g. "Network". */
  name: string;
  /** CSS custom-property accent color token, e.g. "var(--color-layer-3)". */
  color: string;
  /** Protocol Data Unit at this layer, e.g. "Packet". */
  pdu: string;
  /** Primary addressing scheme, e.g. "IP address". */
  addressing: string;
  /** One-line essence of the layer. */
  tagline: string;
  /** 2–3 sentence summary shown on cards and the at-a-glance box. */
  summary: string;
  /** Representative protocols/standards. */
  protocols: string[];
  /** Representative real-world devices / where it lives. */
  devices: string[];
  /** Optional deep-dive sub-topics, rendered as sub-pages and nested nav. */
  topics?: TopicMeta[];
}

export const LAYERS: LayerMeta[] = [
  {
    number: 1,
    slug: "physical",
    name: "Physical",
    color: "var(--color-layer-1)",
    pdu: "Bit / Symbol",
    addressing: "None (raw signaling)",
    tagline: "Moving raw bits across a physical medium.",
    summary:
      "The Physical layer transmits raw, unstructured bits over a medium — copper, fiber, or radio. It defines voltages, light pulses, RF modulation, connectors, pinouts, data rates, and the line coding that turns 1s and 0s into signals on the wire.",
    protocols: [
      "Ethernet PHY (1000BASE-T)",
      "DSL",
      "USB (PHY)",
      "Wi-Fi PHY (802.11)",
      "SONET/DWDM",
    ],
    devices: ["Cables & connectors", "Hubs", "Repeaters", "Transceivers (SFP)", "Network media"],
    topics: [
      {
        slug: "signal-encoding",
        title: "Signal encoding",
        tagline: "Turning bits into self-clocking signals on the wire.",
        summary:
          "Line coding — NRZ, NRZI, Manchester, and the block codes (4B/5B, 8B/10B, 64B/66B) — and why clock recovery and DC balance dictate the choice, with an interactive waveform builder comparing the schemes bit by bit.",
        category: "From bits to signals",
      },
      {
        slug: "modulation-capacity",
        title: "Modulation & channel capacity",
        tagline: "QAM, OFDM, and the Nyquist / Shannon limits on every link.",
        summary:
          "Passband modulation (ASK/FSK/PSK, QAM, OFDM), the difference between baud and bit rate, and the two theorems that bound every channel — Nyquist's symbol-rate ceiling and Shannon's capacity from bandwidth and SNR.",
        category: "From bits to signals",
      },
      {
        slug: "media-multiplexing",
        title: "Media & multiplexing",
        tagline: "Copper, fiber, and radio — and sharing them.",
        summary:
          "The physical media (twisted pair, coax, single/multi-mode fiber, wireless) and their limits (attenuation, dispersion, noise), plus how many signals share one medium: TDM, FDM, and WDM/DWDM.",
        category: "The medium itself",
      },
      {
        slug: "clocking-sync",
        title: "Clocking & signal integrity",
        tagline: "Recovering the clock and reading the eye.",
        summary:
          "How a receiver recovers the bit clock (PLL/CDR), jitter and wander, plesiochronous vs. synchronous timing (SONET/SDH, SyncE, PTP), and the eye diagram that measures a link's noise and timing margins — with an interactive eye-closure walkthrough.",
        category: "Synchronization & integrity",
      },
      {
        slug: "cabling-connectors",
        title: "Cabling, connectors & PoE",
        tagline: "The physical plant: copper, fiber optics, and power.",
        summary:
          "Structured cabling (TIA-568), twisted-pair categories and pinouts, fiber connectors and transceivers (SFP/QSFP, DAC vs. AOC), and Power over Ethernet (802.3af/at/bt) — the practical hardware of the Physical layer.",
        category: "The physical plant",
      },
      {
        slug: "wireless-phy",
        title: "Wireless PHY",
        tagline: "Spread spectrum, OFDMA, and MIMO over the air.",
        summary:
          "Radio fundamentals and bands, spread spectrum (DSSS/FHSS), OFDM and OFDMA, MIMO and beamforming, modulation-and-coding sets, and the fading/multipath impairments that make the air the hardest medium — across the Wi-Fi and cellular generations.",
        category: "Over the air",
      },
    ],
  },
  {
    number: 2,
    slug: "data-link",
    name: "Data Link",
    color: "var(--color-layer-2)",
    pdu: "Frame",
    addressing: "MAC address",
    tagline: "Node-to-node delivery on a single link, with framing and error detection.",
    summary:
      "The Data Link layer groups bits into frames and delivers them between directly connected nodes on the same network segment. It handles MAC addressing, media access control, error detection (FCS/CRC), and on shared media, arbitration of who transmits when.",
    protocols: ["Ethernet (802.3)", "Wi-Fi MAC (802.11)", "PPP", "VLAN (802.1Q)", "ARP*"],
    devices: ["Switches", "Bridges", "NICs", "Wireless access points"],
    topics: [
      {
        slug: "spanning-tree",
        title: "Spanning Tree Protocol",
        tagline: "Electing a root and pruning a looped switch fabric into a tree.",
        summary:
          "Why a Layer-2 loop is catastrophic, how STP elects a root bridge and computes each switch's root port, port roles and states, and how RSTP converges in milliseconds — with an interactive root-election and tree-building walkthrough.",
        category: "Switching & loop-freedom",
      },
      {
        slug: "error-detection",
        title: "Error detection: CRC & checksums",
        tagline: "Catching corrupted frames with polynomial division.",
        summary:
          "How the Frame Check Sequence works: the CRC polynomial-division algorithm and why it catches burst errors, the Internet checksum's trade-offs, and a note on forward error correction (Hamming) — with an interactive CRC long-division stepper.",
        category: "Reliability on a link",
      },
      {
        slug: "arq-framing",
        title: "ARQ & framing",
        tagline: "Turning a bit pipe into delimited, reliably-delivered frames.",
        summary:
          "Framing (byte/bit stuffing), and the Automatic Repeat reQuest family — stop-and-wait, Go-Back-N, and Selective Repeat sliding windows — that recover lost or corrupted frames, and how link efficiency depends on window size.",
        category: "Reliability on a link",
      },
    ],
  },
  {
    number: 3,
    slug: "network",
    name: "Network",
    color: "var(--color-layer-3)",
    pdu: "Packet",
    addressing: "IP address",
    tagline:
      "End-to-end delivery across interconnected networks via logical addressing and routing.",
    summary:
      "The Network layer moves packets across multiple networks from source to ultimate destination. It provides logical (IP) addressing, routing between networks, fragmentation, and best-effort delivery — the layer that makes a global internetwork possible.",
    protocols: ["IPv4", "IPv6", "ICMP", "OSPF", "BGP", "IPsec"],
    devices: ["Routers", "Layer-3 switches", "Firewalls"],
    topics: [
      {
        slug: "routing-concepts",
        title: "Routing concepts",
        tagline: "The mental model under every routing protocol.",
        summary:
          "Distance-vector vs. link-state vs. path-vector, metrics and administrative distance, convergence, redistribution, and ECMP — the cross-cutting ideas every protocol below specializes.",
        category: "Foundations",
      },
      {
        slug: "ospf",
        title: "OSPF",
        tagline: "Link-state IGP: flood the map, run SPF, build the tree.",
        summary:
          "Open Shortest Path First — the dominant interior gateway protocol. LSA types, areas and the ABR/ASBR hierarchy, DR/BDR election, the SPF (Dijkstra) computation, and stub/NSSA area types, with an interactive shortest-path walkthrough.",
        category: "Routing protocols",
      },
      {
        slug: "bgp",
        title: "BGP",
        tagline: "The internet's path-vector protocol — policy, not distance.",
        summary:
          "Border Gateway Protocol glues the autonomous systems of the internet together. eBGP vs. iBGP, path attributes, the best-path decision process, route reflectors and confederations, communities, and origin security (RPKI) — with an interactive best-path walkthrough.",
        category: "Routing protocols",
      },
    ],
  },
  {
    number: 4,
    slug: "transport",
    name: "Transport",
    color: "var(--color-layer-4)",
    pdu: "Segment (TCP) / Datagram (UDP)",
    addressing: "Port number",
    tagline: "Process-to-process delivery, reliability, and flow/congestion control.",
    summary:
      "The Transport layer delivers data between specific processes (via ports) on hosts. TCP adds connection setup, reliability, ordering, flow control, and congestion control; UDP offers a thin, fast, connectionless alternative.",
    protocols: ["TCP", "UDP", "QUIC", "SCTP"],
    devices: ["End hosts (OS network stack)", "Load balancers (L4)"],
    topics: [
      {
        slug: "tcp",
        title: "TCP internals",
        tagline: "How a reliable, ordered byte stream is built on lossy packets.",
        summary:
          "The connection lifecycle and state machine, sequence/acknowledgment logic, retransmission and RTO estimation, SACK, the sliding window and window scaling, TIME_WAIT, Nagle and delayed-ACK, and PMTUD/MSS.",
        category: "Transport protocols",
      },
      {
        slug: "congestion-control",
        title: "Congestion control",
        tagline: "Slow start, AIMD, and the sawtooth — keeping the network from collapsing.",
        summary:
          "Why congestion control exists, slow start vs. congestion avoidance, fast retransmit/recovery, the AIMD sawtooth, and the algorithm families (Reno, NewReno, CUBIC, BBR) plus ECN — with an interactive congestion-window plot.",
        category: "Transport protocols",
      },
      {
        slug: "tls",
        title: "TLS",
        tagline: "Authenticated, confidential channels — the handshake and the record protocol.",
        summary:
          "Where TLS sits in the stack, the 1.2 vs. 1.3 handshakes, ephemeral key exchange and forward secrecy, certificates and the PKI trust chain, AEAD record protection, session resumption, and 0-RTT with its replay trade-off.",
        category: "Security & modern transport",
      },
      {
        slug: "quic",
        title: "QUIC & HTTP/3",
        tagline: "A reliable, encrypted, multiplexed transport rebuilt over UDP.",
        summary:
          "Why QUIC moved transport into user space over UDP: stream multiplexing without head-of-line blocking, the merged crypto+transport handshake (1-RTT and 0-RTT), connection IDs and migration, loss recovery, and how HTTP/3 rides on top.",
        category: "Security & modern transport",
      },
    ],
  },
  {
    number: 5,
    slug: "session",
    name: "Session",
    color: "var(--color-layer-5)",
    pdu: "Data",
    addressing: "Session/Port context",
    tagline: "Establishing, managing, and tearing down dialogues between applications.",
    summary:
      "The Session layer organizes communication into sessions — establishing, synchronizing (checkpoints), and gracefully terminating dialogues. In the modern TCP/IP world its responsibilities are largely absorbed by the application and transport layers and by libraries (e.g., TLS session resumption, RPC frameworks).",
    protocols: ["RPC", "NetBIOS", "PPTP", "TLS session layer*", "SIP*"],
    devices: ["End hosts", "Session-aware gateways"],
    topics: [
      {
        slug: "sessions-rpc",
        title: "Sessions & RPC",
        tagline: "Establishing dialogues, and making a remote call look local.",
        summary:
          "What a session is (establish, synchronize/checkpoint, tear down), where the OSI session layer lives in modern stacks (TLS resumption, QUIC connections, WebSocket), and Remote Procedure Call — the abstraction (gRPC) that makes a network request look like a function call.",
        category: "Managing the dialogue",
      },
      {
        slug: "authentication-kerberos",
        title: "Authentication & Kerberos",
        tagline: "Proving identity with tickets — no password on the wire.",
        summary:
          "Authentication vs. authorization, the shared-secret problem, and how Kerberos uses a trusted Key Distribution Center and time-limited tickets to give single sign-on without sending passwords — with an interactive ticket-exchange walkthrough.",
        category: "Establishing trust",
      },
      {
        slug: "tokens-oauth",
        title: "Tokens, OAuth & sessions",
        tagline: "Delegated access and stateless sessions for the web.",
        summary:
          "How modern web sessions work: session cookies vs. bearer tokens, OAuth 2.0 delegated authorization and the authorization-code flow, OpenID Connect for identity, JWTs, and the trade-offs of stateful vs. stateless sessions.",
        category: "Establishing trust",
      },
    ],
  },
  {
    number: 6,
    slug: "presentation",
    name: "Presentation",
    color: "var(--color-layer-6)",
    pdu: "Data",
    addressing: "None",
    tagline: "Translating, encoding, encrypting, and compressing data for the application.",
    summary:
      "The Presentation layer is the translator: it converts between the application's data structures and a common on-the-wire representation — character encoding, serialization, compression, and encryption. In practice these jobs are handled by formats and libraries (TLS, JPEG, JSON, ASN.1).",
    protocols: ["TLS/SSL*", "ASCII/Unicode", "JPEG/PNG", "ASN.1", "JSON/XML"],
    devices: ["End hosts", "TLS-terminating proxies"],
    topics: [
      {
        slug: "compression",
        title: "Compression",
        tagline: "Squeezing redundancy out of data — entropy and dictionary coding.",
        summary:
          "Why compression works (redundancy and entropy), Huffman entropy coding, dictionary methods (LZ77/LZ78/LZW) and DEFLATE, and the lossless-vs-lossy divide (JPEG/H.264) — with an interactive Huffman tree builder.",
        category: "Encoding the payload",
      },
      {
        slug: "serialization",
        title: "Serialization & data formats",
        tagline: "Turning in-memory structures into bytes on the wire.",
        summary:
          "How structured data is encoded for transit: text formats (JSON, XML) vs. binary (ASN.1 BER/DER, Protocol Buffers, MessagePack, Avro), TLV and varint encoding, schemas, and the endianness and versioning pitfalls.",
        category: "Encoding the payload",
      },
      {
        slug: "character-encoding",
        title: "Character encoding",
        tagline: "From bytes to text: Unicode and UTF-8.",
        summary:
          "Code points vs. encodings, why ASCII wasn't enough, and how UTF-8's variable-length, self-synchronizing, ASCII-compatible design won — plus UTF-16, normalization, and the mojibake failures of getting it wrong.",
        category: "Encoding the payload",
      },
    ],
  },
  {
    number: 7,
    slug: "application",
    name: "Application",
    color: "var(--color-layer-7)",
    pdu: "Data / Message",
    addressing: "URL / hostname (app-defined)",
    tagline: "The interface where applications access the network.",
    summary:
      "The Application layer is where network-aware programs meet the network — the protocols users and apps interact with directly. It defines message formats and exchange rules for concrete services like the web, email, name resolution, and file transfer.",
    protocols: ["HTTP/HTTPS", "DNS", "SMTP", "DHCP", "SSH", "FTP"],
    devices: ["Servers & clients", "Application gateways (L7)", "Load balancers (L7)"],
    topics: [
      {
        slug: "dns",
        title: "DNS",
        tagline: "The internet's distributed directory — names to addresses.",
        summary:
          "The hierarchical name system: recursive vs. iterative resolution, root/TLD/authoritative servers, caching and TTLs, the common record types, and DNSSEC — with an interactive root-to-answer resolution walkthrough.",
        category: "Naming & the web",
      },
      {
        slug: "http",
        title: "HTTP",
        tagline: "The web's request/response protocol, from 1.1 to 3.",
        summary:
          "Methods, status codes, and headers; statelessness, cookies, and caching; and the evolution from HTTP/1.1's head-of-line blocking through HTTP/2 multiplexing to HTTP/3 over QUIC.",
        category: "Naming & the web",
      },
      {
        slug: "dhcp",
        title: "DHCP",
        tagline: "How a host bootstraps onto a network automatically.",
        summary:
          "The DORA exchange (Discover, Offer, Request, Acknowledge) that hands a booting host an IP address, mask, gateway, and DNS servers — plus leases, relay agents, and the security weaknesses of an unauthenticated broadcast protocol.",
        category: "Bootstrapping & messaging",
      },
      {
        slug: "email",
        title: "Email (SMTP)",
        tagline: "Store-and-forward messaging, and proving who sent it.",
        summary:
          "The mail pipeline — submission, SMTP transfer between servers via MX records, and retrieval with IMAP/POP — plus the anti-spoofing trio that secures it: SPF, DKIM, and DMARC.",
        category: "Bootstrapping & messaging",
      },
    ],
  },
];

/** Lookup a layer by slug. */
export function getLayer(slug: string): LayerMeta | undefined {
  return LAYERS.find((l) => l.slug === slug);
}

/** Previous (lower-numbered) layer, or undefined at Layer 1. */
export function prevLayer(slug: string): LayerMeta | undefined {
  const l = getLayer(slug);
  return l ? LAYERS.find((x) => x.number === l.number - 1) : undefined;
}

/** Next (higher-numbered) layer, or undefined at Layer 7. */
export function nextLayer(slug: string): LayerMeta | undefined {
  const l = getLayer(slug);
  return l ? LAYERS.find((x) => x.number === l.number + 1) : undefined;
}

/** Layers ordered top-of-stack (7) → bottom (1), as drawn in a stack diagram. */
export const LAYERS_TOP_DOWN: LayerMeta[] = [...LAYERS].reverse();

/** A topic together with the layer it belongs to — convenient for flat iteration. */
export interface TopicWithLayer {
  layer: LayerMeta;
  topic: TopicMeta;
}

/** Every (layer, topic) pair, in layer-then-declaration order. Drives
 *  `generateStaticParams` for the nested route and the sitemap. */
export const ALL_TOPICS: TopicWithLayer[] = LAYERS.flatMap((layer) =>
  (layer.topics ?? []).map((topic) => ({ layer, topic })),
);

/** Resolve a sub-topic by its layer slug and topic slug. */
export function getTopic(layerSlug: string, topicSlug: string): TopicMeta | undefined {
  return getLayer(layerSlug)?.topics?.find((t) => t.slug === topicSlug);
}

/** Previous topic within the same layer (declaration order), or undefined at the first. */
export function prevTopic(layerSlug: string, topicSlug: string): TopicMeta | undefined {
  const topics = getLayer(layerSlug)?.topics ?? [];
  const i = topics.findIndex((t) => t.slug === topicSlug);
  return i > 0 ? topics[i - 1] : undefined;
}

/** Next topic within the same layer (declaration order), or undefined at the last. */
export function nextTopic(layerSlug: string, topicSlug: string): TopicMeta | undefined {
  const topics = getLayer(layerSlug)?.topics ?? [];
  const i = topics.findIndex((t) => t.slug === topicSlug);
  return i >= 0 && i < topics.length - 1 ? topics[i + 1] : undefined;
}
