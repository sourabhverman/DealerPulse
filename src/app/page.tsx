"use client";
import { useEffect, useState } from "react";
import { useFilters } from "@/context/FilterContext";
import Header from "@/components/layout/Header";
import KPICard from "@/components/ui/KPICard";
import FormulaTooltip from "@/components/ui/FormulaTooltip";
import RevenueChart from "@/components/charts/RevenueChart";
import { formatCurrency, monthLabel } from "@/lib/utils";
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
  Clock,
  Target,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface OverviewData {
  kpi: KPISummary;
  branches: BranchStat[];
  monthlyRevenue: MonthlyRevenue[];
  alerts: AlertItem[];
}

interface AlertDetail {
  type: string;
  explanation: string;
  recommendation: string;
  leads?: {
    id?: string;
    customer_name: string;
    model_interested: string;
    status: string;
    repName: string;
    branchName?: string;
    daysSinceActivity: number;
    deal_value: number;
  }[];
  // behind_target extras
  branch?: { id: string; name: string; city: string };
  targetUnits?: number;
  actualUnits?: number;
  gap?: number;
  attainment?: number;
  pipelineCount?: number;
  pipelineValue?: number;
  projectedTotal?: number;
  projectedGap?: number;
  topPipeline?: {
    customer_name: string;
    model_interested: string;
    status: string;
    repName: string;
    deal_value: number;
    daysSinceActivity: number;
  }[];
  totalValue?: number;
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
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [alertDetail, setAlertDetail] = useState<AlertDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openAlertDetail = async (alert: AlertItem) => {
    setSelectedAlert(alert);
    setAlertDetail(null);
    setDetailLoading(true);
    const params = new URLSearchParams({ type: alert.type });
    if (alert.branch_id) params.set("branchId", alert.branch_id);
    const res = await fetch(`/api/alert-detail?${params}`);
    const d = await res.json();
    setAlertDetail(d);
    setDetailLoading(false);
  };

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
  const monthName = month !== "all" ? monthLabel(month) : null;
  const scopeLabel = monthName
    ? `${monthName} 2025`
    : branchId !== "all"
    ? branches.find((b) => b.id === branchId)?.name ?? "All branches"
    : "7-month total";

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
                <div key={i} className="flex items-start gap-3 px-4 py-3">
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
                  <button
                    onClick={() => openAlertDetail(alert)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 flex-shrink-0 flex items-center gap-0.5 font-medium"
                  >
                    View <ChevronRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label={monthName ? `${monthName} Revenue` : "Total Revenue"}
            value={formatCurrency(kpi.totalRevenue)}
            sub={`Delivered — ${scopeLabel}`}
            icon={DollarSign}
            highlight
            formula={`SUM(deal_value)\nWHERE status = "delivered"`}
            formulaNote="Counts only leads that reached Delivered status within the selected period."
          />
          <KPICard
            label={monthName ? `${monthName} Deliveries` : "Units Delivered"}
            value={kpi.totalDelivered.toString()}
            sub={monthName ? `Cars delivered in ${monthName}` : "Cars handed over"}
            icon={Package}
            formula={`COUNT(leads)\nWHERE status = "delivered"`}
            formulaNote="Each lead = one car. Filtered by last_activity_at matching the selected month."
          />
          <KPICard
            label="Active Pipeline"
            value={kpi.activePipeline.toString()}
            sub={`Leads in progress · ${formatCurrency(kpi.pipelineValue)}`}
            icon={Activity}
            formula={`COUNT(leads) WHERE status IN\n  (new, contacted,\n   test_drive, negotiation,\n   order_placed)`}
            formulaNote="Excludes delivered and lost leads. Value = SUM of their deal_value."
          />
          <KPICard
            label="Conversion Rate"
            value={`${kpi.conversionRate}%`}
            sub={monthName ? `${monthName} lead → delivered` : "Overall lead → delivered"}
            icon={TrendingUp}
            formula={`delivered ÷ total_leads × 100`}
            formulaNote="total_leads includes all statuses (active + delivered + lost). Industry avg is 25–30%."
          />
          <KPICard
            label="Avg Deal Size"
            value={kpi.totalDelivered > 0 ? formatCurrency(kpi.avgDealSize) : "—"}
            sub={monthName ? `Per ${monthName} delivery` : "Per delivered car"}
            icon={ArrowUpRight}
            formula={`totalRevenue ÷ unitsDelivered`}
            formulaNote="Average value of each car sold. Only delivered leads are included."
          />
          <KPICard
            label="Leads at Risk"
            value={kpi.leadsAtRisk.toString()}
            sub="No activity 7+ days"
            icon={AlertTriangle}
            alert={kpi.leadsAtRisk > 0}
            formula={`COUNT(active leads)\nWHERE last_activity_at\n  < Dec 31 − 7 days`}
            formulaNote="Active = not delivered/lost. Reference date is Dec 31 2025 (dataset end)."
            formulaPosition="left"
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
                  {branchId !== "all" && ` · ${branches.find((b) => b.id === branchId)?.name}`}
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
              <p className="text-xs text-zinc-400 mt-0.5">{scopeLabel} · active deals</p>
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
                <span className="flex items-center">
                  Conversion potential
                  <FormulaTooltip formula={`pipelineValue × conversionRate%`} note="Estimated revenue if current pipeline converts at historical rate." position="top" />
                </span>
                <span className="font-medium text-zinc-700">
                  {formatCurrency(kpi.pipelineValue * (kpi.conversionRate / 100))}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full"
                  style={{ width: `${Math.min(kpi.conversionRate, 100)}%` }}
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
                  {[
                    { h: "Branch", f: null },
                    { h: "City", f: null },
                    { h: "Status", f: null },
                    { h: "Leads", f: "COUNT(all leads)\nfor this branch" },
                    { h: "Delivered", f: "COUNT WHERE\nstatus = \"delivered\"" },
                    { h: "Revenue", f: "SUM(deal_value)\nWHERE status = \"delivered\"" },
                    { h: "Target Attainment", f: "actualDelivered ÷ targetUnits × 100\n\nactual = delivered in Dec\ntarget = monthly branch goal" },
                    { h: "", f: null },
                  ].map(({ h, f }) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-400"
                    >
                      <span className="flex items-center gap-0.5">
                        {h}
                        {f && <FormulaTooltip formula={f} position="bottom" />}
                      </span>
                    </th>
                  ))}
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

      {/* Alert Detail Drawer */}
      {selectedAlert && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedAlert(null)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className={cn(
              "px-5 py-4 border-b flex items-start justify-between gap-3",
              selectedAlert.severity === "critical" ? "bg-rose-50 border-rose-100" :
              selectedAlert.severity === "warning" ? "bg-amber-50 border-amber-100" :
              "bg-blue-50 border-blue-100"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  selectedAlert.severity === "critical" ? "bg-rose-100" :
                  selectedAlert.severity === "warning" ? "bg-amber-100" : "bg-blue-100"
                )}>
                  {selectedAlert.type === "cold_lead" && (
                    <Clock size={14} className={selectedAlert.severity === "critical" ? "text-rose-600" : "text-amber-600"} />
                  )}
                  {selectedAlert.type === "behind_target" && (
                    <Target size={14} className="text-rose-600" />
                  )}
                  {selectedAlert.type === "high_value_pipeline" && (
                    <TrendingUp size={14} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{selectedAlert.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selectedAlert.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 rounded-lg hover:bg-black/10 text-zinc-400 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailLoading ? (
                <div className="space-y-3">
                  {[80, 60, 90, 70].map((w, i) => (
                    <div key={i} className="h-3 bg-zinc-100 rounded animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : alertDetail ? (
                <>
                  {/* Explanation */}
                  <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb size={12} className="text-zinc-500" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Why this matters</p>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">{alertDetail.explanation}</p>
                  </div>

                  {/* Behind-target stats */}
                  {alertDetail.type === "behind_target" && alertDetail.targetUnits != null && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Target", value: `${alertDetail.targetUnits} units`, color: "text-zinc-700" },
                        { label: "Delivered", value: `${alertDetail.actualUnits} units`, color: "text-zinc-700" },
                        { label: "Gap", value: `${alertDetail.gap} units short`, color: "text-rose-600" },
                        { label: "Attainment", value: `${alertDetail.attainment}%`, color: alertDetail.attainment! < 30 ? "text-rose-600" : "text-amber-600" },
                        { label: "In Pipeline", value: `${alertDetail.pipelineCount} leads`, color: "text-zinc-700" },
                        { label: "Projected Total", value: `~${alertDetail.projectedTotal} units`, color: alertDetail.projectedGap! <= 0 ? "text-emerald-600" : "text-amber-600" },
                      ].map((s) => (
                        <div key={s.label} className="bg-white border border-zinc-100 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wide text-zinc-400">{s.label}</p>
                          <p className={cn("text-sm font-bold mt-0.5", s.color)}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leads table (cold_lead + high_value_pipeline) */}
                  {alertDetail.leads && alertDetail.leads.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-zinc-50 bg-zinc-50/60">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          {alertDetail.type === "cold_lead" ? "Cold Leads — Act Now" : "High-Value Deals"}
                        </p>
                      </div>
                      <div className="divide-y divide-zinc-50">
                        {alertDetail.leads.map((lead, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-zinc-800 truncate">{lead.customer_name}</p>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {lead.model_interested} · {lead.repName}
                                {lead.branchName ? ` · ${lead.branchName}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                lead.daysSinceActivity >= 14 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {lead.daysSinceActivity}d
                              </span>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-zinc-700">₹{(lead.deal_value / 100000).toFixed(1)}L</p>
                                <p className="text-[10px] text-zinc-400 capitalize">{lead.status.replace("_", " ")}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top pipeline (behind_target) */}
                  {alertDetail.topPipeline && alertDetail.topPipeline.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-zinc-50 bg-zinc-50/60">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Closest-to-Close Pipeline</p>
                      </div>
                      <div className="divide-y divide-zinc-50">
                        {alertDetail.topPipeline.map((lead, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-zinc-800 truncate">{lead.customer_name}</p>
                              <p className="text-[11px] text-zinc-400 truncate">{lead.model_interested} · {lead.repName}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                                lead.status === "order_placed" ? "bg-emerald-50 text-emerald-600" :
                                lead.status === "negotiation" ? "bg-blue-50 text-blue-600" :
                                "bg-zinc-100 text-zinc-500"
                              )}>
                                {lead.status.replace("_", " ")}
                              </span>
                              <p className="text-xs font-semibold text-zinc-700">₹{(lead.deal_value / 100000).toFixed(1)}L</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="border border-zinc-200 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Recommended Action</p>
                    <p className="text-xs text-zinc-800 leading-relaxed font-medium">{alertDetail.recommendation}</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
