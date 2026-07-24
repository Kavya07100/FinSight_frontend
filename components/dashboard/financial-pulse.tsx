import { Lightbulb } from "lucide-react"

interface FinancialPulseProps {
  riskCategory?: string | null
}

const MESSAGES: Record<string, string> = {
  conservative:
    "Your conservative risk profile means capital protection comes first. Consider steady, diversified options like bonds and blue-chip stocks to build wealth gradually.",
  moderate:
    "You're balancing growth and stability well. Keep diversifying across equities and safer assets to stay on track with your goals.",
  "moderate-aggressive":
    "You're comfortable with some volatility in pursuit of stronger returns. Make sure your portfolio still has enough diversification to weather down markets.",
  aggressive:
    "You're chasing maximum growth and can stomach big swings. Just make sure you're not concentrating too much risk in a single position.",
}

const DEFAULT_MESSAGE =
  "Complete your risk profile during onboarding (or in Settings) to get personalized financial guidance here."

export function FinancialPulse({ riskCategory }: FinancialPulseProps) {
  const message = (riskCategory && MESSAGES[riskCategory]) || DEFAULT_MESSAGE

  return (
    <section
      aria-label="Financial Pulse"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <Lightbulb className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-amber-900">Financial Pulse</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-800">{message}</p>
        </div>
      </div>
    </section>
  )
}
