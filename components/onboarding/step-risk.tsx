import { cn } from "@/lib/utils"
import type { OnboardingData } from "./types"

type Props = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

const RISK_PROFILES = [
  {
    title: "Conservative",
    description:
      "You prioritize protecting your capital. Expect stable, modest returns with minimal exposure to market swings.",
  },
  {
    title: "Moderately conservative",
    description:
      "You lean toward safety but accept a little risk for slightly higher growth over time.",
  },
  {
    title: "Balanced",
    description:
      "You aim for a healthy mix of growth and stability, accepting moderate ups and downs along the way.",
  },
  {
    title: "Moderately aggressive",
    description:
      "You're comfortable with bigger swings in pursuit of stronger long-term returns.",
  },
  {
    title: "Aggressive",
    description:
      "You chase maximum growth and can stomach significant volatility for the highest potential returns.",
  },
] as const

export function StepRisk({ data, update }: Props) {
  const level = data.riskLevel
  const profile = RISK_PROFILES[level - 1]
  const percent = ((level - 1) / (RISK_PROFILES.length - 1)) * 100

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {profile.title}
          </h3>
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground">
            {level}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {profile.description}
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={level}
          onChange={(e) => update({ riskLevel: Number(e.target.value) })}
          aria-label="Risk tolerance level from 1 conservative to 5 aggressive"
          className="finsight-range w-full"
          style={{
            background: `linear-gradient(to right, var(--primary) ${percent}%, var(--border) ${percent}%)`,
          }}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Conservative
          </span>
          <span className="text-sm font-medium text-foreground">
            Aggressive
          </span>
        </div>

        <div className="flex items-center justify-between px-0.5">
          {RISK_PROFILES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "text-xs font-medium",
                i + 1 === level ? "text-primary" : "text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
