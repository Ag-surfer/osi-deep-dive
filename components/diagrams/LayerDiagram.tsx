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
};

/** Render the diagram registered for a layer-subtopic id. */
export function LayerDiagram({ id }: { id: string }) {
  const d = LAYER_DIAGRAMS[id];
  if (!d) return null;
  return <RoughScene scene={d.scene} caption={d.caption} summary={d.summary} />;
}
