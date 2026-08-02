export type OnboardingData = {
  name: string
  age: string
  monthlyIncome: string
  currentSavings: string
  goal: string
  riskLevel: number
  monthlyExpenses: string
  dependents: number
  employmentType: string
  existingInvestments: boolean
  timeHorizon: string
  investablePct: number
}

export const STEPS = [
  "Tell us about yourself",
  "Your financial situation",
  "Your investment goals",
  "Your risk profile",
] as const
