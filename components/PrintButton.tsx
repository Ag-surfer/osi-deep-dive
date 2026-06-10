"use client";

/** Triggers the browser's print dialog (the page carries print-optimized styles). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md px-4 py-2 text-sm font-semibold print:hidden"
      style={{ backgroundColor: "var(--color-layer-3)", color: "var(--on-accent)" }}
    >
      🖨 Print / save as PDF
    </button>
  );
}
