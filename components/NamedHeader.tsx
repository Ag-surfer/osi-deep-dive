import { HEADERS, type HeaderId } from "@/lib/headers";
import { HeaderDiagram } from "./HeaderDiagram";

/** Renders a canonical header from lib/headers.ts by id (used in MDX). */
export function NamedHeader({ id }: { id: HeaderId }) {
  const spec = HEADERS[id];
  return <HeaderDiagram title={spec.title} fields={spec.fields} />;
}
