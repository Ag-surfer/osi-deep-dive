import { AnimatedFigure } from "../AnimatedFigure";

/** L6: plaintext is transformed into ciphertext (TLS encryption) before transmission. */
export function EncryptionTransform() {
  return (
    <AnimatedFigure
      summary="The plaintext 'Hello' passes through TLS encryption and becomes ciphertext (a8 3f c1 e0…) before being sent on the wire."
      caption="The Presentation layer encrypts the application's data — what travels the wire is ciphertext, not plaintext."
    >
      <svg viewBox="0 0 600 140" width="100%" style={{ maxWidth: 600, color: "var(--fg)" }}>
        <style>{`
          @keyframes enctravel { 0% { transform: translateX(0); opacity:0 } 10% { opacity:1 } 90% { opacity:1 } 100% { transform: translateX(430px); opacity:0 } }
          .enc-dot { animation: enctravel 3s ease-in-out infinite; }
          @keyframes enclock { 0%,100% { transform: scale(1) } 45%,55% { transform: scale(1.12) } }
          .enc-lock { animation: enclock 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes encflick { 0%,40% { opacity:.25 } 60%,100% { opacity:1 } }
          .enc-cipher { animation: encflick 3s steps(1) infinite; }
        `}</style>

        {/* plaintext */}
        <rect
          x={30}
          y={48}
          width={120}
          height={44}
          rx={6}
          fill="var(--bg)"
          stroke="currentColor"
          strokeWidth={1.6}
        />
        <text
          x={90}
          y={75}
          textAnchor="middle"
          fontSize={16}
          fontFamily="var(--font-mono)"
          fontWeight={600}
        >
          Hello
        </text>
        <text x={90} y={108} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
          plaintext
        </text>

        {/* lock */}
        <g className="enc-lock">
          <rect x={278} y={58} width={44} height={34} rx={6} fill="var(--color-layer-6)" />
          <path
            d="M286 58 v-8 a14 14 0 0 1 28 0 v8"
            fill="none"
            stroke="var(--color-layer-6)"
            strokeWidth={5}
          />
          <circle cx={300} cy={74} r={4} fill="var(--on-accent)" />
        </g>
        <text x={300} y={112} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
          TLS
        </text>

        {/* ciphertext */}
        <rect
          x={448}
          y={48}
          width={130}
          height={44}
          rx={6}
          fill="var(--bg)"
          stroke="var(--color-layer-6)"
          strokeWidth={1.6}
        />
        <text
          className="enc-cipher"
          x={513}
          y={75}
          textAnchor="middle"
          fontSize={14}
          fontFamily="var(--font-mono)"
          fill="var(--color-layer-6)"
        >
          a8 3f c1 e0
        </text>
        <text x={513} y={108} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
          ciphertext
        </text>

        {/* connectors + traveling dot */}
        <line x1={150} y1={70} x2={278} y2={70} stroke="var(--border)" strokeWidth={2} />
        <line x1={322} y1={70} x2={448} y2={70} stroke="var(--border)" strokeWidth={2} />
        <g transform="translate(150,70)">
          <circle className="enc-dot" r={6} fill="var(--color-layer-6)" />
        </g>
      </svg>
    </AnimatedFigure>
  );
}
