"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
} from "recharts";
import type { MonthlyRevenue } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: MonthlyRevenue[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-card p-3 text-xs">
      <p className="font-semibold text-zinc-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500">{p.name}:</span>
          <span className="font-medium text-zinc-800">
            {p.dataKey.includes("nit") ? p.value : formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="revenue"
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <YAxis
          yAxisId="units"
          orientation="right"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          width={25}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#18181b"
          fill="#f4f4f5"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          yAxisId="revenue"
          type="monotone"
          dataKey="targetRevenue"
          name="Target Revenue"
          stroke="#d4d4d8"
          strokeWidth={1}
          strokeDasharray="4 3"
          dot={false}
        />
        <Bar
          yAxisId="units"
          dataKey="units"
          name="Units Delivered"
          fill="#2563eb"
          radius={[3, 3, 0, 0]}
          opacity={0.15}
          barSize={18}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
