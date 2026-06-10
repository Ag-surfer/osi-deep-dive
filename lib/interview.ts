/**
 * The interview canon: the questions actually asked, organized by layer
 * (0 = cross-layer), each with a model answer, the follow-ups interviewers
 * use to probe deeper, and links into this site's deep content.
 */

export interface InterviewQuestion {
  /** URL-safe slug. */
  id: string;
  /** 0 = cross-layer, 1–7 = the layer it primarily tests. */
  layer: number;
  question: string;
  /** The answer a strong candidate gives — concise, structured, precise. */
  answer: string;
  /** Where interviewers take it next. */
  followUps: string[];
  /** Site-internal links for deeper study (must be real routes). */
  links: { label: string; href: string }[];
}

/** One step of the canonical "you type a URL and press Enter" walkthrough. */
export interface UrlStep {
  title: string;
  /** Layers doing the work in this step. */
  layers: number[];
  text: string;
  href: string;
}

export const URL_JOURNEY: UrlStep[] = [
  {
    title: "The browser parses the URL and checks its caches",
    layers: [7],
    text: "Before any network activity: the browser splits the URL into scheme, host, and path, then checks its own caches — a cached page may end the story here, and a cached DNS answer skips the next step. Interviewers reward candidates who start with 'maybe nothing happens on the network at all.'",
    href: "/layers/application/",
  },
  {
    title: "DNS turns the name into an address",
    layers: [7],
    text: "The stub resolver asks its recursive resolver, which walks root → TLD → authoritative servers (unless cached at any of those hops) and returns the IP. Usually over UDP port 53, falling back to TCP for large answers; increasingly inside DoH/DoT encryption.",
    href: "/layers/application/",
  },
  {
    title: "The routing decision: local or remote?",
    layers: [3],
    text: "The OS ANDs the destination IP with its subnet mask. It's almost never local, so the packet's next hop is the default gateway — the destination IP stays the server's, but the frame must be addressed to the router's MAC.",
    href: "/layers/network/",
  },
  {
    title: "ARP finds the gateway's MAC (if not cached)",
    layers: [2, 3],
    text: '"Who has 192.168.1.1?" broadcast on the LAN; the router answers with its MAC. This is the glue step between logical and link addressing — and the step people forget under interview pressure.',
    href: "/layers/data-link/",
  },
  {
    title: "TCP's three-way handshake",
    layers: [4],
    text: "SYN → SYN-ACK → ACK synchronizes both sides' sequence numbers and negotiates options (MSS, window scaling, SACK). One round trip before a byte of payload can flow.",
    href: "/layers/transport/",
  },
  {
    title: "TLS negotiates identity and keys",
    layers: [5, 6],
    text: "ClientHello and ServerHello agree on ciphers, exchange key shares, and authenticate the server's certificate — one more round trip in TLS 1.3 (zero on resumption with 0-RTT). From here every byte is encrypted.",
    href: "/layers/presentation/",
  },
  {
    title: "The HTTP request finally goes out",
    layers: [7],
    text: "GET /path with Host, cookies, and content-negotiation headers — the 74 readable bytes everything below exists to deliver. On HTTP/2 or 3 it's a stream among many on one connection.",
    href: "/anatomy/",
  },
  {
    title: "Every hop in between does its job",
    layers: [1, 2, 3],
    text: "Each router decrements TTL, recomputes the IP checksum, and re-frames the packet for the next link — new MAC addresses every hop, same IPs end-to-end (until NAT rewrites the private source at the home router). Switches forward frames by MAC; fibers and radios carry the symbols.",
    href: "/journey/",
  },
  {
    title: "The response renders — and most of it repeats",
    layers: [7],
    text: "The 200 OK arrives carrying HTML, whose parsing triggers dozens more fetches (CSS, JS, images) — mostly reusing the warm connection. A complete answer mentions caching headers, and that HTTP/3 would have folded the TCP and TLS steps together.",
    href: "/layers/application/",
  },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ── Cross-layer ─────────────────────────────────────────────────────
  {
    id: "why-osi",
    layer: 0,
    question: "TCP/IP won — so why does every interview still ask about the OSI model?",
    answer:
      "Because OSI survives as a vocabulary, not a protocol suite. Saying 'that's a Layer 2 problem' instantly communicates scope: which addresses are involved, which devices can see it, which tools interrogate it. Real stacks are TCP/IP's four layers (five, when textbooks split the link layer into data link + physical), with OSI's session and presentation duties absorbed by applications and libraries — but the seven-layer map is how engineers reason about where a failure or a feature lives.",
    followUps: [
      "Which OSI layers don't exist as distinct protocols in TCP/IP, and where did their jobs go?",
      "Give an example of a real technology that spans multiple layers.",
    ],
    links: [
      { label: "The full history: why TCP/IP won", href: "/models/" },
      { label: "The Session layer's honest story", href: "/layers/session/" },
      { label: "Where TLS sits", href: "/layers/presentation/" },
    ],
  },
  {
    id: "encapsulation",
    layer: 0,
    question: "Walk me through encapsulation: what wraps what when I send data?",
    answer:
      "Application data gets a transport header (ports, sequence numbers) making a segment; the segment gets an IP header (addresses, TTL) making a packet; the packet gets a link header and trailer (MACs, FCS) making a frame; the frame becomes signals on the medium. Each layer treats everything above as an opaque payload — and each hop unwraps only to Layer 3, then re-wraps Layer 2 fresh for the next link. Three demultiplexing keys reverse it on arrival: EtherType picks the L3 protocol, IP's Protocol field picks L4, and the port picks the process.",
    followUps: [
      "Which header fields change at every hop, and which never change?",
      "What's the total header overhead for one HTTP byte over TLS?",
    ],
    links: [
      { label: "See it byte-by-byte", href: "/anatomy/" },
      { label: "The packet's journey", href: "/journey/" },
    ],
  },
  {
    id: "hub-switch-router",
    layer: 0,
    question: "Hub vs switch vs router — what's actually different?",
    answer:
      "A hub is Layer 1: it blindly repeats bits to every port — one collision domain, obsolete. A switch is Layer 2: it learns MAC-to-port mappings and forwards frames only where they belong, giving every port its own collision domain while keeping one broadcast domain. A router is Layer 3: it connects different networks, makes forwarding decisions on IP prefixes, decrements TTL, and bounds the broadcast domain. The crisp version: hubs repeat bits, switches forward frames, routers route packets.",
    followUps: [
      "What does a Layer-3 switch do?",
      "Why does a switch flood a frame for an unknown destination MAC, and why is that safe?",
    ],
    links: [
      { label: "Switching and ARP", href: "/layers/data-link/" },
      { label: "Routing vs forwarding", href: "/layers/network/" },
    ],
  },
  // ── L1 ──────────────────────────────────────────────────────────────
  {
    id: "bandwidth-latency",
    layer: 1,
    question: "Bandwidth vs latency vs throughput — and which one makes pages feel slow?",
    answer:
      "Bandwidth is capacity (bits per second the link can carry); latency is delay (time for one bit to cross); throughput is what you actually achieve. Page-load feel is dominated by latency, not bandwidth: a cold HTTPS fetch costs ~4 round trips (DNS, TCP, TLS, HTTP) before the first content byte, so 400 ms of pure waiting on a 100 ms-RTT path — no amount of bandwidth fixes that. It's why HTTP/3 and 0-RTT exist, and why CDNs move content closer instead of just fatter pipes.",
    followUps: [
      "Why does throughput on a long fat pipe fall short of bandwidth (hint: BDP)?",
      "What's the theoretical limit on a channel's capacity?",
    ],
    links: [
      { label: "Nyquist & Shannon limits", href: "/layers/physical/" },
      { label: "Why the first byte takes so long", href: "/layers/application/" },
    ],
  },
  {
    id: "duplex-mismatch",
    layer: 1,
    question: "A link is up but mysteriously slow. What physical-layer cause do you check first?",
    answer:
      "Autonegotiation results. If one side is hard-coded full-duplex and the other autonegotiates, the negotiating side can't hear preferences and falls back to half-duplex — producing late collisions and miserable-but-working throughput. Also check negotiated speed: a damaged pair makes 1000BASE-T (which needs all four pairs) silently fall back to 100 Mb/s (which needs two). Both look like 'the network is slow' while every higher layer is healthy.",
    followUps: ["Why does gigabit need all four pairs?", "What do CRC error counters tell you?"],
    links: [{ label: "Autonegotiation and its traps", href: "/layers/physical/" }],
  },
  // ── L2 ──────────────────────────────────────────────────────────────
  {
    id: "mac-and-ip",
    layer: 2,
    question: "Why do we need both MAC addresses and IP addresses?",
    answer:
      "They answer different questions. A MAC address is flat — it says who a NIC is, with no structure to route on; it only works within one link. An IP address is hierarchical — network + host — so routers can aggregate millions of hosts behind one prefix and route globally. Mechanically: IPs are end-to-end and constant across the path; MACs are per-hop and rewritten at every router. You need the global, stable identity and the local, per-link delivery address — and ARP is the glue translating between them.",
    followUps: [
      "Could we route on MAC addresses if we had big enough tables? Why not really?",
      "What changes in IPv6 (hint: NDP replaces ARP)?",
    ],
    links: [
      { label: "MAC is flat, IP is hierarchical", href: "/layers/data-link/" },
      { label: "Logical addressing", href: "/layers/network/" },
    ],
  },
  {
    id: "arp-poisoning",
    layer: 2,
    question: "How does ARP work, and how is it attacked?",
    answer:
      "A host needing a MAC for a known IP broadcasts 'who has 192.0.2.5?' and trusts whatever reply comes back — ARP has zero authentication. An attacker exploits exactly that: send unsolicited (gratuitous) ARP replies claiming the gateway's IP maps to the attacker's MAC, and victims' caches are poisoned — their traffic now flows through the attacker, a classic on-LAN man-in-the-middle. Defenses: Dynamic ARP Inspection on switches (validates against DHCP snooping data), and encryption above (TLS) so intercepted traffic stays unreadable.",
    followUps: [
      "Why does ARP poisoning only work on the local network?",
      "How does DHCP snooping enable Dynamic ARP Inspection?",
    ],
    links: [{ label: "Switching and ARP", href: "/layers/data-link/" }],
  },
  {
    id: "switch-learning",
    layer: 2,
    question: "What does a switch do with a frame for a MAC it has never seen?",
    answer:
      "It floods the frame out every port except the one it arrived on — then learns the answer from the reply. Switches build their forwarding table passively: every arriving frame's source MAC is recorded against its ingress port. Flooding unknown destinations is safe because the right host answers (teaching the switch) and the wrong hosts discard frames not addressed to them. The dangerous case is loops: flooded and broadcast frames carry no TTL, so a physical loop multiplies them forever — which is why Spanning Tree blocks redundant links.",
    followUps: [
      "What is MAC flapping and what causes it?",
      "What happens when the CAM table fills up (MAC flooding attack)?",
    ],
    links: [{ label: "Switching and STP", href: "/layers/data-link/" }],
  },
  // ── L3 ──────────────────────────────────────────────────────────────
  {
    id: "router-decision",
    layer: 3,
    question: "How does a router decide where to send a packet?",
    answer:
      "Two separable mechanisms. Forwarding (data plane, per-packet): look up the destination IP in the forwarding table and pick the most specific matching prefix — longest-prefix match — then send out that interface. Routing (control plane, background): build the table by exchanging reachability with other routers — link-state protocols like OSPF flood the topology and run Dijkstra; BGP between organizations exchanges paths and applies policy. A strong answer keeps the planes distinct: routing builds the map, forwarding uses it billions of times a second.",
    followUps: [
      "Why does the most specific prefix win?",
      "Why doesn't BGP just pick the shortest path?",
    ],
    links: [{ label: "Routing vs forwarding + Dijkstra", href: "/layers/network/" }],
  },
  {
    id: "nat-interview",
    layer: 3,
    question: "Explain NAT. Why does it exist, and what does it break?",
    answer:
      "NAT lets a whole private network share one public IPv4 address: the router rewrites each outbound packet's private source IP (and port) to its own public address and keeps a translation table to reverse the mapping for replies. It exists because IPv4 ran out of addresses. It breaks the end-to-end principle: unsolicited inbound connections have no table entry and die, so peer-to-peer apps, VoIP, and game consoles need port forwarding or hole-punching (STUN/TURN). It also means the address your peer sees is not your address — and it's the accidental firewall most homes rely on.",
    followUps: [
      "Why is it really PAT, and which Layer 4 concept makes it work?",
      "Does IPv6 eliminate the need for NAT? Should it?",
    ],
    links: [{ label: "NAT with a worked example", href: "/layers/network/" }],
  },
  {
    id: "ttl-traceroute",
    layer: 3,
    question: "What is TTL for, and how does traceroute abuse it?",
    answer:
      "TTL exists to kill packets caught in routing loops: every router decrements it, and at zero the packet is dropped with an ICMP Time Exceeded sent back to the source. Traceroute weaponizes the error message: send packets with TTL=1, 2, 3…, and each hop that kills one reveals itself in its ICMP reply — mapping the path hop by hop with the loop-prevention mechanism. It's the classic example of reading a protocol's side effects as a diagnostic instrument.",
    followUps: [
      "Why do some hops show * * * in traceroute?",
      "Why must the IP checksum be recomputed every hop?",
    ],
    links: [{ label: "ICMP: the diagnostic voice", href: "/layers/network/" }],
  },
  // ── L4 ──────────────────────────────────────────────────────────────
  {
    id: "tcp-vs-udp",
    layer: 4,
    question: "TCP vs UDP — and when is UDP the right choice?",
    answer:
      "TCP gives you a reliable, ordered byte stream: handshake, sequence numbers, acknowledgments, retransmission, flow and congestion control — at the cost of setup latency and head-of-line blocking. UDP gives you ports and a checksum in 8 bytes; everything else is your problem. UDP wins when a late packet is worse than a lost one (live audio/video, gaming), when the exchange is one tiny round trip (DNS — a handshake would double the cost), or when you want to build smarter reliability yourself — which is exactly what QUIC does on top of UDP.",
    followUps: [
      "Why does DNS use UDP but zone transfers use TCP?",
      "Why did QUIC build on UDP instead of being a new IP protocol number?",
    ],
    links: [{ label: "TCP, UDP, and QUIC in depth", href: "/layers/transport/" }],
  },
  {
    id: "why-three-way",
    layer: 4,
    question: "Why is TCP's handshake three messages — why not two?",
    answer:
      "Because both sides must know that both directions work and both initial sequence numbers are agreed. SYN proves client→server; SYN-ACK proves server→client and acknowledges the client's sequence number; but at that point the server doesn't yet know its own SYN arrived — the final ACK closes that loop. With only two messages, a server could 'establish' connections for delayed duplicate SYNs wandering the network, holding state for ghosts. Three messages is the minimum for both sides to have their initial sequence numbers acknowledged.",
    followUps: [
      "What is a SYN flood and how do SYN cookies defuse it?",
      "Why does close take four messages instead of three?",
    ],
    links: [{ label: "The handshake and state machine", href: "/layers/transport/" }],
  },
  {
    id: "time-wait",
    layer: 4,
    question: "What is TIME_WAIT and why does it linger?",
    answer:
      "After actively closing a connection, TCP holds the socket in TIME_WAIT for two maximum segment lifetimes (2MSL). Two reasons: the final ACK of the close handshake might be lost — the peer would retransmit its FIN, and someone must be alive to answer; and old duplicate segments from this connection must die off before the same 4-tuple can be reused, or they could corrupt a new connection. It's correctness, not a bug — though busy proxies churning thousands of short connections must tune around the resulting port pressure.",
    followUps: [
      "Which side ends up in TIME_WAIT, and how do servers design around it?",
      "What does ephemeral port exhaustion look like in production?",
    ],
    links: [{ label: "TCP teardown and failure modes", href: "/layers/transport/" }],
  },
  {
    id: "flow-vs-congestion",
    layer: 4,
    question: "Flow control vs congestion control — what does each protect?",
    answer:
      "Flow control protects the receiver: the advertised window says 'I can buffer this much more', preventing a fast sender from overrunning a slow receiver. Congestion control protects the network: the sender maintains a separate congestion window, growing it cautiously (slow start, then AIMD) and shrinking on congestion signals, because routers in the middle can't say 'slow down' — their queues just overflow. Effective send rate is governed by the smaller of the two windows. Modern variants change the congestion signal: CUBIC still listens for loss; BBR models bandwidth and RTT directly to avoid bufferbloat.",
    followUps: [
      "What is bufferbloat and which design choice causes it?",
      "Walk me through slow start's growth pattern.",
    ],
    links: [{ label: "Congestion control's three generations", href: "/layers/transport/" }],
  },
  // ── L5 ──────────────────────────────────────────────────────────────
  {
    id: "scaling-logout",
    layer: 5,
    question:
      "You scaled a web app from one server to three, and users get randomly logged out. Why?",
    answer:
      "Session state lived in each server's local memory, and the load balancer spreads requests across all three — so a user's next request lands on a server that has never heard of them. Every fix answers the Session layer's core question, 'who remembers the conversation?': sticky sessions (the balancer pins each user to one server), a shared session store like Redis (servers become stateless), or signed tokens like JWTs (the client carries the state). This is the modern interview question that's secretly about OSI Layer 5.",
    followUps: [
      "What are the trade-offs of sticky sessions vs a shared store vs JWTs?",
      "How does TLS session resumption echo the same idea one layer down?",
    ],
    links: [{ label: "Where session logic lives today", href: "/layers/session/" }],
  },
  // ── L6 ──────────────────────────────────────────────────────────────
  {
    id: "tls-protects",
    layer: 6,
    question: "What does TLS actually protect — and what does it leave exposed?",
    answer:
      "TLS gives you confidentiality (encryption), integrity (tampering is detected), and server authentication (the certificate chain) for everything above the transport. What it doesn't hide: that you're talking to a given IP, packet sizes and timing (traffic analysis), and — unless ECH is in play — the hostname in the SNI of the handshake. DNS lookups also leak intent unless DoH/DoT is used. A precise answer also places it: TLS transforms the representation of application bytes without understanding them, which is why it maps to Layer 6 with session-layer aspects (handshake, resumption).",
    followUps: [
      "What does a certificate actually certify, and what's the chain of trust?",
      "Why did compression inside TLS have to die (CRIME)?",
    ],
    links: [
      { label: "TLS and the Presentation layer", href: "/layers/presentation/" },
      { label: "Compression side-channels", href: "/layers/presentation/" },
    ],
  },
  // ── L7 ──────────────────────────────────────────────────────────────
  {
    id: "dns-udp",
    layer: 7,
    question: "Why does DNS use UDP — and when does it switch to TCP?",
    answer:
      "A DNS lookup is one tiny question and one tiny answer; TCP would spend a whole handshake first — doubling the round trips — to move ~100 bytes. UDP makes it a single exchange, with the resolver handling retries itself. DNS falls back to TCP when answers outgrow a safe UDP size (truncation bit set — large records, DNSSEC) and uses TCP for zone transfers, which move whole databases. Modern DNS also rides DoT/DoH (TLS/HTTPS) for privacy — accepting the connection cost to encrypt the query.",
    followUps: [
      "What does the TC bit do?",
      "Walk through a full recursive resolution from the root.",
    ],
    links: [{ label: "DNS resolution in depth", href: "/layers/application/" }],
  },
  {
    id: "http-versions",
    layer: 7,
    question: "HTTP/1.1 vs HTTP/2 vs HTTP/3 — what actually changed?",
    answer:
      "Each version attacked the previous one's bottleneck. 1.1 added keep-alive and the Host header, but responses still queue in order — application-level head-of-line blocking. HTTP/2 multiplexed many binary streams over one TCP connection (plus header compression), which exposed transport-level HOL blocking: one lost TCP segment stalls every stream, because TCP enforces one ordered byte stream. HTTP/3 keeps HTTP/2's semantics but rides QUIC, whose streams are independently ordered — one stream's loss is finally private to it. Same GET and 200 OK for thirty years; the delivery machinery rebuilt twice.",
    followUps: [
      "Why couldn't HTTP/2's problem be fixed inside TCP?",
      "What is 0-RTT and what's its replay risk?",
    ],
    links: [
      { label: "HTTP grew up: 1.0 → 3", href: "/layers/application/" },
      { label: "QUIC at the transport layer", href: "/layers/transport/" },
    ],
  },
  {
    id: "its-always-dns",
    layer: 7,
    question: "A site is 'down' for users but loads fine by IP address. Diagnose.",
    answer:
      "By-IP success is a one-line proof that Layers 1–6 are healthy: routing works, TCP connects, the server serves. The only broken thing is name resolution — DNS. From there: dig the name against your resolver and against a public one to localize (expired domain? bad records? resolver outage? negative-cache of an earlier failure?). The lesson interviewers want: DNS failures masquerade as total outages because nearly every connection starts with a lookup — hence 'it's always DNS.'",
    followUps: [
      "How does negative caching prolong such outages?",
      "Why might it work on one network but not another?",
    ],
    links: [{ label: "DNS, the lookup behind everything", href: "/layers/application/" }],
  },
  {
    id: "wifi-three-addresses",
    layer: 2,
    question: "Why does an 802.11 frame carry three MAC addresses when Ethernet needs two?",
    answer:
      "Because the access point is a relay, every Wi-Fi frame describes two hops at once. On the radio hop you need the transmitter and receiver (who is radiating, who should decode and ACK); but the frame is in transit between the wireless and wired worlds, so a third field carries the other end — the ultimate destination (station→AP) or the original source (AP→station). The ToDS/FromDS bits in Frame Control say which reading applies. Bonus points: a fourth address appears when both bits are set (AP-to-AP mesh/WDS), because then transmitter, receiver, source, and destination are four distinct machines.",
    followUps: [
      "What are Address 1/2/3 for a frame from a laptop to a wired server?",
      "Why does Wi-Fi need link-layer ACKs and sequence numbers at all?",
    ],
    links: [
      { label: "The 802.11 frame, field by field", href: "/wireless/" },
      { label: "CSMA/CA and hidden terminals", href: "/layers/data-link/" },
    ],
  },
  {
    id: "gratuitous-arp",
    layer: 2,
    question: "What is a gratuitous ARP, and what is it (legitimately) for?",
    answer:
      "An unsolicited ARP message — typically a broadcast ARP request for your own IP address — announcing 'this IP maps to this MAC' to everyone. Legitimate uses are real: announcing yourself after boot or an IP change so neighbors' caches update, detecting duplicate addresses (if anyone answers your gratuitous ARP for your own IP, there's a conflict), and high-availability failover — when a standby router takes over a virtual IP, its gratuitous ARP instantly repoints every cache on the LAN. The same mechanism is ARP spoofing's tool of choice, which is the deeper lesson: ARP has no authentication, so the difference between failover and attack is intent.",
    followUps: [
      "How does VRRP/keepalived use this during failover?",
      "How would you detect ARP spoofing on a network you operate?",
    ],
    links: [{ label: "ARP and its security story", href: "/layers/data-link/" }],
  },
  {
    id: "anycast",
    layer: 3,
    question: "What is anycast, and how can one IP address exist in 200 cities at once?",
    answer:
      "Anycast is announcing the same IP prefix from many locations via BGP and letting ordinary route selection deliver each packet to the topologically nearest site. Nothing in IP requires an address to live in one place — routers just forward toward whichever announcement their best-path selection chose. It's how root DNS servers and CDN edges scale and absorb DDoS (the attack is diluted across every site). The classic follow-up trap: long-lived TCP connections can theoretically break if routing shifts mid-connection to a different site — in practice routes are stable enough, and CDNs engineer around it.",
    followUps: [
      "Why is anycast nearly perfect for DNS but trickier for long-lived TCP?",
      "How does anycast help absorb DDoS attacks?",
    ],
    links: [
      { label: "CDNs and anycast", href: "/modern/" },
      { label: "How BGP picks paths", href: "/layers/network/" },
    ],
  },
  {
    id: "slaac-vs-dhcp",
    layer: 3,
    question: "How does an IPv6 host get an address without a DHCP server?",
    answer:
      "SLAAC — stateless address autoconfiguration. The router periodically multicasts Router Advertisements carrying the network prefix; the host appends a self-generated interface identifier, then verifies uniqueness by asking 'anyone already using this?' via Neighbor Solicitation (duplicate address detection). No server, no lease, no state held anywhere. The supporting cast is NDP (ICMPv6), which also replaces ARP for address resolution. DHCPv6 still exists for networks wanting central control and logging — and a flag in the Router Advertisement tells hosts which regime applies.",
    followUps: [
      "What replaced ARP in IPv6, and over what transport?",
      "What's the rogue-RA attack and its defense?",
    ],
    links: [
      { label: "NDP and SLAAC in depth", href: "/modern/" },
      { label: "DHCP's DORA for contrast", href: "/layers/application/" },
    ],
  },
  {
    id: "bdp",
    layer: 4,
    question: "What is the bandwidth-delay product, and why does it govern throughput?",
    answer:
      "BDP = bandwidth × round-trip time: the amount of data that must be in flight, unacknowledged, to keep a path full — the 'capacity of the pipe' in bytes. TCP can only have one window of unacknowledged data outstanding, so throughput ≈ window / RTT regardless of link speed: a 64 KB window over 100 ms caps you near 5 Mb/s even on a 10 Gb/s path. That's why window scaling exists (the 16-bit window field can't express modern BDPs), why 'long fat networks' underperform with untuned stacks, and why BBR's whole design is pacing at measured bandwidth with about one BDP in flight.",
    followUps: [
      "Compute the BDP of a 1 Gb/s, 80 ms path — what window does it demand?",
      "How does window scaling get negotiated?",
    ],
    links: [{ label: "Windows, BDP, and BBR", href: "/layers/transport/" }],
  },
  {
    id: "tls13-handshake",
    layer: 6,
    question: "Walk me through the TLS 1.3 handshake.",
    answer:
      "One round trip. The ClientHello offers cipher suites and — the key 1.3 change — already includes a key share (an ephemeral Diffie-Hellman public value). The ServerHello picks the suite, returns its own key share, and from that moment both sides derive identical session keys; the server's certificate and signature follow, already encrypted, proving its identity. Client verifies the chain, sends Finished, and application data flows. Strong answers add: ephemeral keys give forward secrecy by default; resumption uses pre-shared keys from a prior session (0-RTT can even carry data in the first flight, accepting replay risk); and 1.3 deleted the legacy footguns — static-RSA key exchange, renegotiation, compression.",
    followUps: [
      "What does forward secrecy actually protect against?",
      "Why is 0-RTT data replayable, and what should never be sent in it?",
    ],
    links: [
      { label: "The handshake diagram", href: "/layers/presentation/" },
      { label: "TLS session resumption and 0-RTT", href: "/layers/session/" },
    ],
  },
  {
    id: "vxlan-vs-vlan",
    layer: 2,
    question: "VLAN vs VXLAN — when does each make sense?",
    answer:
      "Both isolate Layer-2 domains; they differ in scale and substrate. A VLAN is a 4-byte tag on the Ethernet frame — 12 bits, so 4,094 usable segments — and it requires every switch on the path to carry the tagged frame: same physical fabric. VXLAN wraps the entire Ethernet frame in UDP and tunnels it over any IP network, with a 24-bit identifier (~16.7 million segments). VLANs are right for campus/office segmentation on hardware you control end to end; VXLAN is right when the segments must outnumber 4,094 (multi-tenant clouds) or span an IP-routed underlay (data centers, Kubernetes overlays) — Layer 2 semantics stretched over a Layer 3 world.",
    followUps: [
      "What's an underlay vs an overlay network?",
      "Why did data centers move from stretched VLANs to VXLAN fabrics?",
    ],
    links: [
      { label: "Overlay networks", href: "/modern/" },
      { label: "VLANs and Spanning Tree", href: "/layers/data-link/" },
    ],
  },
  {
    id: "cdn-by-layer",
    layer: 0,
    question: "Describe what a CDN does, layer by layer.",
    answer:
      "A tour of the stack: at L7 it serves cached HTTP responses from edge locations and steers users via DNS; at L6 it terminates TLS at the edge (holding certificates close to users to cut handshake RTTs); at L4 it terminates TCP/QUIC near the user and often runs an optimized connection to the origin over its private backbone; at L3 it announces the same prefixes from every site (anycast) so routing itself delivers users to the nearest edge; and physically it's the speed of light being managed — content placed kilometers, not continents, from eyeballs. The punchline interviewers like: a CDN is the whole OSI model deployed as a business.",
    followUps: [
      "What's the difference between a cache hit at the edge and a request that goes to origin?",
      "Why does TLS termination at the edge improve latency even for uncacheable content?",
    ],
    links: [
      { label: "CDNs, anycast, and load balancers", href: "/modern/" },
      { label: "Why latency dominates", href: "/layers/application/" },
    ],
  },
];

/** Layer numbers (0–7) that have at least one question, in display order. */
export const QUESTION_LAYERS: number[] = [...new Set(INTERVIEW_QUESTIONS.map((q) => q.layer))].sort(
  (a, b) => a - b,
);
