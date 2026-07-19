import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"

export function StepPersonal({ data, update }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Full name
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Jordan Avery"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="age" className="text-sm font-medium text-foreground">
          Age
        </label>
        <input
          id="age"
          type="number"
          min={0}
          inputMode="numeric"
          value={data.age}
          onChange={(e) => update({ age: e.target.value })}
          placeholder="28"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="income"
            className="text-sm font-medium text-foreground"
          >
            Monthly income
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              $
            </span>
            <input
              id="income"
              type="number"
              min={0}
              inputMode="numeric"
              value={data.monthlyIncome}
              onChange={(e) => update({ monthlyIncome: e.target.value })}
              placeholder="4,500"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="savings"
            className="text-sm font-medium text-foreground"
          >
            Current savings
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              $
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
      </div>
    </div>
  )
}
