import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  highlight?: boolean;
  alert?: boolean;
}

export default function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  highlight,
  alert,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-5 flex flex-col gap-3",
        alert
          ? "border-rose-200 bg-rose-50/40"
          : highlight
          ? "border-zinc-900 bg-zinc-900"
          : "border-zinc-200"
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            highlight ? "text-zinc-400" : alert ? "text-rose-500" : "text-zinc-400"
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            size={15}
            className={highlight ? "text-zinc-500" : alert ? "text-rose-400" : "text-zinc-300"}
          />
        )}
      </div>
      <div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            highlight ? "text-white" : alert ? "text-rose-700" : "text-zinc-900"
          )}
        >
          {value}
        </p>
        {sub && (
          <p
            className={cn(
              "text-xs mt-1",
              highlight ? "text-zinc-400" : alert ? "text-rose-400" : "text-zinc-400"
            )}
          >
            {sub}
          </p>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-600" : "text-rose-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-zinc-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
