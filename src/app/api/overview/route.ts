import { NextRequest, NextResponse } from "next/server";
import { getRawData, getKPISummary, getBranchStats, getMonthlyRevenue, getAlerts } from "@/lib/dataProcessor";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const branchId = searchParams.get("branchId") ?? "all";
  const month = searchParams.get("month") ?? "all";

  const data = getRawData();
  const filters = { branchId, month };

  return NextResponse.json({
    kpi: getKPISummary(data, filters),
    branches: getBranchStats(data, { month }),
    monthlyRevenue: getMonthlyRevenue(data, { branchId }),
    alerts: getAlerts(data),
    meta: {
      branches: data.branches,
      months: ["2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12"],
    },
  });
}
