import { Lightbulb } from "lucide-react"

export function FinancialPulse() {
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
          <p className="mt-1 text-sm leading-relaxed text-amber-800">
            You tend to check your portfolio too frequently. Try setting a weekly review
            schedule to stay focused on your long-term goals and avoid emotional decisions.
          </p>
        </div>
      </div>
    </section>
  )
}
