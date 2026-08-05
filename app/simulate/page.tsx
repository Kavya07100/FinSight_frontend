"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

// fallbackPrice/fallbackChangePct are used until GET /market/prices resolves,
// and if that fetch fails outright.
const MARKET_STOCKS = [
  { name: "Reliance Industries", symbol: "RELIANCE", ticker: "RELIANCE.NS", fallbackPrice: 2820, fallbackChangePct: 1.2 },
  { name: "HDFC Bank", symbol: "HDFCBANK", ticker: "HDFCBANK.NS", fallbackPrice: 1624, fallbackChangePct: 0.8 },
  { name: "Infosys", symbol: "INFY", ticker: "INFY.NS", fallbackPrice: 2120, fallbackChangePct: -0.4 },
  { name: "Tata Motors", symbol: "TATAMOTORS", ticker: "TMPV.NS", fallbackPrice: 945, fallbackChangePct: 2.1 },
  { name: "Nifty 50 ETF", symbol: "NIFTYBEES", ticker: "NIFTYBEES.NS", fallbackPrice: 248, fallbackChangePct: 0.6 },
  { name: "State Bank of India", symbol: "SBIN", ticker: "SBIN.NS", fallbackPrice: 498, fallbackChangePct: -0.9 },
  { name: "Wipro", symbol: "WIPRO", ticker: "WIPRO.NS", fallbackPrice: 542, fallbackChangePct: 1.5 },
  { name: "Bajaj Finance", symbol: "BAJFINANCE", ticker: "BAJFINANCE.NS", fallbackPrice: 7240, fallbackChangePct: 0.3 },
] as const

interface MarketPrice {
  price: number
  change_pct: number
  name: string
}

interface BenchmarkMetrics {
  ticker: string
  final_value: number
  total_return_pct: number
}

interface SimulationMetrics {
  final_value: number
  total_return_pct: number
  max_drawdown_pct: number
  daily_values: { date: string; value: number }[]
  benchmark: BenchmarkMetrics | null
  outperformance_pct: number | null
}

interface SimulationResult {
  id: string
  user_id: string
  mode: string
  trades: unknown[]
  metrics: SimulationMetrics
  started_at: string
  ended_at: string | null
}

interface ScenarioPortfolio {
  scenario_id: string
  virtual_cash: number
  starting_balance: number
  is_started: boolean
  total_invested: number
  holdings: unknown[]
  overall_return_pct: number
}

// This page only ever simulates against the live scenario (most recent 12
// months of real NSE data) -- "live" is the scenario_id the backend uses to
// scope cash/holdings for it.
const SCENARIO_ID = "live"

// API wants YYYY-MM-DD; the info banner wants a human-readable date.
const formatApiDate = (date: Date) => date.toISOString().slice(0, 10)
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

export default function SimulatePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState("")
  const [action, setAction] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice> | null>(null)
  const [scenarioPortfolio, setScenarioPortfolio] = useState<ScenarioPortfolio | null>(null)
  const [balanceInput, setBalanceInput] = useState("100000")
  const [isSettingBalance, setIsSettingBalance] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  // NIFTYBEES.NS (Nifty 50) is the default benchmark for Indian users; SPY
  // (S&P 500) is offered as the global alternative.
  const [benchmarkTicker, setBenchmarkTicker] = useState<"SPY" | "NIFTYBEES.NS">("NIFTYBEES.NS")

  // The past 12 months, computed fresh each render -- shown in the info
  // banner below and reused as the simulation's actual date range so the
  // two never drift apart.
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setFullYear(endDate.getFullYear() - 1)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      setError("Please complete onboarding before simulating trades.")
    }
    loadMarketPrices()
  }, [])

  const loadMarketPrices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/market/prices`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setMarketPrices(await res.json())
    } catch {
      // Leave marketPrices null -- the UI falls back to each stock's
      // hardcoded fallbackPrice/fallbackChangePct.
      setMarketPrices(null)
    }
  }

  const loadScenarioPortfolio = async (uid: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${uid}/scenario/${SCENARIO_ID}/portfolio`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data: ScenarioPortfolio = await res.json()
      setScenarioPortfolio(data)
      setBalanceInput(String(data.starting_balance))
    } catch {
      setScenarioPortfolio(null)
    }
  }

  const availableCash = scenarioPortfolio?.virtual_cash ?? 0
  const totalInvested = scenarioPortfolio?.total_invested ?? 0

  useEffect(() => {
    if (!userId) return
    loadScenarioPortfolio(userId)
  }, [userId])

  const handleSetBalance = async () => {
    if (!userId) return
    const value = Number(balanceInput)
    if (!Number.isFinite(value) || value < 10000 || value > 10000000) {
      setBalanceError("Enter an amount between ₹10,000 and ₹1,00,00,000.")
      return
    }

    setBalanceError(null)
    setIsSettingBalance(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/scenario/${SCENARIO_ID}/set-balance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ starting_balance: value }),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`)
      }
      setScenarioPortfolio(await res.json())
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : "Something went wrong setting your balance.")
    } finally {
      setIsSettingBalance(false)
    }
  }

  const handleResetSimulation = async () => {
    if (!userId) return
    if (!window.confirm("Reset your simulation? All trades will be cleared and balance restored.")) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/scenario/${SCENARIO_ID}/reset`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      await loadScenarioPortfolio(userId)
      setResult(null)
    } catch {
      setError("Something went wrong resetting your simulation. Please try again.")
    }
  }

  // Prefer the ticker the simulation actually ran against; falls back to
  // the current selector state before a result exists.
  const benchmarkLabel = (result?.metrics.benchmark?.ticker ?? benchmarkTicker).replace(".NS", "")

  const selectedStockInfo = MARKET_STOCKS.find((s) => s.ticker === selectedStock)
  const currentPrice = marketPrices?.[selectedStock]?.price ?? selectedStockInfo?.fallbackPrice ?? 0
  const estimatedTotal = currentPrice * quantity
  const afterTradeCash =
    action === "buy" ? availableCash - estimatedTotal : availableCash + estimatedTotal

  const handleConfirmTrade = async () => {
    if (!userId) {
      setError("Please complete onboarding before simulating trades.")
      return
    }
    if (!scenarioPortfolio) {
      setError("Still loading your scenario portfolio. Please try again in a moment.")
      return
    }
    if (!selectedStock || quantity <= 0) {
      setError("Select a stock and enter a quantity greater than zero.")
      return
    }

    setError(null)
    setIsLoading(true)
    setResult(null)

    try {
      const tradeDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/simulate/sandbox`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers: [selectedStock],
            start_date: formatApiDate(startDate),
            end_date: formatApiDate(endDate),
            starting_cash: scenarioPortfolio.virtual_cash,
            trades: [
              {
                ticker: selectedStock,
                action,
                quantity,
                trade_date: formatApiDate(tradeDate),
              },
            ],
            benchmark_ticker: benchmarkTicker,
            scenario_id: SCENARIO_ID,
          }),
        }
      )

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: SimulationResult = await res.json()
      setResult(data)

      // Auto-trigger behavior analysis
      const logId = data.id  // simulation log ID from response
      if (logId && userId) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/simulate/${logId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch(() => {})  // fire and forget, don't block UI
      }

      await loadScenarioPortfolio(userId)
    } catch {
      setError("Something went wrong while running your simulation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Simulate a Trade</h1>
            <p className="text-gray-500 mt-1">Test investment strategies against historical market data — see what would have worked</p>
            <p className="text-sm text-gray-500 mt-2">
              Using real NSE market data from {formatDate(startDate)} to {formatDate(endDate)}
              {" "}· Prices sourced from Yahoo Finance
            </p>
          </div>

          {/* Virtual Cash Banner */}
          <div className="bg-[#3B5BDB] text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Live Simulation Balance</p>
              <p className="text-3xl font-bold mt-1">₹{availableCash.toLocaleString()}</p>
              {scenarioPortfolio && (
                <p className="text-blue-200 text-xs mt-1">
                  Started with ₹{scenarioPortfolio.starting_balance.toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Invested</p>
              <p className="text-2xl font-bold mt-1">₹{totalInvested.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">

            {/* Trade Form + Results */}
            <div className="space-y-6">
              {scenarioPortfolio && !scenarioPortfolio.is_started && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    Set your starting balance
                  </h2>
                  <div className="flex gap-3 mt-3">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={10000}
                        max={10000000}
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSetBalance}
                      disabled={isSettingBalance}
                      className="shrink-0 bg-[#3B5BDB] text-white rounded-xl px-5 py-3 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettingBalance ? "Setting..." : "Set Balance"}
                    </button>
                  </div>
                  {balanceError && (
                    <p className="text-xs text-red-500 mt-2">{balanceError}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    This cannot be changed once you make your first trade.
                  </p>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Place a Trade</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Search Stock / Fund</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedStockInfo?.name ?? ""}
                      placeholder="e.g. Reliance, HDFC, Nifty 50..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0] cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Order Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAction("buy")}
                        className={
                          action === "buy"
                            ? "border-2 border-[#3B5BDB] bg-blue-50 text-[#3B5BDB] rounded-xl py-2 text-sm font-medium"
                            : "border border-gray-200 text-gray-500 rounded-xl py-2 text-sm font-medium hover:border-[#3B5BDB] hover:text-[#3B5BDB]"
                        }
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction("sell")}
                        className={
                          action === "sell"
                            ? "border-2 border-red-500 bg-red-50 text-red-600 rounded-xl py-2 text-sm font-medium"
                            : "border border-gray-200 text-gray-500 rounded-xl py-2 text-sm font-medium hover:border-red-400 hover:text-red-500"
                        }
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      value={quantity || ""}
                      onChange={(e) => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                      placeholder="Number of units"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Current Price</span>
                      <span className="font-medium text-gray-900">₹{currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Estimated Total</span>
                      <span className="font-medium text-gray-900">₹{estimatedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">After Trade Cash</span>
                      <span className="font-medium text-green-600">₹{afterTradeCash.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">Compare against</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="benchmark"
                          checked={benchmarkTicker === "SPY"}
                          onChange={() => setBenchmarkTicker("SPY")}
                          className="accent-[#3B5BDB]"
                        />
                        SPY (S&amp;P 500 — Global benchmark)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="benchmark"
                          checked={benchmarkTicker === "NIFTYBEES.NS"}
                          onChange={() => setBenchmarkTicker("NIFTYBEES.NS")}
                          className="accent-[#3B5BDB]"
                        />
                        NIFTYBEES (Nifty 50 — Indian benchmark)
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmTrade}
                    disabled={isLoading || !selectedStock || quantity <= 0 || !userId || !scenarioPortfolio}
                    className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Placing Trade..." : "Confirm Trade"}
                  </button>

                  {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    This is a simulated trade. No real money is used.
                  </p>
                </div>
              </div>

              {result && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-5">Simulation Results</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">Final Portfolio Value</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ₹{result.metrics.final_value.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">Total Return</p>
                      <p
                        className={`text-lg font-bold mt-1 ${
                          result.metrics.total_return_pct >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {result.metrics.total_return_pct.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">Max Drawdown</p>
                      <p className="text-lg font-bold text-red-500 mt-1">
                        {result.metrics.max_drawdown_pct.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">vs Benchmark ({benchmarkLabel})</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {result.metrics.benchmark
                          ? `${result.metrics.benchmark.total_return_pct.toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {result.metrics.outperformance_pct !== null && (
                    <p
                      className={`mt-4 text-sm font-medium text-center ${
                        result.metrics.outperformance_pct >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {result.metrics.outperformance_pct >= 0
                        ? `Your trade outperformed ${benchmarkLabel} by ${result.metrics.outperformance_pct.toFixed(2)}%`
                        : `Your trade underperformed ${benchmarkLabel} by ${Math.abs(result.metrics.outperformance_pct).toFixed(2)}%`}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="mt-4 w-full text-sm font-medium text-red-500 hover:text-red-600 text-center"
                  >
                    Reset simulation
                  </button>
                </div>
              )}
            </div>

            {/* Market Watch */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900">Market Watch</h2>
              <p className="text-xs text-gray-400 mt-0.5">Delayed 15 min</p>
              <div className="space-y-3 mt-5">
                {MARKET_STOCKS.map((stock) => {
                  const live = marketPrices?.[stock.ticker]
                  const price = live?.price ?? stock.fallbackPrice
                  const changePct = live?.change_pct ?? stock.fallbackChangePct
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock.ticker)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-colors ${
                        stock.ticker === selectedStock
                          ? "border-[#3B5BDB] bg-blue-50"
                          : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                        <p className="text-xs text-gray-400">{stock.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{price.toLocaleString()}</p>
                        <p className={`text-xs font-medium ${changePct >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {changePct >= 0 ? "+" : ""}
                          {changePct.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
