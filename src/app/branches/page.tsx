"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/context/FilterContext";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import FunnelChart from "@/components/charts/FunnelChart";
import { formatCurrency, cn } from "@/lib/utils";
import type { BranchStat, FunnelStage, RepStat } from "@/lib/types";
import { Building2, ChevronRight, Users, TrendingUp } from "lucide-react";

interface BranchDetail {
  branch: { id: string; name: string; city: string };
  funnel: FunnelStage[];
  reps: RepStat[];
  modelBreakdown: { model: string; total: number; delivered: number; conversionRate: number }[];
}

function BranchStatusPill({ status }: { status: BranchStat["status"] }) {
  const map = {
    on_track: "bg-emerald-50 text-emerald-700",
    at_risk: "bg-amber-50 text-amber-700",
    behind: "bg-rose-50 text-rose-700",
  };
  const label = { on_track: "On Track", at_risk: "At Risk", behind: "Behind" };
  return (
    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", map[status])}>
      {label[status]}
    </span>
  );
}

function BranchCard({
  branch,
  onClick,
}: {
  branch: BranchStat;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-xl p-5 text-left hover:border-zinc-300 hover:shadow-card transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center">
            <Building2 size={14} className="text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{branch.name}</p>
            <p className="text-xs text-zinc-400">{branch.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BranchStatusPill status={branch.status} />
          <ChevronRight
            size={14}
            className="text-zinc-300 group-hover:text-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Target Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-zinc-400">Monthly Target</span>
          <span className="text-[11px] font-semibold text-zinc-700">
            {branch.currentMonthActual.units}/{branch.currentMonthTarget.units} units
          </span>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              branch.targetAttainment >= 90
                ? "bg-emerald-500"
                : branch.targetAttainment >= 60
                ? "bg-amber-400"
                : "bg-rose-400"
            )}
            style={{ width: `${Math.min(branch.targetAttainment, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-400 mt-1">
          {branch.targetAttainment}% attainment
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-50">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Leads</p>
          <p className="text-sm font-semibold text-zinc-800 mt-0.5">{branch.totalLeads}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Delivered</p>
          <p className="text-sm font-semibold text-zinc-800 mt-0.5">{branch.delivered}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Revenue</p>
          <p className="text-sm font-semibold text-zinc-800 mt-0.5">
            {formatCurrency(branch.revenue)}
          </p>
        </div>
      </div>
    </button>
  );
}

function BranchDetailModal({
  branchId,
  open,
  onClose,
}: {
  branchId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { month } = useFilters();
  const [detail, setDetail] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !branchId) return;
    setLoading(true);
    fetch(`/api/branches?branchId=${branchId}&month=${month}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branchId, open, month]);

  return (
    <Modal open={open} onClose={onClose} size="xl">
      {loading || !detail ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Branch header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {detail.branch.name}
              </h2>
              <p className="text-xs text-zinc-400">{detail.branch.city}</p>
            </div>
          </div>

          {/* Funnel + Model breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Conversion Funnel
              </p>
              <FunnelChart data={detail.funnel} />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Models
              </p>
              <div className="space-y-2">
                {detail.modelBreakdown.slice(0, 6).map((m) => (
                  <div key={m.model} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-28 truncate">{m.model}</span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-800 rounded-full"
                        style={{
                          width: `${(m.total / (detail.modelBreakdown[0]?.total ?? 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-6 text-right">{m.total}</span>
                    <span className="text-[10px] text-zinc-300 w-6 text-right">
                      {m.conversionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reps Table */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Sales Reps
            </p>
            <div className="border border-zinc-100 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    {["Name", "Role", "Leads", "Delivered", "Revenue", "Conv %"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {detail.reps
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((rep) => (
                      <tr key={rep.id} className="hover:bg-zinc-50/60">
                        <td className="px-3 py-2.5 font-medium text-zinc-800">{rep.name}</td>
                        <td className="px-3 py-2.5 text-zinc-400 capitalize">
                          {rep.role === "branch_manager" ? "Manager" : "Officer"}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-600">{rep.totalLeads}</td>
                        <td className="px-3 py-2.5 font-medium text-zinc-800">{rep.delivered}</td>
                        <td className="px-3 py-2.5 font-medium text-zinc-800">
                          {formatCurrency(rep.revenue)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "font-semibold",
                              rep.conversionRate >= 40
                                ? "text-emerald-600"
                                : rep.conversionRate >= 25
                                ? "text-zinc-600"
                                : "text-rose-500"
                            )}
                          >
                            {rep.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function BranchesContent() {
  const searchParams = useSearchParams();
  const { branchId, month, queryString } = useFilters();
  const [branches, setBranches] = useState<BranchStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    searchParams.get("id") ?? null
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/branches?${queryString()}`)
      .then((r) => r.json())
      .then((d) => { setBranches(d.branches ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branchId, month]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Branches" subtitle="5 branches across Chennai, Bangalore, Hyderabad & Mumbai" />
      <div className="p-6 max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <BranchCard key={b.id} branch={b} onClick={() => setSelectedBranch(b.id)} />
            ))}
          </div>
        )}
      </div>

      {selectedBranch && (
        <BranchDetailModal
          branchId={selectedBranch}
          open={!!selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}

export default function BranchesPage() {
  return (
    <Suspense>
      <BranchesContent />
    </Suspense>
  );
}
