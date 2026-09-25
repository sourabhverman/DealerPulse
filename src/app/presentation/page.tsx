"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Building2, Users, TrendingUp,
  Lightbulb, Sliders, Zap, Brain, CheckCircle2, BarChart3,
  MessageSquare, Code2, Layers, ArrowRight, Clock, Monitor,
  Database, Cpu, TrendingDown, Star, Filter, BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Slide 1: Title ───────────────────────────────────────────────────── */
function Slide1() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.09) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 text-xs tracking-wide">
          <Zap size={11} className="text-emerald-400" />
          Take-Home Assignment · DealerPulse Analytics
        </div>
        <h1 className="text-5xl font-bold text-white leading-[1.1] mb-5">
          Real-Time Analytics Dashboard<br />
          <span className="text-zinc-400">for a Toyota Dealership Group</span>
        </h1>
        <p className="text-lg text-zinc-400 mb-8">
          5 branches &nbsp;·&nbsp; 30 sales reps &nbsp;·&nbsp; 510 leads &nbsp;·&nbsp; 7 months of data
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {["Next.js 16", "TypeScript", "Tailwind CSS", "Recharts 3", "OpenRouter AI"].map(t => (
            <span key={t} className="px-3 py-1 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-sm font-mono">{t}</span>
          ))}
        </div>
        <p className="text-zinc-600 text-sm italic max-w-2xl mx-auto leading-relaxed">
          &ldquo;Use whatever AI tools you want. We care about your judgment — which features to build, how to present information, what tradeoffs to make.&rdquo;
        </p>
      </div>
    </div>
  );
}

/* ─── Slide 2: The Problem ─────────────────────────────────────────────── */
function Slide2() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(239,68,68,0.06) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">The Problem</p>
        <h2 className="text-4xl font-bold text-white mb-2">
          The data exists. Nobody is <span className="text-rose-400">acting on it fast enough.</span>
        </h2>
        <p className="text-zinc-400 text-base mb-10">A Toyota dealer group with 5 branches has no single view of their pipeline health.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20",
              stat: "56.5%", label: "of leads are lost",
              detail: "Industry average is 30–40%. The gap is follow-up speed, not product quality."
            },
            {
              icon: Building2, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
              stat: "5 branches", label: "no unified view",
              detail: "Branch managers operate in silos. The CEO has no morning snapshot."
            },
            {
              icon: Clock, color: "text-zinc-300", bg: "bg-zinc-800 border-zinc-700",
              stat: "14+ days", label: "leads sit untouched",
              detail: "Cold leads bleed revenue silently. Nobody is assigned to act on them."
            },
          ].map(({ icon: Icon, color, bg, stat, label, detail }) => (
            <div key={stat} className={cn("rounded-xl border p-6", bg)}>
              <Icon size={20} className={cn(color, "mb-4")} />
              <div className={cn("text-3xl font-bold mb-1", color)}>{stat}</div>
              <div className="text-white font-medium text-sm mb-2">{label}</div>
              <div className="text-zinc-500 text-xs leading-relaxed">{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 3: What I Built ────────────────────────────────────────────── */
function Slide3() {
  const pages = [
    { icon: BarChart3, label: "Overview", question: "Is the business healthy right now?" },
    { icon: Building2, label: "Branches", question: "Which branch needs attention, and why?" },
    { icon: TrendingUp, label: "Leads", question: "Where is the pipeline leaking?" },
    { icon: Users, label: "Sales Reps", question: "Who is performing? Who needs coaching?" },
    { icon: Lightbulb, label: "Insights", question: "What will revenue look like next month?" },
    { icon: Sliders, label: "Simulator", question: "What if we fix cold leads or close rate?" },
  ];
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">The Solution</p>
        <h2 className="text-4xl font-bold text-white mb-2">6 pages. Each answers one question.</h2>
        <p className="text-zinc-400 text-base mb-8">Every page has a job. No charts for charts&apos; sake.</p>
        <div className="grid grid-cols-3 gap-3">
          {pages.map(({ icon: Icon, label, question }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center">
                  <Icon size={14} className="text-zinc-300" />
                </div>
                <span className="text-white font-medium text-sm">{label}</span>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed italic">&ldquo;{question}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 4: Beyond the Spec ─────────────────────────────────────────── */
function Slide4() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 50%, rgba(16,185,129,0.07) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Beyond the Spec</p>
        <h2 className="text-4xl font-bold text-white mb-2">3 features that turn data into decisions.</h2>
        <p className="text-zinc-400 text-base mb-8">The assignment asked for a dashboard. These turn it into a tool.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
              name: "CEO Daily Brief",
              desc: "One-tap auto-generated 4-paragraph narrative: branch health, cold lead risk, worst branch recovery actions, pipeline forecast. No AI required — pure business logic.",
              tag: "Any page · Floating pill",
            },
            {
              icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
              name: "Ask AI Chat",
              desc: "Streaming chat grounded in real data. Key decision: pre-compute a 50-line business context — not raw 600KB JSON. Token-efficient, hallucination-proof, fast.",
              tag: "OpenRouter · Free tier",
            },
            {
              icon: Sliders, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
              name: "Revenue Simulator",
              desc: "4 sliders: cold lead recovery, test-drive conversion boost, negotiation close rate, deal value uplift. Real-time revenue impact per branch. Analytics → planning tool.",
              tag: "4 levers · Branch breakdown",
            },
          ].map(({ icon: Icon, color, bg, name, desc, tag }) => (
            <div key={name} className={cn("rounded-xl border p-5", bg)}>
              <Icon size={20} className={cn(color, "mb-3")} />
              <div className="text-white font-semibold text-sm mb-2">{name}</div>
              <p className="text-zinc-400 text-xs leading-relaxed mb-3">{desc}</p>
              <span className="text-[10px] font-medium text-zinc-500 tracking-wide">{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 5: Architecture ─────────────────────────────────────────────── */
function Slide5() {
  const flow: Array<{ label: string; sub: string; icon: LucideIcon } | null> = [
    { label: "React UI", sub: "Pages + Components", icon: Monitor },
    null,
    { label: "FilterContext", sub: "Global state", icon: Filter },
    null,
    { label: "API Routes", sub: "7 endpoints", icon: Layers },
    null,
    { label: "dataProcessor.ts", sub: "All business logic", icon: Cpu },
    null,
    { label: "JSON / DB", sub: "Swap anytime", icon: Database },
  ];
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Architecture</p>
        <h2 className="text-4xl font-bold text-white mb-8">Structured for a real product, not a demo.</h2>
        <div className="flex items-center gap-2 mb-6">
          {flow.map((item, i) => {
            if (!item) return <ArrowRight key={i} size={14} className="text-zinc-700 flex-shrink-0" />;
            const { label, sub, icon: Icon } = item;
            return (
              <div key={label} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center min-w-0">
                <Icon size={14} className="text-zinc-500 mx-auto mb-1" />
                <div className="text-white text-[11px] font-medium truncate">{label}</div>
                <div className="text-zinc-600 text-[10px] truncate">{sub}</div>
              </div>
            );
          })}
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-5">
          <p className="text-emerald-300 font-medium text-sm mb-1">The key decision: API routes as a proper backend layer</p>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Even with a local JSON file, the data layer is fully separated from the UI. Swap{" "}
            <code className="text-zinc-300 bg-zinc-800 px-1 rounded">dealership_data.json</code>{" "}
            for Supabase — the API contracts and all frontend components stay unchanged. Every function in{" "}
            <code className="text-zinc-300 bg-zinc-800 px-1 rounded">dataProcessor.ts</code>{" "}
            accepts a <code className="text-zinc-300 bg-zinc-800 px-1 rounded">{"{ branchId?, month? }"}</code> filter — the same signature any DB query would use.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Next.js 16 App Router", "TypeScript strict", "Tailwind CSS (zinc palette)", "Recharts 3", "OpenAI SDK → OpenRouter", "date-fns", "React Context"].map(t => (
            <span key={t} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded text-xs font-mono">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 6: Design Philosophy ────────────────────────────────────────── */
function Slide6() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Design Philosophy</p>
        <h2 className="text-4xl font-bold text-white mb-8">Color only means something when it&apos;s rare.</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-300 font-medium text-sm mb-5">Zinc-only palette. Three meaningful colors.</p>
            <div className="space-y-3">
              {[
                { dot: "bg-emerald-500", textC: "text-emerald-400", border: "border-emerald-500/20", label: "Emerald", meaning: "On track · Healthy · Good" },
                { dot: "bg-amber-500", textC: "text-amber-400", border: "border-amber-500/20", label: "Amber", meaning: "Watch · At risk · Approaching" },
                { dot: "bg-rose-500", textC: "text-rose-400", border: "border-rose-500/20", label: "Rose", meaning: "Act now · Behind · Critical" },
              ].map(({ dot, textC, border, label, meaning }) => (
                <div key={label} className={cn("flex items-center gap-3 rounded-lg border px-4 py-2.5 bg-zinc-800/50", border)}>
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", dot)} />
                  <span className={cn("font-medium text-sm", textC)}>{label}</span>
                  <span className="text-zinc-500 text-xs">{meaning}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { title: "Alert-first layout", desc: "Alerts appear before any chart on Overview. A chart can look healthy at a glance. An alert is harder to ignore." },
              { title: "Modal drill-downs", desc: "Click a branch or rep → detail modal. No page navigation. No losing context. Exploration stays fluid." },
              { title: "Floating persistent tools", desc: "CEO Brief + Ask AI are reachable from every page via floating pills — no interruption to the main view." },
              { title: "No auth (by design)", desc: "Per the brief. Architecture supports NextAuth + row-level security by branch as a clean add-on — not a rewrite." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="text-white text-sm font-medium mb-1">{title}</div>
                <div className="text-zinc-500 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 7: Analytical Decisions ─────────────────────────────────────── */
function Slide7() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Analytical Decisions</p>
        <h2 className="text-4xl font-bold text-white mb-2">The wrong metric definition is worse than no metric.</h2>
        <p className="text-zinc-400 text-base mb-8">Four choices that determine whether the dashboard tells the truth.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              title: "Conversion Rate",
              formula: "Delivered ÷ All Leads",
              not: "Delivered ÷ Contacted",
              why: "True top-of-funnel view. High close rate + low overall rate = sourcing problem, not a closing problem.",
            },
            {
              title: "Funnel Measurement",
              formula: '"Ever reached" each stage (via status_history)',
              not: "Current status only",
              why: "Delivered leads would vanish from every upstream stage if we only used current status. status_history solves this.",
            },
            {
              title: "Lead Aging Threshold",
              formula: "7 days = cold · 14 days = urgent",
              not: "Arbitrary cutoff",
              why: "Automotive industry benchmark is 48–72h response time. 7 days is already 3× past that benchmark.",
            },
            {
              title: "Forecasting Formula",
              formula: "Actual Delivered + (Pipeline × 60%)",
              not: "100% of pipeline assumed to close",
              why: "60% reflects historical delivered/total ratio. Conservative by design — better to under-promise a forecast.",
            },
          ].map(({ title, formula, not: notThis, why }) => (
            <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="text-zinc-300 font-semibold text-sm mb-3">{title}</div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1.5 mb-2">
                <span className="text-emerald-400 text-xs font-mono">{formula}</span>
              </div>
              <div className="text-zinc-700 text-xs mb-2 line-through">{notThis}</div>
              <div className="text-zinc-400 text-xs leading-relaxed">{why}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 8: Data Insights ─────────────────────────────────────────────── */
function Slide8() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.05) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">What the Data Says</p>
        <h2 className="text-4xl font-bold text-white mb-2">Patterns that tell you where to look next.</h2>
        <p className="text-zinc-400 text-base mb-8">Four findings from 510 leads, 5 branches, 7 months.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              stat: "56.5%", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20",
              title: "Lead loss rate — 1.5× industry average",
              detail: '"Better offer elsewhere" + "not ready" are the top 2 lost reasons. Both signal slow follow-up, not a product problem. Fix: response SLA + cold lead push alerts.',
            },
            {
              stat: "#1 source", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
              title: "Walk-in volume, but referrals likely win on quality",
              detail: "140 walk-in leads = highest volume. But referrals are pre-qualified, trust-anchored buyers. Segmenting conversion by source would confirm and redirect marketing spend.",
            },
            {
              stat: "Glanza vs\nFortune r", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
              title: "Most enquiries vs most revenue are different cars",
              detail: "Glanza drives traffic. Camry/Fortuner drive revenue. If the goal is revenue per lead (not just lead volume), the premium floor strategy deserves more investment.",
            },
            {
              stat: "18.3 days", color: "text-zinc-300", bg: "bg-zinc-800 border-zinc-700",
              title: "Avg delivery time — #1 delay is customer-requested",
              detail: "Not a logistics failure — an expectation management problem at point of order. Training reps to set clearer delivery windows reduces this without supply chain changes.",
            },
          ].map(({ stat, color, bg, title, detail }) => (
            <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex gap-4">
              <div className={cn("rounded-lg border px-3 py-2 text-center flex-shrink-0 flex items-center justify-center min-w-[72px]", bg)}>
                <span className={cn("font-bold text-sm leading-tight text-center", color)}>{stat}</span>
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1.5">{title}</div>
                <div className="text-zinc-500 text-xs leading-relaxed">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 9: How AI Was Used ───────────────────────────────────────────── */
function Slide9() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">How I Used AI</p>
        <h2 className="text-4xl font-bold text-white mb-2">The skill is knowing what to decide, not what to type.</h2>
        <p className="text-zinc-400 text-base mb-8">Built with Claude Code. Here&apos;s exactly how the work was split.</p>
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={14} className="text-zinc-400" />
              <span className="text-zinc-300 font-medium text-sm">AI handled the boilerplate</span>
            </div>
            <ul className="space-y-2">
              {[
                "Scaffolding all Next.js pages and API routes",
                "dataProcessor.ts from plain business rules",
                "Recharts configs for dual-axis revenue chart",
                "TypeScript type errors and Recharts v3 changes",
                "SSE streaming chat endpoint + client reader",
                "Revenue Simulator funnel math",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-zinc-500 text-xs">
                  <CheckCircle2 size={11} className="text-zinc-700 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={14} className="text-emerald-400" />
              <span className="text-emerald-300 font-medium text-sm">I made every decision</span>
            </div>
            <ul className="space-y-2">
              {[
                "Architecture: API layer vs client-side JSON",
                "Which features to build beyond spec (CEO Brief, Simulator)",
                "AI context design: 50-line summary, not 600KB raw JSON",
                "Zinc-only design system — color as signal",
                "Alert-first layout on Overview page",
                "Every metric definition, threshold, formula",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-emerald-200/70 text-xs">
                  <Star size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-3">
          <p className="text-zinc-300 text-sm">
            <span className="text-white font-medium">The honest framing:</span> Using AI to ship faster is the right call when time is the constraint. Every architectural and product decision was made by a human. The AI typed the boilerplate.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 10: What's Next ──────────────────────────────────────────────── */
function Slide10() {
  return (
    <div className="h-full flex flex-col justify-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">What&apos;s Next</p>
        <h2 className="text-4xl font-bold text-white mb-2">If this were a real product, here&apos;s week 1.</h2>
        <p className="text-zinc-400 text-base mb-7">Prioritized by actual business impact, not technical impressiveness.</p>
        <div className="space-y-3">
          {[
            {
              rank: "01", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20",
              title: "Slack / WhatsApp alerts",
              desc: "When a lead crosses 3 days without activity, ping the rep. Alerts in a dashboard are seen when someone opens it. Push notifications are seen immediately. Highest leverage for the real problem.",
            },
            {
              rank: "02", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
              title: "Lead timeline view",
              desc: "Visual journey map for individual leads — every status change, note, and day of inactivity. Right now you can see which leads are cold. This shows why.",
            },
            {
              rank: "03", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
              title: "Month-over-month delta on KPI cards",
              desc: "Every KPI shows current value. Adding '↑ 8% vs last month' answers the most common exec question without any extra navigation.",
            },
            {
              rank: "04", color: "text-zinc-300", bg: "bg-zinc-800/80 border-zinc-700",
              title: "Real database + authentication",
              desc: "Supabase for data, NextAuth for login, row-level security by branch. The architecture is already set up — it's a swap, not a rewrite.",
            },
            {
              rank: "05", color: "text-zinc-500", bg: "bg-zinc-900 border-zinc-800",
              title: "PDF board report export",
              desc: "One-click export of the Insights page. Dealership CEOs often present to investors or regional Toyota reps. Reduce prep time.",
            },
          ].map(({ rank, color, bg, title, desc }) => (
            <div key={rank} className={cn("flex items-start gap-4 rounded-lg border px-5 py-3", bg)}>
              <span className={cn("font-mono text-base font-bold flex-shrink-0 mt-0.5", color)}>{rank}</span>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-white font-medium text-sm">{title}</span>
                <span className="text-zinc-500 text-xs leading-relaxed">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 11: Q&A ──────────────────────────────────────────────────────── */
function Slide11() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-16 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.08) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-3xl">
        <div className="text-8xl font-bold text-white mb-4 tracking-tight">Q&A</div>
        <p className="text-zinc-400 text-xl mb-10">Code, architecture, product decisions — open book.</p>
        <div className="grid grid-cols-3 gap-3 text-left mb-10">
          {[
            "Why API routes over client-side JSON?",
            "How would this scale to 50 branches?",
            "What's the biggest flaw right now?",
            "How does the Simulator math work?",
            "Why MiniMax and not GPT-4?",
            "What would you build in week 1?",
          ].map(q => (
            <div key={q} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <p className="text-zinc-400 text-xs leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
        <p className="text-zinc-600 text-sm">
          See{" "}
          <code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">CROSS_QUESTIONS.md</code>{" "}
          in the repo for 20 anticipated questions with detailed answers.
        </p>
      </div>
    </div>
  );
}

/* ─── Slide registry ─────────────────────────────────────────────────────── */
const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10, Slide11];
const TITLES = [
  "Introduction", "The Problem", "What I Built", "Beyond the Spec",
  "Architecture", "Design Philosophy", "Analytical Decisions",
  "Data Insights", "How AI Was Used", "What's Next", "Q&A",
];

/* ─── Main presentation component ───────────────────────────────────────── */
export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 180);
  }, [current]);

  const next = useCallback(() => {
    if (current < SLIDES.length - 1) goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const SlideComponent = SLIDES[current];

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="h-9 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-5 gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-zinc-800 rounded flex items-center justify-center">
            <Zap size={9} className="text-zinc-400" />
          </div>
          <span className="text-zinc-500 text-xs font-medium">DealerPulse</span>
        </div>
        <span className="text-zinc-700 text-xs">/</span>
        <span className="text-zinc-400 text-xs">Founder Walkthrough</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-zinc-500 text-[10px]">{TITLES[current]}</span>
          <span className="text-zinc-700 text-[10px] font-mono">·</span>
          <span className="text-zinc-600 text-[10px] font-mono">{current + 1} / {SLIDES.length}</span>
        </div>
      </div>

      {/* Slide */}
      <div className={cn("flex-1 overflow-hidden transition-opacity duration-200", visible ? "opacity-100" : "opacity-0")}>
        <SlideComponent />
      </div>

      {/* Bottom nav */}
      <div className="h-11 bg-zinc-900 border-t border-zinc-800 flex items-center px-5 gap-4 flex-shrink-0">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-6 bg-white" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === SLIDES.length - 1}
          className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        <span className="text-zinc-700 text-[10px] font-mono flex-shrink-0 hidden sm:block">← → to navigate</span>
      </div>
    </div>
  );
}
