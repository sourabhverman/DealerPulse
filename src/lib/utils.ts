import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

const MONTH_LABELS: Record<string, string> = {
  "2025-06": "Jun 2025",
  "2025-07": "Jul 2025",
  "2025-08": "Aug 2025",
  "2025-09": "Sep 2025",
  "2025-10": "Oct 2025",
  "2025-11": "Nov 2025",
  "2025-12": "Dec 2025",
};

export function monthLabel(m: string) {
  return MONTH_LABELS[m] ?? m;
}

export const STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  new: { label: "New", color: "text-zinc-500", dot: "bg-zinc-400" },
  contacted: { label: "Contacted", color: "text-blue-600", dot: "bg-blue-500" },
  test_drive: { label: "Test Drive", color: "text-violet-600", dot: "bg-violet-500" },
  negotiation: { label: "Negotiation", color: "text-amber-600", dot: "bg-amber-500" },
  order_placed: { label: "Order Placed", color: "text-emerald-600", dot: "bg-emerald-500" },
  delivered: { label: "Delivered", color: "text-emerald-700", dot: "bg-emerald-600" },
  lost: { label: "Lost", color: "text-rose-600", dot: "bg-rose-500" },
};
