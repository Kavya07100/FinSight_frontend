"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatINR } from "./data"

interface Holding {
  ticker: string
  company_name: string | null
  quantity: number
  avg_buy_price: number
}

interface AllocationChartProps {
  holdings?: Holding[]
}

// Fixed colors for the tickers users trade most often, so the same stock
// always reads as the same slice/legend color across the app.
const TICKER_COLORS: Record<string, string> = {
  "RELIANCE.NS": "#1f77b4",
  "HDFCBANK.NS": "#ff7f0e",
  "INFY.NS": "#2ca02c",
  "TATAMOTORS.NS": "#d62728",
  "TMPV.NS": "#d62728",
  "NIFTYBEES.NS": "#9467bd",
  "WIPRO.NS": "#8c564b",
  "SBIN.NS": "#e377c2",
  "BAJFINANCE.NS": "#7f7f7f",
}
const DEFAULT_COLOR = "#17becf"

const colorForTicker = (ticker: string) => TICKER_COLORS[ticker] ?? DEFAULT_COLOR

export function AllocationChart({ holdings = [] }: AllocationChartProps) {
  // Invested value per holding -- avg buy price x quantity, i.e. what the
  // user actually put in, not the current mark-to-market value.
  const total = holdings.reduce((sum, h) => sum + h.quantity * h.avg_buy_price, 0)

  const chartData = holdings.map((h) => {
    const value = h.quantity * h.avg_buy_price
    return {
      name: h.company_name ?? h.ticker,
      ticker: h.ticker,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      fill: colorForTicker(h.ticker),
    }
  })

  const chartConfig = chartData.reduce((cfg, d) => {
    cfg[d.ticker] = { label: d.name, color: d.fill }
    return cfg
  }, {} as ChartConfig)

  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Portfolio Allocation</h2>
        <p className="text-sm text-muted-foreground">How your investments are distributed</p>
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-[260px] w-full items-center justify-center text-center text-sm text-muted-foreground">
          No investments yet — make your first trade in Simulate
        </div>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="mx-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="ticker"
                    formatter={(value, _name, item) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{item.payload.name}</span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {formatINR(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="ticker"
                innerRadius={64}
                outerRadius={100}
                paddingAngle={2}
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.ticker} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm">
            {chartData.map((entry) => (
              <div key={entry.ticker} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-muted-foreground">
                  {entry.name} — {entry.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-medium">
            Total Invested: ₹{total.toLocaleString("en-IN")}
          </p>
        </>
      )}
    </Card>
  )
}
