import { Briefcase, Laptop, Building2, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"

const DEPENDENT_OPTIONS = [0, 1, 2, 3, 4, 5] as const

const EMPLOYMENT_TYPES = [
  { id: "salaried", label: "Salaried", icon: Briefcase },
  { id: "freelancer", label: "Freelancer/Consultant", icon: Laptop },
  { id: "business", label: "Business Owner", icon: Building2 },
  { id: "student", label: "Student", icon: GraduationCap },
] as const

export function StepPersonal({ data, update }: Props) {
  const income = Number(data.monthlyIncome) || 0
  const expenses = Number(data.monthlyExpenses) || 0
  const available = Math.max(income - expenses, 0)
  const availablePct = income > 0 ? Math.round((available / income) * 100) : 0

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
              ₹
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
            htmlFor="expenses"
            className="text-sm font-medium text-foreground"
          >
            Monthly expenses
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              ₹
            </span>
            <input
              id="expenses"
              type="number"
              min={0}
              inputMode="numeric"
              value={data.monthlyExpenses}
              onChange={(e) => update({ monthlyExpenses: e.target.value })}
              placeholder="2,000"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>
      </div>

      {data.monthlyIncome !== "" && (
        <p className="text-sm text-muted-foreground">
          Available to invest: <span className="font-medium text-foreground">₹{available.toLocaleString()}</span>{" "}
          ({availablePct}% of income)
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          How many people depend on your income?
        </label>
        <div className="flex flex-wrap gap-2">
          {DEPENDENT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update({ dependents: n })}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors",
                data.dependents === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary/50",
              )}
            >
              {n === 5 ? "5+" : n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Employment type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {EMPLOYMENT_TYPES.map((type) => {
            const Icon = type.icon
            const selected = data.employmentType === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => update({ employmentType: type.id })}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {type.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
