"use client";
import type { FunnelStage } from "@/lib/types";

interface Props {
  data: FunnelStage[];
}

const STAGE_COLORS = [
  "bg-zinc-200",
  "bg-zinc-300",
  "bg-blue-200",
  "bg-amber-200",
  "bg-emerald-200",
  "bg-emerald-400",
];

export default function FunnelChart({ data }: Props) {
  const max = data[0]?.count ?? 1;

  return (
    <div className="space-y-2">
      {data.map((stage, i) => (
        <div key={stage.stage} className="group">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-zinc-400 w-20 text-right flex-shrink-0">
              {stage.label}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <div
                className={`h-7 rounded-md ${STAGE_COLORS[i]} transition-all duration-300`}
                style={{ width: `${(stage.count / max) * 100}%`, minWidth: 8 }}
              />
              <span className="text-xs font-semibold text-zinc-700 flex-shrink-0">
                {stage.count}
              </span>
              {i > 0 && stage.dropoffRate > 0 && (
                <span className="text-[10px] text-rose-400 flex-shrink-0">
                  −{stage.dropoffRate}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
