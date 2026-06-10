/** Glossary of networking terms, tagged by the layer they most relate to (0 = cross-cutting). */
export interface GlossaryEntry {
  term: string;
  layer: number; // 1–7, or 0 for cross-cutting
  def: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "ACK",
    layer: 4,
    def: "Acknowledgment — a TCP signal confirming receipt of data up to a given sequence number.",
  },
  {
    term: "ARP",
    layer: 2,
    def: "Address Resolution Protocol — maps a known IP address to its MAC address on the local link.",
  },
  {
    term: "AIMD",
    layer: 4,
    def: "Additive Increase, Multiplicative Decrease — TCP's congestion-window strategy: grow slowly, halve on loss.",
  },
  {
    term: "Bandwidth-Delay Product",
    layer: 4,
    def: "Bandwidth × round-trip time — the amount of data that must be in flight to keep a link full.",
  },
  {
    term: "BGP",
    layer: 3,
    def: "Border Gateway Protocol — the path-vector protocol that routes between autonomous systems on the internet.",
  },
  {
    term: "Broadcast domain",
    layer: 2,
    def: "The set of devices that receive one another's broadcast frames; bounded by routers (and VLANs).",
  },
  {
    term: "CIDR",
    layer: 3,
    def: "Classless Inter-Domain Routing — arbitrary-length network prefixes (e.g. /26) enabling flexible allocation and route aggregation.",
  },
  {
    term: "Collision domain",
    layer: 1,
    def: "A network segment where simultaneous transmissions can collide; switches give each port its own.",
  },
  {
    term: "CSMA/CD",
    layer: 2,
    def: "Carrier Sense Multiple Access with Collision Detection — classic Ethernet's shared-media arbitration.",
  },
  {
    term: "Datagram",
    layer: 4,
    def: "A UDP PDU (also used generally for connectionless packets): a self-contained unit with no delivery guarantee.",
  },
  {
    term: "DNS",
    layer: 7,
    def: "Domain Name System — resolves human-readable names to IP addresses.",
  },
  {
    term: "Encapsulation",
    layer: 0,
    def: "Wrapping a layer's data in the header (and trailer) of the layer below as it descends the stack.",
  },
  {
    term: "EtherType",
    layer: 2,
    def: "Field in an Ethernet frame naming the upper-layer protocol (0x0800 = IPv4, 0x0806 = ARP).",
  },
  {
    term: "FCS",
    layer: 2,
    def: "Frame Check Sequence — a CRC-32 trailer used to detect (not correct) corruption in a frame.",
  },
  {
    term: "Flow control",
    layer: 4,
    def: "Preventing a fast sender from overrunning a slow receiver, via TCP's advertised window.",
  },
  {
    term: "Congestion control",
    layer: 4,
    def: "Preventing senders from overwhelming the network, via TCP's congestion window (slow start, AIMD).",
  },
  {
    term: "Fragmentation",
    layer: 3,
    def: "Splitting a packet too large for a link's MTU into smaller pieces for reassembly at the destination.",
  },
  {
    term: "Frame",
    layer: 2,
    def: "The Data Link layer PDU — a packet wrapped with a MAC header and FCS trailer.",
  },
  {
    term: "HTTP",
    layer: 7,
    def: "HyperText Transfer Protocol — the stateless request/response protocol of the web.",
  },
  {
    term: "ICMP",
    layer: 3,
    def: "Internet Control Message Protocol — carries diagnostics and errors (ping, traceroute, unreachable).",
  },
  {
    term: "IP address",
    layer: 3,
    def: "A hierarchical logical address (32-bit IPv4 / 128-bit IPv6) identifying a host's network location.",
  },
  {
    term: "Longest-prefix match",
    layer: 3,
    def: "The rule that, among matching routes, the most specific (longest) prefix wins.",
  },
  {
    term: "MAC address",
    layer: 2,
    def: "A flat 48-bit hardware address identifying a NIC on a local link.",
  },
  {
    term: "MTU",
    layer: 3,
    def: "Maximum Transmission Unit — the largest payload a link can carry in one frame (1500 bytes on Ethernet).",
  },
  {
    term: "Multiplexing",
    layer: 4,
    def: "Sharing one resource among many conversations — ports multiplex processes over one host; FDM/TDM share a physical medium; HTTP/2 multiplexes streams over one connection.",
  },
  {
    term: "NAT",
    layer: 3,
    def: "Network Address Translation — rewriting addresses so many private hosts share one public IP.",
  },
  { term: "Packet", layer: 3, def: "The Network layer PDU — a segment wrapped with an IP header." },
  {
    term: "PDU",
    layer: 0,
    def: "Protocol Data Unit — the named unit of data at a layer (bit, frame, packet, segment, data).",
  },
  {
    term: "Port",
    layer: 4,
    def: "A 16-bit number identifying a specific process/service on a host (80, 443, 22…).",
  },
  {
    term: "Routing",
    layer: 3,
    def: "The control-plane process of computing paths and building forwarding tables.",
  },
  { term: "Segment", layer: 4, def: "The TCP PDU — application data wrapped with a TCP header." },
  {
    term: "Socket",
    layer: 4,
    def: "An endpoint identified by IP + port; a connection is the 4-tuple of two sockets.",
  },
  {
    term: "STP",
    layer: 2,
    def: "Spanning Tree Protocol — prevents switching loops by disabling redundant links.",
  },
  {
    term: "Subnet",
    layer: 3,
    def: "A subdivision of an IP network defined by a longer prefix, with its own broadcast address.",
  },
  {
    term: "TCP",
    layer: 4,
    def: "Transmission Control Protocol — reliable, ordered, congestion-controlled byte streams.",
  },
  {
    term: "TLS",
    layer: 6,
    def: "Transport Layer Security — encrypts and authenticates data; the 'S' in HTTPS.",
  },
  {
    term: "TTL",
    layer: 3,
    def: "Time To Live — a hop counter decremented by each router; at 0 the packet is dropped (loop prevention).",
  },
  {
    term: "UDP",
    layer: 4,
    def: "User Datagram Protocol — a thin, connectionless, best-effort transport.",
  },
  {
    term: "VLAN",
    layer: 2,
    def: "Virtual LAN — logically segmenting one switch into isolated broadcast domains via 802.1Q tags.",
  },
  {
    term: "Window scaling",
    layer: 4,
    def: "A TCP option multiplying the 16-bit window so throughput can fill high bandwidth-delay paths.",
  },
  {
    term: "QAM",
    layer: 1,
    def: "Quadrature Amplitude Modulation — encoding several bits per symbol as amplitude+phase constellation points; denser constellations need higher SNR.",
  },
  {
    term: "OFDM",
    layer: 1,
    def: "Orthogonal Frequency-Division Multiplexing — splitting a channel into many slow parallel subcarriers (Wi-Fi, LTE/5G); resists multipath and narrowband interference.",
  },
  {
    term: "CRC",
    layer: 2,
    def: "Cyclic Redundancy Check — polynomial-division error detection; a 32-bit CRC catches all bursts up to 32 bits. Ethernet's FCS is a CRC-32.",
  },
  {
    term: "CSMA/CA",
    layer: 2,
    def: "Collision Avoidance — Wi-Fi's medium access: random backoff before transmitting plus link-layer ACKs, since radios can't detect collisions while sending.",
  },
  {
    term: "Hidden terminal",
    layer: 2,
    def: "Two wireless stations out of each other's range colliding at a common receiver; mitigated by RTS/CTS channel reservation.",
  },
  {
    term: "Link-state routing",
    layer: 3,
    def: "Each router floods its neighbor/cost map to all others, then runs Dijkstra over the full topology (OSPF, IS-IS).",
  },
  {
    term: "Distance-vector routing",
    layer: 3,
    def: "Each router shares only its distance table with neighbors (Bellman-Ford); simple but prone to count-to-infinity (RIP).",
  },
  {
    term: "Count-to-infinity",
    layer: 3,
    def: "Distance-vector failure where two routers ratchet a dead route's metric upward by learning from each other; mitigated by split horizon and a max metric.",
  },
  {
    term: "SACK",
    layer: 4,
    def: "Selective Acknowledgment — TCP option reporting exactly which non-contiguous byte ranges arrived, enabling selective retransmission.",
  },
  {
    term: "RTO",
    layer: 4,
    def: "Retransmission Timeout — SRTT + 4·RTTVAR, continuously estimated; doubled on each successive timeout (exponential backoff).",
  },
  {
    term: "CUBIC",
    layer: 4,
    def: "Loss-based congestion control growing the window on a cubic curve in time (not ACK rate); the Linux default since 2006.",
  },
  {
    term: "BBR",
    layer: 4,
    def: "Model-based congestion control pacing at the measured bottleneck bandwidth with ~1 BDP in flight — keeps queues short, avoiding bufferbloat.",
  },
  {
    term: "MIME",
    layer: 6,
    def: "Multipurpose Internet Mail Extensions — labels and encodes typed content (Content-Type, Base64) so binary data survives 7-bit text protocols.",
  },
  {
    term: "MX record",
    layer: 7,
    def: "DNS record answering 'who accepts mail for this domain?' — the indirection that routes SMTP delivery.",
  },
  {
    term: "Head-of-line blocking",
    layer: 0,
    def: "One stalled item holding up everything queued behind it — HTTP/1.1's ordered responses, or one lost TCP segment stalling all HTTP/2 streams.",
  },
  {
    term: "SSID",
    layer: 2,
    def: "Service Set Identifier — the human-readable Wi-Fi network name; many access points can share one SSID.",
  },
  {
    term: "BSSID",
    layer: 2,
    def: "The MAC address identifying one access point's radio — the machine-level identity behind an SSID.",
  },
  {
    term: "ESS",
    layer: 2,
    def: "Extended Service Set — multiple access points sharing an SSID over a (usually wired) distribution system; what a station roams across.",
  },
  {
    term: "SAE",
    layer: 2,
    def: "Simultaneous Authentication of Equals — WPA3's password-authenticated key exchange; every password guess needs a live exchange, killing offline cracking.",
  },
  {
    term: "OFDMA",
    layer: 1,
    def: "Orthogonal Frequency-Division Multiple Access — Wi-Fi 6/cellular technique scheduling different users onto subsets of a channel's subcarriers simultaneously.",
  },
  {
    term: "Handover",
    layer: 2,
    def: "Cellular's network-orchestrated move between base stations mid-session — the scheduled counterpart of Wi-Fi's client-driven roaming.",
  },
];
