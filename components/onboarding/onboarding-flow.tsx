"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "./progress-bar"
import { StepPersonal } from "./step-personal"
import { StepGoals } from "./step-goals"
import { StepRisk } from "./step-risk"
import { STEPS, type OnboardingData } from "./types"

const STEP_SUBTITLES = [
  "A few basics so we can tailor your experience.",
  "Pick the objective that matters most to you right now.",
  "Tell us how much market movement you're comfortable with.",
]

export function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: "",
    monthlyIncome: "",
    currentSavings: "",
    goal: "",
    riskLevel: 3,
  })
  const router = useRouter()
  const update = (patch: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...patch }))

  const canContinue =
    step === 0
      ? data.name.trim() !== "" &&
        data.age !== "" &&
        data.monthlyIncome !== "" &&
        data.currentSavings !== ""
      : step === 1
        ? data.goal !== ""
        : true

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else setDone(true)
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  if (done) {
    return (
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-balance text-foreground">
          {`You're all set${data.name ? `, ${data.name.split(" ")[0]}` : ""}!`}
        </h2>
        <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
          Your FinSight profile is ready. We&apos;ll use your goals and risk
          profile to personalize your learning path.
        </p>
        <Button
  className="mt-8 h-12 w-full rounded-xl text-base"
  onClick={() => router.push("/dashboard")}
>
  Go to Dashboard
</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <ProgressBar current={step} />

      <div className="mt-8">
        <h1 className="text-2xl font-bold text-balance text-foreground">
          {STEPS[step]}
        </h1>
        <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
          {STEP_SUBTITLES[step]}
        </p>
      </div>

      <div className="mt-7">
        {step === 0 && <StepPersonal data={data} update={update} />}
        {step === 1 && <StepGoals data={data} update={update} />}
        {step === 2 && <StepRisk data={data} update={update} />}
      </div>

      <div className="mt-9 flex items-center gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={back}
            className="h-12 flex-1 rounded-xl border-border bg-transparent text-base"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        )}
        <Button
          onClick={next}
          disabled={!canContinue}
          className="h-12 flex-1 rounded-xl text-base"
        >
          {step === STEPS.length - 1 ? (
            <>
              Finish
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
