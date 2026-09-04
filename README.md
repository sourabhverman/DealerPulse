# DealerPulse

**Toyota Dealership Performance Dashboard** — built as a take-home assignment to demonstrate product judgment, data storytelling, and shipping speed over raw typing speed.

> _"Use Claude Code, Cursor, Copilot, v0, or whatever tools you want. We care about your **judgment** — which features to build, how to present information, what tradeoffs to make — not whether you typed every line by hand."_

---

## What This Is

A full-stack analytics dashboard for a Toyota dealership group — 5 branches, 30 sales reps, 510 leads, 7 months of data (Jun–Dec 2025). Built in a single session using AI-assisted development.

**Live pages:**
| Page | What it answers |
|------|----------------|
| Overview | Is the business healthy right now? |
| Branches | Which branch needs attention and why? |
| Leads | Where is the pipeline leaking? |
| Sales Reps | Who are the top performers? |
| Insights | What will revenue look like next month? |
| Revenue Simulator ✨ | What happens if we fix cold leads or improve conversion? |

**Bonus features beyond the assignment spec:**
- **CEO Daily Brief** — auto-generated 4-paragraph narrative from live data. No AI needed; pure business logic. Floating pill button, right-side panel.
- **Ask AI** — streaming chat widget powered by OpenRouter. Answers questions about pipeline, branches, and reps using pre-computed business context (not raw JSON).
- **Revenue What-If Simulator** — interactive sliders let you model the revenue impact of fixing cold leads, boosting test-drive conversion, improving negotiation close rate, or increasing deal value.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | API routes + React in one repo |
| Language | TypeScript | Type safety across data shapes |
| Styling | Tailwind CSS (zinc palette) | Fast, consistent, minimal |
| Charts | Recharts 3 | Composable, works with SSR |
| AI | OpenRouter → MiniMax M3 (free tier) | No credit card needed to demo |
| Data | Local JSON via API routes | Swappable with any DB later |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment
cp .env.local.example .env.local
# Edit .env.local and add your OpenRouter key (free at openrouter.ai/keys)

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The AI chat (`Ask AI` button, bottom-right) requires an `OPENROUTER_API_KEY`. Every other feature works without it.

---

## Project Structure

```
src/
├── app/
│   ├── api/              # Server-side API routes (data computation layer)
│   │   ├── overview/     # KPIs, branch table, alerts
│   │   ├── branches/     # Branch stats + funnel
│   │   ├── leads/        # Funnel, aging, lost reasons, sources
│   │   ├── reps/         # Leaderboard + rep detail
│   │   ├── insights/     # Forecasts + cold lead list
│   │   ├── simulator/    # What-if baseline data
│   │   └── chat/         # AI streaming endpoint (SSE)
│   ├── branches/         # Branch performance page
│   ├── leads/            # Lead pipeline page
│   ├── reps/             # Sales rep leaderboard
│   ├── insights/         # Forecasting page
│   ├── simulator/        # Revenue what-if simulator
│   └── page.tsx          # Overview (home)
├── components/
│   ├── charts/           # RevenueChart, FunnelChart, DonutChart
│   ├── layout/           # Sidebar, Header
│   └── ui/               # KPICard, Modal, ChatWidget, CEOBrief, Badge
├── context/
│   └── FilterContext.tsx # Global branch + month filter state
├── lib/
│   ├── dataProcessor.ts  # All data computation (server-side)
│   ├── buildAIContext.ts # Builds ~50-line context string for AI
│   ├── types.ts          # All TypeScript interfaces
│   └── utils.ts          # cn(), formatCurrency(), monthLabel()
└── data/
    └── dealership_data.json
```

---

## How AI Tools Were Used

This project was built with **Claude Code** (Anthropic's CLI) as the primary development tool. Here's exactly how — and why it matters:

### What AI handled
- Scaffolding all Next.js pages and API routes from a plain-language description of what each page should show
- Writing `dataProcessor.ts` — the core computation module — from business requirements ("conversion rate = delivered ÷ total leads, aging = 7+ days without activity")
- Generating Recharts configurations that actually match the data shape
- Debugging TypeScript type errors and Recharts v3 API changes
- Building the SSE streaming chat endpoint and client-side reader
- Creating the Revenue Simulator's funnel math from scratch

### What I (the engineer) decided
- **Architecture**: API routes as a proper backend layer, not client-side JSON parsing — so the data layer is swappable with a real database
- **Which extra features to build**: CEO Brief and Revenue Simulator weren't in the spec. I added them because they turn data into decisions, which is the actual job of a dashboard
- **AI context design**: Instead of passing 600KB of raw JSON to the AI, I pre-compute a rich 50-line business context string. This is token-efficient, hallucination-proof, and faster
- **Design system**: Zinc-only palette so color stays meaningful (emerald = good, amber = watch, rose = act now)
- **Alert-first layout**: The alert banner is the first thing on the Overview page — harder to ignore than a chart that looks fine at a glance
- **Floating UI pattern**: CEO Brief and Ask AI both live as floating pills in the bottom-right corner — accessible from any page without interrupting the main content

### The judgment call
Using AI tools to build faster is the right call when the constraint is time-to-value. The skill isn't typing — it's knowing what to build, how to structure it, and what decisions matter. Every architectural and product decision above was made by a human. The AI typed the boilerplate.

---

## Key Design Decisions

See [DECISIONS.md](./DECISIONS.md) for a full writeup, including:
- Why API routes over client-side data processing
- How conversion rate is calculated (and why the denominator matters)
- Interesting patterns found in the data (56.5% lead loss rate, walk-in volume vs referral quality)
- What I'd build next (Slack alerts, lead timeline view, PDF export)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Optional | Powers the Ask AI chat widget. Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys) |

All other features work with no environment setup.

---

## Screenshots

### Overview — alert-first layout with KPI cards and revenue trend
![Overview page with KPI cards, alert banner, revenue chart, and branch table]

### Revenue Simulator — model what happens if you fix your funnel
![Simulator with sliders for cold lead recovery, conversion boosts, and deal value uplift]

### Ask AI — streaming chat grounded in real business data
![Floating chat widget with suggested questions and streaming response]

### CEO Daily Brief — one tap, full narrative
![CEO Brief floating panel with auto-generated 4-paragraph business narrative]

---

Built with [Claude Code](https://claude.ai/code) · Next.js · TypeScript · Tailwind · Recharts · OpenRouter
