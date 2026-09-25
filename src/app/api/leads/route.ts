import { NextRequest, NextResponse } from "next/server";
import {
  getRawData,
  getFunnelData,
  getAgingLeads,
  getLostReasons,
  getSourceStats,
  filterLeads,
} from "@/lib/dataProcessor";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const branchId = searchParams.get("branchId") ?? "all";
  const month = searchParams.get("month") ?? "all";
  const minDays = parseInt(searchParams.get("minDays") ?? "7");

  const data = getRawData();
  const filters = { branchId, month };

  const leads = filterLeads(data.leads, filters);
  const statusBreakdown = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return NextResponse.json({
    funnel: getFunnelData(data, filters),
    aging: getAgingLeads(data, { branchId, minDays }),
    lostReasons: getLostReasons(data, filters),
    sources: getSourceStats(data, filters),
    statusBreakdown,
    total: leads.length,
  });
}
