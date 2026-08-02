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
  { label: "Simulate", icon: Activity, href: "/simulate" },
  { label: "Challenge", icon: Trophy, href: "/challenge" },
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
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            KV
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">Kavya Bisht</p>
          <p className="truncate text-xs text-muted-foreground">Balanced Investor</p>
        </div>
      </div>
    </aside>
  )
}