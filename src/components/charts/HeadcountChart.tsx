"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface HeadcountChartProps {
  filled: number;
  open: number;
  pendingOffer: number;
  onLeave: number;
}

const COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#94a3b8"];
const LABELS = ["Filled", "Open", "Pending Offer", "On Leave"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800">{d.name}: {d.value}</p>
    </div>
  );
};

export default function HeadcountChart({ filled, open, pendingOffer, onLeave }: HeadcountChartProps) {
  const data = [
    { name: "Filled",        value: filled       },
    { name: "Open",          value: open         },
    { name: "Pending Offer", value: pendingOffer },
    { name: "On Leave",      value: onLeave      },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
