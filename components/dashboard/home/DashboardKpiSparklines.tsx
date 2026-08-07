"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SparklinePoint {
  label: string;
  value: number;
  color?: string;
}

interface AreaSparklineProps {
  data: SparklinePoint[];
  color?: "blue" | "emerald" | "violet" | "amber";
  height?: number;
  width?: number;
}

export function AreaSparkline({ data, color = "blue", height = 44, width = 110 }: AreaSparklineProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ point: SparklinePoint; x: number; y: number } | null>(null);
  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const paddingY = 6;
  const usableHeight = height - paddingY * 2;
  const stepX = width / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - paddingY - ((d.value - min) / range) * usableHeight;
    return { x, y, raw: d };
  });

  // Generate smooth cubic bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorMap = {
    blue: { stroke: "#3b82f6", fill: "#3b82f6" },
    emerald: { stroke: "#10b981", fill: "#10b981" },
    violet: { stroke: "#8b5cf6", fill: "#8b5cf6" },
    amber: { stroke: "#f59e0b", fill: "#f59e0b" },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="relative flex items-center justify-end pt-5">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selectedColor.fill} stopOpacity={0.35} />
            <stop offset="100%" stopColor={selectedColor.fill} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Fill Area */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          d={fillD}
          fill={`url(#${gradientId})`}
        />

        {/* Stroke Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          stroke={selectedColor.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Hover Hotspots */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={6}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint({ point: pt.raw, x: pt.x, y: pt.y })}
          />
        ))}

        {/* Active Point Indicator */}
        {hoveredPoint && (
          <g>
            <line
              x1={hoveredPoint.x}
              y1={0}
              x2={hoveredPoint.x}
              y2={height}
              stroke={selectedColor.stroke}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity={0.5}
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={4}
              fill={selectedColor.stroke}
              stroke="var(--dash-surface)"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 3, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.95 }}
            className="absolute -top-3 z-50 pointer-events-none whitespace-nowrap rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--dash-text-primary)] shadow-md backdrop-blur-md"
            style={{
              left: Math.max(-10, Math.min(width - 55, hoveredPoint.x - 25)),
            }}
          >
            <span className="text-[var(--dash-text-secondary)] mr-1">{hoveredPoint.point.label}:</span>
            <span className="text-emerald-500 font-bold">{hoveredPoint.point.value.toLocaleString()}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BarSparklineProps {
  data: SparklinePoint[];
  color?: string;
  height?: number;
  width?: number;
}

export function BarSparkline({ data, color = "#10b981", height = 44, width = 105 }: BarSparklineProps) {
  const [hoveredBar, setHoveredBar] = useState<{ point: SparklinePoint; x: number } | null>(null);

  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const barGap = 4;
  const totalGaps = (data.length - 1) * barGap;
  const barWidth = Math.max(4, (width - totalGaps) / data.length);

  return (
    <div className="relative flex items-center justify-end pt-5">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        onMouseLeave={() => setHoveredBar(null)}
      >
        {data.map((d, i) => {
          const barH = Math.max(6, (d.value / max) * (height - 6));
          const x = i * (barWidth + barGap);
          const y = height - barH;
          const isHovered = hoveredBar?.point.label === d.label;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredBar({ point: d, x })}>
              <motion.rect
                initial={{ height: 0, y: height }}
                animate={{ height: barH, y }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                x={x}
                width={barWidth}
                rx={2.5}
                fill={d.color || color}
                opacity={isHovered ? 1 : 0.65}
                className="transition-opacity"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredBar && (
          <motion.div
            initial={{ opacity: 0, y: 3, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.95 }}
            className="absolute -top-3 z-50 pointer-events-none whitespace-nowrap rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--dash-text-primary)] shadow-md backdrop-blur-md"
            style={{
              left: Math.max(-10, Math.min(width - 55, hoveredBar.x - 20)),
            }}
          >
            <span className="text-[var(--dash-text-secondary)] mr-1">{hoveredBar.point.label}:</span>
            <span className="text-emerald-500 font-bold">{hoveredBar.point.value.toLocaleString()}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutSparklineProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

export function DonutSparkline({
  segments,
  size = 50,
  strokeWidth = 9,
}: DonutSparklineProps) {
  const [hoveredSeg, setHoveredSeg] = useState<DonutSegment | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, curr) => acc + curr.value, 0) || 1;

  let accumulatedPercent = 0;

  return (
    <div className="relative flex items-center justify-end pt-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible -rotate-90 transform"
        onMouseLeave={() => setHoveredSeg(null)}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--dash-border)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {/* Segments */}
        {segments.map((seg, idx) => {
          const percent = seg.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          const isHovered = hoveredSeg?.label === seg.label;

          return (
            <motion.circle
              key={idx}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredSeg(seg)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredSeg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -top-3 right-0 z-50 pointer-events-none whitespace-nowrap rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--dash-text-primary)] shadow-md backdrop-blur-md"
          >
            <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: hoveredSeg.color }} />
            <span className="text-[var(--dash-text-secondary)]">{hoveredSeg.label}:</span>{" "}
            <span className="text-violet-400 font-bold">{Math.round((hoveredSeg.value / total) * 100)}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
