"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface DataPoint {
  month: string;
  actual: number;
  budget: number;
  forecast?: number;
}

interface BudgetVsActualChartProps {
  data: DataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill || p.color }} />
          <span className="text-slate-600 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetVsActualChart({ data, height = 260 }: BudgetVsActualChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#64748b", paddingTop: "12px" }}
          iconType="square"
          iconSize={10}
        />
        <Bar dataKey="budget"   name="Budget"   fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual"   name="Actual"   fill="#6366f1" radius={[4, 4, 0, 0]} />
        {data[0]?.forecast != null && (
          <Bar dataKey="forecast" name="Forecast" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
