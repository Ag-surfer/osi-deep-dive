import { AnimatedFigure } from "../AnimatedFigure";

const PHASES = ["establish", "exchange", "release"];

/** L5: a session opens, exchanges data back and forth, then closes. */
export function SessionLifecycle() {
  return (
    <AnimatedFigure
      summary="A session between a client and server: it is first established, then data is exchanged back and forth, and finally released."
      caption="The Session layer opens a dialogue, keeps it synchronized while data flows both ways, then tears it down."
    >
      <svg viewBox="0 0 600 150" width="100%" style={{ maxWidth: 600, color: "var(--fg)" }}>
        <style>{`
          @keyframes sesbounce { 0%,100% { transform: translateX(0) } 50% { transform: translateX(372px) } }
          .ses-dot { animation: sesbounce 2.6s ease-in-out infinite; }
          @keyframes sesphase { 0%,100% { opacity:.4 } 25% { opacity:1 } }
          .sp0 { animation: sesphase 2.6s steps(1) infinite; }
        `}</style>

        {/* phase track */}
        {PHASES.map((p, i) => (
          <g key={p}>
            <rect
              x={50 + i * 170}
              y={20}
              width={160}
              height={20}
              rx={4}
              fill="var(--bg)"
              stroke="var(--border)"
            />
            <text
              x={130 + i * 170}
              y={34}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="var(--fg-muted)"
            >
              {p}
            </text>
          </g>
        ))}

        {/* endpoints */}
        <rect
          x={40}
          y={78}
          width={80}
          height={40}
          rx={6}
          fill="var(--bg)"
          stroke="currentColor"
          strokeWidth={1.6}
        />
        <text x={80} y={103} textAnchor="middle" fontSize={13} fontWeight={600}>
          Client
        </text>
        <rect
          x={480}
          y={78}
          width={80}
          height={40}
          rx={6}
          fill="var(--bg)"
          stroke="currentColor"
          strokeWidth={1.6}
        />
        <text x={520} y={103} textAnchor="middle" fontSize={13} fontWeight={600}>
          Server
        </text>

        {/* dialogue line + bouncing pulse */}
        <line
          x1={120}
          y1={98}
          x2={480}
          y2={98}
          stroke="var(--color-layer-5)"
          strokeWidth={2}
          strokeDasharray="4 5"
        />
        <g transform="translate(120,98)">
          <circle className="ses-dot" r={7} fill="var(--color-layer-5)" />
        </g>
      </svg>
    </AnimatedFigure>
  );
}
