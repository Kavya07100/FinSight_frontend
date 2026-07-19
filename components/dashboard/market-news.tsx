import { ArrowRight } from "lucide-react"
import { marketNews } from "@/components/dashboard/data"

export function MarketNews() {
  return (
    <section aria-labelledby="market-news-heading" className="flex flex-col gap-4">
      <h2
        id="market-news-heading"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        Market News
      </h2>

      <div
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3"
        role="list"
      >
        {marketNews.map((item, index) => (
          <article
            key={index}
            role="listitem"
            className="flex w-[calc((100%-2rem)/3)] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <span
              className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              style={{ backgroundColor: item.sourceColor }}
            >
              {item.source}
            </span>
            <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground">
              {item.headline}
            </h3>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {item.summary}
            </p>
            <a
              href="#"
              className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Read more
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
