import { Sidebar } from "@/components/dashboard/sidebar"

export default function BacktestPage() {
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
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]">
                    <option>Nifty 50</option>
                    <option>Reliance Industries</option>
                    <option>HDFC Bank</option>
                    <option>Infosys</option>
                    <option>Tata Motors</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Strategy</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]">
                    <option>SIP (Monthly Investment)</option>
                    <option>Buy and Hold</option>
                    <option>Moving Average Crossover</option>
                    <option>RSI Based</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Time Period</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]">
                    <option>1 Year</option>
                    <option>3 Years</option>
                    <option>5 Years</option>
                    <option>10 Years</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Initial Investment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      defaultValue="10000"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>

                <button className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors">
                  Run Backtest
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="col-span-2 space-y-6">

              {/* Result Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Return", value: "+68.4%", color: "text-green-600" },
                  { label: "Final Value", value: "₹16,840", color: "text-gray-900" },
                  { label: "Max Drawdown", value: "-18.2%", color: "text-red-500" },
                  { label: "Sharpe Ratio", value: "1.42", color: "text-gray-900" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Portfolio Value Over Time</h3>
                <div className="h-48 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Chart will render after running backtest</p>
                </div>
              </div>

              {/* Yearly Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Yearly Breakdown</h3>
                </div>
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
                    {[
                      { year: "2022", invested: "₹10,000", value: "₹9,200", ret: "-8.0%", pos: false },
                      { year: "2023", invested: "₹10,000", value: "₹12,400", ret: "+24.0%", pos: true },
                      { year: "2024", invested: "₹10,000", value: "₹14,100", ret: "+41.0%", pos: true },
                      { year: "2025", invested: "₹10,000", value: "₹16,840", ret: "+68.4%", pos: true },
                    ].map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                        <td className="px-5 py-4 text-right text-sm text-gray-700">{row.invested}</td>
                        <td className="px-5 py-4 text-right text-sm text-gray-700">{row.value}</td>
                        <td className={`px-5 py-4 text-right text-sm font-medium ${row.pos ? "text-green-600" : "text-red-500"}`}>
                          {row.ret}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}