import { Wallet, Sparkles, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SummaryCardsProps {
  portfolioValue?: number | null
  portfolioValueSource?: "holdings" | "savings"
  riskCategory?: string | null
  totalXp?: number | null
  isLoading?: boolean
}

const NEXT_LEVEL_XP = 3000

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`

const formatCategory = (category: string) =>
  category
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("-")

export function SummaryCards({
  portfolioValue,
  portfolioValueSource = "savings",
  riskCategory,
  totalXp,
  isLoading,
}: SummaryCardsProps) {
  const xp = totalXp ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Wallet className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {isLoading ? "—" : formatCurrency(portfolioValue ?? 0)}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {portfolioValueSource === "holdings" ? "Virtual holdings value" : "Starting savings"}
        </p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Risk Profile</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Shield className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {isLoading ? "—" : riskCategory ? formatCategory(riskCategory) : "Not set"}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {riskCategory ? "Based on your risk profile" : "Complete onboarding to see this"}
        </p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">XP Points</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-3xl font-semibold tracking-tight">
            {isLoading ? "—" : `${xp.toLocaleString()} XP`}
          </p>
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            Level 1
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {Math.max(0, NEXT_LEVEL_XP - xp).toLocaleString()} XP to Level 2
        </p>
      </Card>
    </div>
  )
}
