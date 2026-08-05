import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"

export function StepFinancial({ data, update }: Props) {
  const monthlyIncome = Number(data.monthlyIncome)
  const hasIncomeAndExpenses = data.monthlyIncome !== "" && data.monthlyExpenses !== ""

  // income/expenses come from Step 1 -- 0 for either yields Number("") = 0,
  // never NaN, so no extra parsing guard is needed here.
  const maxInvestable = Math.max(monthlyIncome - Number(data.monthlyExpenses), 0)

  // investablePct is stored (and sent to the backend) as a percentage of
  // monthly income, not of the available-to-invest amount -- the rupee
  // figure shown on the slider is derived from it.
  const investAmount =
    monthlyIncome > 0 ? Math.round((data.investablePct / 100) * monthlyIncome) : 0
  const pctOfIncome =
    monthlyIncome > 0 ? ((investAmount / monthlyIncome) * 100).toFixed(1) : "0.0"

  const setInvestAmount = (amount: number) => {
    const pct = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0
    update({ investablePct: pct })
  }

  // Seed a sensible default (half of what's available) as soon as both
  // income and expenses are filled in, and re-clamp if a later edit to
  // either one shrinks the available amount below the current pick.
  const hasSeededRef = useRef(false)
  const prevMaxRef = useRef<number | null>(null)
  useEffect(() => {
    if (!hasIncomeAndExpenses) {
      hasSeededRef.current = false
      prevMaxRef.current = null
      return
    }

    const half = Math.floor(maxInvestable / 2)
    if (!hasSeededRef.current) {
      setInvestAmount(half)
      hasSeededRef.current = true
    } else if (prevMaxRef.current !== maxInvestable && investAmount > maxInvestable) {
      setInvestAmount(half)
    }
    prevMaxRef.current = maxInvestable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIncomeAndExpenses, maxInvestable])

  const sliderFillPct = maxInvestable > 0 ? (investAmount / maxInvestable) * 100 : 0

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <label
          htmlFor="savings"
          className="text-sm font-medium text-foreground"
        >
          Current savings
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
            ₹
          </span>
          <input
            id="savings"
            type="number"
            min={0}
            inputMode="numeric"
            value={data.currentSavings}
            onChange={(e) => update({ currentSavings: e.target.value })}
            placeholder="12,000"
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          How much can you invest monthly?
        </label>

        <input
          type="range"
          min={0}
          max={maxInvestable}
          step={1}
          value={investAmount}
          disabled={!data.monthlyIncome || !data.monthlyExpenses}
          onChange={(e) => setInvestAmount(Number(e.target.value))}
          aria-label="Amount you can invest each month"
          className="finsight-range w-full disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, var(--primary) ${sliderFillPct}%, var(--border) ${sliderFillPct}%)`,
          }}
        />

        {hasIncomeAndExpenses ? (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">₹{investAmount.toLocaleString()}</span>/month
              = {pctOfIncome}% of your income
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹0</span>
              <span>₹{Math.round(maxInvestable / 4).toLocaleString()}</span>
              <span>₹{Math.round(maxInvestable / 2).toLocaleString()}</span>
              <span>₹{Math.round((maxInvestable * 3) / 4).toLocaleString()}</span>
              <span>₹{maxInvestable.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your income and expenses above to set your investment amount
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Do you already have investments? (FD, PPF, stocks, etc.)
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update({ existingInvestments: true })}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-colors",
              data.existingInvestments
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50",
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => update({ existingInvestments: false })}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-colors",
              !data.existingInvestments
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50",
            )}
          >
            No
          </button>
        </div>
        {data.existingInvestments && (
          <p className="text-sm text-muted-foreground">
            Great — your FinSight portfolio can be more growth-focused.
          </p>
        )}
      </div>
    </div>
  )
}
