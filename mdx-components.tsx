import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/content/Callout";
import { Figure } from "@/components/content/Figure";
import { ProtocolTable } from "@/components/content/ProtocolTable";
import { RFCRef, KeyTerm } from "@/components/content/Inline";
import { Annotate } from "@/components/content/Annotate";
import { WorkedExample } from "@/components/content/WorkedExample";
import { HeaderDiagram } from "@/components/HeaderDiagram";
import { NamedHeader } from "@/components/NamedHeader";
import { SequenceDiagram } from "@/components/SequenceDiagram";
import { Quiz } from "@/components/Quiz";
import { NetworkTopology } from "@/components/diagrams/NetworkTopology";
import { CsmaCdTimeline } from "@/components/diagrams/CsmaCdTimeline";
import { TcpStateMachine } from "@/components/diagrams/TcpStateMachine";

// Required at the project root for @next/mdx with the App Router. We register
// the custom content components here so every layer's MDX can use them directly
// (<HeaderDiagram/>, <Callout/>, <Quiz/>, …) without per-file imports.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    Figure,
    ProtocolTable,
    RFCRef,
    KeyTerm,
    Annotate,
    WorkedExample,
    HeaderDiagram,
    NamedHeader,
    SequenceDiagram,
    Quiz,
    NetworkTopology,
    CsmaCdTimeline,
    TcpStateMachine,
  };
}
