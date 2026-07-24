"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Greeting } from "@/components/dashboard/greeting"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { FinancialPulse } from "@/components/dashboard/financial-pulse"
import { AllocationChart } from "@/components/dashboard/allocation-chart"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { MarketNews } from "@/components/dashboard/market-news"

interface DailyValue {
  date: string
  value: number
}

interface StrategyModule {
  type: string
  xp?: number | null
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState<string | undefined>(undefined)
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null)
  const [portfolioValueSource, setPortfolioValueSource] = useState<"holdings" | "savings">("savings")
  const [riskCategory, setRiskCategory] = useState<string | null>(null)
  const [totalXp, setTotalXp] = useState<number | null>(null)
  const [dailyValues, setDailyValues] = useState<DailyValue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("finsight_user_id")
    if (!userId) {
      setIsLoading(false)
      return
    }
    loadDashboard(userId)
  }, [])

  const loadDashboard = async (userId: string) => {
    setIsLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // Each section degrades independently -- a missing risk profile or
    // strategy (both plausible for a new user) shouldn't block the rest
    // of the dashboard from rendering with what IS available.
    const [userRes, riskRes, strategyRes, simRes, portfolioRes] = await Promise.allSettled([
      fetch(`${apiUrl}/users/${userId}`),
      fetch(`${apiUrl}/users/${userId}/risk-profile`),
      fetch(`${apiUrl}/users/${userId}/strategy`),
      fetch(`${apiUrl}/users/${userId}/simulations/latest`),
      fetch(`${apiUrl}/users/${userId}/portfolio`),
    ])

    let currentSavings: number | null = null

    if (userRes.status === "fulfilled" && userRes.value.ok) {
      const user = await userRes.value.json()
      setFirstName(user.full_name ? user.full_name.split(" ")[0] : undefined)
      currentSavings = user.current_savings ?? null
    }

    if (riskRes.status === "fulfilled" && riskRes.value.ok) {
      const profile = await riskRes.value.json()
      setRiskCategory(profile.category)
    }

    if (strategyRes.status === "fulfilled" && strategyRes.value.ok) {
      const strategy = await strategyRes.value.json()
      const path: StrategyModule[] = strategy.path ?? []
      const xp = path
        .filter((mod) => mod.type === "fixed")
        .reduce((sum, mod) => sum + (mod.xp ?? 0), 0)
      setTotalXp(xp)
    }

    if (simRes.status === "fulfilled" && simRes.value.ok) {
      const sim = await simRes.value.json()
      setDailyValues(sim.metrics?.daily_values ?? [])
    }

    // Prefer the real portfolio value (holdings marked to market); fall
    // back to onboarding's current_savings only when there are no holdings
    // yet (e.g. before the user's first simulated trade).
    let holdingsValue: number | null = null
    if (portfolioRes.status === "fulfilled" && portfolioRes.value.ok) {
      const portfolio = await portfolioRes.value.json()
      if (portfolio.holdings && portfolio.holdings.length > 0) {
        holdingsValue = portfolio.total_value
      }
    }

    if (holdingsValue != null) {
      setPortfolioValue(holdingsValue)
      setPortfolioValueSource("holdings")
    } else {
      setPortfolioValue(currentSavings)
      setPortfolioValueSource("savings")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <Greeting firstName={firstName} />
          <SummaryCards
            portfolioValue={portfolioValue}
            portfolioValueSource={portfolioValueSource}
            riskCategory={riskCategory}
            totalXp={totalXp}
            isLoading={isLoading}
          />
          <FinancialPulse riskCategory={riskCategory} />
          <div className="grid gap-6 lg:grid-cols-2">
            <AllocationChart />
            <PerformanceChart dailyValues={dailyValues} />
          </div>
          <MarketNews />
        </div>
      </main>
    </div>
  )
}
