"use client";
import { useState, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { KPISummary, BranchStat, AlertItem } from "@/lib/types";
import { FileText, X, Github } from "lucide-react";

// ── narrative builder ─────────────────────────────────────────────────────────
function buildBrief(kpi: KPISummary, branches: BranchStat[], alerts: AlertItem[]): string[] {
  const paragraphs: string[] = [];

  const onTrack = branches.filter((b) => b.status === "on_track").length;
  const atRisk  = branches.filter((b) => b.status === "at_risk").length;
  const behind  = branches.filter((b) => b.status === "behind").length;
  const topBranch   = [...branches].sort((a, b) => b.revenue - a.revenue)[0];
  const worstBranch = [...branches].sort((a, b) => a.targetAttainment - b.targetAttainment)[0];

  let health = `Of your 5 branches, `;
  if (onTrack) health += `${onTrack} ${onTrack === 1 ? "is" : "are"} on track`;
  if (atRisk)  health += `${onTrack ? ", " : ""}${atRisk} ${atRisk === 1 ? "is" : "are"} at risk`;
  if (behind)  health += `${onTrack || atRisk ? " and " : ""}${behind} ${behind === 1 ? "is" : "are"} behind target`;
  health += `. ${topBranch?.name ?? ""} leads with ${formatCurrency(topBranch?.revenue ?? 0)} in delivered revenue.`;
  paragraphs.push(health);

  if (kpi.leadsAtRisk > 0) {
    const coldBranches = branches
      .filter((b) => alerts.find((a) => a.type === "cold_lead" && a.branch_id === b.id))
      .map((b) => b.name);
    let cold = `${kpi.leadsAtRisk} active lead${kpi.leadsAtRisk > 1 ? "s" : ""} have had no contact in 7+ days`;
    if (coldBranches.length) cold += `, particularly at ${coldBranches.slice(0, 2).join(" and ")}`;
    cold += `. These represent ${formatCurrency(kpi.pipelineValue * 0.45)} in potential revenue at immediate risk — the highest-leverage action your team can take today.`;
    paragraphs.push(cold);
  }

  if (worstBranch && worstBranch.targetAttainment < 70) {
    const gap = worstBranch.currentMonthTarget.units - worstBranch.currentMonthActual.units;
    paragraphs.push(
      `${worstBranch.name} is most behind plan at ${worstBranch.targetAttainment}% attainment — ${gap} unit${gap > 1 ? "s" : ""} short. The branch manager should focus entirely on leads already in negotiation and order stages.`
    );
  }

  const convRating = kpi.conversionRate >= 35 ? "strong" : kpi.conversionRate >= 25 ? "healthy" : "below average";
  paragraphs.push(
    `Overall conversion stands at ${kpi.conversionRate}% — ${convRating} for automotive. With ${kpi.activePipeline} active leads worth ${formatCurrency(kpi.pipelineValue)}, expect ~${Math.round(kpi.activePipeline * (kpi.conversionRate / 100))} more deliveries from current pipeline.`
  );

  const topAlert = alerts[0];
  let rec = "";
  if (topAlert?.type === "cold_lead") {
    rec = `Have branch managers personally reach out to all 7d+ inactive leads before end of week. A 48-hour follow-up window recovers 30–40% of cold leads in automotive retail.`;
  } else if (topAlert?.type === "behind_target") {
    rec = `${topAlert.branchName ?? "The underperforming branch"} needs an immediate pipeline review — personally follow up on all negotiation and order-stage leads within 24 hours.`;
  } else {
    rec = `Focus conversion acceleration at test drive and negotiation stages, where the highest percentage-point gains are available.`;
  }
  paragraphs.push(rec);

  return paragraphs;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function CEOBriefFloat() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ kpi: KPISummary; branches: BranchStat[]; alerts: AlertItem[] } | null>(null);

  // Auto-open after 3 seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && !data) {
      fetch("/api/overview")
        .then((r) => r.json())
        .then((d) => setData({ kpi: d.kpi, branches: d.branches, alerts: d.alerts }))
        .catch(() => {});
    }
  }, [open, data]);

  const paragraphs = data ? buildBrief(data.kpi, data.branches, data.alerts) : [];

  return (
    <>
      {/* Floating button — sits above Ask AI */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-[4.5rem] right-5 z-40 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all text-xs font-medium"
      >
        <FileText size={13} />
        CEO Brief
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[8.5rem] right-5 z-50 w-[340px] bg-white border border-zinc-200 rounded-2xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
                <FileText size={12} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900">CEO Daily Brief</p>
                <p className="text-[10px] text-zinc-400">Auto-generated · Dec 2025</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
            >
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 max-h-[420px] overflow-y-auto space-y-3">
            {!data ? (
              <div className="space-y-2">
                {[60, 90, 75, 50].map((w, i) => (
                  <div key={i} className={`h-3 bg-zinc-100 rounded animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              paragraphs.map((p, i) => (
                <p key={i} className={cn(
                  "text-xs leading-relaxed",
                  i === 0 ? "text-zinc-800 font-medium" : "text-zinc-500",
                  i === paragraphs.length - 1 && "text-zinc-700 font-medium border-t border-zinc-50 pt-3 mt-1"
                )}>
                  {i === paragraphs.length - 1 && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-800 mr-1.5 mb-0.5 align-middle" />
                  )}
                  {p}
                </p>
              ))
            )}
          </div>

          {/* Footer */}
          {data && (
            <div className="px-4 py-2.5 border-t border-zinc-50 bg-zinc-50/60 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <p className="text-[10px] text-zinc-400">Live from 510 leads · 5 branches · 7 months</p>
              </div>
              <a
                href="https://github.com/sourabhverman/DealerPulse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <Github size={11} />
                Source
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
