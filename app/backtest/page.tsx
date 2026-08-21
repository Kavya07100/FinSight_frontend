"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Sidebar } from "@/components/dashboard/sidebar"

const BACKTEST_ANALYSIS: Record<string, Record<string, Record<string, {
  factual: string,
  behavioral: string,
  verdict: string
}>>> = {
  "Nifty 50": {
    "1 Year": {
      "SIP (Monthly Investment)": {
        factual: "Nifty 50 delivered modest returns in 2025-26 as FII outflows and global uncertainty from US tariff policies weighed on Indian large-caps. Defensive sectors like FMCG and pharma outperformed cyclicals. The index remained range-bound for much of 2025 before a recovery in early 2026.",
        behavioral: "SIP into Nifty 50 is India's most recommended strategy for retail investors. By investing ₹833 every month regardless of price, you bought more units when prices were low and fewer when high — rupee cost averaging in action. The modest return reflects the market environment, not the strategy's weakness.",
        verdict: "Nifty 50 SIP remains the most reliable long-term strategy for retail investors. One year is too short to judge — this strategy rewards patience over 5+ years."
      },
      "Buy and Hold": {
        factual: "Buying Nifty 50 (NIFTYBEES) at the start of 2025 and holding through 2026 exposed you to the full range of market movements. The 2025 market faced headwinds from global slowdown fears and FII selling before recovering.",
        behavioral: "Buy and Hold requires conviction to sit through volatility. The 1-year period tested investor patience. Those who checked their portfolio daily likely felt pressure to sell during dips — this is exactly the emotional discipline that separates successful long-term investors.",
        verdict: "For a 1-year horizon, Buy and Hold of Nifty 50 is straightforward. Over 10+ years, this strategy has historically returned 12-15% annually in India."
      }
    },
    "3 Years": {
      "SIP (Monthly Investment)": {
        factual: "The 2023-26 period included the 2022 recovery, strong bull runs in 2023 and 2024, and mixed conditions in 2025. Nifty 50 crossed 25,000 for the first time in 2024, driven by strong domestic consumption, FII inflows returning after 2022 outflows, and India's GDP growth outpacing global peers.",
        behavioral: "A 3-year SIP demonstrates rupee cost averaging at its best — you bought Nifty units cheaply during 2023 dips and through the 2024 rally. This period rewards the investor who invested consistently without trying to time the market.",
        verdict: "3-year Nifty SIP is the textbook case for why systematic investing beats market timing for retail investors. The data confirms AMFI and SEBI's recommendation."
      },
      "Buy and Hold": {
        factual: "Buying Nifty 50 in August 2023 and holding to 2026 captured the 2023-24 bull market that took Sensex from 65,000 to 85,000. India became one of the world's best-performing major markets during this period, driven by strong earnings growth and geopolitical tailwinds.",
        behavioral: "The 3-year Buy and Hold investor who didn't panic during 2024's brief corrections was rewarded significantly. This period illustrates why long-term conviction in quality indices pays off — the investor who stayed invested outperformed the one who tried to time exits.",
        verdict: "Buy and Hold of Nifty 50 over 3 years validates the index investing thesis for India. The key lesson: time in the market beats timing the market."
      }
    }
  },
  "Reliance Industries": {
    "1 Year": {
      "SIP (Monthly Investment)": {
        factual: "Reliance Industries in 2025-26 faced mixed signals — Jio's 5G expansion continued while retail and O2C (Oil to Chemicals) segments faced margin pressure from global crude volatility. The stock consolidated after reaching all-time highs in 2024.",
        behavioral: "SIP into a single large-cap stock concentrates risk significantly compared to an index. Your HHI (portfolio concentration index) would be 1.0 — maximum concentration. Reliance is India's largest company but single-stock SIP lacks the diversification protection of index investing.",
        verdict: "Reliance is a quality business but single-stock SIP carries concentration risk. Consider diversifying across 4-5 sectors rather than one company."
      },
      "Buy and Hold": {
        factual: "Reliance Industries stock movement in 2025-26 was influenced by quarterly earnings, crude oil prices, Jio subscriber growth, and retail expansion. The conglomerate's performance reflects both energy sector dynamics and India's consumption story.",
        behavioral: "Holding a single stock through a year requires significantly more conviction than holding an index. Every quarterly result, news headline, and analyst report tests your resolve. This is why diversification exists — to reduce the emotional burden of single-stock investing.",
        verdict: "Reliance Buy and Hold is suitable for investors who understand the business deeply. For beginners, Nifty 50 provides Reliance exposure with diversification."
      }
    },
    "3 Years": {
      "SIP (Monthly Investment)": {
        factual: "Reliance Industries 2023-26 saw the completion of 5G rollout for Jio, continued retail expansion with JioMart, and strategic moves in new energy (solar, green hydrogen). The stock reflected India's largest conglomerate navigating multiple business transformations simultaneously.",
        behavioral: "A 3-year SIP into Reliance captures multiple business cycles. The stock's volatility — driven by crude prices, regulatory changes, and quarterly results — tests the SIP investor's discipline to continue investing through both peaks and troughs.",
        verdict: "3-year Reliance SIP reflects the long-term growth story of India's most diversified corporation. Compare against Nifty 50 to see if picking Reliance added value over the index."
      },
      "Buy and Hold": {
        factual: "Reliance over 2023-26 transformed from an O2C-heavy company to a more balanced conglomerate with Jio, Retail, and New Energy contributing increasingly. This transformation story attracted significant FII interest but also meant the stock's valuation depended heavily on future earnings projections.",
        behavioral: "A 3-year Buy and Hold investor in Reliance experienced the psychological journey of a conglomerate transformation. The patient investor who understood the business was rewarded. This illustrates why understanding what you own matters more than chart patterns.",
        verdict: "Reliance 3-year Buy and Hold captured India's technology-retail-energy convergence story. Key learning: investing in businesses you understand reduces panic selling."
      }
    }
  },
  "HDFC Bank": {
    "1 Year": {
      "SIP (Monthly Investment)": {
        factual: "HDFC Bank in 2025-26 continued its post-merger integration with HDFC Ltd. The bank focused on deposit mobilization, reducing its loan-to-deposit ratio, and improving net interest margins. The banking sector faced headwinds from RBI's tighter liquidity management.",
        behavioral: "Banking stocks are sensitive to RBI policy decisions and credit cycles. SIP into HDFC Bank means buying through both RBI rate hike and cut cycles. The investor who stayed committed to monthly SIP despite banking sector news headlines demonstrates the discipline that long-term wealth building requires.",
        verdict: "HDFC Bank is India's most respected private bank with consistent return on equity above 16%. 1-year SIP captures near-term dynamics but misses the long-term compounding story."
      },
      "Buy and Hold": {
        factual: "HDFC Bank's 2025-26 performance was shaped by credit growth rates, NIM (net interest margin) trends, and the ongoing merger integration. The bank's conservative lending practices meant lower growth but higher quality loan books compared to peers.",
        behavioral: "HDFC Bank is considered a 'boring but reliable' stock in India — it rarely excites but rarely disappoints over long periods. Buy and Hold here tests whether you can resist switching to more exciting stocks when neighbors brag about 30% returns from newer growth companies.",
        verdict: "HDFC Bank Buy and Hold rewards patience. The bank's consistent dividend and steady earnings growth make it suitable for conservative investors. Compare its return to Nifty 50 for the true value of stock picking."
      }
    },
    "3 Years": {
      "SIP (Monthly Investment)": {
        factual: "2023-26 was transformative for HDFC Bank — the merger with HDFC Ltd completed in 2023 created India's largest private sector bank by assets. Integration challenges temporarily pressured the stock in 2023-24 before the market recognized the merged entity's earnings potential in 2025-26.",
        behavioral: "The 3-year SIP investor who continued buying HDFC Bank through the post-merger uncertainty and stock underperformance in 2023-24 was rewarded as the integration narrative cleared. This is the classic behavioral finance lesson: patient investors who maintain conviction through short-term noise capture long-term value.",
        verdict: "3-year HDFC Bank SIP captured one of India's most significant banking mergers. The investor who stayed invested through the uncertainty period demonstrates the behavioral discipline that separates wealth creators from wealth destroyers."
      },
      "Buy and Hold": {
        factual: "Buying HDFC Bank at the start of 2023 and holding through 2026 meant experiencing the post-merger volatility, eventual integration success, and the bank's emergence as an even more formidable institution. The merger created significant one-time costs but positioned the bank for superior long-term profitability.",
        behavioral: "HDFC Bank's 3-year journey tested the Buy and Hold investor's conviction through genuine uncertainty — a major merger with integration risks, regulatory scrutiny, and temporary underperformance versus peers. Those who understood the long-term thesis held. Those focused on short-term price action sold — often at the wrong time.",
        verdict: "HDFC Bank 3-year Buy and Hold is a case study in how understanding business fundamentals enables conviction through short-term volatility."
      }
    }
  },
  "Infosys": {
    "1 Year": {
      "SIP (Monthly Investment)": {
        factual: "Infosys in 2025-26 navigated the global IT spending slowdown as US and European enterprise clients reduced discretionary tech budgets amid economic uncertainty. Revenue growth moderated but margins improved as the company right-sized workforce and focused on AI-led service offerings.",
        behavioral: "IT stocks are highly sensitive to global macroeconomic conditions — specifically US GDP growth and enterprise tech spending. SIP into Infosys exposes you to currency risk (dollar-rupee), US recession risk, and technology cycle risk simultaneously. Diversification into non-IT sectors would have reduced this concentration.",
        verdict: "Infosys 1-year SIP reflects global IT cycle dynamics. The stock is suitable for investors who understand that IT company revenues move with global economic cycles, not India's domestic growth story."
      },
      "Buy and Hold": {
        factual: "Infosys 2025-26 was shaped by AI-driven service demand — clients wanted AI implementation, cloud migration, and data analytics, partly offsetting the broad discretionary IT slowdown. The company's investment in AI capabilities positioned it for the next growth cycle.",
        behavioral: "Holding Infosys through US tech spending uncertainty requires understanding that IT company fundamentals are different from Indian consumer or banking stocks. The investor who sold during the slowdown likely missed the AI-driven recovery. Sector understanding drives conviction.",
        verdict: "Infosys Buy and Hold rewards investors who understand global tech cycles and can hold through US economic uncertainty. Compare with Nifty 50 to assess whether IT sector concentration added value."
      }
    },
    "3 Years": {
      "SIP (Monthly Investment)": {
        factual: "Infosys 2023-26 traversed a complete IT cycle — post-COVID tech spending boom ended, discretionary budgets were cut in 2023-24, and AI-driven demand created a new growth wave in 2025-26. The company maintained its industry-leading margins through efficient cost management.",
        behavioral: "SIP through a complete IT cycle (boom, slowdown, recovery) is a masterclass in why consistent investing beats market timing. Investors who stopped SIP during the 2023-24 slowdown missed buying Infosys cheaply before the AI-demand recovery.",
        verdict: "3-year Infosys SIP captures a complete technology cycle. The key behavioral lesson: sector cycles are unpredictable but consistent SIP eliminates the need to predict them."
      },
      "Buy and Hold": {
        factual: "Buying Infosys in 2023 and holding through 2026 meant experiencing the post-COVID IT boom ending, a painful slowdown as hyperscaler capex cuts affected IT services, followed by an AI-services recovery. The 3-year period tested conviction in India's largest IT exporter.",
        behavioral: "Infosys 3-year Buy and Hold investors faced the psychological challenge of holding through a sector-wide slowdown when peers were rotating into banking and consumer stocks. Those who maintained conviction based on Infosys's competitive position in AI services were eventually rewarded.",
        verdict: "Infosys 3-year Buy and Hold illustrates the risk of sector concentration — IT underperformed the broader index for 18 months before recovering. Compare returns with Nifty 50 to see the true cost or benefit of sector conviction."
      }
    }
  },
  "Tata Motors": {
    "1 Year": {
      "SIP (Monthly Investment)": {
        factual: "Tata Motors (TMPV.NS post-demerger) in 2025-26 reflected the performance of its commercial vehicles and electric vehicle businesses after the Jaguar Land Rover entity was separated. The EV transition and commercial vehicle cycle drove the stock's movement.",
        behavioral: "Tata Motors is one of India's most volatile large-cap stocks — it swings dramatically with commodity prices, EV adoption rates, and export demand. SIP into volatile stocks amplifies rupee cost averaging benefits — you buy significantly more units during price crashes.",
        verdict: "Tata Motors SIP suits investors with high risk tolerance who believe in India's EV transition story. The stock's volatility makes consistent SIP particularly powerful — dips become opportunities rather than threats."
      },
      "Buy and Hold": {
        factual: "Tata Motors post-demerger focused on domestic commercial and passenger vehicles including the EV range (Nexon, Punch, Curvv). Performance was driven by EV market share gains, commercial vehicle industry cycles, and export market conditions.",
        behavioral: "Tata Motors Buy and Hold requires the strongest conviction of any stock in this list — the company operates across multiple cyclical businesses. The investor who held through volatility was betting on the EV transition story and domestic vehicle cycle recovery simultaneously.",
        verdict: "Tata Motors Buy and Hold is a high-conviction, high-volatility position. Suitable for investors who understand the auto sector and EV transition dynamics. Not recommended as a large portfolio concentration."
      }
    },
    "3 Years": {
      "SIP (Monthly Investment)": {
        factual: "Tata Motors 2023-26 was one of India's most dramatic large-cap stories — the stock went through significant volatility as Jaguar Land Rover's luxury EV strategy competed globally while domestic Indian EVs gained market share. The demerger of the commercial vehicle business added another complexity layer.",
        behavioral: "SIP into Tata Motors over 3 years delivered the ultimate test of rupee cost averaging — the stock's dramatic swings meant some months bought units at significant discounts. The investor who stayed invested through the corporate restructuring volatility benefited from averaging down during uncertainty.",
        verdict: "3-year Tata Motors SIP is a case study in how consistent investing through corporate uncertainty can generate returns that market-timers missed by sitting on the sidelines."
      },
      "Buy and Hold": {
        factual: "Buying Tata Motors in 2023 and holding through 2026 meant experiencing the JLR demerger announcement, domestic EV market share gains, competition from new EV entrants, and the commercial vehicle cycle. The 3-year period captured India's EV transition in its most critical early phase.",
        behavioral: "Tata Motors 3-year Buy and Hold tested every behavioral bias simultaneously — loss aversion during corrections, overconfidence during rallies, and the temptation to switch to simpler investments. The investor who held based on EV transition conviction navigated all of these.",
        verdict: "Tata Motors 3-year Buy and Hold captures India's EV transition story. High risk, potentially high reward — illustrates why understanding business narratives matters more than price charts."
      }
    }
  }
}

function getAnalysis(stock: string, period: string, strategy: string) {
  return BACKTEST_ANALYSIS[stock]?.[period]?.[strategy] || null
}

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
        // The initial investment IS the total SIP capital, not a
        // per-month amount -- don't multiply by the trade count or
        // starting_cash gets inflated by numTrades×.
        startingCash = initialInvestment
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
            benchmark_ticker: STOCK_TICKERS["Nifty 50"],
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

  const analysis = result ? getAnalysis(selectedStock, timePeriod, strategy) : null

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
                    label: "vs Nifty 50",
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

              {/* Analysis */}
              {analysis && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">What Drove These Results</h3>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700">📊 Market Context</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{analysis.factual}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-700">🧠 Behavioral Insight</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{analysis.behavioral}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700">✅ Verdict</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{analysis.verdict}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
