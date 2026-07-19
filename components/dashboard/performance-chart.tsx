"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatINR, performanceConfig, performanceData } from "./data"

export function PerformanceChart() {
  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Portfolio Performance</h2>
        <p className="text-sm text-muted-foreground">Value over the last 9 months</p>
      </div>
      <ChartContainer config={performanceConfig} className="h-[260px] w-full">
        <LineChart data={performanceData} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={56}
            className="text-xs"
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => formatINR(Number(value))}
                labelFormatter={(label) => `${label} 2026`}
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
    </Card>
  )
}
