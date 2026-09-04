"use client";
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Sliders, TrendingUp, AlertTriangle, Users, DollarSign, RefreshCw } from "lucide-react";

interface SimData {
  baseline: {
    totalRevenue: number;
    totalDelivered: number;
    avgDealSize: number;
    stageCounts: Record<string, number>;
    coldLeadsCount: number;
    coldLeadPotential: number;
  };
  rates: {
    newToContacted: number;
    contactedToTestDrive: number;
    testDriveToNeg: number;
    negToOrder: number;
    orderToDelivered: number;
  };
  branchImpact: {
    id: string;
    name: string;
    delivered: number;
    revenue: number;
    coldLeads: number;
    targetUnits: number;
  }[];
}

interface SimInputs {
  coldLeadRecovery: number;      // % of cold leads we rescue (0–100)
  testDriveBoost: number;        // percentage point lift on test_drive→negotiation (0–20)
  negotiationBoost: number;      // pp lift on negotiation→order (0–20)
  dealValueUplift: number;       // % increase in avg deal value (0–20)
}

const DEFAULT_INPUTS: SimInputs = {
  coldLeadRecovery: 0,
  testDriveBoost: 0,
  negotiationBoost: 0,
  dealValueUplift: 0,
};

function compute(data: SimData, inputs: SimInputs) {
  const {
    stageCounts,
    totalDelivered,
    avgDealSize,
    totalRevenue,
    coldLeadsCount,
  } = data.baseline;
  const { testDriveToNeg, negToOrder, orderToDelivered, contactedToTestDrive } = data.rates;

  // Lever 1: cold lead rescue
  // Each recovered cold lead has avg ~40% chance of closing (mid-funnel average)
  const coldLeadCloseProb = 0.40;
  const lever1Units = coldLeadsCount * (inputs.coldLeadRecovery / 100) * coldLeadCloseProb;
  const lever1Rev = lever1Units * avgDealSize;

  // Lever 2: test_drive → negotiation boost
  // Applied to the historical 300 leads that reached test_drive
  const tdLeads = stageCounts["test_drive"] ?? 300;
  const newTestDriveRate = Math.min((testDriveToNeg + inputs.testDriveBoost) / 100, 1);
  const currentTestDriveRate = testDriveToNeg / 100;
  const additionalFromTD = tdLeads * (newTestDriveRate - currentTestDriveRate);
  const lever2Units = additionalFromTD * (negToOrder / 100) * (orderToDelivered / 100);
  const lever2Rev = lever2Units * avgDealSize;

  // Lever 3: negotiation → order boost
  // Applied to historical 235 leads that reached negotiation
  const negLeads = stageCounts["negotiation"] ?? 235;
  const newNegRate = Math.min((negToOrder + inputs.negotiationBoost) / 100, 1);
  const currentNegRate = negToOrder / 100;
  const additionalFromNeg = negLeads * (newNegRate - currentNegRate);
  const lever3Units = additionalFromNeg * (orderToDelivered / 100);
  const lever3Rev = lever3Units * avgDealSize;

  // Lever 4: deal value uplift (upsell / accessories / insurance)
  // Applied to all delivered + new deliveries from levers 1–3
  const totalNewUnits = lever1Units + lever2Units + lever3Units;
  const totalUnitsForUplift = totalDelivered + totalNewUnits;
  const newAvgDeal = avgDealSize * (1 + inputs.dealValueUplift / 100);
  const lever4Rev =
    totalUnitsForUplift * newAvgDeal -
    totalDelivered * avgDealSize -
    totalNewUnits * avgDealSize;

  const additionalUnits = lever1Units + lever2Units + lever3Units;
  const additionalRevenue = lever1Rev + lever2Rev + lever3Rev + lever4Rev;

  return {
    additionalUnits: Math.round(additionalUnits * 10) / 10,
    additionalRevenue: Math.round(additionalRevenue),
    projectedRevenue: Math.round(totalRevenue + additionalRevenue),
    projectedUnits: Math.round(totalDelivered + additionalUnits),
    upliftPct: Math.round((additionalRevenue / totalRevenue) * 1000) / 10,
    levers: [
      { label: "Cold Lead Recovery",    units: lever1Units, revenue: lever1Rev },
      { label: "Test Drive Conversion", units: lever2Units, revenue: lever2Rev },
      { label: "Negotiation Win Rate",  units: lever3Units, revenue: lever3Rev },
      { label: "Deal Value Uplift",     units: 0,           revenue: lever4Rev },
    ],
  };
}

function SliderCard({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  currentRate,
  color,
  icon: Icon,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  currentRate?: string;
  color: string;
  icon: React.ElementType;
  onChange: (v: number) => void;
}) {
  return (
    <div className={cn("bg-white border rounded-xl p-5 space-y-4", value > 0 ? "border-zinc-900" : "border-zinc-200")}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
            <Icon size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{label}</p>
            {currentRate && (
              <p className="text-[11px] text-zinc-400 mt-0.5">Current: {currentRate}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-zinc-900">
            {value > 0 ? `+${value}` : value}
            <span className="text-sm font-normal text-zinc-400 ml-0.5">{unit}</span>
          </p>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-900 cursor-pointer h-1.5"
      />

      <div className="flex justify-between text-[10px] text-zinc-400">
        <span>{min}{unit}</span>
        <span className="text-zinc-500 text-[11px] leading-snug max-w-[70%] text-center">
          {description}
        </span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ImpactBar({ levers, totalAdditional }: {
  levers: { label: string; revenue: number }[];
  totalAdditional: number;
}) {
  if (totalAdditional <= 0) return null;
  return (
    <div className="space-y-2">
      {levers.filter((l) => l.revenue > 0).map((lever) => (
        <div key={lever.label} className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 w-36 text-right flex-shrink-0">
            {lever.label}
          </span>
          <div className="flex-1 h-5 bg-zinc-100 rounded overflow-hidden">
            <div
              className="h-full bg-zinc-800 rounded flex items-center px-2 transition-all duration-300"
              style={{ width: `${Math.max((lever.revenue / totalAdditional) * 100, 2)}%` }}
            >
              <span className="text-[10px] text-white font-medium whitespace-nowrap">
                {formatCurrency(lever.revenue)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const BAR_COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa"];

export default function SimulatorPage() {
  const [simData, setSimData] = useState<SimData | null>(null);
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulator")
      .then((r) => r.json())
      .then((d) => { setSimData(d); setLoading(false); });
  }, []);

  const result = simData ? compute(simData, inputs) : null;
  const isActive = Object.values(inputs).some((v) => v > 0);

  const reset = () => setInputs(DEFAULT_INPUTS);

  const chartData = simData
    ? [
        {
          name: "Current",
          revenue: simData.baseline.totalRevenue,
          units: simData.baseline.totalDelivered,
        },
        ...(result && isActive
          ? [
              {
                name: "Projected",
                revenue: result.projectedRevenue,
                units: result.projectedUnits,
              },
            ]
          : []),
      ]
    : [];

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Revenue Simulator" subtitle="Model business impact before committing" />
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Revenue Simulator"
        subtitle="Adjust levers to model the business impact of operational improvements"
      />

      <div className="p-6 max-w-7xl">
        {/* Intro banner */}
        <div className="mb-6 bg-zinc-900 text-white rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">What-If Analysis</p>
            <p className="text-xs text-zinc-400 mt-1">
              Based on {simData?.baseline.stageCounts.new} real leads across 7 months. Move the sliders to see projected revenue impact — no assumptions, just your own funnel math.
            </p>
          </div>
          {isActive && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
            >
              <RefreshCw size={12} /> Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* LEFT: Sliders (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2">
              Adjust the levers
            </p>

            <SliderCard
              label="Cold Lead Recovery"
              description="% of 7d+ inactive leads followed up and re-engaged"
              value={inputs.coldLeadRecovery}
              min={0} max={100} step={5} unit="%"
              currentRate={`${simData?.baseline.coldLeadsCount} cold leads`}
              color="bg-amber-500"
              icon={AlertTriangle}
              onChange={(v) => setInputs((p) => ({ ...p, coldLeadRecovery: v }))}
            />

            <SliderCard
              label="Test Drive → Negotiation"
              description="Percentage point lift via better demo scripts or follow-up"
              value={inputs.testDriveBoost}
              min={0} max={20} step={1} unit=" pp"
              currentRate={`${simData?.rates.testDriveToNeg}%`}
              color="bg-blue-500"
              icon={TrendingUp}
              onChange={(v) => setInputs((p) => ({ ...p, testDriveBoost: v }))}
            />

            <SliderCard
              label="Negotiation Win Rate"
              description="Percentage point lift via pricing authority or financing options"
              value={inputs.negotiationBoost}
              min={0} max={15} step={1} unit=" pp"
              currentRate={`${simData?.rates.negToOrder}%`}
              color="bg-violet-500"
              icon={Users}
              onChange={(v) => setInputs((p) => ({ ...p, negotiationBoost: v }))}
            />

            <SliderCard
              label="Avg Deal Value (Upsell)"
              description="% increase via accessories, extended warranty, insurance"
              value={inputs.dealValueUplift}
              min={0} max={20} step={1} unit="%"
              currentRate={formatCurrency(simData?.baseline.avgDealSize ?? 0)}
              color="bg-emerald-500"
              icon={DollarSign}
              onChange={(v) => setInputs((p) => ({ ...p, dealValueUplift: v }))}
            />
          </div>

          {/* RIGHT: Impact summary (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2">
              Projected impact
            </p>

            {/* Impact card */}
            <div
              className={cn(
                "rounded-xl border p-5 transition-all",
                isActive
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-white border-zinc-200"
              )}
            >
              <p className={cn("text-xs font-medium uppercase tracking-wider mb-3", isActive ? "text-zinc-400" : "text-zinc-400")}>
                Additional Revenue
              </p>
              <p className={cn("text-4xl font-bold tracking-tight", isActive ? "text-white" : "text-zinc-300")}>
                {result && isActive ? formatCurrency(result.additionalRevenue) : "₹0"}
              </p>
              {result && isActive && (
                <p className="text-sm text-emerald-400 mt-1 font-medium">
                  +{result.upliftPct}% on current ₹38.88Cr
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-zinc-700/30 grid grid-cols-2 gap-3">
                <div>
                  <p className={cn("text-[10px] uppercase tracking-wide", isActive ? "text-zinc-500" : "text-zinc-400")}>
                    Additional units
                  </p>
                  <p className={cn("text-xl font-bold mt-0.5", isActive ? "text-white" : "text-zinc-300")}>
                    {result && isActive ? `+${result.additionalUnits}` : "0"}
                  </p>
                </div>
                <div>
                  <p className={cn("text-[10px] uppercase tracking-wide", isActive ? "text-zinc-500" : "text-zinc-400")}>
                    Projected total
                  </p>
                  <p className={cn("text-xl font-bold mt-0.5", isActive ? "text-white" : "text-zinc-300")}>
                    {result && isActive ? formatCurrency(result.projectedRevenue) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Lever contribution breakdown */}
            {result && isActive && result.additionalRevenue > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Impact by lever
                </p>
                <ImpactBar
                  levers={result.levers}
                  totalAdditional={result.additionalRevenue}
                />
              </div>
            )}

            {/* Before / After chart */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Current vs Projected
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f4f4f5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                    contentStyle={{
                      border: "1px solid #e4e4e7",
                      borderRadius: 8,
                      fontSize: 11,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={i === 0 ? "#e4e4e7" : "#18181b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Empty state nudge */}
            {!isActive && (
              <div className="text-center py-4">
                <Sliders size={20} className="text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">Move any slider to see the projected impact</p>
              </div>
            )}
          </div>
        </div>

        {/* Branch impact table (only shown when levers are active) */}
        {isActive && result && simData && (
          <div className="mt-5 bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <p className="text-sm font-semibold text-zinc-900">Branch-Level Impact</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cold lead recovery distributed proportionally across branches
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/50">
                    {["Branch", "Current Revenue", "Cold Leads", "Recovery Impact", "Projected Rev"].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {simData.branchImpact.map((b) => {
                    const share = simData.baseline.coldLeadsCount > 0
                      ? b.coldLeads / simData.baseline.coldLeadsCount
                      : 0;
                    const branchColdImpact = result.levers[0].revenue * share;
                    const branchUplift = b.revenue > 0
                      ? (result.additionalRevenue / simData.baseline.totalRevenue) * b.revenue
                      : 0;
                    return (
                      <tr key={b.id} className="hover:bg-zinc-50/60">
                        <td className="px-5 py-3 font-medium text-zinc-800">{b.name}</td>
                        <td className="px-5 py-3 text-zinc-600">{formatCurrency(b.revenue)}</td>
                        <td className="px-5 py-3">
                          <span className={cn("font-medium", b.coldLeads > 0 ? "text-amber-600" : "text-zinc-400")}>
                            {b.coldLeads}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-emerald-600">
                          {branchColdImpact > 0 ? `+${formatCurrency(branchColdImpact)}` : "—"}
                        </td>
                        <td className="px-5 py-3 font-semibold text-zinc-800">
                          {formatCurrency(b.revenue + branchUplift)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
