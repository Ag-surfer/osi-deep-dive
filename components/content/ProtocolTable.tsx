export interface ProtocolRow {
  name: string;
  fullName?: string;
  standard?: string;
  purpose: string;
}

/** A standards/protocols reference table used on every layer page. */
export function ProtocolTable({ rows }: { rows: ProtocolRow[] }) {
  return (
    <div
      className="my-6 overflow-x-auto rounded-lg border"
      style={{ borderColor: "var(--border)" }}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--bg-soft)" }}>
            <Th>Protocol</Th>
            <Th>Standard</Th>
            <Th>Purpose</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t" style={{ borderColor: "var(--border)" }}>
              <td className="px-3 py-2 align-top">
                <span className="font-mono font-semibold">{r.name}</span>
                {r.fullName ? (
                  <span className="block text-xs" style={{ color: "var(--fg-muted)" }}>
                    {r.fullName}
                  </span>
                ) : null}
              </td>
              <td
                className="px-3 py-2 align-top font-mono text-xs"
                style={{ color: "var(--fg-muted)" }}
              >
                {r.standard ?? "—"}
              </td>
              <td className="px-3 py-2 align-top">{r.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      {children}
    </th>
  );
}
