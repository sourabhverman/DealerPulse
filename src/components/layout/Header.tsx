"use client";
import { useFilters } from "@/context/FilterContext";
import { monthLabel } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const BRANCHES = [
  { id: "all", name: "All Branches" },
  { id: "B1", name: "Downtown Toyota" },
  { id: "B2", name: "Highway Toyota" },
  { id: "B3", name: "Lakeside Toyota" },
  { id: "B4", name: "Central Toyota" },
  { id: "B5", name: "Eastside Toyota" },
];

const MONTHS = [
  { id: "all", label: "All Months" },
  { id: "2025-06", label: "Jun 2025" },
  { id: "2025-07", label: "Jul 2025" },
  { id: "2025-08", label: "Aug 2025" },
  { id: "2025-09", label: "Sep 2025" },
  { id: "2025-10", label: "Oct 2025" },
  { id: "2025-11", label: "Nov 2025" },
  { id: "2025-12", label: "Dec 2025" },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { branchId, month, setBranchId, setMonth } = useFilters();

  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {/* Branch filter */}
        <div className="relative">
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-zinc-200 rounded-md bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
          >
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        {/* Month filter */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-zinc-200 rounded-md bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </header>
  );
}
