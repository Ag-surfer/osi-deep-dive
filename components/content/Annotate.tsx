"use client";

import type { ReactNode } from "react";
import { RoughNotation } from "react-rough-notation";
import { useInView } from "@/lib/useInView";

type AnnType = "underline" | "box" | "circle" | "highlight" | "bracket" | "strike-through";

// Theme-friendly accent hexes (rough-notation needs a real color, not a CSS var).
const COLORS: Record<string, string> = {
  green: "#4fa15e",
  teal: "#3fa6a0",
  blue: "#5a7fd6",
  violet: "#8a63c9",
  red: "#e0524d",
  amber: "#e0a13c",
};

/**
 * Wraps text with a hand-drawn rough-notation annotation that draws itself when
 * it scrolls into view. Respects prefers-reduced-motion (renders instantly).
 */
export function Annotate({
  children,
  type = "underline",
  color = "teal",
  multiline = true,
}: {
  children: ReactNode;
  type?: AnnType;
  color?: keyof typeof COLORS | string;
  multiline?: boolean;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const stroke = COLORS[color] ?? color;

  return (
    <span ref={ref}>
      <RoughNotation
        type={type}
        show={inView}
        color={stroke}
        strokeWidth={type === "highlight" ? 12 : 2}
        animationDuration={reduce ? 0 : 700}
        multiline={multiline}
        iterations={2}
        padding={type === "highlight" ? 1 : 2}
      >
        {children}
      </RoughNotation>
    </span>
  );
}
