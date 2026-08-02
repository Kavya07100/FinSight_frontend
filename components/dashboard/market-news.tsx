"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  url: string
  tags: string[]
  created_at: string
}

// Small fixed palette, picked deterministically per source name so the same
// outlet always gets the same badge color without us having to maintain a
// lookup table of every publication NewsAPI might return.
const SOURCE_COLORS = ["#3B5BDB", "#14B8A6", "#F0A93B", "#E0575B", "#8B5CF6"]

function colorForSource(source: string) {
  let hash = 0
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SOURCE_COLORS[Math.abs(hash) % SOURCE_COLORS.length]
}

export function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`)
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        setNews(await res.json())
      } catch {
        setError("Couldn't load market news right now.")
      } finally {
        setIsLoading(false)
      }
    }
    loadNews()
  }, [])

  return (
    <section aria-labelledby="market-news-heading" className="flex flex-col gap-4">
      <h2
        id="market-news-heading"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        Market News
      </h2>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading news…</p>
      )}
      {!isLoading && error && (
        <p className="text-sm text-muted-foreground">{error}</p>
      )}
      {!isLoading && !error && news.length === 0 && (
        <p className="text-sm text-muted-foreground">No news yet. Check back soon.</p>
      )}

      {!isLoading && !error && news.length > 0 && (
        <div
          className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3"
          role="list"
        >
          {news.map((item) => (
            <article
              key={item.id}
              role="listitem"
              className="flex w-[calc((100%-2rem)/3)] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <span
                className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                style={{ backgroundColor: colorForSource(item.source) }}
              >
                {item.source}
              </span>
              <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read more
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
