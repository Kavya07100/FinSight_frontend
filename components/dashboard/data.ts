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

export const marketNews = [
  {
    source: "Economic Times",
    sourceColor: "#3B5BDB",
    headline: "Sensex climbs 480 points as IT stocks rebound",
    summary: "Tech majors led the rally after upbeat global cues lifted sentiment.",
  },
  {
    source: "Mint",
    sourceColor: "#14B8A6",
    headline: "RBI holds repo rate steady at 6.5% for the eighth time",
    summary: "The central bank kept its stance unchanged, citing easing inflation.",
  },
  {
    source: "MoneyControl",
    sourceColor: "#F0A93B",
    headline: "Gold prices hit fresh record on festive demand",
    summary: "Spot gold rose 1.2% as buyers stocked up ahead of the wedding season.",
  },
  {
    source: "Business Standard",
    sourceColor: "#9333EA",
    headline: "Rupee strengthens to 82.9 against the US dollar",
    summary: "Strong FII inflows and softer crude prices supported the currency.",
  },
  {
    source: "Economic Times",
    sourceColor: "#3B5BDB",
    headline: "Mutual fund SIP inflows cross ₹17,000 crore in a month",
    summary: "Retail investors continue to favour systematic equity investing.",
  },
  {
    source: "Mint",
    sourceColor: "#14B8A6",
    headline: "Nifty IT index jumps 3% on strong earnings guidance",
    summary: "Brokerages turned bullish after better-than-expected Q2 results.",
  },
  {
    source: "MoneyControl",
    sourceColor: "#F0A93B",
    headline: "Crude oil slips below $78 a barrel on demand worries",
    summary: "Prices eased as global growth concerns weighed on the outlook.",
  },
  {
    source: "Business Standard",
    sourceColor: "#9333EA",
    headline: "Bond yields cool off as inflation data surprises positively",
    summary: "The 10-year benchmark yield dipped to a three-month low.",
  },
  {
    source: "Economic Times",
    sourceColor: "#3B5BDB",
    headline: "Startups raise $1.2 billion in funding this quarter",
    summary: "Fintech and SaaS ventures attracted the bulk of investor interest.",
  },
  {
    source: "Mint",
    sourceColor: "#14B8A6",
    headline: "FMCG stocks gain on rural demand recovery hopes",
    summary: "Analysts expect a stronger second half driven by better monsoons.",
  },
]

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
