"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

interface StrategyModule {
  step: number
  module: string
  type: "fixed" | "sandbox"
  difficulty: string
  xp?: number | null
  asset_class?: string | null
  rationale: string
}

interface StrategyConfig {
  id: string
  user_id: string
  version: number
  risk_profile_id: string
  path: StrategyModule[]
  created_at: string
}

const NEXT_LEVEL_XP = 3000

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-[#3B5BDB]",
  hard: "bg-red-100 text-red-600",
}

export default function LearningPage() {
  const [path, setPath] = useState<StrategyModule[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (!storedUserId) {
      setError("Please complete onboarding before viewing your learning path.")
      setIsLoading(false)
      return
    }
    loadStrategy(storedUserId)
  }, [])

  const loadStrategy = async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const getRes = await fetch(`${apiUrl}/users/${userId}/strategy`)

      if (getRes.ok) {
        const data: StrategyConfig = await getRes.json()
        setPath(data.path)
        return
      }

      if (getRes.status !== 404) {
        throw new Error(`Request failed with status ${getRes.status}`)
      }

      const postRes = await fetch(`${apiUrl}/users/${userId}/strategy`, {
        method: "POST",
      })
      if (!postRes.ok) {
        throw new Error(`Request failed with status ${postRes.status}`)
      }
      const created: StrategyConfig = await postRes.json()
      setPath(created.path)
    } catch {
      setError("Something went wrong while generating your learning path. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalXp = (path ?? [])
    .filter((mod) => mod.type === "fixed")
    .reduce((sum, mod) => sum + (mod.xp ?? 0), 0)
  const progressPct = Math.min(100, (totalXp / NEXT_LEVEL_XP) * 100)

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
              <p className="text-gray-500 mt-1">Your personalised financial education journey</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-3">
              <div className="bg-[#3B5BDB] text-white rounded-xl px-3 py-1 text-sm font-bold">Level 1</div>
              <div>
                <p className="text-xs text-gray-500">Total XP</p>
                <p className="text-lg font-bold text-gray-900">{totalXp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-sm font-medium text-gray-500">
                Generating your personalized learning path...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && path && (
            <>
              {/* Progress Bar */}
              <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Progress to Level 2</p>
                  <p className="text-sm text-gray-500">
                    {totalXp.toLocaleString()} / {NEXT_LEVEL_XP.toLocaleString()} XP
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-[#3B5BDB] h-3 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Learning Modules */}
              <div className="space-y-6">
                {path.map((mod, index) => {
                  const isActive = index === 0
                  return (
                    <div
                      key={`${mod.step}-${mod.module}`}
                      className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                        isActive ? "border-2 border-[#3B5BDB]" : "opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isActive ? "bg-blue-100 text-[#3B5BDB]" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isActive ? mod.step : "🔒"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Module {mod.step}: {mod.module}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">{mod.difficulty} difficulty</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            isActive ? "bg-blue-100 text-[#3B5BDB]" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isActive ? "In Progress" : "Locked"}
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                              DIFFICULTY_STYLES[mod.difficulty] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {mod.difficulty}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full font-medium capitalize bg-gray-100 text-gray-600">
                            {mod.type}
                          </span>
                          {mod.type === "fixed" && mod.xp != null && (
                            <span className="text-xs font-medium text-gray-500">+{mod.xp} XP</span>
                          )}
                          {mod.type === "sandbox" && mod.asset_class && (
                            <span className="text-xs font-medium text-gray-500">{mod.asset_class}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{mod.rationale}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
