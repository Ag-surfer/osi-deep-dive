"use client";

import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import type { DecisionStep } from "@/lib/algorithms/bgpBestPath";

const GREEN = SKETCH.l3!;

export interface DecisionColumn {
  key: string;
  label: string;
}

export interface DecisionRow {
  /** Stable id matching the step's eliminated/winner ids. */
  id: string;
  /** Cell text keyed by column key. */
  [key: string]: string;
}

/** The elimination table for one decision step. */
function TableStep({
  step,
  columns,
  rows,
  index,
  total,
}: {
  step: DecisionStep;
  columns: DecisionColumn[];
  rows: DecisionRow[];
  index: number;
  total: number;
}) {
  const elim = new Set(step.eliminated);

  return (
    <div className="overflow-x-auto p-4">
      <table
        className="w-full text-sm"
        role="img"
        aria-label={`Step ${index + 1} of ${total}: ${step.narration}`}
      >
        <thead>
          <tr>
            {columns.map((c) => {
              const deciding = c.key === step.decidingAttr;
              return (
                <th
                  key={c.key}
                  className="border-b px-2 py-1.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap uppercase"
                  style={{
                    borderColor: deciding ? GREEN : "var(--border)",
                    borderBottomWidth: deciding ? 2 : 1,
                    color: deciding ? GREEN : "var(--fg-muted)",
                  }}
                >
                  {c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isElim = elim.has(row.id);
            const isWinner = step.winnerId === row.id;
            return (
              <tr
                key={row.id}
                style={{
                  opacity: isElim ? 0.4 : 1,
                  backgroundColor: isWinner ? "rgba(79,161,94,0.14)" : undefined,
                  fontWeight: isWinner ? 600 : undefined,
                }}
              >
                {columns.map((c, ci) => {
                  const deciding = c.key === step.decidingAttr && !isElim;
                  return (
                    <td
                      key={c.key}
                      className="border-b px-2 py-1.5 whitespace-nowrap"
                      style={{
                        borderColor: "var(--border)",
                        fontFamily: ci <= 1 ? undefined : "var(--font-mono)",
                        textDecoration: isElim ? "line-through" : undefined,
                        color: deciding ? GREEN : isElim ? "var(--fg-muted)" : "var(--fg)",
                        fontWeight: deciding ? 700 : undefined,
                        borderLeft:
                          isWinner && ci === 0 ? `3px solid ${GREEN}` : "3px solid transparent",
                      }}
                    >
                      {ci === 0 && isWinner ? "★ " : ""}
                      {row[c.key] ?? ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A step-driven *elimination table* player: candidate rows are progressively
 * struck out as each ordered rule fires, the deciding column is highlighted, and
 * the surviving winner is starred. Used for BGP best-path selection; reusable for
 * any "apply rules in order until one remains" algorithm. Chrome (controls,
 * narration, keyboard, a11y) comes from the shared `StepPlayer`.
 */
export function DecisionTableViz({
  title,
  summary,
  caption,
  columns,
  rows,
  steps,
}: {
  title?: string;
  summary: string;
  caption?: string;
  columns: DecisionColumn[];
  rows: DecisionRow[];
  steps: DecisionStep[];
}) {
  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={caption}
      stepCount={steps.length}
      narration={(i) => steps[i]?.narration ?? ""}
      renderStep={(i) => (
        <TableStep step={steps[i]!} columns={columns} rows={rows} index={i} total={steps.length} />
      )}
    />
  );
}
