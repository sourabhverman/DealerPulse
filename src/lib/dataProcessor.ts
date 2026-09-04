import fs from "fs";
import path from "path";
import { differenceInDays, parseISO, format, startOfMonth } from "date-fns";
import type {
  DealershipData,
  Lead,
  KPISummary,
  BranchStat,
  RepStat,
  FunnelStage,
  MonthlyRevenue,
  AlertItem,
  AgingLead,
  LostReason,
  SourceStat,
} from "./types";

let _cache: DealershipData | null = null;

export function getRawData(): DealershipData {
  if (_cache) return _cache;
  const filePath = path.join(process.cwd(), "src/data/dealership_data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  _cache = JSON.parse(raw) as DealershipData;
  return _cache;
}

// --- helpers ---
const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  walk_in: "Walk-in",
  referral: "Referral",
  social_media: "Social Media",
  phone_enquiry: "Phone Enquiry",
  auto_expo: "Auto Expo",
};

function branchName(data: DealershipData, id: string) {
  return data.branches.find((b) => b.id === id)?.name ?? id;
}
function repName(data: DealershipData, id: string) {
  return data.sales_reps.find((r) => r.id === id)?.name ?? id;
}

export function filterLeads(
  leads: Lead[],
  filters: { branchId?: string; month?: string }
) {
  return leads.filter((l) => {
    if (filters.branchId && filters.branchId !== "all" && l.branch_id !== filters.branchId) return false;
    if (filters.month && filters.month !== "all") {
      const leadMonth = l.created_at.slice(0, 7);
      if (leadMonth !== filters.month) return false;
    }
    return true;
  });
}

export function getKPISummary(
  data: DealershipData,
  filters: { branchId?: string; month?: string }
): KPISummary {
  const leads = filterLeads(data.leads, filters);
  const delivered = leads.filter((l) => l.status === "delivered");
  const active = leads.filter(
    (l) =>
      l.status === "new" ||
      l.status === "contacted" ||
      l.status === "test_drive" ||
      l.status === "negotiation" ||
      l.status === "order_placed"
  );
  const totalLeads = leads.filter((l) => l.status !== "lost").length;
  const conversionRate = totalLeads > 0 ? (delivered.length / leads.length) * 100 : 0;
  const totalRevenue = delivered.reduce((s, l) => s + l.deal_value, 0);
  const avgDealSize = delivered.length > 0 ? totalRevenue / delivered.length : 0;
  const pipelineValue = active.reduce((s, l) => s + l.deal_value, 0);

  // cold leads = active with no activity in 7+ days (using Dec 2025 as "today" for dataset)
  const refDate = new Date("2025-12-31");
  const leadsAtRisk = active.filter((l) => {
    const days = differenceInDays(refDate, parseISO(l.last_activity_at));
    return days >= 7;
  }).length;

  return {
    totalRevenue,
    totalDelivered: delivered.length,
    activePipeline: active.length,
    conversionRate: Math.round(conversionRate * 10) / 10,
    avgDealSize: Math.round(avgDealSize),
    leadsAtRisk,
    pipelineValue,
  };
}

export function getBranchStats(
  data: DealershipData,
  filters: { month?: string }
): BranchStat[] {
  const refDate = new Date("2025-12-31");
  const currentMonth = "2025-12";

  return data.branches.map((branch) => {
    const leads = filterLeads(data.leads, { branchId: branch.id, ...filters });
    const delivered = leads.filter((l) => l.status === "delivered");
    const lost = leads.filter((l) => l.status === "lost");
    const active = leads.filter(
      (l) =>
        l.status === "new" ||
        l.status === "contacted" ||
        l.status === "test_drive" ||
        l.status === "negotiation" ||
        l.status === "order_placed"
    );
    const revenue = delivered.reduce((s, l) => s + l.deal_value, 0);
    const conversionRate = leads.length > 0 ? (delivered.length / leads.length) * 100 : 0;

    const monthToCheck = filters.month && filters.month !== "all" ? filters.month : currentMonth;
    const target = data.targets.find(
      (t) => t.branch_id === branch.id && t.month === monthToCheck
    );

    const monthDeliveries = data.leads.filter(
      (l) =>
        l.branch_id === branch.id &&
        l.status === "delivered" &&
        l.last_activity_at.startsWith(monthToCheck)
    );
    const actualUnits = monthDeliveries.length;
    const actualRevenue = monthDeliveries.reduce((s, l) => s + l.deal_value, 0);
    const targetUnits = target?.target_units ?? 0;
    const targetRevenue = target?.target_revenue ?? 0;
    const attainment = targetUnits > 0 ? (actualUnits / targetUnits) * 100 : 0;

    const status =
      attainment >= 90 ? "on_track" : attainment >= 60 ? "at_risk" : "behind";

    return {
      id: branch.id,
      name: branch.name,
      city: branch.city,
      totalLeads: leads.length,
      delivered: delivered.length,
      lost: lost.length,
      activePipeline: active.length,
      revenue,
      conversionRate: Math.round(conversionRate * 10) / 10,
      currentMonthTarget: { units: targetUnits, revenue: targetRevenue },
      currentMonthActual: { units: actualUnits, revenue: actualRevenue },
      targetAttainment: Math.round(attainment),
      status,
    };
  });
}

export function getRepStats(
  data: DealershipData,
  filters: { branchId?: string; month?: string }
): RepStat[] {
  return data.sales_reps.map((rep) => {
    const leads = filterLeads(data.leads, filters).filter(
      (l) => l.assigned_to === rep.id
    );
    const delivered = leads.filter((l) => l.status === "delivered");
    const lost = leads.filter((l) => l.status === "lost");
    const active = leads.filter(
      (l) =>
        l.status === "new" ||
        l.status === "contacted" ||
        l.status === "test_drive" ||
        l.status === "negotiation" ||
        l.status === "order_placed"
    );
    const revenue = delivered.reduce((s, l) => s + l.deal_value, 0);
    const conversionRate = leads.length > 0 ? (delivered.length / leads.length) * 100 : 0;
    const avgDealSize = delivered.length > 0 ? revenue / delivered.length : 0;

    return {
      id: rep.id,
      name: rep.name,
      branch_id: rep.branch_id,
      branchName: branchName(data, rep.branch_id),
      role: rep.role,
      totalLeads: leads.length,
      delivered: delivered.length,
      lost: lost.length,
      activePipeline: active.length,
      revenue,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgDealSize: Math.round(avgDealSize),
    };
  });
}

export function getFunnelData(
  data: DealershipData,
  filters: { branchId?: string; month?: string }
): FunnelStage[] {
  const leads = filterLeads(data.leads, filters);
  const stages = [
    "new",
    "contacted",
    "test_drive",
    "negotiation",
    "order_placed",
    "delivered",
  ] as const;
  const labels = [
    "New Leads",
    "Contacted",
    "Test Drive",
    "Negotiation",
    "Order Placed",
    "Delivered",
  ];

  const counts = stages.map((stage) => {
    return leads.filter((l) => {
      return l.status_history.some((h) => h.status === stage);
    }).length;
  });

  return stages.map((stage, i) => ({
    stage,
    label: labels[i],
    count: counts[i],
    dropoffRate:
      i === 0 || counts[i - 1] === 0
        ? 0
        : Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 100),
  }));
}

export function getMonthlyRevenue(
  data: DealershipData,
  filters: { branchId?: string }
): MonthlyRevenue[] {
  const months = ["2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"];
  const monthLabels = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return months.map((month, i) => {
    const delivered = filterLeads(data.leads, {
      branchId: filters.branchId,
      month,
    }).filter((l) => l.status === "delivered");

    const targets = data.targets.filter(
      (t) =>
        t.month === month &&
        (filters.branchId && filters.branchId !== "all"
          ? t.branch_id === filters.branchId
          : true)
    );

    return {
      month,
      label: monthLabels[i],
      revenue: delivered.reduce((s, l) => s + l.deal_value, 0),
      units: delivered.length,
      targetRevenue: targets.reduce((s, t) => s + t.target_revenue, 0),
      targetUnits: targets.reduce((s, t) => s + t.target_units, 0),
    };
  });
}

export function getAlerts(data: DealershipData): AlertItem[] {
  const alerts: AlertItem[] = [];
  const refDate = new Date("2025-12-31");
  const currentMonth = "2025-12";

  // cold leads per branch
  data.branches.forEach((branch) => {
    const cold = data.leads.filter((l) => {
      if (l.branch_id !== branch.id) return false;
      const isActive =
        l.status === "new" ||
        l.status === "contacted" ||
        l.status === "test_drive" ||
        l.status === "negotiation" ||
        l.status === "order_placed";
      if (!isActive) return false;
      const days = differenceInDays(refDate, parseISO(l.last_activity_at));
      return days >= 7;
    });
    if (cold.length > 0) {
      alerts.push({
        type: "cold_lead",
        severity: cold.length >= 5 ? "critical" : "warning",
        title: `${cold.length} cold lead${cold.length > 1 ? "s" : ""} at ${branch.name}`,
        description: `${cold.length} active lead${cold.length > 1 ? "s" : ""} with no activity in 7+ days — risk of losing them`,
        branch_id: branch.id,
        branchName: branch.name,
        count: cold.length,
      });
    }
  });

  // behind target
  data.branches.forEach((branch) => {
    const target = data.targets.find(
      (t) => t.branch_id === branch.id && t.month === currentMonth
    );
    if (!target) return;
    const actual = data.leads.filter(
      (l) =>
        l.branch_id === branch.id &&
        l.status === "delivered" &&
        l.last_activity_at.startsWith(currentMonth)
    ).length;
    const attainment = (actual / target.target_units) * 100;
    if (attainment < 60) {
      alerts.push({
        type: "behind_target",
        severity: attainment < 30 ? "critical" : "warning",
        title: `${branch.name} is ${Math.round(100 - attainment)}% behind target`,
        description: `${actual} of ${target.target_units} units delivered this month`,
        branch_id: branch.id,
        branchName: branch.name,
        value: attainment,
      });
    }
  });

  // high-value leads in negotiation
  const highValue = data.leads.filter(
    (l) =>
      (l.status === "negotiation" || l.status === "order_placed") &&
      l.deal_value >= 4000000
  );
  if (highValue.length > 0) {
    const totalValue = highValue.reduce((s, l) => s + l.deal_value, 0);
    alerts.push({
      type: "high_value_pipeline",
      severity: "info",
      title: `₹${(totalValue / 100000).toFixed(1)}L high-value deals need attention`,
      description: `${highValue.length} deal${highValue.length > 1 ? "s" : ""} above ₹40L in negotiation or order stage`,
      count: highValue.length,
      value: totalValue,
    });
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function getAgingLeads(
  data: DealershipData,
  filters: { branchId?: string; minDays?: number }
): AgingLead[] {
  const refDate = new Date("2025-12-31");
  const minDays = filters.minDays ?? 5;

  return data.leads
    .filter((l) => {
      const isActive =
        l.status === "new" ||
        l.status === "contacted" ||
        l.status === "test_drive" ||
        l.status === "negotiation" ||
        l.status === "order_placed";
      if (!isActive) return false;
      if (filters.branchId && filters.branchId !== "all" && l.branch_id !== filters.branchId)
        return false;
      const days = differenceInDays(refDate, parseISO(l.last_activity_at));
      return days >= minDays;
    })
    .map((l) => ({
      id: l.id,
      customer_name: l.customer_name,
      model_interested: l.model_interested,
      status: l.status,
      assigned_to: l.assigned_to,
      repName: repName(data, l.assigned_to),
      branch_id: l.branch_id,
      branchName: branchName(data, l.branch_id),
      daysSinceActivity: differenceInDays(refDate, parseISO(l.last_activity_at)),
      deal_value: l.deal_value,
      source: l.source,
    }))
    .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

export function getLostReasons(
  data: DealershipData,
  filters: { branchId?: string; month?: string }
): LostReason[] {
  const lost = filterLeads(data.leads, filters).filter(
    (l) => l.status === "lost" && l.lost_reason
  );
  const map: Record<string, number> = {};
  lost.forEach((l) => {
    const r = l.lost_reason!;
    map[r] = (map[r] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / lost.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getSourceStats(
  data: DealershipData,
  filters: { branchId?: string; month?: string }
): SourceStat[] {
  const leads = filterLeads(data.leads, filters);
  const sources = ["website", "walk_in", "referral", "social_media", "phone_enquiry", "auto_expo"];
  return sources.map((source) => {
    const s = leads.filter((l) => l.source === source);
    const delivered = s.filter((l) => l.status === "delivered");
    return {
      source,
      label: SOURCE_LABELS[source] ?? source,
      total: s.length,
      delivered: delivered.length,
      conversionRate: s.length > 0 ? Math.round((delivered.length / s.length) * 100) : 0,
    };
  });
}
