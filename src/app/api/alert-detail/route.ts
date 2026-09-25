import { NextRequest, NextResponse } from "next/server";
import { getRawData, getAgingLeads } from "@/lib/dataProcessor";
import { differenceInDays, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const branchId = searchParams.get("branchId") ?? "all";

  const data = getRawData();
  const refDate = new Date("2025-12-31");
  const currentMonth = "2025-12";

  // ── cold_lead: list of cold leads for a specific branch ───────────────────
  if (type === "cold_lead") {
    const aging = getAgingLeads(data, { branchId, minDays: 7 });
    const leads = aging.map((l) => ({
      id: l.id,
      customer_name: l.customer_name,
      model_interested: l.model_interested,
      status: l.status,
      repName: l.repName,
      daysSinceActivity: l.daysSinceActivity,
      deal_value: l.deal_value,
    }));
    return NextResponse.json({
      type: "cold_lead",
      leads,
      explanation:
        `In automotive retail, leads with 7+ days of inactivity have a 60% higher chance of choosing a competitor. ` +
        `Each cold lead represents a deal that was warm enough to enter your pipeline — they need a personal call or message today, not tomorrow.`,
      recommendation:
        `Branch manager should personally assign and confirm follow-up for every lead in this list before end of day. ` +
        `A simple re-engagement message ("We have an offer ready for you") recovers 30–40% of cold leads.`,
    });
  }

  // ── behind_target: branch target breakdown for December ───────────────────
  if (type === "behind_target") {
    const branch = data.branches.find((b) => b.id === branchId);
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    const target = data.targets.find((t) => t.branch_id === branchId && t.month === currentMonth);
    const delivered = data.leads.filter(
      (l) => l.branch_id === branchId && l.status === "delivered" && l.last_activity_at.startsWith(currentMonth)
    );
    const pipeline = data.leads.filter(
      (l) =>
        l.branch_id === branchId &&
        (l.status === "order_placed" || l.status === "negotiation" || l.status === "test_drive")
    );
    const pipelineValue = pipeline.reduce((s, l) => s + (l.deal_value ?? 0), 0);
    const targetUnits = target?.target_units ?? 0;
    const actualUnits = delivered.length;
    const gap = targetUnits - actualUnits;
    const attainment = targetUnits > 0 ? Math.round((actualUnits / targetUnits) * 100) : 0;
    const projectedFromPipeline = Math.round(pipeline.length * 0.6);
    const projectedTotal = actualUnits + projectedFromPipeline;
    const projectedGap = targetUnits - projectedTotal;

    // Top pipeline leads (closest to closing)
    const stageOrder = ["order_placed", "negotiation", "test_drive"];
    const topPipeline = [...pipeline]
      .sort((a, b) => stageOrder.indexOf(a.status) - stageOrder.indexOf(b.status))
      .slice(0, 5)
      .map((l) => {
        const rep = data.sales_reps.find((r) => r.id === l.assigned_to);
        return {
          customer_name: l.customer_name,
          model_interested: l.model_interested,
          status: l.status,
          repName: rep?.name ?? "Unknown",
          deal_value: l.deal_value,
          daysSinceActivity: differenceInDays(refDate, parseISO(l.last_activity_at)),
        };
      });

    return NextResponse.json({
      type: "behind_target",
      branch: { id: branch.id, name: branch.name, city: branch.city },
      targetUnits,
      actualUnits,
      gap,
      attainment,
      pipelineCount: pipeline.length,
      pipelineValue,
      projectedTotal,
      projectedGap,
      topPipeline,
      explanation:
        `${branch.name} has delivered ${actualUnits} of ${targetUnits} units this December — ` +
        `${100 - attainment}% behind target. With ${pipeline.length} active leads in the pipeline, ` +
        `a 60% conversion rate projects ${projectedTotal} total deliveries, ` +
        `still ${projectedGap > 0 ? projectedGap + " units short" : "meeting target"}.`,
      recommendation:
        `Focus the branch manager on the ${pipeline.filter((l) => l.status === "order_placed").length} leads already at order stage — ` +
        `these are closest to closing and need administrative follow-up to push to delivery. ` +
        `Then convert the ${pipeline.filter((l) => l.status === "negotiation").length} negotiation-stage leads with pricing authority or financing options.`,
    });
  }

  // ── high_value_pipeline: deals above ₹40L in negotiation / order ─────────
  if (type === "high_value_pipeline") {
    const highValue = data.leads.filter(
      (l) =>
        (l.status === "negotiation" || l.status === "order_placed") &&
        l.deal_value >= 4000000
    );
    const leads = highValue
      .sort((a, b) => b.deal_value - a.deal_value)
      .map((l) => {
        const rep = data.sales_reps.find((r) => r.id === l.assigned_to);
        const branch = data.branches.find((b) => b.id === l.branch_id);
        return {
          id: l.id,
          customer_name: l.customer_name,
          model_interested: l.model_interested,
          status: l.status,
          repName: rep?.name ?? "Unknown",
          branchName: branch?.name ?? "Unknown",
          deal_value: l.deal_value,
          daysSinceActivity: differenceInDays(refDate, parseISO(l.last_activity_at)),
        };
      });
    const totalValue = highValue.reduce((s, l) => s + l.deal_value, 0);

    return NextResponse.json({
      type: "high_value_pipeline",
      leads,
      totalValue,
      explanation:
        `These ${leads.length} deals are each worth ₹40L or more and are currently in negotiation or order stage. ` +
        `Combined value of ₹${(totalValue / 100000).toFixed(1)}L — losing even one of these deals has significant revenue impact. ` +
        `High-value customers need senior-level attention and fast resolution of any blockers.`,
      recommendation:
        `CEO or senior manager should personally review each deal. Key actions: confirm financing is in place, ` +
        `resolve any pending paperwork, and set a firm delivery date commitment to the customer.`,
    });
  }

  return NextResponse.json({ error: "Unknown alert type" }, { status: 400 });
}
