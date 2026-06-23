import Link from "next/link";

import { AutocompleteHeader } from "@/components/search/AutocompleteHeader";
import { algoliaMode } from "@/lib/algolia";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/agent", label: "Agent" },
  { href: "/analytics", label: "Analytics" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-base tracking-widest uppercase"
        >
          <span aria-hidden className="inline-block size-2 rounded-full bg-primary" />
          <span>Movie App</span>
          <span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {algoliaMode}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <AutocompleteHeader />
        </div>

        <nav className="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
