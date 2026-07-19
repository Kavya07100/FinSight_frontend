import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS } from "./types"

export function ProgressBar({ current }: { current: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((label, index) => {
          const isComplete = index < current
          const isActive = index === current
          const isLast = index === STEPS.length - 1
          return (
            <div
              key={label}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive &&
                      "border-primary bg-card text-primary",
                    !isComplete &&
                      !isActive &&
                      "border-border bg-card text-muted-foreground",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {`Step ${current + 1} of ${STEPS.length}`}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {STEPS[current]}
        </p>
      </div>
    </div>
  )
}
