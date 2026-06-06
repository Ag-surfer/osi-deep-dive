import { AnimatedFigure } from "../AnimatedFigure";

/** L7: a client sends an HTTP request and the server returns a response. */
export function HttpRoundTrip() {
  return (
    <AnimatedFigure
      summary="A client sends an HTTP GET request to a server; the server processes it and returns a 200 OK response."
      caption="The Application layer exchange: a request travels to the server, which replies — the round trip that gates page-load latency."
    >
      <svg viewBox="0 0 600 160" width="100%" style={{ maxWidth: 600, color: "var(--fg)" }}>
        <style>{`
          @keyframes reqgo { 0% { transform: translateX(0); opacity:0 } 5% { opacity:1 } 40% { transform: translateX(330px); opacity:1 } 45%,100% { transform: translateX(330px); opacity:0 } }
          .http-req { animation: reqgo 4s linear infinite; }
          @keyframes respgo { 0%,50% { transform: translateX(0); opacity:0 } 55% { opacity:1 } 90% { transform: translateX(-330px); opacity:1 } 95%,100% { transform: translateX(-330px); opacity:0 } }
          .http-resp { animation: respgo 4s linear infinite; }
          @keyframes srvthink { 0%,45% { opacity:0 } 47%,53% { opacity:1 } 55%,100% { opacity:0 } }
          .http-think { animation: srvthink 4s linear infinite; }
        `}</style>

        {/* endpoints */}
        <rect
          x={30}
          y={56}
          width={96}
          height={48}
          rx={8}
          fill="var(--bg)"
          stroke="currentColor"
          strokeWidth={1.6}
        />
        <text x={78} y={78} textAnchor="middle" fontSize={13} fontWeight={600}>
          Client
        </text>
        <text x={78} y={96} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          browser
        </text>

        <rect
          x={474}
          y={56}
          width={96}
          height={48}
          rx={8}
          fill="var(--bg)"
          stroke="var(--color-layer-7)"
          strokeWidth={1.8}
        />
        <text x={522} y={78} textAnchor="middle" fontSize={13} fontWeight={600}>
          Server
        </text>
        <circle className="http-think" cx={522} cy={94} r={4} fill="var(--color-layer-7)" />

        <line
          x1={126}
          y1={80}
          x2={474}
          y2={80}
          stroke="var(--border)"
          strokeWidth={1.5}
          strokeDasharray="3 5"
        />

        {/* request packet (top) */}
        <g className="http-req" transform="translate(132,66)">
          <rect x={0} y={0} width={64} height={20} rx={4} fill="var(--color-layer-7)" />
          <text
            x={32}
            y={14}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="var(--on-accent)"
            fontWeight={700}
          >
            GET /
          </text>
        </g>

        {/* response packet (bottom) */}
        <g className="http-resp" transform="translate(404,92)">
          <rect
            x={0}
            y={0}
            width={68}
            height={20}
            rx={4}
            fill="var(--bg)"
            stroke="var(--color-layer-7)"
            strokeWidth={1.5}
          />
          <text
            x={34}
            y={14}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="var(--color-layer-7)"
            fontWeight={700}
          >
            200 OK
          </text>
        </g>
      </svg>
    </AnimatedFigure>
  );
}
