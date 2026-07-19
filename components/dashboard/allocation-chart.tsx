"use client"

import { Pie, PieChart } from "recharts"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { allocationConfig, allocationData } from "./data"

export function AllocationChart() {
  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Portfolio Allocation</h2>
        <p className="text-sm text-muted-foreground">How your investments are distributed</p>
      </div>
      <ChartContainer
        config={allocationConfig}
        className="mx-auto h-[260px] w-full"
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={allocationData}
            dataKey="value"
            nameKey="name"
            innerRadius={64}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    </Card>
  )
}
