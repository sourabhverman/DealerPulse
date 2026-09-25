"use client";
import { cn } from "@/lib/utils";

export default function FormulaTooltip({
  formula,
  note,
  position = "bottom",
  size = "sm",
}: {
  formula: string;
  note?: string;
  position?: "right" | "left" | "top" | "bottom";
  size?: "sm" | "lg";
}) {
  const posClass = {
    right:  "left-5 top-1/2 -translate-y-1/2",
    left:   "right-5 top-1/2 -translate-y-1/2",
    top:    "bottom-5 left-1/2 -translate-x-1/2",
    bottom: "top-5 left-0",
  }[position];

  const arrowClass = {
    right:  "absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45",
    left:   "absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45",
    top:    "absolute bottom-[-4px] left-4 w-2 h-2 bg-zinc-900 rotate-45",
    bottom: "absolute top-[-4px] left-4 w-2 h-2 bg-zinc-900 rotate-45",
  }[position];

  return (
    <span className="relative group/ft inline-flex items-center align-middle">
      <span className="cursor-help text-[10px] font-bold text-zinc-300 hover:text-zinc-500 transition-colors ml-1 select-none leading-none">
        ƒ
      </span>
      <div
        className={cn(
          "absolute z-50 hidden group-hover/ft:block bg-zinc-900 text-white rounded-xl shadow-xl p-3 pointer-events-none whitespace-nowrap",
          posClass,
          size === "lg" ? "w-72" : "w-56"
        )}
      >
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          Formula
        </span>
        <span className="block text-xs font-mono leading-relaxed text-zinc-100 whitespace-pre-line">
          {formula}
        </span>
        {note && (
          <span className="block text-[10px] text-zinc-400 mt-2 leading-relaxed border-t border-zinc-700 pt-2 whitespace-normal">
            {note}
          </span>
        )}
        <div className={arrowClass} />
      </div>
    </span>
  );
}
