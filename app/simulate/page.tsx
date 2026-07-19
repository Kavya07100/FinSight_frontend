import { Sidebar } from "@/components/dashboard/sidebar"

export default function SimulatePage() {
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
              <p className="text-3xl font-bold mt-1">₹75,500</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Invested</p>
              <p className="text-2xl font-bold mt-1">₹1,24,500</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">

            {/* Trade Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Place a Trade</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Search Stock / Fund</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance, HDFC, Nifty 50..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Order Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="border-2 border-[#3B5BDB] bg-blue-50 text-[#3B5BDB] rounded-xl py-2 text-sm font-medium">
                      BUY
                    </button>
                    <button className="border border-gray-200 text-gray-500 rounded-xl py-2 text-sm font-medium hover:border-red-400 hover:text-red-500">
                      SELL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    placeholder="Number of units"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#FAF7F0]"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Current Price</span>
                    <span className="font-medium text-gray-900">₹2,820</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Estimated Total</span>
                    <span className="font-medium text-gray-900">₹28,200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">After Trade Cash</span>
                    <span className="font-medium text-green-600">₹47,300</span>
                  </div>
                </div>

                <button className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium text-sm hover:bg-blue-700 transition-colors">
                  Confirm Trade
                </button>

                <p className="text-xs text-gray-400 text-center">
                  This is a simulated trade. No real money is used.
                </p>
              </div>
            </div>

            {/* Market Watch */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Market Watch</h2>
              <div className="space-y-3">
                {[
                  { name: "Reliance Industries", symbol: "RELIANCE", price: 2820, change: "+1.2%" },
                  { name: "HDFC Bank", symbol: "HDFCBANK", price: 1624, change: "+0.8%" },
                  { name: "Infosys", symbol: "INFY", price: 2120, change: "-0.4%" },
                  { name: "Tata Motors", symbol: "TATAMOTORS", price: 945, change: "+2.1%" },
                  { name: "Nifty 50 ETF", symbol: "NIFTYBEES", price: 248, change: "+0.6%" },
                  { name: "SBI Bluechip Fund", symbol: "SBIBLUECHIP", price: 498, change: "-0.9%" },
                  { name: "Wipro", symbol: "WIPRO", price: 542, change: "+1.5%" },
                  { name: "Bajaj Finance", symbol: "BAJFINANCE", price: 7240, change: "+0.3%" },
                ].map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-400">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{stock.price.toLocaleString()}</p>
                      <p className={`text-xs font-medium ${stock.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                        {stock.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}