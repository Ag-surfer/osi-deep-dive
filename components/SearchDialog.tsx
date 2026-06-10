"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchRecords } from "@/lib/search";
import type { SearchRecord } from "@/lib/searchIndex";

const TYPE_LABEL: Record<SearchRecord["type"], string> = {
  layer: "Layer",
  section: "Section",
  glossary: "Glossary",
  question: "Interview Q",
  page: "Page",
};

/**
 * Site-wide search: a header button (and Cmd/Ctrl-K) opening a native
 * <dialog> — which gives focus trapping, Esc-to-close, and a backdrop for
 * free. The index is emitted at build time as /search-index.json and
 * fetched lazily on first open, so it never weighs down page HTML.
 */
export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = records ? searchRecords(records, query) : [];

  function open() {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
    if (records === null) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search-index.json`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: SearchRecord[]) => setRecords(data))
        .catch(() => setRecords([]));
    }
  }

  function close() {
    dialogRef.current?.close();
    setQuery("");
    setActive(0);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search the site"
        className="inline-flex h-9 items-center gap-2 rounded-md border px-2.5 text-sm"
        style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <kbd className="hidden font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => {
          // Click on the backdrop (the dialog element itself) closes.
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-full max-w-xl rounded-xl border p-0 shadow-xl backdrop:bg-black/40"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
        aria-label="Site search"
      >
        <div className="p-3">
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `result-${results[active].id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (results.length > 0) setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                go(results[active].href);
              }
            }}
            placeholder="Search layers, terms, questions…"
            aria-label="Search query"
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
          />
          <ul
            id="search-results"
            role="listbox"
            aria-label="Search results"
            className="mt-2 max-h-80 overflow-y-auto"
          >
            {results.map((r, i) => (
              <li key={r.id} role="option" id={`result-${r.id}`} aria-selected={i === active}>
                <button
                  type="button"
                  onClick={() => go(r.href)}
                  onMouseEnter={() => setActive(i)}
                  className="flex w-full items-baseline gap-2 rounded-md px-3 py-2 text-left text-sm"
                  style={i === active ? { backgroundColor: "var(--bg-soft)" } : undefined}
                >
                  <span
                    className="w-20 shrink-0 font-mono text-[10px] font-semibold uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {TYPE_LABEL[r.type]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.title}</span>
                    <span className="block truncate text-xs" style={{ color: "var(--fg-muted)" }}>
                      {r.context}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {query.trim() && results.length === 0 ? (
            <p className="px-3 py-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              {records === null ? "Loading the index…" : `No matches for “${query}”.`}
            </p>
          ) : null}
          <p
            className="mt-2 px-1 text-[11px]"
            style={{ color: "var(--fg-muted)" }}
            aria-live="polite"
          >
            {query.trim()
              ? `${results.length} result${results.length === 1 ? "" : "s"}`
              : "↑↓ to navigate · Enter to open · Esc to close"}
          </p>
        </div>
      </dialog>
    </>
  );
}
