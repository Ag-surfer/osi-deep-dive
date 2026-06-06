/**
 * The OSI layer registry — the single source of truth for the whole site.
 * Drives the sidebar nav, the home stack diagram, prev/next navigation, and
 * `generateStaticParams` for the dynamic layer route. Per-page deep content
 * lives in `content/layers/<slug>.mdx`; this file holds the structured metadata.
 */

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
