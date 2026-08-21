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
