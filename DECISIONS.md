# DealerPulse — Design & Engineering Decisions

## What I Built and Why

I built a 5-page analytics dashboard aimed at a CEO who needs to understand dealership health at a glance and act on problems without digging through spreadsheets.

The core philosophy: **show the story, not just the data.** Every page answers a specific question a real dealership leader would ask.

---

## Architecture

### Backend: Next.js API Routes
Rather than processing JSON purely client-side, I created a proper API layer with 5 endpoints:
- `GET /api/overview` — KPIs + branch table + revenue trend + alerts
- `GET /api/branches` — Branch list or single-branch detail with funnel + rep breakdown
- `GET /api/leads` — Funnel, aging leads, lost reasons, source stats
- `GET /api/reps` — Leaderboard or single-rep detail with recent leads
- `GET /api/insights` — Forecasting, cold leads, top performers

**Why API routes?** Even with a local JSON file, separating compute from presentation means:
1. Easy swap-in of a real database later — change only the data layer
2. Filters are applied server-side, less data over the wire
3. The frontend stays pure UI with no business logic

### Data Processing (`src/lib/dataProcessor.ts`)
A single server-side module handles all data computation. It's designed to be replaced by a real ORM/DB query layer — every function takes the same filter signature `{ branchId, month }` that the API routes pass through from query params.

---

## Product Decisions

### Alert Banner First
The first thing a CEO sees is alerts — not charts. This is deliberate. A visual chart looks healthy at a glance; an alert is harder to ignore.

### "Current Month" is Dec 2025
The dataset ends in Dec 2025, so all target attainment logic uses Dec 2025 as the reference month. For aging leads, the "reference today" is also Dec 31, 2025.

### Lead Aging Threshold = 7 days
Industry benchmark for automotive sales is 48–72h response time. 7 days is the "cold" threshold; 14 days is "urgent."

### Conversion Rate = Delivered / All Leads (not Delivered / Contacted)
This gives a true top-of-funnel picture. A high contacted-to-delivered rate but a low new-to-contacted rate means you have a sourcing problem, not a closing problem.

### Forecasting Logic
Projection = Actual Delivered + (Pipeline × 60%). The 60% factor reflects the historical delivered/total lead ratio across the dataset. It's intentionally conservative — order_placed leads are more certain, negotiation leads less so.

---

## Design Decisions

- **Zinc palette only** — No color noise. Gray scale lets color be meaningful: emerald = good, amber = watch, rose = act now
- **Modal drill-downs** — Click a branch or rep to get detail without leaving context. No page navigation needed for exploration
- **Tab navigation inside Leads page** — Funnel / Aging / Lost / Sources are all about leads but serve different questions. Tabs keep the URL simple while avoiding a cluttered page
- **No authentication** — Per the brief. Assume CEO context

---

## What I'd Build Next

1. **Real-time alerts via webhooks** — Notify the manager's Slack when a lead goes 3+ days without activity
2. **Rep coaching notes** — Managers annotate rep profiles with coaching context
3. **Lead timeline view** — Visual journey map for individual leads (where they've been stuck and for how long)
4. **Comparative month-over-month** — Show delta vs prior month on every KPI card
5. **Export to PDF** — One-click board report generation

---

## Interesting Patterns in the Data

- **56.5% of leads are lost** — much higher than typical. "Better offer elsewhere" and "Not ready to purchase" are tied at #1 — both suggest the follow-up cadence is too slow, not that the product is wrong
- **Walk-in leads are the biggest volume source (140)** — but referrals likely have better conversion; it's worth segmenting
- **Glanza is the most-enquired model** but Camry and Fortuner make up most revenue — budget customers are harder to convert
- **Avg delivery time is 18.3 days** — customer-requested date changes are the #1 delay reason, not logistics, suggesting expectation-setting at order time is an opportunity
