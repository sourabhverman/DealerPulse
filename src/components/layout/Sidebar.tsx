"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  Lightbulb,
  Zap,
  Sliders,
} from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/branches", label: "Branches", icon: Building2 },
  { href: "/leads", label: "Leads", icon: TrendingUp },
  { href: "/reps", label: "Sales Reps", icon: Users },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

const toolsNav = [
  { href: "/simulator", label: "Revenue Simulator", icon: Sliders, badge: "New" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-zinc-200 flex flex-col z-30">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 tracking-tight">
            DealerPulse
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Analytics
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
              )}
            >
              <Icon size={15} className={active ? "text-zinc-900" : "text-zinc-400"} />
              {label}
            </Link>
          );
        })}

        <p className="px-2 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Tools
        </p>
        {toolsNav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
              )}
            >
              <Icon size={15} className={active ? "text-zinc-900" : "text-zinc-400"} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-zinc-900 text-white px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-200">
        <p className="text-[11px] text-zinc-400">Toyota Dealership Group</p>
        <p className="text-[10px] text-zinc-300 mt-0.5">Jun – Dec 2025</p>
      </div>
    </aside>
  );
}
