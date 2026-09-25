export type LeadStatus =
  | "new"
  | "contacted"
  | "test_drive"
  | "negotiation"
  | "order_placed"
  | "delivered"
  | "lost";

export type LeadSource =
  | "website"
  | "walk_in"
  | "referral"
  | "social_media"
  | "phone_enquiry"
  | "auto_expo";

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface SalesRep {
  id: string;
  name: string;
  branch_id: string;
  role: "branch_manager" | "sales_officer";
  joined: string;
}

export interface StatusHistory {
  status: LeadStatus;
  timestamp: string;
  note: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  source: LeadSource;
  model_interested: string;
  status: LeadStatus;
  assigned_to: string;
  branch_id: string;
  created_at: string;
  last_activity_at: string;
  status_history: StatusHistory[];
  expected_close_date: string;
  deal_value: number;
  lost_reason: string | null;
}

export interface Target {
  branch_id: string;
  month: string;
  target_units: number;
  target_revenue: number;
}

export interface Delivery {
  lead_id: string;
  order_date: string;
  delivery_date: string;
  days_to_deliver: number;
  delay_reason: string | null;
}

export interface DealershipData {
  metadata: { generated_at: string; description: string; date_range: string };
  branches: Branch[];
  sales_reps: SalesRep[];
  leads: Lead[];
  targets: Target[];
  deliveries: Delivery[];
}

// --- API response types ---

export interface KPISummary {
  totalRevenue: number;
  totalDelivered: number;
  activePipeline: number;
  conversionRate: number;
  avgDealSize: number;
  leadsAtRisk: number;
  pipelineValue: number;
}

export interface BranchStat {
  id: string;
  name: string;
  city: string;
  totalLeads: number;
  delivered: number;
  lost: number;
  activePipeline: number;
  revenue: number;
  conversionRate: number;
  currentMonthTarget: { units: number; revenue: number };
  currentMonthActual: { units: number; revenue: number };
  targetAttainment: number;
  status: "on_track" | "at_risk" | "behind";
}

export interface RepStat {
  id: string;
  name: string;
  branch_id: string;
  branchName: string;
  role: string;
  totalLeads: number;
  delivered: number;
  lost: number;
  activePipeline: number;
  revenue: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  dropoffRate: number;
}

export interface MonthlyRevenue {
  month: string;
  label: string;
  revenue: number;
  units: number;
  targetRevenue: number;
  targetUnits: number;
}

export interface AlertItem {
  type: "cold_lead" | "behind_target" | "high_value_pipeline" | "delay_risk";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  branch_id?: string;
  branchName?: string;
  lead_id?: string;
  count?: number;
  value?: number;
}

export interface AgingLead {
  id: string;
  customer_name: string;
  model_interested: string;
  status: LeadStatus;
  assigned_to: string;
  repName: string;
  branch_id: string;
  branchName: string;
  daysSinceActivity: number;
  deal_value: number;
  source: LeadSource;
}

export interface LostReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface SourceStat {
  source: string;
  label: string;
  total: number;
  delivered: number;
  conversionRate: number;
}
