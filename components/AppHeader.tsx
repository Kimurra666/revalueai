import { Recycle } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-14 max-w-[68.75rem] items-center justify-between px-4 sm:px-6">
        {/* Logo — full 44 px touch target on mobile */}
        <a
          href="/"
          className="flex min-h-[44px] items-center gap-2 text-primary-dark"
          aria-label="ReValueAI home"
        >
          <Recycle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="text-md font-semibold tracking-tight">ReValueAI</span>
        </a>

        {/* Category label — shown on all widths */}
        <span className="text-sm text-muted">Phones and laptops</span>
      </div>
    </header>
  );
}
