import { cn } from "@/lib/utils"
import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"

export function StepFinancial({ data, update }: Props) {
  // income/expenses come from Step 1 -- 0 for either yields Number("") = 0,
  // never NaN, so no extra parsing guard is needed here.
  const maxInvestable = Math.max(Number(data.monthlyIncome) - Number(data.monthlyExpenses), 0)
  const investableAmount = Math.round((data.investablePct / 100) * maxInvestable)

  const handleSliderChange = (value: number) => {
    const pct = maxInvestable > 0 ? Math.round((value / maxInvestable) * 100) : 0
    update({ investablePct: pct })
  }

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

        {maxInvestable > 0 ? (
          <>
            <input
              type="range"
              min={0}
              max={maxInvestable}
              step={100}
              value={investableAmount}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              aria-label="Amount you can invest each month"
              className="finsight-range w-full"
              style={{
                background: `linear-gradient(to right, var(--primary) ${data.investablePct}%, var(--border) ${data.investablePct}%)`,
              }}
            />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">₹{investableAmount.toLocaleString()}</span>/month
              = {data.investablePct}% of your income
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add your income and expenses in the previous step to set this.
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
