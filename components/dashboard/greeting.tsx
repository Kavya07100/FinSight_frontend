export function Greeting() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        Good morning, Kavya
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{today}</p>
    </header>
  )
}
