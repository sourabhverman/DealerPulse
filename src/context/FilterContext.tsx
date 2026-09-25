"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface FilterState {
  branchId: string;
  month: string;
  setBranchId: (v: string) => void;
  setMonth: (v: string) => void;
  queryString: () => string;
}

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [branchId, setBranchId] = useState("all");
  const [month, setMonth] = useState("all");

  const queryString = () => {
    const p = new URLSearchParams();
    if (branchId !== "all") p.set("branchId", branchId);
    if (month !== "all") p.set("month", month);
    return p.toString();
  };

  return (
    <FilterContext.Provider value={{ branchId, month, setBranchId, setMonth, queryString }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}
