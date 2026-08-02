"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Trophy, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StockPrice {
  ticker: string
  price: number
  change_pct: number | null
  is_up?: boolean
}

interface Holding {
  quantity: number
  avg_buy_price: number
}

interface ChallengeSession {
  session_id: string
  day_number: number
  total_days: number
  difficulty: string
  virtual_cash: number
  starting_balance: number
  holdings: Record<string, Holding>
  portfolio_value: number
  portfolio_change_pct: number
  prices: Record<string, StockPrice>
  is_complete: boolean
  revealed: boolean
}

interface RevealData {
  scenario_id: string
  actual_period: string
  historical_context: string
  difficulty: string
  user_final_value: number
  user_return_pct: number
  market_return_pct: number
  outperformance_pct: number
  behavior_analysis: {
    total_trades: number
    panic_sells: number
    best_decision: string
    worst_decision: string
  }
  verdict: string
}

const DIFFICULTIES = [
  { id: "easy", label: "Easy", description: "Bull markets — practice buy-and-hold in a rising market." },
  { id: "medium", label: "Medium", description: "Mixed markets — stock selection matters more than timing." },
  { id: "hard", label: "Hard", description: "Corrections — can you avoid panic selling?" },
  { id: "expert", label: "Expert", description: "High volatility — test discipline under rapid swings." },
] as const

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
  expert: "bg-purple-100 text-purple-700",
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
}

const NEXT_DIFFICULTY: Record<string, string> = {
  easy: "medium",
  medium: "hard",
  hard: "expert",
  expert: "expert",
}

const PREV_DIFFICULTY: Record<string, string | null> = {
  easy: null,
  medium: "easy",
  hard: "medium",
  expert: "hard",
}

function Metric({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn("text-lg font-bold mt-1", colorClass ?? "text-gray-900")}>{value}</p>
    </div>
  )
}

export default function ChallengePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [session, setSession] = useState<ChallengeSession | null>(null)
  const [revealData, setRevealData] = useState<RevealData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("easy")
  const [startingBalanceInput, setStartingBalanceInput] = useState("100000")
  const [isStarting, setIsStarting] = useState(false)

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy")
  const [tradeQuantity, setTradeQuantity] = useState(0)
  const [isTrading, setIsTrading] = useState(false)
  const [tradeError, setTradeError] = useState<string | null>(null)

  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isAbandoning, setIsAbandoning] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (!storedUserId) {
      setError("Please complete onboarding before playing Challenge Mode.")
      setIsLoadingInitial(false)
      return
    }
    setUserId(storedUserId)
    loadActiveSession(storedUserId)
  }, [])

  const loadActiveSession = async (uid: string) => {
    setIsLoadingInitial(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${uid}/challenge/active`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setSession(data)
    } catch {
      setSession(null)
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const handleStart = async (difficulty: string) => {
    if (!userId) return
    const balance = Number(startingBalanceInput)
    if (!Number.isFinite(balance) || balance < 10000 || balance > 10000000) {
      setError("Enter a starting balance between ₹10,000 and ₹1,00,00,000.")
      return
    }
    setError(null)
    setIsStarting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/challenge/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, starting_balance: balance }),
      })
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data: ChallengeSession = await res.json()
      setSession(data)
      setRevealData(null)
      setSelectedTicker(null)
      setTradeQuantity(0)
      setTradeError(null)
    } catch {
      setError("Something went wrong starting the challenge. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleTrade = async () => {
    if (!userId || !session || !selectedTicker || tradeQuantity <= 0) return
    setTradeError(null)
    setIsTrading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/challenge/${session.session_id}/trade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: selectedTicker, action: tradeAction, quantity: tradeQuantity }),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`)
      }
      const data = await res.json()
      setSession((prev) =>
        prev
          ? { ...prev, virtual_cash: data.virtual_cash, holdings: data.holdings, portfolio_value: data.portfolio_value }
          : prev
      )
      setTradeQuantity(0)
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Something went wrong placing this trade.")
    } finally {
      setIsTrading(false)
    }
  }

  const handleNextDay = async () => {
    if (!userId || !session) return
    setIsAdvancing(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/challenge/${session.session_id}/next-day`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setSession((prev) => (prev ? { ...prev, ...data } : prev))
      setTradeError(null)
    } catch {
      setError("Something went wrong advancing to the next day. Please try again.")
    } finally {
      setIsAdvancing(false)
    }
  }

  const handleReveal = async () => {
    if (!userId || !session) return
    setIsRevealing(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/challenge/${session.session_id}/reveal`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data: RevealData = await res.json()
      setRevealData(data)
    } catch {
      setError("Something went wrong revealing your results. Please try again.")
    } finally {
      setIsRevealing(false)
    }
  }

  const handlePlayAgain = (difficulty: string) => {
    setRevealData(null)
    setSession(null)
    handleStart(difficulty)
  }

  const handleAbandon = async () => {
    if (!userId || !session) return
    if (!window.confirm("Abandon this challenge? Your progress will be lost and you can start a new one.")) {
      return
    }
    setIsAbandoning(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/challenge/${session.session_id}/abandon`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setSession(null)
      setRevealData(null)
      setSelectedTicker(null)
      setTradeQuantity(0)
      setTradeError(null)
    } catch {
      setError("Something went wrong abandoning this challenge. Please try again.")
    } finally {
      setIsAbandoning(false)
    }
  }

  const stockList = session
    ? Object.entries(session.prices).map(([name, p]) => ({ name, ...p }))
    : []
  const selectedStock = stockList.find((s) => s.ticker === selectedTicker) ?? null
  const heldQty = selectedTicker ? session?.holdings[selectedTicker]?.quantity ?? 0 : 0
  const heldAvgPrice = selectedTicker ? session?.holdings[selectedTicker]?.avg_buy_price ?? 0 : 0
  const estimatedAmount = (selectedStock?.price ?? 0) * tradeQuantity

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {isLoadingInitial && (
            <p className="text-sm text-gray-400">Loading Challenge Mode…</p>
          )}

          {!isLoadingInitial && error && !session && (
            <div className="mx-auto max-w-xl bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          )}

          {/* Results screen */}
          {!isLoadingInitial && revealData && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Trophy className="h-8 w-8" aria-hidden="true" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                  You navigated {revealData.actual_period}!
                </h1>
                <p className="mt-2 text-sm text-gray-500">{revealData.historical_context}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-2 gap-4 mb-6">
                <Metric
                  label="Your Return"
                  value={`${revealData.user_return_pct >= 0 ? "+" : ""}${revealData.user_return_pct.toFixed(2)}%`}
                  colorClass={revealData.user_return_pct >= 0 ? "text-green-600" : "text-red-500"}
                />
                <Metric
                  label="Market Return (Nifty 50)"
                  value={`${revealData.market_return_pct >= 0 ? "+" : ""}${revealData.market_return_pct.toFixed(2)}%`}
                />
                <Metric
                  label="Outperformance"
                  value={`${revealData.outperformance_pct >= 0 ? "+" : ""}${revealData.outperformance_pct.toFixed(2)}%`}
                  colorClass={revealData.outperformance_pct >= 0 ? "text-green-600" : "text-red-500"}
                />
                <Metric
                  label="Final Portfolio Value"
                  value={`₹${revealData.user_final_value.toLocaleString()}`}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">Behavioral Analysis</h2>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Trades</p>
                    <p className="font-medium text-gray-900">{revealData.behavior_analysis.total_trades}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Panic Sells</p>
                    <p className="font-medium text-gray-900">{revealData.behavior_analysis.panic_sells}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium text-green-600">Best decision: </span>
                    {revealData.behavior_analysis.best_decision}
                  </p>
                  <p>
                    <span className="font-medium text-red-500">Worst decision: </span>
                    {revealData.behavior_analysis.worst_decision}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center mb-6">
                <p className="text-sm font-medium text-blue-900">{revealData.verdict}</p>
              </div>

              <div className="flex gap-3">
                {PREV_DIFFICULTY[revealData.difficulty] && (
                  <button
                    type="button"
                    onClick={() => handlePlayAgain(PREV_DIFFICULTY[revealData.difficulty]!)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    ← Try Easier ({DIFFICULTY_LABEL[PREV_DIFFICULTY[revealData.difficulty]!]})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePlayAgain(revealData.difficulty)}
                  className="flex-1 bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayAgain(NEXT_DIFFICULTY[revealData.difficulty])}
                  className="flex-1 border-2 border-[#3B5BDB] text-[#3B5BDB] rounded-xl py-3 font-medium text-sm hover:bg-blue-50 transition-colors"
                >
                  Try Harder →
                </button>
              </div>
            </div>
          )}

          {/* Active session screen */}
          {!isLoadingInitial && !revealData && session && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Day {session.day_number} of {session.total_days}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        DIFFICULTY_BADGE[session.difficulty]
                      )}
                    >
                      {DIFFICULTY_LABEL[session.difficulty] ?? session.difficulty}
                    </span>
                    <button
                      type="button"
                      onClick={handleAbandon}
                      disabled={isAbandoning}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {isAbandoning ? "Abandoning..." : "Abandon & Start New"}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Virtual Cash</p>
                  <p className="font-bold text-gray-900">₹{session.virtual_cash.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Portfolio Value</p>
                  <p className="font-bold text-gray-900">₹{session.portfolio_value.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Overall P&L</p>
                  <p
                    className={cn(
                      "font-bold",
                      session.portfolio_change_pct >= 0 ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {session.portfolio_change_pct >= 0 ? "+" : ""}
                    {session.portfolio_change_pct.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Stock cards */}
                <div>
                  <h2 className="font-semibold text-gray-900 mb-4">Market</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {stockList.map((stock) => (
                      <button
                        key={stock.ticker}
                        type="button"
                        onClick={() => {
                          setSelectedTicker(stock.ticker)
                          setTradeQuantity(0)
                          setTradeError(null)
                        }}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left transition-colors",
                          selectedTicker === stock.ticker
                            ? "border-[#3B5BDB] bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ₹{stock.price.toLocaleString()}
                        </p>
                        {stock.change_pct === null ? (
                          <p className="text-xs text-gray-400 mt-1">Day 1</p>
                        ) : (
                          <p
                            className={cn(
                              "text-xs font-medium mt-1 flex items-center gap-1",
                              stock.is_up ? "text-green-600" : "text-red-500"
                            )}
                          >
                            {stock.is_up ? (
                              <ArrowUp className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="h-3 w-3" aria-hidden="true" />
                            )}
                            {stock.change_pct >= 0 ? "+" : ""}
                            {stock.change_pct.toFixed(2)}%
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade panel */}
                <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
                  <h2 className="font-semibold text-gray-900 mb-4">Trade</h2>
                  {!selectedStock ? (
                    <p className="text-sm text-gray-400">Select a stock to trade.</p>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedStock.name}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{selectedStock.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTradeAction("buy")}
                          className={
                            tradeAction === "buy"
                              ? "border-2 border-[#3B5BDB] bg-blue-50 text-[#3B5BDB] rounded-xl py-2 text-sm font-medium"
                              : "border border-gray-200 text-gray-500 rounded-xl py-2 text-sm font-medium hover:border-[#3B5BDB] hover:text-[#3B5BDB]"
                          }
                        >
                          BUY
                        </button>
                        <button
                          type="button"
                          onClick={() => setTradeAction("sell")}
                          className={
                            tradeAction === "sell"
                              ? "border-2 border-red-500 bg-red-50 text-red-600 rounded-xl py-2 text-sm font-medium"
                              : "border border-gray-200 text-gray-500 rounded-xl py-2 text-sm font-medium hover:border-red-400 hover:text-red-500"
                          }
                        >
                          SELL
                        </button>
                      </div>

                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={tradeQuantity || ""}
                          onChange={(e) => setTradeQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="Number of units"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 flex justify-between text-sm">
                        <span className="text-gray-500">
                          {tradeAction === "buy" ? "Estimated cost" : "Estimated proceeds"}
                        </span>
                        <span className="font-medium text-gray-900">₹{estimatedAmount.toLocaleString()}</span>
                      </div>

                      {tradeError && <p className="text-xs text-red-500">{tradeError}</p>}

                      <button
                        type="button"
                        onClick={handleTrade}
                        disabled={
                          isTrading ||
                          tradeQuantity <= 0 ||
                          (tradeAction === "buy" && estimatedAmount > session.virtual_cash) ||
                          (tradeAction === "sell" && tradeQuantity > heldQty)
                        }
                        className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTrading ? "Placing Trade..." : "Confirm Trade"}
                      </button>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-400 mb-1">Your holding</p>
                        {heldQty > 0 ? (
                          <p className="text-sm text-gray-700">
                            {heldQty} shares @ avg ₹{heldAvgPrice.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">No position in {selectedStock.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
                {session.is_complete ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      Day {session.day_number} of {session.total_days} complete — Challenge finished!
                    </p>
                    <button
                      type="button"
                      onClick={handleReveal}
                      disabled={isRevealing}
                      className="bg-[#3B5BDB] text-white rounded-xl px-6 py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isRevealing ? "Revealing..." : "Challenge Complete! Reveal Results"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">
                      Day {session.day_number} of {session.total_days}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextDay}
                      disabled={isAdvancing}
                      className="bg-[#3B5BDB] text-white rounded-xl px-6 py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isAdvancing ? "Advancing..." : "End Day & Advance →"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Start screen */}
          {!isLoadingInitial && !revealData && !session && !error && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Trophy className="h-7 w-7" aria-hidden="true" />
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">Challenge Mode</h1>
                <p className="mt-2 text-gray-500">
                  Trade blind through a real historical market period, day by day — no dates, no hindsight.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Choose your difficulty</label>
                  <div className="grid grid-cols-2 gap-3">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDifficulty(d.id)}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left transition-colors",
                          selectedDifficulty === d.id
                            ? "border-[#3B5BDB] bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                            DIFFICULTY_BADGE[d.id]
                          )}
                        >
                          {d.label}
                        </span>
                        <p className="mt-2 text-xs text-gray-500">{d.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="balance" className="text-sm font-medium text-gray-700 mb-1 block">
                    Starting balance
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      id="balance"
                      type="number"
                      min={10000}
                      max={10000000}
                      value={startingBalanceInput}
                      onChange={(e) => setStartingBalanceInput(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="button"
                  onClick={() => handleStart(selectedDifficulty)}
                  disabled={isStarting}
                  className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isStarting ? "Starting..." : "Start Challenge"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
