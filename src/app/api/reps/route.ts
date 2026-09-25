import { NextRequest, NextResponse } from "next/server";
import { getRawData, getRepStats, filterLeads } from "@/lib/dataProcessor";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const branchId = searchParams.get("branchId") ?? "all";
  const month = searchParams.get("month") ?? "all";
  const repId = searchParams.get("repId") ?? undefined;

  const data = getRawData();
  const filters = { branchId, month };

  if (repId) {
    const rep = data.sales_reps.find((r) => r.id === repId);
    if (!rep) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const leads = filterLeads(data.leads, filters).filter(
      (l) => l.assigned_to === repId
    );

    const recentLeads = leads
      .sort(
        (a, b) =>
          new Date(b.last_activity_at).getTime() -
          new Date(a.last_activity_at).getTime()
      )
      .slice(0, 15)
      .map((l) => ({
        id: l.id,
        customer_name: l.customer_name,
        model_interested: l.model_interested,
        status: l.status,
        deal_value: l.deal_value,
        created_at: l.created_at,
        last_activity_at: l.last_activity_at,
        source: l.source,
      }));

    const branch = data.branches.find((b) => b.id === rep.branch_id);
    return NextResponse.json({ rep, branch, recentLeads });
  }

  const reps = getRepStats(data, filters).sort((a, b) => b.revenue - a.revenue);
  return NextResponse.json({ reps });
}
