"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { formatCurrency, cn } from "@/lib/utils";
import type { AlertItem, AgingLead, RepStat } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Users,
} from "lucide-react";

interface ForecastItem {
  branchId: string;
  branchName: string;
  targetUnits: number;
  actualUnits: number;
  pipelineUnits: number;
  projectedUnits: number;
  gap: number;
  onTrack: boolean;
  attainment: number;
}

interface InsightsData {
  alerts: AlertItem[];
  aging: AgingLead[];
  forecasts: ForecastItem[];
  topReps: RepStat[];
  bestSource: {
    source: string;
    total: number;
    delivered: number;
    rate: number;
  };
}

const ALERT_ICONS = {
  cold_lead: Clock,
  behind_target: Target,
  high_value_pipeline: TrendingUp,
  delay_risk: AlertTriangle,
};

const SEVERITY_BG = {
  critical: "bg-rose-50 border-rose-200",
  warning: "bg-amber-50 border-amber-100",
  info: "bg-blue-50 border-blue-100",
};

const SEVERITY_ICON_COLOR = {
  critical: "text-rose-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col">
        <Header title="Insights" subtitle="Automated alerts and forecasts" />
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Smart Insights"
        subtitle="Auto-generated alerts, forecasts, and recommendations"
      />
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Alert Cards */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-zinc-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Action Required
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.alerts.map((alert, i) => {
              const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border",
                    SEVERITY_BG[alert.severity]
                  )}
                >
                  <Icon
                    size={16}
                    className={cn("mt-0.5 flex-shrink-0", SEVERITY_ICON_COLOR[alert.severity])}
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{alert.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{alert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Forecasting */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-zinc-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              December Target Forecast
            </h2>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    {["Branch", "Target", "Delivered", "In Pipeline", "Projected", "Gap", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {data.forecasts.map((f) => (
                    <tr key={f.branchId} className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5 font-medium text-zinc-800">{f.branchName}</td>
                      <td className="px-5 py-3.5 text-zinc-500">{f.targetUnits} units</td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-800">
                        {f.actualUnits}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500">{f.pipelineUnits}</td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-700">
                        ~{f.projectedUnits}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-semibold",
                            f.gap <= 0 ? "text-emerald-600" : "text-rose-500"
                          )}
                        >
                          {f.gap <= 0
                            ? `+${Math.abs(f.gap)} ahead`
                            : `${f.gap} short`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {f.onTrack ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            <CheckCircle size={12} /> On track
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-500 text-xs font-medium">
                            <AlertTriangle size={12} /> At risk
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-zinc-50 bg-zinc-50/50">
              <p className="text-[11px] text-zinc-400">
                Projection assumes 60% conversion on current pipeline. Actual results depend on follow-up activity.
              </p>
            </div>
          </div>
        </section>

        {/* Cold Leads + Top Reps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cold leads urgent */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-amber-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cold Leads — Act Now
              </h2>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-zinc-50">
                {data.aging.slice(0, 8).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-800 truncate">
                        {lead.customer_name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {lead.model_interested} · {lead.repName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p
                        className={cn(
                          "text-xs font-bold",
                          lead.daysSinceActivity >= 14 ? "text-rose-600" : "text-amber-600"
                        )}
                      >
                        {lead.daysSinceActivity}d
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {formatCurrency(lead.deal_value)}
                      </p>
                    </div>
                  </div>
                ))}
                {data.aging.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <CheckCircle size={20} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400">All leads have recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Top performers */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-zinc-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Top Performers
              </h2>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-zinc-50">
                {data.topReps.map((rep, i) => (
                  <div key={rep.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                          ? "bg-zinc-200 text-zinc-600"
                          : i === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-zinc-100 text-zinc-400"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-800">{rep.name}</p>
                      <p className="text-[11px] text-zinc-400">{rep.branchName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-800">
                        {formatCurrency(rep.revenue)}
                      </p>
                      <p className="text-[11px] text-zinc-400">{rep.delivered} delivered</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best source callout */}
            {data.bestSource && (
              <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <TrendingUp size={16} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">
                    Best converting channel:{" "}
                    <span className="capitalize">
                      {data.bestSource.source.replace("_", " ")}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    {Math.round(data.bestSource.rate)}% conversion rate ·{" "}
                    {data.bestSource.delivered} of {data.bestSource.total} leads delivered
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
