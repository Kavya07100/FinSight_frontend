"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatINR, performanceConfig } from "./data"

interface DailyValue {
  date: string
  value: number
}

interface PerformanceChartProps {
  dailyValues?: DailyValue[]
}

export function PerformanceChart({ dailyValues = [] }: PerformanceChartProps) {
  const chartData = dailyValues
    .filter((_, i) => i % 5 === 0 || i === dailyValues.length - 1)
    .map((row) => ({
      label: new Date(row.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      value: row.value,
    }))

  const tickInterval = Math.max(0, Math.floor(chartData.length / 6))

  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Portfolio Performance</h2>
        <p className="text-sm text-muted-foreground">
          {chartData.length > 0 ? "Portfolio value over simulation period" : "No simulations yet"}
        </p>
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-[260px] w-full items-center justify-center text-sm text-muted-foreground">
          Run a simulation to see your performance here.
        </div>
      ) : (
        <ChartContainer config={performanceConfig} className="h-[260px] w-full">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={tickInterval}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
              className="text-xs"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatINR(Number(value))}
                  labelFormatter={(label) => label}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  )
}
