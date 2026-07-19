import { Sidebar } from "@/components/dashboard/sidebar"

export default function LearningPage() {
  return (
    <div className="flex min-h-screen bg-[#FAF7F0]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
              <p className="text-gray-500 mt-1">Your personalised financial education journey</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-3">
              <div className="bg-[#3B5BDB] text-white rounded-xl px-3 py-1 text-sm font-bold">Level 7</div>
              <div>
                <p className="text-xs text-gray-500">Total XP</p>
                <p className="text-lg font-bold text-gray-900">2,450 XP</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Progress to Level 8</p>
              <p className="text-sm text-gray-500">2,450 / 3,000 XP</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-[#3B5BDB] h-3 rounded-full" style={{ width: "82%" }}></div>
            </div>
          </div>

          {/* Learning Modules */}
          <div className="space-y-6">

            {/* Module 1 - Completed */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Module 1: Investing Basics</h3>
                    <p className="text-xs text-gray-500">4/4 lessons completed</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">Completed</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-gray-100">
                {["What is investing?", "Stocks vs Bonds", "Risk & Return", "Time Value of Money"].map((lesson) => (
                  <div key={lesson} className="p-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-xs text-gray-600">{lesson}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Module 2 - In Progress */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-[#3B5BDB]">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-[#3B5BDB] rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Module 2: Mutual Funds & ETFs</h3>
                    <p className="text-xs text-gray-500">2/4 lessons completed</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-[#3B5BDB] text-xs px-3 py-1 rounded-full font-medium">In Progress</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-gray-100">
                {[
                  { name: "What is a Mutual Fund?", done: true },
                  { name: "Types of Funds", done: true },
                  { name: "How to Pick a Fund", done: false },
                  { name: "SIP Strategy", done: false },
                ].map((lesson) => (
                  <div key={lesson.name} className={`p-4 flex items-center gap-2 ${!lesson.done ? "opacity-60" : ""}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${lesson.done ? "bg-green-500" : "bg-gray-200"}`}>
                      <span className={`text-xs ${lesson.done ? "text-white" : "text-gray-400"}`}>{lesson.done ? "✓" : "○"}</span>
                    </div>
                    <p className="text-xs text-gray-600">{lesson.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Module 3 - Locked */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden opacity-60">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">🔒</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Module 3: Stock Analysis</h3>
                    <p className="text-xs text-gray-500">Complete Module 2 to unlock</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">Locked</span>
              </div>
            </div>

            {/* Module 4 - Locked */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden opacity-60">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">🔒</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Module 4: Behavioural Finance</h3>
                    <p className="text-xs text-gray-500">Complete Module 3 to unlock</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">Locked</span>
              </div>
            </div>

            {/* Module 5 - Locked */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden opacity-60">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">🔒</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Module 5: Portfolio Strategy</h3>
                    <p className="text-xs text-gray-500">Complete Module 4 to unlock</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">Locked</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}