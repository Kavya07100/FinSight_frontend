"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  PartyPopper,
  AlertTriangle,
} from "lucide-react"

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

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface ModuleContent {
  module_name: string
  article_content: string
  article_summary: string[]
  difficulty: string
  quiz_questions: QuizQuestion[]
}

interface QuizResult {
  score: number
  total: number
  passed: boolean
  xp_awarded: number
  results: {
    question_id: string
    question: string
    your_answer: string
    correct_answer: string
    is_correct: boolean
    explanation: string
  }[]
}

interface UserProgress {
  completed_steps: number[]
  total_xp: number
}

type View = "list" | "article" | "quiz" | "results"

// The only module with content in the DB right now. Used to show an
// "Article available" vs "Coming soon" indicator on the list view.
const CONTENT_READY_MODULE = "Emergency Fund Building"

const NEXT_LEVEL_XP = 3000

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-[#3B5BDB]",
  hard: "bg-red-100 text-red-600",
  advanced: "bg-red-100 text-red-600",
}

const OPTION_KEYS = ["a", "b", "c", "d"] as const
type OptionKey = (typeof OPTION_KEYS)[number]

export default function LearningPage() {
  const [path, setPath] = useState<StrategyModule[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<View>("list")
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null)
  const [moduleLoading, setModuleLoading] = useState(false)
  const [loadingModuleName, setLoadingModuleName] = useState<string | null>(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completed_steps: [],
    total_xp: 0,
  })

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (!storedUserId) {
      setError("Please complete onboarding before viewing your learning path.")
      setIsLoading(false)
      return
    }
    loadStrategy(storedUserId)
    loadProgress(storedUserId)
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

  // GET /users/{userId}/learning/progress doesn't exist on the backend yet --
  // fall back to zeroed progress on 404 (or any other failure) so the rest
  // of the page still renders normally.
  const loadProgress = async (userId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/users/${userId}/learning/progress`)
      if (!res.ok) {
        setUserProgress({ completed_steps: [], total_xp: 0 })
        return
      }
      const data = await res.json()
      setUserProgress({
        completed_steps: data.completed_steps ?? [],
        total_xp: data.total_xp ?? 0,
      })
    } catch {
      setUserProgress({ completed_steps: [], total_xp: 0 })
    }
  }

  const handleModuleClick = async (mod: StrategyModule) => {
    setModuleLoading(true)
    setLoadingModuleName(mod.module)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(
        `${apiUrl}/learning/modules/${encodeURIComponent(mod.module)}`
      )

      if (res.ok) {
        const data: ModuleContent = await res.json()
        setSelectedModule(data)
        setView("article")
      } else if (res.status === 404) {
        alert("This module's content is coming soon")
      } else {
        alert("Something went wrong, please try again")
      }
    } catch {
      alert("Something went wrong, please try again")
    } finally {
      setModuleLoading(false)
      setLoadingModuleName(null)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!selectedModule) return
    const userId = localStorage.getItem("finsight_user_id")
    if (!userId) return

    setQuizSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/users/${userId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_name: selectedModule.module_name,
          module_step: 1, // Emergency Fund Building is always step 1 for now
          answers: quizAnswers,
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: QuizResult = await res.json()
      setQuizResults(data)
      setView("results")
    } catch {
      alert("Something went wrong, please try again")
    } finally {
      setQuizSubmitting(false)
    }
  }

  const backToList = () => {
    setView("list")
    setSelectedModule(null)
    const userId = localStorage.getItem("finsight_user_id")
    if (userId) {
      loadStrategy(userId)
      loadProgress(userId)
    }
  }

  const totalXp = (path ?? [])
    .filter((mod) => mod.type === "fixed")
    .reduce((sum, mod) => sum + (mod.xp ?? 0), 0)
  const progressPct = Math.min(100, (totalXp / NEXT_LEVEL_XP) * 100)

  const answeredCount = selectedModule
    ? selectedModule.quiz_questions.filter((q) => quizAnswers[q.id]).length
    : 0
  const totalQuestions = selectedModule?.quiz_questions.length ?? 10

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {view === "list" && (
            <>
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

              {/* Quiz XP earned so far, from lesson completions */}
              <p className="text-xs text-gray-500 -mt-4 mb-6">
                Your XP: <span className="font-semibold text-gray-700">{userProgress.total_xp}</span>
              </p>

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
                      const isCompleted = userProgress.completed_steps.includes(mod.step)
                      const hasArticle = mod.module === CONTENT_READY_MODULE
                      const isCardLoading = moduleLoading && loadingModuleName === mod.module

                      return (
                        <button
                          key={`${mod.step}-${mod.module}`}
                          type="button"
                          onClick={() => handleModuleClick(mod)}
                          disabled={isCardLoading}
                          className={`w-full text-left bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md relative ${
                            isActive ? "border-2 border-[#3B5BDB]" : "opacity-60"
                          }`}
                        >
                          {isCardLoading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                              <Loader2 className="h-6 w-6 text-[#3B5BDB] animate-spin" />
                            </div>
                          )}
                          <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isActive ? "bg-blue-100 text-[#3B5BDB]" : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : isActive ? (
                                  mod.step
                                ) : (
                                  "🔒"
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  Module {mod.step}: {mod.module}
                                  {isCompleted && (
                                    <span className="text-xs font-semibold text-green-600">Completed ✓</span>
                                  )}
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
                              {hasArticle ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-[#3B5BDB]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B5BDB]" />
                                  Article available
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-gray-400">Coming soon</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{mod.rationale}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {view === "article" && selectedModule && (
            <ArticleView
              module={selectedModule}
              onBack={() => {
                setView("list")
                setSelectedModule(null)
              }}
              onStartQuiz={() => {
                setQuizAnswers({})
                setView("quiz")
              }}
            />
          )}

          {view === "quiz" && selectedModule && (
            <QuizView
              module={selectedModule}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
              submitting={quizSubmitting}
              onBack={() => setView("article")}
              onSubmit={handleSubmitQuiz}
            />
          )}

          {view === "results" && selectedModule && quizResults && (
            <ResultsView
              moduleName={selectedModule.module_name}
              results={quizResults}
              onBackToList={backToList}
              onReviewArticle={() => setView("article")}
              onTryAgain={() => {
                setQuizAnswers({})
                setView("quiz")
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function ArticleView({
  module,
  onBack,
  onStartQuiz,
}: {
  module: ModuleContent
  onBack: () => void
  onStartQuiz: () => void
}) {
  const paragraphs = module.article_content.split("\n\n").filter((p) => p.trim().length > 0)

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-[#3B5BDB] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learning Path
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{module.module_name}</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
            DIFFICULTY_STYLES[module.difficulty] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {module.difficulty}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="text-sm text-gray-700 leading-relaxed">
            {para}
          </p>
        ))}

        {module.article_summary.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6">
            <p className="text-sm font-semibold text-[#3B5BDB] mb-3">Key Takeaways</p>
            <ul className="space-y-2">
              {module.article_summary.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-[#3B5BDB] mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onStartQuiz}
          className="bg-[#3B5BDB] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3B5BDB]/90 transition-colors"
        >
          Take Quiz →
        </button>
      </div>
    </div>
  )
}

function QuizView({
  module,
  quizAnswers,
  setQuizAnswers,
  answeredCount,
  totalQuestions,
  submitting,
  onBack,
  onSubmit,
}: {
  module: ModuleContent
  quizAnswers: Record<string, string>
  setQuizAnswers: Dispatch<SetStateAction<Record<string, string>>>
  answeredCount: number
  totalQuestions: number
  submitting: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  const allAnswered = answeredCount >= totalQuestions

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-[#3B5BDB] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Article
      </button>

      <h2 className="text-2xl font-bold text-gray-900">Quiz: {module.module_name}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Answer all 10 questions and click Submit. Pass mark: 7/10
      </p>

      <div className="space-y-4">
        {module.quiz_questions.map((q, idx) => {
          const options: [OptionKey, string][] = [
            ["a", q.option_a],
            ["b", q.option_b],
            ["c", q.option_c],
            ["d", q.option_d],
          ]

          return (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="font-semibold text-gray-900 mb-3">
                {idx + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {options.map(([opt, text]) => {
                  const selected = quizAnswers[q.id] === opt
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selected
                          ? "border-[#3B5BDB] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={selected}
                        onChange={() =>
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        className="accent-[#3B5BDB]"
                      />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold uppercase mr-1">{opt}.</span>
                        {text}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between sticky bottom-4">
        <p className="text-sm text-gray-500">
          {answeredCount}/{totalQuestions} questions answered
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered || submitting}
          className="bg-[#3B5BDB] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3B5BDB]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Quiz
        </button>
      </div>
    </div>
  )
}

function ResultsView({
  moduleName,
  results,
  onBackToList,
  onReviewArticle,
  onTryAgain,
}: {
  moduleName: string
  results: QuizResult
  onBackToList: () => void
  onReviewArticle: () => void
  onTryAgain: () => void
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
        {results.passed ? (
          <>
            <PartyPopper className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">You passed! 🎉</h2>
            <p className="text-sm text-gray-500 mt-2">
              Score: {results.score}/{results.total} · XP Earned: +{results.xp_awarded}
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">Keep trying!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Score: {results.score}/{results.total} · You need 7/10 to pass
            </p>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Quiz: {moduleName} -- Results Breakdown
        </h3>
        {results.results.map((r, idx) => (
          <div key={r.question_id} className={idx > 0 ? "border-t border-gray-100 pt-4 mt-4" : ""}>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {idx + 1}. {r.question}
            </p>
            <p className="text-sm mb-1 flex items-center gap-1">
              <span className="text-gray-500">Your answer:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  r.is_correct ? "text-green-600" : "text-red-600"
                }`}
              >
                {r.your_answer ? r.your_answer.toUpperCase() : "Not answered"}
                {r.is_correct ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </span>
            </p>
            {!r.is_correct && (
              <p className="text-sm mb-1">
                <span className="text-gray-500">Correct answer: </span>
                <span className="font-semibold text-green-600">{r.correct_answer.toUpperCase()}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{r.explanation}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        {results.passed ? (
          <>
            <button
              type="button"
              onClick={onBackToList}
              className="bg-white border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to Learning Path
            </button>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="bg-gray-100 text-gray-400 font-semibold px-5 py-3 rounded-xl cursor-not-allowed"
            >
              Next Module → (Coming soon)
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onReviewArticle}
              className="bg-white border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Review Article
            </button>
            <button
              type="button"
              onClick={onTryAgain}
              className="bg-[#3B5BDB] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#3B5BDB]/90 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
