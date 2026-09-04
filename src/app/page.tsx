"use client";
import { useEffect, useState } from "react";
import { useFilters } from "@/context/FilterContext";
import Header from "@/components/layout/Header";
import KPICard from "@/components/ui/KPICard";
import RevenueChart from "@/components/charts/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { KPISummary, BranchStat, MonthlyRevenue, AlertItem } from "@/lib/types";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Activity,
  ChevronRight,
  X,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface OverviewData {
  kpi: KPISummary;
  branches: BranchStat[];
  monthlyRevenue: MonthlyRevenue[];
  alerts: AlertItem[];
}

const SEVERITY_STYLES = {
  critical: "bg-rose-50 border-rose-200 text-rose-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

const SEVERITY_DOT = {
  critical: "bg-rose-500",
  warning: "bg-amber-400",
  info: "bg-blue-400",
};

function BranchStatusBadge({ status }: { status: BranchStat["status"] }) {
  const map = {
    on_track: "text-emerald-600 bg-emerald-50",
    at_risk: "text-amber-600 bg-amber-50",
    behind: "text-rose-600 bg-rose-50",
  };
  const label = { on_track: "On Track", at_risk: "At Risk", behind: "Behind" };
  return (
    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", map[status])}>
      {label[status]}
    </span>
  );
}

export default function OverviewPage() {
  const { branchId, month, queryString } = useFilters();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertsDismissed, setAlertsDismissed] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/overview?${queryString()}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branchId, month]);

  if (loading || !data) {
    return (
      <div className="flex flex-col">
        <Header title="Overview" subtitle="Business performance at a glance" />
        <div className="p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpi, branches, monthlyRevenue, alerts } = data;
  const visibleAlerts = alerts.filter((_, i) => i < 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Overview" subtitle="Business performance at a glance" />
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Alert Banner */}
        {!alertsDismissed && visibleAlerts.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-500" />
                <span className="text-xs font-semibold text-zinc-700">
                  {alerts.length} item{alerts.length > 1 ? "s" : ""} need your attention
                </span>
              </div>
              <button
                onClick={() => setAlertsDismissed(true)}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
              >
                <X size={13} />
              </button>
            </div>
            <div className="divide-y divide-zinc-50">
              {visibleAlerts.map((alert, i) => (
                <div key={i} className={cn("flex items-start gap-3 px-4 py-3")}>
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                      SEVERITY_DOT[alert.severity]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-800">{alert.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{alert.description}</p>
                  </div>
                  {alert.type === "cold_lead" && (
                    <Link
                      href="/leads"
                      className="text-[11px] text-blue-600 hover:text-blue-700 flex-shrink-0 flex items-center gap-0.5"
                    >
                      View <ChevronRight size={11} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Total Revenue"
            value={formatCurrency(kpi.totalRevenue)}
            sub="All delivered deals"
            icon={DollarSign}
            highlight
          />
          <KPICard
            label="Units Delivered"
            value={kpi.totalDelivered.toString()}
            sub="Cars handed over"
            icon={Package}
          />
          <KPICard
            label="Active Pipeline"
            value={kpi.activePipeline.toString()}
            sub="Leads in progress"
            icon={Activity}
          />
          <KPICard
            label="Conversion Rate"
            value={`${kpi.conversionRate}%`}
            sub="Lead → Delivered"
            icon={TrendingUp}
          />
          <KPICard
            label="Avg Deal Size"
            value={formatCurrency(kpi.avgDealSize)}
            sub="Per delivered car"
            icon={ArrowUpRight}
          />
          <KPICard
            label="Leads at Risk"
            value={kpi.leadsAtRisk.toString()}
            sub="No activity 7+ days"
            icon={AlertTriangle}
            alert={kpi.leadsAtRisk > 0}
          />
        </div>

        {/* Revenue Chart + Branch Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Revenue Trend</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Monthly revenue vs target — Jun to Dec 2025
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-900 inline-block" /> Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-300 border-t border-dashed inline-block" /> Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-blue-500/15 inline-block rounded-sm" /> Units
                </span>
              </div>
            </div>
            <RevenueChart data={monthlyRevenue} />
          </div>

          {/* Pipeline Value Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Pipeline Value</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Active deals in progress</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900">
                {formatCurrency(kpi.pipelineValue)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                across {kpi.activePipeline} open leads
              </p>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Conversion potential</span>
                <span className="font-medium text-zinc-700">
                  {formatCurrency(kpi.pipelineValue * 0.31)}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full"
                  style={{ width: `${kpi.conversionRate}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                At current {kpi.conversionRate}% conversion rate
              </p>
            </div>
            <Link
              href="/insights"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-auto"
            >
              View forecasts <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Branch Performance Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Branch Performance</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Current month target attainment across all branches
              </p>
            </div>
            <Link
              href="/branches"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-50">
                  {["Branch", "City", "Status", "Leads", "Delivered", "Revenue", "Target Attainment", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-zinc-50/50 group">
                    <td className="px-5 py-3.5 font-medium text-zinc-800 text-xs">
                      {branch.name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">{branch.city}</td>
                    <td className="px-5 py-3.5">
                      <BranchStatusBadge status={branch.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-600">{branch.totalLeads}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-zinc-800">
                      {branch.delivered}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-zinc-800">
                      {formatCurrency(branch.revenue)}
                    </td>
                    <td className="px-5 py-3.5 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              branch.targetAttainment >= 90
                                ? "bg-emerald-500"
                                : branch.targetAttainment >= 60
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            )}
                            style={{
                              width: `${Math.min(branch.targetAttainment, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 w-8 text-right">
                          {branch.targetAttainment}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/branches?id=${branch.id}`}
                        className="text-[11px] text-zinc-400 group-hover:text-blue-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100"
                      >
                        Detail <ChevronRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
