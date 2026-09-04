import { NextRequest, NextResponse } from "next/server";
import { getRawData, getBranchStats, filterLeads, getFunnelData, getRepStats } from "@/lib/dataProcessor";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const branchId = searchParams.get("branchId") ?? undefined;
  const month = searchParams.get("month") ?? "all";

  const data = getRawData();

  if (branchId && branchId !== "all") {
    const branch = data.branches.find((b) => b.id === branchId);
    if (!branch) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const filters = { branchId, month };
    const leads = filterLeads(data.leads, filters);
    const reps = getRepStats(data, filters).filter((r) => r.branch_id === branchId);

    const modelBreakdown = Object.entries(
      leads.reduce<Record<string, { total: number; delivered: number }>>((acc, l) => {
        if (!acc[l.model_interested]) acc[l.model_interested] = { total: 0, delivered: 0 };
        acc[l.model_interested].total++;
        if (l.status === "delivered") acc[l.model_interested].delivered++;
        return acc;
      }, {})
    )
      .map(([model, d]) => ({
        model,
        total: d.total,
        delivered: d.delivered,
        conversionRate: Math.round((d.delivered / d.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      branch,
      funnel: getFunnelData(data, filters),
      reps,
      modelBreakdown,
    });
  }

  return NextResponse.json({
    branches: getBranchStats(data, { month }),
  });
}
