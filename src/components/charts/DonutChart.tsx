"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7", "#f4f4f5"];

interface Props {
  data: DataPoint[];
  centerLabel?: string;
  centerValue?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-card p-2.5 text-xs">
      <p className="font-medium text-zinc-800">{payload[0].name}</p>
      <p className="text-zinc-500 mt-0.5">{payload[0].value} leads</p>
    </div>
  );
}

export default function DonutChart({ data, centerLabel, centerValue }: Props) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold text-zinc-900">{centerValue}</p>
          {centerLabel && <p className="text-[10px] text-zinc-400">{centerLabel}</p>}
        </div>
      )}
    </div>
  );
}
