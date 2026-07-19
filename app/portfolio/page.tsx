import { Sidebar } from "@/components/dashboard/sidebar"

export default function PortfolioPage() {
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

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹1,24,500</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Today's P&L</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+₹2,840</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Overall Return</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+14.2%</p>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Holdings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Name</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Type</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Qty</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Buy Price</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Current Price</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Value</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "Reliance Industries", type: "Equity", qty: 10, buy: 2450, current: 2820, value: 28200, pl: 3700, plp: "+15.1%" },
                    { name: "HDFC Bank", type: "Equity", qty: 15, buy: 1580, current: 1624, value: 24360, pl: 660, plp: "+2.8%" },
                    { name: "Nifty 50 ETF", type: "ETF", qty: 20, buy: 220, current: 248, value: 4960, pl: 560, plp: "+12.7%" },
                    { name: "SBI Bluechip Fund", type: "Mutual Fund", qty: 100, buy: 520, current: 498, value: 49800, pl: -2200, plp: "-4.2%" },
                    { name: "Infosys", type: "Equity", qty: 8, buy: 1820, current: 2120, value: 16960, pl: 2400, plp: "+16.5%" },
                  ].map((stock) => (
                    <tr key={stock.name} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900 text-sm">{stock.name}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{stock.type}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-700">{stock.qty}</td>
                      <td className="px-5 py-4 text-right text-sm text-gray-700">₹{stock.buy}</td>
                      <td className="px-5 py-4 text-right text-sm text-gray-700">₹{stock.current}</td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">₹{stock.value.toLocaleString()}</td>
                      <td className={`px-5 py-4 text-right text-sm font-medium ${stock.pl >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {stock.plp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { type: "BUY", name: "Reliance Industries", qty: 5, price: 2780, date: "05 Jul 2026" },
                { type: "BUY", name: "Nifty 50 ETF", qty: 10, price: 241, date: "03 Jul 2026" },
                { type: "SELL", name: "SBI Bluechip Fund", qty: 20, price: 510, date: "01 Jul 2026" },
                { type: "BUY", name: "Infosys", qty: 3, price: 2050, date: "28 Jun 2026" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${tx.type === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {tx.type}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.qty} units at ₹{tx.price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}