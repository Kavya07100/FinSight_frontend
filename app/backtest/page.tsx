"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Sidebar } from "@/components/dashboard/sidebar"

const STOCK_TICKERS: Record<string, string> = {
  "Nifty 50": "NIFTYBEES.NS",
  "Reliance Industries": "RELIANCE.NS",
  "HDFC Bank": "HDFCBANK.NS",
  "Infosys": "INFY.NS",
  "Tata Motors": "TMPV.NS",
}
const STOCK_NAMES = Object.keys(STOCK_TICKERS)

const TIME_PERIODS = ["1 Year", "3 Years"]
const AVAILABLE_STRATEGIES = ["SIP (Monthly Investment)", "Buy and Hold"]

const DATA_START = new Date("2022-01-01")

const CURRENT_YEAR = new Date().getFullYear()

// The option's underlying value stays the plain period string
// (getDateRange/getSipTradeCount switch on it), this only changes the
// label the user sees.
const formatPeriodLabel = (period: string) =>
  period === "1 Year"
    ? `1 Year (${CURRENT_YEAR - 1}–${CURRENT_YEAR})`
    : `3 Years (${CURRENT_YEAR - 3}–${CURRENT_YEAR})`

interface TradeOut {
  ticker: string
  action: "buy" | "sell"
  quantity: number
  trade_date: string
}

interface BenchmarkMetrics {
  ticker: string
  final_value: number
  total_return_pct: number
}

interface DailyValue {
  date: string
  value: number
}

interface ExecutedTrade {
  ticker: string
  action: "buy" | "sell"
  quantity: number
  trade_date: string
  price: number
  cost: number
}

interface SimulationMetrics {
  final_value: number
  total_return_pct: number
  max_drawdown_pct: number
  daily_values: DailyValue[]
  executed_trades: ExecutedTrade[]
  benchmark: BenchmarkMetrics | null
  outperformance_pct: number | null
}

interface SimulationResult {
  id: string
  metrics: SimulationMetrics
}

interface YearlyRow {
  year: string
  invested: number
  value: number
  returnPct: number
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`

const formatSignedPct = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

const getDateRange = (period: string) => {
  const today = new Date()
  const years = period === "1 Year" ? 1 : 3
  const start = new Date(today)
  start.setFullYear(today.getFullYear() - years)
  return { start: start < DATA_START ? new Date(DATA_START) : start, end: today }
}

const getSipTradeCount = (period: string) => {
  if (period === "1 Year") return 12
  return 36 // 3 Years
}

const buildYearlyBreakdown = (
  dailyValues: DailyValue[],
  executedTrades: ExecutedTrade[],
  totalStartingCash: number
): YearlyRow[] => {
  const lastValueByYear = new Map<string, number>()
  for (const row of dailyValues) {
    lastValueByYear.set(row.date.slice(0, 4), row.value)
  }

  return Array.from(lastValueByYear.keys())
    .sort()
    .map((year) => {
      const yearEnd = new Date(`${year}-12-31`)

      // Real cash actually spent on buys by this point -- not an
      // approximation. For strategies that fund the whole backtest with
      // cash upfront (SIP), most of totalStartingCash sits idle waiting
      // for future trade dates; that idle cash is still counted in
      // totalValue (cash + holdings) but was never actually "invested."
      const cashSpent = executedTrades
        .filter((t) => t.action === "buy" && new Date(t.trade_date) <= yearEnd)
        .reduce((sum, t) => sum + t.cost, 0)

      // totalValue is the full portfolio value (cash + holdings) at
      // year-end, same basis as the Final Value summary card -- so the
      // last row here always reconciles with that card. Return % still
      // measures performance on capital actually deployed (holdings vs.
      // cash spent), so idle cash doesn't dilute/inflate it.
      const totalValue = lastValueByYear.get(year) ?? 0
      const idleCash = totalStartingCash - cashSpent
      const holdingsValue = totalValue - idleCash
      const returnPct = cashSpent > 0 ? ((holdingsValue - cashSpent) / cashSpent) * 100 : 0

      return { year, invested: cashSpent, value: totalValue, returnPct }
    })
}

export default function BacktestPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState(STOCK_NAMES[0])
  const [strategy, setStrategy] = useState(AVAILABLE_STRATEGIES[0])
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS[0])
  const [initialInvestment, setInitialInvestment] = useState(10000)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [lastStartingCash, setLastStartingCash] = useState(0)

  useEffect(() => {
    setUserId(localStorage.getItem("finsight_user_id"))
  }, [])

  const handleRunBacktest = async () => {
    if (!userId) {
      setError("Please complete onboarding before running a backtest.")
      return
    }
    if (!AVAILABLE_STRATEGIES.includes(strategy)) {
      setError("This strategy is coming soon.")
      return
    }

    setError(null)
    setIsLoading(true)
    setResult(null)

    try {
      const ticker = STOCK_TICKERS[selectedStock]
      const { start, end } = getDateRange(timePeriod)

      let trades: TradeOut[]
      let startingCash: number

      if (strategy === "Buy and Hold") {
        const tradeDate = new Date(start)
        tradeDate.setDate(tradeDate.getDate() + 3)
        trades = [{ ticker, action: "buy", quantity: 1, trade_date: formatDate(tradeDate) }]
        startingCash = initialInvestment
      } else {
        const numTrades = getSipTradeCount(timePeriod)
        trades = Array.from({ length: numTrades }, (_, n) => {
          const tradeDate = new Date(start)
          tradeDate.setDate(tradeDate.getDate() + n * 30)
          return { ticker, action: "buy" as const, quantity: 1, trade_date: formatDate(tradeDate) }
        })
        startingCash = initialInvestment * numTrades
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/simulate/sandbox`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers: [ticker],
            start_date: formatDate(start),
            end_date: formatDate(end),
            starting_cash: startingCash,
            trades,
            benchmark_ticker: "SPY",
          }),
        }
      )

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: SimulationResult = await res.json()
      setResult(data)
      setLastStartingCash(startingCash)
    } catch {
      setError("Something went wrong while running the backtest. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = (result?.metrics.daily_values ?? [])
    .filter((_, i, arr) => i % 5 === 0 || i === arr.length - 1)
    .map((row) => ({
      label: new Date(row.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      value: row.value,
    }))

  const yearlyBreakdown = result
    ? buildYearlyBreakdown(result.metrics.daily_values, result.metrics.executed_trades, lastStartingCash)
    : []

  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Strategy Backtest</h1>
            <p className="text-gray-500 mt-1">Test how your strategy would have performed on historical data</p>
          </div>

          <div className="grid grid-cols-3 gap-8">

            {/* Strategy Config */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Configure Strategy</h2>
              <div className="space-y-4">

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Select Stock / Index</label>
                  <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  >
                    {STOCK_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Strategy</label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  >
                    <option value="SIP (Monthly Investment)">SIP (Monthly Investment)</option>
                    <option value="Buy and Hold">Buy and Hold</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Time Period</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  >
                    {TIME_PERIODS.map((period) => (
                      <option key={period} value={period}>{formatPeriodLabel(period)}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Historical data covers January 2022 to present
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Initial Investment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={initialInvestment || ""}
                      onChange={(e) => setInitialInvestment(e.target.value === "" ? 0 : Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunBacktest}
                  disabled={isLoading || !userId || initialInvestment <= 0}
                  className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Running..." : "Run Backtest"}
                </button>

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              </div>
            </div>

            {/* Results */}
            <div className="col-span-2 space-y-6">

              {/* Result Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Return",
                    value: result ? formatSignedPct(result.metrics.total_return_pct) : "—",
                    color: !result ? "text-gray-900" : result.metrics.total_return_pct >= 0 ? "text-green-600" : "text-red-500",
                  },
                  {
                    label: "Final Value",
                    value: result ? formatCurrency(result.metrics.final_value) : "—",
                    color: "text-gray-900",
                  },
                  {
                    label: "Max Drawdown",
                    value: result ? `-${result.metrics.max_drawdown_pct.toFixed(1)}%` : "—",
                    color: "text-red-500",
                  },
                  {
                    label: "vs SPY",
                    value: result?.metrics.benchmark
                      ? formatSignedPct(result.metrics.benchmark.total_return_pct)
                      : "—",
                    color:
                      result?.metrics.benchmark && result.metrics.benchmark.total_return_pct >= 0
                        ? "text-green-600"
                        : "text-red-500",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Portfolio Value Over Time</h3>
                {result && chartData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          interval={Math.max(0, Math.floor(chartData.length / 6))}
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          width={56}
                          domain={["auto", "auto"]}
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
                        />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line
                          dataKey="value"
                          type="monotone"
                          stroke="#3B5BDB"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Chart will render after running backtest</p>
                  </div>
                )}
              </div>

              {/* Yearly Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Yearly Breakdown</h3>
                </div>
                {yearlyBreakdown.length === 0 ? (
                  <p className="p-8 text-center text-sm text-gray-500">
                    Run a backtest to see the yearly breakdown.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Year</th>
                        <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Invested</th>
                        <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Value</th>
                        <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Return</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {yearlyBreakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatCurrency(row.invested)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatCurrency(row.value)}
                          </td>
                          <td
                            className={`px-5 py-4 text-right text-sm font-medium ${
                              row.returnPct >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {formatSignedPct(row.returnPct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
