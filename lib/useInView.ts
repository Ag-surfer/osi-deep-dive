"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and whether the element has scrolled into view. By default it
 * latches `true` once (good for one-shot reveals/annotations). Pass `once:false`
 * to track visibility continuously.
 */
export function useInView<T extends Element>(opts?: { rootMargin?: string; once?: boolean }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const once = opts?.once ?? true;
  const rootMargin = opts?.rootMargin ?? "0px 0px -10% 0px";

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin]);

  return [ref, inView] as const;
}
