import {
  getRawData,
  getKPISummary,
  getBranchStats,
  getRepStats,
  getFunnelData,
  getLostReasons,
  getSourceStats,
  getAgingLeads,
  getMonthlyRevenue,
} from "./dataProcessor";
import { formatCurrency } from "./utils";

/**
 * Builds a rich, token-efficient business context string
 * that gets injected as the AI system prompt.
 * All numbers come from real computed data — no hallucinations.
 */
export function buildAIContext(): string {
  const data = getRawData();

  const kpi = getKPISummary(data, {});
  const branches = getBranchStats(data, {});
  const reps = getRepStats(data, {}).sort((a, b) => b.revenue - a.revenue);
  const funnel = getFunnelData(data, {});
  const lostReasons = getLostReasons(data, {});
  const sources = getSourceStats(data, {});
  const aging = getAgingLeads(data, { minDays: 7 });
  const monthly = getMonthlyRevenue(data, {});

  const lines: string[] = [];

  lines.push("# DealerPulse — Toyota Dealership Group Business Intelligence");
  lines.push("Dataset: June–December 2025. 5 branches, 30 sales reps, 510 leads.");
  lines.push("");

  // ── KPIs ──────────────────────────────────────────────────────────────────
  lines.push("## Overall KPIs (all branches, full 7 months)");
  lines.push(`- Total Revenue (delivered): ${formatCurrency(kpi.totalRevenue)}`);
  lines.push(`- Units Delivered: ${kpi.totalDelivered}`);
  lines.push(`- Active Pipeline: ${kpi.activePipeline} leads worth ${formatCurrency(kpi.pipelineValue)}`);
  lines.push(`- Overall Conversion Rate: ${kpi.conversionRate}% (new lead → delivered)`);
  lines.push(`- Average Deal Size: ${formatCurrency(kpi.avgDealSize)}`);
  lines.push(`- Leads at Risk (7+ days no activity): ${kpi.leadsAtRisk}`);
  lines.push("");

  // ── Branches ──────────────────────────────────────────────────────────────
  lines.push("## Branch Performance");
  for (const b of branches) {
    lines.push(
      `- ${b.name} (${b.city}): ${b.delivered} delivered, ${formatCurrency(b.revenue)} revenue, ` +
      `${b.conversionRate}% conversion, December target ${b.targetAttainment}% attained (${b.currentMonthActual.units}/${b.currentMonthTarget.units} units) — status: ${b.status.replace("_", " ")}`
    );
  }
  lines.push("");

  // ── Top 10 Reps ───────────────────────────────────────────────────────────
  lines.push("## Top 10 Sales Reps by Revenue");
  for (const r of reps.slice(0, 10)) {
    lines.push(
      `- ${r.name} (${r.branchName}, ${r.role === "branch_manager" ? "Manager" : "Officer"}): ` +
      `${r.delivered} delivered, ${formatCurrency(r.revenue)}, ${r.conversionRate}% conversion`
    );
  }
  lines.push("");

  // ── Funnel ────────────────────────────────────────────────────────────────
  lines.push("## Conversion Funnel (leads that ever reached each stage)");
  for (let i = 0; i < funnel.length; i++) {
    const f = funnel[i];
    const pct = funnel[0] ? Math.round((f.count / funnel[0].count) * 100) : 0;
    lines.push(
      `- ${f.label}: ${f.count} leads (${pct}% of total)` +
      (i > 0 && f.dropoffRate > 0 ? ` — ${f.dropoffRate}% dropped from previous stage` : "")
    );
  }
  lines.push("");

  // ── Monthly Revenue ────────────────────────────────────────────────────────
  lines.push("## Monthly Revenue & Units (all branches combined)");
  for (const m of monthly) {
    const vsTarget = m.targetRevenue > 0
      ? Math.round((m.revenue / m.targetRevenue) * 100)
      : 0;
    lines.push(
      `- ${m.label} 2025: ${m.units} units, ${formatCurrency(m.revenue)} revenue ` +
      `(target: ${m.targetUnits} units / ${formatCurrency(m.targetRevenue)}, ${vsTarget}% of target)`
    );
  }
  lines.push("");

  // ── Lost Reasons ──────────────────────────────────────────────────────────
  lines.push("## Why Leads Are Lost (top reasons)");
  for (const r of lostReasons.slice(0, 6)) {
    lines.push(`- "${r.reason}": ${r.count} leads (${r.percentage}%)`);
  }
  lines.push("");

  // ── Source Performance ────────────────────────────────────────────────────
  lines.push("## Lead Source Performance");
  for (const s of sources.sort((a, b) => b.total - a.total)) {
    lines.push(
      `- ${s.label}: ${s.total} leads, ${s.delivered} delivered, ${s.conversionRate}% conversion`
    );
  }
  lines.push("");

  // ── Cold Leads ────────────────────────────────────────────────────────────
  lines.push(`## Cold Leads (active leads with no activity in 7+ days): ${aging.length} total`);
  for (const l of aging.slice(0, 8)) {
    lines.push(
      `- ${l.customer_name} @ ${l.branchName} (${l.repName}): ${l.model_interested}, ` +
      `${l.status}, ${l.daysSinceActivity} days inactive, deal value ${formatCurrency(l.deal_value)}`
    );
  }
  if (aging.length > 8) lines.push(`  ...and ${aging.length - 8} more`);
  lines.push("");

  lines.push("---");
  lines.push("Answer all questions using only the data above. Be concise, specific, and actionable.");
  lines.push("Format numbers as Indian currency (₹, L for lakhs, Cr for crores). Use bullet points for lists.");
  lines.push("If asked something not in the data, say so clearly.");

  return lines.join("\n");
}
