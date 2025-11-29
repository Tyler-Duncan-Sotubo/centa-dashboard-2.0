/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import html2canvas from "html2canvas";

// Interface with department
export interface OrgChartNodeDto {
  id: string;
  name: string;
  title: string;
  department: string;
  managerId: string | null;
  children: OrgChartNodeDto[];
}

interface OrgChartStaticProps {
  data: OrgChartNodeDto[];
}

const OrgChartNode = ({
  node,
  maxVisible = 3,
}: {
  node: OrgChartNodeDto;
  maxVisible?: number;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleChildren = expanded
    ? node.children
    : node.children.slice(0, maxVisible);
  const remainingCount = node.children.length - visibleChildren.length;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <div
        className="bg-blue-50 border-2 border-blue-500 rounded-xl px-6 py-4 text-center shadow-md cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="text-lg font-semibold text-blue-800">{node.name}</div>
        {node.title && (
          <div className="text-sm text-blue-600">{node.title}</div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-14 bg-gray-700 text-white text-sm px-3 py-1 rounded-lg shadow-lg z-10 whitespace-nowrap">
          Department: {node.department || "N/A"}
        </div>
      )}

      {/* Children */}
      {node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-blue-300 my-2"></div>

          <div className="flex justify-center items-start gap-8">
            {visibleChildren.map((child) => (
              <div
                key={child.id}
                className="flex flex-col items-center relative"
              >
                <OrgChartNode node={child} maxVisible={maxVisible} />
              </div>
            ))}

            {remainingCount > 0 && (
              <div className="flex flex-col items-center">
                <button
                  className="bg-gray-300 text-sm px-4 py-2 rounded"
                  onClick={() => setExpanded(true)}
                >
                  +{remainingCount} more
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function OrgChartStatic({ data }: OrgChartStaticProps) {
  const ceo = data.find((n) => n.managerId === null) || data[0];
  const chartRef = useRef<HTMLDivElement>(null);

  // Automatically center after render
  const transformRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (transformRef.current) {
      transformRef.current.centerView();
    }
  }, []);

  // Export chart as image
  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "org-chart.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="w-full h-screen border p-4 flex flex-col">
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Export as Image
        </button>
      </div>

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
        limitToBounds={false} // important for better zoom
      >
        <TransformComponent>
          <div ref={chartRef} className="flex flex-col items-center p-8">
            <OrgChartNode node={ceo} />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
