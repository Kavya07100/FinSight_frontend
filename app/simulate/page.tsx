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

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

export default function SimulatePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [currentSavings, setCurrentSavings] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const [selectedStock, setSelectedStock] = useState("")
  const [action, setAction] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice> | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("finsight_user_id")
    if (storedUserId) {
      setUserId(storedUserId)
      loadUserData(storedUserId)
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

  const loadUserData = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const [userRes, portfolioRes] = await Promise.allSettled([
      fetch(`${apiUrl}/users/${id}`),
      fetch(`${apiUrl}/users/${id}/portfolio`),
    ])

    if (userRes.status === "fulfilled" && userRes.value.ok) {
      const user = await userRes.value.json()
      setCurrentSavings(user.current_savings ?? 0)
    }

    if (portfolioRes.status === "fulfilled" && portfolioRes.value.ok) {
      const portfolio = await portfolioRes.value.json()
      setTotalInvested(portfolio.holdings && portfolio.holdings.length > 0 ? portfolio.total_value : 0)
    }
  }

  const availableCash = (currentSavings ?? 0) - totalInvested

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
    if (currentSavings === null) {
      setError("Still loading your account details. Please try again in a moment.")
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
      const today = new Date()
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(today.getFullYear() - 1)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/simulate/sandbox`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers: [selectedStock],
            start_date: formatDate(oneYearAgo),
            end_date: formatDate(today),
            starting_cash: currentSavings,
            trades: [
              {
                ticker: selectedStock,
                action,
                quantity,
                trade_date: formatDate(new Date(oneYearAgo.getTime() + 3 * 24 * 60 * 60 * 1000)),
              },
            ],
            benchmark_ticker: "SPY",
          }),
        }
      )

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: SimulationResult = await res.json()
      setResult(data)
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
            <p className="text-gray-500 mt-1">Practice investing with your virtual capital — no real money involved</p>
          </div>

          {/* Virtual Cash Banner */}
          <div className="bg-[#3B5BDB] text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Available Virtual Cash</p>
              <p className="text-3xl font-bold mt-1">₹{availableCash.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Invested</p>
              <p className="text-2xl font-bold mt-1">₹{totalInvested.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">

            {/* Trade Form + Results */}
            <div className="space-y-6">
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

                  <button
                    onClick={handleConfirmTrade}
                    disabled={isLoading || !selectedStock || quantity <= 0 || !userId || currentSavings === null}
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
