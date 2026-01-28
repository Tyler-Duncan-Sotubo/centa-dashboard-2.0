"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOrgChart } from "../hooks/useOrgChart";
import { OrgChartNodeDto } from "../types/org-chart.type";
import { PersonCard } from "./PersonCard";
import { useSession } from "next-auth/react";
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

type Column = {
  key: string;
  title: string;
  nodes: OrgChartNodeDto[];
  selectedId?: string;
};

type Link = { x1: number; y1: number; x2: number; y2: number };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(!!mql.matches);

    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

/**
 * ✅ Responsive Employee Focus Org Chart
 * - Desktop/tablet (md+): horizontal columns like before
 * - Mobile (<md): vertical stacked columns (no horizontal scroll)
 */
export function OrgChartEmployeeFocus() {
  const { data: session } = useSession();
  const employeeId = session?.employeeId || "";
  const enabledAuth = !!session?.backendTokens?.accessToken;
  const enabled = enabledAuth && !!employeeId;

  const { employeeQuery, prefetchChildren } = useOrgChart();

  const [activeEmployeeId, setActiveEmployeeId] = useState(employeeId);

  useEffect(() => {
    if (employeeId) setActiveEmployeeId(employeeId);
  }, [employeeId]);

  const { data, isLoading, isError } = employeeQuery(activeEmployeeId, enabled);

  const chain = data?.chain ?? [];
  const focus = data?.focus ?? null;
  const directReports = data?.directReports ?? [];

  const [path, setPath] = useState<OrgChartNodeDto[]>([]);

  // ✅ detect mobile (< md)
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Refs/overlay only used on desktop mode
  const railRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const selectedRefs = useRef(new Map<string, HTMLDivElement | null>());

  const [links, setLinks] = useState<Link[]>([]);
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!chain.length) return;
    setPath(chain);
  }, [chain]);

  const currentFocus = path[path.length - 1] ?? focus ?? null;

  const columns: Column[] = useMemo(() => {
    if (!path.length) return [];

    const cols: Column[] = [];

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      cols.push({
        key: `chain-${node.id}`,
        title: i === 0 ? "Root" : (path[i - 1]?.name ?? "Chain"),
        nodes: [node],
        selectedId: node.id,
      });
    }

    if (focus) {
      cols.push({
        key: `directReports-${focus.id}`,
        title: `${focus.name} — Direct reports`,
        nodes: sortHeadsFirst(uniqById(directReports)),
        selectedId: undefined,
      });
    }

    return cols;
  }, [path, focus, directReports]);

  const selectedIdsForLinks = useMemo(() => {
    return path.map((n) => n.id).filter(Boolean);
  }, [path]);

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

    for (let i = 0; i < selectedIdsForLinks.length - 1; i++) {
      const aId = selectedIdsForLinks[i];
      const bId = selectedIdsForLinks[i + 1];

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

  // ✅ Only compute overlay/links on desktop layout
  useLayoutEffect(() => {
    if (isMobile) return;
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
  }, [isMobile, path, columns.length]);

  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile, selectedIdsForLinks]);

  if (!enabled) return <div className="p-6">Not authenticated.</div>;
  if (isLoading) return <Loading />;
  if (isError) return <div className="p-6">Failed to load org chart.</div>;
  if (!data) return <div className="p-6">No org chart data.</div>;
  if (!currentFocus) return null;

  const headerName = focus?.name ?? currentFocus.name;
  const headerMeta = [
    focus?.title ?? currentFocus.title,
    focus?.department ?? currentFocus.department,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Top (always) */}
      <div className="flex items-center justify-end px-4 py-3">
        <div className="text-right">
          <div className="text-sm font-medium leading-tight">{headerName}</div>
          <div className="text-xs text-muted-foreground leading-tight">
            {headerMeta}
          </div>
        </div>
      </div>

      {/* ===== MOBILE: vertical stack ===== */}
      <div className="md:hidden flex-1 overflow-y-auto pb-4 no-scrollbar space-y-6">
        <div className="space-y-4">
          {columns.map((col) => (
            <div key={col.key}>
              <div className="p-3 space-y-2">
                {col.nodes.length === 0
                  ? null
                  : col.nodes.map((n) => {
                      const isChainNode = path.some((p) => p.id === n.id);
                      const chainIndex = path.findIndex((p) => p.id === n.id);

                      const isActive =
                        (col.selectedId && n.id === col.selectedId) ||
                        (!col.selectedId && n.id === (focus?.id ?? ""));

                      const onClick = async () => {
                        // chain card -> jump to that depth
                        if (isChainNode && chainIndex >= 0) {
                          setPath(path.slice(0, chainIndex + 1));
                          setActiveEmployeeId(n.id);
                          return;
                        }
                        // direct report -> drill down
                        if (n.hasChildren) await prefetchChildren(n.id);
                        setActiveEmployeeId(n.id);
                      };

                      return (
                        <PersonCard
                          key={n.id}
                          node={n}
                          size="sm"
                          active={isActive}
                          onClick={onClick}
                          rightMeta={
                            <div className="text-[11px] text-muted-foreground">
                              {n.childrenCount ? `${n.childrenCount}` : ""}
                            </div>
                          }
                        />
                      );
                    })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP: horizontal rail (your original layout) ===== */}
      <div
        ref={railRef}
        className="hidden md:block flex-1 overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <div ref={contentRef} className="relative h-full min-w-max">
          {/* SVG overlay (desktop only) */}
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

          <div className="relative z-10 h-full flex gap-3 p-4">
            <AnimatePresence initial={false}>
              {columns.map((col) => (
                <motion.div
                  key={col.key}
                  initial={{ opacity: 0, x: 12, filter: "blur(3px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -12, filter: "blur(3px)" }}
                  transition={{ duration: 0.18 }}
                  className="h-full w-[320px] shrink-0 rounded-lg flex flex-col overflow-hidden"
                >
                  <div className="p-3 overflow-y-auto no-scrollbar space-y-2">
                    {col.nodes.length === 0
                      ? null
                      : col.nodes.map((n) => {
                          const isChainNode = path.some((p) => p.id === n.id);
                          const chainIndex = path.findIndex(
                            (p) => p.id === n.id,
                          );

                          const setSelectedRef = (
                            el: HTMLDivElement | null,
                          ) => {
                            if (isChainNode) selectedRefs.current.set(n.id, el);
                          };

                          const isActive =
                            (col.selectedId && n.id === col.selectedId) ||
                            (!col.selectedId && n.id === (focus?.id ?? ""));

                          const onClick = async () => {
                            if (isChainNode && chainIndex >= 0) {
                              setPath(path.slice(0, chainIndex + 1));
                              setActiveEmployeeId(n.id);
                              return;
                            }
                            if (n.hasChildren) await prefetchChildren(n.id);
                            setActiveEmployeeId(n.id);
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
                                onClick={onClick}
                                rightMeta={
                                  <div className="text-[11px] text-muted-foreground">
                                    {n.childrenCount
                                      ? `${n.childrenCount}`
                                      : ""}
                                  </div>
                                }
                              />
                            </motion.div>
                          );
                        })}
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
