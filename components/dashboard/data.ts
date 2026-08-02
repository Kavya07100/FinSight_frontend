export const allocationData = [
  { name: "equities", value: 52, fill: "var(--color-equities)" },
  { name: "mutualFunds", value: 24, fill: "var(--color-mutualFunds)" },
  { name: "bonds", value: 14, fill: "var(--color-bonds)" },
  { name: "cash", value: 10, fill: "var(--color-cash)" },
]

export const allocationConfig = {
  value: { label: "Allocation" },
  equities: { label: "Equities", color: "var(--chart-1)" },
  mutualFunds: { label: "Mutual Funds", color: "var(--chart-3)" },
  bonds: { label: "Bonds", color: "var(--chart-4)" },
  cash: { label: "Cash", color: "var(--chart-5)" },
}

export const performanceData = [
  { month: "Jan", value: 98000 },
  { month: "Feb", value: 101500 },
  { month: "Mar", value: 99800 },
  { month: "Apr", value: 106200 },
  { month: "May", value: 110400 },
  { month: "Jun", value: 108900 },
  { month: "Jul", value: 115300 },
  { month: "Aug", value: 119700 },
  { month: "Sep", value: 124500 },
]

export const performanceConfig = {
  value: { label: "Portfolio Value", color: "var(--chart-1)" },
}

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
