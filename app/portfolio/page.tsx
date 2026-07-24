"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

interface Holding {
  id: string
  ticker: string
  company_name: string | null
  quantity: number
  avg_buy_price: number
  current_price: number
  current_value: number
  pnl_pct: number
}

interface Portfolio {
  holdings: Holding[]
  total_value: number
  total_invested: number
  overall_return_pct: number
  today_pnl: number
}

interface Transaction {
  id: string
  ticker: string
  company_name: string | null
  action: "buy" | "sell"
  quantity: number
  price: number
  total_value: number
  trade_date: string
  created_at: string
}

const formatCurrency = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`

const formatSignedCurrency = (value: number) =>
  `${value >= 0 ? "+" : "-"}₹${Math.round(Math.abs(value)).toLocaleString("en-IN")}`

const formatSignedPct = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("finsight_user_id")
    if (!userId) {
      setError("Please complete onboarding before viewing your portfolio.")
      setIsLoading(false)
      return
    }
    loadPortfolio(userId)
  }, [])

  const loadPortfolio = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const [portfolioRes, transactionsRes] = await Promise.all([
        fetch(`${apiUrl}/users/${userId}/portfolio`),
        fetch(`${apiUrl}/users/${userId}/transactions`),
      ])

      if (!portfolioRes.ok) {
        throw new Error(`Request failed with status ${portfolioRes.status}`)
      }
      if (!transactionsRes.ok) {
        throw new Error(`Request failed with status ${transactionsRes.status}`)
      }

      setPortfolio(await portfolioRes.json())
      setTransactions(await transactionsRes.json())
    } catch {
      setError("Something went wrong while loading your portfolio. Please try again.")
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
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-500 mt-1">Your virtual investment holdings</p>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500 mb-4">Loading your portfolio...</p>
          )}
          {error && (
            <p className="text-sm font-medium text-red-500 mb-4">{error}</p>
          )}

          {!isLoading && !error && portfolio && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(portfolio.total_value)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Today&apos;s P&amp;L</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      portfolio.today_pnl >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatSignedCurrency(portfolio.today_pnl)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Overall Return</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      portfolio.overall_return_pct >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatSignedPct(portfolio.overall_return_pct)}
                  </p>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Holdings</h2>
                </div>

                {portfolio.holdings.length === 0 ? (
                  <p className="p-8 text-center text-sm text-gray-500">
                    No holdings yet — go to Simulate to make your first trade!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Name</th>
                          <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Ticker</th>
                          <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Qty</th>
                          <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Buy Price</th>
                          <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Current Price</th>
                          <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Value</th>
                          <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">P&amp;L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {portfolio.holdings.map((holding) => (
                          <tr key={holding.id} className="hover:bg-gray-50">
                            <td className="px-5 py-4 font-medium text-gray-900 text-sm">
                              {holding.company_name ?? holding.ticker}
                            </td>
                            <td className="px-5 py-4 text-sm">
                              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {holding.ticker}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-sm text-gray-700">{holding.quantity}</td>
                            <td className="px-5 py-4 text-right text-sm text-gray-700">
                              {formatCurrency(holding.avg_buy_price)}
                            </td>
                            <td className="px-5 py-4 text-right text-sm text-gray-700">
                              {formatCurrency(holding.current_price)}
                            </td>
                            <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                              {formatCurrency(holding.current_value)}
                            </td>
                            <td
                              className={`px-5 py-4 text-right text-sm font-medium ${
                                holding.pnl_pct >= 0 ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {formatSignedPct(holding.pnl_pct)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                {transactions.length === 0 ? (
                  <p className="p-8 text-center text-sm text-gray-500">No transactions yet.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              tx.action === "buy"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.action.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.company_name ?? tx.ticker}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tx.quantity} units at {formatCurrency(tx.price)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
