import { ArrowUpRight, Wallet, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Wallet className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">₹1,24,500</p>
        <p className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          +2.4% today
        </p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Virtual Cash Available</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Wallet className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">₹75,500</p>
        <p className="mt-1.5 text-sm text-muted-foreground">Ready to invest</p>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">XP Points</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-3xl font-semibold tracking-tight">2,450 XP</p>
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            Level 7
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">550 XP to Level 8</p>
      </Card>
    </div>
  )
}
