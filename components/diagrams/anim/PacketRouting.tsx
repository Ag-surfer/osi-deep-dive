import { AnimatedFigure } from "../AnimatedFigure";

const NODES = [
  { x: 55, label: "Source", kind: "host" },
  { x: 190, label: "R1", kind: "router" },
  { x: 325, label: "R2", kind: "router" },
  { x: 460, label: "R3", kind: "router" },
  { x: 600, label: "Dest", kind: "host" },
] as const;

const TTL = [64, 63, 62, 61];

/** L3: a packet hops Source→R1→R2→R3→Dest while its TTL decrements at each router. */
export function PacketRouting() {
  return (
    <AnimatedFigure
      summary="A packet travels from Source through routers R1, R2, R3 to Destination. Its TTL starts at 64 and is decremented to 63, 62, then 61 — one per router hop."
      caption="Each router decrements the packet's TTL; at 0 it would be dropped. The IP addresses stay fixed end-to-end."
    >
      <svg viewBox="0 0 640 140" width="100%" style={{ maxWidth: 640, color: "var(--fg)" }}>
        <style>{`
          @keyframes pkthop { 0% { transform: translateX(0) } 92%,100% { transform: translateX(545px) } }
          .pkt-g { animation: pkthop 4s cubic-bezier(.5,0,.5,1) infinite; }
        `}</style>

        {/* links + TTL labels */}
        {NODES.slice(0, -1).map((n, i) => (
          <g key={i}>
            <line
              x1={n.x}
              y1={60}
              x2={NODES[i + 1]!.x}
              y2={60}
              stroke="var(--border)"
              strokeWidth={2}
            />
            <text
              x={(n.x + NODES[i + 1]!.x) / 2}
              y={84}
              textAnchor="middle"
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="var(--fg-muted)"
            >
              TTL {TTL[i]}
            </text>
          </g>
        ))}

        {/* nodes */}
        {NODES.map((n) => (
          <g key={n.label}>
            {n.kind === "router" ? (
              <circle
                cx={n.x}
                cy={60}
                r={16}
                fill="var(--bg)"
                stroke="var(--color-layer-3)"
                strokeWidth={2}
              />
            ) : (
              <rect
                x={n.x - 18}
                y={44}
                width={36}
                height={32}
                rx={5}
                fill="var(--bg)"
                stroke="currentColor"
                strokeWidth={1.6}
              />
            )}
            <text
              x={n.x}
              y={30}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="currentColor"
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* the traveling packet */}
        <g className="pkt-g">
          <g transform="translate(55,60)">
            <rect x={-9} y={-9} width={18} height={18} rx={3} fill="var(--color-layer-3)" />
            <rect
              x={-9}
              y={-9}
              width={18}
              height={6}
              rx={2}
              fill="var(--on-accent)"
              opacity={0.35}
            />
          </g>
        </g>
      </svg>
    </AnimatedFigure>
  );
}
