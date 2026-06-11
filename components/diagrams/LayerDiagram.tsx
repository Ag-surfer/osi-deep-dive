"use client";

import { RoughScene, type Scene } from "./RoughScene";

/**
 * Per-subtopic hand-drawn diagrams for the seven layer pages, keyed by
 * `<layer>-<subtopic>`. Embedded in MDX as `<LayerDiagram id="physical-qam" />`.
 * A test asserts every referenced id exists here.
 */
interface Diagram {
  scene: Scene;
  caption: string;
  summary: string;
}

// QAM constellation: a 4×4 grid of points around I/Q axes centered at (410,158).
const qamDots = (() => {
  const cx = 410,
    cy = 158,
    g = [-120, -40, 40, 120];
  const dots: Scene["dots"] = [];
  for (const qy of g) for (const ix of g) dots.push({ x: cx + ix, y: cy - qy, r: 5, accent: "l1" });
  return dots;
})();

export const LAYER_DIAGRAMS: Record<string, Diagram> = {
  // ───────── Physical (Layer 1) ─────────
  "physical-line-coding": {
    scene: {
      width: 820,
      height: 302,
      signals: [
        {
          x: 180,
          y: 78,
          width: 560,
          height: 36,
          bits: "01110001",
          encoding: "nrz",
          label: "NRZ",
          accent: "l1",
          showBits: true,
        },
        {
          x: 180,
          y: 188,
          width: 560,
          height: 36,
          bits: "01110001",
          encoding: "manchester",
          label: "Manchester",
          accent: "l1",
        },
      ],
      brackets: [{ x: 180, w: 70, y: 234, label: "transition every bit", accent: "l1" }],
      notes: [
        { x: 410, y: 42, text: "the same 8 bits, two line codes", size: 12, weight: 600 },
        {
          x: 410,
          y: 278,
          text: "NRZ: a long run of one value has no transitions, so the receiver's clock drifts.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 294,
          text: "Manchester forces a mid-bit transition every bit (self-clocking) — at 2× the bandwidth.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The same bit string in NRZ (level = bit) and Manchester (a mid-bit transition every bit, shown in the IEEE 802.3 convention where 1 = a rising edge). Self-clocking is what NRZ lacks on long runs.",
    summary:
      "Two waveforms of the bits 01110001: NRZ holds a level per bit and goes flat on repeated values, while Manchester puts a transition in the middle of every bit so the clock never drifts.",
  },

  "physical-qam": {
    scene: {
      width: 820,
      height: 320,
      polylines: [
        {
          points: [
            [250, 158],
            [570, 158],
          ],
        }, // I axis
        {
          points: [
            [410, 40],
            [410, 276],
          ],
        }, // Q axis
      ],
      dots: qamDots,
      notes: [
        { x: 410, y: 18, text: "16-QAM constellation", size: 12, weight: 600 },
        { x: 582, y: 162, text: "I", size: 12, anchor: "start", opacity: 0.7 },
        { x: 426, y: 36, text: "Q", size: 12, anchor: "start", opacity: 0.7 },
        {
          x: 410,
          y: 300,
          text: "16 points = 4 bits/symbol. 256-QAM = 8 bits, 1024-QAM = 10 — denser grids crowd the points,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 316,
          text: "so each needs higher SNR. Walk away from the router and it drops to a sparser grid.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Each constellation point is a distinct amplitude-and-phase symbol. More points carry more bits per symbol but sit closer together — so denser modulation demands a cleaner signal.",
    summary:
      "A 16-point QAM constellation on in-phase (I) and quadrature (Q) axes; 16 points encode 4 bits per symbol, and denser schemes pack points closer, requiring higher signal-to-noise ratio.",
  },

  "physical-multiplexing": {
    scene: {
      width: 820,
      height: 250,
      regions: [
        { x: 20, y: 36, w: 240, h: 158, label: "FDM — by frequency", accent: "l1" },
        { x: 290, y: 36, w: 240, h: 158, label: "TDM — by time", accent: "l2" },
        { x: 560, y: 36, w: 240, h: 158, label: "WDM — by wavelength", accent: "l4" },
      ],
      boxes: [
        { x: 40, y: 74, w: 200, h: 30, title: "User A — always on" },
        { x: 40, y: 110, w: 200, h: 30, title: "User B — always on" },
        { x: 40, y: 146, w: 200, h: 30, title: "User C — always on" },
        { x: 304, y: 110, w: 50, h: 40, title: "A" },
        { x: 360, y: 110, w: 50, h: 40, title: "B" },
        { x: 416, y: 110, w: 50, h: 40, title: "C" },
        { x: 472, y: 110, w: 50, h: 40, title: "A" },
        { x: 580, y: 104, w: 200, h: 40, title: "one fiber", lines: ["λ1 + λ2 + λ3 + …"] },
      ],
      notes: [
        {
          x: 410,
          y: 218,
          text: "Share one medium three ways. Statistical TDM — slots on demand, not fixed rotation —",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 234,
          text: "is packet switching itself, the internet's founding bet.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Three ways to share one medium: a frequency band each (FDM), the whole channel in rotating time slots (TDM), or a separate color of light each (WDM).",
    summary:
      "Three panels: FDM gives each user a frequency band continuously, TDM gives each the whole channel in rotating time slots, and WDM carries many wavelengths on one fiber at once.",
  },

  // ───────── Data Link (Layer 2) ─────────
  "datalink-mac": {
    scene: {
      width: 820,
      height: 230,
      regions: [
        { x: 104, y: 60, w: 304, h: 74, label: "OUI (24 bits) — the vendor", accent: "l2" },
        { x: 416, y: 60, w: 304, h: 74, label: "device (24 bits) — this NIC", accent: "l3" },
      ],
      boxes: [
        { x: 110, y: 84, w: 92, h: 42, title: "a4", mono: true },
        { x: 208, y: 84, w: 92, h: 42, title: "5e", mono: true },
        { x: 306, y: 84, w: 92, h: 42, title: "60", mono: true },
        { x: 422, y: 84, w: 92, h: 42, title: "1f", mono: true },
        { x: 520, y: 84, w: 92, h: 42, title: "cd", mono: true },
        { x: 618, y: 84, w: 92, h: 42, title: "02", mono: true },
      ],
      brackets: [{ x: 110, w: 92, y: 146, label: "byte 1 holds the I/G + U/L bits", accent: "l1" }],
      notes: [
        { x: 410, y: 40, text: "a MAC address: 48 bits, six hex bytes", size: 12, weight: 600 },
        {
          x: 410,
          y: 198,
          text: "I/G bit = unicast vs multicast · U/L bit = burned-in vs locally administered · ff:ff:ff:ff:ff:ff = broadcast.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A 48-bit MAC: the top 24 bits are the vendor's OUI, the bottom 24 identify the specific card. Two flag bits in byte 1 mark multicast and locally-administered addresses.",
    summary:
      "The MAC address a4:5e:60:1f:cd:02 split into a 24-bit OUI (a4:5e:60, the vendor) and a 24-bit device portion (1f:cd:02), with the I/G and U/L flag bits in the first byte.",
  },

  "datalink-hidden-terminal": {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        { x: -20, y: 55, w: 560, h: 150, ellipse: true },
        { x: 280, y: 55, w: 560, h: 150, ellipse: true },
        { x: 40, y: 112, w: 96, h: 46, title: "Laptop A" },
        { x: 362, y: 110, w: 96, h: 50, title: "Access Pt", accent: "l2" },
        { x: 684, y: 112, w: 96, h: 46, title: "Laptop C" },
      ],
      arrows: [
        { from: [136, 120], to: [362, 128], label: "in range" },
        { from: [684, 120], to: [458, 128], label: "in range" },
        {
          from: [136, 180],
          to: [684, 180],
          both: true,
          dashed: true,
          accent: "l1",
          label: "✗ A and C can't hear each other",
        },
      ],
      notes: [
        { x: 200, y: 78, text: "A's range", size: 10, opacity: 0.6 },
        { x: 620, y: 78, text: "C's range", size: 10, opacity: 0.6 },
        { x: 410, y: 100, text: "collide here ↓", size: 10, opacity: 0.6 },
        {
          x: 410,
          y: 232,
          text: "both sense an idle channel (neither hears the other) and transmit — colliding at the AP. 802.11's answer: CSMA/CA + link-layer ACKs + RTS/CTS.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "A and C are each in range of the access point but not of each other, so both think the channel is free and transmit — colliding at the AP. The hidden-terminal problem.",
    summary:
      "Two laptops on opposite sides of an access point: each is in the AP's range but out of the other's, so they transmit simultaneously and collide at the AP, unable to hear one another.",
  },

  // ───────── Network (Layer 3) ─────────
  "network-subnetting": {
    scene: {
      width: 820,
      height: 240,
      boxes: [
        {
          x: 290,
          y: 24,
          w: 240,
          h: 44,
          title: "192.0.2.0/24",
          lines: ["256 addresses"],
          accent: "l3",
          mono: true,
        },
        { x: 20, y: 124, w: 180, h: 60, title: ".0/26", lines: ["hosts .1–.62"], mono: true },
        { x: 210, y: 124, w: 180, h: 60, title: ".64/26", lines: ["hosts .65–.126"], mono: true },
        { x: 400, y: 124, w: 180, h: 60, title: ".128/26", lines: ["hosts .129–.190"], mono: true },
        { x: 590, y: 124, w: 180, h: 60, title: ".192/26", lines: ["hosts .193–.254"], mono: true },
      ],
      arrows: [
        { from: [340, 68], to: [110, 124] },
        { from: [380, 68], to: [300, 124] },
        { from: [440, 68], to: [490, 124] },
        { from: [480, 68], to: [680, 124] },
      ],
      notes: [
        {
          x: 410,
          y: 210,
          text: "borrow 2 host bits → 2² = 4 subnets, each 2^(32−26) = 64 addresses (62 usable).",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 228,
          text: "block size 64: the subnets start at .0, .64, .128, .192.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Splitting a /24 into four /26 subnets: borrow two host bits for 2² = 4 blocks of 64 addresses each (62 usable after the network and broadcast addresses).",
    summary:
      "The /24 network 192.0.2.0 divided into four /26 subnets of 64 addresses each: .0/26, .64/26, .128/26, and .192/26.",
  },

  "network-nat": {
    scene: {
      width: 820,
      height: 290,
      boxes: [
        { x: 20, y: 44, w: 150, h: 46, title: "Laptop", lines: ["192.168.1.23"], mono: true },
        { x: 20, y: 130, w: 150, h: 46, title: "Phone", lines: ["192.168.1.40"], mono: true },
        {
          x: 320,
          y: 78,
          w: 170,
          h: 70,
          title: "NAT router",
          lines: ["public 203.0.113.7"],
          accent: "l3",
          mono: true,
        },
        { x: 650, y: 88, w: 150, h: 56, title: "Server", lines: ["198.51.100.10"], mono: true },
      ],
      regions: [
        {
          x: 300,
          y: 168,
          w: 210,
          h: 58,
          label: "translation table",
          accent: "l3",
        },
      ],
      arrows: [
        { from: [170, 70], to: [320, 100], label: ".23:51000", labelDy: -8 },
        { from: [170, 150], to: [320, 128], label: ".40:49000", labelDy: 14 },
        { from: [490, 113], to: [650, 116], label: "203.0.113.7:62001 / :62002", labelDy: -8 },
      ],
      notes: [
        { x: 405, y: 196, text: "62001 ↔ 192.168.1.23:51000", size: 10, mono: true, opacity: 0.75 },
        { x: 405, y: 212, text: "62002 ↔ 192.168.1.40:49000", size: 10, mono: true, opacity: 0.75 },
        {
          x: 410,
          y: 256,
          text: "the router rewrites each private source IP+port to its public address + a unique port,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 272,
          text: "keeping a table to reverse it. One public IPv4 address multiplexes the whole network — PAT.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "NAT rewrites each outbound packet's private source to the router's public address and a unique port, recording the mapping so replies can be reversed back to the right device.",
    summary:
      "A laptop and phone with private addresses share one public IP through a NAT router, which maps each to a distinct public port (62001, 62002) in a translation table and reverses it for replies.",
  },

  // ───────── Transport (Layer 4) ─────────
  "transport-congestion": {
    scene: {
      width: 820,
      height: 318,
      polylines: [
        {
          points: [
            [60, 30],
            [60, 250],
          ],
        }, // y axis (cwnd)
        {
          points: [
            [60, 250],
            [770, 250],
          ],
        }, // x axis (time)
        {
          points: [
            [60, 92],
            [770, 92],
          ],
          dashed: true,
        }, // ssthresh
        {
          accent: "l4",
          width: 2,
          points: [
            [80, 248],
            [102, 236],
            [124, 210],
            [150, 156],
            [178, 102],
            [200, 92],
            [320, 50],
            [320, 156],
            [440, 78],
            [440, 168],
            [560, 90],
            [560, 174],
            [690, 102],
          ],
        },
      ],
      dots: [
        { x: 320, y: 50, accent: "l1" },
        { x: 440, y: 78, accent: "l1" },
        { x: 560, y: 90, accent: "l1" },
      ],
      notes: [
        { x: 56, y: 26, text: "cwnd", size: 11, anchor: "end", opacity: 0.7 },
        { x: 768, y: 266, text: "time →", size: 11, anchor: "end", opacity: 0.7 },
        { x: 90, y: 88, text: "ssthresh", size: 9, anchor: "start", opacity: 0.55 },
        { x: 150, y: 274, text: "slow start (exponential)", size: 10, opacity: 0.7 },
        { x: 470, y: 24, text: "AIMD: +1 segment per RTT, ×½ on loss", size: 10, opacity: 0.7 },
        { x: 320, y: 42, text: "loss", size: 9, accent: "l1" },
        {
          x: 410,
          y: 290,
          text: "Reno: ramp up fast, then add a segment per RTT and halve on loss — the sawtooth.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 306,
          text: "CUBIC smooths the recovery; BBR (v1) ignores loss and paces to measured bandwidth.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "TCP's congestion window over time: an exponential slow-start to the threshold, then additive-increase / multiplicative-decrease — the sawtooth that probes for bandwidth and backs off on loss.",
    summary:
      "A graph of TCP's congestion window versus time: it rises exponentially during slow start to a threshold, then climbs linearly and halves on each packet loss, producing a sawtooth pattern.",
  },

  "transport-flow-congestion": {
    scene: {
      width: 820,
      height: 250,
      boxes: [
        {
          x: 40,
          y: 56,
          w: 280,
          h: 66,
          title: "rwnd — flow control",
          lines: ["receiver's free buffer space"],
          accent: "l4",
        },
        {
          x: 40,
          y: 150,
          w: 280,
          h: 66,
          title: "cwnd — congestion control",
          lines: ["sender's estimate of the network"],
          accent: "l3",
        },
        { x: 470, y: 104, w: 200, h: 64, title: "send window", lines: ["= min(rwnd, cwnd)"] },
      ],
      arrows: [
        { from: [320, 89], to: [470, 124], label: "protects the receiver", labelDy: -8 },
        { from: [320, 183], to: [470, 148], label: "protects the network", labelDy: 14 },
        { from: [670, 136], to: [770, 136], label: "out" },
      ],
      notes: [
        {
          x: 410,
          y: 236,
          text: "two independent throttles — the receiver's buffer and the sender's congestion estimate. The smaller one wins, per round trip.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Two separate limits govern how much TCP sends: the receiver's advertised window (flow control) and the sender's congestion window (congestion control). The effective rate uses the smaller.",
    summary:
      "TCP's send window is the minimum of two values: rwnd (flow control, protecting the receiver's buffer) and cwnd (congestion control, protecting the network).",
  },

  // ───────── Session (Layer 5) ─────────
  "session-socket-lifecycle": {
    scene: {
      width: 820,
      height: 412,
      boxes: [
        {
          x: 70,
          y: 66,
          w: 200,
          h: 46,
          title: "socket()",
          lines: ["allocate an endpoint"],
          mono: true,
        },
        {
          x: 520,
          y: 66,
          w: 200,
          h: 46,
          title: "socket()",
          lines: ["allocate an endpoint"],
          mono: true,
        },
        {
          x: 70,
          y: 130,
          w: 200,
          h: 46,
          title: "bind() + listen()",
          lines: ["declare willingness"],
          mono: true,
        },
        {
          x: 70,
          y: 194,
          w: 200,
          h: 46,
          title: "accept()",
          lines: ["block for a client"],
          mono: true,
          accent: "l5",
        },
        {
          x: 520,
          y: 194,
          w: 200,
          h: 46,
          title: "connect()",
          lines: ["initiate the dialogue"],
          mono: true,
          accent: "l5",
        },
        { x: 70, y: 258, w: 200, h: 46, title: "send() / recv()", lines: ["converse"], mono: true },
        {
          x: 520,
          y: 258,
          w: 200,
          h: 46,
          title: "send() / recv()",
          lines: ["converse"],
          mono: true,
        },
        {
          x: 70,
          y: 322,
          w: 200,
          h: 46,
          title: "shutdown() → close()",
          lines: ["half-close, release"],
          mono: true,
        },
        {
          x: 520,
          y: 322,
          w: 200,
          h: 46,
          title: "shutdown() → close()",
          lines: ["half-close, release"],
          mono: true,
        },
      ],
      arrows: [
        {
          from: [520, 217],
          to: [270, 217],
          both: true,
          dashed: true,
          accent: "l5",
          label: "establish — drives TCP's 3-way handshake",
          labelDy: -10,
        },
        { from: [520, 281], to: [270, 281], both: true, label: "send()/recv()", labelDy: -10 },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "Berkeley sockets: a session lifecycle, named call by call",
          size: 12,
          weight: 600,
        },
        { x: 170, y: 54, text: "server", size: 12, weight: 600, accent: "l5" },
        { x: 620, y: 54, text: "client", size: 12, weight: 600, accent: "l5" },
        { x: 620, y: 158, text: "(waits)", size: 10, opacity: 0.5 },
        {
          x: 410,
          y: 388,
          text: "connect()/accept() establish the dialogue; send()/recv() converse the bytes.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 404,
          text: "shutdown(WR) half-closes one direction; close() releases — Layer 5's job list, frozen into an API.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The Berkeley sockets call sequence is a session lifecycle: socket() allocates an endpoint, connect()/accept() establish the dialogue (driving TCP's handshake), send()/recv() converse, and shutdown()/close() release it.",
    summary:
      "Two columns, server and client, of the socket calls: both socket(); the server adds bind()/listen()/accept() while the client calls connect(); the two meet to establish the connection, then both send()/recv() and finally shutdown()/close().",
  },

  "session-load-balancer": {
    scene: {
      width: 820,
      height: 326,
      boxes: [
        { x: 24, y: 128, w: 130, h: 54, title: "Browser", lines: ["one user"] },
        {
          x: 250,
          y: 120,
          w: 150,
          h: 70,
          title: "load balancer",
          lines: ["round-robin"],
          accent: "l5",
        },
        {
          x: 560,
          y: 44,
          w: 210,
          h: 56,
          title: "Server 1",
          lines: ["session: alice ✓"],
          accent: "l3",
        },
        { x: 560, y: 128, w: 210, h: 56, title: "Server 2", lines: ["no session ✗"], accent: "l1" },
        { x: 560, y: 212, w: 210, h: 56, title: "Server 3", lines: ["no session ✗"] },
      ],
      arrows: [
        { from: [154, 155], to: [250, 155], label: "requests" },
        {
          from: [400, 140],
          to: [560, 72],
          accent: "l3",
          label: "req 1 → creates session",
          labelDy: -8,
        },
        {
          from: [400, 168],
          to: [560, 156],
          accent: "l1",
          dashed: true,
          label: "req 2 → different box",
          labelDy: 16,
        },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "the load-balancer test: why scaling 1 → 3 servers logs users out",
          size: 12,
          weight: 600,
        },
        { x: 665, y: 198, text: "→ logged out!", size: 10, accent: "l1" },
        {
          x: 410,
          y: 296,
          text: "the session lived in one server's RAM; the load balancer sent the next request elsewhere.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 312,
          text: "fixes: sticky sessions · a shared session store (Redis) · signed tokens (JWT) the client carries.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Session state in one server's memory breaks the moment a load balancer routes the next request to a different server — the user appears logged out. Sticky sessions, a shared store, or signed tokens fix it.",
    summary:
      "A browser's requests go through a round-robin load balancer to three servers; the login session is created on Server 1, but the next request lands on Server 2, which has no session, logging the user out.",
  },

  // ───────── Presentation (Layer 6) ─────────
  "presentation-utf8": {
    scene: {
      width: 820,
      height: 258,
      boxes: [
        {
          x: 190,
          y: 102,
          w: 200,
          h: 66,
          title: "1100 0011",
          lines: ["= 0xC3"],
          mono: true,
          accent: "l6",
        },
        {
          x: 440,
          y: 102,
          w: 200,
          h: 66,
          title: "1010 1001",
          lines: ["= 0xA9"],
          mono: true,
          accent: "l6",
        },
      ],
      notes: [
        { x: 410, y: 30, text: "UTF-8 encodes 'é' (U+00E9) in two bytes", size: 12, weight: 600 },
        {
          x: 410,
          y: 64,
          text: "U+00E9 = 233 → 11 payload bits: 00011 101001",
          size: 12,
          mono: true,
        },
        { x: 290, y: 94, text: "lead byte (110…)", size: 10, opacity: 0.7 },
        { x: 540, y: 94, text: "continuation (10…)", size: 10, opacity: 0.7 },
        {
          x: 410,
          y: 202,
          text: "the 110 / 10 marker bits frame the payload 00011·101001 — the original 11 code-point bits.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 234,
          text: "send 0xC3 0xA9. Read those bytes as Latin-1 instead of UTF-8 and 'é' becomes 'Ã©' — mojibake.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "UTF-8 packs the 11-bit code point U+00E9 into a two-byte frame: a 110-prefixed lead byte and a 10-prefixed continuation byte, yielding 0xC3 0xA9.",
    summary:
      "The Unicode code point U+00E9 (233, the letter é) encoded in UTF-8 as the two bytes 0xC3 and 0xA9, with 110 and 10 marker bits framing the eleven payload bits 00011 101001.",
  },

  "presentation-endianness": {
    scene: {
      width: 820,
      height: 296,
      boxes: [
        { x: 236, y: 84, w: 84, h: 46, title: "0D", mono: true, accent: "l6" },
        { x: 324, y: 84, w: 84, h: 46, title: "0C", mono: true, accent: "l6" },
        { x: 412, y: 84, w: 84, h: 46, title: "0B", mono: true, accent: "l6" },
        { x: 500, y: 84, w: 84, h: 46, title: "0A", mono: true, accent: "l6" },
        { x: 236, y: 200, w: 84, h: 46, title: "0A", mono: true, accent: "l6" },
        { x: 324, y: 200, w: 84, h: 46, title: "0B", mono: true, accent: "l6" },
        { x: 412, y: 200, w: 84, h: 46, title: "0C", mono: true, accent: "l6" },
        { x: 500, y: 200, w: 84, h: 46, title: "0D", mono: true, accent: "l6" },
      ],
      arrows: [
        {
          from: [624, 130],
          to: [624, 200],
          both: true,
          dashed: true,
          accent: "l6",
          label: "htonl() / ntohl()",
          labelDx: 34,
        },
      ],
      notes: [
        {
          x: 410,
          y: 30,
          text: "One 32-bit value 0x0A0B0C0D — two byte orders",
          size: 12,
          weight: 600,
        },
        {
          x: 410,
          y: 70,
          text: "little-endian (x86/ARM RAM): least-significant byte at the lowest address",
          size: 11,
          opacity: 0.85,
        },
        { x: 278, y: 152, text: "addr 0 (low)", size: 9, opacity: 0.6 },
        { x: 542, y: 152, text: "addr 3 (high)", size: 9, opacity: 0.6 },
        {
          x: 410,
          y: 186,
          text: "big-endian = network byte order (RFC 791): most-significant byte first",
          size: 11,
          opacity: 0.85,
        },
        {
          x: 410,
          y: 278,
          text: "skip the swap and port 80 (0x0050) reads as 20480 (0x5000) — the bug every network coder writes once.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The same 32-bit value sits as 0D 0C 0B 0A in little-endian memory but must travel most-significant-byte-first as 0A 0B 0C 0D — network byte order. htonl()/ntohl() own the swap.",
    summary:
      "The number 0x0A0B0C0D stored little-endian in x86 memory as the bytes 0D 0C 0B 0A, versus big-endian network byte order 0A 0B 0C 0D; htonl converts host order to network order.",
  },

  // ───────── Application (Layer 7) ─────────
  "application-page-load-rtts": {
    scene: {
      width: 820,
      height: 312,
      boxes: [
        { x: 120, y: 86, w: 150, h: 50, title: "DNS", lines: ["~1 RTT"], accent: "l7" },
        { x: 278, y: 86, w: 150, h: 50, title: "TCP", lines: ["1 RTT — handshake"], accent: "l4" },
        { x: 436, y: 86, w: 150, h: 50, title: "TLS 1.3", lines: ["1 RTT"], accent: "l6" },
        { x: 594, y: 86, w: 150, h: 50, title: "HTTP", lines: ["1 RTT → 1st byte"], accent: "l7" },
        {
          x: 120,
          y: 222,
          w: 300,
          h: 50,
          title: "QUIC = transport + TLS",
          lines: ["1 RTT, combined"],
          accent: "l4",
        },
        {
          x: 430,
          y: 222,
          w: 220,
          h: 50,
          title: "0-RTT resume",
          lines: ["data on first flight"],
          accent: "l3",
        },
      ],
      brackets: [
        {
          x: 120,
          w: 624,
          y: 150,
          label: "≈ 4 RTTs ≈ 400 ms on a 100 ms-RTT link — all latency",
          accent: "l1",
        },
        { x: 120, w: 300, y: 286, label: "1 RTT (0 on resume)", accent: "l3" },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "First-byte latency: ~4 round trips of setup before content arrives",
          size: 12,
          weight: 600,
        },
        {
          x: 120,
          y: 78,
          text: "cold load (nothing cached):",
          size: 10,
          opacity: 0.7,
          anchor: "start",
        },
        {
          x: 120,
          y: 214,
          text: "HTTP/3 folds it together:",
          size: 10,
          opacity: 0.7,
          anchor: "start",
        },
      ],
    },
    caption:
      "A cold HTTPS load pays a round trip at each layer — DNS, TCP, TLS, then HTTP — so first-byte time is ~4 RTTs of pure latency. HTTP/3 over QUIC folds transport and TLS into one (zero on resume).",
    summary:
      "Loading a page cold costs four sequential round trips — DNS, TCP handshake, TLS handshake, then the HTTP request — about 400 ms on a 100 ms link; QUIC combines transport and TLS setup into a single round trip.",
  },

  "application-http-hol": {
    scene: {
      width: 820,
      height: 318,
      regions: [
        {
          x: 40,
          y: 52,
          w: 740,
          h: 64,
          label: "HTTP/1.1 — responses return in strict order",
          accent: "l7",
        },
        {
          x: 40,
          y: 130,
          w: 740,
          h: 64,
          label: "HTTP/2 — streams multiplexed on one TCP byte stream",
          accent: "l4",
        },
        {
          x: 40,
          y: 208,
          w: 740,
          h: 64,
          label: "HTTP/3 / QUIC — independent streams",
          accent: "l3",
        },
      ],
      boxes: [
        { x: 110, y: 78, w: 110, h: 30, title: "① slow", mono: true, accent: "l1" },
        { x: 250, y: 78, w: 110, h: 30, title: "② waits", mono: true },
        { x: 390, y: 78, w: 110, h: 30, title: "③ waits", mono: true },
        { x: 110, y: 156, w: 110, h: 30, title: "stream A", mono: true },
        { x: 250, y: 156, w: 110, h: 30, title: "stream B", mono: true },
        { x: 390, y: 156, w: 110, h: 30, title: "stream C", mono: true },
        { x: 110, y: 234, w: 110, h: 30, title: "A ✗ waits", mono: true, accent: "l1" },
        { x: 250, y: 234, w: 110, h: 30, title: "B ✓", mono: true, accent: "l3" },
        { x: 390, y: 234, w: 110, h: 30, title: "C ✓", mono: true, accent: "l3" },
      ],
      notes: [
        {
          x: 410,
          y: 28,
          text: "Head-of-line blocking: the thread from HTTP/1.1 → /2 → /3",
          size: 12,
          weight: 600,
        },
        {
          x: 540,
          y: 97,
          text: "B, C blocked behind slow A",
          size: 10,
          opacity: 0.7,
          anchor: "start",
        },
        {
          x: 540,
          y: 175,
          text: "✗ a lost segment stalls all 3",
          size: 10,
          accent: "l1",
          anchor: "start",
        },
        {
          x: 540,
          y: 253,
          text: "loss in A; B and C still arrive",
          size: 10,
          accent: "l3",
          anchor: "start",
        },
        {
          x: 410,
          y: 300,
          text: "Same GET / 200 OK semantics throughout — each fix exposed the next bottleneck, until QUIC made one stream's bad luck private.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The head-of-line story in three rows: HTTP/1.1 blocks at the application (ordered responses), HTTP/2 multiplexes streams but still blocks at the transport (one lost TCP segment stalls all), and HTTP/3's QUIC streams are independent — one loss blocks only its own stream.",
    summary:
      "Three rows comparing head-of-line blocking: HTTP/1.1 forces responses in order so a slow one blocks the rest; HTTP/2 shares one TCP stream so a lost segment stalls all streams; HTTP/3 over QUIC keeps streams independent so loss in one does not block the others.",
  },
};

/** Render the diagram registered for a layer-subtopic id. */
export function LayerDiagram({ id }: { id: string }) {
  const d = LAYER_DIAGRAMS[id];
  if (!d) return null;
  return <RoughScene scene={d.scene} caption={d.caption} summary={d.summary} />;
}
