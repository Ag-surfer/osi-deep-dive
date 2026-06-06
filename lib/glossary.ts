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
    def: "Carrying many conversations over one connection, distinguished by port numbers.",
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
];
