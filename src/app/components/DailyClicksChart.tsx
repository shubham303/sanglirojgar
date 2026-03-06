"use client";

import { useState, useEffect, useMemo } from "react";
import { DailyClickStats } from "@/lib/types";

interface Props {
  isLoggedIn: boolean;
}

export default function DailyClicksChart({ isLoggedIn }: Props) {
  const [stats, setStats] = useState<DailyClickStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch(`/api/admin/stats/daily-clicks?days=${days}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStats(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [isLoggedIn, days]);

  // Fill in missing dates with 0 values
  const filledStats = useMemo(() => {
    const map = new Map(stats.map((s) => [s.date, s]));
    const result: DailyClickStats[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push(map.get(dateStr) || { date: dateStr, call_count: 0, whatsapp_count: 0 });
    }
    return result;
  }, [stats, days]);

  const maxValue = useMemo(() => {
    let max = 0;
    for (const s of filledStats) {
      const total = s.call_count + s.whatsapp_count;
      if (total > max) max = total;
    }
    return Math.max(max, 1); // avoid division by zero
  }, [filledStats]);

  const totalCalls = filledStats.reduce((sum, s) => sum + s.call_count, 0);
  const totalWhatsApp = filledStats.reduce((sum, s) => sum + s.whatsapp_count, 0);

  if (loading) {
    return (
      <div
        className="bg-white rounded-xl p-4 mb-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-gray-400 text-sm text-center py-4">लोड होत आहे...</p>
      </div>
    );
  }

  // SVG chart dimensions
  const chartWidth = 600;
  const chartHeight = 200;
  const padLeft = 35;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 25;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const pointCount = filledStats.length;
  const xStep = pointCount > 1 ? plotW / (pointCount - 1) : plotW;

  const toX = (i: number) => padLeft + i * xStep;
  const toY = (val: number) => padTop + plotH - (val / maxValue) * plotH;

  // Build SVG path strings
  const buildPath = (getValue: (s: DailyClickStats) => number) => {
    return filledStats
      .map((s, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(getValue(s)).toFixed(1)}`)
      .join(" ");
  };

  const callPath = buildPath((s) => s.call_count);
  const waPath = buildPath((s) => s.whatsapp_count);
  const totalPath = buildPath((s) => s.call_count + s.whatsapp_count);

  // Y-axis labels (0, mid, max)
  const yLabels = [0, Math.round(maxValue / 2), maxValue];

  // X-axis labels — show ~6 evenly spaced dates
  const xLabelCount = Math.min(6, pointCount);
  const xLabelStep = Math.max(1, Math.floor((pointCount - 1) / (xLabelCount - 1)));

  return (
    <div
      className="bg-white rounded-xl p-4 mb-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">
          दैनिक संपर्क
        </p>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF6B00]"
        >
          <option value={7}>7 दिवस</option>
          <option value={14}>14 दिवस</option>
          <option value={30}>30 दिवस</option>
          <option value={60}>60 दिवस</option>
          <option value={90}>90 दिवस</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-lg px-3 py-2" style={{ backgroundColor: "#eff6ff" }}>
          <p className="text-[10px] text-gray-500 uppercase">Call</p>
          <p className="text-lg font-bold" style={{ color: "#2563eb" }}>{totalCalls}</p>
        </div>
        <div className="flex-1 rounded-lg px-3 py-2" style={{ backgroundColor: "#f0fdf4" }}>
          <p className="text-[10px] text-gray-500 uppercase">WhatsApp</p>
          <p className="text-lg font-bold" style={{ color: "#16a34a" }}>{totalWhatsApp}</p>
        </div>
        <div className="flex-1 rounded-lg px-3 py-2" style={{ backgroundColor: "#fff7ed" }}>
          <p className="text-[10px] text-gray-500 uppercase">एकूण</p>
          <p className="text-lg font-bold" style={{ color: "#c2410c" }}>{totalCalls + totalWhatsApp}</p>
        </div>
      </div>

      {/* Chart */}
      {totalCalls + totalWhatsApp === 0 ? (
        <p className="text-gray-400 text-xs text-center py-6">
          या कालावधीत कोणताही संपर्क नोंदवला नाही
        </p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            style={{ minWidth: "300px" }}
          >
            {/* Grid lines */}
            {yLabels.map((v) => (
              <line
                key={v}
                x1={padLeft}
                y1={toY(v)}
                x2={chartWidth - padRight}
                y2={toY(v)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            {yLabels.map((v) => (
              <text
                key={v}
                x={padLeft - 5}
                y={toY(v) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#9ca3af"
              >
                {v}
              </text>
            ))}

            {/* X-axis date labels */}
            {filledStats.map((s, i) => {
              if (i % xLabelStep !== 0 && i !== pointCount - 1) return null;
              const parts = s.date.split("-");
              const label = `${parseInt(parts[2])}/${parseInt(parts[1])}`;
              return (
                <text
                  key={s.date}
                  x={toX(i)}
                  y={chartHeight - 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#9ca3af"
                >
                  {label}
                </text>
              );
            })}

            {/* Total line (background) */}
            <path
              d={totalPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.5"
            />

            {/* Call line */}
            <path d={callPath} fill="none" stroke="#2563eb" strokeWidth="2" />

            {/* WhatsApp line */}
            <path d={waPath} fill="none" stroke="#16a34a" strokeWidth="2" />

            {/* Dots for call */}
            {filledStats.map((s, i) =>
              s.call_count > 0 ? (
                <circle key={`c-${i}`} cx={toX(i)} cy={toY(s.call_count)} r="2.5" fill="#2563eb" />
              ) : null
            )}

            {/* Dots for whatsapp */}
            {filledStats.map((s, i) =>
              s.whatsapp_count > 0 ? (
                <circle key={`w-${i}`} cx={toX(i)} cy={toY(s.whatsapp_count)} r="2.5" fill="#16a34a" />
              ) : null
            )}
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#2563eb" }} />
          <span className="text-[10px] text-gray-500">Call</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#16a34a" }} />
          <span className="text-[10px] text-gray-500">WhatsApp</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded border-dashed" style={{ borderBottom: "1.5px dashed #f97316" }} />
          <span className="text-[10px] text-gray-500">एकूण</span>
        </div>
      </div>
    </div>
  );
}
