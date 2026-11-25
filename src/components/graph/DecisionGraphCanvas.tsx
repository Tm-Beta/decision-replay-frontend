"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Scan,
  Link2,
  X,
  Plus,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Search,
  Unlink,
  Keyboard,
  Download,
} from "lucide-react";
import { computeGraphLayout, GraphEdge, GraphNode, PositionedNode } from "./graphLayout";

/** Custom Decision Replay Emblem for Decision nodes */
export function DecisionSymbol({ planned = false }: { planned?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="graph-symbol-svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={planned ? "3 2.5" : undefined}
      />
      <path
        d="M8 16L12 8L16 16M9.8 13H14.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Custom Decision Replay Emblem for Outcome nodes (distinct diamond/target shape) */
export function OutcomeSymbol({ planned = false }: { planned?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="graph-symbol-svg"
    >
      <path
        d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray={planned ? "3 2.5" : undefined}
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

interface DecisionGraphCanvasProps {
  title: string;
  subtitle: string;
  storageKey?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  planned: boolean;
  fullScreen: boolean;
  onToggleFullScreen: () => void;
  selectedKey: string | null;
  onSelectNode: (key: string | null) => void;
  connectFromKey: string | null;
  onStartConnect: (key: string | null) => void;
  onCompleteConnect: (fromKey: string, toKey: string) => void;
  onRemoveEdge?: (edge: GraphEdge) => void;
  onDeleteNode?: (node: GraphNode) => void;
  onToggleJoinRule?: (node: GraphNode) => void;
  onQuickAddDecisionFromNode: (node: GraphNode) => void;
  onQuickAddOutcomeFromNode: (node: GraphNode) => void;
  onAddRootDecision: () => void;
  onAddOutcomeQuick: () => void;
  renderInspector?: (node: GraphNode) => React.ReactNode;
  emptyState?: React.ReactNode;
}

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.85;

function computeEdgeCurve(
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
) {
  const fromUpward = from.y + from.height / 2 >= to.y + to.height / 2;
  const x1 = from.x + from.width / 2;
  const y1 = fromUpward ? from.y : from.y + from.height;
  const x2 = to.x + to.width / 2;
  const y2 = fromUpward ? to.y + to.height : to.y;
  const dy = Math.max(36, Math.abs(y2 - y1) * 0.52);
  const cy1 = fromUpward ? y1 - dy : y1 + dy;
  const cy2 = fromUpward ? y2 + dy : y2 - dy;
  return {
    path: `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`,
    midX: (x1 + x2) / 2,
    midY: (y1 + y2) / 2,
  };
}

export function DecisionGraphCanvas({
  title,
  subtitle,
  storageKey,
  nodes,
  edges,
  planned,
  fullScreen,
  onToggleFullScreen,
  selectedKey,
  onSelectNode,
  connectFromKey,
  onStartConnect,
  onCompleteConnect,
  onRemoveEdge,
  onDeleteNode,
  onToggleJoinRule,
  onQuickAddDecisionFromNode,
  onQuickAddOutcomeFromNode,
  onAddRootDecision,
  onAddOutcomeQuick,
  renderInspector,
  emptyState,
}: DecisionGraphCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 500 });
  const [offsets, setOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const [plusMenuKey, setPlusMenuKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cursorStage, setCursorStage] = useState<{ x: number; y: number } | null>(null);

  const panDragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const nodeDragRef = useRef<{
    key: string;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    moved: boolean;
  } | null>(null);

  // Two-finger pinch zoom state for mobile & tablet touchscreens
  const touchPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);

  const hasFittedInitial = useRef<string>("");

  // Load saved node offsets when storageKey changes
  useEffect(() => {
    if (!storageKey) {
      setOffsets({});
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      setOffsets(saved ? JSON.parse(saved) : {});
    } catch {
      setOffsets({});
    }
  }, [storageKey]);

  // Persist offsets to localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      if (Object.keys(offsets).length === 0) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(offsets));
    } catch {}
  }, [offsets, storageKey]);

  // Track viewport size for MiniMap
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes.length]);

  const baseLayout = useMemo(() => computeGraphLayout(nodes, edges), [nodes, edges]);

  const positionedNodes = useMemo(
    () =>
      baseLayout.nodes.map((pos) => {
        const off = offsets[pos.node.key];
        return off ? { ...pos, x: pos.x + off.dx, y: pos.y + off.dy } : pos;
      }),
    [baseLayout.nodes, offsets],
  );

  const posByKey = useMemo(
    () => new Map(positionedNodes.map((p) => [p.node.key, p])),
    [positionedNodes],
  );

  const dynamicEdges = useMemo(
    () =>
      baseLayout.edges
        .map(({ edge }) => {
          const from = posByKey.get(edge.fromKey);
          const to = posByKey.get(edge.toKey);
          if (!from || !to) return null;
          return {
            edge,
            edgeKey: `${edge.fromKey}->${edge.toKey}`,
            ...computeEdgeCurve(from, to),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [baseLayout.edges, posByKey],
  );

  const matchingKeys = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      nodes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.subtitle.toLowerCase().includes(q),
        )
        .map((n) => n.key),
    );
  }, [nodes, searchTerm]);

  const connectedKeys = useMemo(() => {
    const set = new Set<string>();
    if (!selectedKey) return set;
    set.add(selectedKey);
    for (const e of dynamicEdges) {
      if (e.edge.fromKey === selectedKey) set.add(e.edge.toKey);
      if (e.edge.toKey === selectedKey) set.add(e.edge.fromKey);
    }
    return set;
  }, [dynamicEdges, selectedKey]);

  const fitToView = useCallback(
    (anchorBottom = false) => {
      const el = viewportRef.current;
      if (!el || !positionedNodes.length) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (!vw || !vh) return;
      const minX = Math.min(...positionedNodes.map((p) => p.x));
      const minY = Math.min(...positionedNodes.map((p) => p.y));
      const maxX = Math.max(...positionedNodes.map((p) => p.x + p.width));
      const maxY = Math.max(...positionedNodes.map((p) => p.y + p.height));
      const contentW = Math.max(300, maxX - minX + 80);
      const contentH = Math.max(260, maxY - minY + 80);

      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(1, Math.min((vw - 32) / contentW, (vh - 32) / contentH)),
      );
      const x = (vw - contentW * nextZoom) / 2 - (minX - 40) * nextZoom;
      const y = anchorBottom
        ? Math.min(20 - (minY - 40) * nextZoom, vh - contentH * nextZoom - (minY - 40) * nextZoom - 16)
        : (vh - contentH * nextZoom) / 2 - (minY - 40) * nextZoom;
      setZoom(Number(nextZoom.toFixed(2)));
      setPan({ x, y });
    },
    [positionedNodes],
  );

  const focusNode = useCallback(
    (key: string) => {
      const el = viewportRef.current;
      const pos = posByKey.get(key);
      if (!el || !pos) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const targetZoom = Math.max(zoom, 0.88);
      setZoom(targetZoom);
      setPan({
        x: vw / 2 - (pos.x + pos.width / 2) * targetZoom,
        y: vh / 2 - (pos.y + pos.height / 2) * targetZoom,
      });
    },
    [posByKey, zoom],
  );

  const jumpToEdge = useCallback(
    (which: "top" | "bottom") => {
      const el = viewportRef.current;
      if (!el || !positionedNodes.length) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const scaledW = baseLayout.width * zoom;
      const scaledH = baseLayout.height * zoom;
      setPan({
        x: (vw - scaledW) / 2,
        y: which === "top" ? 28 : vh - scaledH - 28,
      });
    },
    [baseLayout.width, baseLayout.height, positionedNodes.length, zoom],
  );

  const stepZoom = useCallback((delta: number) => {
    const el = viewportRef.current;
    const cx = el ? el.clientWidth / 2 : 300;
    const cy = el ? el.clientHeight / 2 : 250;
    setZoom((prevZoom) => {
      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, Number((prevZoom + delta).toFixed(2))),
      );
      const ratio = nextZoom / prevZoom;
      setPan((prevPan) => ({
        x: cx - (cx - prevPan.x) * ratio,
        y: cy - (cy - prevPan.y) * ratio,
      }));
      return nextZoom;
    });
  }, []);

  // Fit graph once per view/count change
  useEffect(() => {
    const signature = `${planned ? "P" : "A"}:${nodes.length}`;
    if (nodes.length && hasFittedInitial.current !== signature) {
      const timer = requestAnimationFrame(() => fitToView(true));
      hasFittedInitial.current = signature;
      return () => cancelAnimationFrame(timer);
    }
  }, [nodes.length, planned, fitToView]);

  // Export diagram as clean standalone SVG file
  const exportSvg = useCallback(() => {
    if (!positionedNodes.length) return;
    const pad = 40;
    const minX = Math.min(...positionedNodes.map((p) => p.x)) - pad;
    const minY = Math.min(...positionedNodes.map((p) => p.y)) - pad;
    const maxX = Math.max(...positionedNodes.map((p) => p.x + p.width)) + pad;
    const maxY = Math.max(...positionedNodes.map((p) => p.y + p.height)) + pad;
    const w = Math.max(400, maxX - minX);
    const h = Math.max(300, maxY - minY);

    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const edgesMarkup = dynamicEdges
      .map(
        ({ edge, path }) =>
          `<path d="${path}" fill="none" stroke="${
            edge.kind === "outcome" ? "#10b981" : "#8b5cf6"
          }" stroke-width="2" ${edge.planned ? 'stroke-dasharray="6 4"' : ""} marker-end="url(#arr)" />`,
      )
      .join("");

    const nodesMarkup = positionedNodes
      .map(({ node, x, y, width, height }) => {
        const isOut = node.kind === "OUTCOME";
        const stroke = isOut ? "#10b981" : "#8b5cf6";
        const rx = isOut ? height / 2 : 14;
        return `<g>
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="#14111b" stroke="${stroke}" stroke-width="2" ${node.planned ? 'stroke-dasharray="5 3"' : ""} />
          <text x="${x + width / 2}" y="${y + 24}" text-anchor="middle" fill="${stroke}" font-family="system-ui,sans-serif" font-size="10" font-weight="700">${esc(node.statusLabel.toUpperCase())}</text>
          <text x="${x + width / 2}" y="${y + 48}" text-anchor="middle" fill="#f8f7fa" font-family="system-ui,sans-serif" font-size="13" font-weight="700">${esc(node.title.slice(0, 34))}</text>
        </g>`;
      })
      .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">
  <rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="#0d0a12" />
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#a78bfa" />
    </marker>
  </defs>
  ${edgesMarkup}
  ${nodesMarkup}
</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dynamicEdges, positionedNodes, title]);

  // Comprehensive Keyboard Shortcuts (ignores input/textarea/select/dialog)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, dialog") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (showShortcuts) setShowShortcuts(false);
        else if (plusMenuKey) setPlusMenuKey(null);
        else if (connectFromKey !== null) {
          onStartConnect(null);
          setCursorStage(null);
        } else if (selectedEdgeKey) setSelectedEdgeKey(null);
        else if (selectedKey) onSelectNode(null);
        else if (fullScreen) onToggleFullScreen();
        return;
      }

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        stepZoom(0.15);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        stepZoom(-0.15);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        fitToView(false);
        return;
      }
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        onToggleFullScreen();
        return;
      }
      if (e.key.toLowerCase() === "c" && nodes.length >= 2) {
        e.preventDefault();
        setPlusMenuKey(null);
        setSelectedEdgeKey(null);
        onStartConnect(connectFromKey !== null ? null : selectedKey || "");
        return;
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        onAddRootDecision();
        return;
      }
      if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        onAddOutcomeQuick();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedEdgeKey && onRemoveEdge) {
          const found = dynamicEdges.find((d) => d.edgeKey === selectedEdgeKey);
          if (found) {
            e.preventDefault();
            setSelectedEdgeKey(null);
            onRemoveEdge(found.edge);
          }
          return;
        }
        if (selectedKey && onDeleteNode) {
          const node = nodes.find((n) => n.key === selectedKey);
          if (node) {
            e.preventDefault();
            onDeleteNode(node);
          }
        }
        return;
      }

      // Arrow keys: Move selected node (hollanna!), or pan canvas if nothing selected
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 40 : 14;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;

        if (selectedKey) {
          setOffsets((prev) => {
            const cur = prev[selectedKey] ?? { dx: 0, dy: 0 };
            return {
              ...prev,
              [selectedKey]: { dx: cur.dx + dx, dy: cur.dy + dy },
            };
          });
        } else {
          setPan((prev) => ({ x: prev.x - dx * 2, y: prev.y - dy * 2 }));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    showShortcuts,
    plusMenuKey,
    connectFromKey,
    selectedEdgeKey,
    selectedKey,
    fullScreen,
    nodes,
    dynamicEdges,
    stepZoom,
    fitToView,
    onToggleFullScreen,
    onStartConnect,
    onSelectNode,
    onAddRootDecision,
    onAddOutcomeQuick,
    onRemoveEdge,
    onDeleteNode,
  ]);

  // Non-passive mouse wheel zoom around pointer
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prevZoom) => {
        const nextZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, Number((prevZoom * factor).toFixed(3))),
        );
        const ratio = nextZoom / prevZoom;
        setPan((prevPan) => ({
          x: pointerX - (pointerX - prevPan.x) * ratio,
          y: pointerY - (pointerY - prevPan.y) * ratio,
        }));
        return nextZoom;
      });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const activeNodeObj = useMemo(
    () => nodes.find((n) => n.key === selectedKey) ?? null,
    [nodes, selectedKey],
  );
  const connectFromObj = useMemo(
    () => nodes.find((n) => n.key === connectFromKey) ?? null,
    [nodes, connectFromKey],
  );
  const hasCustomLayout = Object.keys(offsets).length > 0;

  // Compute live rubber-band wire during Connect mode
  const liveWirePath = useMemo(() => {
    if (!connectFromKey || !cursorStage) return null;
    const from = posByKey.get(connectFromKey);
    if (!from) return null;
    const x1 = from.x + from.width / 2;
    const y1 = from.y + from.height / 2;
    const x2 = cursorStage.x;
    const y2 = cursorStage.y;
    const dy = Math.max(30, Math.abs(y2 - y1) * 0.45);
    const cy1 = y2 < y1 ? y1 - dy : y1 + dy;
    const cy2 = y2 < y1 ? y2 + dy : y2 - dy;
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }, [connectFromKey, cursorStage, posByKey]);

  // MiniMap geometry
  const miniMap = useMemo(() => {
    if (positionedNodes.length < 2) return null;
    const minX = Math.min(...positionedNodes.map((p) => p.x)) - 30;
    const minY = Math.min(...positionedNodes.map((p) => p.y)) - 30;
    const maxX = Math.max(...positionedNodes.map((p) => p.x + p.width)) + 30;
    const maxY = Math.max(...positionedNodes.map((p) => p.y + p.height)) + 30;
    const worldW = Math.max(200, maxX - minX);
    const worldH = Math.max(200, maxY - minY);
    const boxW = 136;
    const boxH = 88;
    const scale = Math.min(boxW / worldW, boxH / worldH);
    const viewX = (-pan.x / zoom - minX) * scale;
    const viewY = (-pan.y / zoom - minY) * scale;
    const viewW = (viewportSize.width / zoom) * scale;
    const viewH = (viewportSize.height / zoom) * scale;
    return { minX, minY, boxW, boxH, scale, viewX, viewY, viewW, viewH };
  }, [positionedNodes, pan, zoom, viewportSize]);

  return (
    <section className={"graph-canvas-shell " + (fullScreen ? "tree-fullscreen" : "")}>
      {/* Top Canvas Header & Legend */}
      <div className="graph-canvas-head">
        <div>
          <div className="graph-title-row">
            <strong>{title}</strong>
            <span className="graph-legend">
              <span className="legend-pill decision">
                <DecisionSymbol planned={planned} /> Decision
              </span>
              <span className="legend-pill outcome">
                <OutcomeSymbol planned={planned} /> Outcome
              </span>
            </span>
          </div>
          <p className="graph-subtitle">{subtitle}</p>
        </div>

        <div className="graph-toolbar">
          {nodes.length > 3 && (
            <label className="graph-search-box">
              <Search size={13} aria-hidden="true" />
              <input
                type="search"
                placeholder="Find node…"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  const q = val.trim().toLowerCase();
                  if (q) {
                    const hit = nodes.find((n) => n.title.toLowerCase().includes(q));
                    if (hit) focusNode(hit.key);
                  }
                }}
              />
            </label>
          )}
          <button
            type="button"
            className="graph-action-btn primary"
            onClick={onAddRootDecision}
            title="Shortcut: N"
          >
            <Plus size={14} /> {planned ? "Plan decision" : "Decision"}
          </button>
          <button
            type="button"
            className="graph-action-btn"
            onClick={onAddOutcomeQuick}
            title="Shortcut: O"
          >
            <Plus size={14} /> {planned ? "Possible outcome" : "Outcome"}
          </button>
          <button
            type="button"
            className={"graph-action-btn " + (connectFromKey !== null ? "connecting" : "")}
            aria-pressed={connectFromKey !== null}
            onClick={() => {
              setPlusMenuKey(null);
              setSelectedEdgeKey(null);
              setCursorStage(null);
              onStartConnect(connectFromKey !== null ? null : selectedKey || "");
            }}
            disabled={nodes.length < 2}
            title="Connect one branch to another (Shortcut: C)"
          >
            <Link2 size={14} /> {connectFromKey !== null ? "Cancel link" : "Connect"}
          </button>
          {nodes.length > 0 && (
            <button
              type="button"
              className="graph-action-btn"
              onClick={exportSvg}
              title="Download diagram as SVG"
            >
              <Download size={14} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Connect Mode Banner */}
      {connectFromKey !== null && (
        <div className="graph-connect-banner" role="status">
          <Link2 size={15} />
          <span>
            {connectFromObj
              ? `Now click the target node that follows “${connectFromObj.title}” (Esc to cancel)`
              : "Click a starting node, then click the target node it connects into (Esc to cancel)"}
          </span>
          <button
            type="button"
            onClick={() => {
              onStartConnect(null);
              setCursorStage(null);
            }}
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}

      {nodes.length === 0 ? (
        emptyState
      ) : (
        <div className="graph-stage-wrap">
          {/* Interactive Pan/Zoom Viewport */}
          <div
            ref={viewportRef}
            className={"graph-viewport " + (connectFromKey !== null ? "is-connecting" : "")}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") {
                touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (touchPointersRef.current.size === 2) {
                  const pts = [...touchPointersRef.current.values()];
                  const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                  pinchStartRef.current = { dist, zoom };
                  panDragRef.current = null;
                  nodeDragRef.current = null;
                  return;
                }
              }
              if (e.button !== 0) return;
              if ((e.target as HTMLElement).closest("[data-graph-node], [data-edge-pill], [data-minimap], button, a, select, input")) {
                return;
              }
              setPlusMenuKey(null);
              setSelectedEdgeKey(null);
              panDragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                originX: pan.x,
                originY: pan.y,
                moved: false,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.pointerType === "touch" && touchPointersRef.current.has(e.pointerId)) {
                touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (touchPointersRef.current.size === 2 && pinchStartRef.current && viewportRef.current) {
                  const pts = [...touchPointersRef.current.values()];
                  const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                  const rect = viewportRef.current.getBoundingClientRect();
                  const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
                  const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
                  const nextZoom = Math.max(
                    MIN_ZOOM,
                    Math.min(MAX_ZOOM, Number((pinchStartRef.current.zoom * (dist / pinchStartRef.current.dist)).toFixed(3))),
                  );
                  setZoom((prevZoom) => {
                    const ratio = nextZoom / prevZoom;
                    setPan((prevPan) => ({
                      x: cx - (cx - prevPan.x) * ratio,
                      y: cy - (cy - prevPan.y) * ratio,
                    }));
                    return nextZoom;
                  });
                  return;
                }
              }
              if (connectFromKey && viewportRef.current) {
                const rect = viewportRef.current.getBoundingClientRect();
                setCursorStage({
                  x: (e.clientX - rect.left - pan.x) / zoom,
                  y: (e.clientY - rect.top - pan.y) / zoom,
                });
              }
              if (nodeDragRef.current) {
                const dxScreen = e.clientX - nodeDragRef.current.startX;
                const dyScreen = e.clientY - nodeDragRef.current.startY;
                if (Math.abs(dxScreen) > 4 || Math.abs(dyScreen) > 4) {
                  nodeDragRef.current.moved = true;
                }
                if (nodeDragRef.current.moved) {
                  const key = nodeDragRef.current.key;
                  const nextDx = nodeDragRef.current.baseDx + dxScreen / zoom;
                  const nextDy = nodeDragRef.current.baseDy + dyScreen / zoom;
                  setOffsets((prev) => ({
                    ...prev,
                    [key]: { dx: nextDx, dy: nextDy },
                  }));
                }
                return;
              }
              if (!panDragRef.current) return;
              const dx = e.clientX - panDragRef.current.startX;
              const dy = e.clientY - panDragRef.current.startY;
              if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                panDragRef.current.moved = true;
              }
              setPan({
                x: panDragRef.current.originX + dx,
                y: panDragRef.current.originY + dy,
              });
            }}
            onPointerUp={(e) => {
              if (e.pointerType === "touch") {
                touchPointersRef.current.delete(e.pointerId);
                if (touchPointersRef.current.size < 2) pinchStartRef.current = null;
              }
              if (nodeDragRef.current) {
                nodeDragRef.current = null;
              }
              if (panDragRef.current && !panDragRef.current.moved) {
                if (!(e.target as HTMLElement).closest("[data-graph-node], [data-edge-pill], [data-minimap]")) {
                  onSelectNode(null);
                }
              }
              panDragRef.current = null;
            }}
            onPointerCancel={(e) => {
              if (e.pointerType === "touch") {
                touchPointersRef.current.delete(e.pointerId);
                pinchStartRef.current = null;
              }
              panDragRef.current = null;
              nodeDragRef.current = null;
            }}
          >
            {/* Subtle top-left helper hint */}
            <div className="graph-hint-pill" aria-hidden="true">
              Drag cards to move · Click line to disconnect · Press ? for shortcuts
            </div>

            {/* Pan & Zoom Transform Stage */}
            <div
              className="graph-stage"
              style={{
                width: baseLayout.width,
                height: baseLayout.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {/* SVG Edges Layer */}
              <svg
                className="graph-edges-svg"
                width={baseLayout.width}
                height={baseLayout.height}
              >
                <defs>
                  <marker
                    id="arrow-decision"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="hsl(var(--primary))" />
                  </marker>
                  <marker
                    id="arrow-outcome"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="hsl(var(--accent))" />
                  </marker>
                </defs>

                {dynamicEdges.map(({ edge, edgeKey, path }) => {
                  const isEdgeSelected = selectedEdgeKey === edgeKey;
                  const isHighlighted =
                    isEdgeSelected ||
                    hoveredEdgeKey === edgeKey ||
                    (selectedKey !== null &&
                      (edge.fromKey === selectedKey || edge.toKey === selectedKey));
                  const marker = isHighlighted
                    ? "url(#arrow-active)"
                    : edge.kind === "outcome"
                      ? "url(#arrow-outcome)"
                      : "url(#arrow-decision)";
                  return (
                    <g key={edgeKey}>
                      <path
                        d={path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={18}
                        style={{ pointerEvents: "stroke", cursor: "pointer" }}
                        onMouseEnter={() => setHoveredEdgeKey(edgeKey)}
                        onMouseLeave={() => setHoveredEdgeKey(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdgeKey(isEdgeSelected ? null : edgeKey);
                        }}
                      />
                      <path
                        d={path}
                        fill="none"
                        stroke={
                          isHighlighted
                            ? "hsl(var(--accent))"
                            : edge.kind === "outcome"
                              ? "#10b981"
                              : "hsl(var(--primary))"
                        }
                        strokeWidth={isHighlighted ? 2.8 : 1.9}
                        strokeOpacity={selectedKey && !isHighlighted ? 0.22 : 0.78}
                        strokeDasharray={edge.planned ? "6 4" : undefined}
                        markerEnd={marker}
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                  );
                })}

                {/* Live Connect Preview Wire */}
                {liveWirePath && (
                  <path
                    d={liveWirePath}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    markerEnd="url(#arrow-active)"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </svg>

              {/* Selected Edge Unlink Pill */}
              {selectedEdgeKey && onRemoveEdge && (() => {
                const match = dynamicEdges.find((d) => d.edgeKey === selectedEdgeKey);
                if (!match) return null;
                return (
                  <button
                    type="button"
                    data-edge-pill="true"
                    className="graph-edge-unlink"
                    style={{ left: match.midX, top: match.midY }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const edge = match.edge;
                      setSelectedEdgeKey(null);
                      onRemoveEdge(edge);
                    }}
                  >
                    <Unlink size={12} /> Disconnect (Del)
                  </button>
                );
              })()}

              {/* HTML Nodes Layer */}
              {positionedNodes.map((pos: PositionedNode) => {
                const { node, x, y, width, height } = pos;
                const isSelected = selectedKey === node.key;
                const isSource = connectFromKey === node.key;
                const isSearchMiss = matchingKeys !== null && !matchingKeys.has(node.key);
                const dimmed =
                  isSearchMiss ||
                  (selectedKey !== null &&
                    !connectedKeys.has(node.key) &&
                    connectFromKey === null);

                return (
                  <article
                    key={node.key}
                    data-graph-node="true"
                    style={{ left: x, top: y, width, minHeight: height }}
                    className={[
                      "graph-node",
                      node.kind === "OUTCOME" ? "kind-outcome" : "kind-decision",
                      "tone-" + node.tone,
                      isSelected ? "is-selected" : "",
                      isSource ? "is-connect-source" : "",
                      matchingKeys?.has(node.key) ? "is-search-hit" : "",
                      dimmed ? "is-dimmed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onPointerDown={(e) => {
                      if (e.button !== 0 || connectFromKey !== null) return;
                      if ((e.target as HTMLElement).closest("button")) return;
                      const currentOff = offsets[node.key] ?? { dx: 0, dy: 0 };
                      nodeDragRef.current = {
                        key: node.key,
                        startX: e.clientX,
                        startY: e.clientY,
                        baseDx: currentOff.dx,
                        baseDy: currentOff.dy,
                        moved: false,
                      };
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (nodeDragRef.current?.moved) return;
                      setSelectedEdgeKey(null);
                      setPlusMenuKey(null);
                      if (connectFromKey !== null) {
                        if (connectFromKey === "") {
                          onStartConnect(node.key);
                        } else if (connectFromKey === node.key) {
                          onStartConnect(null);
                          setCursorStage(null);
                        } else {
                          setCursorStage(null);
                          onCompleteConnect(connectFromKey, node.key);
                        }
                        return;
                      }
                      onSelectNode(isSelected ? null : node.key);
                    }}
                  >
                    <div className="graph-node-header">
                      <span
                        className={
                          "graph-node-glyph " +
                          (node.kind === "OUTCOME" ? "outcome" : "decision")
                        }
                      >
                        {node.kind === "OUTCOME" ? (
                          <OutcomeSymbol planned={node.planned} />
                        ) : (
                          <DecisionSymbol planned={node.planned} />
                        )}
                      </span>
                      <span className="graph-node-badge">{node.statusLabel}</span>
                      {node.kind === "DECISION" &&
                        edges.filter((e) => e.toKey === node.key).length >= 2 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleJoinRule?.(node);
                            }}
                            title="Convergence rule: click to toggle ANY path (OR) vs ALL paths required (AND)"
                            className={
                              "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border transition " +
                              (node.joinRule === "ALL"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                                : "bg-sky-500/15 text-sky-300 border-sky-500/40")
                            }
                          >
                            {node.joinRule === "ALL" ? "ALL" : "ANY"}
                          </button>
                        )}
                    </div>

                    <h3 className="graph-node-title">{node.title}</h3>
                    {node.subtitle && (
                      <p className="graph-node-sub">{node.subtitle}</p>
                    )}

                    {/* Quick + branch button */}
                    <button
                      type="button"
                      className="graph-node-plus"
                      aria-label={
                        node.kind === "OUTCOME"
                          ? `Add next decision after ${node.title}`
                          : `Branch from ${node.title}`
                      }
                      title="Branch from here"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (node.kind === "OUTCOME") {
                          onQuickAddDecisionFromNode(node);
                        } else {
                          setPlusMenuKey(plusMenuKey === node.key ? null : node.key);
                        }
                      }}
                    >
                      <Plus size={14} />
                    </button>

                    {/* Quick Choice Popover above Decision node */}
                    {plusMenuKey === node.key && (
                      <div
                        className="graph-plus-popover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setPlusMenuKey(null);
                            onQuickAddOutcomeFromNode(node);
                          }}
                        >
                          <OutcomeSymbol planned={planned} />{" "}
                          {planned ? "Add possible outcome" : "Add outcome"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlusMenuKey(null);
                            onQuickAddDecisionFromNode(node);
                          }}
                        >
                          <DecisionSymbol planned={planned} />{" "}
                          {planned ? "Plan next decision" : "Add next decision"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Bottom-Left Floating Zoom & Navigation Controls */}
            <div className="graph-zoom-controls" aria-label="Canvas zoom controls">
              <button type="button" onClick={() => stepZoom(-0.15)} title="Zoom out (-)" aria-label="Zoom out">
                <ZoomOut size={15} />
              </button>
              <button type="button" className="zoom-readout" onClick={() => fitToView(false)} title="Fit to view (0)">
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" onClick={() => stepZoom(0.15)} title="Zoom in (+)" aria-label="Zoom in">
                <ZoomIn size={15} />
              </button>
              <span className="zoom-sep" />
              <button type="button" onClick={() => fitToView(false)} title="Fit to screen (0)" aria-label="Fit to screen">
                <Scan size={15} />
              </button>
              <button type="button" onClick={() => jumpToEdge("bottom")} title="Starting decisions" aria-label="Starting decisions">
                <ArrowDown size={15} />
              </button>
              <button type="button" onClick={() => jumpToEdge("top")} title="Newest branches" aria-label="Newest branches">
                <ArrowUp size={15} />
              </button>
              {hasCustomLayout && (
                <button
                  type="button"
                  onClick={() => {
                    setOffsets({});
                    requestAnimationFrame(() => fitToView(true));
                  }}
                  title="Auto-arrange layout"
                  aria-label="Auto-arrange layout"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleFullScreen}
                title={fullScreen ? "Exit full screen (F)" : "Full screen (F)"}
                aria-label={fullScreen ? "Exit full screen" : "Full screen"}
              >
                {fullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setShowShortcuts((v) => !v)}
                aria-pressed={showShortcuts}
                title="Keyboard shortcuts (?)"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard size={14} />
              </button>
            </div>

            {/* Keyboard Shortcuts Cheat Sheet Popover */}
            {showShortcuts && (
              <div className="graph-shortcuts-popover" role="dialog" aria-label="Keyboard shortcuts">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-xs">Shortcuts</strong>
                  <button type="button" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts">
                    <X size={13} />
                  </button>
                </div>
                <dl>
                  <div><dt><kbd>+</kbd> / <kbd>-</kbd></dt><dd>Zoom in / out</dd></div>
                  <div><dt><kbd>0</kbd></dt><dd>Fit graph to screen</dd></div>
                  <div><dt><kbd>Arrows</kbd></dt><dd>Move selected node (or pan)</dd></div>
                  <div><dt><kbd>C</kbd></dt><dd>Connect branches</dd></div>
                  <div><dt><kbd>N</kbd> / <kbd>O</kbd></dt><dd>New Decision / Outcome</dd></div>
                  <div><dt><kbd>Del</kbd></dt><dd>Disconnect line / Delete node</dd></div>
                  <div><dt><kbd>F</kbd></dt><dd>Full screen</dd></div>
                  <div><dt><kbd>Esc</kbd></dt><dd>Cancel / Deselect</dd></div>
                </dl>
              </div>
            )}

            {/* Bottom-Right Interactive MiniMap */}
            {miniMap && (
              <div
                data-minimap="true"
                className="graph-minimap"
                style={{ width: miniMap.boxW, height: miniMap.boxH }}
                title="Click to jump view"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  const worldX = mx / miniMap.scale + miniMap.minX;
                  const worldY = my / miniMap.scale + miniMap.minY;
                  setPan({
                    x: viewportSize.width / 2 - worldX * zoom,
                    y: viewportSize.height / 2 - worldY * zoom,
                  });
                }}
              >
                {positionedNodes.map((pos) => (
                  <div
                    key={pos.node.key}
                    className={
                      "minimap-node " +
                      (pos.node.kind === "OUTCOME" ? "outcome " : "decision ") +
                      (selectedKey === pos.node.key ? "selected" : "")
                    }
                    style={{
                      left: (pos.x - miniMap.minX) * miniMap.scale,
                      top: (pos.y - miniMap.minY) * miniMap.scale,
                      width: Math.max(6, pos.width * miniMap.scale),
                      height: Math.max(4, pos.height * miniMap.scale),
                    }}
                  />
                ))}
                <div
                  className="minimap-viewport"
                  style={{
                    left: miniMap.viewX,
                    top: miniMap.viewY,
                    width: Math.max(12, miniMap.viewW),
                    height: Math.max(10, miniMap.viewH),
                  }}
                />
              </div>
            )}
          </div>

          {/* Right/Bottom Selected Node Inspector */}
          {activeNodeObj && renderInspector && (
            <aside className="graph-inspector" aria-label="Selected node details">
              <div className="graph-inspector-head">
                <div className="graph-inspector-kind">
                  {activeNodeObj.kind === "OUTCOME" ? (
                    <OutcomeSymbol planned={activeNodeObj.planned} />
                  ) : (
                    <DecisionSymbol planned={activeNodeObj.planned} />
                  )}
                  <span>
                    {activeNodeObj.planned
                      ? activeNodeObj.kind === "OUTCOME"
                        ? "Possible outcome"
                        : "Planned decision"
                      : activeNodeObj.kind === "OUTCOME"
                        ? "Recorded outcome"
                        : "Decision"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectNode(null)}
                  aria-label="Close inspector"
                >
                  <X size={16} />
                </button>
              </div>
              {renderInspector(activeNodeObj)}
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
