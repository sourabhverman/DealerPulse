import { NextResponse } from "next/server";
import { getRawData } from "@/lib/dataProcessor";
import { differenceInDays, parseISO } from "date-fns";

export async function GET() {
  const data = getRawData();
  const refDate = new Date("2025-12-31");
  const leads = data.leads;

  // ─── Funnel: how many leads ever reached each stage ───────────────────────
  const stageNames = ["new", "contacted", "test_drive", "negotiation", "order_placed", "delivered"] as const;
  const stageCounts: Record<string, number> = {};
  for (const s of stageNames) {
    stageCounts[s] = leads.filter((l) =>
      l.status_history.some((h) => h.status === s)
    ).length;
  }

  // Stage-to-stage conversion rates (actual)
  const rates = {
    newToContacted:       stageCounts.contacted    / stageCounts.new,
    contactedToTestDrive: stageCounts.test_drive   / stageCounts.contacted,
    testDriveToNeg:       stageCounts.negotiation  / stageCounts.test_drive,
    negToOrder:           stageCounts.order_placed / stageCounts.negotiation,
    orderToDelivered:     stageCounts.delivered    / stageCounts.order_placed,
  };

  // ─── Active pipeline ───────────────────────────────────────────────────────
  const activePipeline = leads.filter((l) =>
    ["new", "contacted", "test_drive", "negotiation", "order_placed"].includes(l.status)
  );
  const coldLeads = activePipeline.filter(
    (l) => differenceInDays(refDate, parseISO(l.last_activity_at)) >= 7
  );

  // ─── Delivered baseline ────────────────────────────────────────────────────
  const deliveredLeads = leads.filter((l) => l.status === "delivered");
  const avgDealSize = deliveredLeads.length
    ? deliveredLeads.reduce((s, l) => s + l.deal_value, 0) / deliveredLeads.length
    : 0;
  const totalRevenue = deliveredLeads.reduce((s, l) => s + l.deal_value, 0);

  // ─── Cold lead value by stage ─────────────────────────────────────────────
  // Probability of closing from current stage (compound rates forward)
  const closeProb: Record<string, number> = {
    new:          rates.newToContacted * rates.contactedToTestDrive * rates.testDriveToNeg * rates.negToOrder * rates.orderToDelivered,
    contacted:    rates.contactedToTestDrive * rates.testDriveToNeg * rates.negToOrder * rates.orderToDelivered,
    test_drive:   rates.testDriveToNeg * rates.negToOrder * rates.orderToDelivered,
    negotiation:  rates.negToOrder * rates.orderToDelivered,
    order_placed: rates.orderToDelivered,
  };

  const coldLeadPotential = coldLeads.reduce(
    (s, l) => s + l.deal_value * (closeProb[l.status] ?? 0),
    0
  );

  // per-branch pipeline
  const branchImpact = data.branches.map((b) => {
    const bDelivered = deliveredLeads.filter((l) => l.branch_id === b.id);
    const bRevenue = bDelivered.reduce((s, l) => s + l.deal_value, 0);
    const bCold = coldLeads.filter((l) => l.branch_id === b.id).length;
    const target = data.targets.find((t) => t.branch_id === b.id && t.month === "2025-12");
    return {
      id: b.id,
      name: b.name,
      delivered: bDelivered.length,
      revenue: bRevenue,
      coldLeads: bCold,
      targetUnits: target?.target_units ?? 0,
    };
  });

  return NextResponse.json({
    baseline: {
      totalRevenue,
      totalDelivered: deliveredLeads.length,
      avgDealSize: Math.round(avgDealSize),
      stageCounts,
      coldLeadsCount: coldLeads.length,
      coldLeadPotential: Math.round(coldLeadPotential),
    },
    rates: {
      newToContacted:        Math.round(rates.newToContacted * 1000) / 10,
      contactedToTestDrive:  Math.round(rates.contactedToTestDrive * 1000) / 10,
      testDriveToNeg:        Math.round(rates.testDriveToNeg * 1000) / 10,
      negToOrder:            Math.round(rates.negToOrder * 1000) / 10,
      orderToDelivered:      Math.round(rates.orderToDelivered * 1000) / 10,
    },
    branchImpact,
  });
}
