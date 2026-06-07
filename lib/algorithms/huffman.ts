/**
 * Huffman coding, instrumented as a step sequence for the interactive tree
 * builder. Huffman produces an optimal prefix-free code by repeatedly merging the
 * two lowest-frequency nodes into a parent until one tree remains; frequent
 * symbols end up shallow (short codes), rare ones deep (long codes). The final
 * tree is laid out (x by in-order leaf position, y by depth) so the viz can
 * reveal the merges in order against a stable layout.
 *
 * Pure and deterministic (ties broken by insertion order) so it is unit tested.
 */

const X_GAP = 74;
const LEVEL_H = 66;

export interface SymbolFreq {
  char: string;
  freq: number;
}

export interface HuffNode {
  id: string;
  x: number;
  y: number;
  freq: number;
  /** Present on leaves only. */
  char?: string;
}

export interface HuffEdge {
  parent: string;
  child: string;
  bit: "0" | "1";
}

export interface HuffCode {
  char: string;
  freq: number;
  code: string;
}

export interface HuffStep {
  narration: string;
  /** Node ids visible at this step. */
  visible: string[];
  /** Node ids highlighted (the active merge). */
  highlight: string[];
  /** Whether to draw the 0/1 edge labels and the code table. */
  showCodes: boolean;
}

export interface HuffmanResult {
  nodes: HuffNode[];
  edges: HuffEdge[];
  codes: HuffCode[];
  steps: HuffStep[];
  /** Average bits/symbol under the Huffman code. */
  avgBits: number;
  /** Bits/symbol for a naive fixed-length code over the same alphabet. */
  fixedBits: number;
}

interface BuildNode {
  id: string;
  freq: number;
  char?: string;
  left?: string;
  right?: string;
  order: number;
}

/** Build the Huffman tree for `input` and return layout + per-merge steps. */
export function huffmanSteps(input: SymbolFreq[]): HuffmanResult {
  if (input.length === 0) throw new Error("huffmanSteps: need at least one symbol");

  const nodes = new Map<string, BuildNode>();
  let order = 0;
  const leafIds = input.map((it, i) => {
    const id = `L${i}`;
    nodes.set(id, { id, freq: it.freq, char: it.char, order: order++ });
    return id;
  });

  const freqOf = (id: string) => nodes.get(id)!.freq;
  const orderOf = (id: string) => nodes.get(id)!.order;

  const heap = [...leafIds];
  const mergeOrder: string[] = [];
  let k = 0;
  while (heap.length > 1) {
    heap.sort((a, b) => freqOf(a) - freqOf(b) || orderOf(a) - orderOf(b));
    const a = heap.shift()!;
    const b = heap.shift()!;
    const id = `I${k++}`;
    nodes.set(id, { id, freq: freqOf(a) + freqOf(b), left: a, right: b, order: order++ });
    mergeOrder.push(id);
    heap.push(id);
  }
  const root = heap[0]!;

  // Layout: x by in-order leaf slot, y by depth.
  const x = new Map<string, number>();
  const depth = new Map<string, number>();
  let leafIdx = 0;
  const place = (id: string, d: number) => {
    const node = nodes.get(id)!;
    depth.set(id, d);
    if (node.left && node.right) {
      place(node.left, d + 1);
      place(node.right, d + 1);
      x.set(id, (x.get(node.left)! + x.get(node.right)!) / 2);
    } else {
      x.set(id, leafIdx * X_GAP);
      leafIdx++;
    }
  };
  place(root, 0);

  const outNodes: HuffNode[] = [...nodes.values()].map((n) => ({
    id: n.id,
    x: x.get(n.id)!,
    y: depth.get(n.id)! * LEVEL_H,
    freq: n.freq,
    char: n.char,
  }));

  const edges: HuffEdge[] = [];
  for (const n of nodes.values()) {
    if (n.left && n.right) {
      edges.push({ parent: n.id, child: n.left, bit: "0" });
      edges.push({ parent: n.id, child: n.right, bit: "1" });
    }
  }

  // Codes: left = 0, right = 1; a lone symbol gets "0".
  const codes: HuffCode[] = [];
  const assign = (id: string, path: string) => {
    const n = nodes.get(id)!;
    if (n.left && n.right) {
      assign(n.left, path + "0");
      assign(n.right, path + "1");
    } else {
      codes.push({ char: n.char!, freq: n.freq, code: path || "0" });
    }
  };
  assign(root, "");

  const totalFreq = input.reduce((s, it) => s + it.freq, 0);
  const totalBits = codes.reduce((s, c) => s + c.freq * c.code.length, 0);
  const avgBits = totalBits / totalFreq;
  const fixedBits = Math.max(1, Math.ceil(Math.log2(input.length)));

  // Steps.
  const label = (id: string) => {
    const n = nodes.get(id)!;
    return n.char ? `'${n.char}'(${n.freq})` : `(${n.freq})`;
  };
  const steps: HuffStep[] = [];
  steps.push({
    narration:
      "Start with one node per symbol, labeled by frequency. Huffman repeatedly merges the two lowest-frequency roots until a single tree remains.",
    visible: [...leafIds],
    highlight: [],
    showCodes: false,
  });
  for (let m = 0; m < mergeOrder.length; m++) {
    const id = mergeOrder[m]!;
    const node = nodes.get(id)!;
    const visible = [...leafIds, ...mergeOrder.slice(0, m + 1)];
    steps.push({
      narration: `Merge the two lowest-frequency roots: ${label(node.left!)} + ${label(
        node.right!,
      )} → a parent of frequency ${node.freq}.`,
      visible,
      highlight: [id, node.left!, node.right!],
      showCodes: false,
    });
  }
  steps.push({
    narration: `Label every left branch 0 and every right branch 1: each leaf's path is its prefix-free code. Frequent symbols sit shallow (short codes), rare ones deep — averaging ${avgBits.toFixed(
      2,
    )} bits/symbol versus ${fixedBits} for a fixed-length code.`,
    visible: outNodes.map((n) => n.id),
    highlight: [],
    showCodes: true,
  });

  return { nodes: outNodes, edges, codes, steps, avgBits, fixedBits };
}
