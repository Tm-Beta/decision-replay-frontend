export type NodeRawType = "DECISION" | "OUTCOME" | "PLAN";

export interface GraphNode {
  key: string;
  id: string;
  rawType: NodeRawType;
  kind: "DECISION" | "OUTCOME";
  planned: boolean;
  joinRule?: "ANY" | "ALL";
  title: string;
  subtitle: string;
  statusLabel: string;
  tone: "done" | "waiting" | "due" | "planned" | "outcome" | "outcome-planned";
}

export interface GraphEdge {
  id?: string;
  fromKey: string;
  toKey: string;
  planned: boolean;
  kind: "decision" | "outcome";
}

export interface PositionedNode {
  node: GraphNode;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
}

export interface PositionedEdge {
  edge: GraphEdge;
  path: string;
  midX: number;
  midY: number;
}

export interface GraphLayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

const DECISION_W = 248;
const DECISION_H = 108;
const OUTCOME_W = 216;
const OUTCOME_H = 82;
const H_GAP = 42;
const V_GAP = 72;
const PAD = 64;

export function nodeSize(node: GraphNode): { width: number; height: number } {
  return node.kind === "OUTCOME"
    ? { width: OUTCOME_W, height: OUTCOME_H }
    : { width: DECISION_W, height: DECISION_H };
}

/**
 * Computes a clean bottom-up layered DAG layout with barycenter edge-crossing minimization.
 * Supports multi-parent convergence, multi-outcome branching, and disconnected components.
 */
export function computeGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphLayoutResult {
  if (!nodes.length) {
    return { nodes: [], edges: [], width: 600, height: 400 };
  }

  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const validEdges = edges.filter(
    (e) => e.fromKey !== e.toKey && byKey.has(e.fromKey) && byKey.has(e.toKey),
  );

  // Deduplicate edges
  const uniqueEdges = Array.from(
    new Map(validEdges.map((e) => [`${e.fromKey}->${e.toKey}`, e])).values(),
  );

  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const n of nodes) {
    parentsOf.set(n.key, []);
    childrenOf.set(n.key, []);
    inDegree.set(n.key, 0);
  }

  for (const e of uniqueEdges) {
    parentsOf.get(e.toKey)!.push(e.fromKey);
    childrenOf.get(e.fromKey)!.push(e.toKey);
    inDegree.set(e.toKey, (inDegree.get(e.toKey) ?? 0) + 1);
  }

  // Kahn's topological sort + longest-path layering
  const queue: string[] = [];
  for (const n of nodes) {
    if ((inDegree.get(n.key) ?? 0) === 0) queue.push(n.key);
  }

  const layer = new Map<string, number>();
  const order: string[] = [];
  const remaining = new Map(inDegree);

  while (queue.length) {
    const key = queue.shift()!;
    order.push(key);
    const parents = parentsOf.get(key) ?? [];
    const l = parents.length
      ? Math.max(...parents.map((p) => (layer.get(p) ?? 0) + 1))
      : 0;
    layer.set(key, l);

    for (const child of childrenOf.get(key) ?? []) {
      const next = (remaining.get(child) ?? 1) - 1;
      remaining.set(child, next);
      if (next === 0) queue.push(child);
    }
  }

  // Safety fallback if any cycle somehow exists in legacy data
  for (const n of nodes) {
    if (!layer.has(n.key)) {
      layer.set(n.key, 0);
      order.push(n.key);
    }
  }

  const maxLayer = Math.max(0, ...layer.values());
  const layers: GraphNode[][] = Array.from({ length: maxLayer + 1 }, () => []);
  for (const key of order) {
    const n = byKey.get(key)!;
    layers[layer.get(key) ?? 0].push(n);
  }

  // Track horizontal order index for barycenter minimization
  const xOrder = new Map<string, number>();
  for (let l = 0; l <= maxLayer; l++) {
    if (l > 0) {
      layers[l].sort((a, b) => {
        const pa = parentsOf.get(a.key) ?? [];
        const pb = parentsOf.get(b.key) ?? [];
        const avgA = pa.length
          ? pa.reduce((sum, p) => sum + (xOrder.get(p) ?? 0), 0) / pa.length
          : 9999;
        const avgB = pb.length
          ? pb.reduce((sum, p) => sum + (xOrder.get(p) ?? 0), 0) / pb.length
          : 9999;
        return avgA - avgB;
      });
    }
    layers[l].forEach((n, idx) => xOrder.set(n.key, idx));
  }

  // Compute layer widths and center every row cleanly
  const rowWidths = layers.map((row) =>
    row.reduce((sum, n, i) => sum + nodeSize(n).width + (i > 0 ? H_GAP : 0), 0),
  );
  const contentWidth = Math.max(480, ...rowWidths);
  const totalWidth = contentWidth + PAD * 2;

  const rowHeights = layers.map((row) =>
    row.length ? Math.max(...row.map((n) => nodeSize(n).height)) : DECISION_H,
  );
  const contentHeight =
    rowHeights.reduce((sum, h) => sum + h, 0) + Math.max(0, layers.length - 1) * V_GAP;
  const totalHeight = Math.max(420, contentHeight + PAD * 2);

  // Assign coordinates bottom-up (layer 0 at bottom, maxLayer at top)
  const positionedMap = new Map<string, PositionedNode>();
  let currentBottomY = totalHeight - PAD;

  for (let l = 0; l <= maxLayer; l++) {
    const row = layers[l];
    const rowH = rowHeights[l];
    const rowW = rowWidths[l];
    let curX = (totalWidth - rowW) / 2;

    for (const node of row) {
      const { width, height } = nodeSize(node);
      const x = curX;
      const y = currentBottomY - rowH + (rowH - height) / 2;
      positionedMap.set(node.key, { node, x, y, width, height, layer: l });
      curX += width + H_GAP;
    }

    currentBottomY -= rowH + V_GAP;
  }

  // Second pass: gently align single-child or single-parent columns if non-overlapping?
  // Already centered cleanly per layer! Now compute smooth Bezier paths.
  const positionedEdges: PositionedEdge[] = uniqueEdges.map((edge) => {
    const from = positionedMap.get(edge.fromKey)!;
    const to = positionedMap.get(edge.toKey)!;

    const fromUpward = from.y >= to.y;
    const x1 = from.x + from.width / 2;
    const y1 = fromUpward ? from.y : from.y + from.height;
    const x2 = to.x + to.width / 2;
    const y2 = fromUpward ? to.y + to.height : to.y;

    const dy = Math.max(36, Math.abs(y2 - y1) * 0.55);
    const cy1 = fromUpward ? y1 - dy : y1 + dy;
    const cy2 = fromUpward ? y2 + dy : y2 - dy;

    const path = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
    return {
      edge,
      path,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2,
    };
  });

  return {
    nodes: [...positionedMap.values()],
    edges: positionedEdges,
    width: totalWidth,
    height: totalHeight,
  };
}

