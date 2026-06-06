export interface SeqStep {
  /** Index of the sending actor. */
  from: number;
  /** Index of the receiving actor (equal to `from` for a self-action). */
  to: number;
  /** Message/label text. */
  label: string;
  /** Dashed line for replies/acks. */
  dashed?: boolean;
}

/**
 * A lightweight UML-style sequence diagram rendered as static, accessible SVG —
 * used for handshakes and exchanges (TCP 3-way, TLS, ARP, DNS). A visually
 * hidden ordered list mirrors the steps for screen readers.
 */
export function SequenceDiagram({
  actors,
  steps,
  caption,
}: {
  actors: string[];
  steps: SeqStep[];
  caption?: string;
}) {
  const colW = 200;
  const padX = 20;
  const headH = 40;
  const stepH = 56;
  const width = padX * 2 + colW * (actors.length - 1) + 120;
  const height = headH + stepH * steps.length + 30;
  const actorX = (i: number) => padX + 60 + i * colW;

  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width, color: "var(--fg)" }}
          role="img"
          aria-label={caption ?? "Sequence diagram"}
        >
          <defs>
            <marker
              id="seq-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Actor headers + lifelines */}
          {actors.map((a, i) => (
            <g key={a}>
              <rect
                x={actorX(i) - 55}
                y={6}
                width={110}
                height={28}
                rx={6}
                fill="var(--bg)"
                stroke="var(--border)"
              />
              <text
                x={actorX(i)}
                y={24}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill="currentColor"
              >
                {a}
              </text>
              <line
                x1={actorX(i)}
                y1={headH}
                x2={actorX(i)}
                y2={height - 10}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
            </g>
          ))}

          {/* Messages */}
          {steps.map((s, i) => {
            const y = headH + 30 + i * stepH;
            const x1 = actorX(s.from);
            const x2 = actorX(s.to);
            const self = s.from === s.to;
            return (
              <g key={i} style={{ color: "var(--color-layer-5)" }}>
                {self ? (
                  <path
                    d={`M ${x1} ${y} h 40 v 22 h -36`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeDasharray={s.dashed ? "5 4" : undefined}
                    markerEnd="url(#seq-arrow)"
                  />
                ) : (
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeDasharray={s.dashed ? "5 4" : undefined}
                    markerEnd="url(#seq-arrow)"
                  />
                )}
                <text
                  x={self ? x1 + 50 : (x1 + x2) / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize={12}
                  fill="var(--fg)"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible fallback */}
      <ol className="sr-only">
        {steps.map((s, i) => (
          <li key={i}>
            {actors[s.from]} → {actors[s.to]}: {s.label}
          </li>
        ))}
      </ol>

      {caption ? (
        <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
