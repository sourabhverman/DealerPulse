"use client";
import { useEffect, useState } from "react";
import { useFilters } from "@/context/FilterContext";
import Header from "@/components/layout/Header";
import FunnelChart from "@/components/charts/FunnelChart";
import DonutChart from "@/components/charts/DonutChart";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, cn } from "@/lib/utils";
import type { FunnelStage, AgingLead, LostReason, SourceStat } from "@/lib/types";
import { Clock, AlertTriangle, TrendingDown } from "lucide-react";

interface LeadsData {
  funnel: FunnelStage[];
  aging: AgingLead[];
  lostReasons: LostReason[];
  sources: SourceStat[];
  total: number;
}

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  walk_in: "Walk-in",
  referral: "Referral",
  social_media: "Social",
  phone_enquiry: "Phone",
  auto_expo: "Auto Expo",
};

function AgingRow({ lead }: { lead: AgingLead }) {
  const urgent = lead.daysSinceActivity >= 14;
  const warn = lead.daysSinceActivity >= 7;
  return (
    <tr className="border-b border-zinc-50 hover:bg-zinc-50/60 group">
      <td className="px-4 py-3">
        <div>
          <p className="text-xs font-medium text-zinc-800">{lead.customer_name}</p>
          <p className="text-[11px] text-zinc-400">{lead.model_interested}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-4 py-3 text-xs text-zinc-500">{lead.repName}</td>
      <td className="px-4 py-3 text-xs text-zinc-400">{lead.branchName}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            urgent ? "text-rose-600" : warn ? "text-amber-600" : "text-zinc-500"
          )}
        >
          {(urgent || warn) && <Clock size={11} />}
          {lead.daysSinceActivity}d ago
        </span>
      </td>
      <td className="px-4 py-3 text-xs font-medium text-zinc-700">
        {formatCurrency(lead.deal_value)}
      </td>
      <td className="px-4 py-3 text-xs text-zinc-400">
        {SOURCE_LABEL[lead.source] ?? lead.source}
      </td>
    </tr>
  );
}

export default function LeadsPage() {
  const { branchId, month, queryString } = useFilters();
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"funnel" | "aging" | "lost" | "sources">("funnel");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads?${queryString()}&minDays=5`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branchId, month]);

  if (loading || !data) {
    return (
      <div className="flex flex-col">
        <Header title="Leads" subtitle="Funnel, aging, and loss analysis" />
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const coldLeads = data.aging.filter((l) => l.daysSinceActivity >= 7);
  const urgentLeads = data.aging.filter((l) => l.daysSinceActivity >= 14);
  const coldValue = coldLeads.reduce((s, l) => s + l.deal_value, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Leads" subtitle="Funnel analysis, aging, and lost reasons" />
      <div className="p-6 space-y-5 max-w-7xl">

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Total Leads</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{data.total}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Cold Leads (7d+)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{coldLeads.length}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{formatCurrency(coldValue)} at risk</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p className="text-[11px] text-rose-400 uppercase tracking-wide">Urgent (14d+)</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{urgentLeads.length}</p>
            <p className="text-[11px] text-rose-400 mt-0.5">likely going cold</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Top Lost Reason</p>
            <p className="text-sm font-bold text-zinc-900 mt-1 leading-tight">
              {data.lostReasons[0]?.reason ?? "—"}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {data.lostReasons[0]?.count} cases ({data.lostReasons[0]?.percentage}%)
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
          {[
            { key: "funnel", label: "Conversion Funnel" },
            { key: "aging", label: "Lead Aging" },
            { key: "lost", label: "Lost Reasons" },
            { key: "sources", label: "Lead Sources" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                tab === key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "funnel" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Conversion Funnel</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Where leads drop off in the sales pipeline
              </p>
              <FunnelChart data={data.funnel} />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Stage Breakdown</h3>
              <p className="text-xs text-zinc-400 mb-4">Leads that reached each stage</p>
              <div className="space-y-3">
                {data.funnel.map((stage, i) => {
                  const pct = data.funnel[0]
                    ? Math.round((stage.count / data.funnel[0].count) * 100)
                    : 0;
                  return (
                    <div key={stage.stage} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 w-24 text-right">{stage.label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-800 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                <p className="text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-700">
                    {data.funnel[0]?.count
                      ? Math.round(
                          ((data.funnel[data.funnel.length - 1]?.count ?? 0) /
                            data.funnel[0].count) *
                            100
                        )
                      : 0}
                    %
                  </span>{" "}
                  of leads that enter the funnel get delivered — industry avg is ~25–30%
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "aging" && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900">Lead Aging Tracker</h3>
              <span className="text-xs text-zinc-400 ml-1">— active leads with no recent activity</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/50">
                    {["Customer", "Status", "Assigned To", "Branch", "Last Activity", "Value", "Source"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.aging.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-400">
                        No aging leads
                      </td>
                    </tr>
                  ) : (
                    data.aging.map((lead) => <AgingRow key={lead.id} lead={lead} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "lost" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Lost Reasons</h3>
              <p className="text-xs text-zinc-400 mb-4">Why leads didn't convert</p>
              <DonutChart
                data={data.lostReasons.map((r) => ({
                  name: r.reason,
                  value: r.count,
                }))}
                centerValue={`${data.lostReasons.reduce((s, r) => s + r.count, 0)}`}
                centerLabel="total lost"
              />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Breakdown</h3>
              <div className="space-y-3">
                {data.lostReasons.map((r, i) => (
                  <div key={r.reason}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-600">{r.reason}</span>
                      <span className="text-xs font-semibold text-zinc-700">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.percentage}%`,
                          background: `hsl(0 0% ${Math.max(10, 85 - i * 10)}%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingDown size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Top 3 reasons account for{" "}
                    {data.lostReasons
                      .slice(0, 3)
                      .reduce((s, r) => s + r.percentage, 0)}
                    %</span>{" "}
                    of all lost leads. Competitor pricing and follow-up gaps are actionable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "sources" && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Lead Source Performance</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Which channels convert best</p>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {data.sources
                  .sort((a, b) => b.total - a.total)
                  .map((src) => (
                    <div key={src.source} className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500 w-24 flex-shrink-0">{src.label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-7 bg-zinc-100 rounded-md overflow-hidden flex-1 relative">
                          <div
                            className="h-full bg-zinc-200 rounded-md transition-all"
                            style={{
                              width: `${
                                (src.total /
                                  Math.max(...data.sources.map((s) => s.total))) *
                                100
                              }%`,
                            }}
                          />
                          <div
                            className="absolute inset-y-0 left-0 bg-zinc-800 rounded-md"
                            style={{
                              width: `${
                                (src.delivered /
                                  Math.max(...data.sources.map((s) => s.total))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 w-8 text-right">{src.total}</span>
                        <span className="text-xs font-semibold text-emerald-600 w-10 text-right">
                          {src.conversionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-zinc-200 rounded-sm inline-block" /> Total leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-zinc-800 rounded-sm inline-block" /> Delivered
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
