"use client";

import { motion } from "framer-motion";
import type { PipelineDiagram } from "@/types";

interface PipelineDiagramProps {
  diagram: PipelineDiagram;
}

// Resolve node position by id
function getNode(diagram: PipelineDiagram, id: string) {
  return diagram.nodes.find((n) => n.id === id);
}

export default function PipelineDiagramView({ diagram }: PipelineDiagramProps) {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden"
      aria-hidden="true"
      style={{
        background: "var(--surface)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Title */}
      <div className="absolute top-4 left-4 right-4">
        <p
          className="text-xs font-mono font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Architecture
        </p>
      </div>

      {/* SVG canvas for edges */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {diagram.edges.map((edge, i) => {
          const from = getNode(diagram, edge.from);
          const to = getNode(diagram, edge.to);
          if (!from || !to) return null;

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={
                edge.animated ? "rgba(129,140,248,0.5)" : "var(--text-muted)"
              }
              strokeWidth="0.6"
              strokeDasharray={edge.animated ? "2 2" : undefined}
            />
          );
        })}

        {/* Arrowheads */}
        <defs>
          <marker
            id="arrow"
            markerWidth="4"
            markerHeight="4"
            refX="3"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {diagram.nodes.map((node) => (
        <div
          key={node.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Node dot */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${node.color}20`,
              border: `1px solid ${node.color}50`,
              boxShadow: `0 0 12px ${node.color}30`,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: node.color }}
            />
          </div>

          {/* Label */}
          <div className="mt-1 text-center leading-none">
            <p
              className="text-[9px] font-semibold font-mono text-center max-w-[60px]"
              style={{ color: node.color }}
            >
              {node.label}
            </p>
            {node.sublabel && (
              <p
                className="text-[7px] font-mono text-center max-w-[60px]"
                style={{ color: "var(--text-muted)" }}
              >
                {node.sublabel}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
