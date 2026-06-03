"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface DataPoint {
  month: string;
  [key: string]: string | number;
}

interface SpendTrendChartProps {
  data: DataPoint[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
  area?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpendTrendChart({ data, lines, height = 260, area = false }: SpendTrendChartProps) {
  const Chart = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <defs>
          {lines.map((l) => (
            <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={l.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b", paddingTop: "12px" }} iconType="circle" iconSize={8} />
        {lines.map((l) =>
          area ? (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              fill={`url(#grad-${l.key})`}
              strokeWidth={2}
              dot={{ r: 3, fill: l.color }}
              activeDot={{ r: 5 }}
            />
          ) : (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 3, fill: l.color }}
              activeDot={{ r: 5 }}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
