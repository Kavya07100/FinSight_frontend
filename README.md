# FinSight Frontend

FinSight is a virtual investing and financial-literacy platform. This is the Next.js frontend:
an onboarding flow that builds a user's risk profile, a dashboard summarizing their virtual
portfolio and progress, a trade simulator and multi-strategy backtester backed by real historical
price data, an AI chat assistant for investing questions, and a personalized, AI-generated
learning path.

It talks to the FinSight backend (FastAPI) for all real data — onboarding, risk scoring,
simulations, portfolio/transactions, the learning path, and the chat assistant.

## Tech Stack

- **Next.js 16** (App Router) — React framework
- **React 19**
- **Tailwind CSS 4** — styling
- **Recharts** — portfolio performance / allocation charts
- **shadcn**-style UI primitives (`components/ui/*`) — Button, Card, Avatar, Chart wrappers, etc.
- **lucide-react** — icons

## Prerequisites

- Node.js 18.18+ (Next.js 16 requirement)
- The FinSight backend running and reachable (defaults to `http://localhost:8000`)

## Setup

```bash
# 1. Clone and enter the project
git clone <repo-url> finsight
cd finsight

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env.local file in the project root (see "Environment Variables" below)

# 4. Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

> The backend must be running first for anything beyond the onboarding page's local form state
> to work — every other page fetches real data over HTTP and has no built-in mock/offline mode.

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FinSight backend API. Used by every page that fetches real data (all except onboarding's local form state before submission). |

## Pages

| Route | Description |
|---|---|
| `/` | Onboarding — 3-step flow (personal info, investment goal, risk tolerance) that creates a user and computes their initial risk profile, then redirects to the dashboard |
| `/dashboard` | Home dashboard — real portfolio value, risk category, and XP summary cards; a financial-pulse message tailored to risk category; a performance chart from the user's latest simulation; a static allocation chart and market news feed |
| `/chat` | AI chat assistant — ask free-text investing questions, answered by the backend's RAG-based Learning Agent |
| `/simulate` | Trade simulator — pick a stock from Market Watch, choose buy/sell and quantity, and run a one-year sandbox backtest against real historical prices with an SPY benchmark comparison |
| `/backtest` | Strategy backtester — run "Buy and Hold" or "SIP (Monthly Investment)" over 1/3/5/10-year windows for five supported stocks, with real return/drawdown/benchmark metrics, a performance chart, and a yearly invested-vs-value breakdown ("Moving Average Crossover" and "RSI Based" are marked Coming Soon — not implemented yet) |
| `/portfolio` | Virtual portfolio — real current holdings (quantity, avg buy price, current price, P&L%) and the last 10 transactions, sourced from the backend's portfolio engine |
| `/learning` | Personalized learning path — auto-generates (or loads) a strategy-agent learning path based on the user's risk profile; shows step-by-step modules with difficulty, XP, and rationale |
| `/settings` | Profile settings — edit personal info and investment preferences; saving updates the user record and, if goal/risk-tolerance changed, recomputes a new risk-profile version |

## Project Structure

```
app/
  page.tsx                 Onboarding (/)
  dashboard/page.tsx        Dashboard
  chat/page.tsx               Chat
  simulate/page.tsx             Trade simulator
  backtest/page.tsx                Strategy backtester
  portfolio/page.tsx                  Portfolio
  learning/page.tsx                     Learning path
  settings/page.tsx                       Settings
components/
  onboarding/               Onboarding step components + shared form state/types
  dashboard/                 Sidebar nav, greeting, summary cards, charts, market news
  chat/                        Chat header/message/input
  ui/                             Shared primitives (Button, Card, Avatar, Chart wrappers)
lib/
  utils.ts                  Shared helpers (e.g. `cn` classname merge)
```
