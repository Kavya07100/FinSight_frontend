export type OnboardingData = {
  name: string
  age: string
  monthlyIncome: string
  currentSavings: string
  goal: string
  riskLevel: number
}

export const STEPS = [
  "Tell us about yourself",
  "Your investment goals",
  "Your risk profile",
] as const
