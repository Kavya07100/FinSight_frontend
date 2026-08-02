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
  period?: string
}

interface MarketScenario {
  id: string
  name: string
  difficulty: string
  description: string
  context: string
  start_date: string
  end_date: string
  hint: string
  color: string
  badge_text?: string
}

// Frontend-only "scenario" -- start_date/end_date are unused placeholders
// since Live mode computes its date range dynamically (1 year ago to today)
// rather than using a fixed historical window like the other 4.
const LIVE_SCENARIO: MarketScenario = {
  id: "live",
  name: "Live Simulation",
  difficulty: "Live",
  description: "Most recent 12 months of real market data",
  context: "Simulate using actual current market conditions. This uses real NSE price data from the past 12 months — the same stocks you see in Market Watch today.",
  start_date: "",
  end_date: "",
  hint: "No historical scenario — practice with what's happening right now",
  color: "blue",
  badge_text: "LIVE",
}

const SCENARIO_COLOR_CLASSES: Record<string, { badge: string; border: string; banner: string }> = {
  green: { badge: "bg-green-100 text-green-700", border: "border-green-500 bg-green-50", banner: "bg-green-50 border-green-200 text-green-900" },
  yellow: { badge: "bg-yellow-100 text-yellow-700", border: "border-yellow-500 bg-yellow-50", banner: "bg-yellow-50 border-yellow-200 text-yellow-900" },
  red: { badge: "bg-red-100 text-red-700", border: "border-red-500 bg-red-50", banner: "bg-red-50 border-red-200 text-red-900" },
  purple: { badge: "bg-purple-100 text-purple-700", border: "border-purple-500 bg-purple-50", banner: "bg-purple-50 border-purple-200 text-purple-900" },
  blue: { badge: "bg-blue-100 text-blue-700", border: "border-blue-500 bg-blue-50", banner: "bg-blue-50 border-blue-200 text-blue-900" },
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

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

export default function SimulatePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState("")
  const [action, setAction] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice> | null>(null)
  const [scenarios, setScenarios] = useState<MarketScenario[]>([])
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("live")
  const [resultScenarioName, setResultScenarioName] = useState<string | null>(null)
  const [scenarioPortfolio, setScenarioPortfolio] = useState<ScenarioPortfolio | null>(null)
  const [balanceInput, setBalanceInput] = useState("100000")
  const [isSettingBalance, setIsSettingBalance] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      setError("Please complete onboarding before simulating trades.")
    }
    loadScenarios()
  }, [])

  // Live mode uses today's (delayed) prices; a historical scenario uses
  // average-of-period prices instead -- re-fetch whenever the selection
  // changes so Market Watch and the trade form's Current Price stay in sync.
  const loadMarketData = async (scenario: MarketScenario) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const url =
        scenario.id === "live"
          ? `${apiUrl}/market/prices`
          : `${apiUrl}/market/historical-prices?start_date=${scenario.start_date}&end_date=${scenario.end_date}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setMarketPrices(await res.json())
    } catch {
      // Leave marketPrices null -- the UI falls back to each stock's
      // hardcoded fallbackPrice/fallbackChangePct.
      setMarketPrices(null)
    }
  }

  const loadScenarios = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/market/scenarios`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setScenarios(await res.json())
    } catch {
      // Leave scenarios empty -- only the Live card renders, which is
      // already the default selection.
      setScenarios([])
    }
  }

  const loadScenarioPortfolio = async (uid: string, scenarioId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${uid}/scenario/${scenarioId}/portfolio`)
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

  const allScenarios = [LIVE_SCENARIO, ...scenarios]
  const selectedScenario = allScenarios.find((s) => s.id === selectedScenarioId) ?? LIVE_SCENARIO
  const isLiveMode = selectedScenario.id === "live"

  useEffect(() => {
    loadMarketData(selectedScenario)
  }, [selectedScenario.id, selectedScenario.start_date, selectedScenario.end_date])

  useEffect(() => {
    if (!userId) return
    loadScenarioPortfolio(userId, selectedScenario.id)
  }, [userId, selectedScenario.id])

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
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/scenario/${selectedScenario.id}/set-balance`,
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

  const handleResetScenario = async () => {
    if (!userId) return
    if (!window.confirm("Reset this scenario? All trades will be cleared and balance restored.")) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/scenario/${selectedScenario.id}/reset`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      await loadScenarioPortfolio(userId, selectedScenario.id)
      setResult(null)
      setResultScenarioName(null)
    } catch {
      setError("Something went wrong resetting this scenario. Please try again.")
    }
  }

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
      let simStart: Date
      let simEnd: Date
      if (isLiveMode) {
        simEnd = new Date()
        simStart = new Date(simEnd)
        simStart.setFullYear(simEnd.getFullYear() - 1)
      } else {
        simStart = new Date(selectedScenario.start_date)
        simEnd = new Date(selectedScenario.end_date)
      }
      const tradeDate = new Date(simStart.getTime() + 3 * 24 * 60 * 60 * 1000)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/simulate/sandbox`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers: [selectedStock],
            start_date: formatDate(simStart),
            end_date: formatDate(simEnd),
            starting_cash: scenarioPortfolio.virtual_cash,
            trades: [
              {
                ticker: selectedStock,
                action,
                quantity,
                trade_date: formatDate(tradeDate),
              },
            ],
            benchmark_ticker: "SPY",
            scenario_id: selectedScenario.id,
          }),
        }
      )

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: SimulationResult = await res.json()
      setResult(data)
      setResultScenarioName(isLiveMode ? null : selectedScenario.name)
      await loadScenarioPortfolio(userId, selectedScenario.id)
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
          </div>

          {/* Virtual Cash Banner */}
          <div className="bg-[#3B5BDB] text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">{selectedScenario.name} Balance</p>
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

          {/* Market Scenarios */}
          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-1">Market Scenario</h2>
            <p className="text-xs text-gray-400 mb-4">
              {isLiveMode ? "Practicing with real current market data" : "Practicing against a historical market period"}
            </p>

            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {allScenarios.map((scenario) => {
                const colors = SCENARIO_COLOR_CLASSES[scenario.color] ?? SCENARIO_COLOR_CLASSES.green
                const isSelected = scenario.id === selectedScenarioId
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`min-w-[240px] shrink-0 text-left rounded-2xl border-2 p-4 transition-colors sm:min-w-0 sm:shrink ${
                      isSelected ? colors.border : "border-transparent bg-white hover:border-gray-200"
                    }`}
                  >
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>
                      {scenario.badge_text ?? scenario.difficulty}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{scenario.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{scenario.description}</p>
                    <p className="mt-2 text-xs italic text-gray-400">{scenario.hint}</p>
                  </button>
                )
              })}
            </div>

            {isLiveMode ? (
              <div className={`mt-4 flex items-center gap-2 rounded-xl border p-4 text-sm ${SCENARIO_COLOR_CLASSES.blue.banner}`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <span className="font-medium">Live Simulation</span>
                <span>— Using real market data from the past 12 months</span>
              </div>
            ) : (
              <div className={`mt-4 rounded-xl border p-4 text-sm ${SCENARIO_COLOR_CLASSES[selectedScenario.color]?.banner ?? SCENARIO_COLOR_CLASSES.green.banner}`}>
                {selectedScenario.context}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">

            {/* Trade Form + Results */}
            <div className="space-y-6">
              {scenarioPortfolio && !scenarioPortfolio.is_started && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    Set your starting balance for this scenario
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
                  <p className="text-xs text-gray-400 mt-1 italic">
                    Tip: Use the same balance across scenarios to compare performance fairly.
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
                      <span className="text-gray-500">
                        {isLiveMode ? "Current Price" : "Price at Start of Period"}
                      </span>
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
                  <h2 className="font-semibold text-gray-900 mb-5">
                    Simulation Results{resultScenarioName ? ` — ${resultScenarioName}` : ""}
                  </h2>
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
                      <p className="text-xs text-gray-500">vs Benchmark (SPY)</p>
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
                        ? `Your trade outperformed SPY by ${result.metrics.outperformance_pct.toFixed(2)}%`
                        : `Your trade underperformed SPY by ${Math.abs(result.metrics.outperformance_pct).toFixed(2)}%`}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleResetScenario}
                    className="mt-4 w-full text-sm font-medium text-red-500 hover:text-red-600 text-center"
                  >
                    Reset this scenario
                  </button>
                </div>
              )}
            </div>

            {/* Market Watch */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900">Market Watch</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLiveMode
                  ? "Delayed 15 min"
                  : `Period Return${marketPrices ? ` · ${Object.values(marketPrices)[0]?.period ?? ""}` : ""}`}
              </p>
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
