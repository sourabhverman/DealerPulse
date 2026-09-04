"use client";
import { useEffect, useState } from "react";
import { useFilters } from "@/context/FilterContext";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, cn } from "@/lib/utils";
import type { RepStat } from "@/lib/types";
import { Trophy, User } from "lucide-react";

interface RepDetail {
  rep: { id: string; name: string; role: string; joined: string };
  branch: { name: string; city: string };
  recentLeads: {
    id: string;
    customer_name: string;
    model_interested: string;
    status: string;
    deal_value: number;
    created_at: string;
    last_activity_at: string;
    source: string;
  }[];
}

function RepModal({
  repId,
  open,
  onClose,
  repStat,
}: {
  repId: string;
  open: boolean;
  onClose: () => void;
  repStat?: RepStat;
}) {
  const { month } = useFilters();
  const [detail, setDetail] = useState<RepDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !repId) return;
    setLoading(true);
    fetch(`/api/reps?repId=${repId}&month=${month}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [repId, open, month]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={repStat?.name ?? "Rep Detail"}
      subtitle={repStat ? `${repStat.branchName} · ${repStat.role === "branch_manager" ? "Branch Manager" : "Sales Officer"}` : undefined}
    >
      {loading || !detail ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stats row */}
          {repStat && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Leads", value: repStat.totalLeads.toString() },
                { label: "Delivered", value: repStat.delivered.toString() },
                { label: "Revenue", value: formatCurrency(repStat.revenue) },
                { label: "Conversion", value: `${repStat.conversionRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide">{label}</p>
                  <p className="text-base font-bold text-zinc-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent leads */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Recent Leads
            </p>
            <div className="border border-zinc-100 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    {["Customer", "Model", "Status", "Value", "Last Activity"].map((h) => (
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
                  {detail.recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50/60">
                      <td className="px-3 py-2.5 font-medium text-zinc-800">
                        {lead.customer_name}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500">{lead.model_interested}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-zinc-700">
                        {formatCurrency(lead.deal_value)}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">
                        {new Date(lead.last_activity_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
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

export default function RepsPage() {
  const { branchId, month, queryString } = useFilters();
  const [reps, setReps] = useState<RepStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reps?${queryString()}`)
      .then((r) => r.json())
      .then((d) => { setReps(d.reps ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [branchId, month]);

  const selectedRepStat = reps.find((r) => r.id === selectedRep);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Sales Reps" subtitle="Leaderboard across all branches" />
      <div className="p-6 max-w-7xl">

        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Performance Leaderboard</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {reps.length} reps · click any row for lead details
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/50">
                    {["Rank", "Name", "Branch", "Role", "Leads", "Delivered", "Revenue", "Conv %", "Avg Deal", ""].map(
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
                <tbody className="divide-y divide-zinc-50">
                  {reps.map((rep, i) => (
                    <tr
                      key={rep.id}
                      onClick={() => setSelectedRep(rep.id)}
                      className="hover:bg-zinc-50 cursor-pointer group"
                    >
                      <td className="px-4 py-3 w-12">
                        {i < 3 ? (
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                              i === 0
                                ? "bg-amber-100 text-amber-700"
                                : i === 1
                                ? "bg-zinc-200 text-zinc-600"
                                : "bg-orange-100 text-orange-600"
                            )}
                          >
                            {i + 1}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 pl-1.5">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={12} className="text-zinc-500" />
                          </div>
                          <span className="text-xs font-medium text-zinc-800">{rep.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{rep.branchName}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {rep.role === "branch_manager" ? "Manager" : "Officer"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{rep.totalLeads}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-zinc-800">{rep.delivered}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-zinc-800">
                        {formatCurrency(rep.revenue)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-bold",
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
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {rep.avgDealSize > 0 ? formatCurrency(rep.avgDealSize) : "—"}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-zinc-300 group-hover:text-blue-500">
                        View →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedRep && (
        <RepModal
          repId={selectedRep}
          open={!!selectedRep}
          onClose={() => setSelectedRep(null)}
          repStat={selectedRepStat}
        />
      )}
    </div>
  );
}
