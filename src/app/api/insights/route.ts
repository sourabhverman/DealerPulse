import { NextRequest, NextResponse } from "next/server";
import {
  getRawData,
  getAlerts,
  getAgingLeads,
  getRepStats,
  filterLeads,
} from "@/lib/dataProcessor";
import { differenceInDays, parseISO } from "date-fns";

export async function GET(_req: NextRequest) {
  const data = getRawData();
  const refDate = new Date("2025-12-31");

  const alerts = getAlerts(data);
  const aging = getAgingLeads(data, { minDays: 7 });

  // forecasting: for each branch in Dec 2025
  const currentMonth = "2025-12";
  const daysInMonth = 31;
  const daysPassed = 31; // full month elapsed

  const forecasts = data.branches.map((branch) => {
    const target = data.targets.find(
      (t) => t.branch_id === branch.id && t.month === currentMonth
    );
    const delivered = data.leads.filter(
      (l) =>
        l.branch_id === branch.id &&
        l.status === "delivered" &&
        l.last_activity_at.startsWith(currentMonth)
    );
    const pipeline = data.leads.filter(
      (l) =>
        l.branch_id === branch.id &&
        (l.status === "order_placed" || l.status === "negotiation")
    );

    const actualUnits = delivered.length;
    const targetUnits = target?.target_units ?? 0;
    const projectedFromPipeline = Math.round(pipeline.length * 0.6);
    const projected = actualUnits + projectedFromPipeline;
    const gap = targetUnits - projected;

    return {
      branchId: branch.id,
      branchName: branch.name,
      targetUnits,
      actualUnits,
      pipelineUnits: pipeline.length,
      projectedUnits: projected,
      gap,
      onTrack: gap <= 0,
      attainment: targetUnits > 0 ? Math.round((actualUnits / targetUnits) * 100) : 100,
    };
  });

  // top performers overall
  const allReps = getRepStats(data, {});
  const topReps = allReps.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // best conversion source
  const sources = ["website", "walk_in", "referral", "social_media", "phone_enquiry", "auto_expo"];
  const sourceStat = sources.map((src) => {
    const s = data.leads.filter((l) => l.source === src);
    const d = s.filter((l) => l.status === "delivered");
    return { source: src, total: s.length, delivered: d.length, rate: s.length > 0 ? (d.length / s.length) * 100 : 0 };
  }).sort((a, b) => b.rate - a.rate);

  return NextResponse.json({
    alerts,
    aging: aging.slice(0, 20),
    forecasts,
    topReps,
    bestSource: sourceStat[0],
  });
}
