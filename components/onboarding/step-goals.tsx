import { TrendingUp, PiggyBank, Zap, GraduationCap, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const GOALS = [
  {
    id: "wealth-building",
    label: "Wealth building",
    description: "Grow assets steadily over the long term.",
    icon: TrendingUp,
  },
  {
    id: "retirement-planning",
    label: "Retirement planning",
    description: "Build a secure nest egg for the future.",
    icon: PiggyBank,
  },
  {
    id: "short-term-gains",
    label: "Short-term gains",
    description: "Pursue quicker returns with active moves.",
    icon: Zap,
  },
  {
    id: "learning-basics",
    label: "Learning basics",
    description: "Understand the fundamentals first.",
    icon: GraduationCap,
  },
] as const

export function StepGoals({ data, update }: Props) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Investment goals"
    >
      {GOALS.map((goal) => {
        const Icon = goal.icon
        const selected = data.goal === goal.id
        return (
          <button
            key={goal.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update({ goal: goal.id })}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-2xl border-2 bg-card p-5 text-left transition-all hover:border-primary/50",
              selected
                ? "border-primary shadow-sm"
                : "border-border",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{goal.label}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {goal.description}
              </p>
            </div>
            {selected && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
