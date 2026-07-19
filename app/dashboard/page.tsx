import { Sidebar } from "@/components/dashboard/sidebar"
import { Greeting } from "@/components/dashboard/greeting"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { FinancialPulse } from "@/components/dashboard/financial-pulse"
import { AllocationChart } from "@/components/dashboard/allocation-chart"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { MarketNews } from "@/components/dashboard/market-news"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <Greeting />
          <SummaryCards />
          <FinancialPulse />
          <div className="grid gap-6 lg:grid-cols-2">
            <AllocationChart />
            <PerformanceChart />
          </div>
          <MarketNews />
        </div>
      </main>
    </div>
  )
}