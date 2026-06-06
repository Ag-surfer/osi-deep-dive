import { AnimatedFigure } from "../AnimatedFigure";

const BOXES = [1, 2, 3, 4, 5, 6, 7, 8];
const BW = 60;
const GAP = 6;
const X0 = 44;

/** L4: a TCP send window slides right over the byte stream as ACKs arrive. */
export function SlidingWindow() {
  const winW = 4 * BW + 3 * GAP;
  return (
    <AnimatedFigure
      summary="A row of eight numbered segments. A send window covering four segments slides to the right as earlier segments are acknowledged, allowing new ones to be sent."
      caption="The send window bounds how many bytes may be in flight; as ACKs arrive it slides right, releasing new segments."
    >
      <svg viewBox="0 0 640 150" width="100%" style={{ maxWidth: 640, color: "var(--fg)" }}>
        <style>{`
          @keyframes winslide { 0%,8% { transform: translateX(0) } 92%,100% { transform: translateX(${4 * (BW + GAP)}px) } }
          .win-g { animation: winslide 5s ease-in-out infinite; }
        `}</style>

        <text x={X0} y={28} fontSize={12} fontWeight={600} fill="var(--fg-muted)">
          Byte stream →
        </text>

        {/* segments */}
        {BOXES.map((b, i) => (
          <g key={b}>
            <rect
              x={X0 + i * (BW + GAP)}
              y={44}
              width={BW}
              height={48}
              rx={6}
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth={1.5}
            />
            <text
              x={X0 + i * (BW + GAP) + BW / 2}
              y={73}
              textAnchor="middle"
              fontSize={13}
              fontFamily="var(--font-mono)"
              fill="var(--fg-muted)"
            >
              {b}
            </text>
          </g>
        ))}

        {/* sliding window */}
        <g className="win-g">
          <rect
            x={X0 - 4}
            y={38}
            width={winW + 8}
            height={60}
            rx={8}
            fill="color-mix(in oklch, var(--color-layer-4) 16%, transparent)"
            stroke="var(--color-layer-4)"
            strokeWidth={2.5}
          />
          <text
            x={X0 + winW / 2}
            y={120}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill="var(--color-layer-4)"
          >
            send window
          </text>
        </g>
      </svg>
    </AnimatedFigure>
  );
}
