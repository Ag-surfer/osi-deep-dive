"use client";

import { RoughScene, type Scene } from "./RoughScene";

/**
 * One hand-drawn diagram per protocol deep-dive page, keyed by the protocol
 * slug (matching lib/protocols.ts). Each entry is a declarative scene plus a
 * caption and a screen-reader summary. Embedded in MDX as
 * `<ProtocolDiagram id="bgp" />`. A test asserts every protocol slug has an
 * entry here.
 */
interface Diagram {
  scene: Scene;
  caption: string;
  summary: string;
}

export const PROTOCOL_DIAGRAMS: Record<string, Diagram> = {
  // ─────────────────────────── Layer 1 ───────────────────────────
  "ethernet-phy": {
    scene: {
      width: 820,
      height: 230,
      boxes: [
        { x: 300, y: 24, w: 220, h: 50, title: "1000BASE-T", mono: true, accent: "l1" },
        { x: 40, y: 130, w: 150, h: 50, title: "1000", lines: ["Mb/s (speed)"] },
        { x: 335, y: 130, w: 150, h: 50, title: "BASE", lines: ["baseband"] },
        { x: 630, y: 130, w: 150, h: 50, title: "T", lines: ["twisted pair"] },
      ],
      arrows: [
        { from: [360, 74], to: [150, 128], accent: "l1" },
        { from: [410, 74], to: [410, 128], accent: "l1" },
        { from: [460, 74], to: [690, 128], accent: "l1" },
      ],
      notes: [
        {
          x: 410,
          y: 213,
          text: "gigabit copper needs all 4 pairs (PAM-5) — a dead pair drops the link to 100BASE-TX",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Ethernet PHY names decode as speed–signaling–medium. The physical layer is reinvented each generation; the frame on top never changes.",
    summary:
      "The name 1000BASE-T decomposes into 1000 (megabits per second), BASE (baseband signaling), and T (twisted-pair copper).",
  },

  "fiber-dwdm": {
    scene: {
      width: 820,
      height: 260,
      boxes: [
        { x: 24, y: 30, w: 90, h: 34, title: "λ1", mono: true, accent: "l1" },
        { x: 24, y: 80, w: 90, h: 34, title: "λ2", mono: true, accent: "l2" },
        { x: 24, y: 130, w: 90, h: 34, title: "λ3", mono: true, accent: "l4" },
        { x: 24, y: 180, w: 90, h: 34, title: "λ4", mono: true, accent: "l6" },
        { x: 210, y: 95, w: 90, h: 56, title: "MUX" },
        { x: 380, y: 95, w: 140, h: 56, title: "one fiber", lines: ["~80 λ · Tb/s"] },
        { x: 560, y: 95, w: 90, h: 56, title: "DEMUX" },
        { x: 706, y: 95, w: 90, h: 56, title: "λ1…λ4", mono: true },
      ],
      arrows: [
        { from: [114, 47], to: [210, 110] },
        { from: [114, 97], to: [210, 118] },
        { from: [114, 147], to: [210, 128] },
        { from: [114, 197], to: [210, 136] },
        { from: [300, 123], to: [380, 123] },
        { from: [520, 123], to: [560, 123] },
        { from: [650, 123], to: [706, 123] },
      ],
      notes: [
        {
          x: 410,
          y: 240,
          text: "many colors of light share one strand (WDM) — upgrade the optics, not the buried glass",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "DWDM multiplexes ~80 independent wavelengths onto a single fiber pair, pushing it into the tens of terabits per second.",
    summary:
      "Four wavelengths λ1 to λ4 are combined by a multiplexer onto one fiber carrying ~80 wavelengths, then split back out by a demultiplexer.",
  },

  "wifi-phy": {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        { x: 40, y: 40, w: 300, h: 56, title: "one fast carrier", lines: ["multipath smears it"] },
        {
          x: 470,
          y: 40,
          w: 310,
          h: 56,
          title: "OFDM: many slow subcarriers",
          lines: ["echoes survive"],
        },
      ],
      arrows: [{ from: [340, 68], to: [470, 68], label: "split the channel", labelDy: -10 }],
      notes: [
        {
          x: 625,
          y: 130,
          text: "subcarriers (hundreds of narrow slow streams)",
          size: 10,
          opacity: 0.7,
        },
        {
          x: 625,
          y: 150,
          text: "▏ ▎ ▍ ▌ ▋ ▊ ▉ █ ▉ ▊ ▋ ▌ ▍ ▎ ▏ ▎ ▍ ▌ ▋ ▊",
          size: 14,
          opacity: 0.6,
          accent: "l4",
        },
        {
          x: 410,
          y: 210,
          text: "adaptive QAM: 1024-QAM (10 bits/symbol) up close → 64-QAM far away as SNR falls",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "OFDM splits the channel into hundreds of slow subcarriers so multipath echoes — fatal to one fast signal — only nick a few of them.",
    summary:
      "Instead of one fast carrier that multipath would smear, OFDM divides the channel into hundreds of narrow slow subcarriers; modulation density (QAM) adapts to signal strength.",
  },

  // ─────────────────────────── Layer 2 ───────────────────────────
  "ethernet-switching": {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 40, y: 40, w: 96, h: 44, title: "Host A", lines: ["port 1"] },
        { x: 40, y: 160, w: 96, h: 44, title: "Host B", lines: ["port 2"] },
        { x: 330, y: 80, w: 160, h: 86, title: "Switch", accent: "l2" },
        { x: 660, y: 100, w: 120, h: 44, title: "CAM table", lines: ["A→1  B→2"] },
      ],
      arrows: [
        { from: [136, 62], to: [330, 100], label: "learn src", labelDy: -8 },
        { from: [136, 182], to: [330, 146], label: "learn src", labelDy: 14 },
        { from: [490, 123], to: [660, 122] },
      ],
      notes: [
        {
          x: 410,
          y: 230,
          text: "learn source→port · forward to known port · flood the unknown — self-configuring, no setup",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A switch learns each source MAC's port from arriving frames, forwards to known destinations, and floods unknowns — building its table by eavesdropping.",
    summary:
      "Hosts A and B connect to a switch on ports 1 and 2; the switch records source MAC to port mappings in its CAM table and forwards frames accordingly.",
  },

  stp: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 350, y: 24, w: 120, h: 48, title: "Root bridge", accent: "l2" },
        { x: 150, y: 130, w: 120, h: 48, title: "Bridge B" },
        { x: 550, y: 130, w: 120, h: 48, title: "Bridge C" },
      ],
      arrows: [
        { from: [380, 72], to: [230, 130], label: "root port" },
        { from: [440, 72], to: [590, 130], label: "root port", labelDx: 10 },
        {
          from: [270, 168],
          to: [550, 168],
          label: "BLOCKED",
          dashed: true,
          both: true,
          accent: "l1",
        },
      ],
      notes: [
        {
          x: 410,
          y: 205,
          text: "✗ redundant link blocked to break the loop — unblocks if a link fails",
          size: 11,
          opacity: 0.85,
          accent: "l1",
        },
        {
          x: 410,
          y: 230,
          text: "Ethernet frames have no TTL, so one loop = a broadcast storm. STP keeps the tree loop-free.",
          size: 11,
          opacity: 0.75,
        },
      ],
    },
    caption:
      "Spanning Tree elects a root, every bridge picks its lowest-cost path to it, and redundant links are blocked — kept in reserve until a failure needs them.",
    summary:
      "A root bridge at the top connects to bridges B and C; the direct link between B and C is blocked (dashed) to prevent a loop, and would activate only if another link fails.",
  },

  arp: {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        { x: 40, y: 95, w: 120, h: 50, title: "Host A", lines: ["wants .5's MAC"] },
        { x: 350, y: 24, w: 120, h: 44, title: "Host X" },
        { x: 350, y: 98, w: 120, h: 44, title: "Host .5", accent: "l2" },
        { x: 350, y: 172, w: 120, h: 44, title: "Host Y" },
      ],
      arrows: [
        { from: [160, 110], to: [350, 46], label: "who has .5?", labelDy: -8 },
        { from: [160, 120], to: [350, 120], label: "(broadcast)" },
        { from: [160, 135], to: [350, 194], labelDy: 14 },
        {
          from: [350, 110],
          to: [160, 128],
          label: ".5 is at a4:5e:… (unicast reply)",
          labelDy: -8,
          accent: "l2",
          dashed: true,
        },
      ],
      notes: [
        {
          x: 410,
          y: 226,
          text: "broadcast question, unicast answer — and zero authentication (the root of ARP spoofing)",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "ARP broadcasts 'who has this IP?' to the whole segment; only the owner replies, unicast. No authentication — which is why ARP spoofing works.",
    summary:
      "Host A broadcasts an ARP request for the MAC of host .5; every host receives it but only host .5 sends a unicast reply with its MAC address.",
  },

  vlan: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 30, y: 40, w: 110, h: 44, title: "Finance PC", accent: "l3" },
        { x: 30, y: 165, w: 110, h: 44, title: "Guest PC", accent: "l6" },
        { x: 300, y: 95, w: 150, h: 70, title: "Switch", lines: ["VLAN 10 / 20"] },
        { x: 640, y: 95, w: 150, h: 70, title: "another switch" },
      ],
      arrows: [
        { from: [140, 62], to: [300, 110], label: "VLAN 10", labelDy: -8, accent: "l3" },
        { from: [140, 187], to: [300, 150], label: "VLAN 20", labelDy: 14, accent: "l6" },
        {
          from: [450, 130],
          to: [640, 130],
          label: "TRUNK — both VLANs, 802.1Q tagged",
          labelDy: -8,
        },
      ],
      notes: [
        {
          x: 410,
          y: 232,
          text: "one switch, two isolated broadcast domains · 12-bit tag = 4,094 VLANs · crossing them needs a router",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "An 802.1Q tag partitions one switch into isolated VLANs; a trunk carries many VLANs between switches, tags intact. Crossing VLANs requires a router.",
    summary:
      "A finance PC on VLAN 10 and a guest PC on VLAN 20 share one switch but stay isolated; a trunk link carries both tagged VLANs to another switch.",
  },

  // ─────────────────────────── Layer 3 ───────────────────────────
  bgp: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 40, y: 100, w: 130, h: 56, title: "AS 64500", lines: ["your ISP"], accent: "l3" },
        { x: 300, y: 30, w: 130, h: 56, title: "AS 64510", lines: ["peer"] },
        { x: 300, y: 165, w: 130, h: 56, title: "AS 64520", lines: ["provider"] },
        { x: 600, y: 100, w: 150, h: 56, title: "203.0.113.0/24", mono: true },
      ],
      arrows: [
        { from: [170, 118], to: [300, 70], label: "peer (free)", labelDy: -8 },
        { from: [170, 138], to: [300, 190], label: "provider ($)", labelDy: 14 },
        { from: [430, 64], to: [600, 116], label: "AS_PATH: 64510 64530", labelDy: -8 },
        { from: [430, 196], to: [600, 140] },
      ],
      notes: [
        {
          x: 410,
          y: 235,
          text: "path-vector: reject any route whose AS_PATH already lists you · prefer customer > peer > provider (money first)",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "BGP announces reachability between autonomous systems, carrying the full AS_PATH for loop detection — and chooses routes by business policy, not hop count.",
    summary:
      "AS 64500 peers with AS 64510 (free) and buys transit from AS 64520 (paid); a route to 203.0.113.0/24 arrives with an AS_PATH, and policy prefers customer over peer over provider routes.",
  },

  ospf: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 40, y: 95, w: 130, h: 60, title: "Router", lines: ["floods LSAs"], accent: "l3" },
        { x: 280, y: 30, w: 150, h: 56, title: "every router", lines: ["identical LSDB"] },
        { x: 280, y: 165, w: 150, h: 56, title: "Dijkstra", lines: ["shortest-path tree"] },
        { x: 600, y: 95, w: 160, h: 60, title: "forwarding table", lines: ["next hops"] },
      ],
      arrows: [
        { from: [170, 110], to: [280, 64], label: "flood the map", labelDy: -8, accent: "l3" },
        { from: [355, 86], to: [355, 165], label: "run on full map", labelDx: 70 },
        { from: [430, 196], to: [600, 140], label: "install routes", labelDy: 14 },
      ],
      notes: [
        {
          x: 410,
          y: 235,
          text: "link-state: every router floods its links, all share one map, each runs Dijkstra — fast, loop-free convergence",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "OSPF floods link-state advertisements so every router holds an identical map, then each independently runs Dijkstra to compute shortest paths.",
    summary:
      "A router floods link-state advertisements; every router assembles an identical link-state database, runs Dijkstra over the full map, and installs the resulting next hops.",
  },

  ipv6: {
    scene: {
      width: 820,
      height: 220,
      boxes: [
        {
          x: 60,
          y: 60,
          w: 240,
          h: 60,
          title: "2001:0db8:85a3",
          lines: ["global routing prefix /48"],
          mono: true,
          accent: "l3",
        },
        {
          x: 320,
          y: 60,
          w: 150,
          h: 60,
          title: "0000",
          lines: ["subnet /64"],
          mono: true,
          accent: "l4",
        },
        {
          x: 490,
          y: 60,
          w: 270,
          h: 60,
          title: "8a2e:0370:7334",
          lines: ["interface ID (self-made)"],
          mono: true,
          accent: "l6",
        },
      ],
      notes: [
        {
          x: 410,
          y: 40,
          text: "128 bits = 8 groups of 16, written in hex (:: collapses one run of zeros)",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 165,
          text: "the /64 interface half is self-generated (SLAAC) and verified unique by Duplicate Address Detection",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 190,
          text: "no NAT required · Hop Limit replaces TTL · routers never fragment",
          size: 11,
          opacity: 0.7,
        },
      ],
    },
    caption:
      "An IPv6 address splits into a routed network prefix, a subnet, and a self-generated interface identifier — 128 bits, no NAT required.",
    summary:
      "A 128-bit IPv6 address divides into a global routing prefix (/48), a subnet field (to /64), and a 64-bit interface identifier that the host generates itself via SLAAC.",
  },

  icmp: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 30, y: 100, w: 110, h: 50, title: "Source", lines: ["traceroute"], accent: "l3" },
        { x: 250, y: 100, w: 100, h: 50, title: "Router 1" },
        { x: 420, y: 100, w: 100, h: 50, title: "Router 2" },
        { x: 590, y: 100, w: 100, h: 50, title: "Router 3" },
      ],
      arrows: [
        { from: [140, 118], to: [250, 118], label: "TTL=1", labelDy: -8 },
        {
          from: [250, 132],
          to: [140, 150],
          label: "Time Exceeded",
          labelDy: 16,
          dashed: true,
          accent: "l1",
        },
        { from: [140, 110], to: [420, 95], label: "TTL=2", labelDy: -8 },
        { from: [140, 105], to: [590, 90], label: "TTL=3", labelDy: -8 },
      ],
      notes: [
        {
          x: 410,
          y: 230,
          text: "each hop that decrements TTL to 0 returns ICMP Time Exceeded — the loop-prevention field becomes a path-mapping tool",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Traceroute sends packets with TTL = 1, 2, 3…; each router that drops one returns an ICMP Time Exceeded, revealing the path hop by hop.",
    summary:
      "A source sends probes with increasing TTL values; router 1 (TTL=1), router 2 (TTL=2), and router 3 (TTL=3) each return an ICMP Time Exceeded message, mapping the route.",
  },

  // ─────────────────────────── Layer 4 ───────────────────────────
  tcp: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 90, y: 30, w: 120, h: 44, title: "Client" },
        { x: 610, y: 30, w: 120, h: 44, title: "Server" },
      ],
      arrows: [
        { from: [210, 95], to: [610, 95], label: "SYN  seq=x", labelDy: -8, accent: "l4" },
        {
          from: [610, 140],
          to: [210, 140],
          label: "SYN-ACK  seq=y, ack=x+1",
          labelDy: -8,
          accent: "l4",
        },
        {
          from: [210, 185],
          to: [610, 185],
          label: "ACK  ack=y+1 — established",
          labelDy: -8,
          accent: "l4",
        },
      ],
      notes: [
        {
          x: 410,
          y: 232,
          text: "three messages synchronize both initial sequence numbers — the minimum for mutual agreement",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "TCP's three-way handshake synchronizes both directions' initial sequence numbers before any data flows: SYN, SYN-ACK, ACK.",
    summary:
      "The client sends SYN with sequence x; the server replies SYN-ACK with sequence y acknowledging x+1; the client sends ACK of y+1, establishing the connection.",
  },

  udp: {
    scene: {
      width: 820,
      height: 230,
      boxes: [
        { x: 40, y: 80, w: 120, h: 56, title: "Sender" },
        { x: 660, y: 80, w: 120, h: 56, title: "Receiver" },
        { x: 300, y: 40, w: 220, h: 34, title: "src port · dst port", mono: true, accent: "l4" },
        { x: 300, y: 90, w: 220, h: 34, title: "length · checksum", mono: true, accent: "l4" },
      ],
      arrows: [
        {
          from: [160, 108],
          to: [660, 108],
          label: "fire and forget — no handshake, no ACK, no retry",
          labelDy: -8,
        },
      ],
      notes: [
        {
          x: 410,
          y: 150,
          text: "8-byte header, that's the whole protocol",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 205,
          text: "right when a late packet is worse than a lost one (voice, games) or the exchange is one round trip (DNS)",
          size: 11,
          opacity: 0.75,
        },
      ],
    },
    caption:
      "UDP adds just four fields in an 8-byte header — ports, length, checksum — and nothing else. No connection, no reliability: the application chooses.",
    summary:
      "A sender transmits UDP datagrams to a receiver with no handshake, acknowledgment, or retransmission; the entire header is 8 bytes: source port, destination port, length, and checksum.",
  },

  quic: {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        { x: 250, y: 24, w: 320, h: 40, title: "one QUIC connection (over UDP)", accent: "l4" },
        { x: 60, y: 110, w: 200, h: 48, title: "Stream 1", lines: ["delivers"] },
        {
          x: 310,
          y: 110,
          w: 200,
          h: 48,
          title: "Stream 2 — packet lost",
          lines: ["waits"],
          accent: "l1",
        },
        { x: 560, y: 110, w: 200, h: 48, title: "Stream 3", lines: ["delivers"] },
      ],
      arrows: [
        { from: [340, 64], to: [160, 110] },
        { from: [410, 64], to: [410, 110] },
        { from: [480, 64], to: [660, 110] },
      ],
      notes: [
        {
          x: 410,
          y: 200,
          text: "independent streams: a loss in stream 2 never blocks 1 or 3 (TCP's head-of-line blocking, gone)",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 224,
          text: "+ 1-RTT handshake with TLS built in · connection IDs survive Wi-Fi→cellular",
          size: 11,
          opacity: 0.7,
        },
      ],
    },
    caption:
      "QUIC multiplexes independent streams over one UDP connection, so a lost packet stalls only its own stream — eliminating TCP's transport-level head-of-line blocking.",
    summary:
      "One QUIC connection carries three independent streams; a lost packet in stream 2 delays only stream 2, while streams 1 and 3 keep delivering.",
  },

  // ─────────────────────────── Layer 5 ───────────────────────────
  websocket: {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        { x: 90, y: 30, w: 120, h: 44, title: "Browser" },
        { x: 610, y: 30, w: 120, h: 44, title: "Server" },
      ],
      arrows: [
        { from: [210, 95], to: [610, 95], label: "GET /chat — Upgrade: websocket", labelDy: -8 },
        {
          from: [610, 135],
          to: [210, 135],
          label: "101 Switching Protocols",
          labelDy: -8,
          dashed: true,
        },
        {
          from: [210, 180],
          to: [610, 180],
          label: "frames — both directions, any time",
          labelDy: -8,
          both: true,
          accent: "l5",
        },
      ],
      notes: [
        {
          x: 410,
          y: 222,
          text: "starts as HTTP (passes firewalls), then the same TCP connection becomes a full-duplex frame channel",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "WebSocket begins as an HTTP request asking to Upgrade; after 101 Switching Protocols, the same connection carries frames in both directions at any time.",
    summary:
      "A browser sends an HTTP GET with Upgrade: websocket; the server replies 101 Switching Protocols; the connection then carries full-duplex frames either direction.",
  },

  grpc: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 30, y: 40, w: 160, h: 54, title: "Unary", lines: ["1 req → 1 resp"], accent: "l5" },
        {
          x: 230,
          y: 40,
          w: 160,
          h: 54,
          title: "Server stream",
          lines: ["1 req → many"],
          accent: "l5",
        },
        { x: 430, y: 40, w: 160, h: 54, title: "Client stream", lines: ["many → 1"], accent: "l5" },
        {
          x: 630,
          y: 40,
          w: 160,
          h: 54,
          title: "Bidirectional",
          lines: ["many ↔ many"],
          accent: "l5",
        },
        {
          x: 280,
          y: 165,
          w: 260,
          h: 50,
          title: "all over one HTTP/2 connection",
          lines: ["multiplexed streams"],
        },
      ],
      arrows: [
        { from: [110, 94], to: [360, 165] },
        { from: [310, 94], to: [400, 165] },
        { from: [510, 94], to: [430, 165] },
        { from: [710, 94], to: [470, 165] },
      ],
      notes: [
        {
          x: 410,
          y: 238,
          text: "typed .proto contracts + four call shapes + deadlines that propagate down the call chain",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "gRPC offers four call shapes — unary, server-streaming, client-streaming, and bidirectional — all multiplexed over one HTTP/2 connection.",
    summary:
      "gRPC supports unary (one request, one response), server-streaming, client-streaming, and bidirectional calls, all carried as multiplexed streams over a single HTTP/2 connection.",
  },

  sip: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 40, y: 110, w: 120, h: 54, title: "Alice" },
        { x: 350, y: 30, w: 130, h: 48, title: "SIP proxies", accent: "l5" },
        { x: 660, y: 110, w: 120, h: 54, title: "Bob" },
      ],
      arrows: [
        { from: [160, 120], to: [350, 60], label: "INVITE", labelDy: -8, accent: "l5" },
        { from: [480, 60], to: [660, 120], label: "INVITE", labelDy: -8, accent: "l5" },
        {
          from: [160, 150],
          to: [660, 150],
          label: "RTP media — flows directly (the voice)",
          labelDy: 18,
          both: true,
        },
      ],
      notes: [
        {
          x: 410,
          y: 215,
          text: "signaling (SIP) sets up the call through proxies; media (RTP) flows directly between endpoints",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 238,
          text: "“call connects but no audio” = signaling worked, media path (NAT) didn't",
          size: 11,
          opacity: 0.7,
        },
      ],
    },
    caption:
      "SIP signaling sets up and tears down the call (often through proxies); the actual audio flows separately over RTP, usually directly between the endpoints.",
    summary:
      "Alice's SIP INVITE travels through proxies to Bob to establish the call, but the RTP media stream carrying the voice flows directly between Alice and Bob.",
  },

  // ─────────────────────────── Layer 6 ───────────────────────────
  tls: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 90, y: 30, w: 120, h: 44, title: "Client" },
        { x: 610, y: 30, w: 120, h: 44, title: "Server" },
      ],
      arrows: [
        {
          from: [210, 92],
          to: [610, 92],
          label: "ClientHello + key share",
          labelDy: -8,
          accent: "l6",
        },
        {
          from: [610, 134],
          to: [210, 134],
          label: "ServerHello + key share + {cert}",
          labelDy: -8,
          accent: "l6",
          dashed: true,
        },
        {
          from: [210, 176],
          to: [610, 176],
          label: "Finished — keys match",
          labelDy: -8,
          accent: "l6",
        },
        { from: [210, 210], to: [610, 210], label: "encrypted application data", labelDy: -8 },
      ],
      notes: [
        {
          x: 410,
          y: 240,
          text: "one round trip · ephemeral keys = forward secrecy · the certificate itself is encrypted (TLS 1.3)",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "TLS 1.3 completes in one round trip: the client's first message already carries a key share, the server's reply authenticates (encrypted), and data flows.",
    summary:
      "The client sends ClientHello with a key share; the server replies with its key share and an encrypted certificate; both derive matching keys, and encrypted application data flows after one round trip.",
  },

  serialization: {
    scene: {
      width: 820,
      height: 230,
      boxes: [
        { x: 320, y: 24, w: 180, h: 46, title: "{ id: 300 }", mono: true },
        {
          x: 60,
          y: 120,
          w: 300,
          h: 56,
          title: "JSON (text, self-describing)",
          lines: ['{"id":300}  — 10 bytes'],
        },
        {
          x: 470,
          y: 120,
          w: 300,
          h: 56,
          title: "Protobuf (binary, schema)",
          lines: ["08 AC 02  — 3 bytes"],
          accent: "l6",
        },
      ],
      arrows: [
        { from: [380, 70], to: [210, 120], label: "name travels" },
        { from: [440, 70], to: [620, 120], label: "field #1 only", accent: "l6" },
      ],
      notes: [
        {
          x: 410,
          y: 205,
          text: "the shared schema is the compression: protobuf sends numbered tags, not field names",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The same value encodes very differently: JSON carries field names as text; Protocol Buffers carries numbered tags against a shared schema — far smaller, but opaque without the schema.",
    summary:
      "The object { id: 300 } serializes to 10 bytes of JSON text including the field name, or to 3 bytes of Protocol Buffers binary using a numbered tag from a shared schema.",
  },

  compression: {
    scene: {
      width: 820,
      height: 220,
      boxes: [
        { x: 30, y: 80, w: 150, h: 56, title: "input", lines: ["repetitive data"] },
        { x: 250, y: 80, w: 160, h: 56, title: "LZ77", lines: ["repeats → refs"], accent: "l6" },
        {
          x: 470,
          y: 80,
          w: 160,
          h: 56,
          title: "Huffman",
          lines: ["frequent → short"],
          accent: "l6",
        },
        { x: 690, y: 80, w: 100, h: 56, title: "DEFLATE", lines: ["gzip"] },
      ],
      arrows: [
        { from: [180, 108], to: [250, 108] },
        { from: [410, 108], to: [470, 108] },
        { from: [630, 108], to: [690, 108] },
      ],
      notes: [
        {
          x: 410,
          y: 40,
          text: "two ideas from the 1950s–70s, stacked, carry a third of the web",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 185,
          text: "dictionary matching + entropy coding = DEFLATE (gzip, PNG, zip); Brotli & Zstandard refine both",
          size: 11,
          opacity: 0.75,
        },
      ],
    },
    caption:
      "DEFLATE — the engine inside gzip, PNG, and zip — stacks LZ77 dictionary matching (collapse repeats) with Huffman entropy coding (short codes for frequent symbols).",
    summary:
      "Compression pipelines repetitive input through LZ77 (replacing repeats with back-references) then Huffman coding (short codes for frequent symbols), combined as DEFLATE.",
  },

  // ─────────────────────────── Layer 7 ───────────────────────────
  http: {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        {
          x: 60,
          y: 70,
          w: 300,
          h: 90,
          title: "Request",
          lines: ["GET /index.html HTTP/1.1", "Host: example.com", "Accept: text/html"],
          accent: "l7",
        },
        {
          x: 460,
          y: 70,
          w: 300,
          h: 90,
          title: "Response",
          lines: ["HTTP/1.1 200 OK", "Content-Type: text/html", "Cache-Control · ETag"],
          accent: "l7",
        },
      ],
      arrows: [
        { from: [360, 100], to: [460, 100], label: "method + path" },
        { from: [460, 135], to: [360, 135], label: "status + body", dashed: true },
      ],
      notes: [
        {
          x: 410,
          y: 200,
          text: "stateless text protocol · same semantics across HTTP/1.1 → /2 → /3, only the transport changed",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "An HTTP request is a method, path, and headers; a response is a status code, headers, and body. The semantics have outlived three transports.",
    summary:
      "An HTTP request (method, path, Host and Accept headers) is met by a response (status line, Content-Type, caching headers, and body); the message semantics are stable across HTTP versions.",
  },

  dns: {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: 30, y: 100, w: 110, h: 50, title: "Stub", lines: ["your device"] },
        { x: 220, y: 100, w: 130, h: 50, title: "Resolver", lines: ["recursive"], accent: "l7" },
        { x: 460, y: 24, w: 130, h: 44, title: "Root" },
        { x: 460, y: 100, w: 130, h: 44, title: ".com TLD" },
        { x: 460, y: 176, w: 130, h: 44, title: "Authoritative" },
      ],
      arrows: [
        { from: [140, 125], to: [220, 125], label: "example.com?", labelDy: -8 },
        { from: [350, 110], to: [460, 50], label: "ask root", labelDy: -6 },
        { from: [350, 125], to: [460, 122], label: "→ .com" },
        { from: [350, 140], to: [460, 192], label: "→ authoritative", labelDy: 16 },
        { from: [460, 198], to: [350, 140], dashed: true, accent: "l7" },
      ],
      notes: [
        {
          x: 410,
          y: 240,
          text: "the resolver walks root → TLD → authoritative, then caches by TTL — most lookups never leave the cache",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A recursive resolver walks the delegation tree — root, then TLD, then authoritative — and caches every answer by its TTL, so most lookups are served locally.",
    summary:
      "A stub resolver asks a recursive resolver for example.com; the resolver queries the root, then the .com TLD, then the authoritative server, caching the answer by TTL.",
  },

  ssh: {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        {
          x: 260,
          y: 30,
          w: 300,
          h: 40,
          title: "Connection — channels (shell, forwards, sftp)",
          accent: "l7",
        },
        {
          x: 260,
          y: 90,
          w: 300,
          h: 40,
          title: "Authentication — public key proves you",
          accent: "l6",
        },
        {
          x: 260,
          y: 150,
          w: 300,
          h: 40,
          title: "Transport — encrypt + verify server host key",
          accent: "l4",
        },
      ],
      notes: [
        {
          x: 410,
          y: 215,
          text: "three sub-protocols, bottom-up: secure pipe → prove identity → multiplex channels (TCP/22)",
          size: 11,
          opacity: 0.8,
        },
        { x: 130, y: 110, text: "stacked", size: 11, opacity: 0.5 },
        { x: 690, y: 110, text: "one TCP conn", size: 11, opacity: 0.5 },
      ],
    },
    caption:
      "SSH layers three sub-protocols: a transport that encrypts and authenticates the server, user authentication (ideally public-key), and a connection layer multiplexing channels.",
    summary:
      "SSH is built from three stacked sub-protocols: transport (encryption and server host-key verification), user authentication (public-key challenge), and connection (multiplexed channels like shells and port forwards).",
  },

  smtp: {
    scene: {
      width: 820,
      height: 230,
      boxes: [
        { x: 20, y: 90, w: 120, h: 54, title: "Your client" },
        { x: 230, y: 90, w: 130, h: 54, title: "Your MTA", accent: "l7" },
        { x: 450, y: 90, w: 130, h: 54, title: "Their MTA", accent: "l7" },
        { x: 670, y: 90, w: 120, h: 54, title: "Recipient" },
      ],
      arrows: [
        { from: [140, 117], to: [230, 117], label: "SMTP submit :587", labelDy: -8 },
        { from: [360, 117], to: [450, 117], label: "SMTP relay :25 (MX)", labelDy: -8 },
        { from: [580, 117], to: [670, 117], label: "IMAP :993", labelDy: -8, dashed: true },
      ],
      notes: [
        {
          x: 410,
          y: 185,
          text: "push to deliver (SMTP), pull to read (IMAP); the handoff is a DNS MX lookup · SPF/DKIM/DMARC authenticate",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Email is a relay race: SMTP pushes mail from client to your server to theirs (found via DNS MX), and IMAP lets the recipient pull it on their own schedule.",
    summary:
      "A client submits mail via SMTP on port 587 to its MTA, which relays via SMTP port 25 (using a DNS MX lookup) to the recipient's MTA; the recipient retrieves it via IMAP on port 993.",
  },

  // ═══════════ Supplementary per-subtopic diagrams ═══════════
  // Extra keys (slug + "-topic") embedded as a second <ProtocolDiagram/> on a
  // page. The coverage test allows these alongside the one-per-slug primaries.

  // ─── Layer 1 ───
  "ethernet-phy-lanes": {
    scene: {
      width: 820,
      height: 286,
      boxes: [
        { x: 30, y: 88, w: 120, h: 146, title: "NIC", lines: ["1000BASE-T"], accent: "l1" },
        { x: 180, y: 92, w: 460, h: 30, title: "pair 1  ·  250 Mb/s  ↔", mono: true },
        { x: 180, y: 128, w: 460, h: 30, title: "pair 2  ·  250 Mb/s  ↔", mono: true },
        { x: 180, y: 164, w: 460, h: 30, title: "pair 3  ·  250 Mb/s  ↔", mono: true },
        { x: 180, y: 200, w: 460, h: 30, title: "pair 4  ·  ✗ broken", mono: true, accent: "l1" },
        { x: 670, y: 88, w: 120, h: 146, title: "switch" },
      ],
      notes: [
        {
          x: 410,
          y: 30,
          text: "1000BASE-T: a gigabit spread over four copper pairs, each bidirectional",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 58,
          text: "100BASE-TX used 2 pairs; gigabit needs all 4 (PAM-5 + echo cancellation)",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 258,
          text: "4 × 250 = 1000 Mb/s — most modern speed jumps are really lane-count jumps.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 274,
          text: "Lose a pair and it drops to 100BASE-TX (needs only 2) — the 'why did it come up at 100?' ticket.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "1000BASE-T reaches a gigabit by running all four twisted pairs at 250 Mb/s each, bidirectionally (PAM-5 + echo cancellation). Lose one pair and gigabit can't form — the link falls back to 2-pair 100BASE-TX.",
    summary:
      "A NIC and a switch joined by four twisted pairs, each carrying 250 Mb/s bidirectionally to total 1 Gb/s; one broken pair forces a fallback to 100BASE-TX, which needs only two pairs.",
  },

  "fiber-modes": {
    scene: {
      width: 820,
      height: 300,
      regions: [
        { x: 170, y: 70, w: 430, h: 64, accent: "l1" },
        { x: 170, y: 206, w: 430, h: 40, accent: "l4" },
      ],
      polylines: [
        {
          points: [
            [170, 102],
            [600, 102],
          ],
        },
        {
          accent: "l1",
          points: [
            [170, 102],
            [242, 78],
            [314, 126],
            [386, 78],
            [458, 126],
            [530, 78],
            [600, 102],
          ],
        },
        {
          accent: "l4",
          points: [
            [170, 226],
            [600, 226],
          ],
        },
      ],
      boxes: [
        { x: 132, y: 90, w: 14, h: 24, accent: "l3" },
        { x: 606, y: 82, w: 46, h: 40, accent: "l1" },
        { x: 132, y: 214, w: 14, h: 24, accent: "l3" },
        { x: 606, y: 214, w: 14, h: 24, accent: "l3" },
      ],
      notes: [
        {
          x: 410,
          y: 30,
          text: "Why single-mode goes the distance: modal dispersion",
          size: 12,
          weight: 600,
        },
        {
          x: 180,
          y: 60,
          text: "multi-mode core (~50 µm) — light takes many paths",
          size: 10,
          anchor: "start",
          opacity: 0.7,
        },
        {
          x: 180,
          y: 198,
          text: "single-mode core (~9 µm) — one path",
          size: 10,
          anchor: "start",
          opacity: 0.7,
        },
        { x: 629, y: 74, text: "smeared", size: 9, opacity: 0.65, accent: "l1" },
        { x: 613, y: 208, text: "sharp", size: 9, opacity: 0.65, accent: "l4" },
        {
          x: 410,
          y: 272,
          text: "multi-mode: many ray paths → many arrival times → the pulse smears, limiting reach to ~hundreds of m.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 288,
          text: "single-mode: one path, one arrival time → the pulse stays crisp over tens of km.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Multi-mode fiber's wide core lets light take many paths that arrive at different times, smearing the pulse (modal dispersion) and capping reach; single-mode's narrow core admits one path, keeping pulses sharp over long distances.",
    summary:
      "Two fibers: a wide multi-mode core in which several ray paths arrive at different times and smear the output pulse, versus a narrow single-mode core with one straight path that keeps the pulse sharp.",
  },

  "wifi-ofdma": {
    scene: {
      width: 820,
      height: 300,
      boxes: [
        { x: 70, y: 92, w: 88, h: 140, title: "STA A", accent: "l5" },
        { x: 162, y: 92, w: 88, h: 140, title: "STA B", accent: "l6" },
        { x: 254, y: 92, w: 88, h: 140, title: "STA C", accent: "l3" },
        { x: 470, y: 92, w: 130, h: 35, title: "STA A", accent: "l5" },
        { x: 470, y: 127, w: 130, h: 35, title: "STA B", accent: "l6" },
        { x: 470, y: 162, w: 130, h: 35, title: "STA C", accent: "l3" },
        { x: 470, y: 197, w: 130, h: 35, title: "STA D", accent: "l7" },
        { x: 602, y: 92, w: 128, h: 70, title: "STA A", accent: "l5" },
        { x: 602, y: 162, w: 128, h: 70, title: "STA E", accent: "l2" },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "OFDMA: from one-station-at-a-time to many-at-once",
          size: 12,
          weight: 600,
        },
        { x: 206, y: 78, text: "classic OFDM: one station per slot", size: 10, opacity: 0.75 },
        { x: 600, y: 78, text: "Wi-Fi 6 OFDMA: resource units, at once", size: 10, opacity: 0.75 },
        { x: 46, y: 164, text: "freq", size: 9, anchor: "end", opacity: 0.55 },
        { x: 206, y: 248, text: "time →", size: 9, opacity: 0.55 },
        { x: 600, y: 248, text: "time →", size: 9, opacity: 0.55 },
        {
          x: 410,
          y: 272,
          text: "classic: a small IoT packet wastes an entire slot. OFDMA subdivides each slot into resource units,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 288,
          text: "packing many clients into one airtime — a shift from pure contention toward AP scheduling.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Classic Wi-Fi gives one station the whole channel for its turn; Wi-Fi 6's OFDMA subdivides each time slot into resource units assigned to several clients simultaneously — moving from pure contention toward AP scheduling.",
    summary:
      "Left: classic OFDM where each time slot is owned entirely by one station (A, then B, then C). Right: OFDMA splitting each slot into frequency resource units so stations A–E transmit at the same time.",
  },

  // ─── Layer 2 ───
  "ethernet-switching-learning": {
    scene: {
      width: 820,
      height: 300,
      boxes: [
        { x: 30, y: 128, w: 120, h: 48, title: "Host A", lines: ["port 1"], accent: "l2" },
        { x: 320, y: 112, w: 160, h: 80, title: "switch" },
        { x: 670, y: 44, w: 120, h: 48, title: "Host B", lines: ["unknown"] },
        { x: 670, y: 128, w: 120, h: 48, title: "Host C", lines: ["port 3"] },
        { x: 670, y: 212, w: 120, h: 48, title: "Host D", lines: ["port 4"] },
      ],
      regions: [{ x: 300, y: 214, w: 200, h: 58, label: "CAM table", accent: "l2" }],
      arrows: [
        { from: [150, 150], to: [320, 150], accent: "l2", label: "A→B", labelDy: -8 },
        { from: [480, 140], to: [670, 68], dashed: true, label: "flood", labelDy: -6 },
        { from: [480, 152], to: [670, 152], dashed: true, label: "flood", labelDy: -6 },
        { from: [480, 164], to: [670, 236], dashed: true, label: "flood", labelDy: 14 },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "The learning switch: flood the unknown, learn from the reply",
          size: 12,
          weight: 600,
        },
        { x: 400, y: 240, text: "A → port 1   (learned)", size: 10, mono: true, opacity: 0.8 },
        { x: 400, y: 256, text: "B → ?   (unknown → flood)", size: 10, mono: true, opacity: 0.8 },
        {
          x: 410,
          y: 290,
          text: "every frame teaches source MAC → ingress port; B's reply makes the next A→B frame a unicast, not a flood.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A learning switch floods a frame for an unknown destination out every other port, while recording the source MAC against its ingress port; the destination's reply then teaches the switch its port, so later frames are unicast.",
    summary:
      "Host A sends to an unknown Host B; the switch floods the frame to ports 2, 3, and 4 and records A on port 1 in its CAM table. B's reply will teach the switch B's port, ending the flooding.",
  },

  "arp-spoofing": {
    scene: {
      width: 820,
      height: 322,
      boxes: [
        {
          x: 40,
          y: 110,
          w: 150,
          h: 64,
          title: "Victim",
          lines: ["gw .1 → atk MAC ✗"],
          accent: "l1",
        },
        { x: 630, y: 110, w: 150, h: 64, title: "Gateway", lines: ["192.168.1.1"] },
        {
          x: 330,
          y: 212,
          w: 170,
          h: 66,
          title: "Attacker",
          lines: ["forged ARP replies"],
          accent: "l1",
        },
      ],
      arrows: [
        {
          from: [360, 212],
          to: [190, 168],
          accent: "l1",
          dashed: true,
          label: "ARP reply: '.1 is at my MAC'",
          labelDy: -10,
        },
        {
          from: [180, 174],
          to: [340, 224],
          accent: "l1",
          label: "all traffic for .1",
          labelDy: 16,
        },
        { from: [500, 224], to: [640, 174], accent: "l1", label: "relayed (MITM)", labelDy: 16 },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "ARP spoofing: forge the reply, become the man in the middle",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 100,
          text: "(normally the victim talks to the gateway directly)",
          size: 10,
          opacity: 0.5,
        },
        {
          x: 410,
          y: 298,
          text: "ARP replies are believed unconditionally — claim the gateway's IP is at your MAC,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 314,
          text: "and every victim routes through you. Defense: Dynamic ARP Inspection + TLS above.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "ARP has no authentication, so an attacker can send forged replies mapping the gateway's IP to its own MAC; the victim's cache is poisoned and its traffic flows through the attacker, who relays it on — a classic on-path MITM (the full attack poisons the gateway's cache too).",
    summary:
      "An attacker sends the victim a forged ARP reply claiming the gateway's IP is at the attacker's MAC; the victim then sends all gateway-bound traffic to the attacker, who relays it to the real gateway, sitting in the middle.",
  },

  "stp-storm": {
    scene: {
      width: 820,
      height: 312,
      boxes: [
        { x: 355, y: 46, w: 120, h: 52, title: "Switch 1", lines: ["root bridge"], accent: "l2" },
        { x: 150, y: 196, w: 120, h: 52, title: "Switch 2" },
        { x: 560, y: 196, w: 120, h: 52, title: "Switch 3" },
      ],
      arrows: [
        {
          from: [360, 98],
          to: [255, 196],
          both: true,
          accent: "l3",
          label: "forwarding",
          labelDx: -16,
        },
        {
          from: [470, 98],
          to: [575, 196],
          both: true,
          accent: "l3",
          label: "forwarding",
          labelDx: 16,
        },
        {
          from: [270, 226],
          to: [560, 226],
          both: true,
          dashed: true,
          accent: "l1",
          label: "✗ BLOCKED by STP",
          labelDy: -8,
        },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "Spanning Tree breaks the loop before it storms",
          size: 12,
          weight: 600,
        },
        {
          x: 415,
          y: 248,
          text: "alive but blocked — unblocks if a forwarding link fails",
          size: 10,
          opacity: 0.6,
        },
        {
          x: 410,
          y: 280,
          text: "Leave all three links up and one broadcast circulates forever — re-flooded to every host each lap —",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 296,
          text: "until links saturate and MAC tables flap. STP blocks one link → exactly one path, loop-free.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Three switches wired in a loop would circulate a broadcast forever — re-flooded to every host each lap until links saturate — because Ethernet frames have no TTL to kill them. Spanning Tree keeps one redundant link blocked so the active topology is always a loop-free tree, unblocking it only when a link fails.",
    summary:
      "Three switches in a triangle: two links forward traffic and the third is blocked by STP, leaving exactly one path. Without the block, a broadcast would circulate endlessly, re-flooded to every host each lap, saturating the LAN.",
  },

  // ─── Layer 2 / 3 ───
  "vlan-trunk": {
    scene: {
      width: 820,
      height: 300,
      boxes: [
        { x: 30, y: 70, w: 110, h: 44, title: "Host A", lines: ["VLAN 10"], accent: "l3" },
        { x: 30, y: 180, w: 110, h: 44, title: "Host B", lines: ["VLAN 20"], accent: "l6" },
        { x: 230, y: 110, w: 120, h: 80, title: "Switch 1" },
        { x: 470, y: 110, w: 120, h: 80, title: "Switch 2" },
        { x: 680, y: 70, w: 110, h: 44, title: "Host C", lines: ["VLAN 10"], accent: "l3" },
        { x: 680, y: 180, w: 110, h: 44, title: "Host D", lines: ["VLAN 20"], accent: "l6" },
      ],
      arrows: [
        { from: [140, 92], to: [230, 130], label: "untagged", labelDy: -8 },
        { from: [140, 202], to: [230, 170], label: "untagged", labelDy: 14 },
        {
          from: [350, 150],
          to: [470, 150],
          both: true,
          accent: "l2",
          label: "TRUNK — tagged [10],[20]",
          labelDy: -8,
        },
        { from: [590, 130], to: [680, 92], label: "untagged", labelDy: -8 },
        { from: [590, 170], to: [680, 202], label: "untagged", labelDy: 14 },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "Access ports vs trunk: the VLAN tag lives only between switches",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 270,
          text: "Access ports are untagged — your laptop never sees a VLAN. The switch tags on ingress,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 286,
          text: "the trunk backhauls many VLANs (tags intact), and the far switch strips the tag on egress.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Hosts attach to untagged access ports, each in one VLAN; the switch adds the 802.1Q tag on ingress and the trunk between switches carries every VLAN with tags intact, while the far switch strips the tag back off on egress to the host.",
    summary:
      "Hosts A and C in VLAN 10 and B and D in VLAN 20 connect to two switches via untagged access ports; the inter-switch trunk carries both VLANs tagged, and each switch tags on ingress and strips on egress.",
  },

  "ipv6-slaac": {
    scene: {
      width: 820,
      height: 322,
      boxes: [
        {
          x: 40,
          y: 110,
          w: 150,
          h: 70,
          title: "Router",
          lines: ["RA: prefix +", "I'm the gateway"],
          accent: "l3",
        },
        { x: 620, y: 110, w: 160, h: 70, title: "Host", lines: ["no address yet"], accent: "l5" },
      ],
      regions: [
        { x: 250, y: 210, w: 320, h: 56, label: "③ address = prefix + interface ID", accent: "l5" },
      ],
      arrows: [
        {
          from: [190, 134],
          to: [620, 134],
          accent: "l3",
          label: "① Router Advertisement: prefix 2001:db8:1::/64",
          labelDy: -8,
        },
        {
          from: [620, 162],
          to: [190, 162],
          dashed: true,
          label: "② DAD: 'anyone using …:9f60?' (silence = mine)",
          labelDy: 16,
        },
      ],
      notes: [
        { x: 410, y: 28, text: "SLAAC: how IPv6 self-configures, no DHCP", size: 12, weight: 600 },
        {
          x: 410,
          y: 240,
          text: "2001:db8:1::/64   +   8f2c:3a1d:b4e5:9f60 (random IID)",
          size: 11,
          mono: true,
          opacity: 0.85,
        },
        {
          x: 410,
          y: 290,
          text: "the router advertises a /64 prefix; the host appends a random 64-bit interface ID, then DAD-checks it.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 306,
          text: "NDP (ICMPv6) replaces ARP, and SLAAC the need for DHCP — filter ICMPv6 and IPv6 breaks.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Stateless address autoconfiguration: a router advertises the link's /64 prefix, the host appends a (random) 64-bit interface identifier, and Duplicate Address Detection confirms uniqueness — all over ICMPv6 Neighbor Discovery, which replaces ARP and removes the need for DHCP.",
    summary:
      "A router sends a Router Advertisement carrying the prefix 2001:db8:1::/64; the host forms its address by appending a random 64-bit interface ID and runs Duplicate Address Detection to confirm no one else uses it.",
  },

  "icmp-traceroute": {
    scene: {
      width: 820,
      height: 318,
      boxes: [
        { x: 20, y: 64, w: 100, h: 50, title: "you", lines: ["traceroute"], accent: "l3" },
        { x: 190, y: 66, w: 90, h: 46, title: "R1" },
        { x: 360, y: 66, w: 90, h: 46, title: "R2" },
        { x: 530, y: 66, w: 90, h: 46, title: "R3" },
        { x: 690, y: 64, w: 100, h: 50, title: "dest" },
      ],
      arrows: [
        { from: [70, 148], to: [235, 148], accent: "l1", label: "TTL=1 → 0", labelDy: -8 },
        { from: [70, 188], to: [405, 188], accent: "l2", label: "TTL=2 → 0", labelDy: -8 },
        { from: [70, 228], to: [575, 228], accent: "l4", label: "TTL=3 → 0", labelDy: -8 },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "traceroute: TTL = 1, 2, 3 … makes each hop introduce itself",
          size: 12,
          weight: 600,
        },
        { x: 240, y: 164, text: "⏱ Time Exceeded ← R1", size: 9, anchor: "start", accent: "l1" },
        { x: 410, y: 204, text: "⏱ Time Exceeded ← R2", size: 9, anchor: "start", accent: "l2" },
        {
          x: 580,
          y: 244,
          text: "⏱ ← R3 (then dest answers)",
          size: 9,
          anchor: "start",
          accent: "l4",
        },
        {
          x: 410,
          y: 288,
          text: "each probe's TTL expires one hop further along; that router returns ICMP Time Exceeded, naming itself.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 304,
          text: "The loop-prevention field (TTL) turned into a network-mapping tool.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "traceroute sends probes with TTL = 1, 2, 3 …; each router that decrements the TTL to zero drops the probe and returns an ICMP Time Exceeded, so successive probes reveal the path one hop at a time.",
    summary:
      "A chain from you through routers R1, R2, R3 to the destination; a probe with TTL=1 expires at R1, TTL=2 at R2, and TTL=3 at R3, each expiring router returning an ICMP Time Exceeded that reveals its address.",
  },

  // ─── Layer 3 routing ───
  "ospf-areas": {
    scene: {
      width: 820,
      height: 308,
      regions: [
        {
          x: 280,
          y: 50,
          w: 260,
          h: 64,
          label: "Area 0 (backbone) — all inter-area traffic transits here",
          accent: "l3",
        },
        { x: 40, y: 170, w: 210, h: 80, label: "Area 1", accent: "l4" },
        { x: 305, y: 170, w: 210, h: 80, label: "Area 2", accent: "l5" },
        { x: 570, y: 170, w: 210, h: 80, label: "Area 3 — link flaps", accent: "l1" },
      ],
      boxes: [
        { x: 110, y: 124, w: 70, h: 38, title: "ABR", accent: "l4" },
        { x: 375, y: 124, w: 70, h: 38, title: "ABR", accent: "l5" },
        { x: 640, y: 124, w: 70, h: 38, title: "ABR", accent: "l1" },
        { x: 632, y: 200, w: 96, h: 40, title: "R ✗ flap", accent: "l1" },
      ],
      arrows: [
        { from: [330, 114], to: [160, 124] },
        { from: [410, 114], to: [410, 124] },
        { from: [490, 114], to: [665, 124] },
        { from: [145, 162], to: [145, 172] },
        { from: [410, 162], to: [410, 172] },
        { from: [675, 162], to: [675, 172] },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "OSPF areas: hierarchy contains the blast radius",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 276,
          text: "Each router has the full map of its own area and runs Dijkstra; ABRs summarize areas into the backbone.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 292,
          text: "A flap in Area 3 re-runs full Dijkstra only in Area 3; other areas just get a cheap summary update.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "OSPF splits a network into areas joined by a backbone (area 0); routers see the full topology only within their own area, so a flapping link's full SPF (Dijkstra) recomputation stays inside its area — other areas at most reprocess a summary LSA, a cheap partial update rather than a full re-run.",
    summary:
      "A backbone Area 0 with three leaf areas (1, 2, 3) attached through area border routers; a link flap in Area 3 triggers a full Dijkstra recomputation only within Area 3, while other areas merely reprocess an updated summary LSA.",
  },

  "bgp-policy": {
    scene: {
      width: 820,
      height: 322,
      boxes: [
        {
          x: 40,
          y: 120,
          w: 150,
          h: 70,
          title: "your AS",
          lines: ["best-path choice"],
          accent: "l3",
        },
        {
          x: 600,
          y: 44,
          w: 180,
          h: 56,
          title: "via Customer",
          lines: ["LOCAL_PREF 200"],
          accent: "l3",
        },
        {
          x: 600,
          y: 132,
          w: 180,
          h: 56,
          title: "via Peer",
          lines: ["LOCAL_PREF 100"],
          accent: "l5",
        },
        {
          x: 600,
          y: 220,
          w: 180,
          h: 56,
          title: "via Provider",
          lines: ["LOCAL_PREF 50"],
          accent: "l1",
        },
      ],
      arrows: [
        {
          from: [600, 72],
          to: [190, 142],
          accent: "l3",
          label: "① prefer (they pay)",
          labelDy: -6,
        },
        {
          from: [600, 160],
          to: [190, 158],
          accent: "l5",
          label: "② then peers (free)",
          labelDy: -6,
        },
        { from: [600, 248], to: [190, 176], accent: "l1", label: "③ last (you pay)", labelDy: 14 },
      ],
      notes: [
        { x: 410, y: 28, text: "BGP best-path: money first, hops later", size: 12, weight: 600 },
        {
          x: 410,
          y: 294,
          text: "All three reach the same prefix. LOCAL_PREF is checked before AS_PATH length, so your AS prefers",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 310,
          text: "the customer route (revenue), then peers (free), then providers (cost) — even if a provider path is shorter.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "BGP's best-path selection checks the operator's LOCAL_PREF before AS_PATH length, so an AS prefers routes learned from paying customers, then settlement-free peers, then providers it pays — revenue and cost outrank hop count.",
    summary:
      "Your AS receives the same prefix three ways — via a customer (LOCAL_PREF 200), a peer (100), and a provider (50); LOCAL_PREF is evaluated before path length, so the customer route wins even if a provider path has fewer hops.",
  },

  // ─── Layer 4 ───
  "tcp-bytestream": {
    scene: {
      width: 820,
      height: 282,
      boxes: [
        { x: 30, y: 84, w: 140, h: 38, title: "write() 100 B", accent: "l4" },
        { x: 30, y: 130, w: 140, h: 38, title: "write() 100 B", accent: "l4" },
        { x: 250, y: 104, w: 320, h: 44, title: "‹ 200 bytes · no boundaries ›", mono: true },
        { x: 650, y: 64, w: 140, h: 32, title: "read() 60 B" },
        { x: 650, y: 100, w: 140, h: 32, title: "read() 90 B" },
        { x: 650, y: 136, w: 140, h: 32, title: "read() 50 B" },
      ],
      arrows: [
        { from: [170, 103], to: [250, 120] },
        { from: [170, 149], to: [250, 130] },
        { from: [570, 120], to: [650, 80] },
        { from: [570, 126], to: [650, 116] },
        { from: [570, 132], to: [650, 152] },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "TCP is a byte stream: your bytes and order survive, your boundaries don't",
          size: 12,
          weight: 600,
        },
        { x: 100, y: 70, text: "sender", size: 10, opacity: 0.6 },
        { x: 720, y: 52, text: "receiver", size: 10, opacity: 0.6 },
        {
          x: 410,
          y: 246,
          text: "Two 100-byte writes may be read back as 60 + 90 + 50 bytes — or 200 at once.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 262,
          text: "So every protocol above TCP frames its own messages (Content-Length, length prefixes).",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "TCP guarantees your bytes and their order, but not your message boundaries: two 100-byte writes can be read back as any split of the 200 bytes. Every protocol above TCP must frame its own messages.",
    summary:
      "Two 100-byte writes merge into one 200-byte stream with no boundaries; the receiver may read it back as 60 + 90 + 50 bytes or 200 at once, so applications above TCP must frame their own messages.",
  },

  "udp-amplification": {
    scene: {
      width: 820,
      height: 288,
      boxes: [
        {
          x: 40,
          y: 120,
          w: 160,
          h: 64,
          title: "Attacker",
          lines: ["spoofs victim's IP"],
          accent: "l1",
        },
        { x: 350, y: 44, w: 190, h: 64, title: "Open server", lines: ["DNS / NTP / memcached"] },
        { x: 640, y: 190, w: 150, h: 64, title: "Victim", lines: ["flooded"], accent: "l1" },
      ],
      arrows: [
        { from: [200, 138], to: [350, 92], label: "small query · src = victim", labelDy: -8 },
        {
          from: [500, 108],
          to: [688, 190],
          accent: "l1",
          label: "huge reply — up to 51,200× (memcached)",
          labelDy: -10,
        },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "UDP reflection/amplification: no handshake, no proof of source",
          size: 12,
          weight: 600,
        },
        { x: 270, y: 150, text: "~15 B query", size: 9, opacity: 0.6 },
        { x: 560, y: 168, text: "~750 kB", size: 9, accent: "l1" },
        {
          x: 410,
          y: 258,
          text: "No handshake → an unverified source. A tiny spoofed query 'from' the victim triggers a far larger reply,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 274,
          text: "aimed at the victim. Defense: BCP 38 source filtering + response-size limits (QUIC's Retry verifies this).",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "UDP has no handshake, so a server can't tell a spoofed source from a real one. An attacker sends tiny queries with the victim's address as the source; the server's far-larger replies flood the victim — reflection/amplification DDoS.",
    summary:
      "An attacker sends small UDP queries spoofing the victim's source IP to an open DNS/NTP/memcached server, which sends replies up to tens of thousands of times larger to the victim, flooding it.",
  },

  "quic-migration": {
    scene: {
      width: 820,
      height: 296,
      boxes: [
        {
          x: 40,
          y: 60,
          w: 170,
          h: 58,
          title: "Phone · Wi-Fi",
          lines: ["src 10.0.0.5"],
          accent: "l4",
        },
        {
          x: 40,
          y: 182,
          w: 170,
          h: 58,
          title: "Phone · cellular",
          lines: ["src 100.64.0.9"],
          accent: "l5",
        },
        {
          x: 600,
          y: 120,
          w: 180,
          h: 70,
          title: "Server",
          lines: ["matches Connection ID,", "not the IP 4-tuple"],
          accent: "l3",
        },
      ],
      arrows: [
        { from: [210, 88], to: [600, 145], accent: "l4", label: "CID a1b2…", labelDy: -8 },
        {
          from: [210, 210],
          to: [600, 168],
          accent: "l5",
          label: "CID a1b2… — same connection",
          labelDy: 16,
        },
        {
          from: [125, 118],
          to: [125, 182],
          both: true,
          dashed: true,
          accent: "l1",
          label: "move",
          labelDx: -26,
        },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "QUIC connection migration: named by Connection ID, not the 4-tuple",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 262,
          text: "When the phone's IP changes (Wi-Fi → cellular) the Connection ID stays the same, so the connection",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 278,
          text: "continues after a quick path validation — TCP, pinned to the 4-tuple, would drop and reconnect.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A QUIC connection is identified by a Connection ID rather than the IP/port 4-tuple, so when a phone moves from Wi-Fi to cellular and its address changes, the same connection continues after a path-validation check — where TCP would break and reconnect.",
    summary:
      "A phone with an active QUIC connection (Connection ID a1b2) moves from Wi-Fi (one source IP) to cellular (another); because the server matches the Connection ID, not the 4-tuple, the connection survives the address change.",
  },
};

/** Render the diagram registered for a protocol slug. */
export function ProtocolDiagram({ id }: { id: string }) {
  const d = PROTOCOL_DIAGRAMS[id];
  if (!d) return null;
  return <RoughScene scene={d.scene} caption={d.caption} summary={d.summary} />;
}
