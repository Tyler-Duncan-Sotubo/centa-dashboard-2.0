"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrgChartNodeDto } from "../types/org-chart.type";
import { useOrgChart } from "../hooks/useOrgChart";
import { Button } from "@/shared/ui/button";
import { ChevronLeft } from "lucide-react";
import { PersonCard } from "./PersonCard";
import Loading from "@/shared/ui/loading";

function uniqById(nodes: OrgChartNodeDto[]) {
  const m = new Map<string, OrgChartNodeDto>();
  for (const n of nodes) m.set(n.id, n);
  return Array.from(m.values());
}

function sortHeadsFirst(nodes: OrgChartNodeDto[], focusedId?: string) {
  return [...nodes].sort((a, b) => {
    if (focusedId) {
      if (a.id === focusedId) return -1;
      if (b.id === focusedId) return 1;
    }
    const aHead = a.isDepartmentHead ? 1 : 0;
    const bHead = b.isDepartmentHead ? 1 : 0;
    if (aHead !== bHead) return bHead - aHead;
    return (b.childrenCount ?? 0) - (a.childrenCount ?? 0);
  });
}

/**
 * Pick a "best default child" for auto-seeding the path:
 * 1) department head first
 * 2) then higher childrenCount
 */
function pickDefaultChild(children: OrgChartNodeDto[]): OrgChartNodeDto | null {
  if (!children?.length) return null;
  const sorted = sortHeadsFirst(children);
  return sorted[0] ?? null;
}

/**
 * Build a default path up to `maxDepth` using inline preview children.
 * roots = column 1
 * next child = column 2
 * etc...
 *
 * IMPORTANT:
 * This ONLY follows inline `children` returned by /preview.
 * (It won't fetch deeper via API — that's fine, because preview already includes 4 layers.)
 */
function buildDefaultPathFromPreview(
  roots: OrgChartNodeDto[],
  maxDepth: number,
): OrgChartNodeDto[] {
  if (!roots.length || maxDepth < 1) return [];

  const firstRoot = sortHeadsFirst(roots)[0];
  if (!firstRoot) return [];

  const path: OrgChartNodeDto[] = [firstRoot];

  let cur: OrgChartNodeDto | null = firstRoot;
  for (let level = 2; level <= maxDepth; level++) {
    if (!cur) break;
    const kids = uniqById(cur.children ?? []);
    const next = pickDefaultChild(kids);
    if (!next) break;
    path.push(next);
    cur = next;
  }

  return path;
}

type ChildrenCache = Record<string, OrgChartNodeDto[]>;

type Column = {
  key: string;
  title: string;
  nodes: OrgChartNodeDto[];
  selectedId?: string;
};

type Link = { x1: number; y1: number; x2: number; y2: number };

export function OrgChartFocus() {
  const { rootsQuery, childrenQuery, prefetchChildren } = useOrgChart();
  const { data: roots = [], isLoading, isError } = rootsQuery;

  const [path, setPath] = useState<OrgChartNodeDto[]>([]);
  const [childrenCache, setChildrenCache] = useState<ChildrenCache>({});

  // scroll / content
  const railRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // only store refs for currently-selected nodes (one per column)
  const selectedRefs = useRef(new Map<string, HTMLDivElement | null>());

  const [links, setLinks] = useState<Link[]>([]);
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });

  /**
   * ✅ AUTO-SEED PATH TO SHOW UP TO 4 LAYERS ON FIRST LOAD
   * This is the key change.
   */
  useEffect(() => {
    if (!roots.length) return;

    setPath((prev) => {
      if (prev.length) return prev;

      // You said preview route returns 4 layers; match that here.
      const seeded = buildDefaultPathFromPreview(roots, 4);

      // Fallback: if for some reason preview has no inline children
      // we still at least show the first root
      return seeded.length ? seeded : [roots[0]];
    });
  }, [roots]);

  const focus = path[path.length - 1] ?? null;

  // ONE childrenQuery hook: for current focus only
  const hasInlineChildren = !!focus?.children?.length;
  const shouldFetchChildren =
    !!focus && focus.hasChildren && !hasInlineChildren;

  const { data: fetchedFocusChildren = [] } = childrenQuery(
    focus?.id ?? "",
    shouldFetchChildren,
  );

  useEffect(() => {
    if (!focus) return;

    const raw = uniqById(
      hasInlineChildren ? (focus.children ?? []) : fetchedFocusChildren,
    );

    // if this node truly has no children, don't cache
    if (!focus.hasChildren && raw.length === 0) return;

    // ✅ only write to state if it changed (prevents infinite updates)
    setChildrenCache((prev) => {
      const prevKids = prev[focus.id] ?? [];

      // fast path: same length + same ids in same order
      if (prevKids.length === raw.length) {
        let same = true;
        for (let i = 0; i < raw.length; i++) {
          if (prevKids[i]?.id !== raw[i]?.id) {
            same = false;
            break;
          }
        }
        if (same) return prev; // ✅ no state update
      }

      return { ...prev, [focus.id]: raw };
    });
  }, [
    focus?.id,
    hasInlineChildren,
    fetchedFocusChildren,
    focus?.hasChildren,
    focus?.children,
  ]);

  const goBack = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));

  const onSelect = async (depth: number, node: OrgChartNodeDto) => {
    if (node.hasChildren) await prefetchChildren(node.id);
    setPath((prev) => [...prev.slice(0, depth), node]);
  };

  const columns: Column[] = useMemo(() => {
    if (!roots.length) return [];

    const cols: Column[] = [
      {
        key: "roots",
        title: "Roots",
        nodes: sortHeadsFirst(roots, path[0]?.id),
        selectedId: path[0]?.id,
      },
    ];

    for (let i = 0; i < path.length; i++) {
      const parent = path[i];
      if (!parent?.hasChildren) continue;

      const rawChildren = parent.children?.length
        ? parent.children
        : (childrenCache[parent.id] ?? []);

      const children = sortHeadsFirst(uniqById(rawChildren), path[i + 1]?.id);

      cols.push({
        key: `children-${parent.id}`,
        title: parent.name,
        nodes: children,
        selectedId: path[i + 1]?.id,
      });
    }

    return cols;
  }, [roots, path, childrenCache]);

  const selectedIdsByColumn = useMemo(() => {
    // col 0 selected is path[0], col 1 is path[1], ...
    return columns
      .map((_, colIdx) => path[colIdx]?.id)
      .filter(Boolean) as string[];
  }, [columns, path]);

  const measureOverlay = () => {
    const content = contentRef.current;
    const rail = railRef.current;
    if (!content) return;

    const w = content.scrollWidth || content.getBoundingClientRect().width;
    const h =
      rail?.clientHeight ||
      content.clientHeight ||
      content.getBoundingClientRect().height;

    setOverlaySize({ w: Math.ceil(w), h: Math.ceil(h) });
  };

  const recomputeLinks = () => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const contentRect = contentEl.getBoundingClientRect();
    const next: Link[] = [];

    for (let i = 0; i < selectedIdsByColumn.length - 1; i++) {
      const aId = selectedIdsByColumn[i];
      const bId = selectedIdsByColumn[i + 1];

      const aEl = selectedRefs.current.get(aId);
      const bEl = selectedRefs.current.get(bId);
      if (!aEl || !bEl) continue;

      const aRect = aEl.getBoundingClientRect();
      const bRect = bEl.getBoundingClientRect();

      next.push({
        x1: aRect.right - contentRect.left,
        y1: aRect.top + aRect.height / 2 - contentRect.top,
        x2: bRect.left - contentRect.left,
        y2: bRect.top + bRect.height / 2 - contentRect.top,
      });
    }

    setLinks(next);
  };

  useLayoutEffect(() => {
    measureOverlay();
    recomputeLinks();

    const t1 = window.setTimeout(() => {
      measureOverlay();
      recomputeLinks();
    }, 80);
    const t2 = window.setTimeout(() => {
      measureOverlay();
      recomputeLinks();
    }, 220);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, columns.length]);

  useEffect(() => {
    const rail = railRef.current;
    const content = contentRef.current;
    if (!rail || !content) return;

    const onScroll = () => recomputeLinks();
    const onResize = () => {
      measureOverlay();
      recomputeLinks();
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => {
      measureOverlay();
      recomputeLinks();
    });
    ro.observe(content);

    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdsByColumn]);

  if (isLoading) return <Loading />;
  if (isError) return <div className="p-6">Failed to load org chart.</div>;
  if (!roots.length) return <div className="p-6">No org chart data yet.</div>;
  if (!focus) return null;

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Button
          size="sm"
          variant="secondary"
          onClick={goBack}
          disabled={path.length <= 1}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>

        <div className="text-right">
          <div className="text-sm font-medium leading-tight">{focus.name}</div>
          <div className="text-xs text-muted-foreground leading-tight">
            {[focus.title, focus.department].filter(Boolean).join(" • ")}
          </div>
        </div>
      </div>

      {/* Columns rail */}
      <div
        ref={railRef}
        className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <div ref={contentRef} className="relative h-full min-w-max">
          {/* ✅ SVG overlay sized to the FULL scrollable content */}
          <svg
            className="absolute top-0 left-0 pointer-events-none z-20"
            style={{ width: overlaySize.w, height: overlaySize.h }}
            viewBox={`0 0 ${overlaySize.w} ${overlaySize.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {links.map((l, idx) => {
              const dx = Math.max(40, (l.x2 - l.x1) * 0.5);
              const d = `M ${l.x1} ${l.y1} C ${l.x1 + dx} ${l.y1}, ${
                l.x2 - dx
              } ${l.y2}, ${l.x2} ${l.y2}`;
              return (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity="0.55"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Columns */}
          <div className="relative z-10 h-full flex gap-3 p-4">
            <AnimatePresence initial={false}>
              {columns.map((col, colIndex) => (
                <motion.div
                  key={col.key}
                  initial={{ opacity: 0, x: 12, filter: "blur(3px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -12, filter: "blur(3px)" }}
                  transition={{ duration: 0.18 }}
                  className="h-full w-[320px] shrink-0 rounded-lg flex flex-col overflow-hidden"
                >
                  <div className="p-3 overflow-y-auto no-scrollbar space-y-2">
                    {col.nodes.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        {colIndex === columns.length - 1 && focus?.hasChildren
                          ? "Loading…"
                          : "No people here."}
                      </div>
                    ) : (
                      col.nodes.map((n) => {
                        const depthToSet = colIndex;
                        const isActive = n.id === col.selectedId;

                        const setSelectedRef = (el: HTMLDivElement | null) => {
                          if (isActive) selectedRefs.current.set(n.id, el);
                        };

                        return (
                          <motion.div
                            key={n.id}
                            layout
                            initial={false}
                            animate={{ scale: isActive ? 1.01 : 1 }}
                            transition={{ duration: 0.12 }}
                            ref={setSelectedRef}
                          >
                            <PersonCard
                              node={n}
                              size="sm"
                              active={isActive}
                              onClick={() => onSelect(depthToSet, n)}
                              rightMeta={
                                <div className="text-[11px] text-muted-foreground">
                                  {n.childrenCount ? `${n.childrenCount}` : ""}
                                </div>
                              }
                            />
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
