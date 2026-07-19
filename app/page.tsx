import { LineChart } from "lucide-react"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <header className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LineChart className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold tracking-tight text-foreground">
          FinSight
        </span>
      </header>

      <OnboardingFlow />

      <p className="mt-8 text-sm text-muted-foreground">
        Building smarter financial habits, one step at a time.
      </p>
    </main>
  )
}
