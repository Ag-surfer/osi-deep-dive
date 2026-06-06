import { AnimatedFigure } from "../AnimatedFigure";

const WAVE = "M40 70 H140 V130 H240 V70 H440 V130 H540";
const BITS = ["1", "0", "1", "1", "0"];

/** L1: a bit pattern encoded as an NRZ square wave, with a pulse traveling the wire. */
export function SignalWire() {
  return (
    <AnimatedFigure
      summary="A bit sequence 1 0 1 1 0 is encoded as a non-return-to-zero square wave; a pulse travels along the signal from sender to receiver."
      caption="Bits become voltage levels (NRZ line coding); the pulse is the signal propagating along the medium."
    >
      <svg viewBox="0 0 580 170" width="100%" style={{ maxWidth: 580, color: "var(--fg)" }}>
        <style>{`
          @keyframes sigrun { to { offset-distance: 100%; } }
          .sw-pulse {
            offset-path: path("${WAVE}");
            offset-rotate: 0deg;
            animation: sigrun 3s linear infinite;
          }
          @keyframes swglow { 0%,100% { opacity: .25 } 50% { opacity: .6 } }
          .sw-glow { animation: swglow 3s linear infinite; }
        `}</style>

        {/* bit cells + labels */}
        {BITS.map((b, i) => (
          <g key={i}>
            <line
              x1={40 + i * 100}
              y1={20}
              x2={40 + i * 100}
              y2={150}
              stroke="var(--border)"
              strokeDasharray="2 4"
            />
            <text
              x={90 + i * 100}
              y={36}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill={b === "1" ? "var(--color-layer-1)" : "var(--fg-muted)"}
            >
              {b}
            </text>
          </g>
        ))}
        <line x1={540} y1={20} x2={540} y2={150} stroke="var(--border)" strokeDasharray="2 4" />

        {/* level guides */}
        <text x={18} y={74} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          +V
        </text>
        <text x={18} y={134} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          0
        </text>

        {/* the NRZ waveform */}
        <path d={WAVE} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />

        {/* traveling pulse (the whole group rides the waveform) */}
        <g className="sw-pulse">
          <circle className="sw-glow" r={11} fill="var(--color-layer-1)" />
          <circle r={6} fill="var(--color-layer-1)" />
        </g>
      </svg>
    </AnimatedFigure>
  );
}
