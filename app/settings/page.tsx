import { Sidebar } from "@/components/dashboard/sidebar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Kavya Bisht"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    defaultValue="21"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      defaultValue="45000"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Current Savings</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      defaultValue="120000"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Investment Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Investment Goal</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]">
                  <option>Wealth building</option>
                  <option>Retirement planning</option>
                  <option>Short-term gains</option>
                  <option>Learning basics</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Risk Tolerance</label>
                <div className="grid grid-cols-5 gap-2">
                  {["Very Conservative", "Conservative", "Balanced", "Aggressive", "Very Aggressive"].map((level, i) => (
                    <button
                      key={level}
                      className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${i === 2 ? "bg-[#3B5BDB] text-white border-[#3B5BDB]" : "bg-white text-gray-500 border-gray-200 hover:border-[#3B5BDB]"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Reset Portfolio</h2>
            <p className="text-sm text-gray-500 mb-4">This will reset all your virtual trades and restore your starting capital of ₹2,00,000. Your learning progress will not be affected.</p>
            <button className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-5 py-2 text-sm font-medium hover:bg-red-100 transition-colors">
              Reset Virtual Portfolio
            </button>
          </div>

          {/* Save Button */}
          <button className="w-full bg-[#3B5BDB] text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors">
            Save Changes
          </button>

        </div>
      </main>
    </div>
  )
}