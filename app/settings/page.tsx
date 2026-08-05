"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

// value must match what onboarding's step-goals.tsx sends as `goal` and what
// the risk_profiles.goal column stores -- these are NOT the display labels.
const GOALS = [
  { value: "wealth-building", label: "Wealth building" },
  { value: "retirement-planning", label: "Retirement planning" },
  { value: "short-term-gains", label: "Short-term gains" },
  { value: "learning-basics", label: "Learning basics" },
]
const RISK_LEVELS = ["Very Conservative", "Conservative", "Balanced", "Aggressive", "Very Aggressive"]

const DEPENDENT_OPTIONS = [0, 1, 2, 3, 4, 5] as const

// values match onboarding's step-personal.tsx employment type ids
const EMPLOYMENT_TYPES = [
  { value: "salaried", label: "Salaried" },
  { value: "freelancer", label: "Freelancer" },
  { value: "business", label: "Business" },
  { value: "student", label: "Student" },
]

// values match onboarding's step-goals.tsx time horizon ids
const TIME_HORIZONS = [
  { value: "under2", label: "Under 2 years" },
  { value: "2to5", label: "2-5 years" },
  { value: "5to10", label: "5-10 years" },
  { value: "10plus", label: "10+ years" },
]

// Midpoint years sent to the backend for each bucket -- mirrors
// onboarding-flow.tsx's TIME_HORIZON_YEARS.
const TIME_HORIZON_YEARS: Record<string, number> = {
  under2: 1.5,
  "2to5": 3.5,
  "5to10": 7.5,
  "10plus": 15.0,
}

// Inverse of the above: bucket a stored time_horizon_years back into an id.
const timeHorizonFromYears = (years: number): string => {
  if (years < 2) return "under2"
  if (years < 5) return "2to5"
  if (years < 10) return "5to10"
  return "10plus"
}

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [monthlyExpenses, setMonthlyExpenses] = useState("")
  const [currentSavings, setCurrentSavings] = useState("")
  const [dependents, setDependents] = useState(0)
  const [employmentType, setEmploymentType] = useState("")
  const [investmentGoal, setInvestmentGoal] = useState(GOALS[0].value)
  const [riskTolerance, setRiskTolerance] = useState(3)
  const [timeHorizon, setTimeHorizon] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (!storedUserId) {
      setError("Please complete onboarding before editing settings.")
      setIsLoading(false)
      return
    }
    setUserId(storedUserId)
    loadProfile(storedUserId)
  }, [])

  const loadProfile = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const userRes = await fetch(`${apiUrl}/users/${id}`)
      if (!userRes.ok) {
        throw new Error(`Request failed with status ${userRes.status}`)
      }
      const user = await userRes.json()
      setFullName(user.full_name ?? "")
      setAge(user.age != null ? String(user.age) : "")
      setMonthlyIncome(user.monthly_income != null ? String(user.monthly_income) : "")
      setMonthlyExpenses(user.monthly_expenses != null ? String(user.monthly_expenses) : "")
      setCurrentSavings(user.current_savings != null ? String(user.current_savings) : "")
      setDependents(user.dependents ?? 0)
      setEmploymentType(user.employment_type ?? "")

      // Investment goal / risk tolerance / time horizon live on the risk
      // profile, not the user record -- a missing risk profile (404) just
      // means the Investment Preferences fields fall back to their defaults.
      const riskRes = await fetch(`${apiUrl}/users/${id}/risk-profile`)
      if (riskRes.ok) {
        const profile = await riskRes.json()
        if (profile.goal) setInvestmentGoal(profile.goal)
        if (profile.risk_tolerance_input) setRiskTolerance(profile.risk_tolerance_input)
        if (profile.time_horizon_years != null) {
          setTimeHorizon(timeHorizonFromYears(profile.time_horizon_years))
        }
      }
    } catch {
      setError("Something went wrong while loading your profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          age: age === "" ? null : Number(age),
          monthly_income: monthlyIncome === "" ? null : Number(monthlyIncome),
          monthly_expenses: monthlyExpenses === "" ? null : Number(monthlyExpenses),
          current_savings: currentSavings === "" ? null : Number(currentSavings),
          dependents,
          employment_type: employmentType === "" ? null : employmentType,
          investment_goal: investmentGoal,
          risk_tolerance: riskTolerance,
          time_horizon_years: timeHorizon === "" ? null : TIME_HORIZON_YEARS[timeHorizon],
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setError("Something went wrong while saving your changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPortfolio = async () => {
    if (!userId) return

    const confirmed = window.confirm(
      "This will reset all your virtual trades and restore your starting capital. Are you sure?"
    )
    if (!confirmed) return

    setIsResetting(true)
    setResetSuccess(false)
    setResetError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/users/${userId}/reset-portfolio`, {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 3000)
    } catch {
      setResetError("Something went wrong while resetting your portfolio. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500 mb-4">Loading your profile...</p>
          )}
          {error && (
            <p className="text-sm font-medium text-red-500 mb-4">{error}</p>
          )}
          {saveSuccess && (
            <p className="text-sm font-medium text-green-600 mb-4">Changes saved!</p>
          )}

          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Monthly Expenses</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Current Savings</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Number of Dependents</label>
                <div className="flex flex-wrap gap-2">
                  {DEPENDENT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDependents(n)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        dependents === n
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#3B5BDB]"
                      }`}
                    >
                      {n === 5 ? "5+" : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Employment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setEmploymentType(type.value)}
                      className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                        employmentType === type.value
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#3B5BDB]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Investment Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Investment Goal</label>
                <select
                  value={investmentGoal}
                  onChange={(e) => setInvestmentGoal(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                >
                  {GOALS.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Risk Tolerance</label>
                <div className="grid grid-cols-5 gap-2">
                  {RISK_LEVELS.map((level, i) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRiskTolerance(i + 1)}
                      className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
                        riskTolerance === i + 1
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#3B5BDB]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Time Horizon</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_HORIZONS.map((horizon) => (
                    <button
                      key={horizon.value}
                      type="button"
                      onClick={() => setTimeHorizon(horizon.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        timeHorizon === horizon.value
                          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#3B5BDB]"
                      }`}
                    >
                      {horizon.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Reset Portfolio</h2>
            <p className="text-sm text-gray-500 mb-4">This will reset all your virtual trades and restore your starting capital of ₹2,00,000. Your learning progress will not be affected.</p>
            {resetSuccess && (
              <p className="text-sm font-medium text-green-600 mb-4">Portfolio reset! Your virtual trades have been cleared.</p>
            )}
            {resetError && (
              <p className="text-sm font-medium text-red-500 mb-4">{resetError}</p>
            )}
            <button
              onClick={handleResetPortfolio}
              disabled={isResetting || !userId}
              className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-5 py-2 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? "Resetting..." : "Reset Virtual Portfolio"}
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !userId}
            className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </main>
    </div>
  )
}
