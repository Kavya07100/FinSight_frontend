"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PieChart,
  MessageSquare,
  Activity,
  Trophy,
  History,
  GraduationCap,
  Settings,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Portfolio", icon: PieChart, href: "/portfolio" },
  { label: "Chat", icon: MessageSquare, href: "/chat" },
  { label: "Simulate", icon: Activity, href: "/simulate", subtitle: "Strategy backtesting" },
  { label: "Challenge", icon: Trophy, href: "/challenge", subtitle: "Blind scenario trading" },
  { label: "Backtest", icon: History, href: "/backtest" },
  { label: "Learning Path", icon: GraduationCap, href: "/learning" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <TrendingUp className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          FinSight
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, href, subtitle }) => {
          const isActive = pathname === href
          return (
            <Link
              key={label}
              href={href}
              title={subtitle}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span>{label}</span>
                {subtitle && (
                  <span className="text-xs font-normal text-muted-foreground/70">{subtitle}</span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center border-t border-sidebar-border px-4 py-4">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            KV
          </AvatarFallback>
        </Avatar>
      </div>
    </aside>
  )
}