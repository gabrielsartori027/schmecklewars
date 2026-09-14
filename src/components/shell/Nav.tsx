"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Map, Package, Radiation, Radio, Users } from "lucide-react";
import { NAV, type NavIcon } from "@/config/site";
import { cn } from "@/lib/utils";

const ICONS: Record<NavIcon, typeof Map> = { Map, Users, Radiation, Radio, Package, FlaskConical };

export function Nav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-30 border-b border-border-subtle bg-bg-base/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-2 py-1.5 no-scrollbar sm:px-4">
        {NAV.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-3 font-display text-sm font-semibold transition-colors",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-fg-secondary hover:bg-bg-surface-2 hover:text-fg-primary",
              )}
              title={item.label}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sr-only sm:hidden">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
